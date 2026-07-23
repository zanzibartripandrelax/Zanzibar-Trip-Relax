import { useState, useEffect, useRef, type ReactNode } from 'react';
import { 
  Compass, Palmtree, MessageCircle, MapPin, Star, ArrowRight, 
  Clock, Shield, Users, CheckCircle, Calendar, ChevronRight, 
  Sparkles, Phone, Waves, TreePine, Mountain, Plane, Play, 
  ShieldCheck, Award, Heart, Check, X
} from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import GuestReviews from '../components/GuestReviews';
import Newsletter from '../components/Newsletter';
import { getSiteContent, extractYouTubeId, getYouTubeEmbedUrl } from '../lib/cmsStore';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { ProgressiveImage } from '../components/ProgressiveImage';
import SmartSearchEngine from '../components/SmartSearchEngine';
import { useScrollY } from '../hooks/useScrollY';
import { useAnalytics } from '../context/AnalyticsContext';

interface HomeProps {
  navigate: (page: Page, id?: string) => void;
}

const rotatingHeroSlides = [
  {
    src: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1920',
    caption: 'Zanzibar Paradise Beach',
  },
  {
    src: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=1920',
    caption: 'Nakupenda Private Sandbank',
  },
  {
    src: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1920',
    caption: 'Sunset Dhow Sailing Cruise',
  },
  {
    src: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1920',
    caption: 'Mainland Tanzania Serengeti Safari',
  },
  {
    src: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=1920',
    caption: 'Crystal Clear Marine Waters',
  },
];

// Why book with us 6 cards
const whyBookWithUs = [
  {
    icon: ShieldCheck,
    title: 'Licensed Local Operator',
    desc: 'Fully registered and licensed with the Tanzanian Ministry of Natural Resources & Tourism and Zanzibar Tourism Commission.'
  },
  {
    icon: Award,
    title: 'Best Price Guarantee',
    desc: 'Book directly with local experts to skip third-party agent markup fees and enjoy premium quality at original rates.'
  },
  {
    icon: Heart,
    title: 'Private Experiences',
    desc: 'Your private group enjoys an exclusive 4x4 land cruiser, private boat, or specialized guides for customized trip speeds.'
  },
  {
    icon: Users,
    title: 'Expert Local Guides',
    desc: 'Professional multi-lingual drivers and rangers born and raised in East Africa, carrying years of tracking expertise.'
  },
  {
    icon: CheckCircle,
    title: 'Secure Payments',
    desc: 'Direct secure booking payments via encrypted pathways with complete transaction protection before arrival.'
  },
  {
    icon: Phone,
    title: '24/7 Customer Support',
    desc: 'On-the-ground support with round-the-clock priority WhatsApp, phone, and emergency response teams during your stay.'
  }
];

