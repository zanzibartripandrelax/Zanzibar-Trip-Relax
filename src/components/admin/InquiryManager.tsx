import React, { useState } from 'react';
import { Mail, Trash2, Search, MessageSquare, PhoneCall, ExternalLink, Filter } from 'lucide-react';
import { AdminDataTable } from '../AdminDataTable';
import { supabase } from '../../lib/supabase';

interface InquiryManagerProps {
  inquiriesList: any[];
  inquiriesLoading: boolean;
  loadInquiries: () => Promise<void>;
}

export function getInquirySource(i: any) {
  const cat = (i.category || i.source_page || '').toLowerCase();
  const subj = (i.subject || '').toLowerCase();
  const msg = (i.message || '').toLowerCase();

  if (cat.includes('package') || cat.includes('holiday') || subj.includes('package') || subj.includes('holiday') || msg.includes('holiday package') || msg.includes('plan my holiday')) {
    return { id: 'holiday', label: 'Holiday Package', icon: '🌴', badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  }
  if (cat.includes('safari') || subj.includes('safari') || msg.includes('circuit') || msg.includes('serengeti') || msg.includes('mikumi') || msg.includes('nyerere') || msg.includes('ngorongoro') || msg.includes('custom safari')) {
    return { id: 'safari', label: 'Safari Circuit', icon: '🦁', badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  }
  if (cat.includes('kilimanjaro') || cat.includes('trek') || subj.includes('kilimanjaro') || subj.includes('trek') || msg.includes('machame') || msg.includes('lemosho')) {
    return { id: 'kilimanjaro', label: 'Kilimanjaro Trek', icon: '🏔️', badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
  }
  if (cat.includes('transfer') || cat.includes('taxi') || subj.includes('transfer') || subj.includes('airport') || msg.includes('pickup') || msg.includes('shuttle')) {
    return { id: 'transfer', label: 'Airport Transfer', icon: '🚖', badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
  }
  if (cat.includes('hotel') || cat.includes('resort') || subj.includes('hotel') || subj.includes('villa')) {
    return { id: 'hotel', label: 'Hotel & Resort', icon: '🏨', badgeClass: 'bg-teal-500/15 text-teal-400 border-teal-500/30' };
  }
  if (cat.includes('tour') || cat.includes('excursion') || subj.includes('tour') || subj.includes('excursion') || msg.includes('prison island') || msg.includes('spice') || msg.includes('safari blue') || msg.includes('mnemba')) {
    return { id: 'tour', label: 'Tour / Excursion', icon: '🚤', badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
  }
  return { id: 'contact', label: 'General Contact', icon: '✉️', badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
}

export default function InquiryManager({ inquiriesList, inquiriesLoading, loadInquiries }: InquiryManagerProps) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Count breakdowns
  const counts = {
    all: inquiriesList.length,
    holiday: inquiriesList.filter(i => getInquirySource(i).id === 'holiday').length,
    safari: inquiriesList.filter(i => getInquirySource(i).id === 'safari').length,
    tour: inquiriesList.filter(i => getInquirySource(i).id === 'tour').length,
    kilimanjaro: inquiriesList.filter(i => getInquirySource(i).id === 'kilimanjaro').length,
    transfer: inquiriesList.filter(i => getInquirySource(i).id === 'transfer').length,
    contact: inquiriesList.filter(i => getInquirySource(i).id === 'contact').length,
  };

  const filteredInquiries = inquiriesList.filter(i => {
    if (activeCategoryFilter === 'all') return true;
    return getInquirySource(i).id === activeCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Category Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0A1224] border border-white/5 p-4 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Submissions</span>
          <p className="text-2xl font-black text-white">{counts.all}</p>
          <div className="text-[10px] text-slate-500 font-medium">All website inquiries</div>
        </div>
        <div className="bg-[#0A1224] border border-white/5 p-4 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">🌴 Holiday Packages</span>
          <p className="text-2xl font-black text-amber-400">{counts.holiday}</p>
          <div className="text-[10px] text-slate-500 font-medium">Custom holiday inquiries</div>
        </div>
        <div className="bg-[#0A1224] border border-white/5 p-4 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">🦁 Safaris</span>
          <p className="text-2xl font-black text-emerald-400">{counts.safari}</p>
          <div className="text-[10px] text-slate-500 font-medium">Mainland & fly-in safaris</div>
        </div>
        <div className="bg-[#0A1224] border border-white/5 p-4 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">🚤 Tours & Treks</span>
          <p className="text-2xl font-black text-cyan-400">{counts.tour + counts.kilimanjaro}</p>
          <div className="text-[10px] text-slate-500 font-medium">Excursions & Kili treks</div>
        </div>
      </div>

      {/* Source Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0A1224] border border-white/5 p-3 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 px-2 mr-2">
          <Filter size={14} className="text-[#D4A017]" />
          <span>Source Origin:</span>
        </div>
        {[
          { id: 'all', label: 'All Origins', count: counts.all, icon: '✨' },
          { id: 'holiday', label: 'Holiday Packages', count: counts.holiday, icon: '🌴' },
          { id: 'safari', label: 'Safaris', count: counts.safari, icon: '🦁' },
          { id: 'tour', label: 'Tours & Excursions', count: counts.tour, icon: '🚤' },
          { id: 'kilimanjaro', label: 'Kilimanjaro', count: counts.kilimanjaro, icon: '🏔️' },
          { id: 'transfer', label: 'Transfers', count: counts.transfer, icon: '🚖' },
          { id: 'contact', label: 'General', count: counts.contact, icon: '✉️' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategoryFilter === tab.id
                ? 'bg-[#D4A017] text-[#0A1224] shadow-md font-black'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeCategoryFilter === tab.id ? 'bg-[#0A1224]/20 text-[#0A1224]' : 'bg-white/10 text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden">
        <AdminDataTable<any>
          data={filteredInquiries}
          loading={inquiriesLoading}
          columns={[
            {
              header: 'Source Origin',
              key: 'source',
              render: (i) => {
                const src = getInquirySource(i);
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border ${src.badgeClass}`}>
                    <span>{src.icon}</span>
                    <span>{src.label}</span>
                  </span>
                );
              }
            },
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
                <div className="max-w-md space-y-1">
                  <div className="font-bold text-[#D4A017] text-xs uppercase tracking-wider flex items-center gap-1">
                    <span>{i.subject}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-3 italic bg-white/5 p-2 rounded-xl border border-white/5 font-sans">
                    "{i.message}"
                  </p>
                </div>
              ),
            },
            {
              header: 'Date Received',
              key: 'created_at',
              render: (i) => (
                <div className="text-xs text-slate-400 font-mono">
                  {i.created_at ? new Date(i.created_at).toLocaleString() : 'Recent'}
                </div>
              ),
            },
            {
              header: 'Quick Reply Actions',
              key: 'actions',
              render: (i) => {
                const cleanPhone = (i.phone || '').replace(/[^0-9]/g, '');
                const waUrl = cleanPhone 
                  ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Jambo ${i.full_name}, thank you for reaching out to Zanzibar Trip Relax regarding your ${i.subject || 'inquiry'}. How can we assist you today?`)}`
                  : null;

                return (
                  <div className="flex items-center gap-2">
                    {waUrl && (
                      <a 
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1 text-xs font-bold"
                        title="Chat on WhatsApp"
                      >
                        <PhoneCall size={14} />
                        <span>WhatsApp</span>
                      </a>
                    )}
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
                          Promise.resolve(supabase.from('contact_submissions').delete().eq('id', i.id))
                            .then(() => loadInquiries())
                            .catch((err) => {
                              console.warn('Could not delete contact submission from Supabase:', err);
                              alert('Could not delete contact submission from Supabase (using local fallback)');
                            });
                        }
                      }}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 p-2.5 rounded-xl transition-all"
                      title="Delete Inquiry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              }
            }
          ]}
          searchKeys={['full_name', 'email', 'phone', 'subject', 'message']}
          searchPlaceholder="Search inquiries by name, phone, message or subject..."
          csvFilename="Zanzibar_Trip_Relax_Inquiries.csv"
        />
      </div>
    </div>
  );
}
