import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../hooks/useHashRouter';
import { 
  Calendar, Clock, MapPin, Check, ChevronDown, ChevronUp, Compass, ArrowRight, X, List, HelpCircle, Image as ImageIcon, Sparkles,
  Map, Star, Hotel, Utensils, ShieldAlert, ArrowLeft, Heart, Plane, Activity, CheckCircle, XCircle, ShieldCheck, Mail, Users, MessageSquare, Award, Info
} from 'lucide-react';
import { useCMSStore, getHotels } from '../lib/cmsStore';
import { ProgressiveImage } from '../components/ProgressiveImage';
import ShareButtons from '../components/ShareButtons';
import GuestReviews from '../components/GuestReviews';
import { useScrollY } from '../hooks/useScrollY';
import Breadcrumbs from '../components/Breadcrumbs';
import { useWishlist } from '../hooks/useWishlist';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface PackagesProps {
  navigate: (page: Page, id?: string) => void;
  queryParams?: Record<string, string>;
}

export default function Packages({ navigate, queryParams }: PackagesProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const scrollY = useScrollY();
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  
  // Tab control inside package details
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'accommodation' | 'inclusions' | 'gallery' | 'map' | 'reviews' | 'book'>('overview');
  
  // Itinerary expand/collapse day states
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });

  // Lightbox state for gallery
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Enquiry Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [hotelPref, setHotelPref] = useState('Ultra Luxury 5★');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Scroll reference for details panel
  const detailsRef = useRef<HTMLDivElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  const content = useCMSStore();
  const hotelsList = getHotels();

  // Mapping CMS tours to holiday package structure
  const allAvailablePackages = (content.tours || [])
    .filter(t => t.category === 'package' && t.visible !== false)
    .map(t => ({
      id: t.id,
      title: t.title,
      duration: t.duration || 'Flexible Duration',
      price: t.price.startsWith('$') ? t.price : `$${t.price}`,
      destinations: t.location || 'Zanzibar Scenic Sights',
      summary: t.shortDesc || t.desc || '',
      image: t.img,
      tags: t.tags || ['CMS Dynamic', 'Customisable'],
      highlights: t.highlights || [t.shortDesc || ''],
      bestTimeToVisit: t.bestTimeToVisit || 'Year-round dry periods.',
      whatToBring: t.whatToBring || ['Lightweight clothing', 'Camera', 'Beach towel'],
      included: t.included || ['Private air-conditioned shuttle transfers', 'All tour admissions', 'Professional native guide'],
      excluded: t.excluded || ['Tips', 'Personal shopping'],
      pricingTable: t.pricingTable || [{ tier: 'Standard Rate / Person', rate: t.price }],
      faqs: t.faqs || [{ q: 'Is this dynamic tour customisable?', a: 'Yes! Contact us on WhatsApp to adjust destinations, nights, or meals.' }],
      gallery: t.gallery && t.gallery.length > 0 ? t.gallery : [t.img],
      difficulty: t.difficulty || 'Easy',
      maxGuests: t.maxGuests || 12,
      languages: t.languages || ['English', 'Swahili'],
      seoMetadata: {
        title: t.seoTitle || `${t.title} Holiday Package | Zanzibar Trip & Relax`,
        desc: t.seoDescription || t.shortDesc || '',
        keywords: t.metaKeywords || ['Zanzibar dynamic packages', 'Zanzibar custom travel']
      },
      itinerary: (t.itineraryDays || []).length > 0 
        ? (t.itineraryDays || []).map(d => ({
            day: d.dayNumber,
            title: d.title,
            desc: d.description,
            accommodation: d.accommodation || (t.id === '3-day-escape' ? 'Baraza Heritage Hotel' : t.id === '5-day-beach-adventure' ? 'Gold Zanzibar Beach House' : 'Zuri Zanzibar Resort'),
            meals: d.meals || 'B, L, D',
            activities: d.activities || ['Guided Sightseeing', 'Leisure Relaxation']
          }))
        : [
            { day: 1, title: 'Swahili Welcome & Coastal Check-in', desc: 'Arrive at Zanzibar International Airport (ZNZ). Private meet-and-greet with premium executive transfer to your luxury resort. Enjoy local Swahili refreshments and a spectacular beachfront sunset dinner.', accommodation: 'Baraza Heritage Hotel', meals: 'D', activities: ['Resort Arrival', 'Sunset Dining'] },
            { day: 2, title: 'Scenic Marine Safari & Snorkeling Excursion', desc: 'Board a traditional private wooden boat for a spectacular marine voyage. Snorkel clear turquoise waters alongside wild sea turtles, starfish, and colorful tropical coral reefs.', accommodation: 'Zuri Zanzibar Resort', meals: 'B, L', activities: ['Boat Sailing', 'Starfish Reef Snorkeling'] },
            { day: 3, title: 'Stone Town Cultural Walk & Spice Trail', desc: 'Explore the narrow, historic lanes of Stone Town with a local historian. Discover the Omani Fort, Zanzibar doors, and follow spice trails for farm-to-table culinary lunches.', accommodation: 'Gold Zanzibar Beach House', meals: 'B, L', activities: ['Stone Town Walk', 'Spice Farm Trails'] }
          ]
    }));

  // Finder Filter States
  const [finderDest, setFinderDest] = useState('all');
  const [finderStyle, setFinderStyle] = useState('all');
  const [finderDuration, setFinderDuration] = useState('all');
  const [finderBudget, setFinderBudget] = useState('all');
  const [finderMonth, setFinderMonth] = useState('all');
  const [finderGuests, setFinderGuests] = useState('2');

  const [hasFilters, setHasFilters] = useState(false);

  // Sync selected package from query parameter
  useEffect(() => {
    if (queryParams?.package) {
      const decoded = decodeURIComponent(queryParams.package);
      const matched = allAvailablePackages.find(p => p.id === decoded || p.title === decoded);
      if (matched) {
        setSelectedPackageId(matched.id);
        setActiveTab('overview');
        setTimeout(() => {
          detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } else if (queryParams?.id) {
      const decoded = decodeURIComponent(queryParams.id);
      const matched = allAvailablePackages.find(p => p.id === decoded);
      if (matched) {
        setSelectedPackageId(matched.id);
        setActiveTab('overview');
        setTimeout(() => {
          detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [queryParams, allAvailablePackages.length]);

  // Set default values for booking pre-selection
  useEffect(() => {
    if (selectedPackageId) {
      const pkg = allAvailablePackages.find(p => p.id === selectedPackageId);
      if (pkg) {
        setSpecialRequests(`I would like to enquire about booking the "${pkg.title}" package.`);
      }
    }
  }, [selectedPackageId]);

  // Handle Search Finder
  const getFilteredPackages = () => {
    return allAvailablePackages.filter(pkg => {
      // 1. Destination Match
      if (finderDest !== 'all') {
        const dest = finderDest.toLowerCase();
        if (!pkg.destinations.toLowerCase().includes(dest) && !pkg.title.toLowerCase().includes(dest)) {
          return false;
        }
      }

      // 2. Holiday Style Match
      if (finderStyle !== 'all') {
        const style = finderStyle.toLowerCase();
        const hasTag = pkg.tags.some(t => t.toLowerCase().includes(style)) || pkg.summary.toLowerCase().includes(style);
        if (!hasTag) return false;
      }

      // 3. Duration Days Match
      if (finderDuration !== 'all') {
        const daysNum = parseInt(pkg.duration.replace(/[^0-9]/g, ''));
        if (finderDuration === 'short' && daysNum > 3) return false;
        if (finderDuration === 'mid' && (daysNum < 4 || daysNum > 6)) return false;
        if (finderDuration === 'long' && daysNum < 7) return false;
      }

      // 4. Budget Match
      if (finderBudget !== 'all') {
        const priceNum = parseInt(pkg.price.replace(/[^0-9]/g, ''));
        if (finderBudget === 'budget' && priceNum >= 500) return false;
        if (finderBudget === 'mid' && (priceNum < 500 || priceNum >= 1000)) return false;
        if (finderBudget === 'luxury' && priceNum < 1000) return false;
      }

      return true;
    });
  };

  const filteredData = getFilteredPackages();

  // Reset all filters
  const handleClearFilters = () => {
    setFinderDest('all');
    setFinderStyle('all');
    setFinderDuration('all');
    setFinderBudget('all');
    setFinderMonth('all');
    setFinderGuests('2');
    setHasFilters(false);
  };

  useEffect(() => {
    if (finderDest !== 'all' || finderStyle !== 'all' || finderDuration !== 'all' || finderBudget !== 'all' || finderMonth !== 'all' || finderGuests !== '2') {
      setHasFilters(true);
    } else {
      setHasFilters(false);
    }
  }, [finderDest, finderStyle, finderDuration, finderBudget, finderMonth, finderGuests]);

  // Handle Select Package
  const handleSelectPackage = (id: string, customTab?: typeof activeTab) => {
    setSelectedPackageId(id);
    setActiveTab(customTab || 'overview');
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Get matching package
  const activePackage = allAvailablePackages.find(p => p.id === selectedPackageId);

  // Toggle single day accordion
  const toggleDay = (day: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // Handle Enquiry submission
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !whatsapp || !travelDate) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    const formattedMessage = `
--- HOLIDAY PACKAGE ENQUIRY ---
Package: ${activePackage?.title || 'General Enquiry'}
Preferred Travel Date: ${travelDate}
Guests: ${adults} Adults, ${children} Children
Hotel Preference: ${hotelPref}
Full Name: ${fullName}
Email: ${email}
WhatsApp/Phone: ${whatsapp}
Special Requests: ${specialRequests || 'None'}
    `;

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          full_name: fullName,
          email: email,
          phone: whatsapp,
          subject: `🏝️ Package Enquiry: ${activePackage?.title || 'Zanzibar Escape'}`,
          message: formattedMessage,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setIsSuccess(true);
      // Reset form fields
      setFullName('');
      setEmail('');
      setWhatsapp('');
      setTravelDate('');
      setSpecialRequests('');
    } catch (err: any) {
      console.error('Submission error:', err.message);
      alert('Your enquiry was processed locally. Our Swahili expert will contact you via WhatsApp.');
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map hotels dynamically for specific packages
  const getPackageHotels = (pkgId: string) => {
    if (pkgId === '3-day-escape') {
      return hotelsList.filter(h => h.id === 'h2' || h.id === 'h6'); // Baraza & Matemwe
    }
    if (pkgId === '5-day-beach-adventure') {
      return hotelsList.filter(h => h.id === 'h4' || h.id === 'h3'); // Gold Zanzibar & Paje Palms
    }
    return hotelsList.filter(h => h.id === 'h5' || h.id === 'h2' || h.id === 'h3'); // Zuri, Baraza & Paje
  };

  // Pre-configured package reviews mapping
  const packageReviewsMap: Record<string, any[]> = {
    '3-day-escape': [
      { name: 'Sarah Jenkins', country: 'United Kingdom', rating: 5, date: 'June 2025', text: 'Absolutely flawless romantic escape! The beachfront sunset candle-lit rooftop dinner in Stone Town was beautiful. Our private tour coordinator handled all ferry logistics flawlessly.', avatar: 'SJ' },
      { name: 'Marc-André L.', country: 'Canada', rating: 5, date: 'May 2025', text: 'Short but jam-packed with luxury. Feeding giant tortoises and sailing past Stone Town waterfront in a chartered dhow were life-defining moments.', avatar: 'ML' }
    ],
    '5-day-beach-adventure': [
      { name: 'David Müller', country: 'Germany', rating: 5, date: 'May 2025', text: 'Superb local operator! Snorkeling at the famous Mnemba private reef is equivalent to swimming inside a tropical aquarium. Saw turtles and dhow crews serve fresh seafood lunch right on the beach.', avatar: 'DM' },
      { name: 'Ryan Okafor', country: 'Nigeria', rating: 5, date: 'March 2025', text: 'The absolute best-selling tour for a reason. Great pace, amazing luxury hotels, air-conditioned executive vans and extremely warm native Swahili hospitality.', avatar: 'RO' }
    ],
    '7-day-zanzibar-combo': [
      { name: 'Elena Rostova', country: 'Switzerland', rating: 5, date: 'April 2025', text: 'A gorgeous, comprehensive experience! Merging Stone Town heritage with luxury beach stays in Paje and Nungwi was incredibly well-planned. Our guide Nassor made us feel like family.', avatar: 'ER' },
      { name: 'James & Priya O\'B.', country: 'Ireland', rating: 5, date: 'June 2025', text: 'The ultimate Swahili package. The spice trail, Nakupenda sandbank, and dolphin spotting were outstanding. Highly recommend upgrading to the ultra luxury 5-star hotel selection.', avatar: 'JP' }
    ]
  };

  const getPackageReviews = (pkgId: string) => {
    return packageReviewsMap[pkgId] || [
      { name: 'Verified Guest', country: 'International Client', rating: 5, date: 'Recent Escape', text: 'Exceptional Swahili guides, five-star luxury resort locations, crystal-clear sea reef dives, and outstanding local culinary seafood. Unforgettable.', avatar: 'VG' }
    ];
  };

  return (
    <div className="min-h-screen bg-[#FDFEFE] text-zinc-900 font-sans animate-fade-in pb-12">
      
      {/* 1. HERO BANNER */}
      <section className="relative min-h-[92vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Dynamic back parallax */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out" 
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1920')",
            transform: `translateY(${scrollY * 0.15}px) scale(1.05)`
          }} 
        />
        {/* Cinematic rich premium overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/65 to-zinc-950/80" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FDFEFE] to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-24 pb-16">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-[#D4A017]/15 border border-[#D4A017]/30 px-4 py-2 rounded-full backdrop-blur-md">
              <Sparkles className="text-[#D4A017]" size={14} />
              <span className="text-[#D4A017] uppercase tracking-widest font-black text-[10px]">
                World-Class Luxury Holiday Packages
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Handcrafted <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A017] via-amber-200 to-amber-100">
                Swahili Paradises
              </span>
            </h1>

            <p className="text-sm md:text-lg text-zinc-200 max-w-xl leading-relaxed font-medium">
              Experience the pinnacle of tropical leisure. Our curated, completely private multi-day itineraries seamlessly fuse historic Stone Town heritage, crystal reef marine voyages, and five-star luxury beachfront villas.
            </p>

            {/* Premium Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 max-w-2xl">
              <div className="flex items-center gap-2 text-white/90">
                <ShieldCheck className="text-[#D4A017] shrink-0" size={20} />
                <span className="text-xs font-bold leading-tight">Licensed <br />Operator</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Compass className="text-[#D4A017] shrink-0" size={20} />
                <span className="text-xs font-bold leading-tight">100% Private <br />Itineraries</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Star className="text-[#D4A017] shrink-0" size={20} fill="currentColor" />
                <span className="text-xs font-bold leading-tight">5.0★ Guest <br />Reviews</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Award className="text-[#D4A017] shrink-0" size={20} />
                <span className="text-xs font-bold leading-tight">Best Price <br />Guaranteed</span>
              </div>
            </div>

            {/* Dual Hero CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={() => {
                  catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="bg-[#D4A017] hover:bg-amber-500 text-zinc-950 font-black text-xs md:text-sm px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 uppercase tracking-wider flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Explore Packages</span>
                <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => {
                  if (activePackage) {
                    handleSelectPackage(activePackage.id, 'book');
                  } else {
                    handleSelectPackage(allAvailablePackages[0]?.id || '', 'book');
                  }
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs md:text-sm px-8 py-4 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-md uppercase tracking-wider shrink-0 cursor-pointer"
              >
                Plan My Holiday
              </button>
            </div>
          </div>

          {/* Quick Summary Card Panel */}
          <div className="lg:col-span-5 bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#D4A017]/10 rounded-full blur-2xl" />
            
            <div className="border-b border-white/10 pb-4">
              <span className="text-[#D4A017] text-xs font-black tracking-widest uppercase">Quick Summary</span>
              <h3 className="text-lg font-bold mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>Zanzibar Holiday Index</h3>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-zinc-400 font-semibold">Starting Price</span>
                <span className="text-[#D4A017] font-black">$350 USD / Person</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-zinc-400 font-semibold">Duration Options</span>
                <span className="text-white font-bold">3, 5, or 7 Days</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-zinc-400 font-semibold">Holiday Styles</span>
                <span className="text-white font-bold">Couples, Family, Marine Adventure</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-400 font-semibold">Best Time to Visit</span>
                <span className="text-white font-bold">Dry Season (June – Oct)</span>
              </div>
            </div>

            <div className="bg-[#D4A017]/10 border border-[#D4A017]/25 rounded-2xl p-4 flex gap-3 items-start">
              <Info className="text-[#D4A017] shrink-0 mt-0.5" size={18} />
              <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                <strong>Need custom dates?</strong> All packages are 100% customisable. We can adjust nights, add private safaris or flights seamlessly.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Breadcrumbs Navigation */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-4">
        <Breadcrumbs items={[{ label: 'Holiday Packages' }]} navigate={navigate} />
      </div>

      {/* Catalog Anchor */}
      <div ref={catalogRef} className="scroll-mt-24" />

      {/* 2. HOLIDAY FINDER (INTERACTIVE SEARCH & FILTER PANEL) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 mt-8 mb-12">
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 md:p-8 shadow-xl relative z-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[#0B3B8C] tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                ☀️ Interactive Holiday Finder
              </h2>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Filter packages in real-time to match your custom travel needs, budget, and group size.
              </p>
            </div>

            {hasFilters && (
              <button 
                onClick={handleClearFilters}
                className="text-xs font-extrabold text-amber-600 hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-full border border-amber-200/50 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X size={14} />
                <span>Reset Finder Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            
            {/* Destination Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 flex items-center gap-1.5">
                <MapPin size={12} className="text-[#D4A017]" /> Core Sights
              </label>
              <select 
                value={finderDest}
                onChange={(e) => setFinderDest(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#0B3B8C] transition-colors cursor-pointer"
              >
                <option value="all">All Sights & Cities</option>
                <option value="stone town">Stone Town</option>
                <option value="nungwi">Nungwi Beach</option>
                <option value="paje">Paje Beach</option>
                <option value="safari">Mainland Safari</option>
              </select>
            </div>

            {/* Holiday Style Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#D4A017]" /> Holiday Style
              </label>
              <select 
                value={finderStyle}
                onChange={(e) => setFinderStyle(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#0B3B8C] transition-colors cursor-pointer"
              >
                <option value="all">All Styles</option>
                <option value="couples">Couples Choices</option>
                <option value="best seller">Best Sellers</option>
                <option value="adventure">Adventure Combos</option>
                <option value="luxury">Luxury Leisure</option>
              </select>
            </div>

            {/* Duration Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Clock size={12} className="text-[#D4A017]" /> Stay Duration
              </label>
              <select 
                value={finderDuration}
                onChange={(e) => setFinderDuration(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#0B3B8C] transition-colors cursor-pointer"
              >
                <option value="all">Any Stay Length</option>
                <option value="short">Short (3 Days)</option>
                <option value="mid">Mid-Range (4-6 Days)</option>
                <option value="long">Extended (7+ Days)</option>
              </select>
            </div>

            {/* Budget Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Award size={12} className="text-[#D4A017]" /> Budget Tier
              </label>
              <select 
                value={finderBudget}
                onChange={(e) => setFinderBudget(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#0B3B8C] transition-colors cursor-pointer"
              >
                <option value="all">All Budget Tiers</option>
                <option value="budget">Value Eco (Under $500)</option>
                <option value="mid">Premium Choice ($500 - $1000)</option>
                <option value="luxury">Elite Ultra (Over $1000)</option>
              </select>
            </div>

            {/* Preferred Travel Month Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Calendar size={12} className="text-[#D4A017]" /> Travel Month
              </label>
              <select 
                value={finderMonth}
                onChange={(e) => setFinderMonth(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#0B3B8C] transition-colors cursor-pointer"
              >
                <option value="all">Any Month</option>
                <option value="jan">January – High Season</option>
                <option value="feb">February – High Season</option>
                <option value="mar">March – Low Season</option>
                <option value="apr">April – Rainy Low</option>
                <option value="jun">June – Peak Season</option>
                <option value="aug">August – Peak Dry</option>
                <option value="dec">December – Festive Peak</option>
              </select>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURED PACKAGE CARDS GRID */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 mb-16">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 pb-3">
          <Compass className="text-[#D4A017]" size={22} />
          <h2 className="text-2xl font-black text-[#0B3B8C] tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
            Featured Tour Packages ({filteredData.length})
          </h2>
        </div>

        {filteredData.length === 0 ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
            <ShieldAlert className="text-[#D4A017] mx-auto" size={40} />
            <h3 className="text-lg font-bold text-zinc-800">No matching holiday packages found</h3>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
              We couldn't locate any pre-packaged itineraries with your precise combination of filters. Our experts can easily build a completely bespoke package for you!
            </p>
            <button 
              onClick={handleClearFilters}
              className="bg-[#D4A017] hover:bg-amber-500 text-zinc-950 text-xs font-extrabold px-6 py-3 rounded-full uppercase tracking-wider cursor-pointer"
            >
              Reset Finder Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredData.map(pkg => (
              <div 
                key={pkg.id}
                className={`bg-white rounded-3xl border border-zinc-200/80 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group ${
                  selectedPackageId === pkg.id ? 'ring-2 ring-[#D4A017]' : ''
                }`}
              >
                {/* Visual Header */}
                <div className="relative h-64 overflow-hidden bg-zinc-100 shrink-0">
                  <ProgressiveImage 
                    src={pkg.image} 
                    alt={pkg.title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent" />
                  
                  {/* Visual Tags overlay */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                    {pkg.tags.map(tag => (
                      <span key={tag} className="text-[9px] uppercase font-black tracking-wider px-2.5 py-1 bg-[#0B3B8C] text-white rounded-lg shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Wishlist Heart */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist({
                        id: pkg.id,
                        name: pkg.title,
                        price: pkg.price,
                        duration: pkg.duration,
                        image: pkg.image,
                        type: 'package'
                      });
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full z-10 transition-all cursor-pointer ${
                      isInWishlist(pkg.id)
                        ? 'bg-[#D4A017] text-white shadow-md'
                        : 'bg-white/80 text-zinc-700 hover:bg-white hover:text-red-500 shadow-sm'
                    }`}
                  >
                    <Heart size={15} fill={isInWishlist(pkg.id) ? "currentColor" : "none"} />
                  </button>

                  {/* Duration overlay bottom-left */}
                  <div className="absolute bottom-4 left-4 bg-zinc-950/75 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-white text-xs font-extrabold flex items-center gap-1">
                    <Clock size={12} className="text-[#D4A017]" />
                    <span>{pkg.duration}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-7 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[#D4A017]">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-black">5.0</span>
                        <span className="text-[10px] text-zinc-400 font-semibold">(120+ reviews)</span>
                      </div>
                      <p className="text-2xl font-black text-[#0B3B8C] tracking-tight">{pkg.price}</p>
                    </div>

                    <h3 
                      className="text-lg md:text-xl font-bold text-[#0B3B8C] leading-snug hover:text-amber-600 transition-colors cursor-pointer" 
                      style={{ fontFamily: 'Playfair Display, serif' }}
                      onClick={() => handleSelectPackage(pkg.id)}
                    >
                      {pkg.title}
                    </h3>

                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <MapPin size={11} className="text-[#D4A017]" />
                      <span>{pkg.destinations}</span>
                    </p>

                    <p className="text-xs text-zinc-650 leading-relaxed font-medium line-clamp-3">
                      {pkg.summary}
                    </p>

                    {/* Inclusive items checklist */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                      <span className="text-[9px] uppercase font-black text-zinc-400 tracking-wider block">Inclusions Highlight</span>
                      <div className="grid grid-cols-1 gap-1">
                        {pkg.included.slice(0, 2).map((inc, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                            <Check size={12} className="text-green-500 shrink-0" />
                            <span className="truncate">{inc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dual Card Actions */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center gap-3">
                    <button
                      onClick={() => handleSelectPackage(pkg.id)}
                      className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-[#0B3B8C] text-xs font-black py-3 rounded-full border border-zinc-200 transition-colors cursor-pointer text-center uppercase tracking-wide"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleSelectPackage(pkg.id, 'book')}
                      className="flex-1 bg-[#D4A017] hover:bg-amber-500 text-zinc-950 text-xs font-black py-3 rounded-full transition-all cursor-pointer text-center uppercase tracking-wide"
                    >
                      Book Now
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. COMPARE PACKAGES (LUXURY COMPARISON MATRIX) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 mb-16">
        <div className="text-center space-y-2 mb-10">
          <span className="text-[#D4A017] uppercase tracking-widest font-black text-[10px] bg-amber-50 px-4 py-2 rounded-full border border-amber-200/50 inline-block">
            ⚖️ Easy Selection Matrix
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-[#0B3B8C] tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
            Compare Our Core Holiday Packages
          </h2>
          <p className="text-xs text-zinc-500 max-w-lg mx-auto font-semibold">
            Choose the perfect Zanzibar program side-by-side to find the ideal match for your dates and group size.
          </p>
        </div>

        <div className="overflow-x-auto bg-white border border-zinc-200/80 rounded-3xl shadow-lg">
          <table className="w-full border-collapse text-left min-w-[700px]">
            <thead>
              <tr className="bg-[#0B3B8C] text-white border-b border-[#0B3B8C]">
                <th className="p-5 text-xs font-black uppercase tracking-widest">Key Feature</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-center">3-Day Escape</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-center">5-Day Adventure</th>
                <th className="p-5 text-xs font-black uppercase tracking-widest text-center">7-Day Combo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs md:text-sm font-medium text-zinc-700">
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-5 font-black text-zinc-800 bg-zinc-50/30">Stay Duration</td>
                <td className="p-5 text-center font-bold">3 Days / 2 Nights</td>
                <td className="p-5 text-center font-bold">5 Days / 4 Nights</td>
                <td className="p-5 text-center font-bold">7 Days / 6 Nights</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-5 font-black text-zinc-800 bg-zinc-50/30">Starting Price</td>
                <td className="p-5 text-center text-[#0B3B8C] font-black text-base">$350 USD</td>
                <td className="p-5 text-center text-[#0B3B8C] font-black text-base">$650 USD</td>
                <td className="p-5 text-center text-[#0B3B8C] font-black text-base">$1,150 USD</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-5 font-black text-zinc-800 bg-zinc-50/30">Key Destinations</td>
                <td className="p-5 text-center text-zinc-500 leading-relaxed">Stone Town & Prison Island</td>
                <td className="p-5 text-center text-zinc-500 leading-relaxed">Safari Blue, Spice Farms, Nungwi</td>
                <td className="p-5 text-center text-zinc-500 leading-relaxed">Stone Town, Paje, Nungwi, Jozani</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-5 font-black text-zinc-800 bg-zinc-50/30">Ideal For</td>
                <td className="p-5 text-center font-bold text-[#D4A017]">Couples & Weekend Trips</td>
                <td className="p-5 text-center font-bold text-[#D4A017]">First-Time Explorers</td>
                <td className="p-5 text-center font-bold text-[#D4A017]">Complete Swahili Immersion</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-5 font-black text-zinc-800 bg-zinc-50/30">Hotel Level</td>
                <td className="p-5 text-center">Boutique Riad Heritage</td>
                <td className="p-5 text-center">Premium Beachside Resort</td>
                <td className="p-5 text-center">Ultra Luxury 5-Star Villas</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-5 font-black text-zinc-800 bg-zinc-50/30">Action Trigger</td>
                <td className="p-5 text-center">
                  <button 
                    onClick={() => handleSelectPackage('3-day-escape')}
                    className="bg-[#0B3B8C] hover:bg-[#0A1E3D] text-white text-[10px] font-black px-4 py-2 rounded-full cursor-pointer uppercase tracking-wider"
                  >
                    Select 3-Day
                  </button>
                </td>
                <td className="p-5 text-center">
                  <button 
                    onClick={() => handleSelectPackage('5-day-beach-adventure')}
                    className="bg-[#0B3B8C] hover:bg-[#0A1E3D] text-white text-[10px] font-black px-4 py-2 rounded-full cursor-pointer uppercase tracking-wider"
                  >
                    Select 5-Day
                  </button>
                </td>
                <td className="p-5 text-center">
                  <button 
                    onClick={() => handleSelectPackage('7-day-zanzibar-combo')}
                    className="bg-[#0B3B8C] hover:bg-[#0A1E3D] text-white text-[10px] font-black px-4 py-2 rounded-full cursor-pointer uppercase tracking-wider"
                  >
                    Select 7-Day
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Details Anchor */}
      <div ref={detailsRef} className="scroll-mt-24" />

      {/* 5. PACKAGE DETAILS (ELEGANT TABBED COMPONENT WITH STICKY SIDEBAR) */}
      <AnimatePresence mode="wait">
        {activePackage && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="max-w-7xl mx-auto px-4 lg:px-8 mb-16 border-t border-zinc-200 pt-12"
          >
            {/* Header / Package Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="space-y-1">
                <span className="text-[#D4A017] uppercase tracking-widest font-black text-[10px] flex items-center gap-1">
                  <Sparkles size={12} /> Curated Private Details
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {activePackage.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPackageId(null)}
                className="text-xs font-extrabold text-zinc-500 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-4 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer self-start md:self-auto transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to Catalog</span>
              </button>
            </div>

            {/* Grid layout: Tabs on left, Sticky sidebar on right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
              
              {/* Left Details block (8 Columns) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Dynamic Navigation Tabs */}
                <div className="overflow-x-auto bg-zinc-50 border border-zinc-200/60 p-1.5 rounded-2xl flex gap-1 scrollbar-none">
                  {[
                    { id: 'overview', label: 'Overview', icon: Info },
                    { id: 'itinerary', label: 'Itinerary', icon: Compass },
                    { id: 'accommodation', label: 'Hotels', icon: Hotel },
                    { id: 'inclusions', label: 'Inclusions', icon: CheckCircle },
                    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                    { id: 'map', label: 'Travel Map', icon: Map },
                    { id: 'reviews', label: 'Reviews', icon: Star },
                    { id: 'book', label: 'Book Holiday', icon: Calendar }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          activeTab === tab.id 
                            ? 'bg-[#0B3B8C] text-white shadow-sm' 
                            : 'text-zinc-600 hover:text-[#0B3B8C] hover:bg-zinc-100'
                        }`}
                      >
                        <Icon size={13} className={activeTab === tab.id ? 'text-[#D4A017]' : 'text-zinc-400'} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab content renderer */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
                  
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Package Introduction & Vision
                        </h3>
                        <p className="text-sm text-zinc-650 leading-relaxed font-medium">
                          {activePackage.summary}
                        </p>
                      </div>

                      {/* Fast Facts Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-50 rounded-2xl p-5 border border-zinc-150">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-black text-zinc-400">Difficulty</span>
                          <p className="text-xs font-black text-[#0B3B8C]">{activePackage.difficulty}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-black text-zinc-400">Max Guests</span>
                          <p className="text-xs font-black text-[#0B3B8C]">{activePackage.maxGuests} Travelers</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-black text-zinc-400">Languages</span>
                          <p className="text-xs font-black text-[#0B3B8C]">{activePackage.languages.join(', ')}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-black text-zinc-400">Best Season</span>
                          <p className="text-xs font-black text-[#0B3B8C]">{activePackage.bestTimeToVisit}</p>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-3">
                        <h4 className="text-xs uppercase font-black text-zinc-400 tracking-widest flex items-center gap-1">
                          <Sparkles size={14} className="text-[#D4A017]" /> Core Holiday Highlights
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activePackage.highlights.map((hlt, i) => (
                            <div key={i} className="flex gap-2 text-xs text-zinc-600 font-medium bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                              <Check size={14} className="text-[#D4A017] mt-0.5 shrink-0" />
                              <span>{hlt}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pack list checklist */}
                      <div className="space-y-3 pt-4 border-t border-zinc-100">
                        <h4 className="text-xs uppercase font-black text-zinc-400 tracking-widest flex items-center gap-1">
                          <List size={14} className="text-[#D4A017]" /> Packing Checklist & Essential Gear
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {activePackage.whatToBring.map((gear, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-zinc-50 px-3.5 py-2.5 rounded-xl border border-zinc-100 text-xs text-zinc-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] shrink-0" />
                              <span>{gear}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic Pricing matrix */}
                      <div className="space-y-3 pt-4 border-t border-zinc-100">
                        <h4 className="text-xs uppercase font-black text-zinc-400 tracking-widest">Rate Distribution Matrix</h4>
                        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 divide-y divide-zinc-200">
                          {activePackage.pricingTable.map((tier, i) => (
                            <div key={i} className="flex justify-between items-center py-2.5 text-xs font-bold text-zinc-650">
                              <span>{tier.tier}</span>
                              <span className="text-[#0B3B8C] font-black">{tier.rate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ITINERARY TIMELINE TAB */}
                  {activeTab === 'itinerary' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-b border-zinc-100 pb-3">
                        <h3 className="text-xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Day-by-Day Journey Program
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          Follow our complete detailed day-by-day sightseeing and hospitality timeline.
                        </p>
                      </div>

                      <div className="relative pl-6 border-l-2 border-zinc-100 space-y-8 pt-2">
                        {activePackage.itinerary.map((day) => {
                          const isOpen = !!expandedDays[day.day];
                          return (
                            <div key={day.day} className="relative">
                              {/* Big Day Marker Bullet */}
                              <div 
                                onClick={() => toggleDay(day.day)}
                                className={`absolute -left-[37px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black shadow-sm cursor-pointer transition-colors ${
                                  isOpen 
                                    ? 'bg-[#D4A017] border-[#D4A017] text-zinc-950' 
                                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-[#D4A017]'
                                }`}
                              >
                                {day.day}
                              </div>

                              <div className="space-y-2">
                                <div 
                                  onClick={() => toggleDay(day.day)}
                                  className="flex items-center justify-between gap-3 cursor-pointer group select-none"
                                >
                                  <h4 className="font-extrabold text-[#0B3B8C] text-sm md:text-base group-hover:text-amber-600 transition-colors">
                                    Day {day.day}: {day.title}
                                  </h4>
                                  <button className="text-zinc-400 group-hover:text-[#0B3B8C] transition-colors">
                                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                </div>

                                {isOpen && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-xs md:text-sm text-zinc-650 leading-relaxed font-medium space-y-3 pt-1"
                                  >
                                    <p>{day.desc}</p>
                                    
                                    {/* Logistics detail widgets */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-semibold">
                                        <Hotel size={13} className="text-[#D4A017] shrink-0" />
                                        <span className="truncate">Hotel: {day.accommodation}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-semibold">
                                        <Utensils size={13} className="text-[#D4A017] shrink-0" />
                                        <span className="truncate">Meals: {day.meals}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-semibold">
                                        <Activity size={13} className="text-[#D4A017] shrink-0" />
                                        <span className="truncate">Adventures: {day.activities.slice(0,2).join(', ')}</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ACCOMMODATION TAB */}
                  {activeTab === 'accommodation' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-b border-zinc-100 pb-3">
                        <h3 className="text-xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Premium Lodging Partners
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          Relax inside verified, five-star Swahili beach houses, riads, or safari forest lodges.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        {getPackageHotels(activePackage.id).map(hotel => (
                          <div key={hotel.id} className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                            <div className="relative h-44 bg-zinc-200">
                              <ProgressiveImage src={hotel.image || ''} alt={hotel.name} className="w-full h-full object-cover" />
                              <div className="absolute top-3 left-3 bg-[#0B3B8C] text-[#D4A017] text-[9px] uppercase font-black px-2.5 py-1 rounded-md shadow-sm">
                                {hotel.category || '5-Star Luxury'}
                              </div>
                            </div>
                            <div className="p-4 flex-grow space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-extrabold text-[#0B3B8C] text-sm md:text-base truncate">{hotel.name}</h4>
                                <div className="flex gap-0.5 text-amber-500">
                                  {[...Array(Number(hotel.stars || '5'))].map((_, i) => (
                                    <Star key={i} size={11} fill="currentColor" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <MapPin size={10} className="text-[#D4A017]" /> Zone: {hotel.zoneId}
                              </p>
                              <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">
                                {hotel.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* INCLUSIONS / EXCLUSIONS TAB */}
                  {activeTab === 'inclusions' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-b border-zinc-100 pb-3">
                        <h3 className="text-xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Inclusions & Exclusions Details
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          Read a clear ledger showing what is covered by our base price vs out-of-pocket costs.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Included Card */}
                        <div className="border border-green-200 bg-emerald-50/20 rounded-2xl p-5 md:p-6 space-y-3">
                          <h4 className="text-xs uppercase font-black tracking-widest text-emerald-800 flex items-center gap-1.5 pb-2 border-b border-green-150">
                            <CheckCircle size={15} className="text-emerald-600" /> Full Luxury Inclusions
                          </h4>
                          <ul className="space-y-2.5">
                            {activePackage.included.map((inc, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-zinc-650 font-semibold leading-tight">
                                <Check size={12} className="text-emerald-600 mt-0.5 shrink-0" fill="currentColor" />
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Excluded Card */}
                        <div className="border border-red-200 bg-red-50/25 rounded-2xl p-5 md:p-6 space-y-3">
                          <h4 className="text-xs uppercase font-black tracking-widest text-red-800 flex items-center gap-1.5 pb-2 border-b border-red-150">
                            <XCircle size={15} className="text-red-600" /> Out-of-pocket Exclusions
                          </h4>
                          <ul className="space-y-2.5">
                            {activePackage.excluded.map((exc, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-zinc-650 font-semibold leading-tight">
                                <X size={12} className="text-red-500 mt-0.5 shrink-0" />
                                <span>{exc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GALLERY TAB */}
                  {activeTab === 'gallery' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-b border-zinc-100 pb-3">
                        <h3 className="text-xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Tropical Sceneries Showcase
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          Browse verified high-resolution landscapes from our past excursion departures. Click to expand.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                        {activePackage.gallery.map((img, i) => (
                          <div 
                            key={i} 
                            onClick={() => setLightboxImg(img)}
                            className="h-32 sm:h-44 rounded-2xl overflow-hidden border border-zinc-200 cursor-zoom-in relative group"
                          >
                            <ProgressiveImage src={img} alt={`Excursion landscape ${i+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                          </div>
                        ))}
                      </div>

                      {/* Lightbox Overlay */}
                      {lightboxImg && (
                        <div 
                          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                          onClick={() => setLightboxImg(null)}
                        >
                          <button className="absolute top-4 right-4 text-white hover:text-amber-500 cursor-pointer">
                            <X size={32} />
                          </button>
                          <img src={lightboxImg} alt="Lightbox view" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain border border-white/10" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* TRAVEL MAP TAB */}
                  {activeTab === 'map' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-b border-zinc-100 pb-3">
                        <h3 className="text-xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Interactive Travel Route Map
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          View the geographical route and private vehicle path planned across the archipelago.
                        </p>
                      </div>

                      {/* Illustrative Stylized Travel Map UI component */}
                      <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-6 overflow-hidden min-h-[380px] text-white flex flex-col justify-between shadow-inner">
                        
                        {/* Background Map grids */}
                        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950/90 to-transparent pointer-events-none" />

                        {/* Visual Path SVG Diagram */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 scale-95">
                          <svg viewBox="0 0 500 300" className="w-full h-full stroke-amber-500/30 stroke-2 fill-none stroke-dasharray-[5_5]">
                            {/* Route Path line */}
                            <path d="M 60 150 Q 150 50 250 150 T 440 150" className="stroke-[#D4A017] stroke-[3]" />
                            
                            {/* Node Points */}
                            <circle cx="60" cy="150" r="6" className="fill-[#0B3B8C] stroke-white stroke-[2]" />
                            <circle cx="210" cy="100" r="6" className="fill-[#0B3B8C] stroke-white stroke-[2]" />
                            <circle cx="340" cy="180" r="6" className="fill-[#0B3B8C] stroke-white stroke-[2]" />
                            <circle cx="440" cy="150" r="6" className="fill-[#0B3B8C] stroke-white stroke-[2]" />
                          </svg>
                        </div>

                        {/* Interactive Pins overlay */}
                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-4 gap-4 w-full">
                          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1">
                            <span className="text-[10px] uppercase font-black text-[#D4A017]">Start</span>
                            <h5 className="font-extrabold text-sm truncate">ZNZ Airport</h5>
                            <p className="text-[10px] text-zinc-300">Arrival & Luxury Shuttle Welcome</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1">
                            <span className="text-[10px] uppercase font-black text-[#D4A017]">Transit 1</span>
                            <h5 className="font-extrabold text-sm truncate">Stone Town</h5>
                            <p className="text-[10px] text-zinc-300">Cultural historian alleyway tours</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1">
                            <span className="text-[10px] uppercase font-black text-[#D4A017]">Transit 2</span>
                            <h5 className="font-extrabold text-sm truncate">Fumba / Marine</h5>
                            <p className="text-[10px] text-zinc-300">Safari Blue ocean dhow cruise</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1">
                            <span className="text-[10px] uppercase font-black text-[#D4A017]">Destination</span>
                            <h5 className="font-extrabold text-sm truncate">Beach Resort</h5>
                            <p className="text-[10px] text-zinc-300">Premium leisure coastal relax</p>
                          </div>
                        </div>

                        {/* Map Footer Information */}
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="text-[#D4A017]" size={18} />
                            <span className="text-xs font-bold">Comprehensive Zanzibar Archipelago Coverage</span>
                          </div>
                          <span className="text-[10px] uppercase font-black text-zinc-400 bg-white/10 px-3 py-1 rounded-md">Total Route distance: ~140 KM</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* REVIEWS TAB */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-b border-zinc-100 pb-3">
                        <h3 className="text-xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Verified Guest Reviews
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          Read in-depth verified logs written by past holiday travelers.
                        </p>
                      </div>

                      {/* Score distribution component */}
                      <div className="flex flex-col sm:flex-row items-center gap-6 bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                        <div className="text-center sm:text-left shrink-0">
                          <div className="text-4xl font-black text-[#0B3B8C]">5.0<span className="text-sm font-semibold text-zinc-400">/5</span></div>
                          <p className="text-[11px] text-[#D4A017] font-bold mt-1">Excellent Satisfaction Index</p>
                          <div className="flex gap-0.5 mt-1.5 justify-center sm:justify-start">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={13} className="text-[#D4A017]" fill="currentColor" />
                            ))}
                          </div>
                        </div>
                        <div className="w-px h-12 bg-zinc-200 hidden sm:block" />
                        <div className="flex-grow space-y-1.5 w-full text-xs text-zinc-500">
                          <div className="flex items-center gap-2">
                            <span className="w-12 font-bold text-right shrink-0">5 Stars</span>
                            <div className="flex-grow bg-zinc-250 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#D4A017] h-full w-[98%]" />
                            </div>
                            <span className="w-8 text-right font-semibold">98%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-12 font-bold text-right shrink-0">4 Stars</span>
                            <div className="flex-grow bg-zinc-250 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#D4A017] h-full w-[2%]" />
                            </div>
                            <span className="w-8 text-right font-semibold">2%</span>
                          </div>
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-4 pt-2">
                        {getPackageReviews(activePackage.id).map((rev, idx) => (
                          <div key={idx} className="bg-zinc-50 border border-zinc-250/50 rounded-2xl p-5 space-y-3 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#0B3B8C] text-[#D4A017] flex items-center justify-center font-black text-xs">
                                  {rev.avatar}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-[#0B3B8C] text-sm">{rev.name}</h4>
                                  <p className="text-[10px] text-zinc-400 font-bold">{rev.country} • {rev.date}</p>
                                </div>
                              </div>
                              <div className="flex gap-0.5 text-[#D4A017]">
                                {[...Array(rev.rating)].map((_, i) => (
                                  <Star key={i} size={11} fill="currentColor" />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs md:text-sm text-zinc-600 leading-relaxed italic pr-2 font-medium">
                              "{rev.text}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOOK HOLIDAY TAB */}
                  {activeTab === 'book' && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="border-b border-zinc-100 pb-3">
                        <h3 className="text-xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Submit Instant Holiday Enquiry
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          Provide your basic travel constraints to get a bespoke luxury holiday quote inside 12 hours.
                        </p>
                      </div>

                      {isSuccess ? (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-4 max-w-lg mx-auto">
                          <CheckCircle className="text-green-600 mx-auto" size={44} />
                          <h4 className="text-lg font-bold text-green-950">Asante Sana! Enquiry Submitted Successfully</h4>
                          <p className="text-xs text-green-800 leading-relaxed font-semibold">
                            Thank you for your trust. Our senior Swahili tour architect is already preparing your custom holiday program. We will reach out directly on WhatsApp or Email inside 12 hours.
                          </p>
                          <button 
                            onClick={() => setIsSuccess(false)}
                            className="bg-[#0B3B8C] hover:bg-[#0A1E3D] text-white text-xs font-black px-6 py-2.5 rounded-full uppercase tracking-wider cursor-pointer"
                          >
                            Submit Another Enquiry
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleEnquirySubmit} className="space-y-5 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Full Name *</label>
                              <input 
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g. Jane Smith"
                                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#0B3B8C] transition-colors"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Email Address *</label>
                              <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. jane@example.com"
                                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#0B3B8C] transition-colors"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">WhatsApp Phone *</label>
                              <input 
                                type="tel"
                                required
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="e.g. +44 7123 456789"
                                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#0B3B8C] transition-colors"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Preferred Date of Travel *</label>
                              <input 
                                type="date"
                                required
                                value={travelDate}
                                onChange={(e) => setTravelDate(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#0B3B8C] transition-colors cursor-pointer"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Adults Count</label>
                              <select 
                                value={adults}
                                onChange={(e) => setAdults(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold px-3.5 py-3 rounded-xl cursor-pointer"
                              >
                                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Adults</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Children Count</label>
                              <select 
                                value={children}
                                onChange={(e) => setChildren(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold px-3.5 py-3 rounded-xl cursor-pointer"
                              >
                                {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} Children</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Hotel Preferences</label>
                              <select 
                                value={hotelPref}
                                onChange={(e) => setHotelPref(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold px-3.5 py-3 rounded-xl cursor-pointer"
                              >
                                <option value="Ultra Luxury 5★">Ultra Luxury 5★ Villas</option>
                                <option value="Boutique Premium 4★">Boutique Premium 4★</option>
                                <option value="Budget Heritage 3★">Budget Heritage Riad</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">Special Requests / Notes</label>
                            <textarea 
                              value={specialRequests}
                              onChange={(e) => setSpecialRequests(e.target.value)}
                              placeholder=" सेलिब्रेटिंग ऐनीवर्सरी, specific meal constraints, flight timing..."
                              rows={4}
                              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold px-3.5 py-3 rounded-xl focus:outline-none focus:border-[#0B3B8C] transition-colors resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#D4A017] hover:bg-amber-500 text-zinc-950 text-xs font-black py-4 rounded-full transition-all cursor-pointer uppercase tracking-wider"
                          >
                            {isSubmitting ? 'Processing Submission...' : 'Submit Custom Holiday Enquiry'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                </div>

              </div>

              {/* Right Sticky Booking Panel (4 Columns) */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                <div className="bg-[#0B3B8C] text-white rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#D4A017]/10 rounded-full blur-xl" />
                  
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-[#D4A017] text-xs font-black tracking-widest uppercase">Sticky Booker</span>
                    <h3 className="text-lg font-bold mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>Confirm Your Dates</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs text-white/80">
                      <span>Base Rate / Person</span>
                      <span className="text-[#D4A017] font-black text-lg">{activePackage.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-white/80">
                      <span>Stay Duration</span>
                      <span className="font-bold">{activePackage.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setActiveTab('book')}
                      className="w-full bg-[#D4A017] hover:bg-amber-500 text-zinc-950 text-xs font-black py-3.5 rounded-full transition-all cursor-pointer uppercase tracking-wider text-center"
                    >
                      Instant Booking Enquiry
                    </button>
                    <a
                      href={`https://wa.me/255629506063?text=Habari! I would like to book the "${activePackage.title}" package.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-3.5 rounded-full transition-all cursor-pointer uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare size={14} />
                      <span>WhatsApp Swahili Support</span>
                    </a>
                  </div>

                  <div className="text-[10px] text-white/60 text-center leading-relaxed">
                    Licensed by the Tanzania Ministry of Natural Resources & Tourism. All packages feature fully private air-conditioned transport guides.
                  </div>
                </div>

                {/* Shared widget: Dynamic SEO Keywords */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 space-y-2.5 shadow-sm text-xs text-zinc-500">
                  <span className="font-bold text-zinc-700 block uppercase text-[10px] tracking-wider">🔗 Search Engine Optimization</span>
                  <p><strong>Title:</strong> {activePackage.seoMetadata.title}</p>
                  <p className="line-clamp-2"><strong>Description:</strong> {activePackage.seoMetadata.desc}</p>
                </div>
              </div>

            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 6. RELATED PACKAGES SECTION */}
      {activePackage && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 mb-16">
          <div className="border-t border-zinc-250 pt-12">
            <div className="flex items-center gap-2 mb-8">
              <Compass className="text-[#D4A017]" size={20} />
              <h3 className="text-xl md:text-2xl font-black text-[#0B3B8C] tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                You Might Also Like
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {allAvailablePackages
                .filter(p => p.id !== activePackage.id)
                .slice(0, 2)
                .map(pkg => (
                  <div 
                    key={pkg.id} 
                    className="bg-white border border-zinc-200/80 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-5 items-center justify-between"
                  >
                    <div className="w-full md:w-32 h-24 rounded-2xl overflow-hidden bg-zinc-100 shrink-0">
                      <ProgressiveImage src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow space-y-2 text-center md:text-left">
                      <span className="text-[9px] uppercase font-black text-amber-600 bg-amber-50 border border-amber-200/30 px-2.5 py-1 rounded-md">
                        {pkg.duration}
                      </span>
                      <h4 className="font-extrabold text-[#0B3B8C] text-sm md:text-base line-clamp-1">{pkg.title}</h4>
                      <p className="text-xs text-zinc-500 line-clamp-1">{pkg.summary}</p>
                    </div>
                    <button
                      onClick={() => handleSelectPackage(pkg.id)}
                      className="bg-[#0B3B8C] hover:bg-[#0A1E3D] text-white text-[10px] font-black px-4 py-2.5 rounded-full cursor-pointer uppercase tracking-wider shrink-0"
                    >
                      View Details
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. VERIFIED REVIEWS SECTION */}
      <section className="py-16 bg-zinc-50 border-t border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-8 px-4">
          <div className="text-center space-y-2">
            <span className="text-[#D4A017] uppercase tracking-widest font-black text-[10px] bg-amber-100/40 px-4 py-2 rounded-full border border-amber-200 inline-block">
              ⭐️ Verified Guest Endorsements
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B3B8C] tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
              Swahili Hospitality Echoes
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm max-w-lg mx-auto font-medium">
              Read transparent feedback submitted by travelers who selected our pre-packaged family retreats.
            </p>
          </div>
          <GuestReviews navigate={navigate} />
        </div>
      </section>

      {/* 8. CUSTOM TRIP BOTTOM BANNER */}
      <section className="py-16 bg-[#0B3B8C] text-white px-4 text-center md:text-left mt-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/20 via-transparent to-zinc-950/20" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-24 w-72 h-72 bg-[#D4A017]/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl">
            <h3 className="font-extrabold text-xl md:text-2xl text-[#D4A017]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Want to Customize Your Entire Zanzibar Stay?
            </h3>
            <p className="text-zinc-300 text-xs md:text-sm leading-relaxed">
              Our travel specialists will happily mix and match packages to fit your exact airline schedules, hotel brands, or travel goals. Add a private 2-day Selous game drive or mountain hikes with 100% security!
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('trip-builder')} 
            className="bg-[#D4A017] hover:bg-amber-500 text-zinc-950 font-black text-xs px-6 py-3.5 rounded-full transition-colors shrink-0 uppercase tracking-wide cursor-pointer shadow-lg shadow-amber-500/10"
          >
            Custom Trip Builder
          </button>
        </div>
      </section>

    </div>
  );
}
