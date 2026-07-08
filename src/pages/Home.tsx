import { useState, useEffect, useRef, type ReactNode, type FormEvent } from 'react';
import { Shield, Clock, Users, Headphones, Compass, Fish, Camera, Send, CheckCircle, Palmtree, ChevronRight, Phone, MessageCircle, ArrowRight, Star, MapPin, Sparkles } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import GuestReviews from '../components/GuestReviews';
import SocialFeed from '../components/SocialFeed';

import Newsletter from '../components/Newsletter';
import { supabase } from '../lib/supabase';
import { getSiteContent } from '../lib/cmsStore';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { ProgressiveImage } from '../components/ProgressiveImage';
import SmartSearchEngine from '../components/SmartSearchEngine';
import { useScrollY } from '../hooks/useScrollY';
import { useAnalytics } from '../context/AnalyticsContext';

interface HomeProps {
  navigate: (page: Page) => void;
}

const rotatingHeroSlides = [
  {
    src: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1920',
    caption: 'Zanzibar Paradise',
  },
  {
    src: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=1920',
    caption: 'Nakupenda Sandbank',
  },
  {
    src: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1920',
    caption: 'Dhow Sunset Cruise',
  },
  {
    src: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1920',
    caption: 'Serengeti Safari',
  },
  {
    src: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=1920',
    caption: 'Crystal Clear Waters',
  },
];

