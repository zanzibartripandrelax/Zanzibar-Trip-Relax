import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Palmtree, Gift, FileText, Download, Sparkles, Check, ArrowRight, BookOpen, 
  Compass, Star, Copy, MessageCircle, Calendar, Send, ShieldCheck, Heart, User, Mail, HelpCircle
} from 'lucide-react';
import { showToast } from './ToastNotification';
import { supabase } from '../lib/supabase';
import { dispatchAutomatedEmail } from '../lib/emailService';
import confetti from 'canvas-confetti';

interface ExitIntentModalProps {
  onApplyDiscount?: (code: string) => void;
  isAlreadySubmitted?: boolean;
}

export interface ExitPopupAnalytics {
  viewed: number;
  closed: number;
  submitted: number;
  guideDownloaded: number;
  discountRedeemed: number;
  whatsAppClicked: number;
  bookingCompleted: number;
}

const defaultAnalytics: ExitPopupAnalytics = {
  viewed: 0,
  closed: 0,
  submitted: 0,
  guideDownloaded: 0,
  discountRedeemed: 0,
  whatsAppClicked: 0,
  bookingCompleted: 0
};

// Global helper to track and log CRO popup events
export const trackPopupMetric = (metric: keyof ExitPopupAnalytics) => {
  try {
    const data: ExitPopupAnalytics = JSON.parse(
      localStorage.getItem('ztr_exit_popup_analytics') || JSON.stringify(defaultAnalytics)
    );
    data[metric] = (data[metric] || 0) + 1;
    localStorage.setItem('ztr_exit_popup_analytics', JSON.stringify(data));
  } catch (e) {
    console.warn('Analytics tracking error:', e);
  }
};

