import { useState, useEffect, useRef } from 'react';
import { Menu, X, Phone, ChevronDown, MessageCircle, Compass, Mail, Shield, Search } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { useLanguage } from '../context/LanguageContext';
import { ProgressiveImage } from './ProgressiveImage';
import { motion, AnimatePresence } from 'motion/react';
import SearchOverlay from './SearchOverlay';
import { usePreferences } from '../context/UserPreferencesContext';
import { useAnalytics } from '../context/AnalyticsContext';

interface NavbarProps {
  currentPage: Page;
  navigate: (page: Page, id?: string) => void;
}

interface MenuItem {
  label: string;
  swLabel: string;
  page?: Page;
  type: 'link' | 'dropdown';
  items?: {
    label: string;
    swLabel: string;
    page: Page;
    id?: string;
  }[];
}

const navigationMenu: MenuItem[] = [
  {
    label: 'Home',
    swLabel: 'Nyumbani',
    page: 'home',
    type: 'link'
  },
  {
    label: 'Zanzibar Tours',
    swLabel: 'Ziara za Zanzibar',
    page: 'tours',
    type: 'link'
  },
  {
    label: 'Tanzania Safaris',
    swLabel: 'Safari za Tanzania',
    page: 'safaris',
    type: 'link'
  },
  {
    label: 'Kilimanjaro',
    swLabel: 'Kupanda Kilimanjaro',
    page: 'kilimanjaro',
    type: 'link'
  },
  {
    label: 'Experiences',
    swLabel: 'Uzoefu',
    type: 'dropdown',
    items: [
      { label: 'Tour Packages', swLabel: 'Vifurushi vya Ziara', page: 'tours' },
      { label: 'Private Tours', swLabel: 'Ziara za Kibinafsi', page: 'tours', id: 'search=private' },
      { label: 'Cultural Experiences', swLabel: 'Uzoefu wa Kiutamaduni', page: 'tours', id: 'category=Culture' },
      { label: 'Snorkeling & Diving', swLabel: 'Kupiga Mbizi & Nyambizi', page: 'tours', id: 'search=snorkeling' },
      { label: 'Sunset Cruises', swLabel: 'Safari za Jua Linalozama', page: 'tours', id: 'search=sunset' },
      { label: 'Luxury Experiences', swLabel: 'Uzoefu wa Kifahari', page: 'tours', id: 'search=luxury' }
    ]
  },
  {
    label: 'Gallery',
    swLabel: 'Picha zetu',
    page: 'gallery',
    type: 'link'
  },
  {
    label: 'About',
    swLabel: 'Kuhusu Sisi',
    page: 'about',
    type: 'link'
  },
  {
    label: 'Contact',
    swLabel: 'Mawasiliano',
    page: 'contact',
    type: 'link'
  }
];

