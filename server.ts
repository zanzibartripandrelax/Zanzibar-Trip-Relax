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

// Memory-based store for verification OTPs
interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  resendAvailableAt: number;
}
const otpStore = new Map<string, OtpEntry>();

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

// PERIODIC CLEANUP: Clear expired codes from memory automatically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key);
      addLog('OTP_CLEANUP', key, 'Expired OTP token automatically cleared from server memory.', 'Success');
    }
  }
}, 30000); // Every 30 seconds

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

// API: Generate & Send OTP Code (Rate Limited)
app.post('/api/otp/send', async (req, res) => {
  const { target, type, name, context } = req.body;
  const config = getSettings();
  const now = Date.now();

  if (!target) {
    return res.status(400).json({ success: false, error: 'Recipient contact/email is mandatory.' });
  }

  // 1. Check Rate Limiting for existing target
  const existing = otpStore.get(target);
  if (existing && now < existing.resendAvailableAt) {
    const secondsLeft = Math.ceil((existing.resendAvailableAt - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Rate limit active. Please wait ${secondsLeft} seconds before requesting another code.`
    });
  }

  // 2. Generate secure numeric OTP
  const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
  const prefix = context === 'recovery' ? 'RST-' : '2FA-';
  const fullCode = prefix + rawCode;

  const expiryDuration = context === 'recovery' ? 30 * 60 * 1000 : 10 * 60 * 1000; // 30 mins for reset, 10 mins for login
  const expiresAt = now + expiryDuration;
  const resendAvailableAt = now + 45 * 1000; // 45 seconds countdown timer

  // 3. Store OTP securely on server side
  otpStore.set(target, {
    code: fullCode,
    expiresAt,
    attempts: 0,
    resendAvailableAt
  });

  addLog('OTP_GENERATED', target, `Generated ${context || 'auth'} OTP code. Expiring in ${expiryDuration / (60 * 1000)} minutes. Resend disabled for 45s.`, 'Success');

  // 4. Send OTP based on selected method
  if (type === 'email') {
    addLog('EMAIL_OTP_DISPATCH', target, `Initiating email transmission to ${target} via SMTP server ${config.smtpHost}`, 'Success');
    try {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: Number(config.smtpPort) || 587,
        secure: config.smtpSecure === true,
        auth: config.smtpUser && config.smtpPass ? {
          user: config.smtpUser,
          pass: config.smtpPass
        } : undefined,
        tls: {
          rejectUnauthorized: false
        }
      });

      const subject = context === 'recovery'
        ? `Security Recovery Code: ${fullCode} 🔑`
        : `Security Verification: ${fullCode} is your 2-Factor Code 🛡️`;

      const brandColor = '#D4A017';
      const secondaryColor = '#0B3B8C';
      const htmlBody = `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0;">
          <div style="background-color: ${secondaryColor}; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 22px;">ZANZIBAR TRIP & RELAX</h1>
            <p style="margin: 5px 0 0 0; color: ${brandColor}; font-size: 11px; letter-spacing: 2px; font-weight: bold; text-transform: uppercase;">Karibu Swahili Travel Desk</p>
          </div>
          <div style="padding: 25px; background: white; border-radius: 0 0 8px 8px;">
            <p style="font-size: 15px; font-weight: bold; color: #1e293b;">Jambo ${name || 'Valued Partner'},</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.5;">We received a security access challenge request for your Zanzibar Trip & Relax account.</p>
            <p style="font-size: 13px; color: #475569; line-height: 1.5;">Please enter the following verification code to authorize this session:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f1f5f9; border: 2px dashed ${brandColor}; display: inline-block; padding: 15px 40px; border-radius: 12px; font-family: monospace; font-size: 26px; font-weight: bold; letter-spacing: 3px; color: ${secondaryColor};">
                ${fullCode}
              </div>
            </div>
            
            <p style="font-size: 11px; color: #94a3b8; line-height: 1.4;">This security code is strictly confidential and is configured to expire in ${expiryDuration / (60 * 1000)} minutes. If you did not trigger this authorization, please secure your credentials immediately.</p>
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: `"${config.fromName || 'Zanzibar Trip & Relax'}" <${config.fromEmail}>`,
        to: target,
        subject,
        html: htmlBody
      });

      addLog('EMAIL_OTP_SUCCESS', target, `OTP code ${fullCode} successfully delivered to ${target}. ID: ${info.messageId}`, 'Success', info);
      return res.json({
        success: true,
        message: 'Verification code sent successfully.',
        resendInSeconds: 45
      });
    } catch (err: any) {
      // Clear generated OTP from store on sending failure so user can try again immediately
      otpStore.delete(target);
      addLog('EMAIL_OTP_FAILURE', target, `SMTP Transmission failed: ${err.message}`, 'Failed', err);
      return res.status(500).json({
        success: false,
        error: `SMTP Delivery Failed: ${err.message}`
      });
    }
  } else {
    // Phone / SMS OTP
    addLog('SMS_OTP_DISPATCH', target, `Initiating SMS transmission to ${target} via Twilio gateway`, 'Success');
    try {
      let formattedTo = target.trim();
      if (!formattedTo.startsWith('+')) {
        const cc = config.phoneCountryCode || '+255';
        if (formattedTo.startsWith('0')) {
          formattedTo = formattedTo.substring(1);
        }
        formattedTo = cc + formattedTo;
      }

      const client = twilio(config.twilioAccountSid, config.twilioAuthToken);
      const smsBody = `[Zanzibar Trip & Relax] Security Code: ${fullCode}. Valid for ${expiryDuration / (60 * 1000)} minutes. Do not share.`;

      const response = await client.messages.create({
        body: smsBody,
        from: config.twilioSenderPhone,
        to: formattedTo
      });

      addLog('SMS_OTP_SUCCESS', formattedTo, `OTP SMS successfully accepted by Twilio cell networks. SID: ${response.sid}`, 'Success', response);
      return res.json({
        success: true,
        message: `Verification code successfully dispatched via Twilio SMS to ${formattedTo}.`,
        resendInSeconds: 45
      });
    } catch (err: any) {
      // Clear generated OTP from store on sending failure so user can try again immediately
      otpStore.delete(target);
      addLog('SMS_OTP_FAILURE', target, `Twilio gateway rejected dispatch: ${err.message}`, 'Failed', err);
      return res.status(500).json({
        success: false,
        error: `Twilio Delivery Failed: ${err.message}`
      });
    }
  }
});

