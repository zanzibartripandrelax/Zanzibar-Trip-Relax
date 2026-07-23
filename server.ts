import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Server paths
const DATA_DIR = path.join(process.cwd(), 'src/data');
const SETTINGS_FILE = path.join(DATA_DIR, 'notification_settings.json');
const LOGS_FILE = path.join(DATA_DIR, 'notification_logs.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const MEDIA_FILE = path.join(DATA_DIR, 'media.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure parent directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve static uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// HELPER: Server Base64 Sanitizer
function stripBase64OnServer(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    if (data.startsWith('data:')) {
      if (data.includes('image/')) {
        return 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=compress&cs=tinysrgb&w=150';
      }
      return '/uploads/documents/document.pdf';
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(stripBase64OnServer);
  }
  if (typeof data === 'object') {
    const res: Record<string, any> = {};
    for (const k of Object.keys(data)) {
      if (k === 'passwordHash' || k === 'password') {
        res[k] = data[k];
      } else {
        res[k] = stripBase64OnServer(data[k]);
      }
    }
    return res;
  }
  return data;
}

// HELPER: Load and Save Users Data
function getUsersData() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    } catch (e) {
      console.error('[AuthServer] Failed to parse users file:', e);
    }
  }
  return { system_initialized: false, users: [] };
}

function saveUsersData(data: { system_initialized: boolean; users: any[] }) {
  data.users = stripBase64OnServer(data.users);
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper generic JSON loaders
function getJsonFile(filePath: string, defaultVal: any = []) {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error(`[DbServer] Failed to parse ${filePath}:`, e);
    }
  }
  return defaultVal;
}

function saveJsonFile(filePath: string, data: any) {
  const cleanData = stripBase64OnServer(data);
  fs.writeFileSync(filePath, JSON.stringify(cleanData, null, 2), 'utf-8');
}

