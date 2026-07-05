import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, HelpCircle, Lock, Calendar, Star, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getDateBlockages, DateBlockage } from '../lib/cmsStore';

interface MultiMonthCalendarProps {
  selectedDate?: string; // YYYY-MM-DD
  onDateSelect?: (date: string) => void;
  selectedRange?: { start: string; end: string };
  onRangeSelect?: (range: { start: string; end: string }) => void;
  isMultiSelect?: boolean; // If true, selects range of arrival -> departure
  minDate?: string;
  category?: string;
}

const SYSTEM_BLOCKED_DATES = [
  '2026-07-15', '2026-07-16', '2026-07-17', // Fully Booked peak safari slots
  '2026-08-10', '2026-08-11',              // Zanzibar Cultural Festival Blockouts
  '2026-12-25', '2026-12-31', '2027-01-01'  // Premium high-season private party blocks
];

// Predefined high-demand/limited availability dates for realistic depth
const SYSTEM_LIMITED_DATES = [
  '2026-07-12', '2026-07-13', '2026-07-24', '2026-07-28',
  '2026-08-05', '2026-08-14', '2026-08-18', '2026-08-22',
  '2026-09-05', '2026-09-15', '2026-09-20',
  '2026-12-20', '2026-12-24', '2026-12-28'
];

