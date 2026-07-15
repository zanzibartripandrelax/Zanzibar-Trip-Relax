import { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { 
  Calendar, Clock, MapPin, Check, ChevronDown, ChevronUp, Compass, ArrowRight, X, List, HelpCircle, Image as ImageIcon, Sparkles,
  Map, Star, Hotel, Utensils, ShieldAlert, ArrowLeft, Heart, Plane, Activity, CheckCircle, XCircle, ShieldCheck, Mail
} from 'lucide-react';
import { useCMSStore } from '../lib/cmsStore';
import { ProgressiveImage } from '../components/ProgressiveImage';
import ShareButtons from '../components/ShareButtons';
import GuestReviews from '../components/GuestReviews';
import { useScrollY } from '../hooks/useScrollY';
import Breadcrumbs from '../components/Breadcrumbs';
import { useWishlist } from '../hooks/useWishlist';

interface PackagesProps {
  navigate: (page: Page, id?: string) => void;
  queryParams?: Record<string, string>;
}

export default function Packages({ navigate, queryParams }: PackagesProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const scrollY = useScrollY();
  const [openItinerary, setOpenItinerary] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const content = useCMSStore();
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
      seoMetadata: {
        title: t.seoTitle || `${t.title} Holiday Package | Zanzibar Trip & Relax`,
        desc: t.seoDescription || t.shortDesc || '',
        keywords: t.metaKeywords || ['Zanzibar dynamic packages', 'Zanzibar custom travel']
      },
      itinerary: (t.itineraryDays || []).map(d => ({
        day: d.dayNumber,
        title: d.title,
        desc: d.description
      }))
    }));

  const [searchParams, setSearchParams] = useState(() => {
    const dest = localStorage.getItem('ztr_search_destination') || '';
    const type = localStorage.getItem('ztr_search_type') || '';
    const arrival = localStorage.getItem('ztr_search_arrival') || '';
    const departure = localStorage.getItem('ztr_search_departure') || '';
    const adults = localStorage.getItem('ztr_search_adults') || '';
    const children = localStorage.getItem('ztr_search_children') || '';
    const budget = localStorage.getItem('ztr_search_budget') || '';
    
    if (!dest && !type && !arrival && !departure && !adults && !children && !budget) {
      return null;
    }
    return { dest, type, arrival, departure, adults: Number(adults || '2'), children: Number(children || '0'), budget };
  });

  // Sync selected package from query parameter
  useEffect(() => {
    if (queryParams?.package) {
      const decoded = decodeURIComponent(queryParams.package);
      const matched = allAvailablePackages.find(p => p.id === decoded || p.title === decoded);
      if (matched) {
        setSelectedPackageId(matched.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (queryParams?.id) {
      const decoded = decodeURIComponent(queryParams.id);
      const matched = allAvailablePackages.find(p => p.id === decoded);
      if (matched) {
        setSelectedPackageId(matched.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [queryParams, allAvailablePackages.length]);

  const toggleItinerary = (id: string) => {
    setOpenItinerary(openItinerary === id ? null : id);
  };

  const getFilteredPackages = () => {
    if (!searchParams) return allAvailablePackages;

    const scored = allAvailablePackages.map(pkg => {
      let score = 0;

      // 1. Destination Match
      if (searchParams.dest) {
        const dest = searchParams.dest.toLowerCase();
        if (pkg.destinations.toLowerCase().includes(dest) || pkg.title.toLowerCase().includes(dest)) {
          score += 3;
        }
      }

      // 2. Experience Type Match
      if (searchParams.type) {
        const type = searchParams.type.toLowerCase();
        if (pkg.tags.some(t => t.toLowerCase().includes(type)) || pkg.summary.toLowerCase().includes(type)) {
          score += 3;
        }
      }

      // 3. Nights Match
      if (searchParams.arrival && searchParams.departure) {
        const ms = new Date(searchParams.departure).getTime() - new Date(searchParams.arrival).getTime();
        const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
        if (nights > 0) {
          if (pkg.duration.toLowerCase().includes(`${nights} day`) || pkg.duration.toLowerCase().includes(`${nights} night`)) {
            score += 4;
          }
        }
      }

      // 4. Budget Match
      if (searchParams.budget) {
        const b = searchParams.budget;
        const priceNum = parseInt(pkg.price.replace(/[^0-9]/g, ''));
        if (b === 'budget' && priceNum < 500) score += 2;
        else if (b === 'mid' && priceNum >= 500 && priceNum < 1000) score += 2;
        else if ((b === 'premium' || b === 'luxury') && priceNum >= 1000) score += 2;
      }

      return { ...pkg, score };
    });

    const hasActiveFilter = searchParams.dest || searchParams.type || (searchParams.arrival && searchParams.departure) || searchParams.budget;
    
    if (hasActiveFilter) {
      return scored.sort((a, b) => b.score - a.score);
    }
    return allAvailablePackages;
  };

  const filteredData = getFilteredPackages();

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      
      {/* Hero Header */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1600')",
            transform: `translateY(${scrollY * 0.3}px) scale(1.15)`
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 to-zinc-950/95" />
        <div className="relative z-10 text-center px-4 max-w-3xl space-y-3" style={{ transform: `translateY(-${scrollY * 0.1}px)` }}>
          <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/20">
            ☀️ Handcrafted Holiday Escapes
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Zanzibar Holiday Packages
          </h1>
          <p className="text-sm md:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            All-inclusive, fully private multi-day itineraries crafted to ensure a stress-free tropical dream holiday in historic Zanzibar.
          </p>
        </div>
      </section>

      <Breadcrumbs items={[{ label: 'Holiday Packages' }]} navigate={navigate} />

      {/* Search Filter Alert Banner */}
      {searchParams && (
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Compass className="text-[#D4A017] shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-bold text-[#0B3B8C]">Showing tailored matches for your search</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Filters: {searchParams.dest && <>Location: <span className="capitalize font-bold text-[#0B3B8C] mr-2">{searchParams.dest}</span></>}
                  {searchParams.type && <>Experience: <span className="capitalize font-bold text-[#0B3B8C] mr-2">{searchParams.type}</span></>}
                  {searchParams.budget && <>Budget Index: <span className="uppercase font-bold text-[#0B3B8C] mr-2">{searchParams.budget}</span></>}
                  {searchParams.arrival && <>Date: <span className="font-bold text-[#0B3B8C]">{searchParams.arrival}</span></>}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('ztr_search_destination');
                localStorage.removeItem('ztr_search_type');
                localStorage.removeItem('ztr_search_arrival');
                localStorage.removeItem('ztr_search_departure');
                localStorage.removeItem('ztr_search_adults');
                localStorage.removeItem('ztr_search_children');
                localStorage.removeItem('ztr_search_budget');
                localStorage.removeItem('ztr_search_hotel');
                setSearchParams(null);
              }}
              className="text-xs font-bold text-[#0B3B8C] hover:text-[#D4A017] flex items-center gap-1 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
            >
              <X size={14} /> Clear Search & Show All
            </button>
          </div>
        </div>
      )}

      {/* Package List */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          {filteredData.map(pkg => {
            const isItineraryOpen = openItinerary === pkg.id;
            return (
              <div key={pkg.id} className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-150 p-6 md:p-8 flex flex-col transition-all hover:shadow-xl space-y-6">
                
                {/* Visual Card Grid Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                  {/* Photo Gallery container */}
                  <div className="lg:col-span-5 relative h-64 lg:h-auto rounded-2xl overflow-hidden bg-zinc-200">
                    <ProgressiveImage src={pkg.image} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                      {pkg.tags.map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 bg-[#0B3B8C] text-white rounded-xl shadow-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Wishlist Button */}
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
                      className={`absolute top-4 right-4 p-2.5 rounded-full z-10 transition-all ${
                        isInWishlist(pkg.id)
                          ? 'bg-[#D4A017] text-white shadow-lg'
                          : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <Heart size={18} fill={isInWishlist(pkg.id) ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Body textual details */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-[#D4A017] font-extrabold uppercase tracking-wider bg-[#FDF6E2] px-3 py-1 rounded-xl">
                          <Clock size={14} className="text-[#0B3B8C]" /> {pkg.duration}
                        </span>
                        <p className="text-3xl font-black text-[#0B3B8C] leading-none">{pkg.price}</p>
                      </div>

                      <h2 className="text-2xl font-black text-[#0B3B8C] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {pkg.title}
                      </h2>

                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide flex items-center gap-1 pb-1 border-b border-zinc-100">
                        <MapPin size={13} className="text-[#D4A017]" /> Core Sights: {pkg.destinations}
                      </p>

                      <p className="text-gray-650 text-sm leading-relaxed font-medium">
                        {pkg.summary}
                      </p>

                      {/* Inclusive items checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {pkg.included.slice(0, 4).map((inc, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Check size={14} className="text-green-500 mr-0.5 shrink-0" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>

                    </div>

                    {/* Collapsible panel button triggers */}
                    <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleItinerary(pkg.id)}
                        className="bg-neutral-50 hover:bg-neutral-100 text-[#0B3B8C] text-xs font-extrabold px-5 py-3 rounded-full flex items-center gap-1 transition-colors cursor-pointer border border-[#0B3B8C]/15"
                      >
                        <span>{isItineraryOpen ? 'Hide Full Details' : 'View Full Itinerary'}</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isItineraryOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <div className="flex items-center gap-3">
                        <ShareButtons 
                          title={pkg.title} 
                          description={pkg.summary} 
                          packageId={pkg.id} 
                        />
                        
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('booking_prefilled_category', 'package');
                            localStorage.setItem('booking_prefilled_tour', pkg.title);
                            navigate('booking', `package=${encodeURIComponent(pkg.title)}`);
                          }}
                          className="bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-extrabold text-xs px-6 py-3.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wide"
                        >
                          <span>Confirm & Book</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Expanded Detailed Module */}
                {isItineraryOpen && (
                  <div className="pt-6 border-t border-zinc-150 animate-fade-in space-y-8 bg-neutral-50/50 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8">
                    
                    {/* Day-by-day Itinerary Timeline */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-[#0B3B8C] flex items-center gap-2 pb-2 border-b border-zinc-200" style={{ fontFamily: 'Playfair Display, serif' }}>
                        <Compass className="text-[#D4A017]" size={20} /> Day-by-Day Holiday Itinerary Program
                      </h4>
                      <div className="space-y-6">
                        {pkg.itinerary.map((step, idx) => (
                          <div key={idx} className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-2 shadow-sm relative">
                            <div className="flex items-center gap-2">
                              <span className="bg-[#D4A017] text-[#020C1F] text-[10px] uppercase font-black px-2.5 py-1 rounded-md">
                                Day {step.day}
                              </span>
                              <h5 className="font-extrabold text-[#0B3B8C] text-sm md:text-base">{step.title}</h5>
                            </div>
                            <p className="text-zinc-650 text-xs md:text-sm leading-relaxed font-medium">
                              {step.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlights Detail */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={16} className="text-[#D4A017]" /> Holiday Highlights
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {pkg.highlights.map((hlt, i) => (
                          <div key={i} className="flex gap-2 text-xs text-zinc-600 font-medium bg-white p-3.5 rounded-xl border border-zinc-100">
                            <Check size={14} className="text-[#D4A017] mt-0.5 shrink-0" />
                            <span>{hlt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logistics Coverage & Exclusions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-3 shadow-sm">
                        <h4 className="font-extrabold text-green-700 text-xs uppercase tracking-widest pb-1 border-b border-green-100 flex items-center gap-1">
                          <Check size={14} /> Full Inclusions (What is Covered)
                        </h4>
                        <ul className="space-y-2.5">
                          {pkg.included.map((inc, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-650 font-medium">
                              <Check size={12} className="text-green-500 mt-1 shrink-0" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-3 shadow-sm">
                        <h4 className="font-extrabold text-red-700 text-xs uppercase tracking-widest pb-1 border-b border-red-100 flex items-center gap-1">
                          <X size={14} /> Exclusions (What is Out-Of-Pocket)
                        </h4>
                        <ul className="space-y-2.5">
                          {pkg.excluded.map((exc, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-650 font-medium">
                              <X size={12} className="text-red-400 mt-1 shrink-0" />
                              <span>{exc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* What to Bring and Pack List */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <List size={16} className="text-[#D4A017]" /> Essential Gear & Pack Checklist
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-500 font-medium">
                        {pkg.whatToBring.map((gear, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-zinc-150 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] shrink-0" />
                            <span>{gear}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Pricing Matrix */}
                    <div className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-3 shadow-sm">
                      <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">Holiday Package Pricing Matrix</h4>
                      <div className="divide-y divide-zinc-100">
                        {pkg.pricingTable.map((priceTier, i) => (
                          <div key={i} className="flex justify-between items-center py-2.5 text-xs font-semibold font-medium text-zinc-700">
                            <span>{priceTier.tier}</span>
                            <span className="text-[#0B3B8C] font-extrabold">{priceTier.rate}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FAQ and Travel Advisories */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <HelpCircle size={16} className="text-[#D4A017]" /> Package General Advisories & FAQs
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pkg.faqs.map((faq, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-4 border border-zinc-150 space-y-1.5 shadow-sm">
                            <h5 className="font-extrabold text-[#0B3B8C] text-xs leading-tight">Q: {faq.q}</h5>
                            <p className="text-zinc-500 text-[11px] leading-relaxed font-medium">A: {faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Photo Landscapes */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <ImageIcon size={16} className="text-[#D4A017]" /> Zanzibar Holiday Sceneries
                      </h4>
                      <div className="grid grid-cols-3 gap-3 md:gap-4">
                        {pkg.gallery.map((url, i) => (
                          <div key={i} className="h-24 md:h-36 rounded-xl overflow-hidden border border-zinc-200">
                            <ProgressiveImage src={url} alt={`Landscape ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Search SEO panel */}
                    <div className="bg-[#0B1E3D] text-[#D4A017] p-4 rounded-xl font-mono text-[10px]">
                      <span className="text-white block font-bold mb-1">🔗 SEO GOOGLE SEARCH METADATA</span>
                      <p><strong>Title:</strong> {pkg.seoMetadata.title}</p>
                      <p className="mt-0.5 text-zinc-300"><strong>Description:</strong> {pkg.seoMetadata.desc}</p>
                      <p className="mt-0.5 text-zinc-400"><strong>Keywords:</strong> {pkg.seoMetadata.keywords.join(', ')}</p>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials and customer reviews section */}
      <section className="py-16 px-4 bg-zinc-100 border-t border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/20 inline-block">
              ⭐️ Verified Package Testimonials
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B3B8C] tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
              What Our Holiday Guests Say
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm max-w-lg mx-auto font-medium">
              Read verified feedback from travelers who booked our multi-day, family, and honeymoon holiday packages.
            </p>
          </div>
          <GuestReviews navigate={navigate} />
        </div>
      </section>

      {/* Custom trip alert bottom banner */}
      <section className="py-16 bg-[#0B3B8C] text-white px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-xl text-[#D4A017]" style={{ fontFamily: 'Playfair Display, serif' }}>Want to Mix & Match Holiday Experiences?</h3>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              We can customize any package listed above to match your exact flight timings, hotel preferences, or budget guidelines. Add a Tanzanian safari or Kilimanjaro climb to your beach package!
            </p>
          </div>
          <button type="button" onClick={() => navigate('trip-builder')} className="bg-[#D4A017] hover:bg-[#c49010] text-white font-extrabold text-xs px-6 py-3.5 rounded-full transition-colors shrink-0 uppercase tracking-wide cursor-pointer shadow-md">
            Build My Trip Customizer
          </button>
        </div>
      </section>
    </div>
  );
}
