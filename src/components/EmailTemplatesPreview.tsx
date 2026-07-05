import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, FileText, Code, Smartphone, Monitor, Copy, Check, Send, 
  ExternalLink, Sparkles, Terminal, Info, Globe, AlertCircle, FileCode2
} from 'lucide-react';
import { 
  getBookingConfirmationHtml, 
  getPaymentReceiptHtml, 
  EmailTemplateData 
} from '../lib/emailTemplates';

interface EmailTemplatesPreviewProps {
  bookingData: EmailTemplateData;
}

type TabType = 'confirmation' | 'receipt';
type ViewportType = 'desktop' | 'mobile';
type OutputMode = 'preview' | 'html' | 'text' | 'integration';

export const EmailTemplatesPreview: React.FC<EmailTemplatesPreviewProps> = ({ bookingData }) => {
  const [activeTab, setActiveTab] = useState<TabType>('confirmation');
  const [viewport, setViewport] = useState<ViewportType>('desktop');
  const [outputMode, setOutputMode] = useState<OutputMode>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [testDispatched, setTestDispatched] = useState<boolean>(false);
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([
    'SMTP Gateway initialized on port 587...',
    'Secure TLS handshake established with Zanzibar server...',
  ]);

  // Generate HTML based on active template
  const htmlContent = activeTab === 'confirmation' 
    ? getBookingConfirmationHtml(bookingData) 
    : getPaymentReceiptHtml(bookingData);

  // Generate simple plain-text alternative
  const amountPaid = bookingData.paymentOption === 'deposit' ? bookingData.depositAmount : bookingData.totalPrice;
  const plainTextContent = activeTab === 'confirmation' 
    ? `==================================================
ZANZIBAR TRIP & RELAX - RESERVATION CONFIRMED
==================================================
Booking Reference: ${bookingData.reference}
Lead Guest: ${bookingData.fullName}
Tour Name: ${bookingData.tourName}
Scheduled Date: ${bookingData.preferredDate}
Number of Travelers: ${bookingData.numberOfGuests} Person(s)
Pickup Location: ${bookingData.pickupLocation || 'Zone dependent'}

FINANCIAL DETAILS:
----------------------------------
Total Package Price: ${bookingData.currencySymbol}${bookingData.totalPrice}.00
Deposit Paid: ${bookingData.currencySymbol}${amountPaid}.00
Remaining Balance (Due on arrival): ${bookingData.currencySymbol}${bookingData.remainingBalance}.00

CONTACT & SUPPORT:
----------------------------------
WhatsApp Desk: +255 629 506 063
Email Desk: info@zanzibartripandrelax.com
Office: Stone Town, Zanzibar, Tanzania
==================================================`
    : `==================================================
ZANZIBAR TRIP & RELAX - OFFICIAL PAYMENT RECEIPT
==================================================
Receipt Number: ZTR-REC-${(bookingData.transactionId || '').replace('ZTR-TX-', '') || Date.now().toString().substring(7)}
Transaction ID: ${bookingData.transactionId || 'ZTR-TX-' + Date.now().toString().substring(7)}
Associated Booking Ref: ${bookingData.reference}
Payment Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Billed To: ${bookingData.fullName} (${bookingData.email})

CHARGES BREAKDOWN:
----------------------------------
${bookingData.tourName}: ${bookingData.currencySymbol}${bookingData.totalPrice}.00
Payment Received (Approved): -${bookingData.currencySymbol}${amountPaid}.00
Remaining Balance Outstanding: ${bookingData.currencySymbol}${bookingData.remainingBalance}.00

STATUS: PAID & VERIFIED SECURE CARD TRANSACTION
==================================================`;

  const handleCopy = () => {
    const textToCopy = outputMode === 'html' ? htmlContent : plainTextContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerLiveSimulation = () => {
    setTestDispatched(true);
    const newLogs = [
      ...dispatchLogs,
      `[${new Date().toLocaleTimeString()}] Drafting dynamic payload for ${bookingData.fullName}...`,
      `[${new Date().toLocaleTimeString()}] Binding template schema for reference: ${bookingData.reference}...`,
      `[${new Date().toLocaleTimeString()}] Authenticating with secure Resend API dispatcher...`,
      `[${new Date().toLocaleTimeString()}] Success: 200 OK - Email dispatched to ${bookingData.email} (MessageID: resend-${Math.random().toString(36).substring(7)})`,
    ];
    setDispatchLogs(newLogs);
    setTimeout(() => setTestDispatched(false), 4000);
  };

  return (
    <div className="bg-[#0b3b8c]/5 border border-[#0b3b8c]/10 rounded-3xl p-5 md:p-8 space-y-6" id="email-templates-preview-hub">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-widest font-mono bg-[#D4A017]/10 px-2.5 py-1 rounded-full border border-[#D4A017]/20">
            Official Email Dispatch Desk
          </span>
          <h4 className="text-xl font-black text-[#0B3B8C] mt-2 tracking-tight flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Mail size={20} className="text-[#D4A017]" />
            Professional Email & Invoice Suite
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Dynamic responsive communications crafted to meet the verified Zanzibar Trip & Relax style.
          </p>
        </div>

        {/* Viewport & Tab Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* TAB: Confirmation vs Receipt */}
          <div className="bg-white border border-gray-200 p-1 rounded-xl flex shadow-sm">
            <button
              onClick={() => setActiveTab('confirmation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'confirmation'
                  ? 'bg-[#0B3B8C] text-white'
                  : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              Confirmation Email
            </button>
            <button
              onClick={() => setActiveTab('receipt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeTab === 'receipt'
                  ? 'bg-[#0B3B8C] text-white'
                  : 'text-gray-500 hover:text-gray-950 hover:bg-gray-50'
              }`}
            >
              Payment Receipt
            </button>
          </div>

          {/* VIEWPORT SELECTOR */}
          {outputMode === 'preview' && (
            <div className="bg-white border border-gray-200 p-1 rounded-xl flex shadow-sm">
              <button
                onClick={() => setViewport('desktop')}
                title="Desktop Preview"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewport === 'desktop' ? 'bg-gray-100 text-[#0B3B8C]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Monitor size={15} />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                title="Mobile Preview"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewport === 'mobile' ? 'bg-gray-100 text-[#0B3B8C]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Smartphone size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RENDER MODES */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setOutputMode('preview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            outputMode === 'preview' 
              ? 'bg-[#0B3B8C]/10 text-[#0B3B8C] border border-[#0B3B8C]/20' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Globe size={13} />
          <span>Interactive Preview</span>
        </button>
        <button
          onClick={() => setOutputMode('html')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            outputMode === 'html' 
              ? 'bg-[#0B3B8C]/10 text-[#0B3B8C] border border-[#0B3B8C]/20' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Code size={13} />
          <span>HTML Source</span>
        </button>
        <button
          onClick={() => setOutputMode('text')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            outputMode === 'text' 
              ? 'bg-[#0B3B8C]/10 text-[#0B3B8C] border border-[#0B3B8C]/20' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText size={13} />
          <span>Plain Text alternative</span>
        </button>
        <button
          onClick={() => setOutputMode('integration')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            outputMode === 'integration' 
              ? 'bg-[#0B3B8C]/10 text-[#0B3B8C] border border-[#0B3B8C]/20' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Terminal size={13} />
          <span>Developer Integration</span>
        </button>
      </div>

      {/* DISPLAY BOX CONTAINER */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-inner flex flex-col min-h-[460px]">
        
        {/* INTERACTIVE PREVIEW PANEL */}
        {outputMode === 'preview' && (
          <div className="bg-slate-100 flex-1 p-4 flex items-center justify-center overflow-auto transition-all duration-300">
            <motion.div
              layout
              style={{
                width: viewport === 'mobile' ? '375px' : '100%',
                maxWidth: viewport === 'mobile' ? '375px' : '650px',
                height: '480px',
              }}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
            >
              {/* Fake Email client header bar */}
              <div className="bg-slate-50 border-b border-gray-200 px-4 py-2 text-[10px] font-mono text-gray-400 flex items-center justify-between">
                <div className="truncate max-w-[80%]">
                  <span className="font-bold text-gray-600">To:</span> {bookingData.fullName} &lt;{bookingData.email}&gt;
                  <br />
                  <span className="font-bold text-gray-600">Subject:</span> {activeTab === 'confirmation' ? `Confirmed Holiday Expedition - Ref: ${bookingData.reference}` : `Official Zanzibar Payment Receipt - Ref: ${bookingData.reference}`}
                </div>
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Secure sandbox render */}
              <iframe
                title="Email template sandbox render"
                srcDoc={htmlContent}
                className="w-full h-full border-none"
                sandbox="allow-popups allow-popups-to-escape-sandbox"
              />
            </motion.div>
          </div>
        )}

        {/* HTML SOURCE VIEW */}
        {outputMode === 'html' && (
          <div className="flex-1 p-4 bg-slate-900 text-slate-200 font-mono text-xs overflow-auto max-h-[480px] flex flex-col">
            <div className="flex justify-between items-center mb-3 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <FileCode2 size={13} className="text-[#D4A017]" />
                Ready-to-use HTML (Optimized for inline CSS mail compatibility)
              </span>
              <button
                onClick={handleCopy}
                className="bg-white/10 hover:bg-white/20 text-white hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy Source'}</span>
              </button>
            </div>
            <pre className="flex-1 select-all overflow-auto p-2 leading-relaxed whitespace-pre-wrap break-all text-emerald-400">
              {htmlContent}
            </pre>
          </div>
        )}

        {/* PLAIN TEXT VIEW */}
        {outputMode === 'text' && (
          <div className="flex-1 p-4 bg-slate-50 text-slate-800 font-mono text-xs overflow-auto max-h-[480px] flex flex-col">
            <div className="flex justify-between items-center mb-3 bg-white p-2.5 border rounded-xl shadow-sm">
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <FileText size={13} className="text-[#0B3B8C]" />
                Fallback text version (For slow networks & basic mail agents)
              </span>
              <button
                onClick={handleCopy}
                className="bg-[#0B3B8C] hover:bg-[#062862] text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check size={11} className="text-white" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <pre className="flex-1 p-3 bg-white border border-gray-150 rounded-xl leading-relaxed whitespace-pre-wrap font-mono text-gray-700 select-all shadow-inner">
              {plainTextContent}
            </pre>
          </div>
        )}

        {/* DEVELOPER INTEGRATION BOARD */}
        {outputMode === 'integration' && (
          <div className="flex-1 p-5 space-y-4 max-h-[480px] overflow-auto">
            <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl flex gap-3 text-xs text-amber-900 leading-relaxed">
              <Info size={18} className="text-[#D4A017] shrink-0" />
              <div>
                <strong className="text-[#0B3B8C] uppercase block tracking-wider font-extrabold mb-1">How To Automate This Template</strong>
                To connect this gorgeous template with automatic server triggers (e.g. Supabase DB Webhooks, Stripe events, Resend, or SendGrid API), use the verified helper endpoints or node scripts detailed below.
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <span className="block font-black text-[10px] text-gray-400 uppercase tracking-widest font-sans">Sample Node/Resend implementation code</span>
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl overflow-auto select-all relative">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`import { Resend } from 'resend';
import { getBookingConfirmationHtml } from './emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(booking) {
  const html = getBookingConfirmationHtml(booking);
  
  await resend.emails.send({
    from: 'Zanzibar Trip & Relax <bookings@zanzibartripandrelax.com>',
    to: booking.email,
    subject: \`Your Expedition is Confirmed! Reference: \${booking.reference}\`,
    html: html,
  });
}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white px-2 rounded py-1 text-[9px]"
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <pre className="text-emerald-400">
{`import { Resend } from 'resend';
import { getBookingConfirmationHtml } from './emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(booking) {
  const html = getBookingConfirmationHtml(booking);
  
  await resend.emails.send({
    from: 'Zanzibar Trip & Relax <bookings@zanzibartripandrelax.com>',
    to: booking.email,
    subject: \`Your Expedition is Confirmed! Reference: \${booking.reference}\`,
    html: html,
  });
}`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DISPATCH SIMULATION CONTROL BLOCK */}
      <div className="bg-white border border-gray-150 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-xs">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <Send size={18} className="text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h5 className="font-black text-[#0B3B8C] uppercase tracking-wide">Test Send Live Simulation</h5>
            <p className="text-gray-500 font-medium">Verify the exact API transmission package directly to <strong className="text-gray-800">{bookingData.email}</strong>.</p>
          </div>
        </div>

        <button
          onClick={triggerLiveSimulation}
          disabled={testDispatched}
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white font-black px-5 py-2.5 rounded-full uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          {testDispatched ? (
            <>
              <Check size={14} className="animate-ping" />
              <span>SMTP Success!</span>
            </>
          ) : (
            <>
              <Send size={13} />
              <span>Simulate Dispatch</span>
            </>
          )}
        </button>
      </div>

      {/* REAL-TIME SMTP LOGS PANEL */}
      <div className="bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px] p-4 rounded-2xl shadow-inner space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-gray-500 font-black tracking-widest uppercase flex items-center gap-1">
            <Terminal size={12} className="text-[#D4A017]" />
            Live SMTP Sandbox Server Logs
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">ONLINE</span>
        </div>
        <div className="max-h-[100px] overflow-auto space-y-1.5 font-mono">
          {dispatchLogs.map((log, index) => (
            <div key={index} className="leading-relaxed border-l border-emerald-500/30 pl-2.5">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