// Featured Experiences 5 cards
const featuredExperiences = [
  { 
    id: 'tours', 
    title: 'Zanzibar Tours', 
    desc: 'Explore Stone Town history, swim with sea turtles, and snorkel Mnemba reefs.', 
    img: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  { 
    id: 'safaris', 
    title: 'Tanzania Safaris', 
    desc: 'Venture into Serengeti plains, Ngorongoro Crater, and track the legendary Big Five.', 
    img: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  { 
    id: 'packages', 
    title: 'Holiday Packages', 
    desc: 'All-inclusive 3 to 7-day multi-destination holiday packages blending beach & bush.', 
    img: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  { 
    id: 'kilimanjaro', 
    title: 'Kilimanjaro Treks', 
    desc: 'Summit the legendary roof of Africa via high-success Machame, Marangu or Lemosho routes.', 
    img: 'https://images.pexels.com/photos/1645028/pexels-photo-1645028.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  { 
    id: 'transfers', 
    title: 'Airport Transfers', 
    desc: 'Secure private taxis, transfers, and resort pickup services starting from $20.', 
    img: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=800' 
  }
];

// Destinations Hub Data
const regionsHub = [
  {
    id: 'northern',
    title: 'Northern Tanzania',
    desc: 'Classic safaris, volcanic calderas & snowy mountain summits.',
    destinations: [
      { name: 'Serengeti', desc: 'Host to the Great Wildebeest Migration plains.', img: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Ngorongoro', desc: 'Volcanic caldera sheltering 30,000 animals.', img: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Tarangire', desc: 'Vast elephant herds wandering ancient baobabs.', img: 'https://images.pexels.com/photos/3816807/pexels-photo-3816807.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Lake Manyara', desc: 'Soda lakes filled with millions of pink flamingos.', img: 'https://images.pexels.com/photos/1204631/pexels-photo-1204631.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Mount Meru', desc: 'Stunning volcanic peak over Arusha National Park.', img: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Kilimanjaro', desc: 'Summit the snowy 5,895m roof of Africa.', img: 'https://images.pexels.com/photos/1645028/pexels-photo-1645028.jpeg?auto=compress&cs=tinysrgb&w=400' }
    ]
  },
  {
    id: 'southern',
    title: 'Southern Tanzania',
    desc: 'Remote, untouched wilderness far from the tourist crowds.',
    destinations: [
      { name: 'Nyerere (Selous)', desc: 'Africa\'s largest wildlife reserve with boat safaris.', img: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Ruaha', desc: 'Rugged wild landscape famed for massive lion prides.', img: 'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Mikumi', desc: 'Accessible game plains packed with giraffes and zebras.', img: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=400' }
    ]
  },
  {
    id: 'zanzibar',
    title: 'Zanzibar Archipelago',
    desc: 'Turquoise ocean lagoons, coral atolls & aromatic spice culture.',
    destinations: [
      { name: 'Unguja Island', desc: 'The historic mainland of beaches and Stone Town.', img: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Pemba Island', desc: 'Deep ocean trenches hosting untouched wall coral reefs.', img: 'https://images.pexels.com/photos/1473007/pexels-photo-1473007.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Mafia Island', desc: 'Snorkel and swim alongside gentle giant whale sharks.', img: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=400' }
    ]
  }
];

// Popular 6 Tours
const popularTours = [
  { id: 'safari-blue', title: 'Safari Blue Ocean Cruise', duration: 'Full Day', price: '45', img: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=600', location: 'Fumba Village, Zanzibar', desc: 'Traditional dhow cruise across Menai Bay, beach seafood BBQ and mangrove snorkeling.' },
  { id: 'mnemba-snorkeling', title: 'Mnemba Island Snorkeling', duration: 'Half Day', price: '35', img: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600', location: 'Matemwe, Zanzibar', desc: 'Swim with spinner dolphins and explore vibrant coral ecosystems around Mnemba Atoll.' },
  { id: 'stone-town', title: 'Stone Town Cultural Walk', duration: '3 Hours', price: '20', img: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600', location: 'Stone Town, Zanzibar', desc: 'Explore sultan palaces, spice markets, slave memorial ruins, and ancient carved doors.' },
  { id: 'prison-island', title: 'Prison Island Giant Tortoises', duration: '3 Hours', price: '25', img: 'https://images.pexels.com/photos/912278/pexels-photo-912278.jpeg?auto=compress&cs=tinysrgb&w=600', location: 'Stone Town Port', desc: 'Feed centenary Aldabra giant tortoises and tour historical quarantine island buildings.' },
  { id: 'nungwi-beach-day', title: 'Nungwi & Kendwa Beach Tour', duration: '6 Hours', price: '30', img: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600', location: 'Northern Zanzibar', desc: 'Relax on the islands best non-tidal sandy beaches and explore local dhow boat-building yards.' },
  { id: 'jozani-forest', title: 'Jozani Forest Monkey Sanctuary', duration: '3 Hours', price: '35', img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600', location: 'Central Zanzibar', desc: 'Walk mahogany forests to spot endemic playful Red Colobus Monkeys and mangrove ecosystems.' }
];

// Best-Selling 3 Packages
const bestSellingPackages = [
  { id: 'romantic-escape', title: '3-Day Zanzibar Romantic Escape', duration: '3 Days / 2 Nights', price: '350', img: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600', highlights: ['Boutique historic riad stay', 'Private beachfront seafood dinner', 'Sunset dhow sailing cruise', 'Snorkeling excursion'] },
  { id: 'beach-adventure', title: '5-Day Ultimate Beach & Tour Adventure', duration: '5 Days / 4 Nights', price: '650', img: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600', highlights: ['Safari Blue sailing cruise', 'Stone Town & Spice farm tour', 'Mnemba marine coral reef snorkeling', 'Stay at 4-star oceanfront resort'] },
  { id: 'heritage-ocean-combo', title: '7-Day Heritage, Nature & Ocean Combo', duration: '7 Days / 6 Nights', price: '1150', img: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600', highlights: ['UNESCO Stone Town Sultanates', 'Jozani Forest Red Colobus monkeys', 'Safari Blue ocean cruise & lobster feast', 'Luxury Nungwi Beach resort stay'] }
];

// Feature 4 Safari Packages
const safariPackages = [
  { id: 'nyerere-selous-fly', title: '2-Day Nyerere (Selous) Game Reserve Fly-in Safari', duration: '2 Days / 1 Night', price: '790', parks: 'Nyerere National Park', bigFive: true, img: 'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'serengeti-ngorongoro-combo', title: '4-Day Central Serengeti & Ngorongoro Crater Combo', duration: '4 Days / 3 Nights', price: '1650', parks: 'Serengeti & Ngorongoro', bigFive: true, img: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'northern-circuit', title: '3-Day Tarangire & Ngorongoro Crater Classic', duration: '3 Days / 2 Nights', price: '850', parks: 'Tarangire National Park & Crater', bigFive: true, img: 'https://images.pexels.com/photos/3816807/pexels-photo-3816807.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 'mikumi-drive-in', title: '3-Day Mikumi Wildlife Savannah Safari', duration: '3 Days / 2 Nights', price: '490', parks: 'Mikumi National Park', bigFive: false, img: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=600' }
];

// Kilimanjaro routes
const kiliRoutes = [
  { name: 'Machame Route', duration: '7 Days / 6 Nights', price: '1650', success: '98%', desc: 'Highly scenic, offering "climb high, sleep low" acclimatization with high success.', img: 'https://images.pexels.com/photos/1645028/pexels-photo-1645028.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { name: 'Marangu Route', duration: '6 Days / 5 Nights', price: '1450', success: '85%', desc: 'The classic "Coca-Cola" route featuring comfortable communal wooden A-frame mountain huts.', img: 'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { name: 'Lemosho Route', duration: '8 Days / 7 Nights', price: '1850', success: '99%', desc: 'Pristine, quiet starting trail with high acclimation and stunning wilderness scenery.', img: 'https://images.pexels.com/photos/1645028/pexels-photo-1645028.jpeg?auto=compress&cs=tinysrgb&w=600' }
];

// Transfers data
const transfersList = [
  { type: 'Airport Transfer', desc: 'Pickup from Abeid Amani Karume International Airport (ZNZ) straight to any hotel on Zanzibar.', price: '25', time: '1 hr', icon: Plane },
  { type: 'Hotel Transfer', desc: 'Secure air-conditioned vehicles to navigate comfortably between any resorts on the island.', price: '30', time: '1.5 hrs', icon: Palmtree },
  { type: 'Ferry Transfer', desc: 'Direct pickup from Zanzibar Port / Stone Town Ferry terminal to beach resorts.', price: '20', time: '45 mins', icon: Waves },
  { type: 'Beach Transfer', desc: 'Fast shuttle transfer between North (Nungwi/Kendwa) and East Coast (Paje/Jambiani) locations.', price: '35', time: '1.2 hrs', icon: Palmtree },
  { type: 'Safari Airstrip Transfer', desc: 'Meet-and-greet pickup services at mainland national park bush runways.', price: '40', time: '30 mins', icon: Compass }
];

// Swahili lessons
const swahiliWords = [
  { word: 'Jambo', meaning: 'Hello', pronunciation: 'JAM-bo' },
  { word: 'Karibu', meaning: 'Welcome', pronunciation: 'ka-REE-boo' },
  { word: 'Asante Sana', meaning: 'Thank You Very Much', pronunciation: 'ah-SAN-teh SAH-nah' },
  { word: 'Hakuna Matata', meaning: 'No Troubles / No Problems', pronunciation: 'hah-KOO-nah mah-TAH-tah' },
  { word: 'Pole Pole', meaning: 'Slowly Slowly', pronunciation: 'PO-leh PO-leh' }
];

// Video Gallery data
const videosList = [
  { title: 'Swimming with Turtles at Salaam Cave', youtube: 'https://www.youtube.com/watch?v=F380vshkX80', img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { title: 'Sailing the Safari Blue Cruise', youtube: 'https://www.youtube.com/watch?v=kYv_8Rsm3Yc', img: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { title: 'Tanzania Serengeti Big Five Safari', youtube: 'https://www.youtube.com/watch?v=YmS7O5hI_aE', img: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { title: 'Exploring Stone Town Lanes', youtube: 'https://www.youtube.com/watch?v=P2lP_VMyDq0', img: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { title: 'Mnemba Island Snorkeling Reef', youtube: 'https://www.youtube.com/watch?v=Jb13p5Z0W_k', img: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600' }
];

// Travel Guides
const travelArticles = [
  { id: '4', title: 'Best Time to Visit Zanzibar: Month by Month', excerpt: 'A detailed breakdown of weather patterns, tropical winds, and ocean visibility to help you plan the perfect beach vacation.', date: 'June 18, 2024', readTime: '5 min read', image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Travel Tips' },
  { id: '2', title: 'The Ultimate Guide to Zanzibar Spice Tours', excerpt: 'Learn about the aromatic cloves, cinnamon, and nutmeg that gave Zanzibar its legendary name as the "Spice Island".', date: 'June 5, 2024', readTime: '6 min read', image: 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Culture' },
  { id: '3', title: 'Witnessing the Great Migration: A Complete Guide', excerpt: 'Everything you need to know about planning your wilderness Serengeti safari to catch the breathtaking wildebeest crossings.', date: 'May 28, 2024', readTime: '10 min read', image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600', category: 'Safari' }
];

function AnimatedSection({ children, className = '' }: { children: ReactNode; className?: string; key?: any }) {
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
    <div ref={ref} className={`${className} transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      {children}
    </div>
  );
}

export default function Home({ navigate }: HomeProps) {
  const { trackWhatsAppClick } = useAnalytics();
  const [slide, setSlide] = useState(0);
  const [activeVideoModal, setActiveVideoModal] = useState<{ title: string; embedUrl: string } | null>(null);
  const scrollY = useScrollY();
  const content = getSiteContent();

  // Region State for popular destination hub
  const [activeRegionId, setActiveRegionId] = useState('northern');

  const heroSlides = content.hero?.bgImages && content.hero.bgImages.length > 0
    ? content.hero.bgImages.map((url, idx) => ({ src: url, caption: `Slide ${idx + 1}` }))
    : rotatingHeroSlides;

  useEffect(() => {
    const interval = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 7000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen font-sans antialiased text-slate-850 bg-white">
      
      {/* SECTION 1 — FULL SCREEN HERO */}
      <section id="hero" className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden" aria-label="Zanzibar Trip and Relax Hero Section">
        {heroSlides.map((s, i) => (
          <div 
            key={i} 
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === slide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          >
            <ProgressiveImage 
              src={s.src} 
              alt={s.caption} 
              className="w-full h-full object-cover object-center filter brightness-[0.8]" 
            />
          </div>
        ))}
        {/* Deep, rich modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1224]/85 via-[#0A1224]/45 to-[#0A1224]/90 pointer-events-none" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col justify-center items-center h-full pt-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4.5 py-2 rounded-full mb-6 select-none animate-pulse shadow-xl">
            <Palmtree className="text-[#D4A017] shrink-0" size={15} />
            <span className="text-white text-[11px] font-black tracking-widest uppercase font-mono">Zanzibar Trip & Relax</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.12] tracking-tight drop-shadow-xl" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Discover Tanzania & Zanzibar<br />
            <span className="text-[#D4A017] italic">Like Never Before</span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed font-medium drop-shadow-md">
            Luxury safaris, Zanzibar holidays, Mount Kilimanjaro trekking, island excursions, and private airport transfers — professionally planned by local travel experts.
          </p>

          {/* Floating search is located right below the hero card */}
          <div className="mb-6" />

          {/* Premium trust factors */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 pt-6 border-t border-white/10 w-full max-w-4xl text-white/95 text-[11px] font-bold uppercase tracking-wider">
            <div className="flex items-center justify-center gap-1.5">
              <Star className="text-[#D4A017]" size={13} fill="currentColor" />
              <span>4.9 Guest Rating</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="text-[#D4A017]" size={13} />
              <span>Licensed Operator</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle className="text-[#D4A017]" size={13} />
              <span>Secure Booking</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="text-[#D4A017]" size={13} />
              <span>24/7 Local Support</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 col-span-2 md:col-span-1">
              <Users className="text-[#D4A017]" size={13} />
              <span>10,000+ Travelers</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — QUICK SEARCH (MOST IMPORTANT) */}
      <section className="relative z-30 -mt-10 md:-mt-8 pb-10">
        <SmartSearchEngine navigate={navigate} initiallyOpenCalendar={false} />
      </section>

      {/* SECTION 3 — WHY BOOK WITH US */}
      <section id="why-book" className="py-24 px-4 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Our Commited Standards</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Why Book With Us</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              We offer secure reservation systems, native driver-guides, direct-to-operator local pricing advantages, and multi-channel ground protection support.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-5 rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyBookWithUs.map((item, idx) => (
              <AnimatedSection key={idx}>
                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#D4A017]/25 transition-all duration-300 group h-full">
                  <div className="p-3 bg-[#0B3B8C]/5 group-hover:bg-[#0B3B8C]/10 rounded-xl text-[#0B3B8C] shrink-0 transition-colors">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#0B3B8C] mb-1.5 group-hover:text-[#D4A017] transition-colors leading-tight">{item.title}</h3>
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — FEATURED EXPERIENCES */}
      <section id="featured-experiences" className="py-24 px-4 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Discover Your Rhythm</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Featured Experiences</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Whether you seek tropical relaxation on powdery sandbanks or high-adrenaline wildlife spotting, our custom plans provide the perfect vacation pace.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-5 rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {featuredExperiences.map((exp, idx) => (
              <AnimatedSection key={idx}>
                <button
                  type="button"
                  onClick={() => navigate(exp.id as Page)}
                  className="group w-full text-left bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-80"
                  aria-label={`Explore our range of ${exp.title}`}
                >
                  <div className="relative h-44 overflow-hidden bg-slate-50 w-full">
                    <ProgressiveImage src={exp.img} alt={exp.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0B3B8C] group-hover:text-[#D4A017] transition-colors mb-1">{exp.title}</h3>
                      <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{exp.desc}</p>
                    </div>
                    <div className="flex items-center text-[#D4A017] text-[10px] font-black uppercase tracking-wider gap-0.5 group-hover:text-[#c49010] mt-2">
                      Explore Trips <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — POPULAR DESTINATIONS */}
      <section id="destinations-hub" className="py-24 px-4 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Interactive Guide</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Popular Destinations</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Explore our comprehensive Swahili travel circuits to decide which spectacular regions fit your upcoming dream holiday.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-5 rounded-full" />
          </AnimatedSection>

          {/* Region Tabs */}
          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            {regionsHub.map(reg => (
              <button
                key={reg.id}
                type="button"
                onClick={() => setActiveRegionId(reg.id)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeRegionId === reg.id 
                    ? 'bg-[#0B3B8C] text-white shadow-md scale-105' 
                    : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-[#0B3B8C] border border-slate-200'
                }`}
              >
                {reg.title}
              </button>
            ))}
          </div>

          {/* Display Destinations of Active Region */}
          <AnimatePresence mode="wait">
            {regionsHub.map(reg => reg.id === activeRegionId && (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="text-center max-w-xl mx-auto mb-10">
                  <p className="text-[#0B3B8C] font-bold text-sm italic">"{reg.desc}"</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reg.destinations.map((dest, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => navigate('destinations')}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#D4A017]/35 transition-all duration-300 cursor-pointer h-[280px] flex flex-col justify-between"
                    >
                      <div className="relative h-44 overflow-hidden bg-slate-50">
                        <ProgressiveImage src={dest.img} alt={dest.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-3 left-4 text-white font-extrabold text-base tracking-tight drop-shadow-sm flex items-center gap-1">
                          <MapPin size={14} className="text-[#D4A017]" />
                          {dest.name}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <p className="text-[11px] sm:text-xs text-slate-500 leading-normal line-clamp-2">
                          {dest.desc}
                        </p>
                        <span className="text-[10px] font-black uppercase text-[#0B3B8C] group-hover:text-[#D4A017] transition-colors flex items-center gap-0.5 mt-2">
                          Explore Destination <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* SECTION 6 — MOST POPULAR TOURS */}
      <section id="popular-tours" className="py-24 px-4 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Our High-Demand Excursions</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Most Popular Tours</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Book our local, certified guided excursions with private vehicles, standard tickets, and verified Swahili historians.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-5 rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularTours.map((tour, idx) => (
              <AnimatedSection key={`${tour.id}-${idx}`}>
                <div className="group bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-[420px]">
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <ProgressiveImage src={tour.img} alt={tour.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-[#D4A017] text-xs font-black px-3 py-1.5 rounded-full border border-[#D4A017]/20">
                      from ${tour.price}
                    </span>
                    <span className="absolute bottom-3 left-4 flex items-center gap-1 text-[11px] font-bold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                      <Clock size={11} className="text-[#D4A017]" />
                      {tour.duration}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-450 font-black uppercase tracking-wider mb-1.5">
                        <MapPin size={10} className="text-[#D4A017]" />
                        {tour.location}
                      </div>
                      <h3 className="font-extrabold text-base text-[#0B3B8C] group-hover:text-[#D4A017] transition-colors line-clamp-1 mb-1.5">{tour.title}</h3>
                      <p className="text-xs text-slate-500 leading-normal line-clamp-3">{tour.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-150 flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-[#D4A017]">
                        {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                        <span className="text-[10px] font-bold text-slate-400 ml-1">5.0</span>
                      </div>
                      
                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => navigate('tours')}
                          className="px-3.5 py-1.5 border border-slate-200 hover:border-[#0B3B8C] hover:text-[#0B3B8C] text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('booking', `package=${encodeURIComponent(tour.title)}`)}
                          className="px-3.5 py-1.5 bg-[#0B3B8C] hover:bg-opacity-95 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — HOLIDAY PACKAGES */}
      <section id="packages-section" className="py-24 px-4 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Curated Swahili Vacation Combos</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>All-Inclusive Holiday Packages</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Combine romantic ocean resorts, private transfers, daily excursions, and safaris inside pristine curated vacation packages.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-5 rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {bestSellingPackages.map((pkg, idx) => (
              <AnimatedSection key={pkg.id}>
                <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-[#D4A017]/35 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-[480px]">
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <ProgressiveImage src={pkg.img} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute top-4 left-4 bg-[#D4A017] text-[#0A1224] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                      Best Seller
                    </span>
                    <span className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full border border-white/10">
                      from ${pkg.price} <span className="text-[10px] text-slate-300 font-normal">pp</span>
                    </span>
                    <span className="absolute bottom-3 left-4 flex items-center gap-1 text-[11px] font-bold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                      <Clock size={11} className="text-[#D4A017]" />
                      {pkg.duration}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-lg text-[#0B3B8C] group-hover:text-[#D4A017] transition-colors leading-tight mb-3 line-clamp-1">{pkg.title}</h3>
                      <ul className="space-y-1.5">
                        {pkg.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-500 font-medium">
                            <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span className="truncate">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full">
                        All-Inclusive
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate('packages')}
                          className="px-4 py-2 border border-slate-200 hover:border-[#0B3B8C] text-[#0B3B8C] hover:bg-[#0B3B8C]/5 text-xs font-black uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                        >
                          View Package
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('booking', `package=${encodeURIComponent(pkg.title)}`)}
                          className="px-4 py-2 bg-[#0B3B8C] hover:bg-opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer"
                        >
                          Book Package
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — TANZANIA SAFARIS */}
      <section id="safaris-section" className="py-24 px-4 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Wild Wilderness Expeditions</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Tanzania Mainland Safaris</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Experience majestic close encounters with elephants, lions, leopards, rhinos, and wild buffaloes across iconic reserves.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-5 rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {safariPackages.map((s, idx) => (
              <AnimatedSection key={s.id}>
                <div className="group bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-[420px]">
                  <div className="relative h-44 overflow-hidden bg-slate-100 w-full">
                    <ProgressiveImage src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white text-xs font-black px-2.5 py-1 rounded-full border border-white/10">
                      from ${s.price}
                    </span>
                  </div>

                  <div className="p-4.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{s.parks}</span>
                        <span className="text-[#0B3B8C] text-[10px] font-black uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-100/50">{s.duration}</span>
                      </div>
                      <h3 className="font-extrabold text-sm text-[#0B3B8C] group-hover:text-[#D4A017] transition-colors leading-snug mb-2 line-clamp-2">{s.title}</h3>
                    </div>

                    <div className="pt-3 border-t border-slate-150 flex items-center justify-between">
                      {/* Big Five Indicators */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wide">Big Five Circuit</span>
                        {s.bigFive ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-100">
                            ★ Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-slate-400 bg-slate-100 text-[8px] font-extrabold px-1.5 py-0.5 rounded">
                            Scenic
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('safaris')}
                        className="px-3 py-1.5 bg-[#0B3B8C] hover:bg-opacity-95 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                      >
                        Book Safari
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9 — KILIMANJARO */}
      <section id="kilimanjaro-section" className="py-24 px-4 bg-[#0A1224] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(212,160,23,0.05),transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Tackle Africa's Snowiest Summit</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Mount Kilimanjaro Treks</h2>
            <p className="text-slate-350 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Mount Kilimanjaro (5,895 meters) is the roof of Africa. Climb alongside seasoned local porter crews and expert alpine guides.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-5 rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {kiliRoutes.map((route, idx) => (
              <AnimatedSection key={idx}>
                <div className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-[#D4A017]/30 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-[450px]">
                  <div className="relative h-48 overflow-hidden bg-white/5">
                    <ProgressiveImage src={route.img} alt={route.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute top-4 right-4 bg-[#D4A017] text-[#0A1224] text-xs font-black px-3.5 py-1.5 rounded-full">
                      from ${route.price}
                    </span>
                    <span className="absolute bottom-3 left-4 text-xs font-bold bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg">
                      {route.duration}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-base text-white group-hover:text-[#D4A017] transition-colors">{route.name}</h3>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          {route.success} Success
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{route.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => navigate('kilimanjaro')}
                        className="text-xs font-extrabold uppercase tracking-wider text-[#D4A017] hover:text-white transition-colors cursor-pointer bg-transparent border-0 flex items-center gap-1"
                      >
                        Explore Routes <ChevronRight size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('booking', `package=${encodeURIComponent(route.name)}`)}
                        className="px-4 py-2 bg-[#D4A017] hover:bg-opacity-90 text-[#020C1F] text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer"
                      >
                        Book Trek
                      </button>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10 — AIRPORT TRANSFERS */}
      <section id="transfers-section" className="py-24 px-4 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Direct Luxury Pickups</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Zanzibar Transfers</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Book private airport taxis, ferry terminal connections, or cross-island resort transfers starting from just $20 with licensed local operators.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-5 rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {transfersList.map((tr, idx) => (
              <AnimatedSection key={idx}>
                <div className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#D4A017]/30 transition-all duration-300 flex flex-col justify-between h-72">
                  <div>
                    <div className="p-3 bg-[#0B3B8C]/5 group-hover:bg-[#0B3B8C]/10 rounded-xl text-[#0B3B8C] w-fit mb-4 transition-colors">
                      <tr.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-sm text-[#0B3B8C] group-hover:text-[#D4A017] transition-colors leading-tight mb-2">{tr.type}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{tr.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none">Fixed</span>
                      <span className="text-sm font-black text-[#0B3B8C] mt-0.5 block">${tr.price} USD</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('transfers')}
                      className="px-3.5 py-1.5 bg-[#0B3B8C] hover:bg-opacity-95 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                    >
                      Book Transfer
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11 — CUSTOMER REVIEWS */}
      <section id="reviews-section" className="py-24 px-4 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Verified Guest Feedback</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Customer Reviews</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              We focus on absolute service precision, certified guides, and punctuality, earning top ratings from hundreds of global holidaymakers.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-5 rounded-full" />
          </AnimatedSection>

          {/* Social Platforms Average Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 text-center flex flex-col justify-center items-center gap-2 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-black uppercase text-slate-450 tracking-wider">Google Reviews</span>
              <div className="flex items-center gap-1 my-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-[#D4A017]" fill="currentColor" />)}
              </div>
              <div className="text-2xl font-black text-[#0B3B8C]">4.9 / 5.0</div>
              <span className="text-[10px] font-bold text-slate-400">Based on 500+ verified customer logs</span>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 text-center flex flex-col justify-center items-center gap-2 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-black uppercase text-slate-450 tracking-wider">TripAdvisor Reviews</span>
              <div className="flex items-center gap-1 my-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-emerald-500" fill="currentColor" />)}
              </div>
              <div className="text-2xl font-black text-emerald-600">5.0 / 5.0</div>
              <span className="text-[10px] font-bold text-slate-400">Awarded Certificate of Excellence</span>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 text-center flex flex-col justify-center items-center gap-2 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-black uppercase text-slate-450 tracking-wider">Overall Trust Score</span>
              <div className="inline-flex items-center gap-1 text-[#D4A017] text-sm my-1">
                <ShieldCheck size={18} />
                <span className="font-black text-slate-800">100% Vetted</span>
              </div>
              <div className="text-2xl font-black text-[#0B3B8C]">98.7%</div>
              <span className="text-[10px] font-bold text-slate-400">Satisfaction rate across all excursions</span>
            </div>
          </div>

          {/* Render the core beautiful GuestReviews list inside our layout */}
          <GuestReviews navigate={navigate} />
        </div>
      </section>

      {/* SECTION 12 — VIDEO GALLERY */}
      <section id="video-gallery" className="py-24 px-4 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Immersive Video Stories</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Video Gallery</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Watch real, breathtaking footages of giant turtles, snorkeling reefs, deep safaris, and traditional Swahili island cruises.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-5 rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {videosList.map((v, idx) => {
              const ytId = extractYouTubeId(v.youtube);
              const embedUrl = ytId ? getYouTubeEmbedUrl(ytId) : v.youtube;

              return (
                <AnimatedSection key={idx}>
                  <button 
                    onClick={() => setActiveVideoModal({ title: v.title, embedUrl })}
                    className="group w-full text-left bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300 relative h-64 cursor-pointer"
                  >
                    <ProgressiveImage src={v.img} alt={v.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    
                    {/* Hover play animation */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 text-white">
                      <div className="w-10 h-10 bg-[#D4A017] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform self-end">
                        <Play size={16} fill="white" className="ml-0.5 text-white" />
                      </div>
                      <p className="text-xs font-extrabold tracking-tight text-white leading-snug drop-shadow-md">
                        {v.title}
                      </p>
                    </div>
                  </button>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* EMBEDDED YOUTUBE VIDEO STORY MODAL */}
      <AnimatePresence>
        {activeVideoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveVideoModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-[#0A1224] border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 bg-[#081835] border-b border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Play size={16} className="text-[#D4A017] fill-[#D4A017]" />
                  <span>{activeVideoModal.title}</span>
                </h3>
                <button 
                  onClick={() => setActiveVideoModal(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative aspect-video bg-black">
                <iframe 
                  src={`${activeVideoModal.embedUrl}?autoplay=1`}
                  title={activeVideoModal.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 13 — ABOUT THE FOUNDER */}
      <section id="founder-section" className="py-24 px-4 bg-[#F4E7D3]/80 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Biography */}
            <div className="order-2 md:order-1 space-y-6">
              <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest block">Meet the Pioneer</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B3B8C]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Gerevas Paulo Mtaki
              </h2>
              <div className="w-12 h-0.5 bg-[#D4A017]" />
              <p className="text-amber-800 text-xs font-black uppercase tracking-wider">Founder & Executive Director</p>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                Born and raised in Tanzania, I established Zanzibar Trip & Relax to guide global holidaymakers through the authentic wonders of my native homeland. Over a decade ago, I started custom tour planning to connect visitors to real local communities, licensed captain networks, and responsible wildlife safaris.
              </p>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                Our operations guarantee direct local pricing with zero hidden intermediary broker commissions. By coordinating our own fleet, registered driver-guides, and hand-selected ecologes, we focus on safe, unforgettable memories that positively empower local Zanzibari hosts.
              </p>
              <button
                type="button"
                onClick={() => navigate('about')}
                className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-[#0B3B8C] hover:text-[#D4A017] transition-all bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm cursor-pointer"
              >
                Learn More About Us <ChevronRight size={13} />
              </button>
            </div>

            {/* Portrait Frame */}
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <ProgressiveImage 
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="Gerevas Paulo Mtaki, Founder" 
                  className="w-56 h-56 sm:w-64 sm:h-64 mx-auto rounded-full object-cover shadow-2xl border-4 border-white aspect-square relative z-10" 
                />
                <div className="absolute -inset-2 bg-[#D4A017]/35 rounded-full blur-lg animate-pulse" />
              </div>
            </div>

          </AnimatedSection>
        </div>
      </section>

      {/* Optional: Authentic Swahili Lessons Widget */}
      <section className="py-24 px-4 bg-[#0B3B8C] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1224]/30 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-14">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Connect With the Locals</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Swahili Corner</h2>
            <p className="text-white/85 text-xs sm:text-sm font-semibold">Impress local fishermen, boat captains, and rangers with native greetings.</p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-4 rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {swahiliWords.map((item, idx) => (
              <AnimatedSection key={idx}>
                <div className="bg-white/10 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/15 transition-all select-none">
                  <div className="text-[#D4A017] font-black text-base mb-1" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>{item.word}</div>
                  <div className="text-white font-extrabold text-xs mb-1 leading-tight">{item.meaning}</div>
                  <div className="text-white/50 text-[9px] font-mono">/{item.pronunciation}/</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 14 — TRAVEL GUIDES */}
      <section id="travel-guides" className="py-24 px-4 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-[#D4A017] text-xs md:text-sm font-bold uppercase tracking-widest mb-2 block">Swahili Travel Journal</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0B3B8C] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Travel Guides</h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
              Read expert recommendations, packing tips, visa requirements, and weather patterns from on-the-ground safari planners.
            </p>
            <div className="w-16 h-1 bg-[#D4A017] mx-auto mt-5 rounded-full" />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {travelArticles.map(post => (
              <AnimatedSection key={post.id}>
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-[420px]">
                  <div 
                    className="relative h-48 overflow-hidden cursor-pointer group"
                    onClick={() => navigate('blog-detail', String(post.id))}
                  >
                    <ProgressiveImage src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute top-4 left-4 bg-[#D4A017] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full z-10 shadow-sm">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold mb-2">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {post.date}</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
                      </div>
                      <h3 
                        onClick={() => navigate('blog-detail', String(post.id))}
                        className="text-base font-bold text-[#0B3B8C] hover:text-[#D4A017] transition-colors cursor-pointer leading-snug line-clamp-2"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mt-2">{post.excerpt}</p>
                    </div>

                    <button 
                      onClick={() => navigate('blog-detail', String(post.id))}
                      className="text-xs font-extrabold uppercase tracking-wider text-[#0B3B8C] hover:text-[#D4A017] transition-all flex items-center gap-1 cursor-pointer bg-transparent border-0 self-start mt-4"
                    >
                      Read Article <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Render beautiful newsletter below blog */}
      <Newsletter variant="card" />

      {/* SECTION 15 — FINAL CALL TO ACTION */}
      <section id="cta-adventure" className="py-24 px-4 bg-gradient-to-br from-[#0B3B8C] to-[#0A1224] relative overflow-hidden text-center text-white border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,160,23,0.06),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <AnimatedSection className="space-y-6">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Let's Plan Your Dream Trip
            </h2>
            <p className="text-white/85 text-xs sm:text-sm md:text-base lg:text-lg max-w-xl mx-auto leading-relaxed font-medium">
              Tell us where you want to go, your travel dates, and your budget. Our travel specialists will create the perfect itinerary.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 max-w-md sm:max-w-lg mx-auto">
              <button 
                type="button" 
                onClick={() => navigate('booking')} 
                className="w-full sm:w-auto bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-black px-8 py-4.5 rounded-full text-xs uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.98] duration-200 cursor-pointer shadow-lg hover:shadow-xl text-center border-0"
                aria-label="Directly plan your custom vacation trip"
              >
                Plan My Trip
              </button>
              
              <a 
                href="https://wa.me/255629506063" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => trackWhatsAppClick('Home Bottom Section', 'General Chat')}
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebd5a] text-white font-black px-8 py-4.5 rounded-full text-xs uppercase tracking-wider transition-all hover:scale-[1.03] active:scale-[0.98] duration-200 flex items-center justify-center gap-2"
                aria-label="Chat on WhatsApp with local holiday experts"
              >
                <MessageCircle size={16} fill="white" /> Chat on WhatsApp
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
}
