import { useState, useEffect, useRef } from 'react';
import { Menu, X, Phone, ChevronDown, MessageCircle, Mail, Shield, Search, ArrowRight, User } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { useLanguage } from '../context/LanguageContext';
import { ProgressiveImage } from './ProgressiveImage';
import { motion, AnimatePresence } from 'motion/react';
import SearchOverlay from './SearchOverlay';
import { usePreferences } from '../context/UserPreferencesContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useSiteLogos } from '../lib/cmsStore';

interface NavbarProps {
  currentPage: Page;
  navigate: (page: Page, id?: string) => void;
}

interface MenuItem {
  label: string;
  swLabel: string;
  page: Page;
  type: 'link';
}

const navigationMenu: MenuItem[] = [
  {
    label: 'Tours',
    swLabel: 'Ziara',
    page: 'tours',
    type: 'link'
  },
  {
    label: 'Holiday Packages',
    swLabel: 'Vifurushi vya Likizo',
    page: 'packages',
    type: 'link'
  },
  {
    label: 'Safaris',
    swLabel: 'Safari',
    page: 'safaris',
    type: 'link'
  },
  {
    label: 'Kilimanjaro',
    swLabel: 'Mlima Kilimanjaro',
    page: 'kilimanjaro',
    type: 'link'
  },
  {
    label: 'Transfers',
    swLabel: 'Uhamisho',
    page: 'transfers',
    type: 'link'
  },
  {
    label: 'Hotels',
    swLabel: 'Hoteli za Washirika',
    page: 'hotels',
    type: 'link'
  }
];

const aboutUsDropdownItems = [
  { label: 'About Zanzibar Trip & Relax', swLabel: 'Kuhusu Sisi', page: 'about' as Page },
  { label: 'Travel Guide', swLabel: 'Mwongozo wa Safari', page: 'best-time-to-visit' as Page },
  { label: 'Contact Us', swLabel: 'Mawasiliano', page: 'contact' as Page },
  { label: 'Reviews', swLabel: 'Maoni ya Wageni', page: 'reviews' as Page },
  { label: 'Sustainability', swLabel: 'Uendelevu', page: 'sustainability' as Page },
  { label: 'Careers', swLabel: 'Kazi', page: 'careers' as Page },
  { label: 'Google Classroom', swLabel: 'Darasa la Google', page: 'classroom' as Page },
  { label: 'FAQs', swLabel: 'Maswali ya Kawaida', page: 'faq' as Page },
  { label: 'Policies', swLabel: 'Sera Zetu', page: 'policies' as Page }
];