// ==========================================
// FILE UPLOAD ENDPOINT (/api/upload)
// ==========================================
app.post('/api/upload', (req, res) => {
  try {
    const { fileName, fileData, folder = 'general' } = req.body;
    if (!fileData) {
      return res.status(400).json({ success: false, error: 'No file data provided.' });
    }

    let buffer: Buffer;
    let extension = 'png';
    let mimeType = 'image/png';

    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const matches = fileData.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
        if (mimeType.includes('pdf')) extension = 'pdf';
        else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
        else if (mimeType.includes('png')) extension = 'png';
        else if (mimeType.includes('webp')) extension = 'webp';
        else if (mimeType.includes('svg')) extension = 'svg';
        else if (mimeType.includes('word') || mimeType.includes('docx')) extension = 'docx';
      } else {
        buffer = Buffer.from(fileData, 'base64');
      }
    } else {
      buffer = Buffer.from(String(fileData), 'base64');
    }

    const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const targetFolder = path.join(UPLOADS_DIR, cleanFolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const cleanName = (fileName || `file_${Date.now()}`).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const safeFilename = `${Date.now()}_${Math.floor(Math.random() * 10000)}_${cleanName.endsWith('.' + extension) ? cleanName : cleanName + '.' + extension}`;
    const filePath = path.join(targetFolder, safeFilename);
    
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${cleanFolder}/${safeFilename}`;
    const sizeKB = (buffer.length / 1024).toFixed(1) + ' KB';

    console.log(`[UploadServer] Saved file "${safeFilename}" (${sizeKB}) at ${relativeUrl}`);

    res.json({
      success: true,
      url: relativeUrl,
      fileName: safeFilename,
      size: sizeKB,
      mimeType
    });
  } catch (err: any) {
    console.error('[UploadServer] Upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'File upload failed.' });
  }
});

// ==========================================
// PERSISTENT DATABASE ENDPOINTS
// ==========================================

// Bookings Endpoint
app.get('/api/bookings', (req, res) => {
  const bookings = getJsonFile(BOOKINGS_FILE, []);
  res.json({ success: true, bookings });
});

app.post('/api/bookings', (req, res) => {
  const { bookings } = req.body;
  if (!Array.isArray(bookings)) {
    return res.status(400).json({ success: false, error: 'Array of bookings expected.' });
  }
  saveJsonFile(BOOKINGS_FILE, bookings);
  res.json({ success: true, count: bookings.length });
});

// Customers Endpoint
app.get('/api/customers', (req, res) => {
  const customers = getJsonFile(CUSTOMERS_FILE, []);
  res.json({ success: true, customers });
});

app.post('/api/customers', (req, res) => {
  const { customers } = req.body;
  if (!Array.isArray(customers)) {
    return res.status(400).json({ success: false, error: 'Array of customers expected.' });
  }
  saveJsonFile(CUSTOMERS_FILE, customers);
  res.json({ success: true, count: customers.length });
});

// Documents Endpoint
app.get('/api/documents', (req, res) => {
  const documents = getJsonFile(DOCUMENTS_FILE, []);
  res.json({ success: true, documents });
});

app.post('/api/documents', (req, res) => {
  const { documents } = req.body;
  if (!Array.isArray(documents)) {
    return res.status(400).json({ success: false, error: 'Array of documents expected.' });
  }
  saveJsonFile(DOCUMENTS_FILE, documents);
  res.json({ success: true, count: documents.length });
});

// Reports Endpoint
app.get('/api/reports', (req, res) => {
  const reports = getJsonFile(REPORTS_FILE, []);
  res.json({ success: true, reports });
});

app.post('/api/reports', (req, res) => {
  const { reports } = req.body;
  if (!Array.isArray(reports)) {
    return res.status(400).json({ success: false, error: 'Array of reports expected.' });
  }
  saveJsonFile(REPORTS_FILE, reports);
  res.json({ success: true, count: reports.length });
});

// Media Library Endpoint
app.get('/api/media', (req, res) => {
  const media = getJsonFile(MEDIA_FILE, []);
  res.json({ success: true, media });
});

app.post('/api/media', (req, res) => {
  const { media } = req.body;
  if (!Array.isArray(media)) {
    return res.status(400).json({ success: false, error: 'Array of media items expected.' });
  }
  saveJsonFile(MEDIA_FILE, media);
  res.json({ success: true, count: media.length });
});

// ==========================================
// AUTHENTICATION & ROLE MANAGEMENT ENDPOINTS
// ==========================================

// Check first-time system initialization status
app.get('/api/auth/init-status', (req, res) => {
  const data = getUsersData();
  const hasAdmin = data.users.some((u: any) => u.role === 'ADMIN' || u.role === 'Admin' || u.role === 'Owner');
  res.json({
    initialized: data.system_initialized || hasAdmin,
    hasAdmin
  });
});

// Setup First-Time System Administrator
app.post('/api/auth/setup-admin', (req, res) => {
  const data = getUsersData();
  const hasAdmin = data.users.some((u: any) => u.role === 'ADMIN' || u.role === 'Admin' || u.role === 'Owner');
  if (data.system_initialized && hasAdmin) {
    return res.status(400).json({ success: false, error: 'System is already initialized. First-time setup is blocked.' });
  }

  const { fullName, username, password, phone, email, recoveryQuestion, recoveryAnswer, profilePhoto } = req.body;
  if (!fullName || !username || !password || !phone) {
    return res.status(400).json({ success: false, error: 'Mandatory fields missing (FullName, Username, Password, Phone).' });
  }
  if (username.includes(' ')) {
    return res.status(400).json({ success: false, error: 'Username cannot contain spaces.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newAdmin = {
    username: username.trim().toLowerCase(),
    passwordHash: hashedPassword,
    name: fullName.trim(),
    phone: phone.trim(),
    email: (email || '').trim(),
    profile_photo: profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=compress&cs=tinysrgb&w=150',
    profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=compress&cs=tinysrgb&w=150',
    recoveryQuestion: recoveryQuestion || 'What was the name of your first pet?',
    recoveryAnswer: (recoveryAnswer || 'default').trim().toLowerCase(),
    role: 'ADMIN',
    status: 'Active',
    staff_id: 'ADMIN-1',
    first_login_required: false,
    created_at: new Date().toISOString()
  };

  data.system_initialized = true;
  data.users = [newAdmin, ...data.users.filter((u: any) => u.role !== 'ADMIN' && u.role !== 'Owner')];
  saveUsersData(data);

  res.json({
    success: true,
    message: 'System Administrator created successfully.',
    user: {
      username: newAdmin.username,
      name: newAdmin.name,
      role: 'ADMIN',
      staff_id: newAdmin.staff_id,
      email: newAdmin.email,
      phone: newAdmin.phone
    }
  });
});

// Portal User Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required.' });
  }

  const data = getUsersData();
  const searchInput = username.trim().toLowerCase();
  const user = data.users.find((u: any) => u.username.toLowerCase() === searchInput || u.email?.toLowerCase() === searchInput);

  if (!user) {
    return res.status(401).json({ success: false, error: 'Incorrect username or password' });
  }

  if (user.status === 'Inactive' || user.isLocked) {
    return res.status(403).json({ success: false, error: 'Your staff account has been locked or deactivated.' });
  }

  const matches = bcrypt.compareSync(password, user.passwordHash) || user.passwordHash === password;
  if (!matches) {
    return res.status(401).json({ success: false, error: 'Incorrect username or password' });
  }

  res.json({
    success: true,
    user: {
      username: user.username,
      name: user.name,
      role: user.role === 'Owner' || user.role === 'ADMIN' ? 'ADMIN' : user.role,
      staff_id: user.staff_id || 'STF-001',
      email: user.email,
      phone: user.phone,
      first_login_required: !!user.first_login_required
    }
  });
});

// Forgot Password - Step 1: Retrieve Question
app.post('/api/auth/forgot-password/question', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, error: 'Username is required.' });

  const data = getUsersData();
  const searchInput = username.trim().toLowerCase();
  const user = data.users.find((u: any) => u.username.toLowerCase() === searchInput);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User account not found.' });
  }

  res.json({
    success: true,
    username: user.username,
    recoveryQuestion: user.recoveryQuestion || 'What was the name of your first pet?'
  });
});

// Forgot Password - Step 2: Verify Answer & Reset
app.post('/api/auth/forgot-password/verify', (req, res) => {
  const { username, recoveryAnswer, newPassword } = req.body;
  if (!username || !recoveryAnswer || !newPassword) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
  }

  const data = getUsersData();
  const searchInput = username.trim().toLowerCase();
  const userIndex = data.users.findIndex((u: any) => u.username.toLowerCase() === searchInput);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: 'User account not found.' });
  }

  const user = data.users[userIndex];
  const storedAnswer = (user.recoveryAnswer || '').trim().toLowerCase();
  const inputAnswer = recoveryAnswer.trim().toLowerCase();

  if (storedAnswer !== inputAnswer) {
    return res.status(401).json({ success: false, error: 'Incorrect recovery answer.' });
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  user.first_login_required = false;
  data.users[userIndex] = user;
  saveUsersData(data);

  res.json({ success: true, message: 'Password reset successful. You may now log in.' });
});

// Staff Management - List Staff
app.get('/api/auth/staff', (req, res) => {
  const data = getUsersData();
  const staffList = data.users.map((u: any) => ({
    username: u.username,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status || 'Active',
    staff_id: u.staff_id,
    office: u.office || 'Zanzibar HQ',
    first_login_required: !!u.first_login_required,
    created_at: u.created_at
  }));
  res.json({ success: true, staff: staffList });
});

// Staff Management - Create Staff Account
app.post('/api/auth/staff', (req, res) => {
  const { fullName, username, temporaryPassword, phone, email, role, department } = req.body;
  if (!fullName || !username || !temporaryPassword || !role) {
    return res.status(400).json({ success: false, error: 'Missing required staff fields.' });
  }

  const data = getUsersData();
  const exists = data.users.some((u: any) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, error: 'Username already exists.' });
  }

  const hashedPassword = bcrypt.hashSync(temporaryPassword, 10);
  const newStaff = {
    username: username.trim().toLowerCase(),
    passwordHash: hashedPassword,
    name: fullName.trim(),
    phone: (phone || '').trim(),
    email: (email || '').trim(),
    role,
    status: 'Active',
    office: department || 'Operations',
    staff_id: `STF-${Math.floor(100 + Math.random() * 900)}`,
    first_login_required: true,
    recoveryQuestion: 'What was the name of your first pet?',
    recoveryAnswer: 'default',
    created_at: new Date().toISOString()
  };

  data.users.push(newStaff);
  saveUsersData(data);

  res.json({ success: true, message: 'Staff member account created.', staff: newStaff });
});

// Password Change / First Login Force Reset
app.post('/api/auth/change-password', (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ success: false, error: 'Username and new password required.' });
  }

  const data = getUsersData();
  const userIndex = data.users.findIndex((u: any) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const user = data.users[userIndex];
  if (currentPassword && !user.first_login_required) {
    const valid = bcrypt.compareSync(currentPassword, user.passwordHash) || user.passwordHash === currentPassword;
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  user.first_login_required = false;
  data.users[userIndex] = user;
  saveUsersData(data);

  res.json({ success: true, message: 'Password changed successfully.' });
});

// Emergency System Reset (Admin Password Required)
app.post('/api/auth/emergency-reset', (req, res) => {
  const { adminUsername, adminPassword } = req.body;
  if (!adminUsername || !adminPassword) {
    return res.status(400).json({ success: false, error: 'Admin username and password required.' });
  }

  const data = getUsersData();
  const admin = data.users.find((u: any) => (u.username.toLowerCase() === adminUsername.trim().toLowerCase()) && (u.role === 'ADMIN' || u.role === 'Admin' || u.role === 'Owner'));

  if (!admin) {
    return res.status(403).json({ success: false, error: 'Admin account credentials required for emergency reset.' });
  }

  const valid = bcrypt.compareSync(adminPassword, admin.passwordHash) || admin.passwordHash === adminPassword;
  if (!valid) {
    return res.status(401).json({ success: false, error: 'Invalid admin password.' });
  }

  saveUsersData({ system_initialized: false, users: [] });
  res.json({ success: true, message: 'Emergency reset executed. System wiped and reset to first-time setup.' });
});

// HELPER: Load settings
function getSettings() {
  let fileSettings: any = {};
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      fileSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    } catch (e) {
      console.error('[NotificationServer] Failed to parse settings file:', e);
    }
  }

  // Merge: File settings (UI-saved) override Env vars, which override defaults.
  return {
    emailProvider: fileSettings.emailProvider || process.env.SMTP_PROVIDER || 'custom',
    smtpHost: fileSettings.smtpHost || process.env.SMTP_HOST || 'smtp.zanzibartripandrelax.com',
    smtpPort: Number(fileSettings.smtpPort || process.env.SMTP_PORT) || 465,
    smtpSecure: (fileSettings.smtpSecure !== undefined) 
      ? (fileSettings.smtpSecure === true || fileSettings.smtpSecure === 'true') 
      : (process.env.SMTP_SECURE === 'true'),
    smtpUser: fileSettings.smtpUser || process.env.SMTP_USER || 'reservations@zanzibartripandrelax.com',
    smtpPass: fileSettings.smtpPass || process.env.SMTP_PASS || '',
    fromEmail: fileSettings.fromEmail || process.env.SMTP_FROM_EMAIL || 'reservations@zanzibartripandrelax.com',
    fromName: fileSettings.fromName || process.env.SMTP_FROM_NAME || 'Zanzibar Trip & Relax Desk',
    smsProvider: fileSettings.smsProvider || process.env.SMS_PROVIDER || 'twilio',
    twilioAccountSid: fileSettings.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: fileSettings.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN || '',
    twilioSenderPhone: fileSettings.twilioSenderPhone || process.env.TWILIO_SENDER_PHONE || '',
    phoneCountryCode: fileSettings.phoneCountryCode || '+255'
  };
}

// HELPER: Load logs
function getLogs(): any[] {
  if (fs.existsSync(LOGS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf-8'));
    } catch (e) {
      console.error('[NotificationServer] Failed to parse logs file:', e);
    }
  }
  return [];
}

// HELPER: Write a log entry
function addLog(type: string, target: string, details: string, status: 'Success' | 'Failed', providerResponse?: any) {
  try {
    const logs = getLogs();
    const newLog = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      target,
      details,
      status,
      providerResponse: providerResponse ? (typeof providerResponse === 'string' ? providerResponse : JSON.stringify(providerResponse)) : undefined
    };
    logs.unshift(newLog);
    
    // Cap at 500 entries
    if (logs.length > 500) {
      logs.splice(500);
    }
    
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
    console.log(`[NotificationServer Log] [${status}] ${type} -> ${target}: ${details}`);
    return newLog;
  } catch (err) {
    console.error('[NotificationServer] Error writing to log file:', err);
    return null;
  }
}

// API: Get active configurations
app.get('/api/notification-settings', (req, res) => {
  try {
    const settings = getSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Save settings
app.post('/api/notification-settings', (req, res) => {
  try {
    const settings = req.body;
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    addLog('SETTINGS_UPDATE', 'System', 'Global SMTP and SMS service credentials updated.', 'Success');
    res.json({ success: true, message: 'Settings successfully written to server.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Get logs
app.get('/api/notification/logs', (req, res) => {
  try {
    res.json({ success: true, logs: getLogs() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Clear logs
app.post('/api/notification/logs/clear', (req, res) => {
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), 'utf-8');
    res.json({ success: true, message: 'Audit logs cleared.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Send Test Email
app.post('/api/notification/test-email', async (req, res) => {
  const { config, testRecipient } = req.body;
  if (!testRecipient) {
    return res.status(400).json({ success: false, error: 'Recipient email is required.' });
  }

  addLog('EMAIL_TEST_REQUEST', testRecipient, `Initiating connection handshake for custom SMTP server ${config.smtpHost}:${config.smtpPort}`, 'Success');

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort) || 587,
      secure: config.smtpSecure === true,
      auth: (config.smtpUser && config.smtpPass) ? {
        user: config.smtpUser,
        pass: config.smtpPass
      } : undefined,
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"${config.fromName || 'Zanzibar Trip & Relax'}" <${config.fromEmail}>`,
      to: testRecipient,
      subject: '🔒 SMTP Connection Verification Test - Zanzibar Trip & Relax',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #0b3b8c; border-bottom: 2px solid #D4A017; padding-bottom: 10px;">SMTP Connection Succeeded</h2>
          <p>Jambo! This is a system-verified diagnostic transmission.</p>
          <div style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; margin: 20px 0;">
            <strong>Host Address:</strong> ${config.smtpHost}<br/>
            <strong>Connection Port:</strong> ${config.smtpPort} (SSL: ${config.smtpSecure ? 'Active' : 'Disabled'})<br/>
            <strong>Authorized Username:</strong> ${config.smtpUser}
          </div>
          <p style="color: #64748b; font-size: 11px;">Verification timestamp: ${new Date().toLocaleString()}</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    addLog('EMAIL_TEST_SUCCESS', testRecipient, `SMTP transmission successfully authenticated. Message ID: ${info.messageId}`, 'Success', info);
    res.json({ success: true, message: `Test email successfully dispatched to ${testRecipient}! Message ID: ${info.messageId}` });
  } catch (err: any) {
    addLog('EMAIL_TEST_FAILURE', testRecipient, `SMTP Handshake failed: ${err.message}`, 'Failed', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Send Test SMS
app.post('/api/notification/test-sms', async (req, res) => {
  const { config, testRecipient } = req.body;
  if (!testRecipient) {
    return res.status(400).json({ success: false, error: 'Recipient phone number is required.' });
  }

  addLog('SMS_TEST_REQUEST', testRecipient, 'Initiating Twilio client handshake and dispatch request.', 'Success');

  try {
    let formattedTo = testRecipient.trim();
    if (!formattedTo.startsWith('+')) {
      const cc = config.phoneCountryCode || '+255';
      if (formattedTo.startsWith('0')) {
        formattedTo = formattedTo.substring(1);
      }
      formattedTo = cc + formattedTo;
    }

    const client = (twilio as any)(config.twilioAccountSid, config.twilioAuthToken);
    const response = await client.messages.create({
      body: '🌴 Zanzibar Trip & Relax: SMS Channel Handshake Test is SUCCESSFUL!',
      from: config.twilioSenderPhone,
      to: formattedTo
    });

    addLog('SMS_TEST_SUCCESS', formattedTo, `SMS accepted by Twilio network. Message SID: ${response.sid}`, 'Success', response);
    res.json({ success: true, message: `Test SMS accepted by Twilio network! SID: ${response.sid}` });
  } catch (err: any) {
    addLog('SMS_TEST_FAILURE', testRecipient, `Twilio API returned error: ${err.message}`, 'Failed', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Send General Transactional Email
app.post('/api/notification/send-email', async (req, res) => {
  const { type, toEmail, toName, data } = req.body;
  const config = getSettings();

  addLog('EMAIL_TRANSACTION_REQUEST', toEmail, `Routing automated email type "${type}" to "${toName}"`, 'Success');

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort) || 587,
      secure: config.smtpSecure === true,
      auth: (config.smtpUser && config.smtpPass) ? {
        user: config.smtpUser,
        pass: config.smtpPass
      } : undefined,
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"${config.fromName || 'Zanzibar Trip & Relax'}" <${config.fromEmail}>`,
      to: toEmail,
      subject: data.subject || `Notification from Zanzibar Trip & Relax`,
      html: data.bodyHtml || `<h3>Notification</h3><p>Hello ${toName}, you have a new notification from Zanzibar Trip & Relax.</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    addLog('EMAIL_TRANSACTION_SUCCESS', toEmail, `Successfully dispatched transaction email: ${mailOptions.subject}`, 'Success', info);
    res.json({ success: true, message: 'Email sent successfully.', messageId: info.messageId });
  } catch (err: any) {
    addLog('EMAIL_TRANSACTION_FAILURE', toEmail, `Failed to deliver email: ${err.message}`, 'Failed', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Send General Transactional SMS
app.post('/api/notification/send-sms', async (req, res) => {
  const { toPhone, message } = req.body;
  const config = getSettings();

  addLog('SMS_TRANSACTION_REQUEST', toPhone, `Routing automated SMS notification.`, 'Success');

  try {
    let formattedTo = toPhone.trim();
    if (!formattedTo.startsWith('+')) {
      const cc = config.phoneCountryCode || '+255';
      if (formattedTo.startsWith('0')) {
        formattedTo = formattedTo.substring(1);
      }
      formattedTo = cc + formattedTo;
    }

    const client = (twilio as any)(config.twilioAccountSid, config.twilioAuthToken);
    const response = await client.messages.create({
      body: message,
      from: config.twilioSenderPhone,
      to: formattedTo
    });

    addLog('SMS_TRANSACTION_SUCCESS', formattedTo, `SMS dispatched successfully. SID: ${response.sid}`, 'Success', response);
    res.json({ success: true, message: 'SMS sent successfully.', sid: response.sid });
  } catch (err: any) {
    addLog('SMS_TRANSACTION_FAILURE', toPhone, `Failed to deliver SMS: ${err.message}`, 'Failed', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve standalone System Recovery Portal (Out-of-band administrative override pathway)
app.get('/system/recovery', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zanzibar Trip & Relax - Emergency Recovery Terminal</title>
  <style>
    body {
      background-color: #030a16;
      color: #cbd5e1;
      font-family: 'Courier New', Courier, monospace;
      padding: 40px 20px;
      margin: 0;
    }
    .container {
      max-width: 650px;
      margin: 0 auto;
      border: 1px solid #dc2626;
      background-color: #051020;
      padding: 30px;
      box-shadow: 0 0 20px rgba(220, 38, 38, 0.2);
      border-radius: 8px;
    }
    h1 {
      color: #ef4444;
      font-size: 20px;
      margin-top: 0;
      border-bottom: 2px dashed #dc2626;
      padding-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    label {
      display: block;
      margin-top: 15px;
      font-size: 12px;
      font-weight: bold;
      color: #94a3b8;
      text-transform: uppercase;
    }
    input {
      width: 100%;
      background-color: #0a192f;
      border: 1px solid #1e293b;
      padding: 10px;
      color: #f1f5f9;
      margin-top: 5px;
      box-sizing: border-box;
      font-family: inherit;
    }
    input:focus {
      outline: none;
      border-color: #ef4444;
    }
    button {
      background-color: #dc2626;
      color: #fff;
      border: none;
      padding: 12px 20px;
      font-family: inherit;
      font-weight: bold;
      text-transform: uppercase;
      cursor: pointer;
      margin-top: 20px;
      width: 100%;
      letter-spacing: 1px;
    }
    button:hover {
      background-color: #b91c1c;
    }
    .log-view {
      background-color: #02060d;
      border: 1px solid #1e293b;
      padding: 15px;
      height: 150px;
      overflow-y: auto;
      font-size: 11px;
      color: #10b981;
      margin-top: 20px;
      white-space: pre-wrap;
    }
    .panel {
      display: none;
      border-top: 1px dashed #475569;
      margin-top: 25px;
      padding-top: 20px;
    }
    .panel.active {
      display: block;
    }
    .alert {
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 12px;
      font-size: 12px;
      border-radius: 4px;
      margin-bottom: 15px;
      line-height: 1.5;
    }
    .success {
      background-color: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #34d399;
      padding: 12px;
      font-size: 12px;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    .override-btn {
      background-color: #d97706;
      margin-top: 10px;
    }
    .override-btn:hover {
      background-color: #b45309;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>System Recovery Portal [Master Override]</h1>
    <div class="alert">
      CRITICAL: You have accessed a secure, out-of-band administrative bypass pathway. Actions executed here are irreversible.
    </div>

    <!-- Login Form -->
    <div id="auth-form">
      <p style="font-size: 12px; line-height: 1.6;">
        To unlock local overrides, provide Owner username and cleartext password credentials.
      </p>
      <div>
        <label>Username</label>
        <input type="text" id="username" placeholder="Owner username">
      </div>
      <div>
        <label>Password</label>
        <input type="password" id="password" placeholder="Owner cleartext password">
      </div>
      <button onclick="authenticateOwner()">Unlock Terminal</button>
    </div>

    <!-- Recovery Panel -->
    <div id="control-panel" class="panel">
      <div id="status-message"></div>
      <p style="font-size: 12px; margin-bottom: 20px;">
        Owner session verified. Select an administrative recovery script:
      </p>

      <button onclick="purgeBookings()" class="override-btn">Purge Booking Ledger</button>
      <p style="font-size: 10px; color: #94a3b8; margin: 5px 0 15px 0;">Deletes all reservations and invoice logs from the local database ledger.</p>

      <button onclick="factoryReset()" style="background-color: #dc2626;">Execute Factory Reset</button>
      <p style="font-size: 10px; color: #94a3b8; margin: 5px 0 15px 0;">Wipes all content overrides, active staff identities, and cookies. Reverts Zanzibar Trip & Relax to clean installation wizard.</p>

      <button onclick="changeOwnerPassword()" class="override-btn" style="background-color: #2563eb;">Override Owner Password</button>
      <p style="font-size: 10px; color: #94a3b8; margin: 5px 0 15px 0;">Forcibly reset Owner's login password credentials to regain full access.</p>
    </div>

    <div class="log-view" id="console-logs">[READY] Recovery terminal online. Awaiting credentials...</div>
  </div>

  <script>
    const logConsole = document.getElementById('console-logs');
    function writeLog(msg) {
      const time = new Date().toLocaleTimeString();
      logConsole.textContent += '\\n[' + time + '] ' + msg;
      logConsole.scrollTop = logConsole.scrollHeight;
    }

    async function sha256(str) {
      const buf = new TextEncoder().encode(str);
      const hash = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    let authenticatedUser = null;

    async function authenticateOwner() {
      const uInput = document.getElementById('username').value.trim();
      const pInput = document.getElementById('password').value;

      if (!uInput || !pInput) {
        writeLog('ERROR: Credentials cannot be blank.');
        return;
      }

      writeLog('Checking local database for Owner username: "' + uInput + '"...');
      const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      const owner = users.find(u => u.role.toLowerCase() === 'owner');

      if (!owner) {
        writeLog('ERROR: No Owner user registered in this system. Direct factory reset is allowed without credentials.');
        document.getElementById('control-panel').classList.add('active');
        document.getElementById('auth-form').style.display = 'none';
        return;
      }

      const hashedInput = await sha256(pInput);
      if (uInput.toLowerCase() === owner.username.toLowerCase() && hashedInput === owner.passwordHash) {
        authenticatedUser = owner;
        writeLog('SUCCESS: Owner authentication verified.');
        document.getElementById('control-panel').classList.add('active');
        document.getElementById('auth-form').style.display = 'none';
      } else {
        writeLog('ERROR: Verification failed. Invalid username or password credentials.');
      }
    }

    function purgeBookings() {
      if (!confirm('Are you absolutely sure you want to purge all bookings? This cannot be undone.')) return;
      localStorage.removeItem('ztr_booking_ledger');
      writeLog('SUCCESS: Booking ledger completely cleared from database.');
      document.getElementById('status-message').innerHTML = '<div class="success">Booking ledger purged successfully!</div>';
    }

    function factoryReset() {
      if (!confirm('WARNING: This will delete ALL content, configurations, staff identities, and owner profiles. Execute system wipe?')) return;
      localStorage.clear();
      writeLog('SUCCESS: Full database factory reset completed. Reverted to initial setup wizard.');
      document.getElementById('status-message').innerHTML = '<div class="success">System completely wiped! Reloading in 3 seconds...</div>';
      setTimeout(() => {
        window.location.href = '/#create-owner';
      }, 3000);
    }

    async function changeOwnerPassword() {
      const newPass = prompt('Enter new secure password for the Owner:');
      if (!newPass) return;
      if (newPass.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
      }

      const hashed = await sha256(newPass);
      const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      const updatedUsers = users.map(u => {
        if (u.role.toLowerCase() === 'owner') {
          return { ...u, passwordHash: hashed };
        }
        return u;
      });
      localStorage.setItem('ztr_admin_users', JSON.stringify(updatedUsers));
      writeLog('SUCCESS: Owner password overridden successfully.');
      document.getElementById('status-message').innerHTML = '<div class="success">Owner password updated successfully!</div>';
    }
  </script>
</body>
</html>`);
});

// Configure Vite integration for dev or prod static routing
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NotificationServer] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
