import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Search, MapPin, Sparkles, ArrowRight, BookOpen, 
  AlertCircle, Eye, Info, Calendar, Anchor, Thermometer, 
  Cloud, Sun, Wind, CloudRain, ChevronRight, HelpCircle, 
  Hotel, Layers, Clock, Globe, ShieldCheck, Tag, Phone,
  Mail, MessageSquare, DollarSign, Check, Star, ThumbsUp,
  Camera, Video, Play, Send, User, ChevronDown, Award,
  ShieldAlert, Briefcase, Heart, ArrowLeft, HeartHandshake, CheckCircle2
} from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { 
  getSiteContent, getHotels, 
  Destination, ActivityItem, TourItem, Attraction 
} from '../lib/cmsStore';
import { getBlogPostsFromStorage } from './BlogDetail';
import { supabase } from '../lib/supabase';
import { syncLeadToCRM } from '../lib/crm';
import { showToast } from '../components/ToastNotification';
import { useAnalytics } from '../context/AnalyticsContext';

// Pre-defined static Categories metadata
const CATEGORIES = [
  {
    id: 'northern',
    name: 'Northern Tanzania',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    description: 'Venture into the heart of the wild. Witness the Great Wildebeest Migration in the Serengeti, descend into the pristine Ngorongoro Crater, stand on Mount Kilimanjaro, and experience epic wildlife safaris.',
    tagline: 'Classic Wildlife Safaris, Volcanic Craters & Snowy Peaks',
    destCount: 7,
    badge: 'Epic Northern Circuit'
  },
  {
    id: 'zanzibar',
    name: 'Zanzibar Archipelago',
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Paradise calling. Bask on the sun-bleached sands of Unguja, dive the marine networks of Pemba, and swim with whale sharks in Mafia Island.',
    tagline: 'Pristine Beaches & Exotic Spice Cultures',
    destCount: 3,
    badge: 'Tropical Swahili Coast'
  },
  {
    id: 'southern',
    name: 'Southern Tanzania',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    description: 'Explore wild, untouched, and dramatic safari landscapes. Track apex predators in Nyerere (Selous), Ruaha, and Mikumi National Parks, far away from the heavy tourist crowds.',
    tagline: 'Remote Wilderness, Wild Rivers & Authentic Bush Tracking',
    destCount: 3,
    badge: 'Untamed Southern Circuit'
  }
];