export default function Navbar({ currentPage, navigate }: NavbarProps) {
  const logos = useSiteLogos();
  const { trackBookingInitiate, trackWhatsAppClick } = useAnalytics();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const syncSession = () => {
    const activeSesObj = localStorage.getItem('ztr_customer_session');
    if (activeSesObj) {
      try {
        const parsed = JSON.parse(activeSesObj);
        setSession(parsed.user || null);
      } catch (e) {
        setSession(null);
      }
    } else {
      setSession(null);
    }
  };

  useEffect(() => {
    syncSession();
    const handleStorageChange = () => syncSession();
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(syncSession, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentPage]);

  useEffect(() => {
    setIsOpen(false);
    setIsPortalOpen(false);
  }, [currentPage]);

  // Handle global hotkeys for search modal (Ctrl+K or /)
  useEffect(() => {
    const handleGlobalSearchKeys = (e: KeyboardEvent) => {
      const isTyping = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !isTyping)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalSearchKeys);
    return () => window.removeEventListener('keydown', handleGlobalSearchKeys);
  }, []);

  // Handle click outside to close desktop dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (portalRef.current && !portalRef.current.contains(e.target as Node)) {
        setIsPortalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isItemActive = (item: MenuItem): boolean => {
    return currentPage === item.page;
  };

  const mobileMenuItems: Array<{ label: string; swLabel: string; page: Page; action?: () => void }> = [
    { label: 'Tours', swLabel: 'Ziara', page: 'tours' as Page },
    { label: 'Holiday Packages', swLabel: 'Vifurushi vya Likizo', page: 'packages' as Page },
    { label: 'Safaris', swLabel: 'Safari', page: 'safaris' as Page },
    { label: 'Kilimanjaro', swLabel: 'Mlima Kilimanjaro', page: 'kilimanjaro' as Page },
    { label: 'Transfers', swLabel: 'Uhamisho', page: 'transfers' as Page },
    { label: 'Hotels', swLabel: 'Hoteli za Washirika', page: 'hotels' as Page },
    { label: 'About Zanzibar Trip & Relax', swLabel: 'Kuhusu Sisi', page: 'about' as Page },
    { label: 'Travel Guide', swLabel: 'Mwongozo wa Safari', page: 'best-time-to-visit' as Page },
    { label: 'Contact Us', swLabel: 'Mawasiliano', page: 'contact' as Page },
    { label: 'Reviews', swLabel: 'Maoni ya Wageni', page: 'reviews' as Page },
    { label: 'Sustainability', swLabel: 'Uendelevu', page: 'sustainability' as Page },
    { label: 'Careers', swLabel: 'Kazi', page: 'careers' as Page },
    { label: 'FAQs', swLabel: 'Maswali ya Kawaida', page: 'faq' as Page },
    { label: 'Policies', swLabel: 'Sera Zetu', page: 'policies' as Page },
    { label: 'Book Now', swLabel: 'Weka Sasa', page: 'booking' as Page }
  ];

  return (
    <header ref={headerRef} className={`sticky top-0 z-50 w-full bg-[#0A1224]/95 backdrop-blur-md border-b border-b-white/10 shadow-lg select-none transition-all duration-300 ${isScrolled ? 'shadow-xl bg-[#080E1C]/98 py-1' : 'py-0'}`}>
      {/* Dynamic Top Announcement / Utility Row - Hidden on mobile/tablet for target header height */}
      <div className="hidden lg:block w-full bg-[#080F1D] border-b border-white/5 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-medium tracking-wide">
          {/* Company Brand Tag / Badge on the Left */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#D4A017]/10 text-[#D4A017] text-[9px] font-black uppercase tracking-widest border border-[#D4A017]/20">
              👑 Certified Local Tour Operator
            </span>
            <span className="hidden xl:inline text-white/50 text-[10px] uppercase tracking-wider font-semibold">
              {language === 'en' ? 'Bespoke Zanzibar Excursions & Mainland Wildlife Safaris' : 'Ziara za Kibinafsi Zanzibar na Safari za Tanzania'}
            </span>
          </div>

          {/* Quick info & License on the Right */}
          <div className="flex items-center gap-2 sm:gap-4 text-white/60">
            <span className="hidden lg:flex items-center gap-1.5 font-mono text-white/80">
              <Phone size={10} className="text-[#D4A017]" />
              <span>+255 629 506 063</span>
            </span>
            <span className="hidden lg:inline text-white/20 select-none">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-white/80">
              <Mail size={10} className="text-[#D4A017]" />
              <span>info@zanzibartripandrelax.com</span>
            </span>
            <span className="hidden md:inline text-white/20 select-none">|</span>
            <div className="hidden sm:block text-[10px] text-white/40 truncate">
              {t('nav.license')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar Row */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 lg:gap-4 transition-all duration-300 ${isScrolled ? 'h-16 lg:h-18' : 'h-20 lg:h-24'}`}>
        {/* Left side: Premium High-Quality Logo & Brand Title */}
        <button 
          onClick={() => navigate('home')} 
          className="flex items-center gap-3 group shrink-0 select-none cursor-pointer text-left font-sans bg-transparent border-none p-0 outline-none"
        >
          <div className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] relative flex-shrink-0">
            <ProgressiveImage
              src={logos.headerLogo || "/src/assets/images/logo.png"}
              alt="Zanzibar Trip and Relax Logo"
              className="h-full w-full object-contain group-hover:scale-105 transition-all duration-300 aspect-square"
            />
          </div>
          <div className="hidden sm:flex flex-col leading-tight select-none">
            <span className="text-white font-black text-sm lg:text-base tracking-[0.14em] lg:tracking-[0.18em] uppercase group-hover:text-[#D4A017] transition-colors">
              ZANZIBAR
            </span>
            <span className="text-[#D4A017] text-[10px] lg:text-xs font-extrabold uppercase tracking-[0.18em] lg:tracking-[0.22em] mt-0.5">
              TRIP & RELAX
            </span>
          </div>
        </button>

        {/* Center/Desktop Menu */}
        <div className="hidden lg:flex items-center justify-center flex-grow">
          <nav className="flex items-center gap-0.5 xl:gap-2">
            {navigationMenu.map((item) => {
              const labelText = language === 'en' ? item.label : item.swLabel;
              const isActive = isItemActive(item);

              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.page)}
                  className={`px-1.5 xl:px-2.5 py-2 text-[10px] xl:text-xs font-extrabold uppercase tracking-wider xl:tracking-widest cursor-pointer transition-colors relative bg-transparent border-none outline-none ${
                    isActive 
                      ? 'text-[#D4A017]' 
                      : 'text-white/80 hover:text-[#D4A017]'
                  }`}
                >
                  <span>{labelText}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-1.5 right-1.5 h-0.5 bg-[#D4A017]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            {/* "About Us" Dropdown Menu */}
            <div className="relative group ml-1">
              <button
                className={`px-2 py-2 text-[10px] xl:text-xs font-extrabold uppercase tracking-wider xl:tracking-widest cursor-pointer flex items-center gap-1 transition-colors bg-transparent border-none outline-none ${
                  ['about', 'best-time-to-visit', 'contact', 'reviews', 'sustainability', 'careers', 'faq', 'policies'].includes(currentPage)
                    ? 'text-[#D4A017]'
                    : 'text-white/80 hover:text-[#D4A017]'
                }`}
              >
                <span>About Us</span>
                <ChevronDown size={11} className="transition-transform duration-300 group-hover:rotate-180" />
              </button>
              
              <div className="absolute left-0 mt-1 w-60 bg-[#0A1224] border border-white/10 rounded-xl shadow-2xl p-1.5 hidden group-hover:block hover:block z-50">
                {aboutUsDropdownItems.map((subItem) => {
                  const subLabelText = language === 'en' ? subItem.label : subItem.swLabel;
                  const isSubActive = currentPage === subItem.page;
                  return (
                    <button
                      key={subItem.label}
                      onClick={() => navigate(subItem.page)}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-[11px] font-bold flex items-center justify-between cursor-pointer ${
                        isSubActive ? 'text-[#D4A017] bg-white/5' : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <span>{subLabelText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Book Now link */}
            <button
              onClick={() => navigate('booking')}
              className={`px-1.5 xl:px-2.5 py-2 text-[10px] xl:text-xs font-black uppercase tracking-wider xl:tracking-widest cursor-pointer transition-all relative bg-transparent border-none outline-none ${
                currentPage === 'booking'
                  ? 'text-[#D4A017]'
                  : 'text-[#D4A017] hover:text-white'
              }`}
            >
              <span>{language === 'en' ? 'Book Now' : 'Weka Sasa'}</span>
              {currentPage === 'booking' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-1.5 right-1.5 h-0.5 bg-[#D4A017]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="absolute -top-1 right-0 w-1.5 h-1.5 rounded-full bg-[#D4A017] animate-ping" />
            </button>
          </nav>
        </div>

        {/* Right Action Panel */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Enquire Now CTA Button */}
          <button
            onClick={() => navigate('contact')}
            className="hidden md:inline-flex items-center gap-1.5 bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-[10px] xl:text-xs font-black uppercase tracking-wider px-4.5 py-2 rounded-full shadow-md shadow-[#D4A017]/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            Enquire Now
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-white p-2.5 rounded-full bg-white/5 hover:bg-white/10 hover:text-[#D4A017] transition-all cursor-pointer border border-white/10 shrink-0 shadow-sm"
            aria-label="Search Excursions"
            title="Search (Ctrl+K)"
          >
            <Search size={16} />
          </button>

          {/* User Account Icon Dropdown */}
          <div className="relative" ref={portalRef}>
            <button
              onClick={() => setIsPortalOpen(!isPortalOpen)}
              className="text-white hover:text-[#D4A017] p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-sm select-none shrink-0"
              title="Access your customer account"
              id="portal-dropdown-btn"
            >
              {session ? (
                session.avatar || session.photoURL ? (
                  <img
                    src={session.avatar || session.photoURL}
                    alt={session.name}
                    className="w-5 h-5 rounded-full object-cover aspect-square border border-white/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#D4A017] text-[#0A1224] flex items-center justify-center text-[10px] font-black uppercase">
                    {session.name ? session.name.substring(0, 1) : 'U'}
                  </div>
                )
              ) : (
                <User size={16} />
              )}
            </button>

            {/* Account Portal Dropdown panel */}
            <AnimatePresence>
              {isPortalOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-[#0A1224] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 space-y-1"
                >
                  {session ? (
                    <>
                      <div className="px-3.5 py-2 border-b border-white/5 mb-1 text-left">
                        <p className="text-[9px] text-white/40 uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-bold text-white truncate max-w-full">{session.name}</p>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.setItem('ztr_customer_tab', 'bookings');
                          navigate('my-account');
                          setIsPortalOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/90 hover:text-white transition-all text-xs font-bold flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none"
                      >
                        <span className="text-[#D4A017]">📋</span>
                        <span>My Bookings</span>
                      </button>
                      <button
                        onClick={() => {
                          localStorage.setItem('ztr_customer_tab', 'wishlist');
                          navigate('my-account');
                          setIsPortalOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/90 hover:text-white transition-all text-xs font-bold flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none"
                      >
                        <span className="text-[#D4A017]">❤️</span>
                        <span>Wishlist</span>
                      </button>
                      <button
                        onClick={() => {
                          localStorage.setItem('ztr_customer_tab', 'profile');
                          navigate('my-account');
                          setIsPortalOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/90 hover:text-white transition-all text-xs font-bold flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none"
                      >
                        <span className="text-[#D4A017]">👤</span>
                        <span>Profile Settings</span>
                      </button>
                      <div className="h-px bg-white/5 my-1" />
                      <button
                        onClick={() => {
                          localStorage.removeItem('ztr_customer_session');
                          setSession(null);
                          setIsPortalOpen(false);
                          navigate('home');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all text-xs font-bold flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          localStorage.setItem('ztr_auth_view', 'login');
                          navigate('owner-login');
                          setIsPortalOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/90 hover:text-white transition-all text-xs font-bold flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none"
                      >
                        <span className="text-[#D4A017]">🔑</span>
                        <span>Portal Login</span>
                      </button>
                      <button
                        onClick={() => {
                          localStorage.setItem('ztr_auth_view', 'forgot');
                          navigate('owner-login');
                          setIsPortalOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-all text-xs font-bold flex items-center gap-2 cursor-pointer bg-transparent border-none outline-none"
                      >
                        <span className="text-white/40">❓</span>
                        <span>Forgot Password</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle (Hamburger) */}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className="lg:hidden text-white p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Slide-out Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* MOBILE FULL SCREEN SLIDE-OUT MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full bg-[#0A1224] z-50 flex flex-col md:max-w-md shadow-2xl h-screen"
          >
            {/* Slide-out Menu Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-[42px] w-[42px] relative flex-shrink-0">
                  <ProgressiveImage
                    src={logos.mobileLogo || logos.headerLogo || "/src/assets/images/logo.png"}
                    alt="Zanzibar Trip and Relax Logo"
                    className="h-full w-full object-contain aspect-square"
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-white font-black text-xs tracking-wider uppercase">ZANZIBAR</span>
                  <span className="text-[#D4A017] text-[9px] font-bold uppercase tracking-widest mt-0.5">TRIP & RELAX</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
                aria-label="Close Menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-grow overflow-y-auto px-6 py-6 flex flex-col justify-between gap-8">
              {/* Primary Navigation Links with Clean Separator */}
              <nav className="flex flex-col divide-y divide-white/10">
                {mobileMenuItems.map((item) => {
                  const isActive = currentPage === item.page;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        setIsOpen(false);
                        if (item.action) {
                          item.action();
                        } else if (item.page) {
                          navigate(item.page);
                        }
                      }}
                      className="w-full text-left py-4 text-sm uppercase tracking-widest font-black flex items-center justify-between transition-all bg-transparent border-none outline-none group cursor-pointer"
                    >
                      <span className={isActive ? 'text-[#D4A017]' : 'text-white/90 group-hover:text-[#D4A017]'}>
                        {language === 'en' ? item.label : item.swLabel}
                      </span>
                      <ArrowRight size={14} className={`transition-transform duration-300 ${isActive ? 'text-[#D4A017] translate-x-1' : 'text-white/20 group-hover:text-[#D4A017] group-hover:translate-x-1'}`} />
                    </button>
                  );
                })}
              </nav>

              {/* Portal & Help Desk Actions */}
              <div className="space-y-4 shrink-0">
                {!session && (
                  <button
                    onClick={() => {
                      localStorage.setItem('ztr_auth_view', 'login');
                      navigate('my-account');
                      setIsOpen(false);
                    }}
                    className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] rounded-2xl py-4 text-center text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    👤 Access Customer Portal
                  </button>
                )}

                <button
                  onClick={() => {
                    navigate('manage-booking');
                    setIsOpen(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-2xl py-4 text-center text-xs font-bold text-white uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  📋 Look Up Reservations
                </button>
              </div>
            </div>

            {/* Sticky bottom WhatsApp Concierge */}
            <div className="p-6 border-t border-white/10 bg-[#080F1D] shrink-0">
              <a
                href="https://wa.me/255629506063?text=Hello%20Zanzibar%20Trip%20and%20Relax%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20private%20excursion%21"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('Navbar Mobile Menu Link', 'General')}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-black py-4 rounded-full transition-all uppercase tracking-wider cursor-pointer shadow-md"
              >
                <MessageCircle size={15} fill="white" />
                <span>WhatsApp Concierge</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} navigate={navigate} />
      </AnimatePresence>
    </header>
  );
}
