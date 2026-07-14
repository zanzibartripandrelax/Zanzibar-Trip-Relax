import React, { useState } from 'react';
import { 
  Calendar, Clock, MapPin, Check, ChevronDown, Compass, ArrowRight, X, List, HelpCircle, Image as ImageIcon, Sparkles,
  Map, Star, Hotel, Utensils, ShieldAlert, Heart, MessageCircle, Download, Share2, Eye, ShieldCheck, Leaf, Video, AlertCircle
} from 'lucide-react';

interface PreviewProps {
  pkg: any;
  onClose?: () => void;
  onBookNow?: (packageName: string) => void;
}

export default function HolidayPackagePreview({ pkg, onClose, onBookNow }: PreviewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'itinerary' | 'hotels' | 'sustainability'>('overview');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [singleSupplement, setSingleSupplement] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  if (!pkg) return null;

  // Safe fallback arrays
  const highlights = pkg.highlights || [pkg.desc || 'No highlights specified.'];
  const gallery = pkg.gallery || (pkg.img ? [{ id: '1', url: pkg.img, caption: 'Cover', altText: pkg.title }] : []);
  const itinerary = pkg.detailedItinerary || (pkg.itinerary || []).map((it: string, idx: number) => ({
    dayNumber: idx + 1,
    title: `Day ${idx + 1} Program`,
    desc: it,
    meals: { breakfast: true, lunch: true, dinner: false },
    accommodation: 'Boutique Heritage Riad',
    activities: 'Guided Tours',
    travelTime: '1-2 hours',
    mapLocation: 'Stone Town',
    notes: 'Comfortable footwear recommended'
  }));
  const included = pkg.whatsIncluded || pkg.included || ['Private transport', 'Certified local guide', 'All entry fees'];
  const excluded = pkg.whatsExcluded || pkg.excluded || ['International flights', 'Tips and gratuities', 'Personal shopping'];
  const accommodations = pkg.accommodations || [
    {
      id: '1',
      hotelName: 'Traditional Swahili Riad / Ocean Resort',
      category: 'Luxury 5★',
      roomType: 'Deluxe Sea View Suite',
      mealPlan: 'Half Board',
      description: 'Hand-picked luxury boutique property offering pristine swimming pools, private ocean access, and authentic rooftop views of historical Stone Town or the Indian Ocean.',
      upgradeOptions: 'Premium Club Sultan Suite Upgrade (+$150/night)'
    }
  ];
  const faqs = pkg.faqs || [
    { id: '1', question: 'Are airport transfers private?', answer: 'Yes, all our holiday transfers are 100% private in modern air-conditioned vehicles with professional drivers.', category: 'Transfers' },
    { id: '2', question: 'Can we customize the itinerary days?', answer: 'Absolutely! Our travel consultants can add days, swap hotels, or include customized excursions.', category: 'Customization' }
  ];
  const sustainability = pkg.sustainability || {
    ecoFriendlyPractices: '100% single-use plastic free. Refillable mineral water flasks provided.',
    communityBenefits: '10% of booking proceeds directly fund local village primary schools and health clinics.',
    marineConservation: 'Active support for coral propagation reefs in Mnemba Atoll.',
    carbonReduction: 'Participates in Jozani Forest mangrove tree-planting to offset transfer emissions.',
    plasticFreeInitiatives: 'Luxury bamboo water bottles given to every guest on arrival.',
    localEmployment: 'We exclusively hire native Swahili captains, drivers, and historians at fair wages.',
    responsibleTourismNotes: 'Cultural guidelines and modest clothing provided for local village walks.'
  };

  const reviews = pkg.reviews || [
    { id: '1', reviewerName: 'Eleanor Vance', rating: 5, comments: 'Absolute dream trip! From the moment we stepped off the flight, we felt like royalty. The local spice farm walk and the private sailing cruise were highlight experiences. 10/10.', source: 'Google', photo: '', approved: true, featured: true },
    { id: '2', reviewerName: 'Marcus Brodie', rating: 5, comments: 'Outstanding customer care, customized to our exact requirements. Highly recommend Zanzibar Trip and Relax!', source: 'TripAdvisor', photo: '', approved: true, featured: true }
  ];

  // Automated Transport Cost Calculation
  const basePriceNum = Number(pkg.basePrice || pkg.price || 450);
  const childPriceNum = Number(pkg.childPrice || 0);
  const singleSupplNum = Number(pkg.singleSupplement || 0);
  const transportCost = pkg.pickupZoneId ? 45 : 0; // Simulated zone rate

  // Calculate dynamic pricing
  const baseTotal = basePriceNum * guestsCount;
  const childTotal = childPriceNum * childCount;
  const singleSupplTotal = singleSupplement ? singleSupplNum * (guestsCount + childCount) : 0;
  
  // Addons total
  const addonTotal = (pkg.addOns || [])
    .filter((a: any) => selectedAddons.includes(a.id))
    .reduce((sum: number, a: any) => sum + Number(a.price || 0), 0);

  // Group discount
  let discountPct = 0;
  if (pkg.groupDiscounts && pkg.groupDiscounts.length > 0) {
    const totalPeople = guestsCount + childCount;
    const sortedDiscounts = [...pkg.groupDiscounts].sort((a, b) => b.minGuests - a.minGuests);
    const match = sortedDiscounts.find(d => totalPeople >= d.minGuests);
    if (match) discountPct = Number(match.discountPercent || 0);
  }

  // Seasonal adjustments
  let seasonalAdj = 0;
  const taxesNum = Number(pkg.taxes || 0);
  const govFeesNum = Number(pkg.govFees || 0);
  const parkFeesNum = Number(pkg.parkFees || 0);
  const promoDiscountNum = Number(pkg.promoDiscount || 0);

  const subTotalBeforeDiscount = baseTotal + childTotal + singleSupplTotal + transportCost + addonTotal;
  const discountAmount = (subTotalBeforeDiscount * (discountPct + promoDiscountNum)) / 100;
  const taxesAndFees = taxesNum + govFeesNum + parkFeesNum;
  const finalCalculatedPrice = subTotalBeforeDiscount - discountAmount + taxesAndFees;

  const downloadPDF = () => {
    alert(`Downloading PDF Itinerary for: ${pkg.title}\nIncludes ${itinerary.length} Days Program, luxury accommodations, and pricing overview.`);
  };

  return (
    <div className="bg-[#050C1A] text-white rounded-3xl overflow-hidden border border-white/10 max-w-6xl mx-auto shadow-2xl relative">
      {/* Banner / Header */}
      <div className="bg-[#0D1B3E] px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Eye className="text-[#D4A017]" size={18} />
          <span className="text-xs font-black uppercase tracking-widest text-[#D4A017]">GUEST-FACING PUBLIC WEB PREVIEW</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all border-none cursor-pointer outline-none"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Hero Header */}
      <div className="relative h-[450px]">
        <img 
          src={pkg.image || pkg.img || (gallery[0]?.url) || 'https://images.unsplash.com/photo-1540206395-68808572332f'} 
          alt={pkg.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050C1A] via-transparent to-black/50" />
        
        <div className="absolute bottom-8 left-8 right-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#D4A017] text-[#020C1F] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
              {pkg.packageCategory || pkg.category || 'Luxury Holiday'}
            </span>
            {pkg.bestSeller && (
              <span className="bg-yellow-500 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> BEST SELLER
              </span>
            )}
            {pkg.featured && (
              <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                FEATURED
              </span>
            )}
            {pkg.recommended && (
              <span className="bg-green-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                RECOMMENDED
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            {pkg.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 font-bold">
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#D4A017]" /> {pkg.duration || `${pkg.durationDays || 5} Days / ${pkg.durationNights || 4} Nights`}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#D4A017]" /> {pkg.destinations || 'Zanzibar Scenic Sights'}</span>
            <span className="flex items-center gap-1.5"><Compass size={14} className="text-[#D4A017]" /> {pkg.tourType || 'Private Escorted Tour'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Details, Itinerary, Hotels, Sustainability) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Sub-Navigation Tabs */}
          <div className="flex border-b border-white/10 gap-4 overflow-x-auto pb-1">
            {[
              { id: 'overview', label: 'Overview', icon: <Compass size={14} /> },
              { id: 'itinerary', label: `Itinerary (${itinerary.length} Days)`, icon: <Map size={14} /> },
              { id: 'hotels', label: 'Accommodations', icon: <Hotel size={14} /> },
              { id: 'sustainability', label: 'Eco & Sustainability', icon: <Leaf size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 pb-3 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 bg-transparent border-none cursor-pointer px-1 shrink-0 ${
                  activeSubTab === tab.id 
                    ? 'text-[#D4A017] border-[#D4A017]' 
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sub-Tab: Overview */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-200" style={{ fontFamily: 'Playfair Display, serif' }}>About This Dream Package</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {pkg.fullDescription || pkg.desc || 'No description provided. Experience custom curated private transport, pristine resort check-ins, and fully guided excursions across historical Stone Town.'}
                </p>
              </div>

              {/* Highlights List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#D4A017] flex items-center gap-1">
                  <Sparkles size={14} /> Holiday Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((hlt: string, i: number) => (
                    <div key={i} className="flex gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-medium">
                      <Check size={14} className="text-[#D4A017] shrink-0 mt-0.5" />
                      <span>{hlt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="text-center p-2">
                  <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">DIFFICULTY LEVEL</span>
                  <span className="text-xs font-black text-slate-200">{pkg.difficulty || 'Easy'}</span>
                </div>
                <div className="text-center p-2">
                  <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">LANGUAGES</span>
                  <span className="text-xs font-black text-slate-200">{pkg.languages?.join(', ') || 'English, Swahili'}</span>
                </div>
                <div className="text-center p-2">
                  <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">GUEST POOL</span>
                  <span className="text-xs font-black text-slate-200">{pkg.minGuests || 1} - {pkg.maxGuests || 12} Guests</span>
                </div>
                <div className="text-center p-2">
                  <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">SERVICE STYLE</span>
                  <span className="text-xs font-black text-slate-200">{pkg.privateShared || 'Private Only'}</span>
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-green-950/20 border border-green-500/25 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-green-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck size={14} /> WHAT'S INCLUDED:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {included.map((inc: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <Check size={12} className="text-green-500 mt-1 shrink-0" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-950/20 border border-red-500/25 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldAlert size={14} /> WHAT'S NOT INCLUDED:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {excluded.map((exc: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <X size={12} className="text-red-500 mt-1 shrink-0" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Package Video */}
              {pkg.featuredVideo && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#D4A017] flex items-center gap-1">
                    <Video size={14} /> Featured Tour Video
                  </h4>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
                    <iframe 
                      className="w-full h-full"
                      src={pkg.featuredVideo.includes('embed') ? pkg.featuredVideo : `https://www.youtube.com/embed/${pkg.featuredVideo.split('v=')[1] || ''}`}
                      title="Featured Video"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab: Itinerary */}
          {activeSubTab === 'itinerary' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <Compass className="text-[#D4A017]" size={20} /> Detailed Program Schedule
              </h3>
              <div className="space-y-6 border-l-2 border-white/10 ml-4 pl-6 relative">
                {itinerary.map((day: any, i: number) => (
                  <div key={day.id || i} className="relative space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5 shadow-md">
                    {/* Circle timeline pin */}
                    <div className="absolute -left-[35px] top-6 w-4 h-4 rounded-full bg-[#D4A017] border-4 border-[#050C1A]" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#D4A017] text-[#020C1F] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                          DAY {day.dayNumber || (i + 1)}
                        </span>
                        <h4 className="text-sm font-black text-slate-200">{day.title}</h4>
                      </div>
                      {day.travelTime && (
                        <span className="text-[10px] text-[#D4A017] font-bold uppercase tracking-wider bg-[#D4A017]/10 px-2.5 py-1 rounded-full border border-[#D4A017]/20">
                          🚘 Transit: {day.travelTime}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {day.desc || 'Curated daily excursions.'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-white/5 text-slate-400">
                      <div>🍴 <strong>Meals:</strong> {[day.meals?.breakfast && 'Breakfast', day.meals?.lunch && 'Lunch', day.meals?.dinner && 'Dinner'].filter(Boolean).join(', ') || 'None'}</div>
                      <div>🏨 <strong>Stay:</strong> {day.accommodation || 'Handselected resort'}</div>
                      {day.activities && <div className="sm:col-span-2">🌟 <strong>Activities:</strong> {day.activities}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Tab: Hotels */}
          {activeSubTab === 'hotels' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <Hotel className="text-[#D4A017]" size={20} /> Curator’s Hand-selected Resorts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accommodations.map((hotel: any, i: number) => (
                  <div key={hotel.id || i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-white/20 transition-all flex flex-col">
                    <div className="h-44 bg-zinc-800 relative">
                      <img 
                        src={hotel.image || 'https://images.unsplash.com/photo-1540206395-68808572332f'} 
                        alt={hotel.hotelName} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-4 right-4 bg-[#D4A017] text-[#020C1F] text-[9px] font-black px-2.5 py-1 rounded">
                        {hotel.category || 'Luxury 5★'}
                      </div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-slate-200">{hotel.hotelName}</h4>
                        <div className="flex gap-4 text-[11px] text-slate-400">
                          <span>🛏️ {hotel.roomType || 'Standard Twin'}</span>
                          <span>🍽️ Plan: {hotel.mealPlan || 'Half Board'}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                          {hotel.description || 'Premium beachfront resort properties featuring modern amenities and direct beach access.'}
                        </p>
                      </div>
                      {hotel.upgradeOptions && (
                        <div className="bg-[#D4A017]/10 p-2.5 rounded-lg text-[10px] text-[#D4A017] border border-[#D4A017]/25 font-semibold">
                          ⚡ UPGRADE: {hotel.upgradeOptions}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Tab: Sustainability */}
          {activeSubTab === 'sustainability' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-green-950/20 border border-green-500/20 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <Leaf className="text-green-400" size={24} />
                  <h3 className="text-lg font-black text-green-400" style={{ fontFamily: 'Playfair Display, serif' }}>Eco-Tourism Certified Travel</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We believe in protecting Zanzibar’s delicate ocean ecosystems and local coastal villages. This package complies with our native fair-wage guarantees, eco-conservation standards, and carbon reduction pledges.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-wider block">♻️ ECO-FRIENDLY ACTIONS</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{sustainability.ecoFriendlyPractices}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-wider block">🤝 VILLAGE BENEFITS</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{sustainability.communityBenefits}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-wider block">🐬 REEF & MARINE PLEDGES</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{sustainability.marineConservation}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-wider block">👣 CARBON PLEDGE</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{sustainability.carbonReduction}</p>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-wider block">📋 RESPONSIBLE VISITATION RULES</span>
                    <p className="text-xs text-slate-400 leading-relaxed">{sustainability.responsibleTourismNotes}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media Landscape Gallery */}
          {gallery.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#D4A017] flex items-center gap-1.5">
                <ImageIcon size={16} /> Excursion Media & Landscape Showcase
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {gallery.map((img: any, i: number) => (
                  <div key={img.id || i} className="h-28 md:h-40 rounded-xl overflow-hidden border border-white/15 bg-zinc-900 group relative">
                    <img src={img.url} alt={img.altText || 'Gallery Image'} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                    {img.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-1.5 text-center text-[9px] text-slate-200 select-none">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ accordion */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#D4A017] flex items-center gap-1.5">
              <HelpCircle size={16} /> Advisories & Booking FAQs
            </h3>
            <div className="space-y-3">
              {faqs.map((faq: any, idx: number) => (
                <div key={faq.id || idx} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between text-xs font-bold text-slate-200 transition-colors hover:bg-white/5 cursor-pointer border-none bg-transparent outline-none"
                  >
                    <span>Q: {faq.question}</span>
                    <ChevronDown size={14} className={`text-white/40 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3 whitespace-pre-wrap bg-white/5">
                      A: {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Verified Reviews Section */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#D4A017] flex items-center gap-1.5">
              <Star size={16} /> Guest Experience & Verified Reviews
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.filter((r: any) => r.approved).map((rev: any, i: number) => (
                <div key={rev.id || i} className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#D4A017] text-[#020C1F] flex items-center justify-center font-black text-xs uppercase shadow-inner">
                        {rev.reviewerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-200">{rev.reviewerName}</h4>
                        <span className="text-[9px] text-slate-400">{rev.source || 'Verified Guest'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-yellow-500">
                      {Array.from({ length: rev.rating }).map((_, rIdx) => (
                        <Star key={rIdx} size={10} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{rev.comments}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Live Instant Booking & Pricing Invoice Widget) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Price Tag Sticky Summary */}
          <div className="bg-gradient-to-br from-[#0B1E3D] to-[#0D1B3E] border border-[#D4A017]/35 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="text-center pb-4 border-b border-white/10 space-y-1">
              <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-widest">Base Rate / Person</span>
              <div className="text-4xl font-black text-white">${basePriceNum} <span className="text-xs text-slate-400 font-bold">USD</span></div>
              {pkg.duration && <p className="text-[10px] text-slate-300 font-semibold">{pkg.duration}</p>}
            </div>

            {/* Instant Estimate Form */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <CalculatorIcon /> Instant Pricing Calculator
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/5">
                  <label className="text-[10px] font-extrabold text-slate-300">👨 Adults (Ages 12+)</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))} className="bg-white/10 px-2 py-0.5 rounded text-xs">-</button>
                    <span className="text-xs font-bold w-4 text-center">{guestsCount}</span>
                    <button onClick={() => setGuestsCount(guestsCount + 1)} className="bg-white/10 px-2 py-0.5 rounded text-xs">+</button>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/5">
                  <label className="text-[10px] font-extrabold text-slate-300">👦 Children (Ages 3-11)</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setChildCount(Math.max(0, childCount - 1))} className="bg-white/10 px-2 py-0.5 rounded text-xs">-</button>
                    <span className="text-xs font-bold w-4 text-center">{childCount}</span>
                    <button onClick={() => setChildCount(childCount + 1)} className="bg-white/10 px-2 py-0.5 rounded text-xs">+</button>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/5">
                  <label className="text-[10px] font-extrabold text-slate-300">🛏️ Single Room Supplement</label>
                  <input 
                    type="checkbox" 
                    checked={singleSupplement} 
                    onChange={e => setSingleSupplement(e.target.checked)}
                    className="accent-[#D4A017] scale-110" 
                  />
                </div>
                
                {/* Optional Add-ons Checkbox */}
                {pkg.addOns && pkg.addOns.length > 0 && (
                  <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">🌟 Optional Add-ons</span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {pkg.addOns.map((add: any) => (
                        <label key={add.id} className="flex items-center justify-between text-[10px] text-slate-300 cursor-pointer">
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="checkbox"
                              checked={selectedAddons.includes(add.id)}
                              onChange={e => {
                                if (e.target.checked) setSelectedAddons([...selectedAddons, add.id]);
                                else setSelectedAddons(selectedAddons.filter(id => id !== add.id));
                              }}
                              className="accent-[#D4A017]"
                            />
                            <span>{add.name}</span>
                          </div>
                          <span className="text-[#D4A017] font-bold">+${add.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price breakdown invoice */}
            <div className="bg-[#050C1A] border border-white/5 rounded-2xl p-4 space-y-2.5">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-white/5">TRANSPARENT INVOICE BREAKDOWN</span>
              
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Adults Base ({guestsCount} × ${basePriceNum}):</span>
                  <span className="font-bold text-white">${baseTotal}</span>
                </div>
                
                {childCount > 0 && (
                  <div className="flex justify-between">
                    <span>Children Rate ({childCount} × ${childPriceNum}):</span>
                    <span className="font-bold text-white">${childTotal}</span>
                  </div>
                )}

                {singleSupplement && singleSupplNum > 0 && (
                  <div className="flex justify-between text-yellow-500/90">
                    <span>Single Supplement ({guestsCount + childCount} × ${singleSupplNum}):</span>
                    <span className="font-bold">+${singleSupplTotal}</span>
                  </div>
                )}

                {pkg.pickupZoneId && (
                  <div className="flex justify-between">
                    <span>Transport pick-up rate (Zone-based):</span>
                    <span className="font-bold text-white">${transportCost}</span>
                  </div>
                )}

                {addonTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Selected Add-ons total:</span>
                    <span className="font-bold text-white">+${addonTotal}</span>
                  </div>
                )}

                {discountPct > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Group Discount Applied ({discountPct}%):</span>
                    <span>-${(subTotalBeforeDiscount * discountPct / 100).toFixed(0)}</span>
                  </div>
                )}

                {promoDiscountNum > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Promo Discount Applied ({promoDiscountNum}%):</span>
                    <span>-${(subTotalBeforeDiscount * promoDiscountNum / 100).toFixed(0)}</span>
                  </div>
                )}

                {taxesAndFees > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Taxes & Government Park Fees:</span>
                    <span className="font-bold text-white">+${taxesAndFees}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs font-black">
                <span className="text-[#D4A017]">ESTIMATED TOTAL PACKAGE PRICE:</span>
                <span className="text-lg text-white font-black">${finalCalculatedPrice.toFixed(0)}</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => onBookNow?.(pkg.title)}
              className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black py-3.5 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg outline-none border-none"
            >
              <span>Instant Request Reservation</span>
              <ArrowRight size={14} />
            </button>

            {/* Helper buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={downloadPDF}
                className="flex-1 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl py-2.5 text-center text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download size={12} /> Download PDF
              </button>
              <a
                href={`https://wa.me/255629506063?text=Hello%20Zanzibar%20Trip%20and%20Relax%2C%20I%20am%20interested%20in%20inquiring%20about%20your%20Holiday%20Package%3A%20${encodeURIComponent(pkg.title)}%21`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#20ba59] rounded-xl py-2.5 text-center text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 text-white decoration-none"
              >
                <MessageCircle size={12} fill="white" /> WhatsApp Inquiry
              </a>
            </div>

          </div>

          {/* Quick Notice Card */}
          <div className="bg-[#121B30]/40 border border-white/5 rounded-2xl p-4 text-[10px] text-slate-400 space-y-2 leading-relaxed">
            <div className="flex items-center gap-1 text-slate-300 font-extrabold uppercase">
              <AlertCircle size={12} className="text-[#D4A017]" />
              <span>Tailored Booking Notice</span>
            </div>
            <p>
              Your quotes are dynamic estimates based on local fuel cost logs, seasonal high-periods, and passenger counts. Private boat charters and park permits are pre-booked. Custom modifications are free on WhatsApp desk.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

// Inline custom icon for calculator to avoid extra imports
function CalculatorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#D4A017]">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}
