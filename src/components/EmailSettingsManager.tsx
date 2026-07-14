import React, { useState, useEffect } from 'react';
import { Mail, Shield, CheckCircle, RefreshCw, Trash2, Search, Eye, Send, Phone, MessageSquare, AlertCircle } from 'lucide-react';

export interface SmtpConfig {
  provider: 'gmail' | 'hostinger' | 'sendgrid' | 'resend' | 'custom';
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromEmail: string;
  fromName: string;
}

export interface SmsConfig {
  provider: 'twilio' | 'custom';
  accountSid: string;
  authToken: string;
  senderPhone: string;
  phoneCountryCode: string;
}

export interface ServerLog {
  id: string;
  timestamp: string;
  type: string;
  target: string;
  details: string;
  status: 'Success' | 'Failed';
  providerResponse?: string;
}

export default function EmailSettingsManager() {
  // SMTP settings
  const [emailProvider, setEmailProvider] = useState<SmtpConfig['provider']>('custom');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');

  // SMS settings
  const [smsProvider, setSmsProvider] = useState<'twilio' | 'custom'>('twilio');
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioSenderPhone, setTwilioSenderPhone] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+255');

  // Utility states
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [search, setSearch] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ServerLog | null>(null);

  // Test states
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isSendingTestSms, setIsSendingTestSms] = useState(false);
  const [testSmsRecipient, setTestSmsRecipient] = useState('');
  const [testSmsResult, setTestSmsResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Load Settings and Logs from Server
    loadSettings();
    loadLogs();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/notification-settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setEmailProvider(s.emailProvider || 'custom');
        setSmtpHost(s.smtpHost || '');
        setSmtpPort(Number(s.smtpPort) || 465);
        setSmtpSecure(s.smtpSecure === true || s.smtpSecure === 'true');
        setSmtpUser(s.smtpUser || '');
        setSmtpPass(s.smtpPass || '');
        setFromEmail(s.fromEmail || '');
        setFromName(s.fromName || '');

        setSmsProvider(s.smsProvider || 'twilio');
        setTwilioAccountSid(s.twilioAccountSid || '');
        setTwilioAuthToken(s.twilioAuthToken || '');
        setTwilioSenderPhone(s.twilioSenderPhone || '');
        setPhoneCountryCode(s.phoneCountryCode || '+255');
      }
    } catch (err: any) {
      console.error('Failed to retrieve notification settings:', err);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/notification/logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load transmission logs:', err);
    }
  };

  const handleProviderPreset = (selectedProvider: SmtpConfig['provider']) => {
    setEmailProvider(selectedProvider);
    if (selectedProvider === 'gmail') {
      setSmtpHost('smtp.gmail.com');
      setSmtpPort(465);
      setSmtpSecure(true);
    } else if (selectedProvider === 'hostinger') {
      setSmtpHost('smtp.hostinger.com');
      setSmtpPort(465);
      setSmtpSecure(true);
    } else if (selectedProvider === 'sendgrid') {
      setSmtpHost('smtp.sendgrid.net');
      setSmtpPort(587);
      setSmtpSecure(false);
    } else if (selectedProvider === 'resend') {
      setSmtpHost('smtp.resend.com');
      setSmtpPort(465);
      setSmtpSecure(true);
    }
  };

  const handleSave = async () => {
    setSaveSuccess(false);
    setSaveError(null);

    const payload = {
      emailProvider,
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpSecure,
      smtpUser,
      smtpPass,
      fromEmail,
      fromName,
      smsProvider,
      twilioAccountSid,
      twilioAuthToken,
      twilioSenderPhone,
      phoneCountryCode
    };

    try {
      const res = await fetch('/api/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        loadLogs();
        // Sync local storage as fallback for any legacy client-only templates
        localStorage.setItem('ztr_smtp_config', JSON.stringify({
          provider: emailProvider,
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          username: smtpUser,
          password: smtpPass,
          fromEmail,
          fromName
        }));
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.error || 'Server rejected settings write.');
      }
    } catch (err: any) {
      setSaveError('Network error: ' + err.message);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient.trim()) {
      setTestEmailResult({ success: false, message: 'Please provide a valid test recipient email address.' });
      return;
    }

    setIsSendingTestEmail(true);
    setTestEmailResult(null);

    const config = {
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      fromEmail,
      fromName
    };

    try {
      const res = await fetch('/api/notification/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, testRecipient: testEmailRecipient.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailResult({ success: true, message: data.message });
        setTestEmailRecipient('');
      } else {
        setTestEmailResult({ success: false, message: 'Transmission Failed: ' + data.error });
      }
    } catch (err: any) {
      setTestEmailResult({ success: false, message: 'Gateway unreachable: ' + err.message });
    } finally {
      setIsSendingTestEmail(false);
      loadLogs();
    }
  };

  const handleSendTestSms = async () => {
    if (!testSmsRecipient.trim()) {
      setTestSmsResult({ success: false, message: 'Please provide a valid test recipient phone number.' });
      return;
    }

    setIsSendingTestSms(true);
    setTestSmsResult(null);

    const config = {
      twilioAccountSid,
      twilioAuthToken,
      twilioSenderPhone,
      phoneCountryCode
    };

    try {
      const res = await fetch('/api/notification/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, testRecipient: testSmsRecipient.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setTestSmsResult({ success: true, message: data.message });
        setTestSmsRecipient('');
      } else {
        setTestSmsResult({ success: false, message: 'Transmission Failed: ' + data.error });
      }
    } catch (err: any) {
      setTestSmsResult({ success: false, message: 'Gateway unreachable: ' + err.message });
    } finally {
      setIsSendingTestSms(false);
      loadLogs();
    }
  };

  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to permanently flush the transactional email and SMS audit logs from the server?')) {
      try {
        const res = await fetch('/api/notification/logs/clear', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          setLogs([]);
        }
      } catch (err) {
        console.error('Failed to clear logs:', err);
      }
    }
  };

  const filteredLogs = logs.filter(log => 
    log.target.toLowerCase().includes(search.toLowerCase()) ||
    log.type.toLowerCase().includes(search.toLowerCase()) ||
    log.details.toLowerCase().includes(search.toLowerCase())
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
            Active Email Integration
          </span>
        </div>

        {/* PRESETS SELECTION */}
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
                  emailProvider === p.id 
                    ? 'border-[#D4A017] bg-[#121B30] text-[#D4A017] shadow-lg shadow-[#D4A017]/5' 
                    : 'border-white/5 bg-[#121B30]/30 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* SMTP CREDENTIALS FORM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">SMTP Host Address</label>
            <input
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
              placeholder="smtp.example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">Connection Port</label>
            <input
              type="number"
              value={smtpPort}
              onChange={(e) => setSmtpPort(Number(e.target.value))}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
              placeholder="465"
            />
          </div>

          <div className="space-y-1 flex flex-col justify-end pb-1.5">
            <label className="flex items-center gap-2.5 bg-[#121B30]/50 p-3 rounded-xl border border-white/10 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={smtpSecure}
                onChange={(e) => setSmtpSecure(e.target.checked)}
                className="accent-[#D4A017] rounded"
              />
              <span className="font-semibold text-xs">Require SSL/TLS Connection Wrapper</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">SMTP Username Identity</label>
            <input
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
              placeholder="e.g. sender@domain.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">SMTP Secure Password / API Key</label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
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
      </div>

      {/* 2. SMS / TELECOM GATEWAY PANEL */}
      <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6 text-left">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              <Phone size={18} />
              <span>SMS API Gateway Settings (Twilio)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Configure Twilio parameters to send secure numeric OTP verification codes to mobile terminals.</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[9px] bg-sky-500/15 text-sky-400 border border-sky-500/20 font-bold uppercase tracking-wider">
            Active SMS Integration
          </span>
        </div>

        {/* SMS CREDENTIALS FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">Twilio Account SID</label>
            <input
              type="text"
              value={twilioAccountSid}
              onChange={(e) => setTwilioAccountSid(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">Twilio Auth Token</label>
            <input
              type="password"
              value={twilioAuthToken}
              onChange={(e) => setTwilioAuthToken(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
              placeholder="••••••••••••••••••••••••••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">Twilio Registered Sender Phone Number</label>
            <input
              type="text"
              value={twilioSenderPhone}
              onChange={(e) => setTwilioSenderPhone(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
              placeholder="e.g. +14155552671"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-350 tracking-wider">Default Target Country Dialing Code</label>
            <input
              type="text"
              value={phoneCountryCode}
              onChange={(e) => setPhoneCountryCode(e.target.value)}
              className="w-full bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
              placeholder="e.g. +255 for Tanzania"
            />
          </div>
        </div>

        {/* MASTER ACTIONS */}
        <div className="flex items-center justify-between border-t border-white/5 pt-6 flex-wrap gap-4">
          <div>
            {saveSuccess && (
              <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-bounce">
                <CheckCircle size={14} />
                <span>SMTP & SMS settings saved successfully to server!</span>
              </div>
            )}
            {saveError && (
              <div className="text-red-400 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                <AlertCircle size={14} />
                <span>Error saving settings: {saveError}</span>
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

      {/* 3. DIAGNOSTIC TESTS (Email & SMS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EMAIL TEST */}
        <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-4 text-left">
          <div>
            <h3 className="text-sm font-bold text-[#D4A017] flex items-center gap-2">
              <Mail size={16} />
              <span>Email Transmission Test Bench</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Test real SMTP connection handshake by delivering a payload.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-450">Test Recipient Email Address</label>
              <input
                type="email"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
                placeholder="test-recipient@domain.com"
              />
            </div>
            <button
              onClick={handleSendTestEmail}
              disabled={isSendingTestEmail}
              className="bg-[#0B3B8C] hover:bg-[#093070] text-white font-bold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full disabled:opacity-50"
            >
              {isSendingTestEmail ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Handshaking SMTP...</span>
                </>
              ) : (
                <>
                  <Send size={12} />
                  <span>Transmit Diagnostic Email</span>
                </>
              )}
            </button>
            {testEmailResult && (
              <div className={`p-3 rounded-xl text-[11px] font-semibold border ${
                testEmailResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                  : 'bg-red-500/10 border-red-500/20 text-red-300'
              }`}>
                {testEmailResult.message}
              </div>
            )}
          </div>
        </div>

        {/* SMS TEST */}
        <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-4 text-left">
          <div>
            <h3 className="text-sm font-bold text-[#D4A017] flex items-center gap-2">
              <Phone size={16} />
              <span>SMS Transmission Test Bench</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Test real Twilio SMS gateway dispatch by delivering a code.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-slate-450">Test Recipient Phone (with country code)</label>
              <input
                type="text"
                value={testSmsRecipient}
                onChange={(e) => setTestSmsRecipient(e.target.value)}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
                placeholder="e.g. +255777123456"
              />
            </div>
            <button
              onClick={handleSendTestSms}
              disabled={isSendingTestSms}
              className="bg-[#0B3B8C] hover:bg-[#093070] text-white font-bold px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full disabled:opacity-50"
            >
              {isSendingTestSms ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Handshaking Twilio...</span>
                </>
              ) : (
                <>
                  <Send size={12} />
                  <span>Transmit Diagnostic SMS</span>
                </>
              )}
            </button>
            {testSmsResult && (
              <div className={`p-3 rounded-xl text-[11px] font-semibold border ${
                testSmsResult.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                  : 'bg-red-500/10 border-red-500/20 text-red-300'
              }`}>
                {testSmsResult.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. TRANSACTIONAL AUDIT LOGS */}
      <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              <Shield size={18} />
              <span>Server-Side Secure Transmission Audit Logs</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Real-time gateway transmission tracker detailing delivery statuses, provider responses, and verification attempts.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              className="text-slate-300 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-xl transition-all border border-white/10 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleClearLogs}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-all border border-red-500/20 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Flush Logs</span>
            </button>
          </div>
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
            placeholder="Search server audit logs by target address, action type, or provider logs..."
            className="w-full bg-[#121B30] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
          />
        </div>

        {/* LOGS TABLE / LIST */}
        <div className="overflow-hidden border border-white/5 rounded-2xl bg-[#121B30]/20 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No server audit logs matching search parameters or captured yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#121B30]/50 border-b border-white/5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3">Recipient/Target</th>
                    <th className="px-4 py-3">Log Details</th>
                    <th className="px-4 py-3">Event Type</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-all">
                      <td className="px-5 py-3.5 text-slate-100 font-bold max-w-[150px] truncate">
                        {log.target}
                      </td>
                      <td className="px-4 py-3.5 text-slate-350 font-sans max-w-[280px] truncate">
                        {log.details}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] border uppercase tracking-wider font-mono ${
                          log.type.includes('OTP') ? 'bg-blue-500/10 text-blue-400 border-blue-500/10' :
                          log.type.includes('VERIFICATION') ? 'bg-amber-500/10 text-amber-400 border-amber-500/10' :
                          'bg-slate-500/10 text-slate-400 border-white/5'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.status === 'Success' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' 
                            : 'bg-red-500/10 text-red-400 border-red-500/10'
                        }`}>
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
                          <span>Inspect Logs</span>
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

      {/* 5. LOG INSPECTION MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-slate-800">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="bg-[#0A1224] text-white p-5 flex items-center justify-between border-b border-white/5">
              <div>
                <h3 className="font-bold text-sm text-[#D4A017] font-serif">Server Payload Inspector</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Log Reference ID: {selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-base font-black px-2 py-1 rounded hover:bg-white/5 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-4 text-left">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Transmission Details</span>
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
                  <p className="text-xs text-slate-700"><strong>Target Recipient:</strong> {selectedLog.target}</p>
                  <p className="text-xs text-slate-700"><strong>Action Type:</strong> {selectedLog.type}</p>
                  <p className="text-xs text-slate-700"><strong>Logged Description:</strong> {selectedLog.details}</p>
                  <p className="text-xs text-slate-700"><strong>Transmission Status:</strong> <span className={selectedLog.status === 'Success' ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>{selectedLog.status}</span></p>
                  <p className="text-xs text-slate-400"><strong>Logged Timestamp:</strong> {new Date(selectedLog.timestamp).toUTCString()}</p>
                </div>
              </div>

              {selectedLog.providerResponse && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Raw Provider API Response</span>
                  <pre className="p-4 bg-slate-900 text-slate-300 font-mono text-[11px] rounded-xl overflow-x-auto whitespace-pre-wrap max-h-56">
                    {selectedLog.providerResponse}
                  </pre>
                </div>
              )}
            </div>

            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-[#0b3b8c] hover:bg-[#093070] text-white px-5 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
              >
                Dismiss Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
