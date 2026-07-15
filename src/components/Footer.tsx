import React, { useState } from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, MessageCircle, Compass, Star, ChevronRight, HelpCircle, ShieldAlert, Twitter, Linkedin } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { ProgressiveImage } from './ProgressiveImage';
import Newsletter from './Newsletter';
import { useAnalytics } from '../context/AnalyticsContext';

interface FooterProps {
  navigate: (page: Page, id?: string) => void;
  currentPage?: string;
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.41-1.86c-.84-1.13-.86-2.35-.86-2.85h-3.14v11.95c0 1.39-.87 2.11-1.7 2.11-.87 0-1.7-.6-1.7-2.04 0-1.48.94-2.29 2.1-2.29.11 0 .52.02.52.02V9.01c-.11 0-.54-.03-.67-.03C6.96 8.98 5 11.22 5 14.14c0 2.72 1.83 4.86 4.58 4.86 2.87 0 4.37-2.14 4.37-4.39V8.56c.82.82 2.15 1.56 3.81 1.56V6.69z"/>
    </svg>
  );
}

export default function Footer({ navigate, currentPage }: FooterProps) {
  const { trackWhatsAppClick } = useAnalytics();
  const year = new Date().getFullYear();
  const [careerToast, setCareerToast] = useState(false);

  const handleCareersClick = () => {
    navigate('careers');
  };

  return (
    <footer className="bg-[#0B1E3D] text-white border-t border-white/10 font-sans relative">
      {/* Careers Info Toast */}
      {careerToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1224] border-2 border-[#D4A017] text-white px-5 py-4 rounded-xl shadow-2xl max-w-sm animate-fade-in-up">
          <h5 className="font-bold text-[#D4A017] text-xs uppercase tracking-widest mb-1">Join Our Team!</h5>
          <p className="text-[11px] text-white/80 leading-relaxed">
            We are always looking for passionate local Swahili guides and consultants. Please send your CV to <strong className="text-white">info@zanzibartripandrelax.com</strong> or message us on WhatsApp.
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        
        {/* UPPER ROW: BRANDING & NEWSLETTER IN COMPACT LUXURY PAIRING */}
        <div className={`grid grid-cols-1 ${currentPage === 'home' ? '' : 'lg:grid-cols-12'} gap-8 items-center pb-12 mb-12 border-b border-white/10`}>
          <div className={`${currentPage === 'home' ? 'w-full' : 'lg:col-span-5'} flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left`}>
            <ProgressiveImage
              src="/src/assets/images/logo.jpg"
              alt="Zanzibar Trip and Relax Logo"
              className="h-16 w-16 object-cover bg-white/5 rounded-full p-1 border border-white/10 shrink-0 shadow-lg"
            />
            <div>
              <div className="font-extrabold text-2xl text-white tracking-wide uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                Zanzibar
              </div>
              <div className="text-[#D4A017] text-xs font-black tracking-[0.2em] uppercase">
                Trip & Relax
              </div>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed max-w-md">
                Your boutique, licensed partner for premium excursions across the Zanzibar Archipelago, mainland Tanzania safaris, and private coastal transfers.
              </p>
            </div>
          </div>
          
          {currentPage !== 'home' && (
            <div className="lg:col-span-7 w-full">
              <Newsletter variant="footer" />
            </div>
          )}
        </div>

        {/* MIDDLE ROW: THE FIVE MAIN SPECIFIED FOOTER COLUMNS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 xl:gap-12">
          
          {/* COLUMN 1: Company */}
          <div className="flex flex-col">
            <h4 className="text-[#D4A017] font-black text-xs uppercase tracking-widest mb-5 pb-2 border-b border-white/5 flex items-center gap-1.5">
              <Compass size={13} className="text-[#D4A017]" />
              Company
            </h4>
            <ul className="space-y-3 text-xs font-medium">
              <li>
                <button onClick={() => navigate('about')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('reviews')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Reviews</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('sustainability')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Sustainability</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('best-time-to-visit')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Best Time to Visit</span>
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: Tours */}
          <div className="flex flex-col">
            <h4 className="text-[#D4A017] font-black text-xs uppercase tracking-widest mb-5 pb-2 border-b border-white/5 flex items-center gap-1.5">
              <MapPin size={13} className="text-[#D4A017]" />
              Tours
            </h4>
            <ul className="space-y-3 text-xs font-medium">
              <li>
                <button onClick={() => navigate('destinations')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Tanzania Destinations</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('tours')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Zanzibar Tours</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('safaris')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Tanzania Safaris</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('kilimanjaro')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Kilimanjaro Treks</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('packages')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Holiday Packages</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('transfers')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Airport Transfers</span>
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Support */}
          <div className="flex flex-col">
            <h4 className="text-[#D4A017] font-black text-xs uppercase tracking-widest mb-5 pb-2 border-b border-white/5 flex items-center gap-1.5">
              <HelpCircle size={13} className="text-[#D4A017]" />
              Support
            </h4>
            <ul className="space-y-3 text-xs font-medium">
              <li>
                <button onClick={() => navigate('contact')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Contact Us</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('trip-builder')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Trip Builder</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('faq')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>FAQs</span>
                </button>
              </li>
              <li>
                <button onClick={handleCareersClick} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Careers</span>
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Legal */}
          <div className="flex flex-col">
            <h4 className="text-[#D4A017] font-black text-xs uppercase tracking-widest mb-5 pb-2 border-b border-white/5 flex items-center gap-1.5">
              <Star size={13} className="text-[#D4A017]" />
              Legal
            </h4>
            <ul className="space-y-3 text-xs font-medium">
              <li>
                <button onClick={() => navigate('policies')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('policies')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('policies')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Booking Policy</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('policies')} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 group">
                  <ChevronRight size={10} className="text-[#D4A017]/40 group-hover:text-[#D4A017] transition-colors" />
                  <span>Cancellation Policy</span>
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 5: Connect With Us */}
          <div className="flex flex-col">
            <h4 className="text-[#D4A017] font-black text-xs uppercase tracking-widest mb-5 pb-2 border-b border-white/5 flex items-center gap-1.5">
              <MessageCircle size={13} className="text-[#D4A017]" />
              Connect With Us
            </h4>
            <ul className="space-y-3.5">
              <li>
                <a
                  href="https://wa.me/255629506063"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('Footer Connect Link', 'General')}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#25D366] transition-colors font-medium group"
                >
                  <MessageCircle size={15} fill="currentColor" className="text-[#25D366] group-hover:scale-110 transition-transform" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com/zanzibartripandrelax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#1877F2] transition-colors font-medium group"
                >
                  <Facebook size={15} className="text-gray-400 group-hover:text-[#1877F2] group-hover:scale-110 transition-transform" />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/zanzibartripandrelax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#E4405F] transition-colors font-medium group"
                >
                  <Instagram size={15} className="text-gray-400 group-hover:text-[#E4405F] group-hover:scale-110 transition-transform" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com/@zanzibartripandrelax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors font-medium group"
                >
                  <span className="text-gray-400 group-hover:text-white group-hover:scale-110 transition-transform">
                    <TikTokIcon size={14} />
                  </span>
                  <span>TikTok</span>
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com/@zanzibartripandrelax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#FF0000] transition-colors font-medium group"
                >
                  <Youtube size={15} className="text-gray-400 group-hover:text-[#FF0000] group-hover:scale-110 transition-transform" />
                  <span>YouTube</span>
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/company/zanzibartripandrelax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#0A66C2] transition-colors font-medium group"
                >
                  <Linkedin size={15} className="text-gray-400 group-hover:text-[#0A66C2] group-hover:scale-110 transition-transform" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/zanzibartrip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors font-medium group"
                >
                  <Twitter size={15} className="text-gray-400 group-hover:text-white group-hover:scale-110 transition-transform" />
                  <span>Twitter / X</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:zanzibartripandrelax@gmail.com"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors font-medium group"
                >
                  <Mail size={15} className="text-gray-400 group-hover:text-[#D4A017] group-hover:scale-110 transition-transform" />
                  <span>Email</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM SECTION: COPYRIGHT, LEGAL, AND DESIGN CREDITS */}
        <div className="border-t border-white/10 mt-16 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-500 font-medium">
            <p className="text-center md:text-left leading-relaxed">
              &copy; {year} Zanzibar Trip and Relax. All rights reserved. Registered Tour Operator Lic No. TALA 98112-ZRT.
              <span className="mx-2">•</span>
              <button 
                onClick={() => navigate('admin/login')} 
                className="text-gray-500 hover:text-[#D4A017] transition-colors font-semibold underline cursor-pointer"
              >
                Staff Login
              </button>
              <span className="mx-2 text-gray-700">•</span>
              <button 
                onClick={() => navigate('owner/login')} 
                className="text-gray-500 hover:text-[#D4A017] transition-colors font-semibold underline cursor-pointer"
              >
                Owner Portal
              </button>
            </p>
            <div className="flex items-center gap-1 text-center font-mono">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">&#10084;</span>
              <span>in Stone Town, Zanzibar</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
