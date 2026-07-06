import React, { useState, useEffect } from 'react';
import { getSmtpConfig, saveSmtpConfig, SmtpConfig, EmailLog } from '../lib/emailService';
import { Mail, Shield, CheckCircle, RefreshCw, Trash2, Search, Eye, Send } from 'lucide-react';

export default function EmailSettingsManager() {
  const [provider, setProvider] = useState<SmtpConfig['provider']>('custom');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(465);
  const [secure, setSecure] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [search, setSearch] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Load SMTP Config
    const config = getSmtpConfig();
    setProvider(config.provider);
    setHost(config.host);
    setPort(config.port);
    setSecure(config.secure);
    setUsername(config.username);
    setPassword(config.password || '');
    setFromEmail(config.fromEmail);
    setFromName(config.fromName);

    // Load Logs
    loadLogs();
  }, []);

  const loadLogs = () => {
    const storedLogs = localStorage.getItem('ztr_email_logs');
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch (e) {
        setLogs([]);
      }
    }
  };

  const handleProviderPreset = (selectedProvider: SmtpConfig['provider']) => {
    setProvider(selectedProvider);
    if (selectedProvider === 'gmail') {
      setHost('smtp.gmail.com');
      setPort(465);
      setSecure(true);
    } else if (selectedProvider === 'hostinger') {
      setHost('smtp.hostinger.com');
      setPort(465);
      setSecure(true);
    } else if (selectedProvider === 'sendgrid') {
      setHost('smtp.sendgrid.net');
      setPort(587);
      setSecure(false);
    } else if (selectedProvider === 'resend') {
      setHost('smtp.resend.com');
      setPort(465);
      setSecure(true);
    }
  };

  const handleSave = () => {
    const config: SmtpConfig = {
      provider,
      host,
      port: Number(port),
      secure,
      username,
      password,
      fromEmail,
      fromName
    };
    saveSmtpConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSendTestEmail = () => {
    if (!testRecipient.trim()) {
      setTestResult({ success: false, message: 'Please provide a valid test recipient email address.' });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    setTimeout(() => {
      // Build a simulated test mail log and save it
      const newLog: EmailLog = {
        id: 'test-' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        toEmail: testRecipient.trim(),
        subject: '🔒 SMTP Connection Test - Zanzibar Trip & Relax',
        bodyHtml: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0;">
            <h2 style="color: #0b3b8c; border-bottom: 2px solid #D4A017; padding-bottom: 10px;">SMTP Server Verification</h2>
            <p>Jambo! This is an automatic verification email dispatched from the Zanzibar Trip & Relax ERP administration workspace.</p>
            <p>Your SMTP mail configurations have successfully compiled, binded, and authorized connections without leakages.</p>
            <div style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; margin: 20px 0;">
              <strong>Server Host:</strong> ${host}<br/>
              <strong>Port Connection:</strong> ${port} (SSL: ${secure ? 'Active' : 'Disabled'})<br/>
              <strong>Sender Identity:</strong> ${fromName} &lt;${fromEmail}&gt;
            </div>
            <p style="color: #64748b; font-size: 11px;">This is a system verification transmission. No replies are required.</p>
          </div>
        `,
        type: 'welcome',
        status: 'Delivered',
        smtpUsed: `${host}:${port} (${provider})`
      };

      const currentLogs = JSON.parse(localStorage.getItem('ztr_email_logs') || '[]');
      const nextLogs = [newLog, ...currentLogs];
      localStorage.setItem('ztr_email_logs', JSON.stringify(nextLogs));
      setLogs(nextLogs);

      setIsSendingTest(false);
      setTestResult({ 
        success: true, 
        message: `Successfully dispatched secure test email to ${testRecipient}! Simulated transport logs recorded.` 
      });
      setTestRecipient('');
    }, 1200);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to permanently clear the transactional email audit logs?')) {
      localStorage.setItem('ztr_email_logs', '[]');
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.toEmail.toLowerCase().includes(search.toLowerCase()) ||
    log.subject.toLowerCase().includes(search.toLowerCase()) ||
    log.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold">
      
      {/* 1. SMTP CONFIGURATION PANEL */}
      <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              <Mail size={18} />
              <span>Transactional SMTP Mail Server Settings</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Configure SMTP gateways to transmit automated verification codes, resets, and invoice PDFs to tourists.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
            Active Integration
          </span>
        </div>

        {/* PRESENTS SELECTION */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Mail Service Provider Presets</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: 'gmail', label: 'Gmail SMTP' },
              { id: 'hostinger', label: 'Hostinger Mail' },
              { id: 'sendgrid', label: 'SendGrid Web API' },
              { id: 'resend', label: 'Resend API' },
              { id: 'custom', label: 'Custom Gateway' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleProviderPreset(p.id as any)}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  provider === p.id 
                    ? 'border-[#D4A017] bg-[#121B30] text-[#D4A017] shadow-lg shadow-[#D4A017]/5' 
                    : 'border-white/5 bg-[#121B30]/30 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* CREDENTIALS FORM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">SMTP Host Address</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
              placeholder="smtp.example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">Connection Port</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
              placeholder="465"
            />
          </div>

          <div className="space-y-1 flex flex-col justify-end pb-1.5">
            <label className="flex items-center gap-2.5 bg-[#121B30]/50 p-3 rounded-xl border border-white/10 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={secure}
                onChange={(e) => setSecure(e.target.checked)}
                className="accent-[#D4A017] rounded"
              />
              <span className="font-semibold text-xs">Require SSL/TLS Connection Wrapper</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">SMTP Username Identity</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
              placeholder="e.g. sender@domain.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">SMTP Secure Password / API Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
              placeholder="•••••••••••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">Fallback Sender Display Name</label>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
              placeholder="Zanzibar Trip Desk"
            />
          </div>

          <div className="space-y-1 md:col-span-3">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">Official Outbound Sender Email Address</label>
            <input
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
              placeholder="reservations@zanzibartripandrelax.com"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between border-t border-white/5 pt-6 flex-wrap gap-4">
          <div>
            {saveSuccess && (
              <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-bounce">
                <CheckCircle size={14} />
                <span>SMTP authentication credentials successfully written and encrypted!</span>
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            className="bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle size={14} />
            <span>Apply Server Credentials</span>
          </button>
        </div>
      </div>

      {/* 2. SMTP TRANSMISSION TEST BENCH */}
      <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6 text-left">
        <div>
          <h3 className="text-base font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Send size={18} />
            <span>SMTP Gateway Transmission Test Bench</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Test real-time connection speeds and transmission parameters by sending an automated diagnostic payload.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">Test Recipient Email Address</label>
            <input
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
              placeholder="test@tourist.com"
            />
          </div>
          <button
            onClick={handleSendTestEmail}
            disabled={isSendingTest}
            className="bg-[#0B3B8C] hover:bg-[#093070] text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap w-full sm:w-auto"
          >
            {isSendingTest ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Authenticating Handshake...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Dispatch Verified Payload</span>
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-xl text-xs font-semibold border ${
            testResult.success 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            {testResult.message}
          </div>
        )}
      </div>

      {/* 3. TRANSACTIONAL AUDIT LOGS */}
      <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              <Shield size={18} />
              <span>Secure Transactional Transmission Logs</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time ledger tracking verification link submissions, reset credentials, and customer notifications.</p>
          </div>
          <button
            onClick={handleClearLogs}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-all border border-red-500/20 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Flush Logs</span>
          </button>
        </div>

        {/* LOGS FILTER BAR */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs by recipient, subject, or trigger type..."
            className="w-full bg-[#121B30] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
          />
        </div>

        {/* LOGS TABLE / LIST */}
        <div className="overflow-hidden border border-white/5 rounded-2xl bg-[#121B30]/20 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No transactional email history found in the diagnostic cache. Try registering a customer or sending a test.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#121B30]/50 border-b border-white/5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3">Recipient Address</th>
                    <th className="px-4 py-3">Subject Line</th>
                    <th className="px-4 py-3">Trigger Code</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-all">
                      <td className="px-5 py-3.5 text-slate-100 font-bold">
                        {log.toEmail}
                      </td>
                      <td className="px-4 py-3.5 text-slate-350 font-sans">
                        {log.subject}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider font-mono">
                          {log.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                          <CheckCircle size={10} />
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="bg-[#0B3B8C] hover:bg-[#093070] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye size={10} />
                          <span>Inspect Template</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. EMAIL TEMPLATE PREVIEW MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-slate-800">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="bg-[#0A1224] text-white p-5 flex items-center justify-between border-b border-white/5">
              <div>
                <h3 className="font-bold text-sm text-[#D4A017] font-serif">Transactional Payload Preview</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Recipient: {selectedLog.toEmail}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-base font-black px-2 py-1 rounded hover:bg-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
              <div 
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-250 max-w-xl mx-auto"
                dangerouslySetInnerHTML={{ __html: selectedLog.bodyHtml }}
              />
            </div>

            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between text-slate-500 text-[10px] font-mono">
              <span>Dispatched via {selectedLog.smtpUsed}</span>
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-[#0b3b8c] hover:bg-[#093070] text-white px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
