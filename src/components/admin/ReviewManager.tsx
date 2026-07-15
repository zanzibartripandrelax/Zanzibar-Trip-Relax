import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, XCircle, Trash2, Shield, Search, Filter, MessageCircle, Globe } from 'lucide-react';
import { addActivityLog } from '../../lib/cmsStore';

interface ReviewManagerProps {
  session: any;
}

export default function ReviewManager({ session }: ReviewManagerProps) {
  const [reviews, setReviews] = useState<any[]>(() => {
    const cached = localStorage.getItem('ztr_guest_reviews');
    if (cached) return JSON.parse(cached);
    return [
      { id: 'rev-1', name: 'Sarah Jenkins', country: 'United Kingdom', rating: 5, comment: { en: 'Absolutely breathtaking! Our boat guide was so knowledgeable and knew exactly when to visit the sandbank to avoid the crowds.', sw: 'Inashangaza sana! Kiongozi wetu wa boti alikuwa na ujuzi mwingi.' }, date: 'June 2025', tour: { en: 'Safari Blue Ocean Cruise', sw: 'Safari ya Bahari ya Safari Blue' }, approved: true, reply: '' },
      { id: 'rev-2', name: 'David Müller', country: 'Germany', rating: 5, comment: { en: 'Highly professional local team. Handled our airport welcome, Stone Town heritage walk, and safari transfers with absolute punctuality.', sw: 'Timu ya kienyeji yenye weledi wa hali ya juu.' }, date: 'May 2025', tour: { en: 'Private Transfers & Stone Town', sw: 'Uhamisho wa Kibinafsi & Stone Town' }, approved: true, reply: 'Asante sana David! We are proud to serve you.' },
      { id: 'rev-3', name: 'Elena Rostova', country: 'Russia', rating: 4, comment: { en: 'The Jozani Forest walk was very beautiful. We saw many red colobus monkeys up close. Highly recommended for nature lovers.', sw: 'Matembezi ya Jozani Forest yalikuwa mazuri sana.' }, date: 'April 2025', tour: { en: 'Jozani Forest & Spice Tour', sw: 'Msitu wa Jozani & Spice Tour' }, approved: false, reply: '' }
    ];
  });

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const saveReviews = (updated: any[]) => {
    setReviews(updated);
    localStorage.setItem('ztr_guest_reviews', JSON.stringify(updated));
  };

  const handleApprove = (id: string) => {
    const updated = reviews.map(r => r.id === id ? { ...r, approved: true } : r);
    saveReviews(updated);
    addActivityLog(session?.name || 'Manager', 'Reviews', `Approved review from ${reviews.find(r => r.id === id)?.name}`);
  };

  const handleReject = (id: string) => {
    const updated = reviews.map(r => r.id === id ? { ...r, approved: false } : r);
    saveReviews(updated);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Permanently delete this review from the database?')) return;
    const updated = reviews.filter(r => r.id !== id);
    saveReviews(updated);
    addActivityLog(session?.name || 'Manager', 'Reviews', `Deleted review from ${reviews.find(r => r.id === id)?.name}`);
  };

  const handleReply = (id: string, reply: string) => {
    const updated = reviews.map(r => r.id === id ? { ...r, reply } : r);
    saveReviews(updated);
  };

  const filteredReviews = reviews.filter(r => {
    const matchesFilter = filter === 'all' || (filter === 'pending' ? !r.approved : r.approved);
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.comment.en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Guest Reviews & Feedback</h2>
          <p className="text-xs text-slate-400">Moderate dynamic guest reviews, verify ratings, and publish authentic Swahili feedback</p>
        </div>

        <div className="flex gap-2 bg-[#121B30] p-1 rounded-xl border border-white/5">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-[#D4A017] text-[#020C1F] shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search by guest name, country, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121B30] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#D4A017] transition-all"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredReviews.length > 0 ? (
            filteredReviews.map(review => (
              <div key={review.id} className="bg-[#121B30]/50 border border-white/5 rounded-3xl p-6 space-y-6 hover:border-[#D4A017]/20 transition-all">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{review.name}</h4>
                        <span className="text-[10px] text-slate-500">• {review.country}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < review.rating ? 'text-[#D4A017] fill-[#D4A017]' : 'text-slate-600'} />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider bg-[#D4A017]/10 px-2 py-0.5 rounded-full border border-[#D4A017]/20">
                          {review.tour.en}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!review.approved ? (
                      <button 
                        onClick={() => handleApprove(review.id)}
                        className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-all cursor-pointer"
                        title="Approve Review"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleReject(review.id)}
                        className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/20 transition-all cursor-pointer"
                        title="Hide Review"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all cursor-pointer"
                      title="Delete Permanently"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Globe size={12} />
                      <span>English Version</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed italic">"{review.comment.en}"</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#D4A017] uppercase tracking-widest">
                      <MessageCircle size={12} />
                      <span>Swahili Version</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">"{review.comment.sw}"</p>
                  </div>
                </div>

                <div className="space-y-3 bg-[#0A1224] p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-[#D4A017]" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Management Response</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {review.id}</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <textarea 
                      placeholder="Write a public response to this guest..."
                      value={review.reply}
                      onChange={(e) => handleReply(review.id, e.target.value)}
                      className="flex-1 bg-[#121B30] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-[#D4A017] transition-all min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <Search size={32} />
              </div>
              <p className="text-slate-400 text-sm">No reviews matching your current filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
