import { useState, useEffect } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAnalytics } from '../context/AnalyticsContext';

export default function WhatsAppButton() {
  const { trackWhatsAppClick } = useAnalytics();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show the tooltip after 3 seconds to attract attention, then auto-hide after 8 seconds
    const showTimer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 11000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleClick = () => {
    trackWhatsAppClick('Floating Button', 'General Inquiry');
    
    const phoneNumber = '255629506063';
    const message = 'Jambo! 🌴 I am on your website and would like to inquire about Zanzibar tours, safaris, and packages. Please connect me to a travel specialist.';
    
    // Redirect cleanly on all devices
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none select-none"
      id="floating-whatsapp-container"
    >
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="mb-3 bg-white text-[#0B3B8C] border border-emerald-100 shadow-xl px-4 py-2.5 rounded-2xl flex items-center gap-2 pointer-events-auto max-w-[260px] cursor-pointer"
            onClick={handleClick}
            style={{
              boxShadow: '0 10px 25px -5px rgba(37, 211, 102, 0.15), 0 8px 10px -5px rgba(37, 211, 102, 0.1)'
            }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="text-left">
              <p className="text-[11px] font-black tracking-tight flex items-center gap-1 leading-none text-[#0B3B8C]">
                <span>NEED HELP?</span>
                <Sparkles size={10} className="text-[#D4A017] fill-[#D4A017]" />
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                Chat with us on WhatsApp
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative pointer-events-auto">
        {/* Infinite pulse background ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />

        {/* Floating trigger button */}
        <button
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer group border border-white/10"
          style={{ 
            boxShadow: '0 10px 25px -4px rgba(37, 211, 102, 0.45)' 
          }}
          aria-label="Chat with us on WhatsApp"
        >
          <MessageCircle size={28} fill="white" className="transition-transform group-hover:rotate-6 duration-300 shrink-0" />
        </button>
      </div>
    </div>
  );
}
