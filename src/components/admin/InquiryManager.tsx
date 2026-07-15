import React from 'react';
import { Mail, Trash2, Search, MessageSquare } from 'lucide-react';
import { AdminDataTable } from '../AdminDataTable';
import { supabase } from '../../lib/supabase';

interface InquiryManagerProps {
  inquiriesList: any[];
  inquiriesLoading: boolean;
  loadInquiries: () => Promise<void>;
}

export default function InquiryManager({ inquiriesList, inquiriesLoading, loadInquiries }: InquiryManagerProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0A1224] border border-white/5 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Contact Form Submissions</span>
          <p className="text-3xl font-black text-white">{inquiriesList.length}</p>
          <div className="text-[10px] text-slate-500 font-medium">Direct inquiries from the website contact form</div>
        </div>
        <div className="bg-[#0A1224] border border-white/5 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Latest Submission</span>
          <p className="text-sm font-bold text-[#D4A017]">
            {inquiriesList[0]?.created_at ? new Date(inquiriesList[0].created_at).toLocaleString() : 'No submissions yet'}
          </p>
          <div className="text-[10px] text-slate-500 font-medium">{inquiriesList[0]?.full_name || 'N/A'} - {inquiriesList[0]?.subject || 'N/A'}</div>
        </div>
      </div>

      <div className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden">
        <AdminDataTable<any>
          data={inquiriesList}
          loading={inquiriesLoading}
          columns={[
            {
              header: 'Contact Info',
              key: 'full_name',
              render: (i) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{i.full_name}</div>
                    <div className="text-[10px] text-slate-400">{i.email}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{i.phone}</div>
                  </div>
                </div>
              ),
            },
            {
              header: 'Subject & Message',
              key: 'subject',
              render: (i) => (
                <div className="max-w-md">
                  <div className="font-bold text-[#D4A017] text-xs uppercase tracking-wider">{i.subject}</div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 italic">"{i.message}"</p>
                </div>
              ),
            },
            {
              header: 'Date Received',
              key: 'created_at',
              render: (i) => (
                <div className="text-xs text-slate-400 font-mono">
                  {new Date(i.created_at).toLocaleString()}
                </div>
              ),
            },
            {
              header: 'Actions',
              key: 'actions',
              render: (i) => (
                <div className="flex gap-2">
                  <a 
                    href={`mailto:${i.email}?subject=Re: ${i.subject}`}
                    className="bg-[#0B3B8C] hover:bg-[#082E6E] text-white p-2.5 rounded-xl transition-all shadow-sm"
                    title="Reply via Email"
                  >
                    <Mail size={14} />
                  </a>
                  <button 
                    onClick={() => {
                      if (confirm('Delete this inquiry?')) {
                        supabase.from('contact_submissions').delete().eq('id', i.id).then(() => loadInquiries());
                      }
                    }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 p-2.5 rounded-xl transition-all"
                    title="Delete Inquiry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            }
          ]}
          searchKeys={['full_name', 'email', 'subject', 'message']}
          searchPlaceholder="Search inquiries..."
          csvFilename="Zanzibar_Trip_Relax_Inquiries.csv"
        />
      </div>
    </div>
  );
}