export default function Destinations({ navigate }: { navigate: (page: Page) => void }) {
  const { trackInquirySend, trackEngagement } = useAnalytics();

  // Load current dynamic state
  const [siteContent, setSiteContent] = useState(getSiteContent());
  const [destinations, setDestinations] = useState<Destination[]>(siteContent.destinations || []);
  const [activities, setActivities] = useState<ActivityItem[]>(siteContent.activities || []);
  const [tours, setTours] = useState<TourItem[]>(siteContent.tours || []);
  const [hotels, setHotels] = useState(getHotels());
  const [blogs, setBlogs] = useState<any[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>(siteContent.attractions || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [activeGridTab, setActiveGridTab] = useState<'all' | 'safari' | 'zanzibar' | 'kilimanjaro'>('all');

  // Navigation states linked to URL Hash
  const [currentRegionId, setCurrentRegionId] = useState<string | null>(null);
  const [currentDestId, setCurrentDestId] = useState<string | null>(null);
  const [currentAttractionId, setCurrentAttractionId] = useState<string | null>(null);

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

  useEffect(() => {
    // Sync live CMS data
    const content = getSiteContent();
    setSiteContent(content);
    setDestinations(content.destinations || []);
    setActivities(content.activities || []);
    setTours(content.tours || []);
    setHotels(getHotels());
    setAttractions(content.attractions || []);

    try {
      const blogData = getBlogPostsFromStorage();
      const blogList = Object.keys(blogData).map(key => ({
        id: key,
        title: blogData[key].title || key,
        ...blogData[key]
      }));
      setBlogs(blogList);
    } catch (e) {
      console.warn("Failed to load blogs inside Destinations page", e);
    }

    // Hash change handler
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('destinations/region/')) {
        setCurrentRegionId(hash.split('/')[2]);
        setCurrentDestId(null);
        setCurrentAttractionId(null);
      } else if (hash.startsWith('destinations/attraction/')) {
        setCurrentAttractionId(hash.split('/')[2]);
        setCurrentDestId(null);
        setCurrentRegionId(null);
      } else if (hash.startsWith('destinations/') && hash !== 'destinations') {
        setCurrentDestId(hash.split('/')[1]);
        setCurrentRegionId(null);
        setCurrentAttractionId(null);
      } else {
        setCurrentRegionId(null);
        setCurrentDestId(null);
        setCurrentAttractionId(null);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Helpers to resolve parent relationships
  const selectedCategory = useMemo(() => {
    if (!currentRegionId) return null;
    return CATEGORIES.find(c => c.id === currentRegionId);
  }, [currentRegionId]);

  const currentDest = useMemo(() => {
    if (!currentDestId) return null;
    return destinations.find(d => d.id === currentDestId);
  }, [destinations, currentDestId]);

  const currentAttraction = useMemo(() => {
    if (!currentAttractionId) return null;
    return attractions.find(a => a.id === currentAttractionId);
  }, [attractions, currentAttractionId]);

  // Maps which destinations fall into which Category
  const filteredDestinationsForRegion = useMemo(() => {
    if (!currentRegionId) return [];
    if (currentRegionId === 'northern') {
      return destinations.filter(d => 
        ['serengeti', 'ngorongoro', 'tarangire', 'manyara', 'kilimanjaro', 'meru', 'lengai'].includes(d.id) || 
        d.region === 'northern' || d.region === 'mountain'
      );
    }
    if (currentRegionId === 'southern') {
      return destinations.filter(d => 
        ['selous', 'nyerere', 'ruaha', 'mikumi'].includes(d.id) || 
        d.region === 'southern' || d.region === 'western'
      );
    }
    if (currentRegionId === 'zanzibar') {
      return destinations.filter(d => 
        d.region === 'zanzibar' || ['unguja', 'pemba', 'mafia'].includes(d.id)
      );
    }
    return [];
  }, [destinations, currentRegionId]);

  // Destination page sub-elements
  const relatedAttractions = useMemo(() => {
    if (!currentDest) return [];
    return attractions.filter(a => a.destinationId === currentDest.id);
  }, [attractions, currentDest]);

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

  // Global search inside registry
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();

    const matchedAttractions = attractions.filter(a => 
      a.name.toLowerCase().includes(query) || 
      a.description.toLowerCase().includes(query) ||
      a.location.toLowerCase().includes(query)
    ).map(a => ({ ...a, type: 'attraction' }));

    const matchedDestinations = destinations.filter(d => 
      d.name.toLowerCase().includes(query) || 
      d.description.toLowerCase().includes(query)
    ).map(d => ({ ...d, type: 'destination' }));

    return [...matchedDestinations, ...matchedAttractions];
  }, [searchQuery, attractions, destinations]);

  // Dynamic Showcase categorized filters
  const dynamicSafariDestinations = useMemo(() => {
    const safariIds = ['serengeti', 'ngorongoro', 'tarangire', 'manyara', 'arusha', 'nyerere', 'ruaha', 'mikumi', 'selous', 'udzungwa', 'kitulo', 'gombe', 'seronera-valley', 'mara-river-crossing', 'crater-floor'];
    return destinations.filter(d => 
      safariIds.includes(d.id) || d.region === 'northern' || d.region === 'southern' || d.region === 'western'
    ).filter(d => !['kilimanjaro', 'meru', 'lengai', 'uhuru-peak'].includes(d.id));
  }, [destinations]);

  const dynamicZanzibarDestinations = useMemo(() => {
    const zanzibarIds = ['unguja', 'pemba', 'mafia', 'stone-town', 'prison-island', 'jozani-forest', 'mnemba-island', 'salaam-cave', 'spice-farms', 'dolphin-tours'];
    return destinations.filter(d => 
      zanzibarIds.includes(d.id) || d.region === 'zanzibar'
    );
  }, [destinations]);

  const dynamicKilimanjaroDestinations = useMemo(() => {
    const kilimanjaroIds = ['kilimanjaro', 'meru', 'lengai', 'uhuru-peak'];
    return destinations.filter(d => 
      kilimanjaroIds.includes(d.id) || d.region === 'mountain'
    );
  }, [destinations]);

  const displayedDestinations = useMemo(() => {
    if (activeGridTab === 'safari') return dynamicSafariDestinations;
    if (activeGridTab === 'zanzibar') return dynamicZanzibarDestinations;
    if (activeGridTab === 'kilimanjaro') return dynamicKilimanjaroDestinations;
    return destinations;
  }, [activeGridTab, destinations, dynamicSafariDestinations, dynamicZanzibarDestinations, dynamicKilimanjaroDestinations]);

  const getDestinationCategoryInfo = (destId: string, destRegion?: string) => {
    const northernIds = ['serengeti', 'ngorongoro', 'tarangire', 'manyara', 'kilimanjaro', 'meru', 'lengai'];
    const southernIds = ['selous', 'nyerere', 'ruaha', 'mikumi'];
    const zanzibarIds = ['unguja', 'pemba', 'mafia'];

    if (northernIds.includes(destId) || destRegion === 'northern' || destRegion === 'mountain') {
      return { label: 'Northern Tanzania', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
    if (southernIds.includes(destId) || destRegion === 'southern' || destRegion === 'western') {
      return { label: 'Southern Tanzania', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { label: 'Zanzibar Archipelago', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
  };

  // Enquiry Form submission handler
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySubmitted(true);

    const totalGuests = parseInt(enquiryForm.adults || '1') + parseInt(enquiryForm.children || '0');
    const reference = `ZTR-DST-${Date.now().toString().slice(-6)}`;
    const productSelection = currentAttraction 
      ? `Attraction Visit: ${currentAttraction.name}` 
      : currentDest?.name 
      ? `Curated Trip: ${currentDest.name}` 
      : 'Custom Tanzania Holiday';

    try {
      await supabase.from('contact_submissions').insert([
        {
          name: enquiryForm.name.trim(),
          email: enquiryForm.email.trim() || null,
          whatsapp_number: enquiryForm.phone.trim(),
          subject: `Discovery Enquiry: ${productSelection}`,
          message: `Date: ${enquiryForm.date || 'TBD'}\nAdults: ${enquiryForm.adults}\nChildren: ${enquiryForm.children}\nBudget Bracket: ${enquiryForm.budget}\nLuxury Tier: ${enquiryForm.tier}\nLanguage: ${enquiryForm.language}\nSpecial Request: ${enquiryForm.message || 'None'}`
        }
      ]);
    } catch (err) {
      console.warn('Supabase contact submission failed:', err);
    }

    try {
      const bookingPayload = {
        id: reference,
        full_name: enquiryForm.name.trim(),
        email: enquiryForm.email.trim(),
        whatsapp_number: enquiryForm.phone.trim(),
        number_of_guests: totalGuests,
        tour_name: productSelection,
        preferred_date: enquiryForm.date || new Date().toISOString().split('T')[0],
        pickup_location: 'Arriving Terminal (Zanzibar/Tanzania)',
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
          pickup_location: 'Terminal Arrival Desk',
          status: 'pending',
          details: bookingPayload
        }
      ]);

      const existingBackup = JSON.parse(localStorage.getItem('ztr_local_bookings_backup') || '[]');
      localStorage.setItem('ztr_local_bookings_backup', JSON.stringify([bookingPayload, ...existingBackup]));

      const currentList = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
      localStorage.setItem('ztr_bookings', JSON.stringify([bookingPayload, ...currentList]));
    } catch (err) {
      console.warn('Supabase bookings insert failed:', err);
    }

    try {
      syncLeadToCRM({
        source: 'contact_form',
        fullName: enquiryForm.name.trim(),
        email: enquiryForm.email.trim() || null,
        whatsappNumber: enquiryForm.phone.trim(),
        subject: `Enquiry - ${productSelection}`,
        message: `Date: ${enquiryForm.date || 'TBD'} | Guests: ${totalGuests} | Budget: ${enquiryForm.budget}\nNotes: ${enquiryForm.message || 'None'}`
      });
    } catch (err) {
      console.warn('Lead CRM sync failed:', err);
    }

    showToast('Your custom booking enquiry has been saved and synced.', 'success');

    // Trigger WhatsApp compilation
    const whatsappNum = siteContent.contact?.whatsapp?.replace(/\s+/g, '') || '255629506063';
    const text = `Hi Zanzibar Trip & Relax! I am interested in booking: *${productSelection}*.

*My Details:*
- *Arrival Date:* ${enquiryForm.date || 'TBD'}
- *Adults/Children:* ${enquiryForm.adults} / ${enquiryForm.children}
- *Budget Bracket:* ${enquiryForm.budget}
- *Luxury Tier Style:* ${enquiryForm.tier}
- *Language:* ${enquiryForm.language}
- *My Note:* ${enquiryForm.message || 'None specified.'}

*Contact:*
- *Name:* ${enquiryForm.name}
- *Email:* ${enquiryForm.email}
- *Phone:* ${enquiryForm.phone}

Please help me tailor this absolute dream itinerary!`;

    window.open(`https://api.whatsapp.com/send?phone=${whatsappNum}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const scrollToEnquiry = () => {
    document.getElementById('enquiry-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#020C1F] min-h-screen text-slate-100 font-sans pb-16 selection:bg-[#D4A017] selection:text-[#020C1F]">
      
      {/* ========================================================
          STAGE 4: ATTRACTION DETAILS PAGE
          ======================================================== */}
      {currentAttraction && (
        <div className="animate-fade-in space-y-12">
          {/* Header Banner */}
          <div className="relative h-[65vh] min-h-[450px] w-full flex items-end">
            <img 
              src={currentAttraction.image} 
              alt={currentAttraction.name} 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020C1F] via-[#020C1F]/60 to-black/30" />
            
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 relative z-10">
              <button 
                onClick={() => window.location.hash = `#destinations/${currentAttraction.destinationId}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl mb-6 backdrop-blur-md transition-all border border-white/10"
              >
                <ArrowLeft size={14} />
                <span>Back to {destinations.find(d => d.id === currentAttraction.destinationId)?.name || 'Destination'}</span>
              </button>
              
              <div className="space-y-3">
                <span className="bg-[#D4A017] text-[#020C1F] text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full">
                  POPULAR ATTRACTION
                </span>
                <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase">
                  {currentAttraction.name}
                </h1>
                <p className="text-slate-300 font-light text-sm sm:text-base max-w-xl flex items-center gap-2">
                  <MapPin size={16} className="text-[#D4A017]" />
                  <span>{currentAttraction.location || 'Zanzibar Archipelago, Tanzania'}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left/Middle: About, map and things to do */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#0A1224] border border-white/5 p-6 sm:p-8 rounded-3xl space-y-6">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
                  <Info className="text-[#D4A017]" size={20} />
                  <span>About {currentAttraction.name}</span>
                </h2>
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line font-light">
                  {currentAttraction.description || "An absolute must-visit location that represents the exquisite beauty, heritage, and spirit of Zanzibar."}
                </p>
              </div>

              {/* Things to do */}
              {currentAttraction.thingsToDo && currentAttraction.thingsToDo.length > 0 && (
                <div className="bg-[#0A1224] border border-white/5 p-6 sm:p-8 rounded-3xl space-y-4">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-[#D4A017]" size={18} />
                    <span>Key Highlights & Things to Do</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentAttraction.thingsToDo.map((thing, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <Check className="text-[#D4A017] mt-0.5 shrink-0" size={16} />
                        <span className="text-xs text-slate-300 font-medium">{thing}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Map */}
              <div className="bg-[#0A1224] border border-white/5 p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Globe className="text-[#D4A017]" size={18} />
                  <span>Location Map</span>
                </h3>
                <div className="rounded-2xl overflow-hidden h-72 border border-white/5 relative">
                  <iframe 
                    src={currentAttraction.mapUrl || `https://maps.google.com/maps?q=${encodeURIComponent(currentAttraction.name + ' ' + (currentAttraction.location || 'Zanzibar') + ' Tanzania')}&t=&z=12&ie=UTF8&iwloc=&output=embed`} 
                    className="w-full h-full border-0" 
                    allowFullScreen={true} 
                    loading="lazy" 
                  />
                </div>
              </div>
            </div>

            {/* Right Side: Quick Enquiry Box & Related Tours */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#0A1224] to-[#0d1830] border border-[#D4A017]/30 p-6 rounded-3xl text-center space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4A017]/5 rounded-full blur-2xl" />
                <h3 className="text-lg font-serif font-bold text-white uppercase tracking-tight">Experience This Live</h3>
                <p className="text-xs text-slate-400 font-light">
                  Let us design a custom full-day tour including private transfer, expert local guide, and lunch.
                </p>
                <button 
                  onClick={() => {
                    setEnquiryForm(prev => ({
                      ...prev,
                      message: `I would love to book a guided experience to see ${currentAttraction.name}! Please provide pricing and availability.`
                    }));
                    scrollToEnquiry();
                  }}
                  className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black uppercase text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar size={14} />
                  <span>Book Experience Now</span>
                </button>
              </div>

              {/* Handpicked Tours */}
              {currentAttraction.relatedTours && currentAttraction.relatedTours.length > 0 && (
                <div className="bg-[#0A1224] border border-white/5 p-6 rounded-3xl space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Handpicked Packages</h4>
                  <div className="space-y-3">
                    {currentAttraction.relatedTours.map((tour, idx) => (
                      <div key={idx} className="bg-white/5 p-3.5 rounded-2xl border border-white/5 space-y-2">
                        <span className="text-[10px] text-[#D4A017] font-bold uppercase tracking-wider block">RECOMMENDED TOUR</span>
                        <p className="text-xs font-bold text-slate-200">{tour}</p>
                        <button 
                          onClick={() => {
                            setEnquiryForm(prev => ({
                              ...prev,
                              message: `I am highly interested in booking the tour package: "${tour}" which features ${currentAttraction.name}. Please share rates.`
                            }));
                            scrollToEnquiry();
                          }}
                          className="text-[#D4A017] hover:text-[#b8860b] text-[10px] font-bold flex items-center gap-1 transition-colors uppercase cursor-pointer"
                        >
                          <span>Enquire Package</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 3: DETAILED DESTINATION LANDING PAGE VIEW (e.g., Unguja)
          ======================================================== */}
      {currentDest && !currentAttraction && (
        <div className="animate-fade-in space-y-16">
          {/* Hero Section */}
          <div className="relative h-[80vh] min-h-[500px] w-full flex items-end overflow-hidden">
            <img 
              src={currentDest.image} 
              alt={currentDest.name} 
              className="absolute inset-0 w-full h-full object-cover transform scale-100 hover:scale-105 transition-all duration-10000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020C1F] via-[#020C1F]/60 to-black/30" />
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 relative z-10 space-y-4">
              <button 
                onClick={() => window.location.hash = `#destinations/region/${currentDest.region || 'zanzibar'}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md transition-all border border-white/10"
              >
                <ArrowLeft size={14} />
                <span>Back to {CATEGORIES.find(c => c.id === currentDest.region)?.name || 'Region Overview'}</span>
              </button>

              <div className="space-y-2">
                <span className="bg-[#D4A017] text-[#020C1F] text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full">
                  CURATED DESTINATION
                </span>
                <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase leading-none">
                  {currentDest.name}
                </h1>
                {currentDest.tagline && (
                  <p className="text-[#D4A017] text-sm sm:text-lg font-light tracking-wide max-w-2xl">
                    {currentDest.tagline}
                  </p>
                )}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl pt-4">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Best Time</span>
                  <span className="text-xs font-bold text-white">{currentDest.bestTime || 'June to October'}</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Wildlife Focus</span>
                  <span className="text-xs font-bold text-white">{currentDest.wildlife || 'Rich Marine & Spices'}</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Ideal Duration</span>
                  <span className="text-xs font-bold text-white">{currentDest.duration || '3 - 5 Days'}</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Rating</span>
                    <span className="text-xs font-bold text-white">4.9 / 5.0</span>
                  </div>
                  <Star size={14} className="text-[#D4A017] fill-[#D4A017]" />
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* About & Intro Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0A1224] border border-white/5 p-6 sm:p-8 rounded-3xl space-y-4">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
                    <Info className="text-[#D4A017]" size={20} />
                    <span>Welcome to {currentDest.name}</span>
                  </h2>
                  <p className="text-slate-300 leading-relaxed text-sm font-light">
                    {currentDest.description}
                  </p>
                  
                  {/* Detailed features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5 mt-4 text-xs">
                    <div>
                      <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[10px] text-[#D4A017]">Aesthetic & Vibe</h4>
                      <p className="text-slate-400 font-light">{currentDest.tag || 'Clove scent, turquoise lagoons, ancient masonry, trade histories.'}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-[10px] text-[#D4A017]">Top Excursion Focus</h4>
                      <p className="text-slate-400 font-light">Beach relaxation, historical walking tours, dynamic diving, and wildlife encounters.</p>
                    </div>
                  </div>
                </div>

                {/* Google Map Section */}
                <div className="bg-[#0A1224] border border-white/5 p-6 rounded-3xl space-y-4">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <Globe className="text-[#D4A017]" size={18} />
                    <span>Explore Geographic Map</span>
                  </h3>
                  <div className="rounded-2xl overflow-hidden h-72 border border-white/5 relative">
                    <iframe 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(currentDest.name + ' Zanzibar Tanzania')}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-0" 
                      allowFullScreen={true} 
                      loading="lazy" 
                    />
                  </div>
                </div>
              </div>

              {/* Right panel: weather widget & quick booking action */}
              <div className="space-y-6">
                {/* Weather widget */}
                <div className="bg-[#0A1224] border border-white/5 p-6 rounded-3xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                    <span>Live Seasons Planner</span>
                    <Sun className="text-[#D4A017] animate-spin" style={{ animationDuration: '30s' }} size={16} />
                  </h3>
                  
                  <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <Thermometer className="text-[#D4A017]" size={20} />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Average Temp</span>
                      <span className="text-xs font-bold text-white">28°C / 82°F (Humid Sea Breeze)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Coastal regions feature dry cool winter winds between June & October, while local rains typically settle between March & May.
                  </p>
                </div>

                {/* Action CTA */}
                <div className="bg-gradient-to-br from-[#0A1224] to-[#0b1731] border border-[#D4A017]/30 p-6 rounded-3xl text-center space-y-4">
                  <h3 className="text-base font-serif font-bold text-white uppercase">Tailor Your Trip</h3>
                  <p className="text-xs text-slate-400 font-light">
                    Have our localized travel desk curate the perfect, seamless flight/boat schedules, lodges, and safaris for you.
                  </p>
                  <button 
                    onClick={scrollToEnquiry}
                    className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black uppercase text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Enquire This Destination
                  </button>
                </div>
              </div>
            </div>

            {/* Stage 3.5: Popular Attractions Grid */}
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[#D4A017] text-[10px] uppercase font-black tracking-widest block">HIGHLIGHT EXCURSIONS</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-black text-white uppercase tracking-tight">
                  Popular Attractions in {currentDest.name}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xl font-light">
                  Click any attraction to explore photos, map location, highlights, and custom schedules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedAttractions.map(attr => (
                  <div 
                    key={attr.id} 
                    onClick={() => window.location.hash = `#destinations/attraction/${attr.id}`}
                    className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden group hover:border-[#D4A017]/30 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                      <img src={attr.image} alt={attr.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1224] via-transparent to-transparent" />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5 group-hover:text-[#D4A017] transition-colors">
                          <span>{attr.name}</span>
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                        </h4>
                        <p className="text-[10px] text-[#D4A017] font-medium">{attr.location || currentDest.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-3 font-light leading-relaxed">
                          {attr.description}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 group-hover:text-white font-bold uppercase tracking-wider flex items-center gap-1 mt-2">
                        <span>Explore Attraction</span>
                        <ArrowRight size={10} />
                      </span>
                    </div>
                  </div>
                ))}

                {relatedAttractions.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-[#0A1224] rounded-3xl border border-white/5">
                    <Sparkles size={24} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-light">No custom attractions created yet. Add them in the Admin Dashboard!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activities Module */}
            {relatedActivities.length > 0 && (
              <div className="space-y-6 border-t border-white/5 pt-12">
                <div className="space-y-1">
                  <span className="text-[#D4A017] text-[10px] uppercase font-black tracking-widest block">OUTDOOR ADVENTURES</span>
                  <h3 className="text-2xl font-serif font-bold text-white uppercase">Curated Local Activities</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {relatedActivities.map(act => (
                    <div key={act.id} className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden p-4 space-y-3">
                      <img src={act.image} alt={act.name} className="h-28 w-full object-cover rounded-xl" />
                      <h4 className="text-xs font-bold text-white">{act.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-light">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Tours & Holiday Packages */}
            {relatedTours.length > 0 && (
              <div className="space-y-6 border-t border-white/5 pt-12">
                <div className="space-y-1">
                  <span className="text-[#D4A017] text-[10px] uppercase font-black tracking-widest block">BEST SELLING EXCURSIONS</span>
                  <h3 className="text-2xl font-serif font-bold text-white uppercase">Recommended Multi-Day Packages</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedTours.map(tour => (
                    <div key={tour.id} className="bg-[#0A1224] border border-white/5 p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="h-24 w-24 rounded-2xl bg-slate-900 shrink-0 overflow-hidden">
                        <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <span className="bg-white/5 text-slate-400 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded">
                          {tour.duration} Package
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-200">{tour.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 font-light">{tour.description}</p>
                        <div className="flex items-center gap-4 pt-2">
                          <button 
                            onClick={() => {
                              setEnquiryForm(prev => ({
                                ...prev,
                                message: `I would love to receive details and customize the tour package: "${tour.title}". Please advise.`
                              }));
                              scrollToEnquiry();
                            }}
                            className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Book Package
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Premium Hotels Grid */}
            {relatedHotels.length > 0 && (
              <div className="space-y-6 border-t border-white/5 pt-12">
                <div className="space-y-1">
                  <span className="text-[#D4A017] text-[10px] uppercase font-black tracking-widest block">HANDPICKED LUXURY LODGES</span>
                  <h3 className="text-2xl font-serif font-bold text-white uppercase">Where to Stay</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedHotels.map(h => (
                    <div key={h.id} className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between">
                      <div className="h-40 w-full bg-slate-900 relative">
                        <img src={h.image || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80'} alt={h.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-[9px] text-[#D4A017] uppercase font-bold border border-white/5">
                          {h.category || 'Luxury'}
                        </div>
                      </div>
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="text-xs sm:text-sm font-bold text-white">{h.name}</h4>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <MapPin size={10} className="text-[#D4A017]" />
                            <span>{h.location}</span>
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-3 pt-1 font-light">{h.description}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setEnquiryForm(prev => ({
                              ...prev,
                              message: `I am interested in booking accommodation at: ${h.name}. Please provide rates.`
                            }));
                            scrollToEnquiry();
                          }}
                          className="w-full bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold py-2 rounded-xl transition-all border border-white/5 mt-4 uppercase cursor-pointer"
                        >
                          Book Lodge Room
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery Grid */}
            <div className="space-y-6 border-t border-white/5 pt-12">
              <div className="space-y-1">
                <span className="text-[#D4A017] text-[10px] uppercase font-black tracking-widest block">IMMERSIVE SNAPSHOTS</span>
                <h3 className="text-2xl font-serif font-bold text-white uppercase">Photo Gallery</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="h-32 bg-slate-900 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                <div className="h-32 bg-slate-900 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                <div className="h-32 bg-slate-900 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                <div className="h-32 bg-slate-900 rounded-2xl overflow-hidden"><img src="https://images.unsplash.com/photo-1589553460730-dfbeb6543e8a?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
              </div>
            </div>

            {/* Local FAQs Section */}
            <div className="space-y-6 border-t border-white/5 pt-12">
              <h3 className="text-xl font-serif font-bold text-white uppercase">Frequently Asked Questions</h3>
              <div className="space-y-3 max-w-3xl">
                {[
                  { q: "What is the best way to get to this destination?", a: "Private airport transfers can be organized directly to your lodge. Domestic commercial flights operate regularly between Arusha, Dar es Salaam, and Zanzibar." },
                  { q: "What should I pack for this trip?", a: "For beaches, pack light breathable cotton wear, swimsuits, reef sandals, and strong sunscreen. For wildlife safaris, neutral colored trousers, sun hats, and camera gear are highly recommended." },
                  { q: "Are guided excursions safe?", a: "Absolutely. All tours are escorted by seasoned private licensed English-speaking rangers and local guides to ensure perfect security and informative trips." }
                ].map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden">
                      <button 
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left p-4 sm:p-5 flex justify-between items-center text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={16} className={`text-[#D4A017] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5 bg-white/2"
                          >
                            <p className="p-4 sm:p-5 text-xs text-slate-400 font-light leading-relaxed">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Customer Reviews */}
            <div className="space-y-6 border-t border-white/5 pt-12">
              <div className="space-y-1">
                <span className="text-[#D4A017] text-[10px] uppercase font-black tracking-widest block">AUTHENTIC FEEDBACK</span>
                <h3 className="text-2xl font-serif font-bold text-white uppercase">Traveler Experiences</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Eleanor Vance", country: "United Kingdom", text: "Our experience was absolutely flawless. The airport pickups, the private guides in Stone Town, and the boat excursions were completely streamlined and incredibly safe.", rating: 5 },
                  { name: "Julian Roquet", country: "France", text: "A spectacular itinerary created by real professionals. They managed to perfectly coordinate our safari in Serengeti with five days of relaxing beaches in Zanzibar.", rating: 5 }
                ].map((r, i) => (
                  <div key={i} className="bg-[#0A1224] border border-white/5 p-5 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{r.name}</span>
                        <span className="text-[10px] text-slate-400">{r.country}</span>
                      </div>
                      <div className="flex gap-0.5 text-[#D4A017]">
                        {Array.from({ length: r.rating }).map((_, starIdx) => (
                          <Star key={starIdx} size={10} className="fill-[#D4A017]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-light italic leading-relaxed">
                      "{r.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 2: REGION OVERVIEW PAGE (e.g., Zanzibar displayed sub-destinations)
          ======================================================== */}
      {currentRegionId && !currentDestId && !currentAttractionId && (
        <div className="animate-fade-in space-y-12">
          {/* Hero Banner */}
          {selectedCategory && (
            <div className="relative h-[60vh] min-h-[400px] w-full flex items-end">
              <img src={selectedCategory.image} alt={selectedCategory.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020C1F] via-[#020C1F]/60 to-black/30" />
              
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 relative z-10">
                <button 
                  onClick={() => window.location.hash = ''}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl mb-6 backdrop-blur-md transition-all border border-white/10"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Categories</span>
                </button>
                
                <div className="space-y-3">
                  <span className="bg-[#D4A017] text-[#020C1F] text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full">
                    {selectedCategory.badge}
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase">
                    {selectedCategory.name}
                  </h1>
                  <p className="text-slate-300 font-light text-sm sm:text-base max-w-2xl leading-relaxed">
                    {selectedCategory.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sub Destinations List */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="space-y-1">
              <span className="text-[#D4A017] text-[10px] uppercase font-black tracking-widest block">CURATED DIRECTORY</span>
              <h2 className="text-2xl font-serif font-bold text-white uppercase">Choose Your Specific Landing Destination</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinationsForRegion.map(dest => (
                <div 
                  key={dest.id}
                  onClick={() => window.location.hash = `#destinations/${dest.id}`}
                  className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden group hover:border-[#D4A017]/30 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="h-48 w-full bg-slate-900 overflow-hidden relative">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#D4A017] transition-all flex items-center justify-between">
                        <span>{dest.name}</span>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all text-[#D4A017]" />
                      </h3>
                      <p className="text-xs text-slate-400 font-light line-clamp-3 leading-relaxed">
                        {dest.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>{dest.bestTime || 'Year-Round'}</span>
                      <span className="text-[#D4A017]">Explore Guide</span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredDestinationsForRegion.length === 0 && (
                <div className="col-span-full py-16 text-center bg-[#0A1224] rounded-3xl border border-white/5">
                  <Compass size={32} className="text-slate-600 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-slate-400 font-light">No custom destinations created for this region yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 1: MAIN DESTINATIONS LANDING (Categories Overview)
          ======================================================== */}
      {!currentRegionId && !currentDestId && !currentAttractionId && (
        <div className="animate-fade-in space-y-16">
          {/* Header Banner */}
          <div className="relative bg-[#020C1F] overflow-hidden pt-20 pb-12 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
              <span className="bg-[#D4A017]/10 text-[#D4A017] text-[10px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full border border-[#D4A017]/25">
                CURATED TRAVEL EXPERIENCE
              </span>
              <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase leading-none">
                World of Discovery
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
                Choose your specific path. Discover legendary wildlife reserves, tropical spice islands, and snowy volcanic peaks in the ultimate Swahili Coast holiday.
              </p>

              {/* Search Registry widget */}
              <div className="max-w-md mx-auto pt-4 relative">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search attractions (e.g. Stone Town, Serengeti)..."
                    className="w-full bg-[#0A1224] border border-white/5 py-3.5 pl-11 pr-4 rounded-2xl text-xs focus:border-[#D4A017] outline-none text-white shadow-xl transition-all font-light"
                  />
                </div>

                {/* Instant search dropdown dropdown */}
                {searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A1224] border border-white/10 rounded-2xl shadow-2xl z-50 text-left max-h-80 overflow-y-auto overflow-x-hidden p-2">
                    {searchResults.map((item: any) => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          setSearchQuery('');
                          if (item.type === 'attraction') {
                            window.location.hash = `#destinations/attraction/${item.id}`;
                          } else {
                            window.location.hash = `#destinations/${item.id}`;
                          }
                        }}
                        className="p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer flex items-center justify-between border border-transparent hover:border-white/5"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{item.name}</span>
                          <span className="text-[10px] text-[#D4A017] font-bold uppercase tracking-wider block">
                            {item.type} • {item.location || item.region || 'Zanzibar'}
                          </span>
                        </div>
                        <ArrowRight size={12} className="text-slate-500" />
                      </div>
                    ))}

                    {searchResults.length === 0 && (
                      <p className="text-center text-xs text-slate-500 py-6 font-light">No matches found in our directory.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Simple Travel Categories Selection Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="space-y-1 text-center">
              <span className="text-[#D4A017] text-[10px] uppercase font-black tracking-widest block">CHOOSE REGION</span>
              <h2 className="text-2xl font-serif font-black text-white uppercase">Destination Categories</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CATEGORIES.map(category => (
                <div 
                  key={category.id}
                  onClick={() => window.location.hash = `#destinations/region/${category.id}`}
                  className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden group hover:border-[#D4A017]/30 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="h-64 w-full bg-slate-900 relative overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1224] via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-[9px] px-2.5 py-1 rounded-full font-bold text-[#D4A017] border border-white/5 uppercase tracking-widest">
                      {category.badge}
                    </span>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] text-[#D4A017] font-black uppercase tracking-wider block">
                        {category.tagline}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-white group-hover:text-[#D4A017] transition-colors uppercase tracking-tight">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-300 group-hover:text-white font-bold uppercase tracking-wider flex items-center gap-1 mt-4">
                      <span>Explore Region</span>
                      <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          
          </div>
      )}

      {/* ========================================================
          GLOBAL PROFESSIONAL BOOKING & ENQUIRY SECTION (Common to stages)
          ======================================================== */}
      {(currentDest || currentAttraction) && (
        <div id="enquiry-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5 mt-16">
          <div className="max-w-3xl mx-auto bg-[#0A1224] border border-white/5 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
            
            <div className="text-center space-y-2">
              <span className="text-[#D4A017] text-[10px] uppercase font-black tracking-widest block">INSTANT TAILORED QUOTE</span>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-white uppercase">Professional Booking Desk</h2>
              <p className="text-slate-400 text-xs font-light max-w-lg mx-auto">
                Submit your preferences below. Our expert travel operators will build, price, and sync your personalized itinerary blueprint.
              </p>
            </div>

            {enquirySubmitted ? (
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3 animate-scale-up">
                <CheckCircle2 className="text-emerald-400 mx-auto animate-bounce" size={32} />
                <h4 className="text-sm font-bold text-slate-200">Enquiry Received Successfully!</h4>
                <p className="text-xs text-slate-400 font-light max-w-sm mx-auto leading-relaxed">
                  We have secured your database reference code and synced it with our CRM. We are also redirecting you to WhatsApp for immediate personalized discussion.
                </p>
                <button 
                  onClick={() => setEnquirySubmitted(false)}
                  className="bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold px-4 py-2 rounded-xl transition-all border border-white/5 uppercase cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Your Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={enquiryForm.name}
                      onChange={e => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full bg-[#121B30] border border-white/5 p-3 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white text-slate-100 font-light"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">WhatsApp / Phone *</label>
                    <input 
                      type="tel" 
                      required
                      value={enquiryForm.phone}
                      onChange={e => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="e.g. +44 7911 123456"
                      className="w-full bg-[#121B30] border border-white/5 p-3 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white text-slate-100 font-light"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address (Optional)</label>
                    <input 
                      type="email" 
                      value={enquiryForm.email}
                      onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="e.g. eleanor@vance.com"
                      className="w-full bg-[#121B30] border border-white/5 p-3 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white text-slate-100 font-light"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Travel Date</label>
                    <input 
                      type="date" 
                      value={enquiryForm.date}
                      onChange={e => setEnquiryForm({ ...enquiryForm, date: e.target.value })}
                      className="w-full bg-[#121B30] border border-white/5 p-3 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white text-slate-100 font-light cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Adults</label>
                    <select 
                      value={enquiryForm.adults}
                      onChange={e => setEnquiryForm({ ...enquiryForm, adults: e.target.value })}
                      className="w-full bg-[#121B30] border border-white/5 p-3 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white cursor-pointer"
                    >
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9+'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Children</label>
                    <select 
                      value={enquiryForm.children}
                      onChange={e => setEnquiryForm({ ...enquiryForm, children: e.target.value })}
                      className="w-full bg-[#121B30] border border-white/5 p-3 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white cursor-pointer"
                    >
                      {['0', '1', '2', '3', '4', '5+'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Budget</label>
                    <select 
                      value={enquiryForm.budget}
                      onChange={e => setEnquiryForm({ ...enquiryForm, budget: e.target.value })}
                      className="w-full bg-[#121B30] border border-white/5 p-3 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white cursor-pointer"
                    >
                      {['Under $1,500', '$1,500 - $3,000', '$3,000 - $5,000', '$5,000+'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Service Tier</label>
                    <select 
                      value={enquiryForm.tier}
                      onChange={e => setEnquiryForm({ ...enquiryForm, tier: e.target.value })}
                      className="w-full bg-[#121B30] border border-white/5 p-3 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white cursor-pointer"
                    >
                      {['Classic Comfort', 'Superior Comfort', 'Luxury Enclave', 'Elite Signature'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Special Requirements & Travel Goals</label>
                  <textarea 
                    value={enquiryForm.message}
                    onChange={e => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    rows={4}
                    placeholder="Tell us about special requests, dietary goals, favorite animal species, physical limitations, or dynamic itinerary goals..."
                    className="w-full bg-[#121B30] border border-white/5 p-3 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white text-slate-100 font-light"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black uppercase tracking-wider text-xs py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Send size={14} />
                  <span>Submit Custom Enquires & Sync WhatsApp</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
