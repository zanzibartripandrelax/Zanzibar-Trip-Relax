/**
 * Zanzibar Trip & Relax - Professional HTML Email Templates Module
 * Brand Palette:
 * - Deep Blue: #0B3B8C (Hex primary)
 * - Amber Gold: #D4A017 (Accent gold)
 * - Charcoal: #1A2434 (Primary text)
 * - Light Background: #F8FAFC
 * - Border Light: #E2E8F0
 */

export interface EmailTemplateData {
  reference: string;
  fullName: string;
  email: string;
  whatsapp: string;
  tourName: string;
  preferredDate: string;
  pickupLocation: string;
  numberOfGuests: number;
  totalPrice: number;
  depositAmount: number;
  remainingBalance: number;
  paymentOption: 'deposit' | 'full';
  currencySymbol: string;
  transactionId?: string;
  paymentMethod?: string;
  paymentDate?: string;
}

/**
 * Returns a high-quality responsive HTML email template for Booking Confirmation
 */
export function getBookingConfirmationHtml(data: EmailTemplateData): string {
  const amountPaid = data.paymentOption === 'deposit' ? data.depositAmount : data.totalPrice;
  const waLink = `https://wa.me/255629506063?text=${encodeURIComponent(
    `Hi Zanzibar Trip & Relax, I received my booking confirmation for Reference: ${data.reference}. Looking forward to our tour!`
  )}`;
  const portalLink = `${window.location.origin}/#manage-booking?id=${data.reference}&email=${encodeURIComponent(data.email)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Your Zanzibar Booking is Confirmed - ${data.reference}</title>
  <style>
    /* Reset & Base styles */
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      width: 100%;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background-color: #0b3b8c;
      padding: 32px;
      text-align: center;
      border-bottom: 4px solid #d4a017;
      position: relative;
    }
    .header-logo {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .header-logo span {
      color: #d4a017;
    }
    .header-subtitle {
      font-size: 11px;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 6px;
      font-weight: 600;
    }
    .hero {
      padding: 32px 32px 20px 32px;
      text-align: center;
    }
    .hero-icon {
      font-size: 40px;
      line-height: 1;
      margin-bottom: 12px;
    }
    .hero-title {
      font-size: 22px;
      font-weight: 800;
      color: #0b3b8c;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .hero-ref {
      display: inline-block;
      margin-top: 10px;
      background-color: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #047857;
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 8px;
      letter-spacing: 1px;
    }
    .content {
      padding: 0 32px 32px 32px;
    }
    .greeting {
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #d4a017;
      margin-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .info-table {
      margin-bottom: 24px;
    }
    .info-row {
      border-bottom: 1px solid #f1f5f9;
    }
    .info-label {
      padding: 10px 0;
      font-size: 13px;
      color: #64748b;
      font-weight: 600;
      width: 40%;
    }
    .info-value {
      padding: 10px 0;
      font-size: 13px;
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .financial-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 24px;
    }
    .financial-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .financial-row:last-child {
      margin-bottom: 0;
      padding-top: 8px;
      border-top: 1px dashed #cbd5e1;
    }
    .financial-label {
      color: #475569;
      font-weight: 500;
    }
    .financial-value {
      color: #0f172a;
      font-weight: 700;
    }
    .financial-highlight {
      color: #10b981;
      font-weight: 800;
    }
    .dispatch-banner {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 16px;
      font-size: 12px;
      line-height: 1.6;
      color: #1e3a8a;
      margin-bottom: 28px;
    }
    .dispatch-title {
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      display: block;
    }
    .actions {
      text-align: center;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      text-decoration: none;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 24px;
      border-radius: 10px;
      margin: 6px;
      text-align: center;
      min-width: 160px;
    }
    .btn-primary {
      background-color: #0b3b8c;
      color: #ffffff;
      box-shadow: 0 4px 6px rgba(11, 59, 140, 0.15);
    }
    .btn-secondary {
      background-color: #25d366;
      color: #ffffff;
      box-shadow: 0 4px 6px rgba(37, 211, 102, 0.15);
    }
    .footer {
      background-color: #0f172a;
      color: #94a3b8;
      padding: 32px;
      text-align: center;
      font-size: 11px;
      line-height: 1.8;
      border-top: 1px solid #1e293b;
    }
    .footer a {
      color: #d4a017;
      text-decoration: none;
      font-weight: 600;
    }
    .footer-divider {
      height: 1px;
      background-color: #1e293b;
      margin: 16px 0;
    }
    .social-links {
      margin-top: 10px;
    }
    .social-links a {
      margin: 0 8px;
    }
  </style>
</head>
<body>

  <div class="email-container">
    <!-- Brand Header -->
    <div class="header">
      <h1 class="header-logo">Zanzibar<span>Trip & Relax</span></h1>
      <div class="header-subtitle">Official Reservation Voucher</div>
    </div>

    <!-- Hero Title & Reference Banner -->
    <div class="hero">
      <div class="hero-icon">🏝️</div>
      <h2 class="hero-title">Your Expedition is Confirmed!</h2>
      <div class="hero-ref">${data.reference}</div>
    </div>

    <!-- Core Content Body -->
    <div class="content">
      <div class="greeting">
        Dear <strong>${data.fullName}</strong>,<br><br>
        Asante sana! We are delighted to confirm your upcoming holiday experience in Zanzibar. Our team has received your advanced payment and guaranteed your reservation slot. Below are the registered particulars of your tour.
      </div>

      <!-- Part 1: Travel Particulars -->
      <div class="section-title">01 • Travel Summary</div>
      <table class="info-table">
        <tr class="info-row">
          <td class="info-label">Lead Guest</td>
          <td class="info-value">${data.fullName}</td>
        </tr>
        <tr class="info-row">
          <td class="info-label">Tour / Package</td>
          <td class="info-value" style="color: #0b3b8c;">${data.tourName}</td>
        </tr>
        <tr class="info-row">
          <td class="info-label">Scheduled Date</td>
          <td class="info-value">${data.preferredDate}</td>
        </tr>
        <tr class="info-row">
          <td class="info-label">Total Travelers</td>
          <td class="info-value">${data.numberOfGuests} Person(s)</td>
        </tr>
        <tr class="info-row">
          <td class="info-label">Resort / Pickup</td>
          <td class="info-value">${data.pickupLocation || 'Stone Town Hotel Area'}</td>
        </tr>
        <tr class="info-row">
          <td class="info-label">Estimated Pickup</td>
          <td class="info-value">07:00 AM - 08:30 AM (Zone Dependent)</td>
        </tr>
      </table>

      <!-- Part 2: Financial Particulars -->
      <div class="section-title">02 • Financial Summary</div>
      <div class="financial-box">
        <div class="financial-row">
          <span class="financial-label">Total Package Cost</span>
          <span class="financial-value">${data.currencySymbol}${data.totalPrice}.00</span>
        </div>
        <div class="financial-row">
          <span class="financial-label">Advanced Deposit Paid</span>
          <span class="financial-value financial-highlight">${data.currencySymbol}${amountPaid}.00</span>
        </div>
        <div class="financial-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">
          <span class="financial-label" style="font-weight: 700; color: #0f172a;">Balance Due On Arrival</span>
          <span class="financial-value" style="font-size: 15px; color: #0f172a; font-weight: 800;">${data.currencySymbol}${data.remainingBalance}.00</span>
        </div>
      </div>

      <!-- Dispatch Desk Banner -->
      <div class="dispatch-banner">
        <span class="dispatch-title">📢 Swahili Dispatch Desk Info</span>
        Your driver-guide and hotel pickup list will be compiled 24 hours prior to travel. Our operational supervisor will ping you on WhatsApp or email to dispatch your precise pickup window. Please keep your phone reachable.
      </div>

      <!-- Action Buttons -->
      <div class="actions">
        <a href="${portalLink}" target="_blank" class="btn btn-primary">Manage My Booking</a>
        <a href="${waLink}" target="_blank" class="btn btn-secondary">WhatsApp Support</a>
      </div>
    </div>

    <!-- Footnote Section -->
    <div class="footer">
      <strong>Zanzibar Trip & Relax Ltd</strong><br>
      Stone Town Commercial Center, Mizingani Road, Zanzibar, Tanzania<br>
      <a href="mailto:info@zanzibartripandrelax.com">info@zanzibartripandrelax.com</a> | <a href="https://wa.me/255629506063">+255 629 506 063</a>
      <div class="footer-divider"></div>
      This is an automated dispatch from our secure gateway. Please bring a digital copy of this voucher on your travel date.
      <div class="social-links">
        <a href="#">Instagram</a> • <a href="#">Facebook</a> • <a href="#">TripAdvisor</a>
      </div>
    </div>
  </div>

</body>
</html>`;
}

