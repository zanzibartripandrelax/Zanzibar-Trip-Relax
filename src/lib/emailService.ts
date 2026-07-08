// Email Configuration and Simulation Service for Zanzibar Trip & Relax

export interface SmtpConfig {
  provider: 'gmail' | 'hostinger' | 'sendgrid' | 'resend' | 'custom';
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  apiKey?: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailLog {
  id: string;
  timestamp: string;
  toEmail: string;
  subject: string;
  bodyHtml: string;
  type: 'verification' | 'welcome' | 'reset' | 'booking_confirm' | 'payment_confirm' | 'booking_cancel' | 'staff_created' | 'two_factor_auth' | 'password_reset' | 'sms_dispatch_log' | 'security_alert';
  status: 'Delivered' | 'Pending' | 'Failed';
  smtpUsed: string;
}

const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  provider: 'custom',
  host: 'smtp.zanzibartripandrelax.com',
  port: 465,
  secure: true,
  username: 'reservations@zanzibartripandrelax.com',
  fromEmail: 'reservations@zanzibartripandrelax.com',
  fromName: 'Zanzibar Trip & Relax Desk'
};

// Get current SMTP configurations
export function getSmtpConfig(): SmtpConfig {
  const stored = localStorage.getItem('ztr_smtp_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_SMTP_CONFIG;
    }
  }
  return DEFAULT_SMTP_CONFIG;
}

// Save SMTP configurations
export function saveSmtpConfig(config: SmtpConfig): void {
  localStorage.setItem('ztr_smtp_config', JSON.stringify(config));
}

// Get all sent email logs
export function getEmailLogs(): EmailLog[] {
  const stored = localStorage.getItem('ztr_email_logs');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
}

// Add an email to logs
export function addEmailLog(log: Omit<EmailLog, 'id' | 'timestamp'>): EmailLog {
  const logs = getEmailLogs();
  const newLog: EmailLog = {
    ...log,
    id: 'eml_' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString()
  };
  
  // Keep logs capped at 100 entries for safety
  const updatedLogs = [newLog, ...logs].slice(0, 100);
  localStorage.setItem('ztr_email_logs', JSON.stringify(updatedLogs));
  
  // Also dispatch a custom event so UI can re-render immediately if needed
  window.dispatchEvent(new CustomEvent('ztr_email_dispatched', { detail: newLog }));
  
  return newLog;
}

