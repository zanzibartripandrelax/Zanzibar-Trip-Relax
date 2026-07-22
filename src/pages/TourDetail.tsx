import { useState, useEffect, useMemo } from 'react';
import { Page } from '../hooks/useHashRouter';
import { tours, Tour } from '../data/tours';
import { 
  Clock, Users, Star, Check, X, Shield, HelpCircle, MapPin, ArrowRight, ArrowLeft, 
  MessageCircle, Calendar, Compass, List, Image as ImageIcon, Sparkles, Quote, 
  ChevronDown, ChevronUp, ExternalLink, Download, CheckCircle2, Phone, Mail, Home as HomeIcon, MessageSquare
} from 'lucide-react';
import { getSiteContent } from '../lib/cmsStore';
import { ProgressiveImage } from '../components/ProgressiveImage';
import GuestReviews from '../components/GuestReviews';
import { useAnalytics } from '../context/AnalyticsContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTourReviews } from '../hooks/useTourReviews';
import { supabase } from '../lib/supabase';
import { showToast } from '../components/ToastNotification';

interface TourDetailProps {
  navigate: (page: Page, id?: string) => void;
}

export default function TourDetail({ navigate }: TourDetailProps) {
  const { trackWhatsAppClick } = useAnalytics();
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const slug = hash.replace('tour-detail/', '').replace('tours/', '');

  const cmsContent = getSiteContent() || { tours: [] };
  const dynamicTour = (cmsContent.tours || []).find(
    t => (t?.title || '').toLowerCase().replace(/\s+/g, '-') === slug || t?.id === slug
  );

  const staticTour = tours.find(st => 
    st.id === slug || 
    (st.name || '').toLowerCase().replace(/\s+/g, '-') === slug ||
    slug.includes(st.id) ||
    st.id.includes(slug) ||
    (slug.includes('safari-blue') && st.id === 'safari-blue') ||
    (slug.includes('mnemba') && st.id === 'mnemba-snorkeling') ||
    (slug.includes('stone-town') && st.id === 'stone-town') ||
    (slug.includes('prison-island') && st.id === 'prison-island') ||
    (slug.includes('spice-farm') && st.id === 'spice-farm') ||
    (slug.includes('jozani-forest') && st.id === 'jozani-forest') ||
    (slug.includes('dolphin') && st.id === 'dolphin-kizimkazi') ||
    (slug.includes('nakupenda') && st.id === 'nakupenda-sandbank') ||
    (slug.includes('fishing') && st.id === 'fishing-experience') ||
    (slug.includes('blue-lagoon') && st.id === 'blue-lagoon') ||
    (slug.includes('kuza') && st.id === 'cave-experience') ||
    (slug.includes('cave-experience') && st.id === 'cave-experience')
  ) || tours[0];
  
  // Merge static metadata with CMS overrides
  const tour = {
    ...staticTour,
    id: dynamicTour?.id || staticTour.id,
    name: dynamicTour?.title || staticTour.name,
    description: dynamicTour?.desc || staticTour.description,
    price: dynamicTour?.price || staticTour.price,
    duration: dynamicTour?.duration || staticTour.duration,
    image: dynamicTour?.img || staticTour.image,
    itinerary: (dynamicTour?.itinerary && dynamicTour.itinerary.length > 0) ? dynamicTour.itinerary : staticTour.itinerary,
    longDescription: dynamicTour?.longDescription || dynamicTour?.desc || staticTour.longDescription,
  };

  const { reviews, getAverageRating, totalReviews } = useTourReviews(tour.id);
  
  // Collapse itinerary by default (Rule 6)
  const [isItineraryExpanded, setIsItineraryExpanded] = useState(false);

  // Form input states for sticky booking card (Rule 2)
  const [bookingForm, setBookingForm] = useState({
    travelDate: '',
    guests: 2,
    hotel: '',
    whatsapp: '',
    email: '',
    specialRequests: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessPayload, setBookingSuccessPayload] = useState<any | null>(null);

  // Set default travel date (tomorrow)
  useEffect(() => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 2);
    setBookingForm(prev => ({
      ...prev,
      travelDate: tmr.toISOString().split('T')[0]
    }));

    // Pre-fill user data if available
    try {
      const savedUser = localStorage.getItem('ztr_returning_user_info');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setBookingForm(prev => ({
          ...prev,
          whatsapp: parsed.phone || parsed.whatsapp || prev.whatsapp,
          email: parsed.email || prev.email,
          hotel: parsed.pickupLocation || prev.hotel
        }));
      }
    } catch {}
  }, []);

  // Price calculations
  const basePriceNumber = useMemo(() => {
    const priceStr = String(tour.price || '75');
    const match = priceStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 75;
  }, [tour.price]);

  const pricePerPerson = basePriceNumber;
  const totalPrice = basePriceNumber * (bookingForm.guests || 1);

  // Convert custom itinerary lines into formatted timeline stages
  const parsedItinerary = tour.itinerary.map((step: any, index: number) => {
    if (typeof step === 'object' && step !== null && 'title' in step) {
      return step;
    }
    const str = String(step);
    const parts = str.split(' - ').map(p => p.trim());
    if (parts.length >= 3) {
      return { time: parts[0], title: parts[1], activity: parts.slice(2).join(' - ') };
    } else if (parts.length === 2) {
      return { time: `Phase ${index + 1}`, title: parts[0], activity: parts[1] };
    } else {
      return { time: `Step ${index + 1}`, title: str, activity: '' };
    }
  });

  // Recommended tours (Maximum 4 cards as per Rule 9)
  const relatedToursList = useMemo(() => {
    const filtered = tours.filter(t => t.id !== tour.id);
    return filtered.slice(0, 4);
  }, [tour.id]);

  // Dynamically update SEO Headers & Document Meta Tags
  useEffect(() => {
    if (tour && tour.seoMetadata) {
      document.title = `${tour.name} - Zanzibar Trip & Relax`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', tour.seoMetadata.desc);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = tour.seoMetadata.desc;
        document.head.appendChild(meta);
      }
    }
  }, [tour]);

  // Map location query for active destination (Rule 5)
  const destinationMapQuery = useMemo(() => {
    const nameLower = tour.name.toLowerCase();
    if (nameLower.includes('safari blue')) return 'Fumba Beach Zanzibar Tanzania';
    if (nameLower.includes('nakupenda')) return 'Nakupenda Sandbank Zanzibar Tanzania';
    if (nameLower.includes('mnemba')) return 'Mnemba Island Zanzibar Tanzania';
    if (nameLower.includes('stone town')) return 'Stone Town Zanzibar Tanzania';
    if (nameLower.includes('prison island')) return 'Changuu Island Zanzibar Tanzania';
    if (nameLower.includes('spice')) return 'Kizimbani Spice Farm Zanzibar Tanzania';
    if (nameLower.includes('jozani')) return 'Jozani Forest Zanzibar Tanzania';
    if (nameLower.includes('dolphin') || nameLower.includes('kizimkazi')) return 'Kizimkazi Zanzibar Tanzania';
    if (nameLower.includes('kilimanjaro')) return 'Machame Gate Kilimanjaro Tanzania';
    if (nameLower.includes('serengeti')) return 'Serengeti National Park Tanzania';
    if (nameLower.includes('ngorongoro')) return 'Ngorongoro Crater Tanzania';
    return `${tour.name} Zanzibar Tanzania`;
  }, [tour.name]);

  // Handle Sticky Booking Form Submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.travelDate || !bookingForm.hotel || !bookingForm.whatsapp) {
      showToast('Please fill in Travel Date, Hotel/Pickup, and WhatsApp number.', 'error');
      return;
    }

    setIsSubmitting(true);
    const bookingRef = `ZTR-${tour.id.toUpperCase().slice(0, 4)}-${Math.floor(10000 + Math.random() * 90000)}`;

    const bookingPayload = {
      id: bookingRef,
      reference: bookingRef,
      created_at: new Date().toISOString(),
      lead_traveler_name: 'Guest Traveler',
      lead_traveler_phone: bookingForm.whatsapp.trim(),
      lead_traveler_whatsapp: bookingForm.whatsapp.trim(),
      lead_traveler_email: bookingForm.email.trim() || 'Not provided',
      travel_date: bookingForm.travelDate,
      product_name: tour.name,
      product_category: tour.category || 'tour',
      adults_count: bookingForm.guests,
      children_count: 0,
      pickup_hotel: bookingForm.hotel.trim(),
      total_price: totalPrice,
      special_requests: bookingForm.specialRequests.trim() || 'Standard private booking',
      status: 'Pending Confirmation' // Status Rule 4
    };

    try {
      await supabase.from('bookings').insert([
        {
          reference_code: bookingRef,
          customer_name: 'Guest Traveler',
          customer_email: bookingForm.email.trim() || null,
          customer_phone: bookingForm.whatsapp.trim(),
          product_name: tour.name,
          product_category: tour.category || 'tour',
          travel_date: bookingForm.travelDate,
          guest_count: bookingForm.guests,
          pickup_location: bookingForm.hotel.trim(),
          total_price: totalPrice,
          payment_status: 'pending',
          status: 'Pending Confirmation',
          details: bookingPayload
        }
      ]);
    } catch (err) {
      console.warn('Supabase reservation insert skipped:', err);
    }

    try {
      const existing = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
      localStorage.setItem('ztr_bookings', JSON.stringify([bookingPayload, ...existing]));
      localStorage.setItem('ztr_local_bookings_backup', JSON.stringify([bookingPayload, ...existing]));
      localStorage.setItem('ztr_returning_user_info', JSON.stringify({
        whatsapp: bookingForm.whatsapp.trim(),
        email: bookingForm.email.trim(),
        pickupLocation: bookingForm.hotel.trim()
      }));
    } catch (err) {
      console.warn('Local backup skipped:', err);
    }

    setIsSubmitting(false);
    setBookingSuccessPayload(bookingPayload);
    showToast(`Reservation ${bookingRef} Submitted Successfully!`, 'success');
  };

  const handleDownloadSummary = () => {
    window.print();
  };

  const scrollToBooking = () => {
    const el = document.getElementById('sticky-booking-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('booking', `package=${encodeURIComponent(tour.name)}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 lg:pb-0">
      
      {/* 1. HERO SECTION (Rule 1: Clean & Professional, No clutter above fold) */}
      <section className="relative h-[65vh] md:h-[70vh] overflow-hidden bg-slate-950">
        {/* Floating Back Button */}
        <button
          type="button"
          onClick={() => navigate('tours')}
          className="absolute top-6 left-6 md:left-12 z-30 bg-white/90 hover:bg-white text-[#0B3B8C] hover:scale-105 active:scale-95 px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-lg border border-slate-150"
        >
          <ArrowLeft size={14} className="stroke-[3]" />
          <span>Back to Tours</span>
        </button>

        <ProgressiveImage src={tour.image} alt={tour.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <span className="inline-block bg-[#D4A017] text-[#020C1F] text-[10px] tracking-widest uppercase font-black px-3.5 py-1.5 rounded-full shadow-md">
                🌴 {tour.badge || tour.category} Excursion
              </span>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                {tour.name}
              </h1>
              
              <p className="text-slate-200 text-xs md:text-sm font-medium line-clamp-2 leading-relaxed max-w-2xl">
                {tour.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/90 text-xs font-semibold uppercase tracking-wider pt-1">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                  <Clock size={14} className="text-[#D4A017]" /> {tour.duration}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                  <Users size={14} className="text-[#D4A017]" /> {tour.groupSize || 'Private / Group'}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                  <Star size={14} className="text-[#D4A017] fill-[#D4A017]" /> 
                  {totalReviews > 0 ? getAverageRating() : '4.9'} / 5 (100+ Reviews)
                </span>
              </div>

              {/* Action Buttons in Hero (Rule 1) */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={scrollToBooking}
                  className="bg-[#D4A017] hover:bg-amber-400 text-[#020C1F] font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Book Now</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsItineraryExpanded(true);
                    const el = document.getElementById('itinerary-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl transition-all border border-white/20 backdrop-blur-sm cursor-pointer"
                >
                  View Full Itinerary
                </button>
              </div>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg shrink-0 text-center md:text-right">
              <span className="text-[10px] text-white/80 block font-bold tracking-widest uppercase">Price From</span>
              <p className="text-4xl font-black text-[#D4A017]">{tour.price}</p>
              <span className="text-[10px] text-emerald-300 font-semibold block mt-0.5">✓ Best Rate Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ label: 'Zanzibar Excursions', page: 'tours' }, { label: tour.name }]} navigate={navigate} />

      {/* MAIN CONTENT AREA */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Details (Col-8) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Quick Highlights Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0B3B8C]/5 border border-[#0B3B8C]/10 rounded-2xl p-5 flex items-center gap-4">
                <Calendar className="text-[#0B3B8C] w-8 h-8 shrink-0" />
                <div>
                  <span className="text-[10px] font-extrabold text-gray-400 block uppercase tracking-wider">Best Time To Visit</span>
                  <span className="text-sm font-bold text-[#0B3B8C]">{tour.bestTimeToVisit || 'Year-Round (All Seasons)'}</span>
                </div>
              </div>
              <div className="bg-[#D4A017]/5 border border-[#D4A017]/10 rounded-2xl p-5 flex items-center gap-4">
                <Compass className="text-[#D4A017] w-8 h-8 shrink-0" />
                <div>
                  <span className="text-[10px] font-extrabold text-gray-400 block uppercase tracking-wider">Conservation Focus</span>
                  <span className="text-sm font-bold text-[#0B3B8C]">100% Eco-Sensitive & Protected</span>
                </div>
              </div>
            </div>

            {/* Tour Overview Narrative */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Excursion Overview
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                {tour.longDescription}
              </p>
            </div>

            {/* Tour Highlights & Essential Info (Rule 7) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <Sparkles size={22} className="text-[#D4A017]" /> Tour Highlights & Details
              </h2>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4 border-b border-gray-100">
                {tour.highlights.map((hlt, i) => (
                  <li key={i} className="flex gap-2.5 text-xs md:text-sm text-gray-700 items-start">
                    <span className="bg-[#D4A017]/10 text-[#D4A017] rounded-lg p-1 shrink-0 mt-0.5">
                      <Check size={14} className="stroke-[3]" />
                    </span>
                    <span className="leading-relaxed font-semibold">{hlt}</span>
                  </li>
                ))}
              </ul>

              {/* Essential Logistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Duration</span>
                  <span className="font-bold text-[#0B3B8C] block">{tour.duration}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Languages</span>
                  <span className="font-bold text-[#0B3B8C] block">English, Swahili, Italian, French</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Pickup Area</span>
                  <span className="font-bold text-[#0B3B8C] block">All Zanzibar Hotels & Port</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Cancellation</span>
                  <span className="font-bold text-emerald-600 block">Free up to 48 Hours</span>
                </div>
              </div>
            </div>

            {/* ONE Clean Destination Map (Rule 5: Exactly 1 Google Map per destination page) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <MapPin className="text-[#D4A017]" size={22} /> Destination Map Location
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Live Google Map hotspot for {tour.name}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#D4A017] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full w-fit">
                  Google Maps Live Location
                </span>
              </div>

              {/* Single Clean Google Map iframe */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-[340px] shadow-sm bg-slate-900 relative">
                <iframe
                  title={`Destination Map - ${tour.name}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(destinationMapQuery)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Full Itinerary (Rule 6: Collapsed by default with toggle button) */}
            <div id="itinerary-section" className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Clock className="text-[#D4A017]" size={22} /> Full Program Itinerary
                </h2>
                
                <button
                  type="button"
                  onClick={() => setIsItineraryExpanded(!isItineraryExpanded)}
                  className="bg-[#0B3B8C]/5 hover:bg-[#0B3B8C]/10 text-[#0B3B8C] font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isItineraryExpanded ? 'Collapse Program' : 'View Full Itinerary'}</span>
                  {isItineraryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Itinerary Schedule View */}
              {isItineraryExpanded ? (
                <div className="relative border-l-2 border-neutral-100 ml-3 md:ml-6 pl-6 md:pl-10 space-y-8 animate-fade-in">
                  {parsedItinerary.map((step, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-[31px] md:-left-[47px] top-1 bg-white border-2 border-[#D4A017] rounded-full w-4 h-4 flex items-center justify-center">
                        <span className="bg-[#D4A017] w-1.5 h-1.5 rounded-full" />
                      </span>
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-widest bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md w-fit">
                            {step.time}
                          </span>
                          <h4 className="font-extrabold text-[#0B3B8C] text-sm md:text-base">
                            {step.title}
                          </h4>
                        </div>
                        {step.activity && (
                          <p className="text-gray-600 text-xs md:text-sm leading-relaxed font-medium pt-1">
                            {step.activity}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-6 text-center space-y-3 border border-slate-150">
                  <p className="text-xs text-slate-600 font-medium">
                    This excursion includes a comprehensive {parsedItinerary.length}-stage guided program.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsItineraryExpanded(true)}
                    className="bg-[#0B3B8C] hover:bg-[#082d6b] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>View Full Itinerary ({parsedItinerary.length} Steps)</span>
                    <ChevronDown size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* What is Covered (Included / Excluded) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                What is Covered
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-extrabold text-green-700 text-sm flex items-center gap-2 pb-2 border-b border-green-100">
                    <span className="bg-green-100 text-green-700 p-1 rounded-lg"><Check size={14} /></span> Included
                  </h3>
                  <ul className="space-y-2">
                    {tour.included.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600 font-medium">
                        <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-extrabold text-red-700 text-sm flex items-center gap-2 pb-2 border-b border-red-100">
                    <span className="bg-red-100 text-red-700 p-1 rounded-lg"><X size={14} /></span> Not Included
                  </h3>
                  <ul className="space-y-2">
                    {tour.excluded.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600 font-medium">
                        <X size={14} className="text-red-400 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* What to Bring */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-2xl font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <List className="text-[#D4A017]" size={22} /> What To Bring
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tour.whatToBring.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-neutral-100">
                    <span className="w-2 h-2 rounded-full bg-[#D4A017] shrink-0" />
                    <span className="text-xs font-bold text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancellation Policy & Terms */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-2xl font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <Shield className="text-[#D4A017]" size={22} /> Pickup Logistics & Cancellation Policy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <p className="font-bold uppercase text-[#0B3B8C] flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#D4A017]" />
                    <span>Hotel Pickup & Drop-Off</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Complimentary hotel pickup and drop-off is included for all major resorts in Stone Town, Nungwi, Kendwa, Kiwengwa, Matte, and Paje. Simply specify your hotel during secure checkout.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <p className="font-bold uppercase text-[#0B3B8C] flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#D4A017]" />
                    <span>Cancellation Policy</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    100% full refund for cancellations made up to 48 hours prior to your scheduled trip. Flexible rescheduling options available.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY BOOKING CARD (Rule 2: Always Visible Desktop Card) */}
          <div className="lg:col-span-4">
            <div id="sticky-booking-card" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl sticky top-24 space-y-5">
              
              <div className="border-b border-slate-150 pb-3 flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Price From</span>
                  <span className="text-3xl font-black text-[#0B3B8C]">{tour.price}</span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Pay Later on Arrival
                </span>
              </div>

              {/* STICKY BOOKING FORM (Rule 2) */}
              <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                
                {/* Travel Date */}
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Travel Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-slate-400" size={14} />
                    <input
                      type="date"
                      required
                      value={bookingForm.travelDate}
                      onChange={e => setBookingForm({ ...bookingForm, travelDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-9 pr-3 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#0B3B8C] transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* Number of Guests */}
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Number of Guests *</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 text-slate-400" size={14} />
                    <select
                      value={bookingForm.guests}
                      onChange={e => setBookingForm({ ...bookingForm, guests: parseInt(e.target.value, 10) || 1 })}
                      className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-9 pr-3 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#0B3B8C] transition-all cursor-pointer appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Hotel / Pickup Location */}
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Hotel / Pickup Location *</label>
                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-3 text-slate-400" size={14} />
                    <input
                      type="text"
                      required
                      value={bookingForm.hotel}
                      onChange={e => setBookingForm({ ...bookingForm, hotel: e.target.value })}
                      placeholder="e.g. Melia Resort Zanzibar or Stone Town Port"
                      className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-9 pr-3 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#0B3B8C] transition-all"
                    />
                  </div>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">WhatsApp Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={14} />
                    <input
                      type="tel"
                      required
                      value={bookingForm.whatsapp}
                      onChange={e => setBookingForm({ ...bookingForm, whatsapp: e.target.value })}
                      placeholder="e.g. +255 629 506 063"
                      className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-9 pr-3 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#0B3B8C] transition-all"
                    />
                  </div>
                </div>

                {/* Optional Email */}
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={14} />
                    <input
                      type="email"
                      value={bookingForm.email}
                      onChange={e => setBookingForm({ ...bookingForm, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-9 pr-3 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#0B3B8C] transition-all"
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Special Requests (Optional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 top-2.5 text-slate-400" size={14} />
                    <textarea
                      value={bookingForm.specialRequests}
                      onChange={e => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                      rows={2}
                      placeholder="Dietary preferences, child seats..."
                      className="w-full bg-slate-50 border border-slate-200 py-2 pl-9 pr-3 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#0B3B8C] transition-all"
                    />
                  </div>
                </div>

                {/* Automatic Price Calculations (Rule 2) */}
                <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-2xl space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-600 font-semibold">
                    <span>Price Per Person:</span>
                    <span className="font-mono font-bold text-slate-900">${pricePerPerson} USD</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black text-[#0B3B8C] border-t border-amber-200/60 pt-1">
                    <span>Total Estimated Price:</span>
                    <span className="font-mono text-base text-[#D4A017]">${totalPrice} USD</span>
                  </div>
                </div>

                {/* Large Continue Booking Button (Rule 2) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#D4A017] hover:bg-amber-400 text-[#020C1F] font-black py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase text-xs tracking-wider disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>Continue Booking</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/255629506063?text=${encodeURIComponent(`Hi! I'd like to ask about "${tour.name}" for ${bookingForm.guests} guests on ${bookingForm.travelDate || 'flexible date'}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('Tour Sidebar WhatsApp', tour.name)}
                  className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                >
                  <MessageCircle size={15} fill="white" />
                  <span>Chat on WhatsApp</span>
                </a>
              </form>

              <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 space-y-1.5 font-medium">
                <div className="flex items-center gap-2">
                  <Shield size={13} className="text-[#0B3B8C]" />
                  <span>No upfront credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-600" />
                  <span>Confirmation sent directly via WhatsApp & Email</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* REVIEWS SECTION (Rule 8: Rating + Google & TripAdvisor Buttons, No local review input form) */}
      <section className="py-12 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-100 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900">Guest Reviews</span>
                <div className="flex items-center text-[#D4A017]">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={18} className="fill-[#D4A017]" />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-600">(4.9 / 5.0)</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Verified guest experiences for {tour.name} and Zanzibar Trip & Relax.
              </p>
            </div>

            {/* External Review Links (Rule 8) */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://g.page/r/zanzibartripandrelax/review"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-slate-300 hover:border-[#0B3B8C] text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink size={14} className="text-blue-600" />
                <span>Review us on Google</span>
              </a>

              <a
                href="https://www.tripadvisor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink size={14} />
                <span>Review us on TripAdvisor</span>
              </a>
            </div>
          </div>

          {/* Existing Guest Reviews Display */}
          <GuestReviews navigate={navigate} />

        </div>
      </section>

      {/* RECOMMENDED TOURS (Rule 9: Maximum 4 tours cards: Image, Price, Duration, Book Now, View Details) */}
      <section className="py-12 px-4 bg-slate-50 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <span className="text-[#D4A017] uppercase tracking-widest font-black text-[10px] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block mb-1">
              🌴 Recommended Excursions
            </span>
            <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Recommended Related Excursions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedToursList.map(ot => (
              <div
                key={ot.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-200">
                    <ProgressiveImage src={ot.image} alt={ot.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-2.5 left-2.5 bg-[#0B3B8C] text-white text-[9px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full z-10">
                      {ot.duration}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-white/95 text-[#0B3B8C] text-xs font-black px-2.5 py-1 rounded-lg z-10 font-mono shadow-sm">
                      {ot.price}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h3 className="font-extrabold text-[#0B3B8C] text-sm leading-snug line-clamp-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {ot.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">
                      {ot.description}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons (Rule 9: Image, Price, Duration, Book Now, View Details) */}
                <div className="p-4 pt-0 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('tour-detail', (ot.name || (ot as any).title || '').toLowerCase().replace(/\s+/g, '-'));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-black py-2.5 rounded-xl transition-colors text-center uppercase tracking-wider cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('booking_prefilled_category', 'tour');
                      localStorage.setItem('booking_prefilled_tour', ot.name);
                      navigate('booking', `package=${encodeURIComponent(ot.name)}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 bg-[#D4A017] hover:bg-amber-400 text-[#0A1224] text-[11px] font-black py-2.5 rounded-xl transition-colors text-center uppercase tracking-wider cursor-pointer shadow-sm"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE STICKY BOTTOM BAR (Rule 12: Always visible on phone) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 shadow-2xl z-40 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Price From</span>
          <span className="text-xl font-black text-[#0B3B8C]">{tour.price}</span>
        </div>

        <button
          type="button"
          onClick={scrollToBooking}
          className="bg-[#D4A017] hover:bg-amber-400 text-[#020C1F] font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
        >
          <span>Book Now</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* WHAT HAPPENS AFTER BOOKING MODAL (Rule 3) */}
      {bookingSuccessPayload && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 text-slate-800 shadow-2xl animate-scale-up border border-slate-100">
            
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Booking Received
              </h2>
              <p className="text-xs text-slate-600 font-semibold">
                Thank you for booking with Zanzibar Trip & Relax. Your reservation has been received successfully.
              </p>
            </div>

            {/* Reference Number Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Booking Reference Number</span>
              <span className="text-2xl font-mono font-black text-[#D4A017] block">{bookingSuccessPayload.id}</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                Status: Pending Confirmation
              </span>
            </div>

            {/* Explanation List (Rule 3) */}
            <div className="space-y-3 text-xs bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
              <p className="font-bold text-slate-800">
                Our Reservations Team will personally review your booking and send:
              </p>
              <ul className="space-y-1 text-slate-700 font-medium pl-1">
                <li>• Pickup Time</li>
                <li>• Driver Details</li>
                <li>• Guide Information</li>
                <li>• Final Confirmation</li>
                <li>• Payment Instructions (if required)</li>
              </ul>
              
              <div className="border-t border-amber-200/60 pt-2 text-slate-700 font-semibold space-y-0.5">
                <p>You will receive these details via:</p>
                <p className="text-emerald-700">✓ WhatsApp</p>
                <p className="text-emerald-700">✓ Email (if provided)</p>
              </div>
            </div>

            {/* Action Buttons (Rule 3) */}
            <div className="space-y-2.5">
              <a
                href={`https://wa.me/255629506063?text=${encodeURIComponent(`Hi Zanzibar Trip & Relax! I submitted booking *${bookingSuccessPayload.id}* for *${bookingSuccessPayload.product_name}* on ${bookingSuccessPayload.travel_date}. Could you confirm my reservation details?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle size={16} fill="white" />
                <span>Follow-up on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleDownloadSummary}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} />
                <span>Download Booking Summary</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBookingSuccessPayload(null);
                  navigate('home');
                }}
                className="w-full text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-wider py-2 text-center underline cursor-pointer"
              >
                Close & Return to Home
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
