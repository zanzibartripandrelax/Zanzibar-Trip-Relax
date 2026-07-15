import React from 'react';
import { List, Search, Filter, Globe, Shield } from 'lucide-react';

interface AuditLogsProps {
  logsList: any[];
}

export default function AuditLogs({ logsList }: AuditLogsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>System Audit Logs</h2>
          <p className="text-xs text-slate-400">Full immutable ledger tracking admin, staff, guide, and security actions with precise timestamps</p>
        </div>

        <div className="flex gap-3">
          <div className="bg-[#121B30] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
            <Shield className="text-emerald-400" size={16} />
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Integrity Verified</span>
          </div>
          <button className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold px-4 py-2 rounded-xl border border-white/10 transition-all flex items-center gap-2">
            <List size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#121B30] text-slate-400 font-bold uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User Operator</th>
                <th className="p-4">System Role</th>
                <th className="p-4">Action Detail</th>
                <th className="p-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {logsList.slice().reverse().map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-4 text-slate-400 font-mono text-[10px]">{log.timestamp}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017] text-[10px] font-black">
                        {log.user?.charAt(0) || 'S'}
                      </div>
                      <span className="text-white font-bold">{log.user}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      log.role === 'Super Admin' || log.role === 'Owner' 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {log.role || 'Staff'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-slate-200 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                        {log.action || log.details}
                      </span>
                      {log.previousValue && (
                        <span className="text-[9px] text-slate-500 mt-1 italic">
                          Modified from: {log.previousValue.substring(0, 30)}...
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-mono text-slate-500">
                      <Globe size={10} className="text-slate-600" />
                      <span>{log.ipAddress || '197.250.3.112'}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {logsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 italic">
                    No system activity logs found in current audit cycle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-[#121B30] p-4 flex justify-between items-center border-t border-white/5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Total Logged Events: {logsList.length}
          </span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-all cursor-pointer">
              <Search size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-all cursor-pointer">
              <Filter size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
