import React, { useState, useEffect } from 'react';
import { 
  Mail, Users as ContactIcon, FileSpreadsheet, HardDrive, Calendar, 
  Video, Send, Plus, CheckCircle2, AlertCircle, RefreshCw, LogOut, 
  Sparkles, ExternalLink, Download
} from 'lucide-react';
import { 
  googleSignIn, googleSignOut, initWorkspaceAuth, getAccessToken,
  sendGmailEmail, listGmailMessages,
  listGoogleContacts, createGoogleContact,
  createGoogleSpreadsheet, appendToGoogleSheet,
  listGoogleDriveFiles, uploadToGoogleDrive,
  listGoogleCalendarEvents, createGoogleCalendarEvent
} from '../../lib/googleWorkspace';
import { showToast } from '../ToastNotification';

export default function GoogleWorkspaceManager() {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'gmail' | 'contacts' | 'sheets' | 'drive' | 'calendar'>('gmail');
  const [loading, setLoading] = useState(false);

  // Form States
  // Gmail
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [messagesList, setMessagesList] = useState<any[]>([]);

  // Contacts
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactsList, setContactsList] = useState<any[]>([]);

  // Sheets
  const [sheetTitle, setSheetTitle] = useState('Zanzibar Trip & Relax - Bookings Log');
  const [createdSheetId, setCreatedSheetId] = useState('');

  // Drive
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [uploadFileName, setUploadFileName] = useState('Voucher_Confirmation.pdf');

  // Calendar & Meet
  const [eventTitle, setEventTitle] = useState('Zanzibar Tour Pickup - Safari Blue');
  const [eventDesc, setEventDesc] = useState('Guest pickup at Stone Town Ferry Terminal with Toyota Minivan.');
  const [eventStart, setEventStart] = useState(new Date().toISOString().slice(0, 16));
  const [createMeetLink, setCreateMeetLink] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = initWorkspaceAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        showToast('Successfully connected to Google Workspace!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to connect Google Workspace', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setToken(null);
    showToast('Disconnected from Google Workspace', 'info');
  };

  // Gmail Actions
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo || !emailSubject || !emailBody) {
      showToast('Please fill all email fields', 'error');
      return;
    }
    try {
      setLoading(true);
      await sendGmailEmail({ to: emailTo, subject: emailSubject, body: emailBody });
      showToast('Email sent via Gmail successfully!', 'success');
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
    } catch (err: any) {
      showToast(err.message || 'Failed to send Gmail email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchGmail = async () => {
    try {
      setLoading(true);
      const res = await listGmailMessages(5);
      setMessagesList(res.messages || []);
      showToast(`Fetched ${res.messages?.length || 0} Gmail messages`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch Gmail messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Contacts Actions
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName) {
      showToast('Contact name is required', 'error');
      return;
    }
    try {
      setLoading(true);
      await createGoogleContact({ name: contactName, email: contactEmail, phone: contactPhone });
      showToast('Contact created in Google Contacts!', 'success');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      handleFetchContacts();
    } catch (err: any) {
      showToast(err.message || 'Failed to create Google Contact', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchContacts = async () => {
    try {
      setLoading(true);
      const res = await listGoogleContacts();
      setContactsList(res.connections || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to list contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sheets Actions
  const handleCreateSheet = async () => {
    try {
      setLoading(true);
      const res = await createGoogleSpreadsheet(sheetTitle);
      setCreatedSheetId(res.spreadsheetId);
      showToast('Created Google Sheet spreadsheet!', 'success');

      // Append header row
      await appendToGoogleSheet(res.spreadsheetId, 'Sheet1!A1', [
        ['Booking Reference', 'Customer Name', 'Phone / WhatsApp', 'Service', 'Date', 'Status', 'Total Price ($)']
      ]);
    } catch (err: any) {
      showToast(err.message || 'Failed to create Google Sheet', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Drive Actions
  const handleFetchDriveFiles = async () => {
    try {
      setLoading(true);
      const res = await listGoogleDriveFiles();
      setDriveFiles(res.files || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to list Drive files', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDriveSample = async () => {
    try {
      setLoading(true);
      const sampleText = `Zanzibar Trip & Relax - Booking Document\nDate: ${new Date().toLocaleString()}\nRef: ZTR-${Math.floor(100000 + Math.random()*900000)}`;
      await uploadToGoogleDrive(uploadFileName, 'text/plain', sampleText);
      showToast('Sample file uploaded to Google Drive!', 'success');
      handleFetchDriveFiles();
    } catch (err: any) {
      showToast(err.message || 'Failed to upload to Google Drive', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calendar & Meet Actions
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const startDate = new Date(eventStart);
      const endDate = new Date(startDate.getTime() + 2 * 3600 * 1000);

      const res = await createGoogleCalendarEvent({
        summary: eventTitle,
        description: eventDesc,
        startIso: startDate.toISOString(),
        endIso: endDate.toISOString(),
        createMeet: createMeetLink
      });

      showToast('Created Google Calendar event with Meet link!', 'success');
      handleFetchEvents();
    } catch (err: any) {
      showToast(err.message || 'Failed to create Google Calendar event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchEvents = async () => {
    try {
      setLoading(true);
      const res = await listGoogleCalendarEvents();
      setCalendarEvents(res.items || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch calendar events', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0A1224] text-slate-100 rounded-3xl p-6 border border-white/10 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#121B30] p-5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#D4A017]/10 text-[#D4A017] rounded-xl border border-[#D4A017]/20">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span>Google Workspace Suite Integration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gmail • Google Contacts • Google Sheets • Google Drive • Google Calendar • Google Meet
            </p>
          </div>
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-3 bg-slate-900/60 p-2 pl-3 rounded-xl border border-white/10">
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-200">{user.displayName || user.email}</span>
                <span className="block text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={10} /> Connected
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                title="Disconnect Workspace"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="gsi-material-button hover:scale-102 transition-transform cursor-pointer"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">Sign in with Google</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto gap-2 pb-2 scrollbar-none">
        {[
          { id: 'gmail', label: 'Gmail', icon: Mail },
          { id: 'contacts', label: 'Contacts', icon: ContactIcon },
          { id: 'sheets', label: 'Google Sheets', icon: FileSpreadsheet },
          { id: 'drive', label: 'Google Drive', icon: HardDrive },
          { id: 'calendar', label: 'Calendar & Meet', icon: Calendar },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-[#0B3B8C] text-white shadow-md' 
                  : 'bg-[#121B30] text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {!user ? (
        <div className="p-12 text-center bg-[#121B30]/40 rounded-2xl border border-white/5 space-y-3">
          <Sparkles className="mx-auto text-[#D4A017] animate-pulse" size={32} />
          <h3 className="font-bold text-slate-200 text-sm">Google Workspace Integration Inactive</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "Sign in with Google" above to authorize access to send emails, sync contacts, export bookings to Sheets, upload files to Drive, and schedule Calendar meetings.
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* 1. GMAIL TAB */}
          {activeSubTab === 'gmail' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={handleSendEmail} className="bg-[#121B30] p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-[#D4A017] flex items-center gap-2">
                  <Send size={16} /> Send Booking Confirmation Email
                </h3>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Booking Confirmation - Zanzibar Trip & Relax"
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">HTML Message Body</label>
                  <textarea
                    rows={4}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="<p>Dear Guest, your Zanzibar Safari Blue tour is confirmed!</p>"
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017] resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0B3B8C] hover:bg-[#082d6b] text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={14} /> Send Email via Gmail API
                </button>
              </form>

              <div className="bg-[#121B30] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-[#D4A017]">Recent Messages</h3>
                  <button
                    onClick={handleFetchGmail}
                    disabled={loading}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    <span>Fetch Recent</span>
                  </button>
                </div>
                {messagesList.length > 0 ? (
                  <div className="space-y-2">
                    {messagesList.map((msg, i) => (
                      <div key={i} className="p-3 bg-[#0A1224] rounded-xl border border-white/5 text-xs">
                        <span className="font-mono text-[10px] text-slate-400 block">Message ID: {msg.id}</span>
                        <span className="text-slate-300">Thread ID: {msg.threadId}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Click "Fetch Recent" to list messages from your connected inbox.</p>
                )}
              </div>
            </div>
          )}

          {/* 2. CONTACTS TAB */}
          {activeSubTab === 'contacts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={handleCreateContact} className="bg-[#121B30] p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-[#D4A017] flex items-center gap-2">
                  <Plus size={16} /> Add Customer to Google Contacts
                </h3>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. David Miller"
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="david@example.com"
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+255 770 000 000"
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0B3B8C] hover:bg-[#082d6b] text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={14} /> Save Contact
                </button>
              </form>

              <div className="bg-[#121B30] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-[#D4A017]">Google Contacts List</h3>
                  <button
                    onClick={handleFetchContacts}
                    disabled={loading}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    <span>Sync Contacts</span>
                  </button>
                </div>
                {contactsList.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {contactsList.map((c, i) => (
                      <div key={i} className="p-3 bg-[#0A1224] rounded-xl border border-white/5 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-200 block">{c.names?.[0]?.displayName || 'Unnamed Contact'}</span>
                          <span className="text-[10px] text-slate-400">{c.emailAddresses?.[0]?.value || 'No email'}</span>
                        </div>
                        <span className="text-[10px] text-[#D4A017] font-mono">{c.phoneNumbers?.[0]?.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Click "Sync Contacts" to pull customer contacts from Google People API.</p>
                )}
              </div>
            </div>
          )}

          {/* 3. SHEETS TAB */}
          {activeSubTab === 'sheets' && (
            <div className="bg-[#121B30] p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-[#D4A017] flex items-center gap-2">
                <FileSpreadsheet size={18} /> Export Platform Bookings to Google Sheets
              </h3>
              <p className="text-xs text-slate-400">
                Automatically generate a live synchronized Google Spreadsheet for Accountants & Reservation Officers.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  className="flex-1 bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                />
                <button
                  onClick={handleCreateSheet}
                  disabled={loading}
                  className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus size={14} /> Create Spreadsheet
                </button>
              </div>

              {createdSheetId && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs space-y-2">
                  <span className="font-bold block">Spreadsheet Created Successfully!</span>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${createdSheetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline font-bold"
                  >
                    <span>Open Spreadsheet in Google Sheets</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 4. DRIVE TAB */}
          {activeSubTab === 'drive' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#121B30] p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-[#D4A017] flex items-center gap-2">
                  <HardDrive size={16} /> Upload Vouchers & Attachments
                </h3>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Document Name</label>
                  <input
                    type="text"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
                <button
                  onClick={handleUploadDriveSample}
                  disabled={loading}
                  className="w-full bg-[#0B3B8C] hover:bg-[#082d6b] text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HardDrive size={14} /> Upload Voucher Document to Drive
                </button>
              </div>

              <div className="bg-[#121B30] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-[#D4A017]">Google Drive Storage</h3>
                  <button
                    onClick={handleFetchDriveFiles}
                    disabled={loading}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh Drive</span>
                  </button>
                </div>
                {driveFiles.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {driveFiles.map((f, i) => (
                      <div key={i} className="p-3 bg-[#0A1224] rounded-xl border border-white/5 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-200 block truncate max-w-[200px]">{f.name}</span>
                          <span className="text-[10px] text-slate-400">{f.mimeType}</span>
                        </div>
                        {f.webViewLink && (
                          <a href={f.webViewLink} target="_blank" rel="noreferrer" className="text-[#D4A017] hover:underline text-[10px] font-bold">
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Click "Refresh Drive" to list files in your Google Drive.</p>
                )}
              </div>
            </div>
          )}

          {/* 5. CALENDAR & MEET TAB */}
          {activeSubTab === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={handleCreateEvent} className="bg-[#121B30] p-5 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-[#D4A017] flex items-center gap-2">
                  <Calendar size={16} /> Schedule Tour & Create Google Meet
                </h3>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Event / Tour Title</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Description & Driver Notes</label>
                  <textarea
                    rows={2}
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017] resize-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="meetCheck"
                    checked={createMeetLink}
                    onChange={(e) => setCreateMeetLink(e.target.checked)}
                    className="rounded bg-[#0A1224] border-white/10 text-[#D4A017] focus:ring-0"
                  />
                  <label htmlFor="meetCheck" className="text-xs text-slate-300 font-bold flex items-center gap-1 cursor-pointer">
                    <Video size={14} className="text-emerald-400" /> Automatically generate Google Meet video call link
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0B3B8C] hover:bg-[#082d6b] text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar size={14} /> Schedule Calendar Event
                </button>
              </form>

              <div className="bg-[#121B30] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-[#D4A017]">Upcoming Calendar Events</h3>
                  <button
                    onClick={handleFetchEvents}
                    disabled={loading}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    <span>Sync Events</span>
                  </button>
                </div>
                {calendarEvents.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {calendarEvents.map((ev, i) => (
                      <div key={i} className="p-3 bg-[#0A1224] rounded-xl border border-white/5 text-xs space-y-1">
                        <span className="font-bold text-slate-200 block">{ev.summary}</span>
                        <span className="text-[10px] text-slate-400 block">{ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleString() : 'All day'}</span>
                        {ev.hangoutLink && (
                          <a href={ev.hangoutLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-400 hover:underline text-[10px] font-bold">
                            <Video size={10} /> Join Google Meet Call
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Click "Sync Events" to view upcoming bookings from your Google Calendar.</p>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
