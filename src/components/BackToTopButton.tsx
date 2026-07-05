import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 p-3 bg-[#0B3B8C] text-white hover:bg-[#D4A017] rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer group border border-white/10"
          style={{ 
            boxShadow: '0 8px 20px -4px rgba(11, 59, 140, 0.4)' 
          }}
          aria-label="Scroll back to top"
        >
          <ArrowUp size={20} className="transition-transform group-hover:-translate-y-0.5 duration-300" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