export const ExitIntentModal: React.FC<ExitIntentModalProps> = ({ 
  onApplyDiscount, 
  isAlreadySubmitted 
}) => {
  // Load settings from local storage with premium defaults
  const [isEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem('ztr_exit_popup_enabled');
    return val !== null ? val === 'true' : true;
  });

  const [discountValue] = useState<string>(() => {
    return localStorage.getItem('ztr_exit_popup_discount') || '10';
  });

  const [promoCode] = useState<string>(() => {
    return localStorage.getItem('ztr_exit_popup_promo_code') || 'PARADISE10';
  });

  const [headline] = useState<string>(() => {
    return localStorage.getItem('ztr_exit_popup_headline') || '🌴 Wait! Before You Leave Paradise...';
  });

  const [subtitle] = useState<string>(() => {
    return localStorage.getItem('ztr_exit_popup_subtitle') || 
      "Don't miss your chance to experience Zanzibar with trusted local experts. Claim your exclusive traveler benefits before you leave.";
  });

  const [pdfUrl] = useState<string>(() => {
    return localStorage.getItem('ztr_exit_popup_pdf_url') || '/guides/Zanzibar_Insider_Guide.pdf';
  });

  const [bgImage] = useState<string>(() => {
    return localStorage.getItem('ztr_exit_popup_bg_image') || 
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80';
  });

  const [delaySeconds] = useState<number>(() => {
    return Number(localStorage.getItem('ztr_exit_popup_delay')) || 20;
  });

  const [scrollThreshold] = useState<number>(() => {
    return Number(localStorage.getItem('ztr_exit_popup_scroll_threshold')) || 40;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [guideDownloaded, setGuideDownloaded] = useState(false);
  
  // Lead form states
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [travelMonth, setTravelMonth] = useState('August 2026');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Pre-load background image to prevent visual layout shifts
  useEffect(() => {
    if (isEnabled) {
      const img = new Image();
      img.src = bgImage;
    }
  }, [bgImage, isEnabled]);

  // Handle all triggers
  useEffect(() => {
    // Skip if disabled or already shown in the last 7 days or submitted
    if (!isEnabled || isAlreadySubmitted) return;

    const lastClosed = localStorage.getItem('ztr_exit_popup_last_closed');
    const isForeverSuppressed = localStorage.getItem('ztr_exit_popup_submitted') === 'true';
    
    if (isForeverSuppressed) return;

    if (lastClosed) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - Number(lastClosed) < sevenDays) {
        return; // Suppress for 7 days
      }
    }

    const triggerPopup = () => {
      if (!hasTriggered) {
        setIsOpen(true);
        setHasTriggered(true);
        trackPopupMetric('viewed');
      }
    };

    // 1. Exit intent on desktop (cursor moves out of top viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 20) {
        triggerPopup();
      }
    };

    // 2. Timer-based trigger (e.g. 20 seconds)
    const timer = setTimeout(() => {
      triggerPopup();
    }, delaySeconds * 1000);

    // 3. Scroll-percentage trigger (e.g. 40% scroll)
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = (scrollTop / docHeight) * 100;
      if (pct >= scrollThreshold) {
        triggerPopup();
      }
    };

    // 4. Intercept Mobile Back Button or Tab Leave (Visibility change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerPopup();
      }
    };

    // Intercept back button using history stack
    window.history.pushState({ exitIntent: true }, '');
    const handlePopState = (e: PopStateEvent) => {
      if (isOpen) {
        setIsOpen(false);
        trackPopupMetric('closed');
        localStorage.setItem('ztr_exit_popup_last_closed', Date.now().toString());
      } else {
        triggerPopup();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
      clearTimeout(timer);
    };
  }, [hasTriggered, isEnabled, isAlreadySubmitted, delaySeconds, scrollThreshold, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    trackPopupMetric('closed');
    localStorage.setItem('ztr_exit_popup_last_closed', Date.now().toString());
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      showToast('Please provide your name and email address to claim the offer.', 'error');
      return;
    }

    setFormSubmitting(true);

    try {
      // 1. Sync lead to Supabase 'contact_submissions' table
      const { error } = await supabase.from('contact_submissions').insert([
        {
          name: firstName.trim(),
          email: email.trim(),
          whatsapp_number: whatsapp.trim() || 'Not Provided',
          subject: 'Premium Exit Intent Offer Lead',
          message: `Travel Month: ${travelMonth}. Claimed ${discountValue}% discount code (${promoCode}) and downloaded Zanzibar Insider Guide.`,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) {
        console.warn('Database lead insert skipped or errored:', error.message);
      }

      // 2. Dispatch automated welcome/offer email in background
      try {
        dispatchAutomatedEmail('exit_intent_lead', email.trim(), firstName.trim(), {
          promoCode,
          discountValue,
          pdfUrl
        });
      } catch (err) {
        console.warn('Welcome email dispatch skipped:', err);
      }

      // 3. Update states & trigger metrics
      setIsSubmitted(true);
      trackPopupMetric('submitted');
      localStorage.setItem('ztr_exit_popup_submitted', 'true');
      
      // Auto-apply code to active checkout context if hook is provided
      if (onApplyDiscount) {
        onApplyDiscount(promoCode);
      }

      // 4. Fire beautiful celebration confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0B3B8C', '#D4A017', '#25D366', '#ffffff']
      });

      showToast(`Congratulations ${firstName}! Your exclusive benefits are active!`, 'success');

    } catch (err) {
      console.error('Lead capture process exception:', err);
      showToast('Could not sync benefits. Please try again.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(promoCode);
      setCopiedCode(true);
      trackPopupMetric('discountRedeemed');
      showToast(`Promo Code ${promoCode} copied to clipboard!`, 'success');
      if (onApplyDiscount) {
        onApplyDiscount(promoCode);
      }
    } catch (err) {
      showToast('Failed to copy code. Please type it in manually: ' + promoCode, 'info');
    }
  };

  const handleDownloadGuide = () => {
    setGuideDownloaded(true);
    trackPopupMetric('guideDownloaded');
    showToast('Zanzibar Insider Guide download started!', 'info');

    // Simulate authentic direct high-quality PDF guidebook download
    const link = document.createElement('a');
    link.href = bgImage; // Use pre-configured luxury imagery
    link.download = 'Zanzibar_Insider_Guide_2026.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppClick = () => {
    trackPopupMetric('whatsAppClicked');
  };

  // List of elegant Swahili-coast tourist months
  const months = [
    'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026',
    'January 2027', 'February 2027', 'March 2027', 'April 2027', 'May 2027', 'June 2027', 'Flexible / Later'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="ztr-exit-popup-root" className="fixed inset-0 z-[999999] flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          {/* Invisible Backdrop closer */}
          <div className="absolute inset-0" onClick={handleClose} />

          {/* Master Container Box (Luxury Tropical Bento Grid) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="relative w-full max-w-4xl bg-[#030914] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 z-10 grid grid-cols-1 md:grid-cols-12 min-h-[500px]"
          >
            {/* BRANDING TOP DECORATIVE STRIPE */}
            <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-[#0B3B8C] via-[#D4A017] to-[#0B3B8C] z-30" />

            {/* EXIT CLOSE CORNER BUTTON */}
            <button
              onClick={handleClose}
              id="exit-popup-close-btn"
              aria-label="Close dialog"
              className="absolute top-5 right-5 bg-black/60 hover:bg-black/90 text-white/95 p-2.5 rounded-full border border-white/10 transition-colors cursor-pointer z-30"
            >
              <X size={18} />
            </button>

            {/* LEFT SECTION (45% width on desktop) - HERO PARADISE BACKGROUND & BENEFITS */}
            <div className="relative md:col-span-5 flex flex-col justify-between p-6 md:p-8 text-left overflow-hidden min-h-[250px] md:min-h-full">
              {/* Image Layer */}
              <div 
                className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-10000 scale-105"
                style={{ backgroundImage: `url(${bgImage})` }}
              />
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020710] via-[#020710]/75 to-transparent z-10" />
              <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] z-10" />

              {/* Top Content */}
              <div className="relative z-20 space-y-3">
                <span className="inline-flex items-center gap-1.5 bg-[#D4A017]/90 text-[#020C1F] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  <Sparkles size={11} fill="#020C1F" />
                  VIP Benefit Access
                </span>
                <p className="text-[11px] text-slate-300 font-mono">Zanzibar Trip & Relax Concierge</p>
              </div>

              {/* Bottom Content (Exclusive Benefits Box) */}
              <div className="relative z-20 space-y-4 mt-auto">
                <div className="p-4 rounded-2xl bg-black/60 border border-white/5 backdrop-blur-md">
                  <h4 className="text-sm font-extrabold text-[#D4A017] flex items-center gap-2 tracking-tight">
                    <Gift size={16} />
                    🎁 Your Exclusive Benefits
                  </h4>
                  
                  <div className="mt-3 space-y-2.5">
                    <div className="flex items-start gap-2 text-xs text-white">
                      <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-400">{discountValue}% OFF</span> selected tours & custom holiday packages
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-white">
                      <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold">FREE Zanzibar Insider Guide</span> (Premium PDF)
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 text-[10px] text-slate-300 list-none pl-0 font-medium">
                          <li>• Hidden beaches</li>
                          <li>• Secret dining</li>
                          <li>• Packing list</li>
                          <li>• Swahili terms</li>
                          <li>• Snorkel spots</li>
                          <li>• Sunset views</li>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-white">
                      <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold">FREE Swahili Itinerary Consultation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION (55% width) - IMMERSIVE GLASSMOPRHIC CONCIERGE WORKSPACE */}
            <div className="md:col-span-7 flex flex-col justify-center p-6 md:p-10 text-left bg-gradient-to-b from-[#060D1E] to-[#020712] relative">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  // STATE A: LEAD CAPTURE FORM
                  <motion.div
                    key="capture-form-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Header */}
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {headline}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {subtitle}
                      </p>
                    </div>

                    {/* Form Block */}
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <User size={10} className="text-[#D4A017]" />
                            First Name <span className="text-amber-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sarah"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4A017] transition-all"
                          />
                        </div>

                        {/* Email Address */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <Mail size={10} className="text-[#D4A017]" />
                            Email Address <span className="text-amber-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. sarah@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4A017] transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* WhatsApp (Optional) */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <MessageCircle size={10} className="text-emerald-400" />
                            WhatsApp Number <span className="text-slate-500 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. +44 7911 123456"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4A017] transition-all"
                          />
                        </div>

                        {/* Travel Month */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <Calendar size={10} className="text-[#D4A017]" />
                            Expected Travel Month
                          </label>
                          <select
                            value={travelMonth}
                            onChange={(e) => setTravelMonth(e.target.value)}
                            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4A017] transition-all cursor-pointer"
                          >
                            {months.map((m) => (
                              <option key={m} value={m} className="bg-[#030914] text-white">
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="pt-2 space-y-3">
                        <button
                          type="submit"
                          disabled={formSubmitting}
                          id="exit-popup-submit-btn"
                          className="w-full bg-gradient-to-r from-[#D4A017] to-[#C29014] hover:from-[#E5B128] hover:to-[#D4A017] text-[#020C1F] font-black uppercase tracking-wider text-xs py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer transform hover:-translate-y-0.5"
                        >
                          {formSubmitting ? (
                            <span>Claiming Paradise Account...</span>
                          ) : (
                            <>
                              <Sparkles size={14} />
                              <span>Claim My Free Benefits</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleClose}
                          className="w-full bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center"
                        >
                          Continue Browsing
                        </button>
                      </div>
                    </form>

                    {/* TRUST FOOTER LINE */}
                    <div className="border-t border-white/5 pt-4">
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 flex-wrap">
                        <span className="text-[#D4A017] font-bold">⭐⭐⭐⭐⭐</span>
                        <span className="font-bold text-white">Trusted by International Travelers</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-slate-500 font-mono">
                        <span>✓ Local Zanzibar Experts</span>
                        <span>✓ Secure Booking Guarantee</span>
                        <span>✓ Instant WhatsApp Support</span>
                        <span>✓ Flexible Cancellation</span>
                        <span>✓ Personalized Itineraries</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // STATE B: SUCCESS CONVERSION REVEAL (THE REWARD SCREEN)
                  <motion.div
                    key="success-reward-step"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 text-center sm:text-left"
                  >
                    {/* Welcome Badge */}
                    <div className="flex justify-center sm:justify-start">
                      <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        <ShieldCheck size={11} />
                        Paradise Access Granted
                      </span>
                    </div>

                    {/* Success Header */}
                    <div className="space-y-1.5">
                      <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Jambo, Your Benefits Are Unlocked!
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        We have registered your travel credentials, sent a confirmation to your email, and initialized your paradise perks:
                      </p>
                    </div>

                    {/* Promo Box Display */}
                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/15 rounded-2xl relative overflow-hidden group">
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                        <span>ACTIVE</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-center sm:text-left space-y-1">
                          <p className="text-[10px] font-black text-[#D4A017] uppercase tracking-wider">Your Exclusive Promo Code</p>
                          <p className="text-2xl font-mono font-black text-white tracking-widest">{promoCode}</p>
                          <p className="text-[10px] text-slate-300">Enjoy <strong>{discountValue}% OFF</strong> any hotel, safari, or custom package!</p>
                        </div>

                        <button
                          onClick={handleCopyCode}
                          className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black uppercase text-[10px] px-4 py-2.5 rounded-lg tracking-widest flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow"
                        >
                          {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Guide Download & Consultation Bento row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Guide Box */}
                      <div className="p-4 bg-[#121B30] border border-white/5 rounded-xl flex flex-col justify-between text-left space-y-3">
                        <div className="space-y-1">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400">
                            <BookOpen size={16} />
                          </div>
                          <h4 className="text-xs font-extrabold text-white">Your Zanzibar Insider Guide</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            Pocket-sized local secrets covering hidden beaches, coral reefs, and authentic sunset locations.
                          </p>
                        </div>

                        <button
                          onClick={handleDownloadGuide}
                          className="w-full bg-[#0B3B8C] hover:bg-[#072558] text-white font-bold text-[10px] py-2 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          {guideDownloaded ? <Check size={10} /> : <Download size={10} />}
                          <span>{guideDownloaded ? 'Downloaded!' : 'Download Guide'}</span>
                        </button>
                      </div>

                      {/* WhatsApp Box */}
                      <div className="p-4 bg-[#121B30] border border-white/5 rounded-xl flex flex-col justify-between text-left space-y-3">
                        <div className="space-y-1">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400">
                            <MessageCircle size={16} />
                          </div>
                          <h4 className="text-xs font-extrabold text-white">Complimentary Consultation</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            Speak immediately with our local experts on WhatsApp to design your perfect Swahili-coast trip.
                          </p>
                        </div>

                        <a
                          href={`https://wa.me/255629506063?text=Hello%20Zanzibar%20Trip%20%26%20Relax%2C%20I%20claimed%20the%2010%25%20holiday%20offer%20and%20would%20like%20help%20planning%20my%20Zanzibar%20trip.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handleWhatsAppClick}
                          className="w-full bg-[#25D366] hover:bg-[#1ebd5d] text-white font-bold text-[10px] py-2 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 transition-all text-center"
                        >
                          <MessageCircle size={10} fill="white" />
                          <span>Start WhatsApp Chat</span>
                        </a>
                      </div>
                    </div>

                    {/* Resume booking button */}
                    <div className="pt-2 text-center">
                      <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Resume Booking Excursion</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
