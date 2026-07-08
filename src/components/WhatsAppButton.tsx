import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';

export default function WhatsAppButton() {
  const { trackWhatsAppClick } = useAnalytics();

  const handleWhatsAppClick = () => {
    if (trackWhatsAppClick) {
      trackWhatsAppClick('Floating Button', 'General Inquiry');
    }
    const phoneNumber = '255629506063';
    const message = 'Hello Zanzibar Trip & Relax, I would like more information about your tours.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 select-none pointer-events-auto">
      <div className="relative">
        {/* Pulsing ring animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
        
        {/* The Official WhatsApp Button */}
        <button
          onClick={handleWhatsAppClick}
          className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer group border border-white/10"
          style={{ 
            boxShadow: '0 8px 24px -4px rgba(37, 211, 102, 0.4)' 
          }}
          aria-label="Chat with us on WhatsApp"
          id="floating-btn-whatsapp"
        >
          <MessageCircle size={30} fill="currentColor" className="transition-transform group-hover:rotate-6 duration-300 shrink-0 text-white" />
        </button>
      </div>
    </div>
  );
}
