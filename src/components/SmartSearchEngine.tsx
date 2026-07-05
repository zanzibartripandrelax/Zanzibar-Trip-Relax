import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Calendar as CalendarIcon, Users, Search, 
  ChevronLeft, ChevronRight, Plus, Minus, Check, ChevronDown, X, Compass 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../hooks/useHashRouter';

interface SmartSearchEngineProps {
  navigate: (page: Page) => void;
}

// Highly targeted autocomplete suggestions matching user examples and existing router mappings
const suggestionsList = [
  { value: 'zanzibar', label: 'Zanzibar', desc: 'Sunny beaches & Stone Town cultural heritage', icon: '🏝️' },
  { value: 'mainland', label: 'Tanzania Safari', desc: 'Wildlife expeditions in Serengeti & Ngorongoro', icon: '🦁' },
  { value: 'kilimanjaro', label: 'Kilimanjaro', desc: 'Climbing the roof of Africa mountain trek', icon: '🏔️' },
  { value: 'combo', label: 'Zanzibar Holiday Package', desc: 'Luxury resort packages & island leisure', icon: '✈️' },
];

export default function SmartSearchEngine({ navigate }: SmartSearchEngineProps) {
  // Main Search State (Matching historical keys for system-wide compatibility)
  const [destination, setDestination] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [arrival, setArrival] = useState('');
  const [departure, setDeparture] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Popover Visibility State
  const [activePopover, setActivePopover] = useState<'destination' | 'dates' | 'travellers' | null>(null);

  // Calendar Year/Month slide reference
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // Load initial search state from localStorage on mount
  useEffect(() => {
    const savedDest = localStorage.getItem('ztr_search_destination');
    const savedArrival = localStorage.getItem('ztr_search_arrival');
    const savedDeparture = localStorage.getItem('ztr_search_departure');
    const savedAdults = localStorage.getItem('ztr_search_adults');
    const savedChildren = localStorage.getItem('ztr_search_children');

    if (savedDest) {
      setDestination(savedDest);
      const matched = suggestionsList.find(d => d.value === savedDest);
      if (matched) setDestQuery(matched.label);
    }
    if (savedArrival) setArrival(savedArrival);
    if (savedDeparture) setDeparture(savedDeparture);
    if (savedAdults) setAdults(Number(savedAdults));
    if (savedChildren) setChildren(Number(savedChildren));
  }, []);

  // Filtered destinations list based on type-ahead search
  const filteredSuggestions = useMemo(() => {
    if (!destQuery) return suggestionsList;
    return suggestionsList.filter(s => 
      s.label.toLowerCase().includes(destQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(destQuery.toLowerCase())
    );
  }, [destQuery]);

  // Handle destination selection
  const handleSelectDestination = (val: string, label: string) => {
    setDestination(val);
    setDestQuery(label);
    setActivePopover(null);
  };

  // Safe search dispatching inside localStorage and router
  const handleExecuteSearch = () => {
    localStorage.setItem('ztr_search_destination', destination);
    localStorage.setItem('ztr_search_arrival', arrival);
    localStorage.setItem('ztr_search_departure', departure);
    localStorage.setItem('ztr_search_adults', String(adults));
    localStorage.setItem('ztr_search_children', String(children));
    
    // Clean up old removed keys
    localStorage.removeItem('ztr_search_type');
    localStorage.removeItem('ztr_search_budget');
    localStorage.removeItem('ztr_search_hotel');
    localStorage.removeItem('ztr_search_infants');
    localStorage.removeItem('ztr_search_is_private');
    localStorage.removeItem('ztr_search_duration');
    localStorage.removeItem('ztr_search_activity');
    localStorage.removeItem('ztr_search_language');
    localStorage.removeItem('ztr_search_pickup');
    localStorage.removeItem('ztr_search_difficulty');
    localStorage.removeItem('ztr_search_safari_style');

    setActivePopover(null);
    navigate('packages');
  };

  // Calendar Navigation
  const nextCalendarMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevCalendarMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Simple and elegant single-month calendar picker
  const renderSimpleCalendar = () => {
    const year = calendarMonth.getFullYear();
    const monthIndex = calendarMonth.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const blanks = Array(startWeekday).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const totalCells = [...blanks, ...days];

    const monthName = firstDay.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const handleCellClick = (day: number) => {
      const selectedDate = new Date(year, monthIndex, day);
      const offset = selectedDate.getTimezoneOffset();
      const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
      const dateStr = localDate.toISOString().split('T')[0];
      
      setArrival(dateStr);
      
      // Auto-calculate departure as 7 days after arrival for compatibility with booking/package listing scores
      const depDate = new Date(selectedDate);
      depDate.setDate(depDate.getDate() + 7);
      const depStr = depDate.toISOString().split('T')[0];
      setDeparture(depStr);
      
      setActivePopover(null); // Auto-close calendar popover on selection
    };

    const isDateSelected = (day: number) => {
      const cellDateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return cellDateStr === arrival;
    };

    const isPastDate = (day: number) => {
      const cellDate = new Date(year, monthIndex, day);
      const today = new Date();
      today.setHours(0,0,0,0);
      return cellDate < today;
    };

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <button
            type="button"
            onClick={prevCalendarMonth}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest font-mono">
            {monthName}
          </h4>
          <button
            type="button"
            onClick={nextCalendarMonth}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center mb-2 text-[9px] font-black text-slate-400 uppercase tracking-wider">
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {totalCells.map((cell, idx) => {
            if (cell === null) return <div key={`blank-${idx}`} className="h-8 w-8" />;
            
            const isSel = isDateSelected(cell);
            const isPast = isPastDate(cell);

            return (
              <button
                key={`day-${cell}`}
                type="button"
                disabled={isPast}
                onClick={() => handleCellClick(cell)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  isSel 
                    ? 'bg-[#D4A017] text-[#020C1F] font-black scale-105 shadow-md shadow-[#D4A017]/30' 
                    : isPast 
                    ? 'text-slate-650 cursor-not-allowed opacity-20 line-through' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white hover:scale-105'
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Destination Display Label
  const currentDestinationLabel = useMemo(() => {
    const matched = suggestionsList.find(s => s.value === destination);
    return matched ? matched.label : destQuery || 'Where are you travelling?';
  }, [destination, destQuery]);

  // Date Display Label
  const dateLabel = useMemo(() => {
    if (!arrival) return 'Choose travel date';
    return new Date(arrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [arrival]);

  // Guests Display Label
  const travelersLabel = useMemo(() => {
    const parts = [`${adults} Adult${adults !== 1 ? 's' : ''}`];
    if (children > 0) {
      parts.push(`${children} Child${children !== 1 ? 'ren' : ''}`);
    }
    return parts.join(', ');
  }, [adults, children]);

  return (
    <div className="relative z-30 max-w-5xl mx-auto w-full">
      {/* Backdrop to close popovers */}
      {activePopover && (
        <div 
          className="fixed inset-0 z-40 bg-transparent cursor-default" 
          onClick={() => setActivePopover(null)} 
        />
      )}

      <div className="bg-[#0A1224]/90 backdrop-blur-md rounded-2xl border-2 border-white/10 shadow-2xl p-5 md:p-6 relative z-50">
        
        {/* Compact Branded Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#D4A017]/10 text-[#D4A017] flex items-center justify-center shrink-0">
              <Compass size={16} />
            </span>
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-[0.25em]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Find Your Perfect Trip
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-none">
                Bespoke Luxury Excursions, Packages & Private Transfers
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[10px] text-slate-300 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017]" />
              No Booking Fees
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017]" />
              Flexible Dates
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017]" />
              Native Swahili Guides
            </span>
          </div>
        </div>

        {/* PRIMARY BOOKING SEARCH BAR: Equal 4 Columns on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#121B30] p-3 rounded-2xl border border-white/5 relative items-center shadow-lg">
          
          {/* 1. DESTINATION SELECTOR */}
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setActivePopover(activePopover === 'destination' ? null : 'destination')}
              className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all hover:bg-white/5 border border-transparent hover:border-white/5 group ${
                activePopover === 'destination' ? 'bg-white/5 border-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <MapPin className="text-[#D4A017] group-hover:scale-110 transition-transform shrink-0" size={18} />
                <div className="min-w-0">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Destination</span>
                  <span className="block text-xs font-extrabold text-white truncate">
                    {destination ? currentDestinationLabel : 'Where are you travelling?'}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>

            {/* Destination Autocomplete Popover */}
            <AnimatePresence>
              {activePopover === 'destination' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-[#0A1224] border border-white/10 rounded-xl shadow-2xl p-4 z-50 max-h-[360px] overflow-y-auto"
                >
                  {/* Autocomplete Input Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search destinations..."
                      value={destQuery}
                      onChange={(e) => setDestQuery(e.target.value)}
                      className="w-full bg-[#121B30] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017] font-semibold"
                    />
                    {destQuery && (
                      <button 
                        type="button"
                        onClick={() => setDestQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Suggestion List */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Suggestions</span>
                    {filteredSuggestions.length === 0 ? (
                      <p className="text-[10px] text-slate-500 font-bold py-2 text-center">No matching destinations found.</p>
                    ) : (
                      filteredSuggestions.map(s => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => handleSelectDestination(s.value, s.label)}
                          className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between hover:bg-white/5 group border border-transparent hover:border-white/5 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-base shrink-0">{s.icon}</span>
                            <div className="min-w-0">
                              <span className="block text-slate-200 group-hover:text-white truncate font-bold">{s.label}</span>
                              <span className="block text-[9px] text-slate-400 truncate font-semibold mt-0.5">{s.desc}</span>
                            </div>
                          </div>
                          {destination === s.value && (
                            <Check size={14} className="text-[#D4A017] shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. TRAVEL DATE SELECTOR */}
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setActivePopover(activePopover === 'dates' ? null : 'dates')}
              className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all hover:bg-white/5 border border-transparent hover:border-white/5 group ${
                activePopover === 'dates' ? 'bg-white/5 border-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <CalendarIcon className="text-[#D4A017] group-hover:scale-110 transition-transform shrink-0" size={18} />
                <div className="min-w-0">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Travel Date</span>
                  <span className="block text-xs font-extrabold text-white truncate">
                    {arrival ? dateLabel : 'Choose travel date'}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>

            {/* Simple Date Picker Popover */}
            <AnimatePresence>
              {activePopover === 'dates' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 top-full mt-2 bg-[#0A1224] border border-white/10 rounded-xl shadow-2xl p-4 z-50 w-[94vw] sm:w-[280px]"
                >
                  {renderSimpleCalendar()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. GUESTS SELECTOR */}
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setActivePopover(activePopover === 'travellers' ? null : 'travellers')}
              className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all hover:bg-white/5 border border-transparent hover:border-white/5 group ${
                activePopover === 'travellers' ? 'bg-white/5 border-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Users className="text-[#D4A017] group-hover:scale-110 transition-transform shrink-0" size={18} />
                <div className="min-w-0">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Guests</span>
                  <span className="block text-xs font-extrabold text-white truncate">
                    {travelersLabel}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>

            {/* Guests Popover */}
            <AnimatePresence>
              {activePopover === 'travellers' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 bg-[#0A1224] border border-white/10 rounded-xl shadow-2xl p-4 z-50 w-full sm:w-[260px]"
                >
                  <div className="space-y-4">
                    {/* ADULTS */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-xs font-black text-white">Adults</span>
                        <span className="block text-[9px] text-slate-400 font-semibold">Ages 12 or above</span>
                      </div>
                      <div className="flex items-center gap-2.5 bg-[#121B30] rounded-lg border border-white/5 px-2 py-1 shrink-0">
                        <button
                          type="button"
                          disabled={adults <= 1}
                          onClick={() => setAdults(prev => prev - 1)}
                          className="h-6 w-6 rounded bg-white/5 text-slate-300 hover:text-white flex items-center justify-center disabled:opacity-25 transition-colors cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[12px] text-center">{adults}</span>
                        <button
                          type="button"
                          disabled={adults >= 20}
                          onClick={() => setAdults(prev => prev + 1)}
                          className="h-6 w-6 rounded bg-white/5 text-slate-300 hover:text-white flex items-center justify-center disabled:opacity-25 transition-colors cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>

                    {/* CHILDREN */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="block text-xs font-black text-white">Children</span>
                        <span className="block text-[9px] text-slate-400 font-semibold">Ages 2 to 11</span>
                      </div>
                      <div className="flex items-center gap-2.5 bg-[#121B30] rounded-lg border border-white/5 px-2 py-1 shrink-0">
                        <button
                          type="button"
                          disabled={children <= 0}
                          onClick={() => setChildren(prev => prev - 1)}
                          className="h-6 w-6 rounded bg-white/5 text-slate-300 hover:text-white flex items-center justify-center disabled:opacity-25 transition-colors cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[12px] text-center">{children}</span>
                        <button
                          type="button"
                          disabled={children >= 10}
                          onClick={() => setChildren(prev => prev + 1)}
                          className="h-6 w-6 rounded bg-white/5 text-slate-300 hover:text-white flex items-center justify-center disabled:opacity-25 transition-colors cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>

                    {/* DONE ACTION */}
                    <button
                      type="button"
                      onClick={() => setActivePopover(null)}
                      className="w-full bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-black text-[10px] uppercase tracking-widest py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Apply Guests
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. PRIMARY SEARCH BUTTON */}
          <div className="w-full">
            <button
              type="button"
              onClick={handleExecuteSearch}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#D4A017] to-[#c49010] hover:scale-[1.02] active:scale-[0.98] text-[#020C1F] flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-[#D4A017]/10 cursor-pointer"
            >
              <Search size={14} className="shrink-0" />
              <span>Find My Trip</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