export default function MultiMonthCalendar({
  selectedDate = '',
  onDateSelect,
  selectedRange = { start: '', end: '' },
  onRangeSelect,
  isMultiSelect = false,
  minDate = new Date().toISOString().split('T')[0],
  category = 'tour'
}: MultiMonthCalendarProps) {
  // Calendar base month view state (starting month)
  const [baseMonth, setBaseMonth] = useState(() => {
    const today = new Date();
    // If we have a selected date, start the calendar window there
    if (selectedDate) {
      const parsed = new Date(selectedDate);
      if (!isNaN(parsed.getTime())) return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    } else if (selectedRange.start) {
      const parsed = new Date(selectedRange.start);
      if (!isNaN(parsed.getTime())) return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Load blockages from CMS
  const blockages = useMemo(() => {
    try {
      return getDateBlockages();
    } catch {
      return [];
    }
  }, []);

  // Compute second month for side-by-side view
  const secondMonth = useMemo(() => {
    return new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);
  }, [baseMonth]);

  // Navigate windows
  const prevMonths = () => {
    const today = new Date();
    const minLimit = new Date(today.getFullYear(), today.getMonth(), 1);
    const newBase = new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1);
    
    // Prevent navigating into the past entirely
    if (newBase >= minLimit || baseMonth.getMonth() !== minLimit.getMonth() || baseMonth.getFullYear() !== minLimit.getFullYear()) {
      setBaseMonth(newBase);
    }
  };

  const nextMonths = () => {
    setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1));
  };

  // Helper: Format cell date to YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Helper: Get status details of a specific day
  const getDayStatus = (dateStr: string): {
    disabled: boolean;
    blocked: boolean;
    limited: boolean;
    guaranteed: boolean;
    notes: string;
  } => {
    const cellDate = new Date(dateStr);
    cellDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past dates
    if (cellDate < today) {
      return { disabled: true, blocked: false, limited: false, guaranteed: false, notes: 'Past date' };
    }

    // Min date limits
    if (minDate) {
      const parsedMin = new Date(minDate);
      parsedMin.setHours(0, 0, 0, 0);
      if (cellDate < parsedMin) {
        return { disabled: true, blocked: false, limited: false, guaranteed: false, notes: 'Before minimum date' };
      }
    }

    // Check system hardcoded blocked dates
    if (SYSTEM_BLOCKED_DATES.includes(dateStr)) {
      return { disabled: false, blocked: true, limited: false, guaranteed: false, notes: 'Fully booked (Peak Safari Slot)' };
    }

    // Check CMS blockages
    const cmsMatch = blockages.find(b => b.date === dateStr);
    if (cmsMatch) {
      const isBlocked = cmsMatch.status === 'fully_booked' || cmsMatch.status === 'seasonal_closure';
      const isLimited = cmsMatch.status === 'limited';
      const isGuaranteed = cmsMatch.status === 'guaranteed_departure';
      return {
        disabled: false,
        blocked: isBlocked,
        limited: isLimited,
        guaranteed: isGuaranteed,
        notes: cmsMatch.notes || (isBlocked ? 'No Capacity' : isLimited ? 'Limited Availability' : 'Guaranteed Departure')
      };
    }

    // Check system hardcoded limited dates
    if (SYSTEM_LIMITED_DATES.includes(dateStr)) {
      return { disabled: false, blocked: false, limited: true, guaranteed: false, notes: 'Limited capacity left' };
    }

    // Fallback standard available day
    return { disabled: false, blocked: false, limited: false, guaranteed: false, notes: 'Available' };
  };

  // Click handler
  const handleDateClick = (dateStr: string, status: ReturnType<typeof getDayStatus>) => {
    if (status.disabled || status.blocked) return;

    if (isMultiSelect) {
      if (!onRangeSelect) return;
      
      // Selecting range flow
      if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
        // Reset and set as start date
        onRangeSelect({ start: dateStr, end: '' });
      } else {
        // Set as end date (ensure it's after start date, otherwise swap them)
        const startParsed = new Date(selectedRange.start);
        const clickedParsed = new Date(dateStr);
        if (clickedParsed < startParsed) {
          onRangeSelect({ start: dateStr, end: selectedRange.start });
        } else {
          onRangeSelect({ start: selectedRange.start, end: dateStr });
        }
      }
    } else {
      if (onDateSelect) {
        onDateSelect(dateStr);
      }
    }
  };

  // Helper to determine if date is selected or part of range
  const isSelected = (dateStr: string): boolean => {
    if (isMultiSelect) {
      return dateStr === selectedRange.start || dateStr === selectedRange.end;
    }
    return dateStr === selectedDate;
  };

  const isInRange = (dateStr: string): boolean => {
    if (!isMultiSelect || !selectedRange.start || !selectedRange.end) return false;
    const current = new Date(dateStr);
    const start = new Date(selectedRange.start);
    const end = new Date(selectedRange.end);
    return current > start && current < end;
  };

  const isRangeStart = (dateStr: string): boolean => {
    return isMultiSelect && dateStr === selectedRange.start;
  };

  const isRangeEnd = (dateStr: string): boolean => {
    return isMultiSelect && dateStr === selectedRange.end;
  };

  // Helper: render single calendar month
  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const cells = [...blanks, ...days];

    const monthLabel = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="flex-1 bg-[#020C1F]/60 backdrop-blur-md rounded-2xl p-5 border border-white/5 shadow-inner">
        <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono text-center mb-4">
          {monthLabel}
        </h4>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-[#D4A017] uppercase tracking-wider mb-2.5">
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`blank-${idx}`} className="h-9 w-9" />;
            }

            const dateStr = formatDateString(year, month, day);
            const status = getDayStatus(dateStr);
            const isSel = isSelected(dateStr);
            const isRng = isInRange(dateStr);
            const isStart = isRangeStart(dateStr);
            const isEnd = isRangeEnd(dateStr);

            let bgStyle = 'text-slate-300 hover:bg-white/5 hover:text-white';
            if (status.disabled) {
              bgStyle = 'text-slate-600 opacity-20 cursor-not-allowed line-through';
            } else if (status.blocked) {
              bgStyle = 'bg-red-500/10 text-red-500/40 cursor-not-allowed border border-red-500/20 line-through';
            } else if (isSel) {
              bgStyle = 'bg-[#D4A017] text-[#020C1F] font-black scale-105 shadow-md shadow-[#D4A017]/35 ring-2 ring-white/10';
            } else if (isRng) {
              bgStyle = 'bg-[#0B3B8C]/40 text-white font-semibold border-y border-dashed border-[#0B3B8C]/50';
            } else if (status.limited) {
              bgStyle = 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30';
            } else if (status.guaranteed) {
              bgStyle = 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30';
            }

            return (
              <button
                key={`cell-${day}`}
                type="button"
                disabled={status.disabled || status.blocked}
                onClick={() => handleDateClick(dateStr, status)}
                onMouseEnter={() => !status.disabled && setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                className={`h-9 w-9 rounded-lg text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer ${bgStyle}`}
              >
                <span>{day}</span>
                
                {/* Visual Indicators Inside Cells */}
                {!isSel && !isRng && status.limited && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                )}
                {!isSel && !isRng && status.guaranteed && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-400" />
                )}
                {status.blocked && (
                  <span className="absolute bottom-0.5 right-0.5 scale-75 opacity-40">
                    <Lock size={6} className="text-red-400" />
                  </span>
                )}

                {/* Range start/end pill indicators */}
                {isStart && isMultiSelect && (
                  <span className="absolute -top-1 px-1 py-0.2 bg-[#0B3B8C] text-white text-[7px] font-extrabold uppercase rounded-full tracking-wider">Start</span>
                )}
                {isEnd && isMultiSelect && (
                  <span className="absolute -top-1 px-1 py-0.2 bg-[#10B981] text-white text-[7px] font-extrabold uppercase rounded-full tracking-wider">End</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Find info about hovered date or currently selected date for details bar
  const activeDateInfo = useMemo(() => {
    const target = hoveredDate || (isMultiSelect ? selectedRange.start : selectedDate);
    if (!target) return null;

    const parsed = new Date(target);
    if (isNaN(parsed.getTime())) return null;

    const status = getDayStatus(target);
    const dateLabel = parsed.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return {
      date: target,
      label: dateLabel,
      status
    };
  }, [hoveredDate, selectedDate, selectedRange, isMultiSelect]);

  return (
    <div className="w-full bg-[#0a1428] rounded-3xl p-6 border border-white/10 shadow-xl text-white select-none">
      {/* Calendar Top Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#D4A017]/10 text-[#D4A017] rounded-xl border border-[#D4A017]/20">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider font-sans text-slate-100">
              Interactive Availability Calendar
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              {isMultiSelect 
                ? 'Select travel window (Arrival to Departure) to secure locked slots' 
                : 'Click available dates directly to select preferred departure'}
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonths}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextMonths}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Months Container */}
      <div className="flex flex-col md:flex-row gap-6">
        {renderMonth(baseMonth)}
        {renderMonth(secondMonth)}
      </div>

      {/* Info details / Dynamic Status Bar */}
      <div className="mt-5 bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {activeDateInfo ? (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              activeDateInfo.status.blocked 
                ? 'bg-red-500/10 text-red-400' 
                : activeDateInfo.status.limited 
                ? 'bg-amber-500/10 text-amber-400 animate-pulse' 
                : 'bg-[#D4A017]/10 text-[#D4A017]'
            }`}>
              <Info size={16} />
            </div>
            <div>
              <p className="font-extrabold text-slate-200">{activeDateInfo.label}</p>
              <p className={`text-[10px] font-bold ${
                activeDateInfo.status.blocked 
                  ? 'text-red-400' 
                  : activeDateInfo.status.limited 
                  ? 'text-amber-400' 
                  : 'text-slate-400'
              }`}>
                {activeDateInfo.status.notes}
                {activeDateInfo.status.limited && ' — High Demand! Secure early.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-slate-400 text-[11px] font-medium py-1">
            <HelpCircle size={15} className="text-slate-500" />
            <span>Hover or select a date to see availability details.</span>
          </div>
        )}

        {/* Selected Output helper */}
        {(isMultiSelect ? (selectedRange.start) : (selectedDate)) && (
          <div className="bg-[#D4A017]/10 border border-[#D4A017]/20 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#D4A017] flex items-center gap-2 self-start sm:self-auto">
            <Star size={11} className="fill-[#D4A017]" />
            <span>
              {isMultiSelect 
                ? `Range: ${selectedRange.start} ${selectedRange.end ? `to ${selectedRange.end}` : '(choose departure)'}`
                : `Selected Date: ${selectedDate}`}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Legend Box */}
      <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-white/5 border border-white/5" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400" />
          <span className="text-amber-400">Limited Availability</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-red-500/15 border border-red-500/30 text-red-400" />
          <span className="text-red-400">No Capacity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#D4A017]" />
          <span className="text-[#D4A017]">Selected</span>
        </div>
      </div>
    </div>
  );
}
