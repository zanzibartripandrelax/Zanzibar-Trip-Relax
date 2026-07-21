import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, Calendar as CalendarIcon, Users, ChevronDown, 
  Plus, Minus, ChevronLeft, ChevronRight, X, Sparkles, Bed
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../hooks/useHashRouter';

interface SmartSearchEngineProps {
  navigate: (page: Page, id?: string) => void;
  initiallyOpenCalendar?: boolean;
}

const CATEGORIES = [
  { id: 'tours', label: 'Tours & Excursions', page: 'tours' },
  { id: 'packages', label: 'Holiday Packages', page: 'packages' },
  { id: 'safaris', label: 'Tanzania Safaris', page: 'safaris' },
  { id: 'kilimanjaro', label: 'Kilimanjaro Treks', page: 'kilimanjaro' },
  { id: 'transfers', label: 'Airport Transfers', page: 'transfers' },
  { id: 'hotels', label: 'Partner Hotels', page: 'hotels' }
];

const POPULAR_SUGGESTIONS = [
  'Zanzibar Island',
  'Stone Town',
  'Serengeti National Park',
  'Ngorongoro Crater',
  'Nungwi Beach',
  'Mount Kilimanjaro'
];

// Helper to format Date objects to YYYY-MM-DD
const formatDateStr = (date: Date | null): string => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Helper to parse YYYY-MM-DD to Date object at noon
const parseDateStr = (str: string): Date | null => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};

