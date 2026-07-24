import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();

// Workspace scopes requested
const WORKSPACE_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

WORKSPACE_SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initWorkspaceAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Access Token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async () => {
  cachedAccessToken = null;
  await signOut(auth);
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Helper fetch wrapper using access token
async function callGoogleApi(url: string, options: RequestInit = {}) {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Google Workspace is not connected. Please click "Sign in with Google" to connect.');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google API Error (${response.status}): ${errorText}`);
  }
  return response.json();
}

// -------------------------------------------------------------
// 1. GMAIL API
// -------------------------------------------------------------
export async function sendGmailEmail({ to, subject, body }: { to: string; subject: string; body: string }) {
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body
  ];

  const emailText = emailLines.join('\r\n');
  const encodedEmail = btoa(unescape(encodeURIComponent(emailText)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return callGoogleApi('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    body: JSON.stringify({ raw: encodedEmail })
  });
}

export async function listGmailMessages(maxResults = 10) {
  return callGoogleApi(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`);
}

export async function getGmailMessage(id: string) {
  return callGoogleApi(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`);
}

// -------------------------------------------------------------
// 2. CONTACTS (PEOPLE) API
// -------------------------------------------------------------
export async function listGoogleContacts() {
  return callGoogleApi('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=50');
}

export async function createGoogleContact({ name, email, phone }: { name: string; email?: string; phone?: string }) {
  const body: any = {
    names: [{ givenName: name }],
  };
  if (email) {
    body.emailAddresses = [{ value: email }];
  }
  if (phone) {
    body.phoneNumbers = [{ value: phone }];
  }

  return callGoogleApi('https://people.googleapis.com/v1/people:createContact', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

// -------------------------------------------------------------
// 3. GOOGLE SHEETS API
// -------------------------------------------------------------
export async function createGoogleSpreadsheet(title: string) {
  return callGoogleApi('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    body: JSON.stringify({
      properties: { title }
    })
  });
}

export async function appendToGoogleSheet(spreadsheetId: string, range: string, values: any[][]) {
  return callGoogleApi(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    body: JSON.stringify({ values })
  });
}

// -------------------------------------------------------------
// 4. GOOGLE DRIVE API
// -------------------------------------------------------------
export async function listGoogleDriveFiles(pageSize = 20) {
  return callGoogleApi(`https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=files(id,name,mimeType,webViewLink,createdTime)`);
}

export async function uploadToGoogleDrive(fileName: string, mimeType: string, content: string) {
  const metadata = { name: fileName, mimeType };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const token = getAccessToken();
  if (!token) throw new Error('Not connected to Google Workspace');

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });

  if (!res.ok) {
    throw new Error(`Drive Upload Error: ${await res.text()}`);
  }
  return res.json();
}

// -------------------------------------------------------------
// 5. GOOGLE CALENDAR & GOOGLE MEET API
// -------------------------------------------------------------
export async function listGoogleCalendarEvents() {
  return callGoogleApi('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + new Date().toISOString() + '&maxResults=20&orderBy=startTime&singleEvents=true');
}

export async function createGoogleCalendarEvent({
  summary,
  description,
  startIso,
  endIso,
  createMeet = true,
  attendees = []
}: {
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
  createMeet?: boolean;
  attendees?: string[];
}) {
  const eventBody: any = {
    summary,
    description,
    start: { dateTime: startIso, timeZone: 'Africa/Dar_es_Salaam' },
    end: { dateTime: endIso, timeZone: 'Africa/Dar_es_Salaam' },
    attendees: attendees.map(email => ({ email }))
  };

  if (createMeet) {
    eventBody.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    };
  }

  const endpoint = `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`;
  return callGoogleApi(endpoint, {
    method: 'POST',
    body: JSON.stringify(eventBody)
  });
}
