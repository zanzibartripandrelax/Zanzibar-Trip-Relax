import { useState, useEffect, useMemo } from 'react';
import { Page } from '../hooks/useHashRouter';
import { tours as staticTours } from '../data/tours';
import { getSiteContent, getDateBlockages } from '../lib/cmsStore';
import { 
  Clock, Users, Star, ArrowRight, Compass, Check, MapPin, Search, 
  Calendar, ShieldCheck, Heart, Waves, Palmtree, BookOpen, Leaf, Zap, Crown, MessageCircle, SlidersHorizontal
} from 'lucide-react';
import { ProgressiveImage } from '../components/ProgressiveImage';
import { useScrollY } from '../hooks/useScrollY';
import { usePreferences } from '../context/UserPreferencesContext';
import { useWishlist } from '../hooks/useWishlist';
import { motion, AnimatePresence } from 'motion/react';

interface ToursProps {
  navigate: (page: Page, id?: string) => void;
  queryParams?: Record<string, string>;
}

// Curated luxury experience categories
const visualCategories = [
  {
    id: 'All',
    label: 'All Experiences',
    desc: 'Browse our complete catalog of unforgettable adventures.',
    icon: Compass,
    keywords: []
  },
  {
    id: 'Marine',
    label: 'Marine Experiences',
    desc: 'Dive into crystal-clear waters, snorkel reefs, and sail traditional wooden dhows.',
    icon: Waves,
    keywords: ['marine', 'snorkeling', 'dhow', 'blue', 'swim', 'dolphin', 'menai', 'ocean', 'safari blue', 'mnemba', 'sunset dhow', 'cruise', 'boat', 'island', 'nakupenda', 'sandbank', 'reef']
  },
  {
    id: 'Island',
    label: 'Island & Beach',
    desc: 'Relax on shifting sandbanks, explore historic islands, and discover secluded shores.',
    icon: Palmtree,
    keywords: ['prison', 'sandbank', 'beach', 'island', 'nakupenda', 'coast', 'nungwi', 'paje', 'kendwa']
  },
  {
    id: 'Culture',
    label: 'Culture & History',
    desc: 'Wander historic streets, tour exotic spice farms, and discover Swahili heritage.',
    icon: BookOpen,
    keywords: ['culture', 'history', 'stone town', 'spice', 'village', 'heritage', 'local', 'museum', 'monument', 'market', 'town']
  },
  {
    id: 'Nature',
    label: 'Nature & Wildlife',
    desc: 'Encounter endangered Colobus monkeys and feed centenary giant Aldabra tortoises.',
    icon: Leaf,
    keywords: ['forest', 'wildlife', 'jozani', 'monkey', 'turtle', 'aquarium', 'mangrove', 'nature', 'conservation', 'biodiversity']
  },
  {
    id: 'Adventure',
    label: 'Adventure & Sports',
    desc: 'Power through rugged tracks on quad bikes and enjoy thrilling coastal water activities.',
    icon: Zap,
    keywords: ['quad', 'bike', 'adventure', 'thrill', 'kayak', 'windsurf', 'jet ski', 'speed', 'climb', 'parasail', 'active']
  },
  {
    id: 'Luxury',
    label: 'Luxury Charters',
    desc: 'Indulge in private catamaran sunset cruises, fine seafood dining, and VIP services.',
    icon: Crown,
    keywords: ['luxury', 'premium', 'private', 'exclusive', 'charter', 'yacht', 'catamaran', 'vip', 'sunset cruise', 'ocean dhow']
  }
];