// Generate templates
export function generateEmailTemplate(
  type: EmailLog['type'],
  toName: string,
  data: Record<string, any>
): { subject: string; bodyHtml: string } {
  const config = getSmtpConfig();
  const brandColor = '#D4A017'; // Zanzibar gold
  const secondaryColor = '#0B3B8C'; // Deep Swahili Ocean Blue
  
  const headerHtml = `
    <div style="background-color: ${secondaryColor}; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">ZANZIBAR TRIP & RELAX</h1>
      <p style="color: ${brandColor}; margin: 5px 0 0 0; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Karibu Swahili Travel Desk</p>
    </div>
  `;
  
  const footerHtml = `
    <div style="background-color: #f8fafc; padding: 25px 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; color: #64748b; line-height: 1.6;">
      <p style="margin: 0 0 5px 0; font-weight: bold; color: ${secondaryColor};">Zanzibar Trip & Relax Ltd.</p>
      <p style="margin: 0;">Stone Town, Zanzibar, Tanzania | Phone: +255 629 506 063</p>
      <p style="margin: 10px 0 0 0; font-size: 10px; color: #94a3b8;">This is an automated system notification sent using the configured SMTP server (${config.host}). Please do not reply directly to this email.</p>
    </div>
  `;

  let subject = '';
  let contentHtml = '';

  switch (type) {
    case 'verification':
      subject = 'Please verify your Zanzibar Trip & Relax account';
      const verifyLink = `${window.location.origin}${window.location.pathname}#/my-account?verify_token=${data.token}&email=${encodeURIComponent(data.email)}`;
      contentHtml = `
        <div style="padding: 30px 25px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
          <p style="font-size: 16px; font-weight: bold; color: ${secondaryColor};">Jambo, ${toName}!</p>
          <p>Thank you for registering with Zanzibar Trip & Relax. Before you can log in and access your booking desk, we need to verify your email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: ${brandColor}; color: #020C1F; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(212, 160, 23, 0.2);">Verify My Account</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">If the button doesn't work, please copy and paste this link into your browser:</p>
          <p style="font-size: 11px; word-break: break-all; color: #0B3B8C;"><a href="${verifyLink}">${verifyLink}</a></p>
          <p style="margin-top: 25px;">Asante sana,<br>The Swahili Reservations Team</p>
        </div>
      `;
      break;

    case 'welcome':
      subject = 'Welcome to Zanzibar Trip & Relax! Your account is active 🌴';
      contentHtml = `
        <div style="padding: 30px 25px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
          <p style="font-size: 16px; font-weight: bold; color: ${secondaryColor};">Karibu Sana, ${toName}!</p>
          <p>Your email has been verified, and your premium guest account is now officially active.</p>
          <p>As a valued member, you can now log into your **My Account** portal to:</p>
          <ul style="padding-left: 20px; line-height: 1.8;">
            <li>View and print confirmed tour vouchers</li>
            <li>Submit direct pickup and itinerary notes to our guides</li>
            <li>Manage payments and secure receipts</li>
            <li>Build custom Swahili-coast wishing lists</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}${window.location.pathname}#/my-account" style="background-color: ${secondaryColor}; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Go to My Dashboard</a>
          </div>
          <p>We are thrilled to accompany you on your Zanzibar adventure!</p>
          <p style="margin-top: 25px;">Asante sana,<br>The Reservations Team</p>
        </div>
      `;
      break;

    case 'reset':
      subject = 'Reset your password - Zanzibar Trip & Relax';
      const resetLink = `${window.location.origin}${window.location.pathname}#/my-account?reset_token=${data.token}&email=${encodeURIComponent(data.email)}`;
      contentHtml = `
        <div style="padding: 30px 25px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
          <p style="font-size: 16px; font-weight: bold; color: ${secondaryColor};">Hello, ${toName},</p>
          <p>We received a secure request to reset the password for your Zanzibar Trip & Relax customer account.</p>
          <p>Please click the button below to complete your password reset. This link will expire shortly for security.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ef4444; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset My Password</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">If you did not request this change, you can safely ignore this email; your credentials remain fully protected.</p>
          <p style="font-size: 11px; word-break: break-all; color: #0B3B8C;"><a href="${resetLink}">${resetLink}</a></p>
          <p style="margin-top: 25px;">Asante,<br>Security Operations Team</p>
        </div>
      `;
      break;

    case 'booking_confirm':
      subject = `Reservation Confirmed: ${data.tour_name} 🎟️`;
      contentHtml = `
        <div style="padding: 30px 25px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
          <p style="font-size: 16px; font-weight: bold; color: ${secondaryColor};">Jambo, ${toName}!</p>
          <p>We are delighted to confirm your upcoming reservation in Zanzibar. Below are the travel particulars:</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid ${brandColor}; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 15px; color: #0f172a;">${data.tour_name}</p>
            <p style="margin: 0 0 5px 0;"><strong>Preferred Travel Date:</strong> ${data.preferred_date}</p>
            <p style="margin: 0 0 5px 0;"><strong>Travelers:</strong> ${data.number_of_guests} guest(s)</p>
            <p style="margin: 0 0 5px 0;"><strong>Pickup Location:</strong> ${data.pickup_location || 'To be updated in portal'}</p>
            <p style="margin: 0 0 5px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold; text-transform: uppercase;">${data.status}</span></p>
            <p style="margin: 0;"><strong>Total Amount:</strong> $${data.total_price || '0.00'}</p>
          </div>

          <p>Your travel voucher is now available for download inside your **My Account** portal. Please log in to supply any specific dietary requests, boat configurations, or hotel room details.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${window.location.origin}${window.location.pathname}#/my-account" style="background-color: ${brandColor}; color: #020C1F; padding: 11px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Access My Vouchers</a>
          </div>

          <p>Tutakutana Zanzibar! We look forward to creating stellar memories with you.</p>
          <p style="margin-top: 25px;">Warm regards,<br>Reservations Desk Office</p>
        </div>
      `;
      break;

    case 'payment_confirm':
      subject = `Payment Approved - Receipt for ${data.tour_name} 🧾`;
      contentHtml = `
        <div style="padding: 30px 25px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
          <p style="font-size: 16px; font-weight: bold; color: ${secondaryColor};">Asante, ${toName}!</p>
          <p>We have successfully processed and credited your payment to the ledger. Here is your receipt confirmation:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: #f8fafc;">
              <th style="padding: 10px; text-align: left; color: #475569;">Description</th>
              <th style="padding: 10px; text-align: right; color: #475569;">Amount</th>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 10px;">Payment for ${data.tour_name} (Date: ${data.preferred_date})</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: bold;">$${data.paid_amount || data.total_price || '0.00'}</td>
            </tr>
            <tr>
              <td style="padding: 12px 10px; font-weight: bold; text-align: right;">Total Credited:</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: #10b981; font-size: 15px;">$${data.paid_amount || data.total_price || '0.00'}</td>
            </tr>
          </table>

          <p>Your booking status has been updated to fully **Paid**. You may download the formal travel receipt in your client dashboard.</p>
          <p style="margin-top: 25px;">Asante sana,<br>Finance & Accounts Division</p>
        </div>
      `;
      break;

    case 'booking_cancel':
      subject = `Reservation Cancelled: ${data.tour_name}`;
      contentHtml = `
        <div style="padding: 30px 25px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
          <p style="font-size: 16px; font-weight: bold; color: #ef4444;">Reservation Cancelled</p>
          <p>Jambo ${toName},</p>
          <p>We are writing to confirm that your reservation for <strong>${data.tour_name}</strong> scheduled for ${data.preferred_date} has been successfully cancelled in accordance with your request or policy standards.</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 8px; color: #991b1b;">
            <p style="margin: 0; font-weight: bold;">Cancellation Summary:</p>
            <p style="margin: 5px 0 0 0; font-size: 13px;">Booking ID: ${data.id || 'N/A'}</p>
            <p style="margin: 3px 0 0 0; font-size: 13px;">Refund Disposition: Processed in accordance with travel policies.</p>
          </div>

          <p>If you have questions regarding credit notes, vouchers, or re-booking terms, please open a Support Ticket in your **My Account** portal or reach our Swahili desk via WhatsApp.</p>
          <p style="margin-top: 25px;">Sincerely,<br>Customer Relations Desk</p>
        </div>
      `;
      break;

    case 'staff_created':
      subject = `Welcome to the Team! Staff Profile Created 🔑`;
      contentHtml = `
        <div style="padding: 30px 25px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
          <p style="font-size: 16px; font-weight: bold; color: ${secondaryColor};">Jambo and Welcome, ${toName}!</p>
          <p>An administrative staff account has been set up for you in the Zanzibar Trip & Relax ERP Travel Management Platform.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #0f172a;">Your Secure Account Details:</p>
            <p style="margin: 0 0 6px 0;"><strong>Portal Login Url:</strong> <a href="${window.location.origin}${window.location.pathname}#/admin/login" style="color: ${secondaryColor};">${window.location.origin}${window.location.pathname}#/admin/login</a></p>
            <p style="margin: 0 0 6px 0;"><strong>Email/Username:</strong> ${data.email}</p>
            <p style="margin: 0 0 6px 0;"><strong>Assigned Access Role:</strong> <span style="background-color: #eff6ff; color: #1e40af; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 4px;">${data.role}</span></p>
            <p style="margin: 0 0 6px 0;"><strong>Temporary Password:</strong> <code style="background-color: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${data.tempPassword}</code></p>
            <p style="margin: 10px 0 0 0; font-size: 11px; color: #b91c1c; font-weight: bold;">⚠️ Safety Mandate: You will be forced to change your secure credentials upon your first session authentication.</p>
          </div>

          <p>Please keep this information confidential and do not share your credentials with unauthorized individuals.</p>
          <p style="margin-top: 25px;">Asante sana,<br>System Owner Administration</p>
        </div>
      `;
      break;

    case 'two_factor_auth':
      subject = `Security Verification: ${data.code} is your 2-Factor Code 🛡️`;
      contentHtml = `
        <div style="padding: 30px 25px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
          <p style="font-size: 16px; font-weight: bold; color: ${secondaryColor};">Jambo, ${toName},</p>
          <p>We received an authentication request to access the Master Owner portal of Zanzibar Trip & Relax.</p>
          <p>Please use the following 6-character Two-Factor Authentication (2FA) passcode to approve this login session. This code is valid for 10 minutes:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f1f5f9; border: 1px dashed ${brandColor}; display: inline-block; padding: 15px 40px; border-radius: 12px; font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: ${secondaryColor};">
              ${data.code}
            </div>
          </div>
          
          <p style="font-size: 12px; color: #64748b;">If you did not initiate this login session, please immediately change your security password as your credentials may be compromised.</p>
          <p style="margin-top: 25px;">Asante,<br>Security Operations Team</p>
        </div>
      `;
      break;

    case 'password_reset':
      subject = `Security Recovery Code: ${data.code} 🔑`;
      contentHtml = `
        <div style="padding: 30px 25px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
          <p style="font-size: 16px; font-weight: bold; color: ${secondaryColor};">Hello, ${toName},</p>
          <p>You requested to initiate multi-layered security recovery to reset the password of your master Owner account.</p>
          <p>Enter the following secure code to verify your identity. This code expires in 30 minutes:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #fee2e2; border: 1px solid #ef4444; display: inline-block; padding: 15px 45px; border-radius: 12px; font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #b91c1c;">
              ${data.code}
            </div>
          </div>
          
          <p style="font-size: 12px; color: #64748b;">This is a primary recovery code. If you did not trigger this account recovery, please report this incident immediately to security staff.</p>
          <p style="margin-top: 25px;">Warm regards,<br>Access Recovery Division</p>
        </div>
      `;
      break;

    case 'sms_dispatch_log':
      subject = `SMS Transmission Log Alert [Simulated Gateway] 📱`;
      contentHtml = `
        <div style="padding: 30px 25px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
          <p style="font-size: 16px; font-weight: bold; color: ${secondaryColor};">SMS Transmission Dispatch Report</p>
          <p>The security manager successfully dispatched a secure SMS alert code to recovery mobile terminal <strong>${data.phone}</strong>:</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; font-family: monospace; font-size: 13px;">
            ${data.message}
          </div>
          
          <p style="font-size: 11px; color: #64748b;">This log serves to simulate cellular telecommunication channels inside the sandbox preview layout.</p>
        </div>
      `;
      break;

    case 'security_alert':
      subject = `${data.subject || 'Security Alert: Account Modified'} 🔒`;
      contentHtml = `
        <div style="padding: 30px 25px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">
          <p style="font-size: 16px; font-weight: bold; color: #b91c1c;">⚠️ Security Notice</p>
          <p>Hello, ${toName},</p>
          <p>${data.message}</p>
          
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 12px; color: #b45309;">
            <strong>Event Details:</strong><br>
            Time: ${new Date().toUTCString()}<br>
            Resource: Owner Account Security Policies<br>
            Action: Access Password Modification
          </div>
          
          <p>If this was indeed you, no further action is necessary. Your system credentials have been safely committed.</p>
          <p style="margin-top: 25px;">Asante,<br>Security Operations Division</p>
        </div>
      `;
      break;
  }

  const completeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f1f5f9; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); overflow: hidden;">
          ${headerHtml}
          ${contentHtml}
          ${footerHtml}
        </div>
      </body>
    </html>
  `;

  return { subject, bodyHtml: completeHtml };
}

// Trigger automatic sending of emails (adds log, raises toast, behaves realistically)
export function dispatchAutomatedEmail(
  type: EmailLog['type'],
  toEmail: string,
  toName: string,
  data: Record<string, any>
): EmailLog {
  const config = getSmtpConfig();
  const { subject, bodyHtml } = generateEmailTemplate(type, toName, data);
  
  // Real SMTP Send Simulation (Simulates active SMTP transport logs)
  const log = addEmailLog({
    toEmail,
    subject,
    bodyHtml,
    type,
    status: 'Delivered',
    smtpUsed: `${config.provider.toUpperCase()} (${config.host}:${config.port})`
  });

  return log;
}