const featuredExperiences = [
  { icon: Compass, title: 'Day Tours', desc: 'Stone Town, Safari Blue, Prison Island & more', page: 'tours' as Page, img: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { icon: Compass, title: 'Holiday Packages', desc: '3-7 day curated beach holidays', page: 'packages' as Page, img: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { icon: Camera, title: 'Tanzania Safaris', desc: 'Serengeti, Ngorongoro & wildlife', page: 'safaris' as Page, img: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { icon: Fish, title: 'Airport Transfers', desc: 'Private transfers to any hotel', page: 'transfers' as Page, img: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

const stats = [
  { value: '5,000+', label: 'Happy Travelers' },
  { value: '50+', label: 'Experiences' },
  { value: '10', label: 'Years Experience' },
  { value: '5.0★', label: 'Average Rating' },
];

const trustBadges = [
  { icon: Shield, title: 'Licensed & Registered', desc: 'Fully licensed and locally registered with ZATI & TTB.' },
  { icon: Users, title: 'Expert Local Guides', desc: 'Certified guides who are born, raised, and seasoned in East Africa.' },
  { icon: Clock, title: '24/7 Priority Support', desc: 'Continuous multi-channel support on ground throughout your adventure.' },
  { icon: Headphones, title: 'Best Local Price', desc: 'Direct booking model with maximum savings and zero hidden broker fees.' },
  { icon: Compass, title: 'Tailor-Made Trips', desc: '100% personalized travel plans structured to match your preferred speed.' },
  { icon: Star, title: 'Perfect 5★ Reviews', desc: 'Voted five stars by hundreds of happy global holidaymakers and families.' }
];

const destinationHighlights = [
  {
    name: 'Zanzibar Island',
    category: 'Coastal Paradise',
    desc: 'Powdery white sands, warm turquoise lagoons, and legendary palm tree sweeps.',
    img: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'tours' as Page,
  },
  {
    name: 'Serengeti National Park',
    category: 'Mainland Wildlife',
    desc: 'Witness the iconic Great Migration across boundless golden acacia savannahs.',
    img: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'safaris' as Page,
  },
  {
    name: 'Ngorongoro Crater',
    category: 'Natural Wonder',
    desc: 'Unmatched volcanic sanctuary home to majestic rhinos, lions, and leopards.',
    img: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'safaris' as Page,
  },
  {
    name: 'Tarangire Elephant Haven',
    category: 'Mainland Wildlife',
    desc: 'Wandering herds amidst majestic, ancient baobab trees and river wetlands.',
    img: 'https://images.pexels.com/photos/3816807/pexels-photo-3816807.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'safaris' as Page,
  },
  {
    name: 'Mount Kilimanjaro',
    category: 'Mountain Peak',
    desc: 'Summit the legendary snowy roof of Africa, the tallest free-standing peak.',
    img: 'https://images.pexels.com/photos/1645028/pexels-photo-1645028.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'kilimanjaro' as Page,
  },
  {
    name: 'Mikumi Wildlife plains',
    category: 'Southern Safari',
    desc: 'Highly accessible open plains rich in wild giraffes, buffalos, and zebras.',
    img: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'safaris' as Page,
  },
  {
    name: 'Nyerere National Park',
    category: 'Southern Wilderness',
    desc: 'Vast, untouched rivers with hippos, crocodiles, and raw boat cruises.',
    img: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'safaris' as Page,
  },
  {
    name: 'Stone Town',
    category: 'Cultural Heritage',
    desc: 'Labyrinth of ancient doors, aromatic spice stalls, and deep Swahili tales.',
    img: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'tours' as Page,
  },
  {
    name: 'Jozani Monkey Forest',
    category: 'Endemic Nature',
    desc: 'Observe the playful, rare Red Colobus Monkeys residing in lush mahogany canopies.',
    img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'tours' as Page,
  },
  {
    name: 'Prison Island',
    category: 'Islet & History',
    desc: 'Feed centenary Aldabra giant tortoises and dive along vibrant tropical reefs.',
    img: 'https://images.pexels.com/photos/912278/pexels-photo-912278.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'tours' as Page,
  },
  {
    name: 'Safari Blue Lagoon',
    category: 'Coastal Adventure',
    desc: 'Traditional dhow sailing across marine parks, sandbanks, and sea mangrove forests.',
    img: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'tours' as Page,
  },
  {
    name: 'Mnemba Island Reef',
    category: 'Ocean Conservation',
    desc: 'Vibrant sea reefs hosting wild sea turtles, spinner dolphins, and clear snorkeling.',
    img: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600',
    page: 'tours' as Page,
  }
];

function AnimatedSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${className} transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
}

export default function Home({ navigate }: HomeProps) {
  const { trackWhatsAppClick } = useAnalytics();
  const [slide, setSlide] = useState(0);
  const scrollY = useScrollY();
  const content = getSiteContent();
  const { t, tDefault } = useLanguage();

  const heroSlides = content.hero?.bgImages && content.hero.bgImages.length > 0
    ? content.hero.bgImages.map((url, idx) => ({ src: url, caption: `Slide ${idx + 1}` }))
    : rotatingHeroSlides;

  const displayStats = content.about?.stats && content.about.stats.length > 0
    ? content.about.stats
    : stats;

  useEffect(() => {
    const interval = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen font-sans antialiased text-slate-800 bg-white">
      {/* Hero */}
      <section id="hero" className="relative h-[620px] sm:h-[680px] lg:h-[720px] min-h-[580px] flex items-center justify-center overflow-hidden" aria-label="Zanzibar Trip and Relax Welcome Hero">
        {heroSlides.map((s, i) => (
          <div 
            key={i} 
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === slide ? 'opacity-100' : 'opacity-0'}`}
            style={{ transform: `translateY(${scrollY * 0.25}px) scale(1.1)` }}
          >
            <ProgressiveImage 
              src={s.src} 
              alt={s.caption} 
              className="w-full h-full object-cover object-center" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1920') {
                  target.src = 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1920';
                }
              }}
            />
          </div>
        ))}
        {/* Dark Elegant Scrim with optimal overlay to guarantee 4.5:1 contrast on white text */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020C1F]/90 via-[#020C1F]/50 to-[#020C1F]/95 pointer-events-none" />
        
        <div className="relative z-10 text-center px-4 pt-16 pb-8 w-full max-w-5xl mx-auto" style={{ transform: `translateY(-${scrollY * 0.05}px)` }}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/25 px-3 py-1.5 rounded-full mb-4 select-none animate-shimmer shadow-lg">
            <Palmtree className="text-[#D4A017] shrink-0" size={14} />
            <span className="text-white text-[10px] sm:text-xs font-semibold tracking-widest uppercase font-mono">Zanzibar Trip & Relax</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-[1.15] tracking-tight drop-shadow-lg" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            {tDefault('hero.headingPart1', content.hero?.headingPart1 || 'Discover Zanzibar.')}<br />
            <span className="text-[#D4A017]">{tDefault('hero.headingPart2', content.hero?.headingPart2 || 'Explore Tanzania.')}</span><br />
            <span className="text-white/95">{tDefault('hero.headingPart3', content.hero?.headingPart3 || 'Relax in Paradise.')}</span>
          </h1>
          
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 max-w-xl mx-auto mb-6 sm:mb-8 font-medium leading-relaxed drop-shadow-md">
            {tDefault('hero.subtitle', content.hero?.subtitle || 'Authentic Experiences. Personalized Holidays. Unforgettable Memories.')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 max-w-md sm:max-w-xl mx-auto">
            <button 
              type="button" 
              onClick={() => navigate((content.hero?.primaryButtonAction as any) || 'tours')} 
              className="w-full sm:w-auto px-6 py-3.5 bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-black rounded-full transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer text-xs uppercase tracking-wider"
              aria-label="Book your Zanzibar or Tanzania tour experience"
            >
              <Compass size={16} />
              {tDefault('btn.bookTour', content.hero?.primaryButtonText || 'Book a Tour')}
            </button>
            <button 
              type="button" 
              onClick={() => navigate((content.hero?.secondaryButtonAction as any) || 'trip-builder')} 
              className="w-full sm:w-auto px-6 py-3.5 border-2 border-white/60 text-white font-extrabold rounded-full hover:bg-white/10 hover:border-white transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer text-xs uppercase tracking-wider bg-black/10 backdrop-blur-sm"
              aria-label="Use Trip Builder to custom design your journey"
            >
              {tDefault('btn.planTrip', content.hero?.secondaryButtonText || 'Plan My Trip')}
            </button>
            <a 
              href="https://wa.me/255629506063" 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => trackWhatsAppClick('Home Hero Section', 'General Chat')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-black rounded-full transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] duration-200 text-xs uppercase tracking-wider"
              aria-label="Contact our customer care desk on WhatsApp"
            >
              <MessageCircle size={16} fill="white" />
              {t('btn.whatsappChat')}
            </a>
          </div>

          {/* Slide indicators with labels for screenreaders */}
          <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Hero background sliders">
            {heroSlides.map((_, i) => (
              <button 
                type="button" 
                key={i} 
                onClick={() => setSlide(i)} 
                role="tab"
                aria-selected={i === slide}
                aria-label={`Show slide background number ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === slide ? 'bg-[#D4A017] w-8' : 'bg-white/45 hover:bg-white/70'}`} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Smart Search overlay segment */}
      <section className="relative z-20 -mt-16 pb-8 px-4" aria-label="Quick Experience Finder">
        <SmartSearchEngine navigate={navigate} />
      </section>

      {/* Trip Builder Banner bar */}
      <section className="bg-[#0B3B8C] py-5 px-4 shadow-inner border-y border-[#0B3B8C]/80 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-3.5 text-white">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
              <Compass size={22} className="text-[#D4A017]" />
            </div>
            <div>
              <p className="font-extrabold text-sm md:text-base leading-tight tracking-tight">Tailor-Make Your East African Dream Holiday</p>
              <p className="text-xs text-white/70 mt-0.5 font-medium">Select and bundle local tours, transfers, custom hotels & wild safaris in seconds.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('trip-builder')} 
            className="w-full md:w-auto bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.98] shadow-md cursor-pointer"
          >
            Start Custom Trip Builder <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* Featured Experiences */}
      <section id="featured-experiences" className="py-24 px-4 bg-slate-50/60 border-b border-slate-100" aria-label="Featured Experiences and Categories">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Curated Adventure Types</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Featured Experiences</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
              Explore Zanzibar island secrets or venture out into raw mainland savannah parks. We design options for every wanderlust speed.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-4.5 rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredExperiences.map((exp, i) => (
              <div key={i}>
                <AnimatedSection>
                  <button 
                    type="button" 
                    onClick={() => navigate(exp.page)} 
                    className="group w-full text-left bg-white rounded-2xl overflow-hidden border border-slate-150/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between h-80"
                    aria-label={`Explore our custom range of ${exp.title}`}
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <ProgressiveImage src={exp.img} alt={exp.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E3D]/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-white/20 shadow-sm text-[#0B3B8C]">
                        <exp.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-[#0B3B8C] group-hover:text-[#D4A017] transition-colors leading-tight mb-1.5">{exp.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{exp.desc}</p>
                      </div>
                      <div className="pt-2 flex items-center text-[#D4A017] text-xs font-black uppercase tracking-wider gap-1 group-hover:text-[#c49010]">
                        Explore Trips <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                </AnimatedSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legendary Destinations Grid */}
      <section id="destinations-showcase" className="py-24 px-4 bg-white border-b border-slate-100 relative overflow-hidden" aria-label="Destinations Showcase">
        {/* Soft elegant background ambient circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4A017]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0B3B8C]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Legendary Wonders</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Discover East Africa</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-2xl mx-auto mt-2 leading-relaxed">
              Explore the world's most pristine tropical sands, ancient architectural heritage, and breathtaking savannah wildlife parks.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-4.5 rounded-full" />
          </AnimatedSection>

          {/* Destinations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {destinationHighlights.map((dest, idx) => (
              <div key={idx}>
                <AnimatedSection>
                  <div 
                    onClick={() => navigate(dest.page)}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-150/85 hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-96 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`Explore tours and trips in ${dest.name}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { navigate(dest.page); } }}
                  >
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <ProgressiveImage 
                        src={dest.img} 
                        alt={`${dest.name} - ${dest.category}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#0B3B8C] text-[9px] font-black px-2.5 py-1.5 rounded-xl uppercase tracking-wider shadow-sm border border-slate-100">
                        {dest.category}
                      </span>
                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white">
                        <MapPin size={14} className="text-[#D4A017] shrink-0" />
                        <h3 className="font-extrabold text-sm md:text-base tracking-tight drop-shadow-sm">{dest.name}</h3>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-slate-550 text-xs md:text-sm leading-relaxed line-clamp-3">
                        {dest.desc}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Explore Trips</span>
                        <div className="text-[#0B3B8C] font-extrabold text-xs flex items-center gap-0.5 group-hover:text-[#D4A017] transition-colors">
                          <span>Discover</span>
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-24 px-4 bg-slate-50/50 border-b border-slate-100" aria-label="Our Core Commitments">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Our Guarantees</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Why Travel With Us</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
              We coordinate certified local experts, safe payment pathways, and direct-booking pricing advantages with around-the-clock priority hospitality.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-4.5 rounded-full" />
          </AnimatedSection>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {trustBadges.map((badge, i) => (
              <div key={i}>
                <AnimatedSection>
                  <div className="flex items-start gap-4.5 p-6 bg-white rounded-2xl border border-slate-150/70 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
                    <div className="p-3 bg-[#0B3B8C]/5 group-hover:bg-[#0B3B8C]/10 rounded-xl text-[#0B3B8C] shrink-0 transition-all">
                      <badge.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[#0B3B8C] mb-1.5 group-hover:text-[#D4A017] transition-colors leading-tight">{badge.title}</h3>
                      <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{badge.desc}</p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Reviews */}
      <GuestReviews navigate={navigate} />

      {/* Social Live Feed */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <SocialFeed />
      </div>

      {/* Founder Section */}
      <section id="founder" className="py-24 px-4 bg-[#F4E7D3]/80 relative overflow-hidden" aria-label="Founder and Host Introduction">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <AnimatedSection className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 text-left">
              <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Meet Your Host</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0B3B8C] mb-4 leading-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                {content.about?.team?.[0]?.name || "Gerevas Paulo Mtaki"}
              </h2>
              <div className="gold-line-left mb-4" />
              <p className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-4">
                {content.about?.team?.[0]?.role || "Founder & CEO"}
              </p>
              <p className="text-[#334155] mb-6 leading-relaxed text-xs md:text-sm">
                {content.about?.team?.[0]?.bio || "Born and raised in Zanzibar, I started Zanzibar Trip & Relax to share the beauty of my homeland with the world. Our team specializes in creating authentic experiences that go beyond typical tourism - from hidden beaches to wildlife safaris."}
              </p>
              <button 
                type="button" 
                onClick={() => navigate('about')} 
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#0B3B8C] hover:text-[#D4A017] transition-all bg-white hover:bg-slate-50 px-5 py-3 rounded-xl border border-[#0B3B8C]/10 shadow-sm cursor-pointer"
                aria-label="Read our full brand story and team member histories"
              >
                Learn More About Us <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <ProgressiveImage 
                  src={content.about?.team?.[0]?.image || "/src/assets/images/ceo_gerevas.jpg"} 
                  alt={`${content.about?.team?.[0]?.name || "Gerevas Paulo Mtaki"}, Founder & CEO of Zanzibar Trip & Relax`} 
                  className="w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-full object-cover shadow-2xl border-4 border-white aspect-square relative z-10" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600";
                  }}
                />
                <div className="absolute -inset-1.5 bg-[#D4A017]/30 rounded-full blur-md animate-pulse" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Swahili Corner */}
      <section className="py-24 px-4 bg-[#0B3B8C] relative overflow-hidden" aria-label="Swahili Corner Vocabulary Lessons">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1224]/30 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-14">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Learn a Few Words</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Swahili Corner
            </h2>
            <p className="text-white/80 text-xs md:text-sm font-medium">Impress local communities, boat captains, and rangers with beautiful native greetings!</p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-4 rounded-full" />
          </AnimatedSection>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { word: 'Jambo', meaning: 'Hello', pronunciation: 'JAM-bo' },
              { word: 'Karibu', meaning: 'Welcome', pronunciation: 'ka-REE-boo' },
              { word: 'Asante Sana', meaning: 'Thank You', pronunciation: 'ah-SAN-teh SAH-nah' },
              { word: 'Hakuna Matata', meaning: 'No Problem', pronunciation: 'hah-KOO-nah mah-TAH-tah' },
              { word: 'Nakupenda', meaning: 'I Love You', pronunciation: 'nah-koo-PEN-dah' },
              { word: 'Pole Pole', meaning: 'Slowly Slowly', pronunciation: 'PO-leh PO-leh' },
              { word: 'Habari', meaning: 'How Are You?', pronunciation: 'hah-BAH-ree' },
              { word: 'Nzuri', meaning: 'Good / Fine', pronunciation: 'n-ZOO-ree' },
              { word: 'Kwaheri', meaning: 'Goodbye', pronunciation: 'kwah-HEH-ree' },
              { word: 'Rafiki', meaning: 'Friend', pronunciation: 'ref-FEE-kee' },
            ].map((item, i) => (
              <div key={i}>
                <AnimatedSection>
                  <div className="bg-white/10 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/15 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-350 select-none">
                    <div className="text-[#D4A017] font-black text-lg mb-1 leading-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>{item.word}</div>
                    <div className="text-white font-extrabold text-xs mb-1.5 leading-tight">{item.meaning}</div>
                    <div className="text-white/50 text-[10px] font-mono">/{item.pronunciation}/</div>
                  </div>
                </AnimatedSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter variant="hero" />

      {/* Dynamic CTA */}
      <section id="cta-adventure" className="py-24 px-4 bg-gradient-to-br from-[#0B3B8C] to-[#0A1224] relative overflow-hidden" aria-label="Adventure booking invitation">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,160,23,0.06),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AnimatedSection className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Ready to Start Your East African Adventure?
            </h2>
            <p className="text-white/85 text-xs sm:text-sm md:text-base lg:text-lg max-w-xl mx-auto leading-relaxed">
              Let our experienced native team help you craft custom itineraries, private beach cruises, and grand safaris today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 max-w-md sm:max-w-lg mx-auto">
              <button 
                type="button" 
                onClick={() => navigate('booking')} 
                className="w-full sm:w-auto bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-black px-8 py-4.5 rounded-full text-xs uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.98] duration-200 cursor-pointer shadow-lg hover:shadow-xl text-center"
                aria-label="Directly book your upcoming holiday"
              >
                Book Your Experience
              </button>
              
              <a 
                href="https://wa.me/255629506063" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => trackWhatsAppClick('Home Bottom Section', 'General Chat')}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-extrabold px-8 py-4.5 rounded-full text-xs uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.98] duration-200 flex items-center justify-center gap-2.5 border border-white/20 backdrop-blur-md"
                aria-label="Ask our representatives a question via instant WhatsApp chat"
              >
                <MessageCircle size={16} fill="currentColor" /> Chat on WhatsApp
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