export default function Tours({ navigate, queryParams }: ToursProps) {
  const { formatPrice } = usePreferences();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const scrollY = useScrollY();

  // Active Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (queryParams?.category) {
      const found = visualCategories.find(c => c.id.toLowerCase() === queryParams.category.toLowerCase());
      if (found) return found.id;
    }
    return 'All';
  });

  // Search & secondary filter states
  const [searchQuery, setSearchQuery] = useState(queryParams?.search || '');
  const [durationFilter, setDurationFilter] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Sync state with query params
  useEffect(() => {
    if (queryParams?.category) {
      const found = visualCategories.find(c => c.id.toLowerCase() === queryParams.category.toLowerCase());
      if (found) setSelectedCategory(found.id);
    }
    if (queryParams?.search) {
      setSearchQuery(queryParams.search);
    }
  }, [queryParams]);

  const cmsContent = getSiteContent() || { tours: [] };
  const seenTitles = new Set<string>();
  const activeTours = [];

  for (const t of (cmsContent.tours || [])) {
    if (t.visible === false) continue;
    const normTitle = (t.title || '').trim().toLowerCase();
    if (!normTitle) continue;
    if (seenTitles.has(normTitle)) continue;
    seenTitles.add(normTitle);

    // Sync metadata with static tour library for high-fidelity content
    const staticWalk = staticTours.find(st => 
      st.id === t.id || 
      (st.name || '').toLowerCase() === (t.title || '').toLowerCase() ||
      (t.title || '').toLowerCase().includes((st.name || '').toLowerCase()) ||
      (st.name || '').toLowerCase().includes((t.title || '').toLowerCase()) ||
      ((t.title || '').includes('Safari Blue') && st.id === 'safari-blue') ||
      ((t.title || '').includes('Mnemba') && st.id === 'mnemba-snorkeling') ||
      ((t.title || '').includes('Stone Town') && st.id === 'stone-town') ||
      ((t.title || '').includes('Prison Island') && st.id === 'prison-island') ||
      ((t.title || '').includes('Spice Farm') && st.id === 'spice-farm') ||
      ((t.title || '').includes('Jozani Forest') && st.id === 'jozani-forest')
    );

    activeTours.push({
      id: t.id,
      name: t.title,
      description: t.desc || '',
      price: t.price,
      duration: t.duration || 'Half Day',
      location: t.location || (staticWalk?.bestTimeToVisit ? (staticWalk?.id === 'stone-town' ? 'Stone Town' : staticWalk?.id === 'safari-blue' ? 'Menai Bay' : 'Zanzibar') : 'Zanzibar Island'),
      groupSize: staticWalk?.groupSize || '1–12 guests',
      highlights: staticWalk?.highlights || ['Hotel Transfers Included', 'Professional Local Guides', 'All Entrance Fees Covered'],
      image: t.img,
      badge: staticWalk?.badge || (t.category === 'tour' ? 'Best Seller' : t.category),
      category: staticWalk?.category || (t.category.charAt(0).toUpperCase() + t.category.slice(1)),
    });
  }

  // System blocked dates loading
  const SYSTEM_BLOCKED_DATES = useMemo(() => [
    '2026-07-15', '2026-07-16', '2026-07-17',
    '2026-08-10', '2026-08-11',
    '2026-12-25', '2026-12-31', '2027-01-01'
  ], []);

  const blockedDates = useMemo(() => {
    const dates = new Set<string>();
    SYSTEM_BLOCKED_DATES.forEach(d => dates.add(d));
    try {
      const cmsBlockages = getDateBlockages();
      if (Array.isArray(cmsBlockages)) {
        cmsBlockages.forEach((b: any) => {
          if (b.status === 'fully_booked' || b.status === 'blocked') {
            dates.add(b.date);
          }
        });
      }
    } catch (e) {
      console.warn('Could not read CMS blockages:', e);
    }
    return dates;
  }, [SYSTEM_BLOCKED_DATES]);

  const isTourInVisualCategory = (tour: any, categoryId: string) => {
    if (categoryId === 'All') return true;
    const catObj = visualCategories.find(c => c.id === categoryId);
    if (!catObj) return false;
    
    const titleAndDesc = ((tour.name || '') + ' ' + (tour.description || '') + ' ' + (tour.category || '')).toLowerCase();
    return catObj.keywords.some(kw => titleAndDesc.includes(kw));
  };

  const filteredTours = useMemo(() => {
    return activeTours.filter(tour => {
      // Category filter
      if (selectedCategory !== 'All') {
        if (!isTourInVisualCategory(tour, selectedCategory)) return false;
      }

      // Search bar query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          (tour.name || '').toLowerCase().includes(query) ||
          (tour.description || '').toLowerCase().includes(query) ||
          (tour.location || '').toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Duration Filter
      if (durationFilter !== 'All') {
        const durText = String(tour.duration).toLowerCase();
        if (durationFilter === 'Half Day') {
          const isHalf = durText.includes('half') || durText.includes('3 hr') || durText.includes('4 hr') || durText.includes('5 hr');
          if (!isHalf) return false;
        } else if (durationFilter === 'Full Day') {
          const isFull = durText.includes('full') || durText.includes('8 hr') || durText.includes('6 hr') || durText.includes('day trip');
          if (!isFull) return false;
        }
      }

      // Budget Filter
      const tourPrice = typeof tour.price === 'number' ? tour.price : parseFloat(String(tour.price).replace(/[^0-9.]/g, '')) || 0;
      if (budgetFilter !== 'All') {
        if (budgetFilter === 'Under $50') {
          if (tourPrice > 50) return false;
        } else if (budgetFilter === '$50–100') {
          if (tourPrice <= 50 || tourPrice > 100) return false;
        } else if (budgetFilter === '$100+') {
          if (tourPrice <= 100) return false;
        }
      }

      // Travel Date Blockage Check
      if (selectedDate && blockedDates.has(selectedDate)) return false;

      return true;
    });
  }, [activeTours, selectedCategory, searchQuery, durationFilter, budgetFilter, selectedDate, blockedDates]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (durationFilter !== 'All') count++;
    if (budgetFilter !== 'All') count++;
    if (selectedDate !== '') count++;
    return count;
  }, [durationFilter, budgetFilter, selectedDate]);

  const handleClearAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setDurationFilter('All');
    setBudgetFilter('All');
    setSelectedDate('');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900">
      
      {/* Hero Banner Section */}
      <section className="relative h-[65vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1920')",
            transform: `translateY(${scrollY * 0.15}px)`
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1224]/85 via-[#0A1224]/50 to-[#FAF9F6]" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full shadow-lg">
            <span className="text-[#D4A017] text-xs font-black tracking-widest uppercase font-mono">Licensed Zanzibari Operator</span>
          </div>
          
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight drop-shadow-xl"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Zanzibar Tours & Excursions
          </h1>
          
          <p className="text-sm md:text-lg text-white/90 max-w-xl mx-auto leading-relaxed font-medium">
            Discover paradise at your own pace. Hand-crafted private island adventures, crystal-clear snorkeling reefs, and authentic historical walks with native historians.
          </p>

          <div className="flex items-center justify-center gap-6 pt-3 text-white/90 text-xs font-bold uppercase tracking-wider flex-wrap">
            <div className="flex items-center gap-1.5">
              <Star className="text-[#D4A017] shrink-0" size={13} fill="currentColor" />
              <span>4.9/5 Trust Rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="text-emerald-400 shrink-0" size={14} />
              <span>Private Ground Vehicles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="text-[#D4A017] shrink-0" size={14} />
              <span>No Hidden Fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tours Explorer Area */}
      <section className="py-16 max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        
        {/* Luxury Experience Categories Selector */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[#0B3B8C] uppercase tracking-wider">Choose Experience Category</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Filter our local excursions by type of activity to discover your perfect pace.</p>
            </div>
            {selectedCategory !== 'All' && (
              <button 
                onClick={() => setSelectedCategory('All')} 
                className="text-xs font-black text-[#D4A017] hover:underline uppercase tracking-wider self-start"
              >
                Show All ({activeTours.length} tours)
              </button>
            )}
          </div>

          {/* Premium category list of pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-4 scrollbar-thin">
            {visualCategories.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-3.5 rounded-2xl flex items-center gap-2.5 shrink-0 transition-all shadow-sm border cursor-pointer ${
                    isSelected 
                      ? 'bg-[#0B3B8C] text-white border-[#0B3B8C] scale-102 font-black shadow-md' 
                      : 'bg-white text-slate-600 border-slate-200/60 hover:border-slate-300 hover:text-[#0B3B8C]'
                  }`}
                >
                  <Icon size={16} className={isSelected ? 'text-[#D4A017]' : 'text-slate-400'} />
                  <span className="text-xs font-extrabold uppercase tracking-wider">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Discovery Filter Controls */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Left search */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search excursion title, beach, keywords..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-4 py-3 text-xs font-semibold focus:bg-white focus:border-[#0B3B8C] focus:outline-none transition-all"
            />
          </div>

          {/* Right dropdown filters */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Quick Trigger Filters Toggle */}
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`px-4.5 py-3 rounded-full text-[11px] font-black uppercase tracking-wider border flex items-center gap-2 cursor-pointer transition-all ${
                showFiltersPanel || activeFiltersCount > 0
                  ? 'bg-[#0B3B8C]/5 text-[#0B3B8C] border-[#0B3B8C]/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <SlidersHorizontal size={12} />
              <span>More Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#D4A017] text-[#0A1224] text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button 
                onClick={handleClearAllFilters} 
                className="text-[10px] text-slate-500 hover:text-red-600 font-extrabold uppercase tracking-widest underline decoration-dashed"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Expanded filter panel drawers */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-md grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="space-y-1.5">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Trip Duration</span>
                <select
                  value={durationFilter}
                  onChange={e => setDurationFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Durations</option>
                  <option value="Half Day">Half Day (1–5 hours)</option>
                  <option value="Full Day">Full Day (6+ hours)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Max Budget</span>
                <select
                  value={budgetFilter}
                  onChange={e => setBudgetFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Budgets</option>
                  <option value="Under $50">Under $50 USD</option>
                  <option value="$50–100">$50 to $100 USD</option>
                  <option value="$100+">$100+ USD</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Date Check</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>

              {selectedDate && blockedDates.has(selectedDate) && (
                <div className="col-span-full bg-red-50 text-red-700 border border-red-100 p-4 rounded-xl text-xs font-semibold">
                  * Selected date is currently blocked or fully booked. Please try an alternative date.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Tours Discover List */}
        {filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour, idx) => (
              <div 
                key={`${tour.id}-${tour.category}-${idx}`} 
                onClick={() => navigate('tour-detail', (tour.name || '').toLowerCase().replace(/\s+/g, '-'))}
                className="group bg-white rounded-3xl border border-slate-200/50 hover:border-slate-200 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[480px] overflow-hidden cursor-pointer"
              >
                
                {/* Image & Badges */}
                <div className="relative h-52 overflow-hidden bg-slate-50 shrink-0">
                  <ProgressiveImage src={tour.image} alt={tour.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" />
                  
                  {/* Floating Left Badge */}
                  <div className="absolute top-4 left-4 bg-[#0B3B8C] text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    {tour.badge || 'Private Excursion'}
                  </div>

                  {/* Wishlist Heart */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist({
                        id: tour.id,
                        name: tour.name,
                        price: tour.price,
                        duration: tour.duration,
                        image: tour.image,
                        type: 'tour'
                      });
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full cursor-pointer z-10 transition-colors shadow-sm ${
                      isInWishlist(tour.id) ? 'bg-[#D4A017] text-white' : 'bg-white/95 hover:bg-white text-slate-600'
                    }`}
                  >
                    <Heart size={14} fill={isInWishlist(tour.id) ? "currentColor" : "none"} />
                  </button>

                  {/* Price */}
                  <span className="absolute bottom-4 right-4 bg-black/85 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-xl border border-white/10 shadow-lg">
                    from {formatPrice(tour.price)}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      <MapPin size={11} className="text-[#D4A017]" />
                      <span>{tour.location}</span>
                    </div>

                    <h3 
                      className="font-extrabold text-base sm:text-lg text-[#0B3B8C] hover:text-[#D4A017] transition-colors leading-snug line-clamp-1"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      {tour.name}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">
                      {tour.description}
                    </p>

                    {/* Standard details */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-black text-slate-450 uppercase tracking-widest bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5"><Clock size={11} className="text-[#0B3B8C]" /> {tour.duration}</div>
                      <div className="flex items-center gap-1.5"><Users size={11} className="text-[#0B3B8C]" /> {tour.groupSize}</div>
                    </div>

                    {/* Checkmarks */}
                    <div className="space-y-1 pt-1.5">
                      {tour.highlights.slice(0, 2).map((h: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-slate-600 font-bold">
                          <Check size={11} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex gap-2.5 pt-4 border-t border-slate-100 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('tour-detail', (tour.name || '').toLowerCase().replace(/\s+/g, '-'));
                      }}
                      className="flex-1 border border-slate-200 hover:border-[#0B3B8C] text-slate-600 hover:text-[#0B3B8C] font-bold text-xs uppercase tracking-wider py-3 rounded-full transition-colors cursor-pointer text-center bg-white"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        localStorage.setItem('booking_prefilled_category', 'tour');
                        localStorage.setItem('booking_prefilled_tour', tour.name);
                        navigate('booking', `package=${encodeURIComponent(tour.name)}`);
                      }}
                      className="flex-1 bg-[#D4A017] hover:bg-opacity-95 text-[#0A1224] font-black text-xs uppercase tracking-wider py-3 rounded-full shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Book Now</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
            <p className="text-slate-800 font-extrabold text-sm uppercase tracking-wider">No Excursions Found</p>
            <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
              We couldn't find any tours matching your active criteria. Try removing some filters or change categories.
            </p>
            <button 
              onClick={handleClearAllFilters} 
              className="px-5 py-2.5 bg-[#0B3B8C] text-white text-xs font-black uppercase rounded-full shadow hover:bg-opacity-95"
            >
              Reset Filters
            </button>
          </div>
        )}

      </section>

      {/* Bottom bespoke traveler card */}
      <section className="py-20 bg-[#0A1224] text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,160,23,0.05),transparent_50%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-4 space-y-6 relative z-10">
          <span className="text-[#D4A017] text-xs font-black uppercase tracking-widest bg-[#D4A017]/10 px-4.5 py-2 rounded-full">
            Tailor-made itineraries
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Want a Custom Excursion Program?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium">
            Plan a specialized private boat charter, dynamic spice farm walking paths, private beach bonfires, or group team building. Speak to our local travel architects directly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={() => navigate('booking')}
              className="w-full sm:w-auto bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-black px-8 py-4 rounded-full text-xs uppercase tracking-wider transition-all"
            >
              Custom Booking Request
            </button>
            <a
              href="https://wa.me/255629506063"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebd5a] text-white font-black px-8 py-4 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <MessageCircle size={15} fill="white" /> Chat with Experts
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
