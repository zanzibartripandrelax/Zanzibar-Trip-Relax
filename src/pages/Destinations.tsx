import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Search, MapPin, Sparkles, ArrowRight, BookOpen, 
  AlertCircle, Eye, Info, Calendar, Anchor, Thermometer, 
  Cloud, Sun, Wind, CloudRain, ChevronRight, HelpCircle, 
  Hotel, Layers, Clock, Globe, ShieldCheck, Tag, Phone,
  Mail, MessageSquare, DollarSign, Check, Star, ThumbsUp,
  Camera, Video, Play, Send, User, ChevronDown, Award,
  ShieldAlert, Briefcase, Heart
} from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { ProgressiveImage } from '../components/ProgressiveImage';
import InteractiveTanzaniaMap from '../components/InteractiveTanzaniaMap';
import { 
  getSiteContent, getHotels, 
  Destination, ActivityItem, TourItem 
} from '../lib/cmsStore';
import { getBlogPostsFromStorage } from './BlogDetail';
import { supabase } from '../lib/supabase';
import { syncLeadToCRM } from '../lib/crm';
import { showToast } from '../components/ToastNotification';
import { useAnalytics } from '../context/AnalyticsContext';

const REGIONS_METADATA = [
  {
    id: 'northern',
    name: 'Northern Tanzania',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    description: 'The iconic safari capital of East Africa. Experience the endless plains of the Serengeti, the breathtaking caldera of Ngorongoro Crater, and stand in the shadow of Mount Kilimanjaro, the Roof of Africa.',
    destCount: 7,
    tagline: 'Classic Safaris & Rooftop Peaks',
    tag: 'Wildlife & Adventure'
  },
  {
    id: 'southern',
    name: 'Southern Tanzania',
    image: 'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'A wild, untouched frontier for the true adventurer. Discover the vast plains of Nyerere (Selous), the giant lion prides of Ruaha, and the breathtaking water channels of Mikumi.',
    destCount: 3,
    tagline: 'Untamed Wilderness & Boat Safaris',
    tag: 'Raw & Exclusive'
  },
  {
    id: 'zanzibar',
    name: 'Zanzibar Archipelago',
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'The ancient clove-scented Swahili coast. Relax on the powdery white-sand beaches of Unguja, dive the pristine walls of Pemba, and swim with gentle whale sharks in Mafia Island.',
    destCount: 3,
    tagline: 'Swahili Culture & Turquoise Shores',
    tag: 'Beach & Culture'
  }
];

interface DestinationsProps {
  navigate: (page: Page, id?: string) => void;
}

