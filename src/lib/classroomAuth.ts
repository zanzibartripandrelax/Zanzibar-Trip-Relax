import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const classroomAuth = getAuth(app);

const provider = new GoogleAuthProvider();

export const CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.topics.readonly'
];

CLASSROOM_SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initClassroomAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(classroomAuth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const classroomGoogleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(classroomAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from sign-in credential.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Classroom sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getClassroomAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const classroomLogout = async () => {
  await signOut(classroomAuth);
  cachedAccessToken = null;
};

// API Fetch Helpers for Google Classroom
const BASE_URL = 'https://classroom.googleapis.com/v1';

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  creationTime?: string;
  courseState?: string;
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  guardiansEnabled?: boolean;
}

export interface CourseWorkItem {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours: number; minutes: number };
  maxPoints?: number;
  workType?: string;
}

export interface AnnouncementItem {
  id: string;
  courseId: string;
  text: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
}

export interface ClassroomUser {
  userId: string;
  profile?: {
    name?: { fullName?: string };
    emailAddress?: string;
    photoUrl?: string;
  };
}

export async function fetchCourses(accessToken: string): Promise<ClassroomCourse[]> {
  const res = await fetch(`${BASE_URL}/courses?courseStates=ACTIVE`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to fetch courses (${res.status})`);
  }
  const data = await res.json();
  return data.courses || [];
}

export async function fetchCourseWork(accessToken: string, courseId: string): Promise<CourseWorkItem[]> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/courseWork`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to fetch course work (${res.status})`);
  }
  const data = await res.json();
  return data.courseWork || [];
}

export async function fetchAnnouncements(accessToken: string, courseId: string): Promise<AnnouncementItem[]> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/announcements`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to fetch announcements (${res.status})`);
  }
  const data = await res.json();
  return data.announcements || [];
}

export async function fetchStudents(accessToken: string, courseId: string): Promise<ClassroomUser[]> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/students`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to fetch students roster (${res.status})`);
  }
  const data = await res.json();
  return data.students || [];
}

export async function fetchTeachers(accessToken: string, courseId: string): Promise<ClassroomUser[]> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/teachers`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to fetch teachers roster (${res.status})`);
  }
  const data = await res.json();
  return data.teachers || [];
}

export async function createAnnouncement(
  accessToken: string,
  courseId: string,
  text: string
): Promise<AnnouncementItem> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/announcements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      state: 'PUBLISHED',
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to post announcement (${res.status})`);
  }
  return res.json();
}

export async function createCourseWork(
  accessToken: string,
  courseId: string,
  workData: { title: string; description?: string; maxPoints?: number }
): Promise<CourseWorkItem> {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/courseWork`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: workData.title,
      description: workData.description || '',
      maxPoints: workData.maxPoints || 100,
      workType: 'ASSIGNMENT',
      state: 'PUBLISHED',
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to create assignment (${res.status})`);
  }
  return res.json();
}
