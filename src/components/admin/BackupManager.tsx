import React from 'react';
import { Download, Upload, Database, AlertCircle, RefreshCw } from 'lucide-react';
import { addActivityLog } from '../../lib/cmsStore';
import { safeLocalStorage, migrateLocalStorage } from '../../lib/safeStorage';

interface BackupManagerProps {
  session: any;
}

export default function BackupManager({ session }: BackupManagerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>System Backups</h2>
        <p className="text-xs text-slate-400">Generate full snapshots of your website and dynamic databases or restore previous files</p>
      </div>

      <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center text-[#D4A017]">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">Database Snapshot Export</h3>
              <p className="text-xs text-slate-400">Produces a single JSON package containing all local bookings, CMS settings, and user logs.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const data: Record<string, string | null> = {};
              for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.startsWith('ztr_') || k.startsWith('site_') || k === 'packages')) {
                  data[k] = localStorage.getItem(k);
                }
              }
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
              const dl = document.createElement('a');
              dl.setAttribute("href", dataStr);
              dl.setAttribute("download", `zanzibar_backup_${Date.now()}.json`);
              dl.click();
              addActivityLog(session?.name || 'Owner', 'backupManual', 'Downloaded complete manual JSON system database backup.');
              alert('Snapshot backup generated and triggered for download!');
            }}
            className="flex items-center gap-2 bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-xs font-bold py-2.5 px-6 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Download size={16} />
            Generate & Download Full Backup
          </button>
        </div>

        <div className="border-t border-white/5 pt-6 space-y-4">
          <div className="flex items-center gap-2 text-[#D4A017]">
            <AlertCircle size={16} />
            <h4 className="text-sm font-bold uppercase tracking-wider">Restore System Backup</h4>
          </div>
          
          <div className="p-8 bg-[#121B30]/50 border border-white/10 border-dashed rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Upload size={32} />
            </div>
            <div>
              <span className="text-slate-200 text-sm font-bold block">Upload System Configuration</span>
              <span className="text-slate-400 text-xs block mt-1">Select previous Zanzibar system backup file (.json) to restore complete portal configuration</span>
            </div>
            
            <input 
              type="file" 
              accept=".json"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const r = new FileReader();
                r.onload = ev => {
                  try {
                    const parsed = JSON.parse(ev.target?.result as string);
                    if (confirm('Are you sure you want to restore? This will replace ALL existing settings with the backup content.')) {
                      Object.keys(parsed).forEach(k => {
                        if (parsed[k]) safeLocalStorage.setItem(k, parsed[k]);
                      });
                      migrateLocalStorage();
                      addActivityLog(session?.name || 'Owner', 'backupRestore', 'Restored complete database configuration backup.');
                      alert('System successfully restored from backup snapshot!');
                      window.location.reload();
                    }
                  } catch (err) {
                    alert('Invalid JSON backup file.');
                  }
                };
                r.readAsText(file);
              }}
              className="text-xs text-slate-300 bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer mx-auto block hover:bg-white/10 transition-all"
            />
            
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 inline-flex items-center gap-2 max-w-md">
              <AlertCircle className="text-amber-400 shrink-0" size={14} />
              <p className="text-[10px] text-amber-200 text-left">
                <strong>CRITICAL:</strong> Restoring will overwrite all current bookings, users, and CMS configurations. We recommend generating a fresh backup before performing a restore.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
