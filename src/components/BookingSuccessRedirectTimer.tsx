import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface BookingSuccessRedirectTimerProps {
  countdown: number;
  totalDuration?: number;
  redirectCancelled: boolean;
  onCancel: () => void;
  onManualRedirect: () => void;
}

export const BookingSuccessRedirectTimer: React.FC<BookingSuccessRedirectTimerProps> = ({
  countdown,
  totalDuration = 20,
  redirectCancelled,
  onCancel,
  onManualRedirect,
}) => {
  const percentage = (countdown / totalDuration) * 100;

  if (redirectCancelled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600 max-w-lg mx-auto shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-gray-700">Auto-redirection paused. Take your time to review details.</span>
        </div>
        <button
          onClick={onManualRedirect}
          className="bg-[#0B3B8C] hover:bg-[#062862] text-white font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <span>Go Home Now</span>
          <ArrowRight size={14} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex flex-col gap-4 max-w-lg mx-auto shadow-sm relative overflow-hidden"
    >
      {/* Dynamic Background subtle progress bar track */}
      <div className="absolute bottom-0 left-0 h-1 bg-amber-200/40 w-full" />
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-[#D4A017]"
        initial={{ width: "100%" }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "linear" }}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 text-left">
          <div className="relative flex items-center justify-center shrink-0">
            {/* Elegant Circular Countdown Indicator */}
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="rgba(212, 160, 23, 0.15)"
                strokeWidth="3.5"
                fill="transparent"
              />
              <motion.circle
                cx="20"
                cy="20"
                r="16"
                stroke="#D4A017"
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray="100.5"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: 100.5 - (100.5 * percentage) / 100 }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <span className="absolute text-[#D4A017] font-mono font-black text-xs">{countdown}</span>
          </div>
          <div>
            <h5 className="font-black text-[#0B3B8C] uppercase tracking-wider text-[10px] font-mono mb-0.5">Redirecting shortly</h5>
            <p className="text-gray-500 font-medium leading-normal">Returning to the Swahili main portal...</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="bg-white hover:bg-gray-50 text-gray-700 font-extrabold px-3 py-2 rounded-xl border border-gray-200 shadow-sm cursor-pointer transition-colors text-[10px] uppercase tracking-wider whitespace-nowrap"
          >
            Stay Here
          </button>
          <button
            onClick={onManualRedirect}
            className="bg-[#0B3B8C]/10 hover:bg-[#0B3B8C]/20 text-[#0B3B8C] font-extrabold px-3 py-2 rounded-xl transition-colors text-[10px] uppercase tracking-wider whitespace-nowrap cursor-pointer flex items-center gap-1"
          >
            <span>Now</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
