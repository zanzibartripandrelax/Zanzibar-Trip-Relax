import { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { tours, Tour } from '../data/tours';
import { Clock, Users, Star, Check, X, Shield, HelpCircle, MapPin, ArrowRight, ArrowLeft, MessageCircle, Calendar, Compass, List, Image as ImageIcon, Sparkles } from 'lucide-react';
import { getSiteContent } from '../lib/cmsStore';
import { ProgressiveImage } from '../components/ProgressiveImage';
import GuestReviews from '../components/GuestReviews';
import { useAnalytics } from '../context/AnalyticsContext';

interface TourDetailProps {
  navigate: (page: Page, id?: string) => void;
}

export default function TourDetail({ navigate }: TourDetailProps) {
  const { trackWhatsAppClick } = useAnalytics();
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const slug = hash.replace('tour-detail/', '').replace('tours/', '');

  const cmsContent = getSiteContent();
  const dynamicTour = cmsContent.tours.find(
    t => t.title.toLowerCase().replace(/\s+/g, '-') === slug || t.id === slug
  );

  const staticTour = tours.find(st => 
    st.id === slug || 
    st.name.toLowerCase().replace(/\s+/g, '-') === slug ||
    slug.includes(st.id) ||
    st.id.includes(slug) ||
    (slug.includes('safari-blue') && st.id === 'safari-blue') ||
    (slug.includes('mnemba') && st.id === 'mnemba-snorkeling') ||
    (slug.includes('stone-town') && st.id === 'stone-town') ||
    (slug.includes('prison-island') && st.id === 'prison-island') ||
    (slug.includes('spice-farm') && st.id === 'spice-farm') ||
    (slug.includes('jozani-forest') && st.id === 'jozani-forest')
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

  // Real related tours mapping from the database IDs
  const relatedToursList = tours.filter(t => tour.relatedTours?.includes(t.id));

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [pcsCount, setPcsCount] = useState<number>(2); // Default to 2 guests for calculator
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zanzibar_compare_tours');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [compareWarning, setCompareWarning] = useState<string | null>(null);

  const isComparing = selectedTourIds.includes(tour.id);

  const handleToggleCompare = () => {
    setSelectedTourIds(prev => {
      let next;
      if (prev.includes(tour.id)) {
        next = prev.filter(x => x !== tour.id);
        setCompareWarning(null);
      } else {
        if (prev.length >= 4) {
          setCompareWarning('Maximum of 4 tours can be compared at once! Please remove a tour first.');
          setTimeout(() => setCompareWarning(null), 4000);
          return prev;
        }
        next = [...prev, tour.id];
        setCompareWarning(null);
      }
      localStorage.setItem('zanzibar_compare_tours', JSON.stringify(next));
      return next;
    });
  };

  // Dynamically update SEO Headers & Document Meta Tags
  useEffect(() => {
    if (tour && tour.seoMetadata) {
      document.title = tour.seoMetadata.title;
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

  // Pricing calculator helper based on current slider number of guests
  const getCalculatedPrice = (): { ratePerPerson: string; total: number } => {
    if (pcsCount === 1) {
      const match = tour.pricingTable.find(t => t.tier.toLowerCase().includes('1人') || t.tier.toLowerCase().includes('solo') || t.tier.toLowerCase().includes('1 person'));
      const val = match ? parseInt(match.price.replace(/[^0-9]/g, '')) : 95;
      return { ratePerPerson: `$${val}`, total: val };
    } else if (pcsCount >= 2 && pcsCount <= 5) {
      const match = tour.pricingTable.find(t => t.tier.toLowerCase().includes('2') || t.tier.toLowerCase().includes('couple') || t.tier.toLowerCase().includes('3–5') || t.tier.toLowerCase().includes('standard'));
      const val = match ? parseInt(match.price.replace(/[^0-9]/g, '')) : 65;
      return { ratePerPerson: `$${val}`, total: val * pcsCount };
    } else {
      const match = tour.pricingTable.find(t => t.tier.toLowerCase().includes('large') || t.tier.toLowerCase().includes('group') || t.tier.toLowerCase().includes('6+'));
      const val = match ? parseInt(match.price.replace(/[^0-9]/g, '')) : 45;
      return { ratePerPerson: `$${val}`, total: val * pcsCount };
    }
  };

  const calc = getCalculatedPrice();

  return (
    <div className="min-h-screen bg-neutral-50">
      
      {/* Banner Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        {/* Floating Back to Marketplace Button */}
        <button
          type="button"
          onClick={() => navigate('tours')}
          className="absolute top-6 left-6 md:left-12 z-30 bg-white/90 hover:bg-white text-[#0B3B8C] hover:scale-105 active:scale-95 px-4.5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-widest flex items-center gap-2.5 transition-all cursor-pointer shadow-lg border border-slate-150"
        >
          <ArrowLeft size={14} className="stroke-[3]" />
          <span>Back to Marketplace</span>
        </button>

        <ProgressiveImage src={tour.image} alt={tour.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/45 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-block bg-[#D4A017] text-[#020C1F] text-[10px] tracking-wider uppercase font-extrabold px-3.5 py-1.5 rounded-full shadow-md animate-pulse">
                🏆 {tour.badge || tour.category} Excursion
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight text-white drop-shadow-md" style={{ fontFamily: 'Playfair Display, serif' }}>
                {tour.name}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90 text-xs font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm"><Clock size={14} className="text-[#D4A017]" /> {tour.duration}</span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm"><Users size={14} className="text-[#D4A017]" /> {tour.groupSize}</span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm"><Star size={14} className="text-[#D4A017] fill-[#D4A017]" /> 5.0 / 5 Rating</span>
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/25 shadow-lg shrink-0 text-center md:text-right">
              <span className="text-[10px] text-white/70 block font-bold tracking-widest uppercase">Direct Price Starting At</span>
              <p className="text-4xl font-black text-[#D4A017]">{tour.price}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Structural Area */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Details (Col-8) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Quick Badges Highlights Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0B3B8C]/5 border border-[#0B3B8C]/10 rounded-2xl p-5 flex items-center gap-4">
                <Calendar className="text-[#0B3B8C] w-8 h-8 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase">Best Time To Visit</span>
                  <span className="text-sm font-bold text-[#0B3B8C]">{tour.bestTimeToVisit}</span>
                </div>
              </div>
              <div className="bg-[#D4A017]/5 border border-[#D4A017]/10 rounded-2xl p-5 flex items-center gap-4">
                <Compass className="text-[#D4A017] w-8 h-8 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-gray-400 block uppercase">Conservation Focus</span>
                  <span className="text-sm font-bold text-[#0B3B8C]">100% Eco-Sensitive and Protected</span>
                </div>
              </div>
            </div>

            {/* Tour Highlights */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <Sparkles size={24} className="text-[#D4A017]" /> Excursion Highlights
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tour.highlights.map((hlt, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600 bg-transparent items-start">
                    <span className="bg-[#D4A017]/10 text-[#D4A017] rounded-lg p-1 shrink-0 mt-0.5">
                      <Check size={14} className="stroke-[3]" />
                    </span>
                    <span className="leading-relaxed font-medium">{hlt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* In-depth Overview */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Professional Overview & Narrative
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                {tour.longDescription}
              </p>
            </div>

            {/* Detailed Timed Itinerary */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
              <h2 className="text-2xl font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <Clock className="text-[#D4A017]" size={24} /> Step-by-Step Program Itinerary
              </h2>
              
              <div className="relative border-l-2 border-neutral-100 ml-3 md:ml-6 pl-6 md:pl-10 space-y-10">
                {parsedItinerary.map((step, i) => (
                  <div key={i} className="relative">
                    {/* Pulsing Dot */}
                    <span className="absolute -left-[31px] md:-left-[47px] top-1 bg-white border-2 border-[#D4A017] rounded-full w-4 h-4 flex items-center justify-center">
                      <span className="bg-[#D4A017] w-1.5 h-1.5 rounded-full animate-ping" />
                    </span>
                    <div className="space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-xs font-extrabold text-[#D4A017] uppercase tracking-widest bg-[#FDF6E2] px-3 py-1 rounded-md">
                          {step.time}
                        </span>
                        <h4 className="font-extrabold text-[#0B3B8C] text-sm md:text-base">
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">
                        {step.activity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Excursion Logistics & What is Covered
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-extrabold text-green-700 text-sm md:text-base flex items-center gap-2 pb-2 border-b border-green-100">
                    <span className="bg-green-100 text-green-700 p-1.5 rounded-xl"><Check size={16} /></span> Fully Included
                  </h3>
                  <ul className="space-y-3">
                    {tour.included.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 font-medium">
                        <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-extrabold text-red-700 text-sm md:text-base flex items-center gap-2 pb-2 border-b border-red-100">
                    <span className="bg-red-100 text-red-700 p-1.5 rounded-xl"><X size={16} /></span> Excluded / Personal Cost
                  </h3>
                  <ul className="space-y-3">
                    {tour.excluded.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 font-medium">
                        <X size={14} className="text-red-400 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Pickup, Cancellation & Terms Policy Summary */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <Shield className="text-[#D4A017]" size={24} /> Pickup Logistics & Booking Policies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <p className="text-xs font-black uppercase text-[#0B3B8C] tracking-wide flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#D4A017]" />
                    <span>Pickup & Drop-off</span>
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Complimentary hotel pickup and drop-off is included for all major resorts in Stone Town, Nungwi, Kendwa, Kiwengwa, Matte, and Paje. Simply specify your hotel during secure checkout.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <p className="text-xs font-black uppercase text-[#0B3B8C] tracking-wide flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#D4A017]" />
                    <span>Cancellation Policy</span>
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Get a 100% refund for cancellations submitted up to 48 hours prior to your scheduled excursion. Late cancellations within 24–48 hours are eligible for free rescheduling.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <p className="text-xs font-black uppercase text-[#0B3B8C] tracking-wide flex items-center gap-1.5">
                    <Shield size={14} className="text-[#D4A017]" />
                    <span>Terms & Conditions</span>
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    All tours are fully guided by licensed local naturalists and certified helmsmen. Marine life observations are natural events, managed with strictly eco-friendly protocols.
                  </p>
                </div>
              </div>
            </div>

            {/* What to Bring */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <List className="text-[#D4A017]" size={24} /> Pack List: What to Bring
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tour.whatToBring.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-neutral-50 px-4 py-3 rounded-xl border border-neutral-100">
                    <span className="w-2 h-2 rounded-full bg-[#D4A017] shrink-0" />
                    <span className="text-xs font-bold text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Interactive FAQs */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <HelpCircle className="text-[#D4A017]" size={24} /> FAQ: Excursion Advisory
              </h2>
              <div className="space-y-4">
                {tour.faq.map((faq, i) => (
                  <div key={i} className="border border-neutral-100 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full text-left font-bold text-sm text-[#0B3B8C] bg-neutral-50 p-4 hover:bg-neutral-100/50 flex justify-between items-center transition-all"
                    >
                      <span>{faq.q}</span>
                      <span className="text-[#D4A017] font-black text-lg">{activeFaq === i ? '−' : '+'}</span>
                    </button>
                    {activeFaq === i && (
                      <p className="p-4 bg-white text-gray-500 text-xs md:text-sm leading-relaxed border-t border-neutral-50 font-medium animate-fade-in">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Tour Landscape Gallery */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <ImageIcon className="text-[#D4A017]" size={24} /> Destination Landscapes & Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tour.gallery.map((url, i) => (
                  <div key={i} className="group relative h-48 rounded-2xl overflow-hidden border border-neutral-150">
                    <ProgressiveImage src={url} alt={`Landscape ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 z-10">
                      <span className="text-[10px] text-white uppercase font-bold tracking-widest">Zanzibar Island Visual</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Genuine Indexing SEO Tags */}
            <div className="bg-[#0B1E3D] text-white rounded-3xl p-6 space-y-3">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Digital Search Engine Optimization (SEO) Directory
              </p>
              <div className="text-xs text-gray-300 leading-relaxed font-mono">
                <p><strong>Geotagging:</strong> Stone Town, Zanzibar Archipelago, Tanzania, East Africa</p>
                <p className="mt-1"><strong>Keywords:</strong> {tour.seoMetadata.keywords.join(', ')}</p>
              </div>
            </div>

          </div>

          {/* Secure Booking Drawer Sidebar (Col-4) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 shadow-xl sticky top-24 space-y-6">
              
              <div className="border-b pb-4">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Direct Booking Office Rate</span>
                <span className="text-3xl font-black text-[#0B3B8C]">{tour.price}</span>
              </div>

              {/* Interactive Pricing Slider Calculator */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-500 text-[10px] uppercase">Group Size Estimator</span>
                  <span className="bg-[#D4A017]/10 text-[#0B3B8C] px-2 py-0.5 rounded text-[11px]">{pcsCount} {pcsCount === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={pcsCount}
                  onChange={(e) => setPcsCount(parseInt(e.target.value))}
                  className="w-full accent-[#D4A017] cursor-pointer"
                />

                <div className="pt-2 border-t border-gray-200/50 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Estimated rate / guest</span>
                    <span className="text-sm font-extrabold text-[#0B3B8C]">{calc.ratePerPerson}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">Total Escrow cost</span>
                    <span className="text-base font-black text-[#D4A017]">${calc.total} USD</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('booking_prefilled_category', 'tour');
                    localStorage.setItem('booking_prefilled_tour', tour.name);
                    navigate('booking', `package=${encodeURIComponent(tour.name)}`);
                  }}
                  className="w-full bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-extrabold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wide"
                >
                  <span>Inquire and Book Trip</span>
                  <ArrowRight size={16} />
                </button>

                <a
                  href={`https://wa.me/255629506063?text=${encodeURIComponent(`Hi! I want to book the real private "${tour.name}" for ${pcsCount} guests. Could you assist with pricing confirmation?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('Tour Detail Sidebar', tour.name)}
                  className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wide shadow-sm"
                >
                  <MessageCircle size={16} fill="white" />
                  <span>Interactive WhatsApp Desk</span>
                </a>

                {/* Compare Excursion Toggle */}
                <button
                  type="button"
                  onClick={handleToggleCompare}
                  className={`w-full font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide border ${
                    isComparing
                      ? 'bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] border-[#D4A017] shadow-md'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isComparing ? (
                    <>
                      <Check size={15} className="stroke-[3]" />
                      <span>Comparing (View in Tours)</span>
                    </>
                  ) : (
                    <>
                      <span>+ Add to Comparison</span>
                    </>
                  )}
                </button>

                {compareWarning && (
                  <p className="text-[10px] text-rose-500 font-extrabold text-center uppercase tracking-wider animate-pulse">
                    ⚠️ {compareWarning}
                  </p>
                )}
              </div>

              {/* Security Advisory */}
              <div className="border-t pt-4 space-y-3 font-medium">
                <div className="flex items-center gap-2.5 text-[11px] text-gray-500">
                  <Shield size={14} className="text-[#0B3B8C] shrink-0" />
                  <span>Licensed local guides and legal marine captains</span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-gray-500">
                  <HelpCircle size={14} className="text-[#0B3B8C] shrink-0" />
                  <span>Flex option & full refunds up to 48 hours</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Testimonials and customer reviews section */}
      <section className="py-16 px-4 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/20 inline-block">
              ⭐️ Verified Client Testimonials
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B3B8C] tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
              What Our Guests Say
            </h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto font-medium">
              Read real feedback from our luxury excursion and island holiday guests.
            </p>
          </div>
          <GuestReviews navigate={navigate} />
        </div>
      </section>

      {/* Recommended related tours */}
      <section className="py-16 px-4 bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0B3B8C] mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
            Recommended Related Excursions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedToursList.map(ot => (
              <div
                key={ot.id}
                onClick={() => {
                  navigate('tour-detail', ot.name.toLowerCase().replace(/\s+/g, '-'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-100 hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <ProgressiveImage src={ot.image} alt={ot.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-3 left-3 bg-[#0B3B8C] text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full z-10">
                    {ot.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 text-[#0B3B8C] text-xs font-bold px-2 py-1 rounded-lg z-10">
                    {ot.price}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-extrabold text-[#0B3B8C] group-hover:text-[#D4A017] transition-colors text-base" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {ot.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed flex-grow">
                    {ot.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