/**
 * Returns a high-quality responsive HTML email template for Payment Receipt
 */
export function getPaymentReceiptHtml(data: EmailTemplateData): string {
  const transactionId = data.transactionId || `ZTR-TX-${Date.now().toString().substring(7)}`;
  const paymentMethod = data.paymentMethod || 'Online Credit/Debit Card';
  const paymentDate = data.paymentDate || new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const amountPaid = data.paymentOption === 'deposit' ? data.depositAmount : data.totalPrice;
  const portalLink = `${window.location.origin}/#manage-booking?id=${data.reference}&email=${encodeURIComponent(data.email)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Payment Receipt - ${transactionId}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1e293b;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    .receipt-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(11, 59, 140, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header-bar {
      background: linear-gradient(135deg, #0b3b8c 0%, #1d4ed8 100%);
      padding: 32px;
      text-align: center;
      border-bottom: 4px solid #d4a017;
    }
    .header-title {
      color: #ffffff;
      font-size: 20px;
      font-weight: 800;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header-title span {
      color: #d4a017;
    }
    .header-subtitle {
      color: #93c5fd;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 6px;
      font-weight: 600;
    }
    .amount-banner {
      text-align: center;
      padding: 32px 32px 20px 32px;
      background-color: #fafcfd;
      border-bottom: 1px solid #f1f5f9;
    }
    .receipt-badge {
      display: inline-block;
      background-color: #d1fae5;
      color: #065f46;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .amount-title {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      font-weight: 600;
    }
    .amount-value {
      font-size: 36px;
      font-weight: 900;
      color: #0b3b8c;
      margin: 4px 0 0 0;
    }
    .receipt-body {
      padding: 32px;
    }
    .meta-grid {
      margin-bottom: 24px;
    }
    .meta-row {
      border-bottom: 1px solid #f1f5f9;
    }
    .meta-label {
      padding: 10px 0;
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }
    .meta-value {
      padding: 10px 0;
      font-size: 12px;
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .ledger-table {
      margin-top: 24px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    .ledger-header {
      background-color: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .ledger-header th {
      padding: 12px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      text-align: left;
    }
    .ledger-row td {
      padding: 14px 12px;
      font-size: 13px;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }
    .ledger-total-row {
      background-color: #f8fafc;
    }
    .ledger-total-row td {
      padding: 12px;
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .section-header {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #d4a017;
      margin-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .security-note {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 16px;
      font-size: 12px;
      line-height: 1.6;
      color: #166534;
      margin-bottom: 24px;
    }
    .security-title {
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 4px;
      display: block;
    }
    .btn-holder {
      text-align: center;
      margin-top: 8px;
    }
    .button {
      display: inline-block;
      text-decoration: none;
      background-color: #0b3b8c;
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(11, 59, 140, 0.15);
    }
    .footer-bar {
      background-color: #0f172a;
      color: #94a3b8;
      padding: 32px;
      text-align: center;
      font-size: 11px;
      line-height: 1.8;
    }
    .footer-bar a {
      color: #d4a017;
      text-decoration: none;
    }
  </style>
</head>
<body>

  <div class="receipt-container">
    <!-- Blue Header Bar -->
    <div class="header-bar">
      <h1 class="header-title">Zanzibar<span>Trip & Relax</span></h1>
      <div class="header-subtitle">Official Payment Receipt</div>
    </div>

    <!-- Payment Banner -->
    <div class="amount-banner">
      <span class="receipt-badge">Verified Transaction</span>
      <h3 class="amount-title">Total Amount Processed Successfully</h3>
      <div class="amount-value">${data.currencySymbol}${amountPaid}.00</div>
    </div>

    <!-- Receipt Details Grid -->
    <div class="receipt-body">
      <div class="section-header">Receipt Particulars</div>
      <table class="meta-grid">
        <tr class="meta-row">
          <td class="meta-label">Receipt Number</td>
          <td class="meta-value" style="font-family: monospace; font-size: 13px; color: #0b3b8c;">ZTR-REC-${transactionId.replace('ZTR-TX-', '')}</td>
        </tr>
        <tr class="meta-row">
          <td class="meta-label">Transaction ID</td>
          <td class="meta-value" style="font-family: monospace; font-size: 13px;">${transactionId}</td>
        </tr>
        <tr class="meta-row">
          <td class="meta-label">Associated Booking ID</td>
          <td class="meta-value" style="font-family: monospace; font-weight: 700;">${data.reference}</td>
        </tr>
        <tr class="meta-row">
          <td class="meta-label">Payment Date</td>
          <td class="meta-value">${paymentDate}</td>
        </tr>
        <tr class="meta-row">
          <td class="meta-label">Payment Channel</td>
          <td class="meta-value">${paymentMethod}</td>
        </tr>
        <tr class="meta-row">
          <td class="meta-label">Billed To</td>
          <td class="meta-value">${data.fullName} (${data.email})</td>
        </tr>
      </table>

      <!-- Ledger Statement -->
      <div class="section-header">Statement of Account</div>
      <table class="ledger-table">
        <tr class="ledger-header">
          <th style="width: 65%;">Item Description</th>
          <th style="width: 35%; text-align: right;">Amount</th>
        </tr>
        <tr class="ledger-row">
          <td>
            <strong>${data.tourName}</strong><br>
            <span style="font-size: 11px; color: #64748b;">Scheduled for ${data.preferredDate} • ${data.numberOfGuests} Traveler(s)</span>
          </td>
          <td style="text-align: right; font-weight: 700;">${data.currencySymbol}${data.totalPrice}.00</td>
        </tr>
        <tr class="ledger-row">
          <td>
            Advanced Security Prepayment Deposit<br>
            <span style="font-size: 11px; color: #10b981; font-weight: 600;">Authorized Secured Card Transaction</span>
          </td>
          <td style="text-align: right; color: #10b981; font-weight: 800;">-${data.currencySymbol}${amountPaid}.00</td>
        </tr>
        <tr class="ledger-total-row">
          <td style="text-align: right; font-weight: 700;">Remaining Balance Due (On Arrival)</td>
          <td style="text-align: right; font-weight: 800; color: #0b3b8c; font-size: 15px;">${data.currencySymbol}${data.remainingBalance}.00</td>
        </tr>
      </table>

      <!-- Security Guarantee Notes -->
      <div class="security-note">
        <span class="security-title">🔒 Multi-Currency Payment Guarantee</span>
        Your advanced deposit is held securely by our authorized Zanzibar reservation desk. In case of any official cancellation request within our policy window (up to 24 hours prior to travel), a refund will be initiated to your original payment card.
      </div>

      <div class="btn-holder">
        <a href="${portalLink}" target="_blank" class="button">View Realtime Booking Portal</a>
      </div>
    </div>

    <!-- Footnote Footer -->
    <div class="footer-bar">
      <strong>Zanzibar Trip & Relax Ltd</strong><br>
      Stone Town Commercial Center, Mizingani Road, Zanzibar, Tanzania<br>
      <a href="mailto:info@zanzibartripandrelax.com">info@zanzibartripandrelax.com</a> | <a href="https://wa.me/255629506063">+255 629 506 063</a>
      <div style="height: 1px; background-color: #1e293b; margin: 16px 0;"></div>
      This is an official transaction document representing payment received by Zanzibar Trip & Relax reservations division.
    </div>
  </div>

</body>
</html>`;
}
