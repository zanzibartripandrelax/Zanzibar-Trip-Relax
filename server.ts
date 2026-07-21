import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Server paths
const DATA_DIR = path.join(process.cwd(), 'src/data');
const SETTINGS_FILE = path.join(DATA_DIR, 'notification_settings.json');
const LOGS_FILE = path.join(DATA_DIR, 'notification_logs.json');

// Ensure parent directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
