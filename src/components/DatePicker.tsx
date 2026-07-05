import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, AlertTriangle, ShieldAlert, Lock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getDateBlockages } from '../lib/cmsStore';

export interface DatePickerProps {
  selectedDate: string; // Format: YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;     // Format: YYYY-MM-DD
  maxDate?: string;     // Format: YYYY-MM-DD
  blockedDates?: string[]; // Array of YYYY-MM-DD strings that are unavailable
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  label?: string;
}

// Default system-wide Zanzibar fully booked/blocked dates for premium service compliance
const SYSTEM_BLOCKED_DATES = [
  '2026-07-15', '2026-07-16', '2026-07-17', // Fully Booked peak safari slots
  '2026-08-10', '2026-08-11',              // Zanzibar Cultural Festival Blockouts
  '2026-12-25', '2026-12-31', '2027-01-01'  // Premium high-season private party blocks
];

export default function DatePicker({
  selectedDate,
  onChange,
  minDate,
  maxDate,
  blockedDates = [],
  placeholder = 'Select Date',
  className = '',
  required = false,
  disabled = false,
  name,
  label
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Base month view state
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const parsed = new Date(selectedDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync calendar view month with selectedDate if it changes externally
  useEffect(() => {
    if (selectedDate) {
      const parsed = new Date(selectedDate);
      if (!isNaN(parsed.getTime())) {
        setCurrentMonth(parsed);
      }
    }
  }, [selectedDate]);

  // Combine standard blocked dates, custom props ones, and CMS dynamic ones
  const allBlockedDates = useMemo(() => {
    let cmsBlocked: string[] = [];
    try {
      const blockages = getDateBlockages();
      if (blockages && Array.isArray(blockages)) {
        cmsBlocked = blockages
          .filter(b => b.status === 'fully_booked' || b.status === 'seasonal_closure')
          .map(b => b.date);
      }
    } catch (e) {
      console.error("Failed to load CMS blockages", e);
    }
    const combined = new Set([...SYSTEM_BLOCKED_DATES, ...blockedDates, ...cmsBlocked]);
    return Array.from(combined);
  }, [blockedDates]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format YYYY-MM-DD helper
  const formatDateString = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Human friendly formatter
  const displayLabel = useMemo(() => {
    if (!selectedDate) return placeholder;
    const parsed = new Date(selectedDate);
    if (isNaN(parsed.getTime())) return placeholder;
    return parsed.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, [selectedDate, placeholder]);

  // Is a specific cell day blocked?
  const isDateBlocked = (dateStr: string): boolean => {
    return allBlockedDates.includes(dateStr);
  };

  // Is a date out of min/max bounds or past today?
  const isDateDisabled = (dateStr: string): boolean => {
    const cellDate = new Date(dateStr);
    cellDate.setHours(0,0,0,0);

    const today = new Date();
    today.setHours(0,0,0,0);

    if (cellDate < today) return true;

    if (minDate) {
      const minLimit = new Date(minDate);
      minLimit.setHours(0,0,0,0);
      if (cellDate < minLimit) return true;
    }

    if (maxDate) {
      const maxLimit = new Date(maxDate);
      maxLimit.setHours(0,0,0,0);
      if (cellDate > maxLimit) return true;
    }

    return false;
  };

  // Month navigation
  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Date selection click
  const handleSelectDay = (day: number) => {
    const dateStr = formatDateString(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (isDateDisabled(dateStr) || isDateBlocked(dateStr)) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  // Calendar rendering calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarCells = [...blanks, ...days];

  const monthLabelString = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Real-time error validation block check
  const isSelectedDateBlocked = useMemo(() => {
    return selectedDate ? isDateBlocked(selectedDate) : false;
  }, [selectedDate, allBlockedDates]);

  return (
    <div ref={wrapperRef} className={`relative select-none w-full ${className}`}>
      {label && (
        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center justify-between">
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
          {isSelectedDateBlocked && (
            <span className="text-[10px] text-red-650 font-black animate-pulse flex items-center gap-1">
              <ShieldAlert size={10} />
              Fully Booked / Blocked
            </span>
          )}
        </label>
      )}

      {/* Selector Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4.5 py-3.5 text-xs font-bold rounded-xl border flex items-center justify-between transition-all bg-white cursor-pointer ${
          disabled 
            ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed' 
            : isSelectedDateBlocked
            ? 'border-red-300 text-red-700 focus:ring-4 focus:ring-red-100 bg-red-50/10'
            : isOpen
            ? 'border-[#0B3B8C] ring-4 ring-[#0B3B8C]/10 text-gray-800'
            : 'border-slate-200 text-gray-700 hover:border-slate-300 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10'
        }`}
      >
        <span className="flex items-center gap-2.5 truncate">
          <CalendarIcon size={14} className={isSelectedDateBlocked ? 'text-red-600' : 'text-[#D4A017]'} />
          <span className={!selectedDate ? 'text-gray-400 font-medium' : 'text-gray-800 font-bold'}>
            {displayLabel}
          </span>
        </span>
        <ChevronRight size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Validation Message */}
      {isSelectedDateBlocked && (
        <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-red-700 bg-red-50 border border-red-100 p-2 rounded-xl animate-shake">
          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
          <span>This date is unavailable or fully booked. Please select an alternative travel date.</span>
        </div>
      )}

      {/* Popover Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{ originY: 0 }}
            className="absolute left-0 right-0 md:left-auto md:w-[320px] top-full mt-2 bg-[#020C1F] border border-white/10 rounded-2xl shadow-2xl p-4.5 z-50 text-white"
          >
            {/* Header / Month switching */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest font-mono">
                {monthLabelString}
              </h4>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2 text-[9px] font-black text-slate-400 uppercase tracking-wider">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                if (cell === null) return <div key={`blank-${idx}`} className="h-8 w-8" />;
                
                const cellDateStr = formatDateString(year, month, cell);
                const isSel = cellDateStr === selectedDate;
                const isDis = isDateDisabled(cellDateStr);
                const isBlk = isDateBlocked(cellDateStr);

                return (
                  <button
                    key={`day-${cell}`}
                    type="button"
                    disabled={isDis || isBlk}
                    onClick={() => handleSelectDay(cell)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                      isSel 
                        ? 'bg-[#D4A017] text-[#020C1F] font-black scale-105 shadow-md shadow-[#D4A017]/30' 
                        : isBlk
                        ? 'bg-red-500/10 text-red-400/45 cursor-not-allowed border border-red-500/15 line-through'
                        : isDis
                        ? 'text-slate-600 cursor-not-allowed opacity-25 line-through' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white hover:scale-105'
                    }`}
                    title={isBlk ? 'Fully Booked' : isDis ? 'Unavailable' : undefined}
                  >
                    <span>{cell}</span>
                    {isBlk && (
                      <span className="absolute bottom-0.5 right-0.5 scale-75 origin-bottom-right opacity-70">
                        <Lock size={6} className="text-red-400" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-[#D4A017]" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-red-500/20 border border-red-500/20" />
                <span>Fully Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-white/5" />
                <span>Available</span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