export default function Destinations({ navigate }: DestinationsProps) {
  const { trackInquirySend, trackWhatsAppClick } = useAnalytics();
  // Global site content
  const [siteContent, setSiteContent] = useState(getSiteContent());
  const [destinations, setDestinations] = useState<Destination[]>(siteContent.destinations || []);
  const [activities, setActivities] = useState<ActivityItem[]>(siteContent.activities || []);
  const [tours, setTours] = useState<TourItem[]>(siteContent.tours || []);
  const [hotels, setHotels] = useState(getHotels());
  const [blogs, setBlogs] = useState<any[]>([]);

  // Search & Filter state for Directory view
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<'all' | 'northern' | 'southern' | 'western' | 'zanzibar'>('all');

  // Parse current selected region ID from URL Hash reactively
  const [currentRegionId, setCurrentRegionId] = useState<string | null>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('destinations/region/')) {
      return hash.split('/')[2];
    }
    return null;
  });

  // Parse current selected destination ID from URL Hash reactively
  const [currentDestId, setCurrentDestId] = useState<string | null>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('destinations/') && !hash.startsWith('destinations/region/')) {
      return hash.split('/')[1];
    }
    return null;
  });

  // Track active tab inside the dynamic Destination Landing Page
  const [landingTab, setLandingTab] = useState<'overview' | 'heritage' | 'nature' | 'logistics'>('overview');
  // Track open FAQ indices
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // New Interactive states for Redesigned Destination page
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [galleryTab, setGalleryTab] = useState<'photos' | 'videos' | 'drone' | 'instagram'>('photos');
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    adults: '2',
    children: '0',
    budget: '$1,500 - $3,000',
    tier: 'Luxury',
    message: '',
    language: 'English'
  });
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  useEffect(() => {
    // Synchronize latest CMS state
    const content = getSiteContent();
    setSiteContent(content);
    setDestinations(content.destinations || []);
    setActivities(content.activities || []);
    setTours(content.tours || []);
    setHotels(getHotels());

    // Load blogs
    try {
      const blogData = getBlogPostsFromStorage();
      const blogList = Object.keys(blogData).map(key => ({
        id: key,
        title: blogData[key].title || key,
        ...blogData[key]
      }));
      setBlogs(blogList);
    } catch (e) {
      console.warn("Failed to load blogs on Destinations page", e);
    }

    // Reactive Hash Listening
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('destinations/region/')) {
        setCurrentRegionId(hash.split('/')[2]);
        setCurrentDestId(null);
      } else if (hash.startsWith('destinations/')) {
        setCurrentDestId(hash.split('/')[1]);
        setCurrentRegionId(null);
      } else {
        setCurrentDestId(null);
        setCurrentRegionId(null);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Filtered list of destinations for directory
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      // Check if visible
      if (dest.visible === false) return false;

      const matchesSearch =
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dest.highlights && dest.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesRegion = activeRegion === 'all' || dest.region === activeRegion;
      return matchesSearch && matchesRegion;
    });
  }, [destinations, searchQuery, activeRegion]);

  const currentRegion = useMemo(() => {
    if (!currentRegionId) return null;
    return REGIONS_METADATA.find(r => r.id === currentRegionId);
  }, [currentRegionId]);

  // Retrieve current active destination details for landing page
  const currentDest = useMemo(() => {
    if (!currentDestId) return null;
    return destinations.find(d => d.id === currentDestId);
  }, [destinations, currentDestId]);

  // Related lists for current landing page
  const relatedTours = useMemo(() => {
    if (!currentDest) return [];
    return tours.filter(t => t.destinationIds && t.destinationIds.includes(currentDest.id));
  }, [tours, currentDest]);

  const relatedActivities = useMemo(() => {
    if (!currentDest) return [];
    return activities.filter(a => a.destinationIds && a.destinationIds.includes(currentDest.id));
  }, [activities, currentDest]);

  const relatedHotels = useMemo(() => {
    if (!currentDest) return [];
    return hotels.filter(h => h.destinationId === currentDest.id);
  }, [hotels, currentDest]);

  const relatedBlogs = useMemo(() => {
    if (!currentDest) return [];
    return blogs.filter(b => b.destinationIds && b.destinationIds.includes(currentDest.id));
  }, [blogs, currentDest]);

  // Weather Icon Matcher
  const renderWeatherIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'cloud': return <Cloud className="w-5 h-5 text-sky-400" />;
      case 'cloud-rain': return <CloudRain className="w-5 h-5 text-blue-400 animate-pulse" />;
      case 'wind': return <Wind className="w-5 h-5 text-teal-400" />;
      case 'thermometer': return <Thermometer className="w-5 h-5 text-amber-500" />;
      case 'sun':
      default:
        return <Sun className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '20s' }} />;
    }
  };

  // Handle custom booking enquiry submission and redirect to WhatsApp
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySubmitted(true);

    const totalGuests = parseInt(enquiryForm.adults || '1') + parseInt(enquiryForm.children || '0');
    const reference = `ZTR-DST-${Date.now().toString().slice(-6)}`;
    const productSelection = currentDest?.name ? `${currentDest.name} Custom Itinerary` : 'Custom Destination Plan';

    // 1. Insert into contact_submissions (Inquiries)
    try {
      await supabase.from('contact_submissions').insert([
        {
          name: enquiryForm.name.trim(),
          email: enquiryForm.email.trim() || null,
          whatsapp_number: enquiryForm.phone.trim(),
          subject: `Destination Inquiry: ${currentDest?.name || 'Tanzania'}`,
          message: `Date: ${enquiryForm.date || 'TBD'}\nAdults: ${enquiryForm.adults}\nChildren: ${enquiryForm.children}\nBudget Bracket: ${enquiryForm.budget}\nLuxury Tier: ${enquiryForm.tier}\nLanguage: ${enquiryForm.language}\nSpecial Request: ${enquiryForm.message || 'None'}`
        }
      ]);
    } catch (err) {
      console.warn('Supabase contact submission failed:', err);
    }

    // 2. Insert into bookings table (Bookings) to sync to CRM booking registries
    try {
      const bookingPayload = {
        id: reference,
        full_name: enquiryForm.name.trim(),
        email: enquiryForm.email.trim(),
        whatsapp_number: enquiryForm.phone.trim(),
        number_of_guests: totalGuests,
        tour_name: productSelection,
        preferred_date: enquiryForm.date || new Date().toISOString().split('T')[0],
        pickup_location: 'To Be Arranged (Destination Inquiry)',
        status: 'pending',
        message: enquiryForm.message || 'None specified.',
        created_at: new Date().toISOString(),
        payment_choice: 'later',
        total_price: '$0 (Tailored Quote)',
        deposit_amount: 0,
        balance_remaining: 0,
        special_requests: enquiryForm.message || 'None specified.'
      };

      await supabase.from('bookings').insert([
        {
          reference_code: reference,
          customer_name: enquiryForm.name.trim(),
          customer_email: enquiryForm.email.trim(),
          customer_phone: enquiryForm.phone.trim(),
          product_name: productSelection,
          product_category: 'custom',
          travel_date: enquiryForm.date || new Date().toISOString().split('T')[0],
          guest_count: totalGuests,
          pickup_location: 'To Be Arranged',
          status: 'pending',
          details: bookingPayload
        }
      ]);

      // Safe local backup sync so it populates immediately in the browser session's admin view
      const existingBackup = JSON.parse(localStorage.getItem('ztr_local_bookings_backup') || '[]');
      localStorage.setItem('ztr_local_bookings_backup', JSON.stringify([bookingPayload, ...existingBackup]));

      const currentList = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
      localStorage.setItem('ztr_bookings', JSON.stringify([bookingPayload, ...currentList]));
    } catch (err) {
      console.warn('Supabase bookings insert failed:', err);
    }

    // 3. Sync Lead to central CRM
    try {
      syncLeadToCRM({
        source: 'contact_form',
        fullName: enquiryForm.name.trim(),
        email: enquiryForm.email.trim() || null,
        whatsappNumber: enquiryForm.phone.trim(),
        subject: `Destination Discovery: ${currentDest?.name || 'Tanzania'}`,
        message: `Date: ${enquiryForm.date || 'TBD'} | Adults: ${enquiryForm.adults} | Children: ${enquiryForm.children} | Budget: ${enquiryForm.budget} | Tier: ${enquiryForm.tier} | Language: ${enquiryForm.language}\nNotes: ${enquiryForm.message || 'None'}`
      });
    } catch (err) {
      console.warn('Lead CRM sync failed:', err);
    }

    // 4. Dispatch GA4 event for tracking
    try {
      trackInquirySend('destination_form', enquiryForm.name.trim(), {
        destination: currentDest?.name || 'Tanzania',
        budget: enquiryForm.budget,
        guests: totalGuests
      });
    } catch (err) {
      console.warn('Analytics event tracking skipped:', err);
    }

    showToast('Your custom booking enquiry has been saved to our database & synced with CRM.', 'success');

    // 5. Build and launch WhatsApp message
    const whatsappNum = siteContent.contact?.whatsapp?.replace(/\s+/g, '') || '255629506063';
    const text = `Hi Zanzibar Trip & Relax! I am interested in a customized trip to *${currentDest?.name}*.

*My Travel Details:*
- *Preferred Date:* ${enquiryForm.date || 'TBD'}
- *Adults:* ${enquiryForm.adults} | *Children:* ${enquiryForm.children}
- *Budget Bracket:* ${enquiryForm.budget}
- *Luxury Tier Style:* ${enquiryForm.tier}
- *Preferred Language:* ${enquiryForm.language}
- *Special Request:* ${enquiryForm.message || 'None specified.'}

*My Contact Details:*
- *Name:* ${enquiryForm.name}
- *Email:* ${enquiryForm.email}
- *WhatsApp/Phone:* ${enquiryForm.phone}

Looking forward to discussing my vacation blueprint!`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Popular circuits data matching Swahili destinations
  const popularCircuits = [
    {
      title: 'Northern Circuit Safari',
      desc: 'The gold standard of African safaris. Includes Serengeti, Ngorongoro Crater, Tarangire, and Lake Manyara. Unparalleled Big Five density.',
      regions: ['Serengeti', 'Ngorongoro', 'Tarangire', 'Lake Manyara'],
      color: 'border-amber-500/20 bg-amber-500/5'
    },
    {
      title: 'Southern Circuit Safari',
      desc: 'Remote, wild, and exclusive. Trek Udzungwa Mountains, experience river-boat safaris in Nyerere, or lion action in Ruaha with zero crowds.',
      regions: ['Nyerere', 'Ruaha', 'Mikumi', 'Udzungwa'],
      color: 'border-emerald-500/20 bg-emerald-500/5'
    },
    {
      title: 'Zanzibar Beach Holidays',
      desc: 'Relax on powder-soft beaches, explore coral networks in Pemba, or swim alongside massive whale sharks in Mafia Island.',
      regions: ['Unguja', 'Pemba', 'Mafia'],
      color: 'border-sky-500/20 bg-sky-500/5'
    }
  ];

  return (
    <div className="bg-[#020C1F] min-h-screen text-white font-sans selection:bg-[#D4A017] selection:text-white pb-16">

      {/* ========================================================
          1. SPECIFIC DESTINATION LANDING PAGE VIEW
          ======================================================== */}
      {currentDest ? (
        <div className="space-y-16 animate-fade-in">
          
          {/* ========================================================
              1. HERO SECTION (Visual Masterpiece)
             ======================================================== */}
          <div className="relative h-[85vh] min-h-[550px] w-full overflow-hidden flex items-end">
            <img 
              src={currentDest.image} 
              alt={currentDest.name} 
              className="absolute inset-0 w-full h-full object-cover transform scale-100 hover:scale-105 transition-transform duration-10000"
              referrerPolicy="no-referrer"
            />
            {/* Rich Luxury Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020C1F] via-[#020C1F]/45 to-black/30" />
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
            
            {/* Top Navigation & Breadcrumbs Bar */}
            <div className="absolute top-6 left-0 right-0 z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <button 
                  onClick={() => navigate('destinations')}
                  className="bg-black/45 hover:bg-[#D4A017] text-white hover:text-[#020C1F] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md border border-white/10 shadow-lg"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Explore All Atlas</span>
                </button>
                <div className="hidden md:flex items-center gap-2.5 text-[10px] text-slate-300 font-extrabold bg-black/45 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-lg uppercase tracking-wider">
                  <span>Home</span>
                  <ChevronRight size={10} className="text-slate-500" />
                  <span>Destinations</span>
                  <ChevronRight size={10} className="text-slate-500" />
                  <span className="text-[#D4A017]">{currentDest.name}</span>
                </div>
              </div>
            </div>

            {/* Bottom Content Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-8 space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/25 text-[#D4A017] text-[10px] font-black uppercase tracking-widest border border-[#D4A017]/45">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{currentDest.region} Circuit Hub</span>
                  </span>
                  {currentDest.name.toLowerCase().includes('zanzibar') || currentDest.name.toLowerCase().includes('stone') ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-500/30">
                      <Anchor className="w-3 h-3" /> UNESCO Marine Culture
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/30">
                      <Award className="w-3 h-3" /> Big Five Sanctuary
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-none uppercase font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {currentDest.name}
                </h1>
                
                <p className="text-slate-200 text-sm sm:text-base max-w-2xl leading-relaxed font-light italic">
                  "{currentDest.whyVisit || `Where turquoise waters, wild savanna plains, and authentic Swahili culture create life-changing memories.`}"
                </p>

                {/* Rating and review counter */}
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-0.5 text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={11} className="fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1.5 font-black text-white">4.9</span>
                  </div>
                  <a href="#guest-reviews" className="hover:text-[#D4A017] underline decoration-[#D4A017] transition-all font-bold">
                    148 Verified Guest Reviews
                  </a>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-300 font-medium">Starting from <strong className="text-[#D4A017] font-black">{relatedTours.length > 0 ? relatedTours[0].price : '$35'}</strong></span>
                </div>
              </div>

              {/* Fast Facts Badge Group */}
              <div className="lg:col-span-4 bg-black/65 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4 w-full shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    {renderWeatherIcon(currentDest.weatherIcon || 'sun')}
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">Avg Temperature</span>
                      <strong className="text-sm text-white font-black">{currentDest.weatherTemp || '28°C / 82°F'}</strong>
                    </div>
                  </div>
                  <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0" /> Real-time active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block">Best Visit Months</span>
                    <div className="flex items-center gap-1.5 text-white">
                      <Calendar className="w-4 h-4 text-[#D4A017] shrink-0" />
                      <strong className="text-xs truncate">{currentDest.bestTime || 'Year-round'}</strong>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block">Experience Tier</span>
                    <div className="flex items-center gap-1.5 text-white">
                      <Award className="w-4 h-4 text-[#D4A017] shrink-0" />
                      <strong className="text-xs truncate">Luxury Tailored</strong>
                    </div>
                  </div>
                </div>

                {/* Primary Actions Group */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <a 
                    href="#enquiry-desk"
                    className="col-span-2 bg-[#D4A017] hover:bg-white text-[#020C1F] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all shadow-lg hover:shadow-white/5 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Book Now</span>
                  </a>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Hi Zanzibar Trip & Relax! I want to plan a custom trip to *${currentDest.name}*. Please advise.`);
                      window.open(`https://wa.me/${siteContent.contact?.whatsapp?.replace(/\s+/g, '') || '255629506063'}?text=${text}`, '_blank');
                    }}
                    className="bg-[#25D366] hover:bg-emerald-600 text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1 shadow-lg"
                  >
                    <MessageSquare size={14} className="fill-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              2. DESTINATION OVERVIEW (Splendid Narrative & Culture)
             ======================================================== */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
                {/* Left Side: Large intro text */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">The Spirit of Tanzania</span>
                    <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight leading-tight uppercase">
                      Overview & Dynamic Geography
                    </h2>
                  </div>
                  <p className="text-slate-300 text-base leading-relaxed font-light whitespace-pre-wrap">
                    {currentDest.description}
                  </p>
                  
                  {currentDest.geography && (
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-6 space-y-2.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                        <Globe size={14} className="text-[#D4A017]" /> Terrains & Topography
                      </h4>
                      <p className="text-slate-300 text-sm leading-relaxed font-light">
                        {currentDest.geography}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side: Quick History, Culture & UNESCO badges */}
                <div className="lg:col-span-5 space-y-6">
                  {currentDest.history && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A017] block">Historical Background</span>
                      <p className="text-slate-300 text-xs leading-relaxed font-light whitespace-pre-wrap">
                        {currentDest.history}
                      </p>
                    </div>
                  )}

                  {currentDest.culture && (
                    <div className="pt-5 border-t border-white/5 space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A017] block">Local Communities & Culture</span>
                      <p className="text-slate-300 text-xs leading-relaxed font-light">
                        {currentDest.culture}
                      </p>
                    </div>
                  )}

                  {/* Dynamic UNESCO World Heritage Site notice banner */}
                  {(currentDest.name.toLowerCase().includes('stone town') || 
                    currentDest.name.toLowerCase().includes('serengeti') || 
                    currentDest.name.toLowerCase().includes('kilimanjaro') || 
                    currentDest.name.toLowerCase().includes('ngorongoro')) && (
                    <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-2xl p-5 flex gap-4 items-start shadow-lg">
                      <Award className="w-10 h-10 text-[#D4A017] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="text-xs text-white uppercase font-black tracking-widest block">UNESCO World Heritage Status</strong>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-light">
                          This destination is officially inscribed by UNESCO for outstanding universal value. Our guiding program strictly supports environmental and structural conservation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              3. QUICK FACTS GRID (Attractive Cards)
             ======================================================== */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-center space-y-2 pb-8">
              <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Essential Traveler Logistics</span>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white uppercase">Destination Quick Facts</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: '📍 Location', val: `${currentDest.region} Circuit` },
                { label: '🌡 Climate', val: currentDest.weatherTemp || 'Equatorial/Tropical' },
                { label: '💵 Currency', val: 'USD & Tanzanian Shilling' },
                { label: '🗣 Languages', val: 'Swahili & English widely' },
                { label: '✈ Nearest Airport', val: currentDest.region === 'zanzibar' ? 'Abeid Amani (ZNZ)' : 'Kilimanjaro Int (JRO)' },
                { label: '🛂 Visa Rules', val: 'On Arrival ($50 - $100)' },
                { label: '⏰ Time Zone', val: 'EAT (GMT+3)' },
                { label: '🚐 Transfer time', val: currentDest.region === 'zanzibar' ? '45-60 min' : '45 min Flight / 2hr Drive' },
                { label: '📶 Mobile Network', val: '4G LTE (Vodacom/Zantel)' },
                { label: '⚡ Electricity', val: '230V AC (Type G British)' }
              ].map((fact, fIdx) => (
                <div key={fIdx} className="bg-[#0A1224] border border-white/5 rounded-2xl p-5 hover:border-[#D4A017]/30 transition-all text-center space-y-1 hover:shadow-lg">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{fact.label}</span>
                  <strong className="text-xs text-white font-black block pt-1">{fact.val}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              4. WHY VISIT (Icon Section)
             ======================================================== */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-8 sm:p-10 space-y-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6">
                <div>
                  <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Curated Signature Perks</span>
                  <h3 className="text-2xl font-serif font-bold text-white uppercase">Why Choose {currentDest.name}?</h3>
                </div>
                <div className="hidden md:flex gap-1.5">
                  <span className="bg-[#D4A017]/10 text-[#D4A017] px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider">Premium Grade</span>
                  <span className="bg-sky-500/10 text-sky-400 px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider">Verified Itinerary</span>
                </div>
              </div>

              {/* 6 Luxury Why Visit Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Pristine Sand Beaches', desc: 'Powder-soft, brilliant white sands met by warm, crystal-clear turquoise lagoons of the Indian Ocean.', isZanzibar: true },
                  { title: 'Big Five Safari Wildlife', desc: 'Observe majestic lions, leopards, elephants, buffaloes, and rare black rhinos in their protected ancestral domains.', isZanzibar: false },
                  { title: 'The Great Migration Arena', desc: 'The absolute theater where millions of wildebeests and zebras engage in dry season river crossings.', isZanzibar: false },
                  { title: 'UNESCO Heritage Sites', desc: 'Explore historic Stone Town’s deep Swahili spice corridors and rich Arabic sultan architecture.', isZanzibar: true },
                  { title: 'Secluded Luxury Beach Resorts', desc: 'Stay at handpicked eco-conscious five-star properties with private plunges and premium Swahili seafood.', isZanzibar: true },
                  { title: 'Intimate Honeymoon Havens', desc: 'Unbelievable romantic sunset cruises, private sandbank dinners, and stargazing in wild luxurious suites.', isZanzibar: true }
                ].filter(p => currentDest.region === 'zanzibar' ? p.isZanzibar : !p.isZanzibar || p.title.includes('Romance')).map((pillar, pIdx) => (
                  <div key={pIdx} className="flex gap-4 p-4 rounded-2xl bg-slate-950/20 border border-white/5 hover:border-[#D4A017]/20 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/20 flex items-center justify-center text-[#D4A017] shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-white uppercase tracking-wider">{pillar.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-light">{pillar.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Highlights Bullets */}
              {currentDest.highlights && currentDest.highlights.length > 0 && (
                <div className="pt-6 border-t border-white/5 space-y-3">
                  <span className="text-[9px] text-[#D4A017] uppercase font-black tracking-widest block">Signature Experience Checklists</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentDest.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 font-medium">
                        <Check size={14} className="text-[#D4A017] mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              5. BEST TIME TO VISIT (Interactive Seasonal Matrix)
             ======================================================== */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-8 sm:p-10 space-y-8">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Tanzanian Seasonal Guide</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white uppercase">Best Time to Visit</h3>
                <p className="text-xs text-slate-400">
                  Select a month below to examine typical dry/wet weather patterns, temperature guides, wildlife migration activity, and beach water conditions.
                </p>
              </div>

              {/* Month Tabs */}
              <div className="flex overflow-x-auto whitespace-nowrap gap-1 pb-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((mName, mIdx) => (
                  <button
                    key={mName}
                    onClick={() => setSelectedMonth(mIdx)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      selectedMonth === mIdx 
                        ? 'bg-[#D4A017] text-[#020C1F]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {mName.slice(0, 3)}
                  </button>
                ))}
              </div>

              {/* Monthly Info Cards */}
              {(() => {
                const monthsData = [
                  { temp: '29°C / 84°F', rain: 'Low', wild: 'Excellent (Calving)', marine: 'Excellent', rating: 'Peak Season', note: 'Calving season in southern Serengeti with extreme predator activity; hot and beautiful sunny days in Zanzibar.' },
                  { temp: '30°C / 86°F', rain: 'Low', wild: 'Excellent (Calving)', marine: 'Excellent', rating: 'Peak Season', note: 'Spectacular calving in southern Serengeti Ndutu plains. Clear, flat coastal waters with gentle ocean breeze.' },
                  { temp: '29°C / 84°F', rain: 'Medium', wild: 'Good (Transition)', marine: 'Good', rating: 'High Season', note: 'Lush green landscapes emerge; brief pleasant afternoon showers. Low tourist crowds.' },
                  { temp: '27°C / 81°F', rain: 'High', wild: 'Fair (Green Season)', marine: 'Fair', rating: 'Green Season', note: 'Heavy monsoonal rains; muddy off-road tracks but gorgeous dramatic skies, full rivers, and active nesting birds.' },
                  { temp: '26°C / 79°F', rain: 'High', wild: 'Fair (Green Season)', marine: 'Fair', rating: 'Green Season', note: 'Monsoon rains taper off late month; low tourist traffic with magnificent green vistas and maximum lodge price benefits.' },
                  { temp: '25°C / 77°F', rain: 'Low', wild: 'Excellent (Dry Safari)', marine: 'Excellent', rating: 'High Season', note: 'Cooler, pleasant dry weather begins. Wildebeests gather in central Serengeti; stable trade winds for kitesurfing.' },
                  { temp: '26°C / 79°F', rain: 'Low', wild: 'Excellent (Migration)', marine: 'Excellent', rating: 'Peak Season', note: 'Ideal safari climate. Migrating herds head northwest toward Grumeti; crystal clear Indian Ocean diving clarity.' },
                  { temp: '27°C / 81°F', rain: 'Low', wild: 'Excellent (Mara Crossing)', marine: 'Excellent', rating: 'Peak Season', note: 'Mara River Wildebeest crossings reach absolute peak in northern Serengeti. Unbelievable beach weather.' },
                  { temp: '28°C / 82°F', rain: 'Low', wild: 'Excellent (Mara Crossing)', marine: 'Excellent', rating: 'Peak Season', note: 'Incredible river crossing action continues. Warm, pleasant, sunny coastal weather with high underwater clarity.' },
                  { temp: '29°C / 84°F', rain: 'Low', wild: 'Excellent (Dry Season)', marine: 'Excellent', rating: 'Peak Season', note: 'Last Mara crossings. Dry savannas keep predators highly visible near permanent waterholes and springs.' },
                  { temp: '29°C / 84°F', rain: 'Medium', wild: 'Good (Short Rains)', marine: 'Good', rating: 'High Season', note: 'Brief afternoon thunder showers. Rebirth of fresh green savannah grasses; exceptionally clear air for photography.' },
                  { temp: '29°C / 84°F', rain: 'Medium', wild: 'Excellent (Migration)', marine: 'Excellent', rating: 'Peak Season', note: 'Migrating herds travel south. Festive Christmas travel season; extremely warm, azure waters in Zanzibar.' }
                ];
                
                const curMonth = monthsData[selectedMonth];
                const isZanzibar = currentDest.region === 'zanzibar';

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-center">
                    <div className="bg-slate-950/30 border border-white/5 p-6 rounded-2xl text-center space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Selected Month Status</span>
                      <strong className="text-xl text-[#D4A017] uppercase font-serif tracking-wide block">
                        {[
                          'January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ][selectedMonth]}
                      </strong>
                      <span className="inline-flex bg-[#D4A017]/20 border border-[#D4A017]/30 text-[#D4A017] text-[10px] font-black uppercase px-3 py-1 rounded-full">
                        {curMonth.rating}
                      </span>
                    </div>

                    <div className="md:col-span-2 bg-slate-950/40 border border-white/5 p-6 rounded-2xl space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-white/5 pb-4">
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Temperature</span>
                          <span className="text-xs text-white font-extrabold block">{curMonth.temp}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Rainfall Level</span>
                          <span className="text-xs text-white font-extrabold block">{curMonth.rain}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Wildlife Index</span>
                          <span className="text-xs text-white font-extrabold block">{isZanzibar ? 'Moderate' : curMonth.wild}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Indian Ocean Clarity</span>
                          <span className="text-xs text-white font-extrabold block">{curMonth.marine}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-[#D4A017] uppercase font-black tracking-widest block">Expert Guide Tip</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-light">
                          {curMonth.note}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ========================================================
              6. TOP ATTRACTIONS (Dynamic Attraction Cards)
             ======================================================== */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="space-y-2 pb-6">
              <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Unmissable Landmarks</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white uppercase">Top Attractions in {currentDest.name}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(() => {
                const getAttractionsList = () => {
                  if (currentDest.topAttractions && currentDest.topAttractions.length > 0) {
                    return currentDest.topAttractions.map((name, idx) => ({
                      name,
                      img: idx === 0 ? 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600' :
                           idx === 1 ? 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=600' :
                           idx === 2 ? 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600' :
                           'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=600',
                      desc: `Incredibly scenic region offering unparalleled views, historical richness, and highly active local guiding tours.`
                    }));
                  }
                  
                  // Static descriptive default fallbacks tailored to the region
                  if (currentDest.region === 'zanzibar') {
                    return [
                      { name: 'Stone Town (Heritage Hub)', img: 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=600', desc: 'The labyrinth of narrow coral limestone streets, ancient wooden doors, sultan ruins, and historic spice markets.' },
                      { name: 'Mnemba Island Atoll', img: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600', desc: 'Renowned private island reef structure containing wild dolphins, sea turtles, and vibrant dropoff corals.' },
                      { name: 'Nungwi & Kendwa beaches', img: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600', desc: 'Powder white sand coastlines with non-tidal azure waters, perfect for all-day ocean swimming and pristine sunset sails.' },
                      { name: 'Jozani Mahogany Forest', img: 'https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=600&q=80', desc: 'Protected rainforest sanctuary home to the red colobus monkey species and thriving coastal mangrove networks.' }
                    ];
                  } else {
                    return [
                      { name: 'Seronera Valley', img: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600', desc: 'The highly popular central savanna rich in permanent acacia springs, maintaining healthy populations of leopards and lions.' },
                      { name: 'The Mara River Loop', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80', desc: 'The northern crossing boundary where millions of wildebeest challenge massive crocodiles in a survival sprint.' },
                      { name: 'Moru Kopjes Granites', img: 'https://images.unsplash.com/photo-1601999000780-e79e60a3a7f4?auto=format&fit=crop&w=600&q=80', desc: 'Stunning rocky granite structures dotting the golden savannah grass, a favorite nesting and hunting spot for lions.' },
                      { name: 'Grumeti River Valley', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80', desc: 'A remote wilderness corridor featuring dense riverine forests, giant hippos, and seasonal migratory crossings.' }
                    ];
                  }
                };

                return getAttractionsList().map((att, index) => (
                  <div key={index} className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4A017]/30 transition-all group flex flex-col justify-between shadow-lg">
                    <div>
                      <div className="relative h-44 overflow-hidden">
                        <img src={att.img} alt={att.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded text-[#D4A017] text-[9px] uppercase font-black tracking-widest border border-white/10">
                          📍 Landmark
                        </span>
                      </div>
                      <div className="p-5 space-y-2">
                        <h4 className="font-bold text-sm text-white uppercase tracking-wide group-hover:text-[#D4A017] transition-colors">{att.name}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-light line-clamp-3">{att.desc}</p>
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <a href="#enquiry-desk" className="w-full block py-2 rounded-xl bg-white/5 hover:bg-[#D4A017] text-white hover:text-[#020C1F] text-[10px] font-black uppercase tracking-wider text-center transition-all cursor-pointer">
                        Add to Itinerary
                      </a>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* ========================================================
              7. THINGS TO DO (Curated Activities)
             ======================================================== */}
          {relatedActivities.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="space-y-2 pb-6">
                <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Signature Swahili Experiences</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white uppercase">Curated Things To Do</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedActivities.map(act => (
                  <div key={act.id} className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden flex flex-col sm:flex-row gap-5 p-5 hover:border-[#D4A017]/30 transition-all shadow-xl">
                    <img src={act.image} alt={act.name} className="w-full sm:w-28 h-28 rounded-xl object-cover shrink-0 border border-white/5 shadow" />
                    <div className="space-y-3 flex-grow flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {(act.tags || ['Premium', 'Explore']).slice(0, 2).map(tag => (
                            <span key={tag} className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-slate-400 uppercase font-bold">{tag}</span>
                          ))}
                        </div>
                        <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">{act.name}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-light">{act.description}</p>
                      </div>
                      <button 
                        onClick={() => navigate('tours')} 
                        className="text-[10px] text-[#D4A017] hover:underline font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        Find Packages <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              8. FEATURED TOUR PACKAGES (Automatic Relations)
             ======================================================== */}
          {relatedTours.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
              <div className="border-t border-white/5 pt-12 space-y-2">
                <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Available Programs</span>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white uppercase tracking-tight">Safaris & Tour Packages</h3>
                <p className="text-xs text-slate-400 max-w-xl">Book pre-arranged high-end excursions designed and coordinated by our local operator desk.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTours.map(tour => (
                  <div key={tour.id} className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4A017]/30 transition-all flex flex-col justify-between shadow-2xl group">
                    <div>
                      <div className="relative h-48 overflow-hidden">
                        <img src={tour.img} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute bottom-3 left-3 bg-[#020C1F]/80 px-2.5 py-1 rounded text-[#D4A017] font-black text-[9px] uppercase tracking-wider border border-[#D4A017]/20">
                          {tour.duration}
                        </span>
                        {tour.difficulty && (
                          <span className="absolute top-3 right-3 bg-black/60 px-2 py-0.5 rounded text-white font-bold text-[8px] uppercase tracking-wide">
                            {tour.difficulty}
                          </span>
                        )}
                      </div>
                      <div className="p-6 space-y-3">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span className="capitalize text-[#D4A017] font-black tracking-wider">{tour.category}</span>
                          <span className="flex items-center gap-0.5"><Star size={11} className="fill-amber-400 text-amber-400" /> 4.9 (50+)</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-white uppercase font-serif tracking-wide">{tour.title}</h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-3 font-light">{tour.shortDesc}</p>
                      </div>
                    </div>
                    
                    <div className="p-6 pt-0 border-t border-white/5 mt-2 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase font-black block">Price Guide</span>
                        <strong className="text-sm text-[#D4A017] font-black">{tour.price}</strong>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate('tour-detail', tour.slug)}
                          className="bg-white/5 hover:bg-white/10 text-white px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-white/5"
                        >
                          Details
                        </button>
                        <a
                          href="#enquiry-desk"
                          onClick={() => setEnquiryForm(prev => ({ ...prev, message: `I would like to book the tour: ${tour.title}` }))}
                          className="bg-[#D4A017] hover:bg-white text-[#020C1F] hover:text-[#020C1F] px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Book Now
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              9. HOTELS & ACCOMMODATION (Automatic Lodging list)
             ======================================================== */}
          {relatedHotels.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
              <div className="border-t border-white/5 pt-12 space-y-2">
                <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Exclusive Partners</span>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white uppercase tracking-tight">Luxury Hotels & Safari Lodges</h3>
                <p className="text-xs text-slate-400 max-w-xl">We partner exclusively with accommodations meeting our extreme safety, green protection, and five-star quality standards.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedHotels.map(h => {
                  // Beautiful hardcoded default details if hotel options are basic in DB
                  const mockHotelImg = h.id === 'h1' ? 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=600' :
                                       h.id === 'h2' ? 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=600' :
                                       h.id === 'h4' ? 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=600' :
                                       'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=600';
                  
                  const mockHotelDesc = h.id === 'h1' ? 'Perched on Nungwi beach with premium infinity pools, private beach stretches, and beautiful ocean sunset dining.' :
                                        h.id === 'h2' ? 'Rich Swahili architectural palace in the heart of Stone Town, boasting historical suites and premium rooftop dining.' :
                                        'Exclusive eco-conscious sanctuary nestled inside pristine private tropical palm forests, offering high-end luxury suites.';

                  return (
                    <div key={h.id} className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4A017]/30 transition-all flex flex-col justify-between shadow-2xl group">
                      <div>
                        <div className="relative h-48 overflow-hidden">
                          <img src={h.image || mockHotelImg} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <span className="absolute top-3 right-3 bg-black/75 px-3 py-1 rounded-full text-amber-400 font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 border border-amber-500/25">
                            ★ {h.stars || '5'} Star Luxury
                          </span>
                        </div>
                        <div className="p-6 space-y-3">
                          <h4 className="font-bold text-sm text-white font-serif tracking-wide uppercase">{h.name}</h4>
                          <p className="text-slate-400 text-[11px] leading-relaxed font-light line-clamp-3">{h.description || mockHotelDesc}</p>
                          
                          {/* Amenities strip */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {['Ocean View', 'Infinity Pool', 'Eco-certified', 'Free WiFi'].map(tag => (
                              <span key={tag} className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-slate-300 font-semibold uppercase">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-6 pt-0 border-t border-white/5 mt-2 flex items-center justify-between">
                        <div>
                          <span className="text-[8px] text-slate-500 uppercase font-black block">Price Class</span>
                          <strong className="text-[10px] text-[#D4A017] font-black uppercase tracking-widest">{h.category || 'Premium Elite'}</strong>
                        </div>
                        <a
                          href="#enquiry-desk"
                          onClick={() => setEnquiryForm(prev => ({ ...prev, message: `I am interested in booking accommodation at: ${h.name}` }))}
                          className="bg-white/5 hover:bg-[#D4A017] text-white hover:text-[#020C1F] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-white/5"
                        >
                          Book Lodge Room
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              10. GALLERY (Separate Tabs Photos / Videos / Social)
             ======================================================== */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-8 sm:p-10 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-5">
                <div>
                  <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Media Registry</span>
                  <h3 className="text-2xl font-serif font-bold text-white uppercase">Destination Gallery</h3>
                </div>
                
                {/* Tab select buttons */}
                <div className="flex flex-wrap gap-1 mt-3 md:mt-0 bg-slate-950/40 p-1.5 rounded-2xl border border-white/5">
                  {[
                    { id: 'photos', label: 'Photos', icon: Camera },
                    { id: 'videos', label: 'Videos', icon: Video },
                    { id: 'drone', label: 'Drone Clips', icon: Sparkles },
                    { id: 'instagram', label: 'Instagram Feed', icon: Globe }
                  ].map(tab => {
                    const IconComp = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setGalleryTab(tab.id as any)}
                        className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                          galleryTab === tab.id 
                            ? 'bg-[#D4A017] text-[#020C1F]' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <IconComp size={11} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photos Panel */}
              {galleryTab === 'photos' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                  {(currentDest.gallery && currentDest.gallery.length > 0 ? currentDest.gallery : [
                    currentDest.image,
                    'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
                    'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=600',
                    'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600'
                  ]).map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 group shadow-lg">
                      <img src={imgUrl} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-black/70 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl text-[9px] font-bold text-white uppercase tracking-widest">
                          View full image
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Videos Panel */}
              {galleryTab === 'videos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  {currentDest.videoUrl ? (
                    <div className="aspect-video rounded-2xl overflow-hidden border border-white/5 relative bg-black shadow-xl">
                      <iframe 
                        src={currentDest.videoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl overflow-hidden border border-white/5 relative bg-black shadow-xl flex flex-col justify-center items-center p-6 text-center space-y-2">
                      <Play size={36} className="text-[#D4A017] animate-pulse" />
                      <strong className="text-xs text-white">Default Safari Showcase</strong>
                      <p className="text-[10px] text-slate-500 max-w-xs">No custom YouTube video uploaded by admin. Using system defaults.</p>
                    </div>
                  )}
                  <div className="aspect-video rounded-2xl overflow-hidden border border-white/5 relative bg-black shadow-xl flex flex-col justify-center items-center p-6 text-center space-y-2 bg-[url('https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600')] bg-cover">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
                    <div className="relative z-10 space-y-2">
                      <Play size={28} className="text-[#D4A017] mx-auto" />
                      <strong className="text-xs text-white uppercase">Client Testimonial Reels</strong>
                      <p className="text-[10px] text-slate-300 max-w-xs">Watch real family moments from last seasons beach excursions.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Drone Footage Panel */}
              {galleryTab === 'drone' && (
                <div className="bg-slate-950/40 border border-white/5 p-8 rounded-2xl text-center space-y-4 animate-fade-in">
                  <Play size={36} className="text-[#D4A017] mx-auto animate-bounce" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white uppercase">Cinematic 4K Drone Footage</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Witness Zanzibar’s extreme tides, barrier reefs, and sandbanks from majestic bird-eye aerial views. Perfect for planning snorkeling trajectories.
                    </p>
                  </div>
                  <button onClick={() => navigate('contact')} className="bg-[#D4A017] text-[#020C1F] text-[10px] font-black uppercase tracking-wider px-6 py-2.5 rounded-xl">
                    Request Full Aerial Portfolio
                  </button>
                </div>
              )}

              {/* Instagram Feed Panel */}
              {galleryTab === 'instagram' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center text-xs text-slate-400">
                    Showing social captures with hashtag <strong className="text-[#D4A017]">#ZanzibarTripAndRelax</strong>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { handle: '@wanderlust_mia', img: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=300', tag: 'Paradise found!' },
                      { handle: '@johndoe_safari', img: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=300', tag: 'Lions of Serengeti' },
                      { handle: '@kitesurf_alex', img: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=300', tag: 'Paje wind catches' },
                      { handle: '@honeymooners_99', img: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=300', tag: 'Best sunset!' }
                    ].map((post, idx) => (
                      <div key={idx} className="bg-slate-950/45 border border-white/5 p-3 rounded-2xl space-y-2">
                        <img src={post.img} alt="Insta" className="w-full aspect-square object-cover rounded-xl" />
                        <div className="flex justify-between items-center text-[9px]">
                          <strong className="text-slate-300">{post.handle}</strong>
                          <span className="text-[#D4A017]">★</span>
                        </div>
                        <p className="text-[9px] text-slate-500 italic">"{post.tag}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              11. INTERACTIVE MAP SECTION
             ======================================================== */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-8 sm:p-10 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Geographic Navigation</span>
                <h3 className="text-2xl font-serif font-bold text-white uppercase flex items-center gap-2">
                  <MapPin className="text-[#D4A017]" />
                  <span>Interactive Destination Map</span>
                </h3>
                <p className="text-xs text-slate-400">Navigate local airports, handpicked hotel sites, beaches, and protected national parks.</p>
              </div>
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-black">
                <iframe 
                  src={currentDest.mapUrl || `https://maps.google.com/maps?q=${encodeURIComponent(currentDest.name + ', Tanzania')}&t=&z=10&ie=UTF8&iwloc=&output=embed`} 
                  className="w-full h-full border-none"
                  allowFullScreen={true} 
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              12. TRAVEL INFORMATION (Logistics survival guide)
             ======================================================== */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-8 sm:p-10 space-y-6">
              <div className="space-y-1 border-b border-white/5 pb-4">
                <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Practical Survival Guidelines</span>
                <h3 className="text-2xl font-serif font-bold text-white uppercase">Travel Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-950/20 border border-white/5 p-5 rounded-2xl space-y-2.5">
                  <ShieldCheck className="text-[#D4A017] w-6 h-6" />
                  <strong className="text-xs text-white uppercase font-black tracking-widest block">Visa & Entry Regulations</strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-light">
                    Passports must be valid for 6 months. Most nationalities obtain a tourist Visa on Arrival ($50 for EU/UK, $100 for US). Online e-Visas are highly recommended prior to arrival.
                  </p>
                </div>
                <div className="bg-slate-950/20 border border-white/5 p-5 rounded-2xl space-y-2.5">
                  <Thermometer className="text-[#D4A017] w-6 h-6" />
                  <strong className="text-xs text-white uppercase font-black tracking-widest block">Health & Safety Vaccines</strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-light">
                    Malaria prophylaxis is highly recommended. Drink only bottled mineral water. Yellow Fever vaccine is required if arriving from an endemic nation.
                  </p>
                </div>
                <div className="bg-slate-950/20 border border-white/5 p-5 rounded-2xl space-y-2.5">
                  <DollarSign className="text-[#D4A017] w-6 h-6" />
                  <strong className="text-xs text-white uppercase font-black tracking-widest block">Currency & Tipping Custom</strong>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-light">
                    Tanzanian Shilling is the local tender, but US Dollars (printed after 2006) are universally accepted. Tipping is custom: $20/day for safari guides.
                  </p>
                </div>
              </div>
              
              {currentDest.travelTips && currentDest.travelTips.length > 0 && (
                <div className="pt-4 space-y-2">
                  <span className="text-[9px] text-[#D4A017] uppercase font-black tracking-widest block">Expert Field Advice & Packing Tips</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/20 p-5 rounded-2xl border border-white/5">
                    {currentDest.travelTips.map((tip, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-start gap-2 font-light">
                        <span className="w-1.5 h-1.5 bg-[#D4A017] rounded-full mt-1.5 shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              13. FREQUENTLY ASKED QUESTIONS (FAQ)
             ======================================================== */}
          <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Expert Support Hub</span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white uppercase">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-3">
              {(currentDest.faqs && currentDest.faqs.length > 0 ? currentDest.faqs : [
                { q: `Is visiting ${currentDest.name} completely safe?`, a: 'Yes, Tanzania is exceptionally safe and welcoming. We use dedicated guides and verified vehicles for maximum security.' },
                { q: 'What is the absolute best time of year to visit?', a: 'Generally the long dry season from June to October represents ideal viewing across both beach and safari circuits.' },
                { q: 'Can I pay directly in US dollars?', a: 'Yes, US dollars are accepted widely across resorts, park fees, and activities. Ensure your notes are printed after 2006.' }
              ]).map((faq, fIdx) => (
                <div key={fIdx} className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === fIdx ? null : fIdx)}
                    className="w-full p-5 text-left flex justify-between items-center text-xs font-black uppercase text-white hover:text-[#D4A017] transition-all cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight size={14} className={`text-slate-500 transition-transform ${openFaqIndex === fIdx ? 'rotate-90' : ''}`} />
                  </button>
                  {openFaqIndex === fIdx && (
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-4 font-light">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ========================================================
              14. GUEST REVIEWS (Verified Testimonials)
             ======================================================== */}
          <div id="guest-reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-8 sm:p-10 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6">
                <div>
                  <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Guest Voice Registry</span>
                  <h3 className="text-2xl font-serif font-bold text-white uppercase">Verified Traveler Reviews</h3>
                </div>
                <span className="text-xs text-slate-400 mt-2 md:mt-0">Overall Rating: <strong className="text-[#D4A017]">4.9 / 5.0</strong> (Based on 148 surveys)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Sarah Jenkins', country: 'United Kingdom', tour: 'Zanzibar Blue Cruise', comment: 'Absolutely flawless planning. Our captain took us to pristine remote coral zones before crowds arrived. Truly magical!' },
                  { name: 'Markus Müller', country: 'Germany', tour: 'Serengeti Migration Flight', comment: 'Unbelievable wildebeest Mara crossings. The guide had pristine biological knowledge of the lion behaviors. Extremely happy!' },
                  { name: 'Elena Petrova', country: 'Czech Republic', tour: 'Stone Town Cultural Walk', comment: 'Our Swahili guide explained the ancient architecture, slave markets, and Zanzibar sultan history with immense passion. Top score.' }
                ].map((rev, idx) => (
                  <div key={idx} className="bg-slate-950/20 border border-white/5 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className="fill-amber-400" />)}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed italic font-light">"{rev.comment}"</p>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px]">
                      <div>
                        <strong className="text-white block">{rev.name}</strong>
                        <span className="text-slate-500">{rev.country}</span>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase">{rev.tour}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================
              15. RELATED ARTICLES (Dynamic Blogs)
             ======================================================== */}
          {relatedBlogs.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Guides & Insights</span>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white uppercase tracking-tight">Expert Travel Advice</h3>
                <p className="text-xs text-slate-400 max-w-xl">Read packing guidelines, marine rules, and seasonal safety alerts from our operations team.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBlogs.map(post => (
                  <div key={post.id} className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4A017]/30 transition-all flex flex-col justify-between shadow-lg">
                    <div>
                      <div className="relative h-40">
                        <img src={post.image || 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800'} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-5 space-y-2">
                        <span className="text-[9px] font-extrabold text-[#D4A017] uppercase tracking-wider block">{post.category || 'Specialist Advice'}</span>
                        <h4 className="font-bold text-sm text-white line-clamp-2 uppercase font-serif">{post.title}</h4>
                        <p className="text-slate-400 text-[11px] font-light leading-relaxed line-clamp-2">{post.excerpt}</p>
                      </div>
                    </div>
                    <div className="p-5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>By {post.author || 'Zanzibar Guide'}</span>
                      <button
                        onClick={() => navigate('blog-detail', post.id)}
                        className="text-[#D4A017] hover:underline text-xs flex items-center gap-1 font-bold cursor-pointer"
                      >
                        Read Article <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              16. SIMILAR DESTINATIONS (Automatic Recommendations)
             ======================================================== */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-8 sm:p-10 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Extend Your Journey</span>
                <h3 className="text-2xl font-serif font-bold text-white uppercase">Similar Destinations You’ll Love</h3>
                <p className="text-xs text-slate-400">Consider combining your trip to {currentDest.name} with these beautiful sister locations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {destinations.filter(d => d.id !== currentDest.id && (currentDest.region === 'zanzibar' ? d.region === 'zanzibar' : d.region !== 'zanzibar')).slice(0, 3).map(simDest => (
                  <div key={simDest.id} className="bg-slate-950/30 border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4A017]/30 transition-all flex flex-col justify-between group shadow-lg">
                    <div className="relative h-36 overflow-hidden">
                      <img src={simDest.image} alt={simDest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute bottom-3 left-3 bg-black/60 px-2 py-0.5 rounded text-slate-300 text-[8px] font-black uppercase tracking-wider">
                        {simDest.region} Circuit
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">{simDest.name}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-light line-clamp-2">{simDest.description}</p>
                    </div>
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => navigate('destinations', simDest.id)}
                        className="w-full py-2 rounded-xl bg-white/5 hover:bg-[#D4A017] text-white hover:text-[#020C1F] text-[10px] font-black uppercase tracking-wider text-center transition-all cursor-pointer"
                      >
                        Explore Destination
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================
              17. ENQUIRY SECTION (Professional Booking Desk Form)
             ======================================================== */}
          <div id="enquiry-desk" className="max-w-4xl mx-auto px-4 py-4">
            <div className="bg-gradient-to-b from-[#0A1D3D] to-[#050E21] border border-[#D4A017]/35 rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl relative">
              <div className="absolute top-6 right-6 text-[#D4A017]">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Itinerary Conception</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white uppercase">Plan My {currentDest.name} Itinerary</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Complete the professional consultation request below. Our local Stone Town travel desk will draft a customized program and send your quote via Email and WhatsApp.
                </p>
              </div>

              {enquirySubmitted ? (
                <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
                  <Check size={36} className="text-[#D4A017] mx-auto" />
                  <strong className="text-sm text-white uppercase block">Enquiry Submitted Successfully!</strong>
                  <p className="text-xs text-slate-300 leading-relaxed font-light max-w-md mx-auto">
                    Thank you! Your custom itinerary blueprint has been successfully saved. We have prefilled a secure WhatsApp chat trigger so you can message our active operators immediately.
                  </p>
                  <button
                    onClick={() => {
                      setEnquirySubmitted(false);
                      setEnquiryForm({
                        name: '', email: '', phone: '', date: '', adults: '2', children: '0',
                        budget: '$1,500 - $3,000', tier: 'Luxury', message: '', language: 'English'
                      });
                    }}
                    className="text-[10px] text-slate-400 hover:text-white underline block mx-auto font-bold uppercase"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Your Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={enquiryForm.name}
                          onChange={e => setEnquiryForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g. John Doe"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/25 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={enquiryForm.email}
                          onChange={e => setEnquiryForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="e.g. john@example.com"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/25 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">WhatsApp Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={enquiryForm.phone}
                          onChange={e => setEnquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="e.g. +1 555 123 4567"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/25 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Target Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="date"
                          required
                          value={enquiryForm.date}
                          onChange={e => setEnquiryForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/25 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Budget Bracket</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                          value={enquiryForm.budget}
                          onChange={e => setEnquiryForm(prev => ({ ...prev, budget: e.target.value }))}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/25 transition-all appearance-none"
                        >
                          <option value="$1,500 - $3,000">$1,500 - $3,000 / Person</option>
                          <option value="$3,000 - $5,000">$3,000 - $5,000 / Person</option>
                          <option value="$5,000 - $10,000">$5,000 - $10,000 / Person</option>
                          <option value="$10,000+">$10,000+ / Ultra Luxury</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Adults (18+)</label>
                      <input
                        type="number"
                        min="1"
                        value={enquiryForm.adults}
                        onChange={e => setEnquiryForm(prev => ({ ...prev, adults: e.target.value }))}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 pl-4 pr-4 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Children (2-17)</label>
                      <input
                        type="number"
                        min="0"
                        value={enquiryForm.children}
                        onChange={e => setEnquiryForm(prev => ({ ...prev, children: e.target.value }))}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 pl-4 pr-4 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Lodging Level</label>
                      <select
                        value={enquiryForm.tier}
                        onChange={e => setEnquiryForm(prev => ({ ...prev, tier: e.target.value }))}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 pl-4 pr-4 text-xs text-white focus:outline-none focus:border-[#D4A017] appearance-none"
                      >
                        <option value="Comfort Midrange">Comfort Midrange</option>
                        <option value="Luxury Elite">Luxury Elite</option>
                        <option value="Ultra-Luxe Private">Ultra-Luxe Private</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Preferred Language</label>
                      <select
                        value={enquiryForm.language}
                        onChange={e => setEnquiryForm(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 pl-4 pr-4 text-xs text-white focus:outline-none focus:border-[#D4A017] appearance-none"
                      >
                        <option value="English">English</option>
                        <option value="German">German</option>
                        <option value="French">French</option>
                        <option value="Spanish">Spanish</option>
                        <option value="Swahili">Swahili</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Special Interests / Message</label>
                    <textarea
                      rows={3}
                      value={enquiryForm.message}
                      onChange={e => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Specify if this is a honeymoon trip, private balloon requirements, dolphin swimming preferences, or specific diet issues..."
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#D4A017] hover:bg-white text-[#020C1F] hover:text-[#020C1F] py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Submit & Launch WhatsApp Enquiry</span>
                    <Send size={12} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ========================================================
              18. FINAL CALL TO ACTION (Luxury Banner)
             ======================================================== */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-10">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0A1224] to-[#0A1A3A] border border-[#D4A017]/35 p-10 lg:p-16 text-center space-y-6 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(212,160,23,0.06),transparent_40%)]" />
              
              <div className="max-w-2xl mx-auto relative z-10 space-y-5">
                <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Start Your Adventure Today</span>
                <h2 className="text-3xl lg:text-4xl font-serif font-extrabold text-white uppercase tracking-tight">Ready to Discover {currentDest.name}?</h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  Let Zanzibar Trip & Relax guide you through wild safari fields, mountain glaciers, and the turquoise blue beaches of the spice islands. Your journey is supported 24/7 by a local concierge desk.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <a
                    href="#enquiry-desk"
                    className="w-full sm:w-auto bg-[#D4A017] hover:bg-white text-[#020C1F] font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Book Journey Now</span> <Sparkles className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`Hi Zanzibar Trip & Relax! I want to consult an agent about *${currentDest.name}* destination guidelines.`);
                      window.open(`https://wa.me/${siteContent.contact?.whatsapp?.replace(/\s+/g, '') || '255629506063'}?text=${text}`, '_blank');
                    }}
                    className="w-full sm:w-auto bg-[#25D366] hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Consult on WhatsApp</span> <MessageSquare className="w-4 h-4 fill-white text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : currentRegionId ? (

        /* ========================================================
            2. LEVEL 2: DEDICATED REGIONAL VIEW
            ======================================================== */
        <div className="bg-[#020C1F] min-h-screen text-slate-100 pb-20">
          {/* Breadcrumb & Navigation Header */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5">
            <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-widest">
              <a href="#destinations" className="hover:text-white transition-colors font-bold">Destinations</a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[#D4A017] font-black">{currentRegion?.name || 'Region'}</span>
            </div>
            <button
              onClick={() => {
                window.location.hash = 'destinations';
              }}
              className="text-xs text-slate-400 hover:text-[#D4A017] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to All Regions
            </button>
          </div>

          {/* Region Landing Hero */}
          <div className="relative overflow-hidden bg-[#0A1224] py-16 lg:py-20 border-b border-white/5">
            <div className="absolute inset-0 opacity-15">
              <img src={currentRegion?.image} className="w-full h-full object-cover blur-[1px]" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020C1F] to-transparent" />
            </div>
            <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D4A017]/10 text-[#D4A017] text-[10px] font-extrabold uppercase tracking-widest border border-[#D4A017]/20">
                <Compass className="w-3.5 h-3.5" /> Explorer Circuit
              </span>
              <h1 className="text-3xl sm:text-5xl font-serif font-black text-white uppercase tracking-tight">
                {currentRegion?.name || 'Tanzania Circuit'}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light">
                {currentRegion?.description || 'Explore our custom local safaris and island excursions.'}
              </p>
            </div>
          </div>

          {/* Search Bar Workspace */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
            <div className="bg-[#0A1224] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search destinations within ${currentRegion?.name}...`}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017]/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Regional Destinations Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {destinations.filter(d => d.region === currentRegionId && d.visible !== false).filter(d => 
              d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              d.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 ? (
              <div className="text-center py-20 bg-[#0A1224]/30 rounded-3xl border border-white/5 space-y-4">
                <AlertCircle className="w-12 h-12 text-[#D4A017] mx-auto opacity-60 animate-bounce" />
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-white">No Matching Destinations</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto font-light">
                    We couldn't find any destinations matching your search terms in this circuit. Try another search or reset query.
                  </p>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs uppercase font-extrabold tracking-widest text-[#D4A017] hover:underline cursor-pointer"
                >
                  Reset Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {destinations.filter(d => d.region === currentRegionId && d.visible !== false).filter(d => 
                  d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  d.description.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((dest) => (
                  <motion.div
                    key={dest.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#D4A017]/30 group transition-all duration-300 shadow-lg hover:shadow-[#D4A017]/5"
                  >
                    {/* Image Section */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <ProgressiveImage
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded bg-[#020C1F]/80 backdrop-blur-sm border border-white/10 text-[#D4A017] text-[9px] font-black uppercase tracking-wider">
                        ★ {dest.bestTime?.split('(')[0]?.trim() || 'Year-round'}
                      </span>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-[#D4A017] transition-colors leading-snug font-serif uppercase tracking-tight">
                          {dest.name}
                        </h3>
                        <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 font-light">
                          {dest.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-white/5">
                        {/* Key Highlights */}
                        {dest.highlights && dest.highlights.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#D4A017] block">Signature Highlights</span>
                            <div className="grid grid-cols-1 gap-1">
                              {dest.highlights.slice(0, 2).map((h, i) => (
                                <span key={i} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 bg-[#D4A017]/60 rounded-full shrink-0"></span>
                                  <span className="truncate">{h}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom CTA Bar */}
                    <div className="px-6 pb-6 pt-0">
                      <button
                        onClick={() => {
                          window.location.hash = `destinations/${dest.id}`;
                        }}
                        className="w-full py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-[#D4A017] hover:border-[#D4A017] text-xs font-black uppercase tracking-widest text-slate-300 hover:text-[#020C1F] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Explore Destination</span> <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (

        /* ========================================================
            1. LEVEL 1: REGIONS DIRECTORY VIEW
            ======================================================== */
        <div className="bg-[#020C1F] min-h-screen text-slate-100 pb-20">
          {/* Page Header */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#0A1A3A] to-[#020C1F] py-24 px-4 sm:px-6 lg:px-8 border-b border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,160,23,0.06),transparent_50%)]" />
            <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/10 text-[#D4A017] text-[11px] font-extrabold uppercase tracking-widest border border-[#D4A017]/25">
                <Compass className="w-3.5 h-3.5" /> Swahili District Atlas
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight uppercase font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
                Explore <span className="text-[#D4A017]">Tanzania Regions</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
                Select one of our primary travel circuits to explore wild savanna fields, high mountain glaciers, or the exotic cloves and sandy beaches of the Indian Ocean.
              </p>
            </div>
          </div>

          {/* Regions Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {REGIONS_METADATA.map((region) => (
                <motion.div
                  key={region.id}
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-[#D4A017]/30 group transition-all duration-300 shadow-2xl hover:shadow-[#D4A017]/5"
                >
                  {/* Image Overlay Banner */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1224] via-transparent to-black/30 z-10" />
                    <img
                      src={region.image}
                      alt={region.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-[#020C1F]/80 backdrop-blur-sm border border-[#D4A017]/35 text-[#D4A017] text-[10px] font-extrabold uppercase tracking-widest">
                      {region.tag}
                    </span>
                  </div>

                  {/* Content Body */}
                  <div className="p-8 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#D4A017] block font-mono">
                        {region.tagline}
                      </span>
                      <h2 className="text-2xl font-serif font-black text-white group-hover:text-[#D4A017] transition-colors uppercase tracking-tight">
                        {region.name}
                      </h2>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light line-clamp-4">
                        {region.description}
                      </p>
                    </div>

                    {/* Quick stats / included previews */}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        📍 {destinations.filter(d => d.region === region.id && d.visible !== false).length} Key Districts
                      </span>
                      <span className="text-xs text-[#D4A017] font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Discover Circuit <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Explore Button */}
                  <div className="px-8 pb-8">
                    <button
                      onClick={() => {
                        window.location.hash = `destinations/region/${region.id}`;
                      }}
                      className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-[#D4A017] hover:border-[#D4A017] text-xs font-black uppercase tracking-widest text-slate-200 hover:text-[#020C1F] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Explore Region</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Map section nested beautifully */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white uppercase tracking-tight">
                Interactive Tanzania Map
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-light">
                Hover over the geographic hotspots to locate national parks, mountain summits, and islands.
              </p>
            </div>
            <InteractiveTanzaniaMap navigate={navigate} />
          </div>

          {/* Booking Recommendation Footer */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0A1224] to-[#0A1A3A] border border-[#D4A017]/25 p-8 lg:p-14 text-center space-y-6 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(212,160,23,0.06),transparent_40%)]" />
              <div className="max-w-2xl mx-auto relative z-10 space-y-6">
                <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white uppercase tracking-tight">Design Your Perfect Swahili Coast Adventure</h2>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                  Combine majestic Big Five game drives in Northern Serengeti with white-sand beaches, dolphin tours, and world-class diving in Zanzibar. Our interactive <strong>Trip Builder</strong> automatically optimizes your travel dates.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
                  <button
                    onClick={() => navigate('trip-builder')}
                    className="w-full sm:w-auto bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black uppercase tracking-wider text-xs px-8 py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span>Launch Trip Builder</span> <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('contact')}
                    className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold border border-white/20 uppercase tracking-wider text-xs px-8 py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Consult Our Specialists</span> <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
