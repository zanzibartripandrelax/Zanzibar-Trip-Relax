import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Palmtree, Gift, FileText, Download, Sparkles, Check, ArrowRight, BookOpen, Compass
} from 'lucide-react';
import { showToast } from './ToastNotification';

interface ExitIntentModalProps {
  onApplyDiscount: (code: string) => void;
  isAlreadySubmitted: boolean;
}

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({ 
  onApplyDiscount, 
  isAlreadySubmitted 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [guideDownloaded, setGuideDownloaded] = useState(false);

  useEffect(() => {
    // Skip if booking is already submitted or already shown this session
    if (isAlreadySubmitted || sessionStorage.getItem('ztr-exit-intent-shown')) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when cursor leaves the top of the viewport (typical tab-closing intent)
      if (e.clientY < 20 && !hasTriggered) {
        setIsOpen(true);
        setHasTriggered(true);
        sessionStorage.setItem('ztr-exit-intent-shown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasTriggered, isAlreadySubmitted]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('SWAHILI10');
    setCopiedCode(true);
    showToast('Promo Code SWAHILI10 copied to clipboard!', 'success');
    onApplyDiscount('SWAHILI10');
    
    // Auto close after brief moment
    setTimeout(() => {
      setIsOpen(false);
    }, 1500);
  };

  const handleDownloadGuide = () => {
    setGuideDownloaded(true);
    showToast('Zanzibar Insider Guide download initiated!', 'info');
    
    // Simulate downloading an elegant local travel booklet
    const link = document.createElement('a');
    link.href = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80';
    link.download = 'Zanzibar_Insider_Travel_Guide_2026.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#0b3b8c]/10 max-w-lg w-full z-10"
          >
            {/* Top decorative stripe */}
            <div className="h-2 bg-gradient-to-r from-[#0B3B8C] via-[#D4A017] to-[#0B3B8C]" />

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-colors cursor-pointer z-20"
            >
              <X size={16} />
            </button>

            {/* Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Header Badge */}
              <div className="text-center">
                <span className="inline-flex items-center gap-1 bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/25 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  <Sparkles size={11} />
                  Exclusive Zanzibar Gift Desk
                </span>
                <h3 className="text-2xl font-black text-[#0B3B8C] mt-3 tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Wait! Before You Leave Zanzibar Behind...
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto">
                  Your tropical adventure is just a click away. Don't leave without our exclusive swahili benefits!
                </p>
              </div>

              {/* TWO AMAZING CHOICES PANEL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CHOICE 1: 10% DISCOUNT CODE */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between text-left space-y-4 hover:border-[#D4A017]/30 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#D4A017]">
                      <Gift size={20} />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">10% Holiday Discount</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Apply custom discount code at checkout and enjoy immediate savings on all excursions.
                    </p>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="w-full bg-[#0b3b8c] hover:bg-[#062862] text-white hover:text-white font-black text-[10px] py-2.5 rounded-xl uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    {copiedCode ? <Check size={12} /> : <Gift size={12} />}
                    <span>{copiedCode ? 'Applied!' : 'Get 10% Off'}</span>
                  </button>
                </div>

                {/* CHOICE 2: TRAVEL GUIDE */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col justify-between text-left space-y-4 hover:border-[#0b3b8c]/20 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0b3b8c]">
                      <BookOpen size={20} />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">Local Insider Guide</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Download our pocket-sized PDF guide covering hidden beaches, coral reefs, and Stone Town secrets.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadGuide}
                    className="w-full bg-[#D4A017] hover:bg-[#b88612] text-white hover:text-white font-black text-[10px] py-2.5 rounded-xl uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    {guideDownloaded ? <Check size={12} /> : <Download size={12} />}
                    <span>{guideDownloaded ? 'Downloaded!' : 'Download Guide'}</span>
                  </button>
                </div>
              </div>

              {/* TRUST BADGES & BOTTOM LINE */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <Palmtree size={12} className="text-[#D4A017]" />
                  Secure Reservation Guarantee
                </span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[#0b3b8c] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer flex items-center gap-0.5"
                >
                  No thanks, resume booking
                  <ArrowRight size={10} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
