import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, Settings2, ShieldCheck } from 'lucide-react';
import { initGA } from '../lib/analytics';
import { logger } from '../lib/logger';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if consent was already given
    const savedConsent = localStorage.getItem('ztr_cookie_consent');
    if (!savedConsent) {
      // Delay presentation slightly to maximize UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        setPreferences(parsed);
        // Initialize GA if allowed
        if (parsed.analytics) {
          initGA();
        }
      } catch (e) {
        logger.error('CookieConsent', 'Failed to parse saved cookie consent', e);
        setShowBanner(true);
      }
    }
  }, []);

  const saveConsent = (updatedPrefs: CookiePreferences) => {
    localStorage.setItem('ztr_cookie_consent', JSON.stringify(updatedPrefs));
    logger.security('CookieConsent', 'User updated cookie consent settings', updatedPrefs);
    
    // Trigger GA initialization dynamically
    if (updatedPrefs.analytics) {
      initGA();
    } else {
      // If disabled after being enabled, we trigger a page reload or opt-out flag
      const GA_ID = (import.meta as any).env.VITE_GA_MEASUREMENT_ID || '';
      if (GA_ID) {
        window[`ga-disable-${GA_ID}`] = true;
      }
    }
    
    setShowBanner(false);
  };

  const handleAcceptAll = () => {
    const allPrefs = { essential: true, analytics: true, marketing: true };
    setPreferences(allPrefs);
    saveConsent(allPrefs);
  };

  const handleDeclineAll = () => {
    const minPrefs = { essential: true, analytics: false, marketing: false };
    setPreferences(minPrefs);
    saveConsent(minPrefs);
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150 }}
          className="fixed bottom-6 left-4 right-4 md:left-6 md:right-auto md:max-w-md bg-[#0A1224] border border-white/10 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
          id="cookie-consent-container"
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017] shrink-0">
                <Cookie size={20} />
              </div>
              <div className="space-y-1 flex-1">
                <h3 id="cookie-consent-title" className="font-bold text-white text-base">
                  Cookie Consent
                </h3>
                <p id="cookie-consent-desc" className="text-gray-400 text-xs leading-relaxed">
                  We use cookies to optimize site features, analyze traffic, and enhance your custom trip planner. Agree to our premium standard privacy measures.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeclineAll}
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Close cookie consent banner"
              >
                <X size={16} />
              </button>
            </div>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 border-t border-white/5 pt-4 space-y-4"
              >
                <div className="space-y-3">
                  {/* Essential */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-[#D4A017]" />
                        Essential Cookies
                      </h4>
                      <p className="text-[10px] text-gray-400">Required for security, portal session logins and core functions.</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#D4A017] bg-[#D4A017]/10 px-2.5 py-1 rounded-md uppercase">
                      Required
                    </span>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                    <div>
                      <h4 className="text-xs font-bold text-white">Performance & Analytics</h4>
                      <p className="text-[10px] text-gray-400">Helps us study travel behaviors to improve guided itineraries.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4A017]"></div>
                    </label>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                    <div>
                      <h4 className="text-xs font-bold text-white">Marketing & Retargeting</h4>
                      <p className="text-[10px] text-gray-400">Allows customized travel promotions and safari suggestions.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4A017]"></div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDetails(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2 rounded-xl border border-white/5 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    className="flex-1 bg-[#D4A017] hover:bg-[#c49010] text-white font-bold text-xs py-2 rounded-xl transition-all"
                  >
                    Apply Settings
                  </button>
                </div>
              </motion.div>
            )}

            {!showDetails && (
              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-white/5 transition-all"
                >
                  <Settings2 size={14} />
                  Customize
                </button>
                <div className="flex gap-2.5 flex-1">
                  <button
                    type="button"
                    onClick={handleDeclineAll}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs py-2.5 rounded-xl border border-white/5 transition-all"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex-1 bg-[#D4A017] hover:bg-[#c49010] text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