export default function SmartSearchEngine({ navigate, initiallyOpenCalendar = false }: SmartSearchEngineProps) {
  // Destination State (Zanzibar, Stone Town, Serengeti, etc.)
  const [destinationQuery, setDestinationQuery] = useState('Zanzibar Island');
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  // Category State (Tours, Packages, Safaris, Transfers, Hotels)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Date Selection States (Arrival & Departure)
  const [arrivalDate, setArrivalDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3); // 3 days in future by default
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  });
  const [departureDate, setDepartureDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10); // 10 days in future by default (7-night stay)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(initiallyOpenCalendar);

  // Calendar Pagination (shows left and right months)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = arrivalDate || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Guests Selector States
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  // Refs for closing dropdowns when clicking outside
  const destRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const guestRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (destRef.current && !destRef.current.contains(target)) {
        setShowDestSuggestions(false);
      }
      if (dateRef.current && !dateRef.current.contains(target)) {
        setShowCalendar(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(target)) {
        setShowCategoryDropdown(false);
      }
      if (guestRef.current && !guestRef.current.contains(target)) {
        setShowGuestsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate nights and days
  const { nights, days } = useMemo(() => {
    if (!arrivalDate || !departureDate) return { nights: 0, days: 0 };
    const diffTime = departureDate.getTime() - arrivalDate.getTime();
    const computedNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return { nights: computedNights, days: computedNights + 1 };
  }, [arrivalDate, departureDate]);

  // Labels
  const dateRangeLabel = useMemo(() => {
    if (!arrivalDate) return 'Select travel dates';
    const opt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const start = arrivalDate.toLocaleDateString('en-US', opt);
    if (!departureDate) return `${start} - Choose checkout`;
    const end = departureDate.toLocaleDateString('en-US', { ...opt, year: 'numeric' });
    return `${start} - ${end} (${nights} Night${nights !== 1 ? 's' : ''}, ${days} Days)`;
  }, [arrivalDate, departureDate, nights, days]);

  const guestsLabel = useMemo(() => {
    const parts = [`${adults} Adult${adults !== 1 ? 's' : ''}`];
    if (children > 0) parts.push(`${children} Child${children !== 1 ? 'ren' : ''}`);
    if (infants > 0) parts.push(`${infants} Infant${infants !== 1 ? 's' : ''}`);
    if (rooms > 0) parts.push(`${rooms} Room${rooms !== 1 ? 's' : ''}`);
    return parts.join(', ');
  }, [adults, children, infants, rooms]);

  // Generate Days of a Month
  const generateMonthDays = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const daysArr = [];

    // Padding empty days for alignment
    for (let i = 0; i < firstDayIndex; i++) {
      daysArr.push(null);
    }
    // Real days
    for (let day = 1; day <= totalDays; day++) {
      daysArr.push(new Date(year, month, day, 12, 0, 0));
    }
    return daysArr;
  };

  const leftMonthDays = useMemo(() => {
    return generateMonthDays(calendarMonth.getFullYear(), calendarMonth.getMonth());
  }, [calendarMonth]);

  const rightMonthDays = useMemo(() => {
    const nextMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    return generateMonthDays(nextMonth.getFullYear(), nextMonth.getMonth());
  }, [calendarMonth]);

  // Handle Day Selection inside calendar
  const handleDayClick = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day.getTime() < today.getTime()) return; // block past dates

    if (!arrivalDate || (arrivalDate && departureDate)) {
      setArrivalDate(day);
      setDepartureDate(null);
    } else if (arrivalDate && !departureDate) {
      if (day.getTime() < arrivalDate.getTime()) {
        // click before arrival becomes new arrival
        setArrivalDate(day);
      } else {
        setDepartureDate(day);
        setShowCalendar(false); // Close calendar on selection
      }
    }
  };

  // Check if a day is in the selected range
  const isSelectedRange = (day: Date) => {
    if (!day || !arrivalDate) return false;
    if (departureDate) {
      return day.getTime() >= arrivalDate.getTime() && day.getTime() <= departureDate.getTime();
    }
    if (hoveredDate && day.getTime() >= arrivalDate.getTime() && day.getTime() <= hoveredDate.getTime()) {
      return true;
    }
    return day.getTime() === arrivalDate.getTime();
  };

  const isRangeBound = (day: Date, bound: 'start' | 'end') => {
    if (!day) return false;
    if (bound === 'start' && arrivalDate) {
      return day.getTime() === arrivalDate.getTime();
    }
    if (bound === 'end') {
      if (departureDate) return day.getTime() === departureDate.getTime();
      if (!departureDate && hoveredDate && hoveredDate.getTime() > arrivalDate!.getTime()) {
        return day.getTime() === hoveredDate.getTime();
      }
    }
    return false;
  };

  const handleMonthPage = (direction: 'prev' | 'next') => {
    setCalendarMonth(prev => {
      const offset = direction === 'prev' ? -1 : 1;
      return new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
    });
  };

  // Submit Search & Redirect
  const handleSearchSubmit = () => {
    // Save selections locally to prefill booking page or specific details
    localStorage.setItem('ztr_search_destination_label', destinationQuery);
    localStorage.setItem('ztr_search_category_id', selectedCategory.id);
    localStorage.setItem('ztr_search_arrival', formatDateStr(arrivalDate));
    localStorage.setItem('ztr_search_departure', formatDateStr(departureDate));
    localStorage.setItem('ztr_search_nights', String(nights));
    localStorage.setItem('ztr_search_adults', String(adults));
    localStorage.setItem('ztr_search_children', String(children));
    localStorage.setItem('ztr_search_infants', String(infants));
    localStorage.setItem('ztr_search_rooms', String(rooms));

    // Redirect to the category page
    navigate(selectedCategory.page as Page);
  };

  // Formatted Left and Right Month Titles
  const leftMonthTitle = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const rightMonthTitle = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 relative" id="quick-search">
      {/* High contrast, clean, elegant card structure */}
      <div className="bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* 1. Destination / Activity */}
          <div ref={destRef} className="relative flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Where are you going?</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={destinationQuery}
                onChange={(e) => {
                  setDestinationQuery(e.target.value);
                  setShowDestSuggestions(true);
                }}
                onFocus={() => {
                  setShowDestSuggestions(true);
                  setShowCalendar(false);
                  setShowCategoryDropdown(false);
                  setShowGuestsDropdown(false);
                }}
                placeholder="Stone Town, Serengeti..."
                className="w-full text-sm font-extrabold text-[#0A1224] bg-transparent border-0 p-0 focus:ring-0 outline-none placeholder:text-slate-350"
              />
              {destinationQuery && (
                <button 
                  type="button" 
                  onClick={() => setDestinationQuery('')}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Suggestions Popover */}
            <AnimatePresence>
              {showDestSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 top-full mt-3 bg-white rounded-2xl border border-slate-100 shadow-2xl p-3.5 z-50 max-h-64 overflow-y-auto"
                >
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 px-1">Popular Attractions</span>
                  <div className="space-y-1">
                    {POPULAR_SUGGESTIONS.map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setDestinationQuery(suggestion);
                          setShowDestSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#0A1224] hover:bg-slate-50 hover:text-[#D4A017] transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span className="text-slate-400 text-xs">📍</span>
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Date / Range */}
          <div ref={dateRef} className="relative flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:px-4">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Travel Dates</label>
            <button
              type="button"
              onClick={() => {
                setShowCalendar(!showCalendar);
                setShowDestSuggestions(false);
                setShowCategoryDropdown(false);
                setShowGuestsDropdown(false);
              }}
              className="w-full text-left text-sm font-extrabold text-[#0A1224] truncate bg-transparent border-none p-0 outline-none cursor-pointer flex items-center justify-between"
            >
              <span className="truncate">{dateRangeLabel}</span>
              <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
            </button>

            {/* Professional Dual-Month Calendar Popover */}
            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-1/2 -translate-x-1/2 md:left-auto md:right-auto md:translate-x-0 md:-left-20 top-full mt-3 bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 z-50 w-[95vw] md:w-[680px] overflow-hidden"
                >
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-[#0B3B8C] uppercase tracking-wider">Select Travel Window</h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Click arrival date then departure date. Past dates are blocked.</p>
                    </div>
                    {nights > 0 && (
                      <div className="bg-amber-50 border border-amber-100/50 text-[#0B3B8C] px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm">
                        <Sparkles size={13} className="text-[#D4A017]" />
                        <span>{nights} Nights, {days} Days</span>
                      </div>
                    )}
                  </div>

                  {/* Left/Right Month Grid Container */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    
                    {/* Absolute Navigation Toggles */}
                    <button
                      type="button"
                      onClick={() => handleMonthPage('prev')}
                      className="absolute left-0 -top-1 w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center border border-slate-100 transition-colors cursor-pointer text-slate-600"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMonthPage('next')}
                      className="absolute right-0 -top-1 w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center border border-slate-100 transition-colors cursor-pointer text-slate-600"
                    >
                      <ChevronRight size={16} />
                    </button>

                    {/* left month */}
                    <div>
                      <h5 className="text-center font-extrabold text-[#0B3B8C] text-sm mb-3">{leftMonthTitle}</h5>
                      <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {leftMonthDays.map((day, idx) => {
                          if (!day) return <div key={`empty-left-${idx}`} className="aspect-square" />;
                          const isPast = day.getTime() < new Date().setHours(0,0,0,0);
                          const isSelected = isSelectedRange(day);
                          const isStart = isRangeBound(day, 'start');
                          const isEnd = isRangeBound(day, 'end');

                          return (
                            <button
                              key={day.toISOString()}
                              type="button"
                              disabled={isPast}
                              onClick={() => handleDayClick(day)}
                              onMouseEnter={() => !departureDate && setHoveredDate(day)}
                              className={`aspect-square rounded-full text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer ${
                                isPast 
                                  ? 'text-slate-200 cursor-not-allowed' 
                                  : isStart || isEnd
                                  ? 'bg-[#D4A017] text-[#0A1224] font-black shadow-sm scale-105 z-10'
                                  : isSelected
                                  ? 'bg-[#0B3B8C]/10 text-[#0B3B8C] hover:bg-[#0B3B8C]/20 rounded-none'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{day.getDate()}</span>
                              {isStart && (
                                <span className="absolute -bottom-1 text-[7px] text-[#0A1224] font-bold uppercase tracking-wider">Arr</span>
                              )}
                              {isEnd && (
                                <span className="absolute -bottom-1 text-[7px] text-[#0A1224] font-bold uppercase tracking-wider">Dep</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* right month (hidden on mobile, shown on desktop) */}
                    <div className="hidden md:block border-l border-slate-100 pl-8">
                      <h5 className="text-center font-extrabold text-[#0B3B8C] text-sm mb-3">{rightMonthTitle}</h5>
                      <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {rightMonthDays.map((day, idx) => {
                          if (!day) return <div key={`empty-right-${idx}`} className="aspect-square" />;
                          const isPast = day.getTime() < new Date().setHours(0,0,0,0);
                          const isSelected = isSelectedRange(day);
                          const isStart = isRangeBound(day, 'start');
                          const isEnd = isRangeBound(day, 'end');

                          return (
                            <button
                              key={day.toISOString()}
                              type="button"
                              disabled={isPast}
                              onClick={() => handleDayClick(day)}
                              onMouseEnter={() => !departureDate && setHoveredDate(day)}
                              className={`aspect-square rounded-full text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer ${
                                isPast 
                                  ? 'text-slate-200 cursor-not-allowed' 
                                  : isStart || isEnd
                                  ? 'bg-[#D4A017] text-[#0A1224] font-black shadow-sm scale-105 z-10'
                                  : isSelected
                                  ? 'bg-[#0B3B8C]/10 text-[#0B3B8C] hover:bg-[#0B3B8C]/20 rounded-none'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{day.getDate()}</span>
                              {isStart && (
                                <span className="absolute -bottom-1 text-[7px] text-[#0A1224] font-bold uppercase tracking-wider">Arr</span>
                              )}
                              {isEnd && (
                                <span className="absolute -bottom-1 text-[7px] text-[#0A1224] font-bold uppercase tracking-wider">Dep</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Calendar Footer Actions */}
                  <div className="pt-4 border-t border-slate-100 mt-6 flex justify-between items-center text-xs">
                    <div className="text-slate-450 font-semibold">
                      * Rates vary dynamically based on seasons.
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setArrivalDate(null);
                          setDepartureDate(null);
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors font-bold cursor-pointer text-[#0A1224]"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCalendar(false)}
                        className="px-5 py-2 bg-[#0B3B8C] text-white rounded-full hover:bg-opacity-95 font-bold cursor-pointer"
                      >
                        Apply Dates
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Category / Experience Type */}
          <div ref={categoryRef} className="relative flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:px-4">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
            <button
              type="button"
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowDestSuggestions(false);
                setShowCalendar(false);
                setShowGuestsDropdown(false);
              }}
              className="w-full text-left text-sm font-extrabold text-[#0A1224] truncate bg-transparent border-none p-0 outline-none cursor-pointer flex items-center justify-between"
            >
              <span className="truncate">{selectedCategory.label}</span>
              <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
            </button>

            {/* Category Dropdown */}
            <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 top-full mt-3 bg-white rounded-2xl border border-slate-100 shadow-2xl p-2 z-50"
                >
                  <div className="space-y-1">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedCategory.id === cat.id
                            ? 'bg-[#0B3B8C] text-white shadow-sm'
                            : 'text-[#0A1224] hover:bg-slate-50 hover:text-[#D4A017]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Guests / Pax count */}
          <div ref={guestRef} className="relative flex flex-col justify-center pb-4 md:pb-0 md:pl-4">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Guests / Pax</label>
            <button
              type="button"
              onClick={() => {
                setShowGuestsDropdown(!showGuestsDropdown);
                setShowDestSuggestions(false);
                setShowCalendar(false);
                setShowCategoryDropdown(false);
              }}
              className="w-full text-left text-sm font-extrabold text-[#0A1224] truncate bg-transparent border-none p-0 outline-none cursor-pointer flex items-center justify-between"
            >
              <span className="truncate">{guestsLabel}</span>
              <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
            </button>

            {/* Guests Dropdown Panel */}
            <AnimatePresence>
              {showGuestsDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-3 bg-white rounded-2xl border border-slate-100 shadow-2xl p-4 z-50 w-full sm:w-[280px] space-y-4"
                >
                  {/* Adults Count */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-extrabold text-[#0B3B8C]">Adults</span>
                      <span className="block text-[10px] text-slate-400 font-medium">Age 12+</span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-slate-50 rounded-full border border-slate-100 px-2 py-1 shrink-0">
                      <button
                        type="button"
                        disabled={adults <= 1}
                        onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                        className="h-6 w-6 rounded-full bg-white text-slate-600 hover:text-[#0B3B8C] border border-slate-100 shadow-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-extrabold text-[#0B3B8C] min-w-[14px] text-center">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(prev => prev + 1)}
                        className="h-6 w-6 rounded-full bg-white text-slate-600 hover:text-[#0B3B8C] border border-slate-100 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Children Count */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-extrabold text-[#0B3B8C]">Children</span>
                      <span className="block text-[10px] text-slate-400 font-medium">Ages 2 to 11</span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-slate-50 rounded-full border border-slate-100 px-2 py-1 shrink-0">
                      <button
                        type="button"
                        disabled={children <= 0}
                        onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                        className="h-6 w-6 rounded-full bg-white text-slate-600 hover:text-[#0B3B8C] border border-slate-100 shadow-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-extrabold text-[#0B3B8C] min-w-[14px] text-center">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(prev => prev + 1)}
                        className="h-6 w-6 rounded-full bg-white text-slate-600 hover:text-[#0B3B8C] border border-slate-100 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Infants Count */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-extrabold text-[#0B3B8C]">Infants</span>
                      <span className="block text-[10px] text-slate-400 font-medium">Under 2 yrs</span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-slate-50 rounded-full border border-slate-100 px-2 py-1 shrink-0">
                      <button
                        type="button"
                        disabled={infants <= 0}
                        onClick={() => setInfants(prev => Math.max(0, prev - 1))}
                        className="h-6 w-6 rounded-full bg-white text-slate-600 hover:text-[#0B3B8C] border border-slate-100 shadow-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-extrabold text-[#0B3B8C] min-w-[14px] text-center">{infants}</span>
                      <button
                        type="button"
                        onClick={() => setInfants(prev => prev + 1)}
                        className="h-6 w-6 rounded-full bg-white text-slate-600 hover:text-[#0B3B8C] border border-slate-100 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Rooms Count */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-extrabold text-[#0B3B8C] flex items-center gap-1">
                        <Bed size={13} /> Rooms
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium">Preferred rooms</span>
                    </div>
                    <div className="flex items-center gap-2.5 bg-slate-50 rounded-full border border-slate-100 px-2 py-1 shrink-0">
                      <button
                        type="button"
                        disabled={rooms <= 1}
                        onClick={() => setRooms(prev => Math.max(1, prev - 1))}
                        className="h-6 w-6 rounded-full bg-white text-slate-600 hover:text-[#0B3B8C] border border-slate-100 shadow-sm flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-extrabold text-[#0B3B8C] min-w-[14px] text-center">{rooms}</span>
                      <button
                        type="button"
                        onClick={() => setRooms(prev => prev + 1)}
                        className="h-6 w-6 rounded-full bg-white text-slate-600 hover:text-[#0B3B8C] border border-slate-100 shadow-sm flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowGuestsDropdown(false)}
                    className="w-full bg-[#0B3B8C] text-white font-extrabold text-xs uppercase tracking-wider py-2.5 rounded-full hover:bg-opacity-95 transition-all cursor-pointer border-0"
                  >
                    Apply Guests
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Search Dispatch Button - Prominent, large, bold, centered below */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center">
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="w-full md:w-auto bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-black rounded-xl px-12 py-4 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-xs md:text-sm uppercase tracking-widest border-0"
          >
            Find My Perfect Trip
          </button>
        </div>

      </div>
    </div>
  );
}
