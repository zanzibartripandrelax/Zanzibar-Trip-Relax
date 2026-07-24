import { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, Clock, Users, Calendar, Check, Ban, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProgressiveImage } from './ProgressiveImage';
import { tours as staticTours, Tour } from '../data/tours';
import { getSiteContent } from '../lib/cmsStore';
import { Page } from '../hooks/useHashRouter';

interface TourComparisonProps {
  navigate: (page: Page, id?: string) => void;
  // Sync state between parent page and floating widget
  selectedTourIds: string[];
  onToggleCompare: (tourId: string) => void;
  onClearAll: () => void;
}

export default function TourComparison({
  navigate,
  selectedTourIds,
  onToggleCompare,
  onClearAll
}: TourComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cmsContent = getSiteContent();

  // Combine static and dynamic tours with strict ID deduplication
  const activeTours = useMemo(() => {
    const seen = new Set<string>();
    const list = [];
    for (const t of (cmsContent.tours || [])) {
      if (t.visible === false || !t.id) continue;
      if (seen.has(t.id)) continue;
      seen.add(t.id);

      const staticWalk = staticTours.find(st => st.id === t.id || (st?.name || '').toLowerCase() === (t?.title || '').toLowerCase());
      list.push({
        id: t.id,
        name: t.title,
        description: t.desc,
        longDescription: t.longDescription || t.desc,
        price: t.price,
        duration: t.duration,
        groupSize: staticWalk?.groupSize || '1–15 people',
        includes: staticWalk?.includes || ['Local guide', 'Bottled water', 'Entrance fees'],
        image: t.img,
        badge: staticWalk?.badge || (t.category === 'tour' ? 'Best Seller' : t.category),
        category: (t.category || 'tour').charAt(0).toUpperCase() + (t.category || 'tour').slice(1),
        highlights: staticWalk?.highlights || [],
        included: staticWalk?.included || [],
        excluded: staticWalk?.excluded || [],
        whatToBring: staticWalk?.whatToBring || [],
        bestTimeToVisit: staticWalk?.bestTimeToVisit || 'Year-round',
        pricingTable: staticWalk?.pricingTable || [],
      });
    }
    return list;
  }, [cmsContent.tours]);

  const selectedTours = useMemo(() => {
    const seen = new Set<string>();
    const list = [];
    for (const t of activeTours) {
      if (selectedTourIds.includes(t.id) && !seen.has(t.id)) {
        seen.add(t.id);
        list.push(t);
      }
    }
    return list;
  }, [activeTours, selectedTourIds]);

  // Disable/enable scroll on comparison modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (selectedTourIds.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Compare Strip */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] w-[92%] max-w-2xl bg-[#0C1527] border border-white/10 rounded-2xl shadow-2xl p-4 md:p-5 select-none text-white overflow-hidden">
        {/* Glow ambient lines */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-[#D4A017]/10 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-[#0B3B8C]/10 rounded-full blur-[40px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#D4A017]/10 p-2.5 rounded-xl border border-[#D4A017]/20">
              <Sparkles size={18} className="text-[#D4A017]" />
            </div>
            <div>
              <h4 className="text-sm font-black tracking-tight flex items-center gap-1.5 uppercase font-sans">
                <span>Tour Comparison Hub</span>
                <span className="bg-[#D4A017] text-[#0A1224] text-[10px] font-mono px-2 py-0.5 rounded-md font-black">
                  {selectedTourIds.length} / 4 Selected
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">Select up to 4 day trips to view them side-by-side.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClearAll}
              className="text-xs text-slate-400 hover:text-white border border-white/5 bg-white/5 hover:bg-white/10 px-3.5 py-2.5 rounded-xl transition-all uppercase font-bold tracking-wider cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-1.5 bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] text-xs font-black px-5 py-2.5 rounded-xl transition-all uppercase tracking-wider shadow-lg shadow-[#D4A017]/15 cursor-pointer"
            >
              <span>Compare Now</span>
              <ArrowRight size={13} className="stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Small avatar list showing selected items on desktop */}
        <div className="hidden md:flex items-center gap-2 mt-3.5 pt-3 border-t border-white/10 relative z-10">
          {selectedTours.map(t => (
            <div key={t.id} className="group relative flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-xl text-[10px] text-slate-300 font-semibold transition-all">
              <img src={t.image} alt={t.name} className="w-5 h-5 rounded-md object-cover" />
              <span className="truncate max-w-[120px]">{t.name}</span>
              <button
                onClick={() => onToggleCompare(t.id)}
                className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Immersive Comparison Dialog Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 select-none overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#060B16]/85 backdrop-blur-md cursor-pointer"
            />

            {/* Panel Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full h-full md:h-[90vh] md:max-w-7xl bg-[#091122] border-0 md:border border-white/15 md:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 text-white"
            >
              {/* Background ambient lighting */}
              <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#0B3B8C]/15 rounded-full blur-[140px] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#D4A017]/10 rounded-full blur-[140px] pointer-events-none" />

              {/* Header */}
              <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-[#D4A017]/15 p-2.5 rounded-2xl border border-[#D4A017]/25">
                    <Sparkles size={20} className="text-[#D4A017]" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black tracking-tight text-white uppercase font-sans">
                      Adventure Side-by-Side Comparison
                    </h3>
                    <p className="text-xs text-slate-400">Review specifications, inclusions, and direct prices to design your perfect Zanzibar day trip.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Compare Matrix Content Area (Scrollable) */}
              <div className="relative z-10 flex-grow overflow-x-auto overflow-y-auto p-4 md:p-6 scrollbar-thin">
                <div className="min-w-[800px] md:min-w-full divide-y divide-white/5 space-y-6">
                  {/* Grid columns definition: First column is 200px / 250px for titles, remaining columns split evenly */}
                  <div className="grid grid-cols-12 gap-4 pb-4">
                    {/* Feature Label Col */}
                    <div className="col-span-3 flex flex-col justify-end pr-4">
                      <div className="bg-[#111A2E]/50 border border-white/5 p-4 rounded-2xl text-center">
                        <span className="text-[10px] text-[#D4A017] uppercase tracking-widest font-black block">Zanzibar Exclusive</span>
                        <span className="text-xs text-slate-400 font-bold mt-1 block">Excursions & Tours</span>
                      </div>
                    </div>

                    {/* Excursion Cards Columns */}
                    <div className="col-span-9 grid grid-cols-3 gap-4" style={{ gridTemplateColumns: `repeat(${selectedTours.length}, minmax(0, 1fr))` }}>
                      {selectedTours.map(t => (
                        <div key={t.id} className="relative bg-[#111A2E] border border-white/10 rounded-2xl overflow-hidden p-3 group transition-all duration-300 hover:border-[#D4A017]/40 flex flex-col justify-between">
                          <button
                            onClick={() => onToggleCompare(t.id)}
                            className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                            title="Remove from comparison"
                          >
                            <Trash2 size={12} />
                          </button>

                          <div className="relative h-28 md:h-36 rounded-xl overflow-hidden mb-3">
                            <ProgressiveImage src={t.image} alt={t.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute top-2 left-2 bg-[#0B3B8C] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md z-10">
                              {t.badge || t.category}
                            </div>
                          </div>

                          <div className="flex-grow">
                            <h4 className="text-sm md:text-base font-extrabold text-white leading-tight mb-2 tracking-tight line-clamp-2">
                              {t.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">
                              {t.description}
                            </p>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-white/5">
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                localStorage.setItem('booking_prefilled_category', 'tour');
                                localStorage.setItem('booking_prefilled_tour', t.name);
                                navigate('booking', `package=${encodeURIComponent(t.name)}`);
                              }}
                              className="w-full bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-black text-[10px] md:text-xs py-2 rounded-xl transition-colors uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ShoppingBag size={12} />
                              <span>Book Direct</span>
                            </button>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                navigate('tour-detail', (t?.name || '').toLowerCase().replace(/\s+/g, '-'));
                              }}
                              className="w-full bg-white/5 hover:bg-white/10 border border-white/5 text-white font-extrabold text-[10px] md:text-xs py-2 rounded-xl transition-colors uppercase tracking-wider cursor-pointer"
                            >
                              Full Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparisons Row: Starting Price */}
                  <div className="grid grid-cols-12 gap-4 py-4.5 items-center">
                    <div className="col-span-3">
                      <span className="text-xs uppercase font-black text-slate-400 tracking-wider">Starting Price</span>
                    </div>
                    <div className="col-span-9 grid grid-cols-3 gap-4" style={{ gridTemplateColumns: `repeat(${selectedTours.length}, minmax(0, 1fr))` }}>
                      {selectedTours.map(t => (
                        <div key={t.id} className="text-center">
                          <span className="text-base md:text-lg font-black text-[#D4A017] font-mono">{t.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparisons Row: Duration */}
                  <div className="grid grid-cols-12 gap-4 py-4.5 items-center">
                    <div className="col-span-3">
                      <span className="text-xs uppercase font-black text-slate-400 tracking-wider">Duration</span>
                    </div>
                    <div className="col-span-9 grid grid-cols-3 gap-4" style={{ gridTemplateColumns: `repeat(${selectedTours.length}, minmax(0, 1fr))` }}>
                      {selectedTours.map(t => (
                        <div key={t.id} className="text-center flex items-center justify-center gap-1.5 text-xs text-slate-300 font-semibold font-mono">
                          <Clock size={14} className="text-[#D4A017]/70" />
                          <span>{t.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparisons Row: Group Size */}
                  <div className="grid grid-cols-12 gap-4 py-4.5 items-center">
                    <div className="col-span-3">
                      <span className="text-xs uppercase font-black text-slate-400 tracking-wider">Group size</span>
                    </div>
                    <div className="col-span-9 grid grid-cols-3 gap-4" style={{ gridTemplateColumns: `repeat(${selectedTours.length}, minmax(0, 1fr))` }}>
                      {selectedTours.map(t => (
                        <div key={t.id} className="text-center flex items-center justify-center gap-1.5 text-xs text-slate-300 font-semibold font-mono">
                          <Users size={14} className="text-[#D4A017]/70" />
                          <span>{t.groupSize}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparisons Row: Best Time to Visit */}
                  <div className="grid grid-cols-12 gap-4 py-4.5 items-center">
                    <div className="col-span-3">
                      <span className="text-xs uppercase font-black text-slate-400 tracking-wider">Best Time to Visit</span>
                    </div>
                    <div className="col-span-9 grid grid-cols-3 gap-4" style={{ gridTemplateColumns: `repeat(${selectedTours.length}, minmax(0, 1fr))` }}>
                      {selectedTours.map(t => (
                        <div key={t.id} className="text-center flex items-center justify-center gap-1.5 text-xs text-slate-300 font-semibold">
                          <Calendar size={14} className="text-[#D4A017]/70" />
                          <span>{t.bestTimeToVisit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparisons Row: Excursion Highlights */}
                  <div className="grid grid-cols-12 gap-4 py-5 items-start">
                    <div className="col-span-3">
                      <span className="text-xs uppercase font-black text-slate-400 tracking-wider block">Key Highlights</span>
                    </div>
                    <div className="col-span-9 grid grid-cols-3 gap-4" style={{ gridTemplateColumns: `repeat(${selectedTours.length}, minmax(0, 1fr))` }}>
                      {selectedTours.map(t => (
                        <div key={t.id} className="space-y-2 px-1">
                          {t.highlights.length > 0 ? (
                            t.highlights.slice(0, 4).map((h, i) => (
                              <div key={i} className="flex gap-2 text-[11px] text-slate-300 items-start">
                                <span className="bg-[#D4A017]/15 text-[#D4A017] rounded p-0.5 mt-0.5 shrink-0">
                                  <Check size={10} className="stroke-[3]" />
                                </span>
                                <span className="leading-relaxed font-medium">{h}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-500 text-xs font-medium block text-center">Uniquely tailored Swahili beach highlights</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparisons Row: Inclusions */}
                  <div className="grid grid-cols-12 gap-4 py-5 items-start">
                    <div className="col-span-3">
                      <span className="text-xs uppercase font-black text-slate-400 tracking-wider block">What's Included</span>
                    </div>
                    <div className="col-span-9 grid grid-cols-3 gap-4" style={{ gridTemplateColumns: `repeat(${selectedTours.length}, minmax(0, 1fr))` }}>
                      {selectedTours.map(t => (
                        <div key={t.id} className="space-y-1.5 px-1 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                          {t.includes.slice(0, 4).map((inc, i) => (
                            <div key={i} className="flex gap-2 text-[10px] md:text-[11px] text-emerald-300 items-center">
                              <Check size={11} className="text-emerald-400 shrink-0 stroke-[3]" />
                              <span className="truncate leading-none font-semibold">{inc}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparisons Row: Exclusions */}
                  <div className="grid grid-cols-12 gap-4 py-5 items-start">
                    <div className="col-span-3">
                      <span className="text-xs uppercase font-black text-slate-400 tracking-wider block">Exclusions & Tipping</span>
                    </div>
                    <div className="col-span-9 grid grid-cols-3 gap-4" style={{ gridTemplateColumns: `repeat(${selectedTours.length}, minmax(0, 1fr))` }}>
                      {selectedTours.map(t => (
                        <div key={t.id} className="space-y-1.5 px-1 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                          {t.excluded.length > 0 ? (
                            t.excluded.slice(0, 3).map((exc, i) => (
                              <div key={i} className="flex gap-2 text-[10px] md:text-[11px] text-rose-300 items-center">
                                <Ban size={10} className="text-rose-400 shrink-0 stroke-[3]" />
                                <span className="truncate leading-none font-semibold">{exc}</span>
                              </div>
                            ))
                          ) : (
                            <div className="flex gap-2 text-[10px] md:text-[11px] text-rose-300 items-center">
                              <Ban size={10} className="text-rose-400 shrink-0 stroke-[3]" />
                              <span className="truncate leading-none font-semibold">Alcoholic beverages</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparisons Row: What to Bring */}
                  <div className="grid grid-cols-12 gap-4 py-5 items-start">
                    <div className="col-span-3">
                      <span className="text-xs uppercase font-black text-slate-400 tracking-wider block">Recommended Gear</span>
                    </div>
                    <div className="col-span-9 grid grid-cols-3 gap-4" style={{ gridTemplateColumns: `repeat(${selectedTours.length}, minmax(0, 1fr))` }}>
                      {selectedTours.map(t => (
                        <div key={t.id} className="flex flex-wrap gap-1 px-1">
                          {t.whatToBring.length > 0 ? (
                            t.whatToBring.slice(0, 4).map((g, i) => (
                              <span key={i} className="text-[9px] bg-white/5 border border-white/5 text-slate-300 px-2.5 py-1 rounded-lg font-bold">
                                {g}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-xs font-semibold">Standard comfortable beachwear</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#070D1A] border-t border-white/10 px-6 py-4 flex items-center justify-between shrink-0 text-xs font-mono text-slate-500 uppercase tracking-widest">
                <span>Direct Pricing Guaranteed</span>
                <span className="text-[#D4A017] font-bold">🔒 Secure Booking Gateways</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