export default function Navbar({ currentPage, navigate }: NavbarProps) {
  const { trackBookingInitiate, trackWhatsAppClick } = useAnalytics();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const headerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = usePreferences();

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
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
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
      if (portalRef.current && !portalRef.current.contains(e.target as Node)) {
        setIsPortalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileDropdown = (label: string) => {
    setMobileExpanded(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.type === 'link') {
      return currentPage === item.page;
    }
    if (item.items) {
      return item.items.some(sub => {
        if (sub.page === currentPage) {
          // Check if custom ID also matches
          if (sub.id) {
            return window.location.hash.includes(sub.id);
          }
          return true;
        }
        return false;
      });
    }
    return false;
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full bg-[#0A1224]/95 backdrop-blur-md border-b border-b-white/10 shadow-lg select-none">
      {/* Dynamic Top Announcement / Utility Row */}
      <div className="w-full bg-[#080F1D] border-b border-white/5 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-medium tracking-wide">
          {/* Company Brand Tag / Badge on the Left */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#D4A017]/10 text-[#D4A017] text-[9px] font-black uppercase tracking-widest border border-[#D4A017]/20">
              👑 Certified Local Operator
            </span>
            <span className="hidden xl:inline text-white/50 text-[10px] uppercase tracking-wider font-semibold">
              {language === 'en' ? 'Bespoke Zanzibar Excursions & Mainland Safaris' : 'Ziara Zilizobinafsishwa Zanzibar na Safari za Tanzania'}
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
            {/* License */}
            <div className="hidden sm:block text-[10px] text-white/40 truncate">
              {t('nav.license')}
            </div>
            {/* Language & Currency Switchers Removed */}
          </div>
        </div>
      </div>

      {/* Main Single Row Navbar on Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 md:h-22 flex items-center justify-between gap-4">
        {/* Left side: Premium High-Quality Logo & Brand Title */}
        <button 
          onClick={() => navigate('home')} 
          className="flex items-center gap-3 group shrink-0 select-none cursor-pointer text-left"
        >
          <ProgressiveImage
            src="/src/assets/images/logo.jpg"
            alt="Zanzibar Trip and Relax Logo"
            className="h-13 w-13 sm:h-16 sm:w-16 md:h-18 md:w-18 object-contain rounded-full bg-white/10 p-1 border border-white/10 shadow-md group-hover:scale-105 transition-all duration-300"
          />
          <div className="flex flex-col leading-tight select-none">
            <span className="text-white font-black text-xs sm:text-sm md:text-base tracking-[0.18em] uppercase group-hover:text-[#D4A017] transition-colors font-sans">
              ZANZIBAR
            </span>
            <span className="text-[#D4A017] text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] font-sans mt-0.5">
              TRIP & RELAX
            </span>
          </div>
        </button>

        {/* Center/Desktop Menu - Reorganized and Simplified */}
        <div className="hidden lg:flex items-center justify-center flex-grow">
          <nav className="flex items-center gap-2.5 xl:gap-4.5">
            {navigationMenu.map((item) => {
              const labelText = language === 'en' ? item.label : item.swLabel;
              const isActive = isItemActive(item);

              if (item.type === 'link') {
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate(item.page!)}
                    className={`px-3 py-2 text-[11px] xl:text-xs font-extrabold uppercase tracking-widest cursor-pointer transition-colors relative ${
                      isActive ? 'text-[#D4A017]' : 'text-white/80 hover:text-[#D4A017]'
                    }`}
                  >
                  <span>{labelText}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#D4A017]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            }

            // Dropdown Menu Item
            const isOpen = activeDropdown === item.label;

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => setActiveDropdown(isOpen ? null : item.label)}
                  className={`flex items-center gap-1 px-3 py-2 text-[11px] xl:text-xs font-extrabold uppercase tracking-widest cursor-pointer transition-colors ${
                    isActive || isOpen ? 'text-[#D4A017]' : 'text-white/80 hover:text-[#D4A017]'
                  }`}
                >
                  <span>{labelText}</span>
                  <ChevronDown size={11} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#D4A017]' : 'text-white/40'}`} />
                </button>

                {/* Desktop Dropdown Card */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-[#0A1224] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                    >
                      {item.items?.map((sub) => {
                        const subLabelText = language === 'en' ? sub.label : sub.swLabel;
                        const isSubActive = currentPage === sub.page && (sub.id ? window.location.hash.includes(sub.id) : true);

                        return (
                          <button
                            key={sub.label}
                            onClick={() => {
                              navigate(sub.page, sub.id);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-xs font-bold flex items-center justify-between ${
                              isSubActive ? 'text-[#D4A017] bg-white/5' : 'text-white/80 hover:text-white'
                            }`}
                          >
                            <span>{subLabelText}</span>
                            {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Desktop / Mobile Common Right Action Panel */}
        <div className="flex items-center gap-3">
          {/* Search Icon Trigger only */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-white p-2.5 rounded-full bg-white/5 hover:bg-white/10 hover:text-[#D4A017] transition-all cursor-pointer border border-white/10"
            aria-label="Search Excursions"
            title="Search (Ctrl+K)"
          >
            <Search size={16} />
          </button>

          {/* Elegant "My Account" Menu */}
          <div className="relative" ref={portalRef}>
            <button
              onClick={() => setIsPortalOpen(!isPortalOpen)}
              className="text-white hover:text-[#D4A017] px-3.5 py-2 text-[10px] sm:text-xs font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 rounded-full border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm select-none animate-pulse-gentle"
              title="Access your customer account"
              id="portal-dropdown-btn"
            >
              <span>My Account</span>
              <ChevronDown size={11} className={`transition-transform duration-200 ${isPortalOpen ? 'rotate-180 text-[#D4A017]' : 'text-white/40'}`} />
            </button>

            {/* My Account Dropdown Menu */}
            <AnimatePresence>
              {isPortalOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-[#0A1224] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 p-1"
                >
                  <button
                    onClick={() => {
                      navigate('my-account');
                      setIsPortalOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-white/90 hover:text-white transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-[#D4A017] text-xs font-mono">👤</span>
                    <span>My Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('my-account');
                      setIsPortalOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-white/90 hover:text-white transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-[#D4A017] text-xs font-mono">🔑</span>
                    <span>Reset Credentials</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Secure Reservations Prominent CTA Button */}
          <button
            onClick={() => {
              trackBookingInitiate('general', 'Navbar Desktop Button');
              navigate('booking');
            }}
            className="bg-[#D4A017] text-[#0A1224] text-[11px] font-black px-4 sm:px-5 py-2.5 rounded-full hover:bg-white hover:text-[#0A1224] transition-all duration-300 shadow-md outline-none uppercase tracking-widest flex items-center gap-1.5 border border-[#D4A017]/20 relative overflow-hidden group select-none cursor-pointer"
          >
            <Shield size={12} className="text-[#0A1224] animate-pulse" />
            <span>Secure Reservations</span>
          </button>

          {/* Mobile Menu Toggle button */}
          <button
            onClick={() => setIsOpen(prev => !prev)}
            className="lg:hidden text-white p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN OVERLAY DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden w-full bg-[#0A1224] border-t border-white/10 overflow-hidden z-40 max-h-[calc(100vh-80px)] flex flex-col"
          >
            <div className="px-4 py-6 space-y-6 overflow-y-auto flex-grow max-h-[70vh] pb-24 scrollbar-thin">
              <div className="space-y-1">
                {navigationMenu.map((item) => {
                  const labelText = language === 'en' ? item.label : item.swLabel;
                  const isActive = isItemActive(item);

                  if (item.type === 'link') {
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          navigate(item.page!);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3.5 rounded-xl text-sm uppercase tracking-widest font-black flex items-center justify-between ${
                          isActive ? 'text-[#D4A017] bg-white/5 border border-white/10' : 'text-white/85 hover:bg-white/5'
                        }`}
                      >
                        <span>{labelText}</span>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />}
                      </button>
                    );
                  }

                  // Dropdown/Accordion Menu Item for Mobile
                  const isExpanded = !!mobileExpanded[item.label];

                  return (
                    <div key={item.label} className="border border-white/5 rounded-2xl overflow-hidden bg-white/2 mb-2">
                      <button
                        onClick={() => toggleMobileDropdown(item.label)}
                        className={`w-full text-left px-4 py-3.5 text-sm uppercase tracking-widest font-black flex items-center justify-between transition-colors ${
                          isActive ? 'text-[#D4A017] bg-white/5' : 'text-white/85 hover:bg-white/5'
                        }`}
                      >
                        <span>{labelText}</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 text-[#D4A017] ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-black/25 px-2 py-2.5 space-y-1"
                          >
                            {item.items?.map((sub) => {
                              const subLabelText = language === 'en' ? sub.label : sub.swLabel;
                              const isSubActive = currentPage === sub.page && (sub.id ? window.location.hash.includes(sub.id) : true);

                              return (
                                <button
                                  key={sub.label}
                                  onClick={() => {
                                    navigate(sub.page, sub.id);
                                    setIsOpen(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between ${
                                    isSubActive ? 'text-[#D4A017] bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  <span>{subLabelText}</span>
                                  {isSubActive && <div className="w-1 h-1 rounded-full bg-[#D4A017]" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Quick Contacts and Help Desk inside Mobile Menu */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                {/* My Account Links for Mobile */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                  <p className="text-[10px] font-bold text-[#D4A017] uppercase tracking-widest text-center">My Account</p>
                  <div className="text-center">
                    <button
                      onClick={() => {
                        navigate('my-account');
                        setIsOpen(false);
                      }}
                      className="w-full bg-[#D4A017]/20 hover:bg-[#D4A017]/30 border border-[#D4A017]/30 rounded-xl py-2.5 px-3 text-center text-xs font-bold text-[#D4A017] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>👤</span>
                      <span>Access My Account / Register</span>
                    </button>
                  </div>
                </div>

                <a
                  href="https://wa.me/255629506063"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('Navbar Mobile Menu Link', 'General')}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-black py-3.5 rounded-full transition-all uppercase tracking-wider"
                >
                  <MessageCircle size={15} fill="white" />
                  <span>WhatsApp Concierge</span>
                </a>

                <div className="flex flex-col gap-1 text-center text-[10px] text-white/50 leading-relaxed font-mono">
                  <p>Email: info@zanzibartripandrelax.com</p>
                  <p>Direct Hot-Line: +255 629 506 063</p>
                  <p>{t('nav.license')}</p>
                </div>
              </div>
            </div>

            {/* Sticky/Fixed Mobile Bottom Bar for always prominent Secure Reservations */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0A1224] border-t border-white/15 flex gap-2">
              <button
                onClick={() => {
                  trackBookingInitiate('general', 'Navbar Mobile Menu Bottom Button');
                  navigate('booking');
                  setIsOpen(false);
                }}
                className="w-full bg-[#D4A017] hover:bg-white text-[#0A1224] text-xs font-black py-4 rounded-full transition-all uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg border border-[#D4A017]"
              >
                <Shield size={14} className="text-[#0A1224]" />
                <span>Secure Reservations</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Overlay with AnimatePresence */}
      <AnimatePresence>
        <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} navigate={navigate} />
      </AnimatePresence>
    </header>
  );
}