// API: Verify OTP Code
app.post('/api/otp/verify', (req, res) => {
  const { target, code } = req.body;
  if (!target || !code) {
    return res.status(400).json({ success: false, error: 'Recipient contact and verification code are required.' });
  }

  const existing = otpStore.get(target);
  const cleanCode = code.trim().toUpperCase();

  addLog('VERIFICATION_ATTEMPT', target, `Submitted code "${cleanCode}" for verification`, 'Success');

  if (!existing) {
    addLog('VERIFICATION_FAILURE', target, 'No active OTP verification token found in memory.', 'Failed');
    return res.status(404).json({ success: false, error: 'No active verification code found. Please request a new code.' });
  }

  // Check expiration
  if (Date.now() > existing.expiresAt) {
    otpStore.delete(target);
    addLog('VERIFICATION_FAILURE', target, 'OTP has expired.', 'Failed');
    return res.status(410).json({ success: false, error: 'Verification code has expired. Please request a new code.' });
  }

  // Check attempts limit (max 5)
  if (existing.attempts >= 5) {
    otpStore.delete(target);
    addLog('VERIFICATION_FAILURE', target, 'Too many failed verification attempts. Verification token destroyed.', 'Failed');
    return res.status(429).json({ success: false, error: 'Too many incorrect attempts. For security, your code has been invalidated. Please request a new one.' });
  }

  // Compare codes (Prefix optional comparison)
  const codeValue = cleanCode.startsWith('2FA-') || cleanCode.startsWith('RST-') 
    ? cleanCode 
    : cleanCode; // we can do a fallback check to match without the prefix as well!
  
  const storedValue = existing.code.toUpperCase();
  const storedValueNoPrefix = storedValue.replace('2FA-', '').replace('RST-', '');

  if (codeValue === storedValue || codeValue === storedValueNoPrefix) {
    // Success! Verify complete, remove code from store
    otpStore.delete(target);
    addLog('VERIFICATION_SUCCESS', target, `Verification code approved successfully. Code: ${cleanCode}`, 'Success');
    return res.json({ success: true, message: 'OTP verified successfully.' });
  } else {
    // Failed match
    existing.attempts += 1;
    otpStore.set(target, existing); // update attempts count
    const remaining = 5 - existing.attempts;
    addLog('VERIFICATION_FAILURE', target, `Incorrect code. Attempt ${existing.attempts}/5 failed.`, 'Failed');
    return res.status(401).json({
      success: false,
      error: `Invalid verification code. You have ${remaining} attempts remaining before the code is blacklisted.`
    });
  }
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
