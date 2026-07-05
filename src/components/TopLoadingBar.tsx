import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TopLoadingBarProps {
  isSyncing: boolean; // CMS Syncing state
  triggerKey: string; // Changes on route transitions to trigger a progress animation
}

export const TopLoadingBar: React.FC<TopLoadingBarProps> = ({ isSyncing, triggerKey }) => {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(true);
  const [visible, setVisible] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all active timers
  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
  };

  // Start/Reset the loading simulation
  const startLoading = (isInitialCmsSync: boolean) => {
    clearTimers();
    setVisible(true);
    setActive(true);
    setProgress(0);

    // Initial immediate step to make it feel responsive
    setTimeout(() => {
      setProgress(25);
    }, 50);

    // Steady crawl simulation
    let current = 25;
    timerRef.current = setInterval(() => {
      if (isInitialCmsSync) {
        // For CMS Sync, we crawl more slowly to stay visible until the sync promise actually resolves
        if (current < 85) {
          current += Math.random() * 4 + 1;
          setProgress(Math.min(current, 85));
        }
      } else {
        // For route changes, we simulate a fast, snappy 350ms transition
        if (current < 90) {
          current += Math.random() * 12 + 8;
          setProgress(Math.min(current, 90));
        } else {
          // Trigger automatic completion after it reaches the 90% threshold for routes
          completeLoading();
        }
      }
    }, 80);
  };

  // Gracefully transition to 100% and fade out
  const completeLoading = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setProgress(100);
    
    // Hold at 100% briefly, then fade out
    finishTimerRef.current = setTimeout(() => {
      setActive(false);
      // Wait for exit animation to finish before removing from layout
      setTimeout(() => {
        setVisible(false);
      }, 250);
    }, 200);
  };

  // Monitor CMS Sync state
  useEffect(() => {
    if (isSyncing) {
      startLoading(true);
    } else {
      completeLoading();
    }
    return clearTimers;
  }, [isSyncing]);

  // Monitor Route changes
  useEffect(() => {
    // Skip if CMS is still syncing on mount to avoid double animation collisions
    if (!isSyncing) {
      startLoading(false);
    }
    return clearTimers;
  }, [triggerKey]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none">
          {/* Progress Bar Container */}
          <div className="w-full bg-transparent h-[3px.5] relative">
            {/* Elegant Gradient Progress Bar */}
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              exit={{ opacity: 0 }}
              transition={{
                width: { type: 'tween', ease: progress === 100 ? 'easeOut' : 'linear', duration: progress === 100 ? 0.25 : 0.1 },
                opacity: { duration: 0.2 }
              }}
              className="h-[3px] bg-gradient-to-r from-[#0B3B8C] via-[#2E6BCC] to-[#D4A017] shadow-[0_1px_10px_rgba(212,160,23,0.7)] relative"
            >
              {/* Glowing Particle Tip */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white opacity-90 blur-[1px] animate-pulse" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#D4A017] shadow-[0_0_8px_#D4A017] animate-ping" />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
