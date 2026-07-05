import { useState, useEffect, FormEvent } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { syncLeadToCRM } from '../lib/crm';
import { useLanguage } from '../context/LanguageContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { getSiteContent } from '../lib/cmsStore';

interface NewsletterProps {
  variant?: 'hero' | 'footer' | 'card';
}

export default function Newsletter({ variant = 'card' }: NewsletterProps) {
  const { trackInquirySend } = useAnalytics();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { t } = useLanguage();

  const content = getSiteContent();
  const bgImages = content.newsletterBgImages && content.newsletterBgImages.length > 0 
    ? content.newsletterBgImages 
    : [
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&w=1600&q=80'
      ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    // Check local storage for subscription status
    const subscribed = localStorage.getItem('ztr_newsletter_subscribed');
    if (subscribed === 'true') {
      setStatus('success');
    }

    if (variant === 'hero') {
      const timer = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % bgImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [variant, bgImages.length]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      // Save to local storage first
      const existing = localStorage.getItem('ztr_newsletter_subscribers');
      let list: string[] = [];
      try {
        if (existing) list = JSON.parse(existing);
      } catch (err) {}
      if (!list.includes(email)) {
        list.push(email);
        localStorage.setItem('ztr_newsletter_subscribers', JSON.stringify(list));
      }
      localStorage.setItem('ztr_newsletter_subscribed', 'true');

      // Persist to Supabase
      try {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .upsert([{ email }], { onConflict: 'email' });
        if (error) throw error;
      } catch (dbErr) {
        console.warn('Supabase newsletter save warning, fallback to local storage:', dbErr);
      }

      // Standardize CRM lead tracking and fire conversions
      syncLeadToCRM({
        source: 'newsletter',
        fullName: 'Newsletter Subscriber',
        email: email,
        whatsappNumber: 'None',
        subject: 'Newsletter Opt-in',
        message: 'Guest signed up for promotional discounts and travel alerts.'
      });

      // Dispatch custom GA4 event for accurate funnel tracking
      trackInquirySend('newsletter_subscription', email, {
        subject: 'Newsletter Opt-in'
      });

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  if (variant === 'hero') {
    return (
      <div id="newsletter-hero" className="relative py-24 px-4 overflow-hidden min-h-[480px] flex items-center justify-center">
        {/* Background carousel with fade transition */}
        <div className="absolute inset-0 z-0">
          {bgImages.map((img, index) => (
            <div
              key={index}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
              style={{
                backgroundImage: `url('${img}')`,
                opacity: index === activeSlide ? 1 : 0,
              }}
            />
          ))}
          {/* Dark overlay 65% for readable white text */}
          <div className="absolute inset-0 bg-black/65" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center text-white space-y-6">
          <Send className="w-12 h-12 mx-auto text-[#D4A017] animate-bounce" />
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('newsletter.title')}
          </h3>
          <p className="text-gray-200 text-sm max-w-lg mx-auto leading-relaxed font-medium">
            {t('newsletter.desc')}
          </p>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-2.5 text-emerald-400 font-bold bg-neutral-900/85 py-4 px-6 rounded-2xl border border-emerald-500/20 backdrop-blur-sm shadow-xl max-w-md mx-auto">
              <CheckCircle size={22} className="shrink-0" />
              <span className="text-xs sm:text-sm">{t('newsletter.success')}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder={t('newsletter.placeholder')}
                  className="px-5 py-3.5 rounded-full bg-black/45 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#D4A017] focus:border-[#D4A017] flex-1 text-xs sm:text-sm font-medium backdrop-blur-md"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-[#D4A017] hover:bg-[#c49010] active:scale-95 text-[#0A1224] font-extrabold px-8 py-3.5 rounded-full transition-all duration-200 disabled:opacity-50 cursor-pointer text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap"
                >
                  {status === 'loading' ? t('newsletter.subscribing') : t('newsletter.button')}
                </button>
              </form>
              {status === 'error' && (
                <p className="text-red-400 text-xs font-semibold">{t('newsletter.invalidEmail')}</p>
              )}
              <p className="text-[10px] text-gray-300 max-w-md mx-auto leading-normal">
                {t('newsletter.privacy')}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div id="newsletter-footer" className="bg-[#09162C] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 w-full">
        <div className="max-w-xl text-center lg:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-[#D4A017] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('newsletter.promoTitle')}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            {t('newsletter.promoDesc')}
          </p>
        </div>
        <div className="w-full lg:w-auto shrink-0 min-w-[280px] sm:min-w-[400px]">
          {status === 'success' ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 justify-center text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-emerald-400">✓</span>
              </div>
              <div className="text-left">
                <p className="font-extrabold text-xs uppercase tracking-widest text-emerald-300">{t('newsletter.success').split('!')[0] || 'Subscribed!'}</p>
                <p className="text-[11px] text-gray-300">We'll alert you as soon as seasonal promotions unlock.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder={t('newsletter.placeholder')}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    className="w-full pl-10 pr-4 py-3 text-xs bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4A017] focus:border-[#D4A017]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-[#D4A017] hover:bg-[#b88a14] active:scale-95 transition-all text-[#0B1E3D] font-extrabold text-xs px-6 py-3 rounded-2xl whitespace-nowrap flex items-center gap-2 cursor-pointer"
                >
                  {status === 'loading' ? (
                    <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#0B1E3D] border-t-transparent" />
                  ) : (
                    t('newsletter.button').split(' ')[0] || 'Subscribe'
                  )}
                </button>
              </div>
              {status === 'error' && (
                <p className="text-red-400 text-[10px] font-semibold text-center lg:text-left">{t('newsletter.invalidEmail')}</p>
              )}
              <p className="text-[10px] text-gray-500 text-center lg:text-left">
                {t('newsletter.privacy')}
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Freestanding freestanding Card variant (for any pages e.g. Contact, Blog sidebar etc.)
  return (
    <div id="newsletter-card" className="bg-gradient-to-br from-[#0B1E3D] to-[#061021] text-white rounded-3xl p-8 shadow-2xl border border-white/10 max-w-xl mx-auto">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-[#D4A017]">
          <Mail size={22} />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
          {t('newsletter.promoTitle')}
        </h3>
        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
          {t('newsletter.promoDesc')}
        </p>

        {status === 'success' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3 justify-center text-center max-w-md mx-auto transition-all">
            <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            <div className="text-left text-xs">
              <p className="font-extrabold uppercase tracking-widest text-emerald-300">Subscribed Successfully!</p>
              <p className="text-gray-300 mt-0.5">Welcome to Zanzibar Trip & Relax. Exclusive updates are on their way.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 max-w-md mx-auto">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                placeholder={t('newsletter.placeholder')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                className="w-full pl-11 pr-4 py-3.5 text-xs sm:text-sm bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4A017] focus:border-[#D4A017]"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-[#D4A017] hover:bg-[#b88a14] active:scale-[0.98] transition-all text-[#0B1E3D] font-extrabold text-xs sm:text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              {status === 'loading' ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-[#0B1E3D] border-t-transparent" />
                  <span>{t('newsletter.subscribing')}</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>{t('newsletter.button')}</span>
                </>
              )}
            </button>
            {status === 'error' && (
              <p className="text-red-400 text-xs font-semibold text-center">{t('newsletter.invalidEmail')}</p>
            )}
            <p className="text-[10px] text-gray-400 text-center pt-1 leading-normal">
              {t('newsletter.privacy')}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
