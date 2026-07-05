import { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { tours as staticTours } from '../data/tours';
import { getSiteContent } from '../lib/cmsStore';
import { Clock, Users, Star, ArrowRight, Compass, Check, MapPin } from 'lucide-react';
import { ProgressiveImage } from '../components/ProgressiveImage';
import TourComparison from '../components/TourComparison';
import InteractiveMap from '../components/InteractiveMap';
import { useScrollY } from '../hooks/useScrollY';
import { usePreferences } from '../context/UserPreferencesContext';
import SmartTourRecommendations from '../components/SmartTourRecommendations';

interface ToursProps {
  navigate: (page: Page, id?: string) => void;
  queryParams?: Record<string, string>;
}

const categories = ['All', 'Culture', 'Ocean', 'Island', 'Nature', 'Adventure'];

export default function Tours({ navigate, queryParams }: ToursProps) {
  const { formatPrice } = usePreferences();
  const scrollY = useScrollY();
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (queryParams?.category) {
      const found = categories.find(c => c.toLowerCase() === queryParams.category.toLowerCase());
      if (found) return found;
    }
    return 'All';
  });
  const [searchQuery, setSearchQuery] = useState(queryParams?.search || '');

  useEffect(() => {
    if (queryParams?.category) {
      const found = categories.find(c => c.toLowerCase() === queryParams.category.toLowerCase());
      if (found) {
        setSelectedCategory(found);
      }
    } else if (queryParams && !queryParams.category) {
      setSelectedCategory('All');
    }
    if (queryParams?.search) {
      setSearchQuery(queryParams.search);
    } else if (queryParams && !queryParams.search) {
      setSearchQuery('');
    }
  }, [queryParams]);
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('zanzibar_compare_tours');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [limitWarning, setLimitWarning] = useState(false);

  const handleToggleCompare = (id: string) => {
    setSelectedTourIds(prev => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter(x => x !== id);
        setLimitWarning(false);
      } else {
        if (prev.length >= 4) {
          setLimitWarning(true);
          setTimeout(() => setLimitWarning(false), 4000);
          return prev;
        }
        next = [...prev, id];
        setLimitWarning(false);
      }
      localStorage.setItem('zanzibar_compare_tours', JSON.stringify(next));
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedTourIds([]);
    localStorage.removeItem('zanzibar_compare_tours');
    setLimitWarning(false);
  };

  const cmsContent = getSiteContent();
  const seenTitles = new Set<string>();
  const activeTours = [];

  for (const t of cmsContent.tours) {
    if (t.visible === false) continue;
    const normTitle = t.title.trim().toLowerCase();
    if (seenTitles.has(normTitle)) continue;
    seenTitles.add(normTitle);

    // Check if we can find matching static tour for advanced metadata (includes, exclusions)
    const staticWalk = staticTours.find(st => 
      st.id === t.id || 
      st.name.toLowerCase() === t.title.toLowerCase() ||
      t.title.toLowerCase().includes(st.name.toLowerCase()) ||
      st.name.toLowerCase().includes(t.title.toLowerCase()) ||
      (t.title.includes('Safari Blue') && st.id === 'safari-blue') ||
      (t.title.includes('Mnemba') && st.id === 'mnemba-snorkeling') ||
      (t.title.includes('Stone Town') && st.id === 'stone-town') ||
      (t.title.includes('Prison Island') && st.id === 'prison-island') ||
      (t.title.includes('Spice Farm') && st.id === 'spice-farm') ||
      (t.title.includes('Jozani Forest') && st.id === 'jozani-forest')
    );

    activeTours.push({
      id: t.id,
      name: t.title,
      description: t.desc,
      longDescription: t.desc,
      price: t.price,
      duration: t.duration,
      groupSize: staticWalk?.groupSize || '1–15 people',
      includes: staticWalk?.includes || ['Local guide', 'Bottled water', 'Entrance fees'],
      image: t.img,
      badge: staticWalk?.badge || (t.category === 'tour' ? 'Best Seller' : t.category),
      category: staticWalk?.category || (t.category.charAt(0).toUpperCase() + t.category.slice(1)),
    });
  }

  const filteredTours = activeTours.filter(tour => {
    const matchesCategory = selectedCategory === 'All' || tour.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tour.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/1433052/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1600')",
            transform: `translateY(${scrollY * 0.3}px) scale(1.15)`
          }} 
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center px-4 pt-16" style={{ transform: `translateY(-${scrollY * 0.1}px)` }}>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Tour Packages
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Discover the magic of Zanzibar with our handcrafted day trips and excursions
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="bg-white shadow-sm border-b sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto scrollbar-none">
            {categories.map(cat => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${selectedCategory === cat ? 'bg-[#0B3B8C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Search tours..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-full px-4 py-2 text-sm focus:border-[#0B3B8C] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Interactive Map Explorer */}
      <section className="pt-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 bg-[#D4A017]/10 text-[#D4A017] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 font-mono border border-[#D4A017]/25">
              <MapPin size={10} className="animate-bounce" />
              <span>Zanzibar Destination Pins</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
              Zanzibar Excursion Interactive Map
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              Locate, zoom in, and visualize where your Zanzibar excursions, historical sites, and dolphin reefs are located across the archipelago.
            </p>
          </div>
          <InteractiveMap mode="tours" />
        </div>
      </section>

      {/* Smart Recommendations */}
      <section className="pt-12 px-4">
        <div className="max-w-7xl mx-auto">
          <SmartTourRecommendations navigate={navigate} />
        </div>
      </section>

      {/* Tour Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map(tour => (
                <div key={tour.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden group cursor-pointer" onClick={() => navigate('tour-detail', tour.name.toLowerCase().replace(/\s+/g, '-'))}>
                    <ProgressiveImage src={tour.image} alt={tour.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-3 left-3 bg-[#0B3B8C] text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                      {tour.badge || tour.category}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/95 text-[#0B3B8C] text-sm font-bold px-3 py-1 rounded-lg font-mono">
                      {formatPrice(tour.price)}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-[#0B3B8C] mb-2 cursor-pointer" onClick={() => navigate('tour-detail', tour.name.toLowerCase().replace(/\s+/g, '-'))} style={{ fontFamily: 'Playfair Display, serif' }}>
                      {tour.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1">{tour.description}</p>

                    {/* Metadata & Compare toggle */}
                    <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mb-6">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {tour.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} /> {tour.groupSize}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleCompare(tour.id)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                          selectedTourIds.includes(tour.id)
                            ? 'bg-[#D4A017] text-[#0A1224] border-[#D4A017] shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-transparent'
                        }`}
                      >
                        {selectedTourIds.includes(tour.id) ? (
                          <>
                            <Check size={11} className="stroke-[3]" />
                            <span>Comparing</span>
                          </>
                        ) : (
                          <>
                            <span>+ Compare</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* CTAs */}
                    <div className="flex gap-2 border-t pt-4">
                      <button
                        type="button"
                        onClick={() => navigate('tour-detail', tour.name.toLowerCase().replace(/\s+/g, '-'))}
                        className="flex-1 border-2 border-gray-200 text-gray-600 hover:border-[#0B3B8C] hover:text-[#0B3B8C] font-semibold py-2.5 rounded-full text-xs transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.setItem('booking_prefilled_category', 'tour');
                          localStorage.setItem('booking_prefilled_tour', tour.name);
                          navigate('booking', `package=${encodeURIComponent(tour.name)}`);
                        }}
                        className="flex-1 bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-bold py-2.5 rounded-full text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Book Now <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <Compass className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">No tour packages match your search criteria.</p>
              <button type="button" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="text-[#0B3B8C] font-semibold mt-2 hover:underline">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Customize CTA */}
      <section className="py-20 px-4 bg-[#0B1E3D] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Want to Build a Custom Itinerary?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Choose exactly what you want to see, do, and experience in Zanzibar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button type="button" onClick={() => navigate('trip-builder')} className="bg-[#D4A017] hover:bg-[#c49010] text-white font-semibold px-8 py-3.5 rounded-full transition-colors">
              Start Trip Builder
            </button>
            <button type="button" onClick={() => navigate('contact')} className="border-2 border-white/20 hover:border-white font-semibold px-8 py-3.5 rounded-full transition-colors">
              Contact Our Experts
            </button>
          </div>
        </div>
      </section>

      {/* Tour Comparison Bar / Side-by-Side Modal overlay */}
      <TourComparison
        navigate={navigate}
        selectedTourIds={selectedTourIds}
        onToggleCompare={handleToggleCompare}
        onClearAll={handleClearAll}
      />

      {/* Floating toast notification warning when maximum of 4 tours are selected */}
      {limitWarning && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white font-extrabold text-xs uppercase px-4 py-3 rounded-2xl shadow-2xl border border-rose-500 animate-bounce tracking-widest font-mono">
          ⚠️ Maximum of 4 tours can be compared at once!
        </div>
      )}
    </div>
  );
}
