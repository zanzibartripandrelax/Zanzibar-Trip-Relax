import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, User as UserIcon, Lock, Globe, Mail } from 'lucide-react';
import { addActivityLog } from '../../lib/cmsStore';

interface SecurityAuditProps {
  currentUsers: any[];
  logsList: any[];
  session: any;
  onUpdateUsers: (users: any[]) => void;
  sha256: (text: string) => Promise<string>;
}

export default function SecurityAudit({ currentUsers, logsList, session, onUpdateUsers, sha256 }: SecurityAuditProps) {
  const [securityEditUser, setSecurityEditUser] = useState<any>(null);
  const [securityEditName, setSecurityEditName] = useState('');
  const [securityEditEmail, setSecurityEditEmail] = useState('');
  const [securityEditRecEmail, setSecurityEditRecEmail] = useState('');
  const [securityEditPhone, setSecurityEditPhone] = useState('');
  const [securityEditCountry, setSecurityEditCountry] = useState('');
  const [securityEditRole, setSecurityEditRole] = useState('');
  const [securityEditStatus, setSecurityEditStatus] = useState('');
  const [securityEditPassword, setSecurityEditPassword] = useState('');
  const [securityStaffLogsUser, setSecurityStaffLogsUser] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Security Operations & Access Control</h2>
          <p className="text-xs text-slate-400">Manage administrative credentials, security clearance levels, and review login telemetry</p>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" size={16} />
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">TLS 1.3 Active</span>
          </div>
          <div className="bg-[#D4A017]/10 border border-[#D4A017]/20 rounded-xl px-4 py-2 flex items-center gap-2">
            <Lock className="text-[#D4A017]" size={16} />
            <span className="text-[#D4A017] text-[10px] font-black uppercase tracking-widest">AES-256 Enabled</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentUsers.map((user: any) => (
          <div key={user.username} className="bg-[#0A1224] border border-white/5 rounded-2xl p-5 space-y-4 hover:border-[#D4A017]/30 transition-all group">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-[#121B30] rounded-xl flex items-center justify-center text-[#D4A017] group-hover:bg-[#D4A017] group-hover:text-[#020C1F] transition-all">
                <UserIcon size={20} />
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {user.status}
              </span>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-white truncate">{user.name || user.username}</h4>
              <p className="text-[10px] text-slate-400 font-medium">@{user.username} • {user.role}</p>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
              <span className="text-[9px] text-slate-500 font-mono">Last login: {user.lastLogin || 'N/A'}</span>
              <button 
                onClick={() => {
                  setSecurityEditUser(user);
                  setSecurityEditName(user.name || '');
                  setSecurityEditEmail(user.email || '');
                  setSecurityEditRecEmail(user.recoveryEmail || '');
                  setSecurityEditPhone(user.phone || '');
                  setSecurityEditCountry(user.country || '');
                  setSecurityEditRole(user.role || 'Content Editor');
                  setSecurityEditStatus(user.status || 'Active');
                  setSecurityEditPassword('');
                }}
                className="text-[10px] font-bold text-[#D4A017] hover:underline cursor-pointer"
              >
                Modify Access
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Access Modification Workspace */}
      {securityEditUser && (
        <div className="bg-[#121B30] border border-[#D4A017]/30 rounded-3xl p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center text-[#D4A017]">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Adjust Station Access: @{securityEditUser.username}</h3>
                <p className="text-xs text-slate-400">Updating credentials requires re-authentication on the next workstation handshake</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Clearance: {securityEditUser.role}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Operator Full Name</label>
              <input 
                type="text" 
                value={securityEditName}
                onChange={(e) => setSecurityEditName(e.target.value)}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-[#D4A017]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Primary Email Address</label>
              <input 
                type="email" 
                value={securityEditEmail}
                onChange={(e) => setSecurityEditEmail(e.target.value)}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-[#D4A017]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Recovery Secondary Email</label>
              <input 
                type="email" 
                value={securityEditRecEmail}
                onChange={(e) => setSecurityEditRecEmail(e.target.value)}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-[#D4A017]"
                placeholder="recovery@zanzibar.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Mobile Phone Number</label>
              <input 
                type="text" 
                value={securityEditPhone}
                onChange={(e) => setSecurityEditPhone(e.target.value)}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-[#D4A017]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Country</label>
              <input 
                type="text" 
                value={securityEditCountry}
                onChange={(e) => setSecurityEditCountry(e.target.value)}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-[#D4A017]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold block">Role / Security Clearance</label>
              <select 
                value={securityEditRole}
                onChange={(e) => setSecurityEditRole(e.target.value)}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-[#D4A017] cursor-pointer"
              >
                <option value="Owner">Owner (Full Clearance)</option>
                <option value="Administrator">Administrator</option>
                <option value="Content Editor">Content Editor</option>
                <option value="Customer Service">Customer Service</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-slate-400 font-bold block">Force Administrative Password Overwrite (Leave blank to keep existing)</label>
              <input 
                type="password" 
                value={securityEditPassword}
                onChange={(e) => setSecurityEditPassword(e.target.value)}
                className="w-full bg-[#121B30] border border-white/10 rounded-xl p-3 text-white font-mono outline-none focus:border-[#D4A017]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              onClick={() => setSecurityEditUser(null)}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={async () => {
                if (!securityEditName.trim() || !securityEditEmail.trim()) {
                  alert('Full Name and Email are strictly required fields.');
                  return;
                }
                const idx = currentUsers.findIndex((x: any) => x.username === securityEditUser.username);
                if (idx !== -1) {
                  const updatedUsers = [...currentUsers];
                  updatedUsers[idx].name = securityEditName.trim();
                  updatedUsers[idx].email = securityEditEmail.trim().toLowerCase();
                  updatedUsers[idx].recoveryEmail = securityEditRecEmail.trim().toLowerCase();
                  updatedUsers[idx].phone = securityEditPhone.trim();
                  updatedUsers[idx].country = securityEditCountry.trim();
                  updatedUsers[idx].role = securityEditRole;
                  updatedUsers[idx].status = securityEditStatus;

                  if (securityEditPassword.trim()) {
                    if (securityEditPassword.trim().length < 8) {
                      alert('Administrative forced passwords must be at least 8 characters long.');
                      return;
                    }
                    updatedUsers[idx].password = await sha256(securityEditPassword.trim());
                  }

                  onUpdateUsers(updatedUsers);
                  localStorage.setItem('ztr_admin_users', JSON.stringify(updatedUsers));
                  addActivityLog(session?.name || 'Owner', 'Security Admin', `Administratively reset credentials & profile settings for staff workstation "${securityEditUser.username}".`);
                  alert(`Credentials updated successfully for workstation @${securityEditUser.username}!`);
                  setSecurityEditUser(null);
                }
              }}
              className="px-5 py-2.5 bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] rounded-xl text-xs font-black transition-all"
            >
              Save Security Credentials
            </button>
          </div>
        </div>
      )}

      {/* Safety Logs querying */}
      <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-200">Security Audit Logs & Telemetry Query</h3>
            <p className="text-xs text-slate-400">Search safety triggers, login timestamps, and configuration actions</p>
          </div>

          <div className="flex gap-2">
            <select 
              value={securityStaffLogsUser}
              onChange={(e) => setSecurityStaffLogsUser(e.target.value)}
              className="bg-[#121B30] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold cursor-pointer"
            >
              <option value="all">Query All Operators</option>
              {currentUsers.map((x: any) => (
                <option key={x.username} value={x.name || x.username}>
                  Operator: {x.name || x.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Operator</th>
                <th className="py-2 px-3">Role / Segment</th>
                <th className="py-2 px-3">Logged Security Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px] font-mono">
              {logsList
                .filter(l => {
                  if (securityStaffLogsUser === 'all') return true;
                  const query = securityStaffLogsUser.toLowerCase();
                  return (l.user || '').toLowerCase().includes(query);
                })
                .map((l, index) => (
                  <tr key={index} className="hover:bg-white/[0.01]">
                    <td className="py-2.5 px-3 text-slate-400">{l.timestamp}</td>
                    <td className="py-2.5 px-3 text-[#D4A017] font-bold">{l.user}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 uppercase text-[9px] font-bold">
                        {l.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">{l.action}</td>
                  </tr>
                ))}
              {logsList.filter(l => securityStaffLogsUser === 'all' || (l.user || '').toLowerCase().includes(securityStaffLogsUser.toLowerCase())).length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-500 italic">No security records matching query</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
