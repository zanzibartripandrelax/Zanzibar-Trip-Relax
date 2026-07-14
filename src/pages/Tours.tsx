import { useState, useEffect, useMemo } from 'react';
import { Page } from '../hooks/useHashRouter';
import { tours as staticTours } from '../data/tours';
import { getSiteContent, getDateBlockages } from '../lib/cmsStore';
import { Clock, Users, Star, ArrowRight, Compass, Check, MapPin, Search, Filter, Calendar, DollarSign, ChevronDown, ChevronUp, SlidersHorizontal, Info, Sparkles, AlertTriangle, Heart } from 'lucide-react';
import { ProgressiveImage } from '../components/ProgressiveImage';
import TourComparison from '../components/TourComparison';
import { useScrollY } from '../hooks/useScrollY';
import { usePreferences } from '../context/UserPreferencesContext';
import SmartTourRecommendations from '../components/SmartTourRecommendations';
import { useWishlist } from '../hooks/useWishlist';

interface ToursProps {
  navigate: (page: Page, id?: string) => void;
  queryParams?: Record<string, string>;
}

const categories = ['All', 'Full-Day Tours', 'Half-Day Tours', 'Marine Tours', 'Nature Tours', 'Cultural Tours', 'Luxury Tours', 'Adventure Tours'];

export default function Tours({ navigate, queryParams }: ToursProps) {
  const { formatPrice } = usePreferences();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const scrollY = useScrollY();
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (queryParams?.category) {
      const found = categories.find(c => c.toLowerCase() === queryParams.category.toLowerCase());
      if (found) return found;
    }
    return 'All';
  });
  const [searchQuery, setSearchQuery] = useState(queryParams?.search || '');
  
  // Advanced search and dynamic filtering parameters
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [maxPrice, setMaxPrice] = useState(350);
  const [selectedTourStyle, setSelectedTourStyle] = useState('All');
  const [guestCount, setGuestCount] = useState(2);
  const [selectedDeparture, setSelectedDeparture] = useState('All');
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  // System-level booked dates
  const SYSTEM_BLOCKED_DATES = useMemo(() => [
    '2026-07-15', '2026-07-16', '2026-07-17', // Fully Booked peak safari slots
    '2026-08-10', '2026-08-11',              // Zanzibar Cultural Festival Blockouts
    '2026-12-25', '2026-12-31', '2027-01-01'  // Premium high-season private party blocks
  ], []);

  // Compute combined blockout dates dynamically
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

  const filteredTours = useMemo(() => {
    return activeTours.filter(tour => {
      // 1. Category Filter
      let matchesCategory = true;
      if (selectedCategory !== 'All') {
        const cat = selectedCategory;
        const durText = String(tour.duration).toLowerCase();
        const titleAndDesc = (tour.name + ' ' + tour.description + ' ' + (tour.category || '')).toLowerCase();
        const tourPrice = typeof tour.price === 'number' ? tour.price : parseFloat(String(tour.price).replace(/[^0-9.]/g, '')) || 0;
        
        if (cat === 'Full-Day Tours') {
          matchesCategory = durText.includes('full day') || durText.includes('8 hr') || durText.includes('6 hr') || durText.includes('7 hr') || durText.includes('full-day');
        } else if (cat === 'Half-Day Tours') {
          matchesCategory = durText.includes('half day') || durText.includes('4 hr') || durText.includes('3 hr') || durText.includes('5 hr') || durText.includes('half-day');
        } else if (cat === 'Marine Tours') {
          matchesCategory = titleAndDesc.includes('ocean') || titleAndDesc.includes('snorkeling') || titleAndDesc.includes('marine') || titleAndDesc.includes('dhow') || titleAndDesc.includes('swim') || titleAndDesc.includes('sandbank') || titleAndDesc.includes('reef') || tour.category === 'Ocean';
        } else if (cat === 'Nature Tours') {
          matchesCategory = titleAndDesc.includes('nature') || titleAndDesc.includes('forest') || titleAndDesc.includes('spice') || titleAndDesc.includes('wildlife') || titleAndDesc.includes('zoo') || tour.category === 'Nature';
        } else if (cat === 'Cultural Tours') {
          matchesCategory = titleAndDesc.includes('culture') || titleAndDesc.includes('history') || titleAndDesc.includes('town') || titleAndDesc.includes('heritage') || tour.category === 'Culture';
        } else if (cat === 'Luxury Tours') {
          matchesCategory = titleAndDesc.includes('luxury') || titleAndDesc.includes('premium') || titleAndDesc.includes('private') || tourPrice >= 75;
        } else if (cat === 'Adventure Tours') {
          matchesCategory = titleAndDesc.includes('adventure') || titleAndDesc.includes('quad') || titleAndDesc.includes('climb') || titleAndDesc.includes('safari') || tour.category === 'Adventure';
        }
      }

      // 2. Search query filter
      const matchesSearch = !searchQuery ? true : (
        tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tour.includes && tour.includes.some((inc: string) => inc.toLowerCase().includes(searchQuery.toLowerCase())))
      );

      // 3. Destination Filter
      let matchesDestination = true;
      if (selectedDestination !== 'All') {
        const dest = selectedDestination.toLowerCase();
        const textToSearch = (tour.name + ' ' + tour.description).toLowerCase();
        matchesDestination = textToSearch.includes(dest) || 
          (dest === 'stone town' && textToSearch.includes('stone town')) ||
          (dest === 'mnemba' && textToSearch.includes('mnemba')) ||
          (dest === 'prison island' && textToSearch.includes('prison')) ||
          (dest === 'jozani' && textToSearch.includes('jozani')) ||
          (dest === 'spice farm' && textToSearch.includes('spice')) ||
          (dest === 'nungwi' && textToSearch.includes('nungwi'));
      }

      // 4. Departure Filter
      let matchesDeparture = true;
      if (selectedDeparture !== 'All') {
        const dep = selectedDeparture.toLowerCase();
        const textToSearch = (tour.name + ' ' + tour.description + ' ' + (tour.groupSize || '')).toLowerCase();
        matchesDeparture = textToSearch.includes(dep) || 
          (dep === 'stone town' && textToSearch.includes('town')) ||
          (dep === 'nungwi' && textToSearch.includes('nungwi')) ||
          (dep === 'paje' && textToSearch.includes('paje')) ||
          (dep === 'kiwengwa' && textToSearch.includes('kiwengwa'));
      }

      // 5. Duration Filter
      let matchesDuration = true;
      if (selectedDuration !== 'All') {
        const durText = String(tour.duration).toLowerCase();
        const hoursMatch = durText.match(/(\d+)\s*(hour|hr)/i);
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const daysMatch = durText.match(/(\d+)\s*(day)/i);
        const days = daysMatch ? parseInt(daysMatch[1]) : 0;

        if (selectedDuration === 'Half Day') {
          matchesDuration = (hours > 0 && hours <= 5 && days === 0) || durText.includes('half day');
        } else if (selectedDuration === 'Full Day') {
          matchesDuration = (hours > 5 && hours <= 12) || durText.includes('full day') || durText.includes('day trip') || durText.includes('excursion');
        } else if (selectedDuration === 'Multi-Day') {
          matchesDuration = days > 0 || hours > 12 || durText.includes('days') || durText.includes('night');
        }
      }

      // 6. Price Filter
      const tourPrice = typeof tour.price === 'number' ? tour.price : parseFloat(String(tour.price).replace(/[^0-9.]/g, '')) || 0;
      const matchesPrice = tourPrice <= maxPrice;

      // 7. Tour Style Filter (Private vs Group/Shared)
      let matchesTourStyle = true;
      if (selectedTourStyle !== 'All') {
        const titleAndDesc = (tour.name + ' ' + tour.description + ' ' + (tour.badge || '')).toLowerCase();
        if (selectedTourStyle === 'Private') {
          matchesTourStyle = titleAndDesc.includes('private') || titleAndDesc.includes('exclusive') || titleAndDesc.includes('charter');
        } else if (selectedTourStyle === 'Group') {
          matchesTourStyle = titleAndDesc.includes('group') || titleAndDesc.includes('shared') || titleAndDesc.includes('public');
        } else if (selectedTourStyle === 'Luxury') {
          matchesTourStyle = titleAndDesc.includes('luxury') || titleAndDesc.includes('premium') || tourPrice > 100;
        } else if (selectedTourStyle === 'Budget') {
          matchesTourStyle = titleAndDesc.includes('budget') || titleAndDesc.includes('cheap') || tourPrice <= 65;
        }
      }

      // 8. Guest Capacity Filter
      let matchesGuests = true;
      if (guestCount > 1) {
        const groupSizeText = String(tour.groupSize).toLowerCase();
        // Check for common capacity ranges e.g. "1-15 people", "up to 6 guests"
        const maxMatch = groupSizeText.match(/up to\s*(\d+)/) || groupSizeText.match(/1–(\d+)/) || groupSizeText.match(/(\d+)\s*max/);
        if (maxMatch) {
          const maxCap = parseInt(maxMatch[1]);
          if (maxCap > 0) {
            matchesGuests = guestCount <= maxCap;
          }
        }
      }

      // 9. Date Booking Blockage Availability
      let matchesDate = true;
      if (selectedDate) {
        const isBlocked = blockedDates.has(selectedDate);
        if (isBlocked) {
          matchesDate = false;
        }
      }

      return matchesCategory && matchesSearch && matchesDestination && matchesDeparture && matchesDuration && matchesPrice && matchesTourStyle && matchesGuests && matchesDate;
    });
  }, [
    activeTours, selectedCategory, searchQuery, selectedDestination, selectedDeparture,
    selectedDuration, maxPrice, selectedTourStyle, guestCount, selectedDate, blockedDates
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedDestination !== 'All') count++;
    if (selectedDeparture !== 'All') count++;
    if (selectedDuration !== 'All') count++;
    if (selectedTourStyle !== 'All') count++;
    if (selectedDate !== '') count++;
    if (guestCount > 1) count++;
    if (maxPrice < 350) count++;
    return count;
  }, [selectedDestination, selectedDeparture, selectedDuration, selectedTourStyle, selectedDate, guestCount, maxPrice]);

  const handleClearAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedDestination('All');
    setSelectedDate('');
    setSelectedDuration('All');
    setMaxPrice(350);
    setSelectedTourStyle('All');
    setGuestCount(2);
    setSelectedDeparture('All');
  };

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
      <section className="bg-white shadow-md border-b sticky top-[68px] lg:top-[80px] z-30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            
            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 w-full lg:w-auto scrollbar-none">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all shrink-0 ${
                    selectedCategory === cat 
                      ? 'bg-[#0B3B8C] text-white shadow-md shadow-[#0B3B8C]/15 border border-[#0B3B8C]' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input and Collapsible Trigger */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search destination, style, activity..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm focus:border-[#0B3B8C] focus:ring-1 focus:ring-[#0B3B8C] focus:outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Advanced Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border shrink-0 ${
                  showAdvanced || activeFiltersCount > 0
                    ? 'bg-[#0B3B8C]/10 text-[#0B3B8C] border-[#0B3B8C]/35'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-transparent'
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#D4A017] text-[#020C1F] text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                    {activeFiltersCount}
                  </span>
                )}
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* Clear filters shortcut */}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-xs text-gray-500 hover:text-red-500 font-bold transition-all uppercase tracking-wider shrink-0 underline"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Advanced Filters Drawer Panel */}
          {showAdvanced && (
            <div className="border-t border-gray-100 pt-4 pb-2 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                
                {/* Destination Dropdown */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">Excursion Location</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B3B8C]" />
                    <select
                      value={selectedDestination}
                      onChange={e => setSelectedDestination(e.target.value)}
                      className="w-full text-xs font-bold text-gray-800 bg-gray-50/70 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 appearance-none focus:outline-none focus:border-[#0B3B8C] cursor-pointer"
                    >
                      <option value="All">All Locations (Island Wide)</option>
                      <option value="Stone Town">Stone Town Historical</option>
                      <option value="Mnemba">Mnemba Atoll Snorkeling</option>
                      <option value="Prison Island">Prison Island Reef</option>
                      <option value="Jozani">Jozani Forest Biosphere</option>
                      <option value="Spice Farm">Spice Farm Plantations</option>
                      <option value="Nungwi">Nungwi Beach & Aquarium</option>
                    </select>
                  </div>
                </div>

                {/* Departure Location */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">Departure Point</label>
                  <div className="relative">
                    <Compass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B3B8C]" />
                    <select
                      value={selectedDeparture}
                      onChange={e => setSelectedDeparture(e.target.value)}
                      className="w-full text-xs font-bold text-gray-800 bg-gray-50/70 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 appearance-none focus:outline-none focus:border-[#0B3B8C] cursor-pointer"
                    >
                      <option value="All">All Departures</option>
                      <option value="Stone Town">Stone Town Pier</option>
                      <option value="Nungwi">Nungwi Beach Front</option>
                      <option value="Paje">Paje Kite-Reef Point</option>
                      <option value="Kiwengwa">Kiwengwa Beach Pier</option>
                    </select>
                  </div>
                </div>

                {/* Travel Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">Desired Travel Date</label>
                  <div className="relative">
                    <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B3B8C]" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="w-full text-xs font-bold text-gray-800 bg-gray-50/70 border border-gray-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#0B3B8C] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Duration Filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">Excursion Duration</label>
                  <div className="relative">
                    <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B3B8C]" />
                    <select
                      value={selectedDuration}
                      onChange={e => setSelectedDuration(e.target.value)}
                      className="w-full text-xs font-bold text-gray-800 bg-gray-50/70 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 appearance-none focus:outline-none focus:border-[#0B3B8C] cursor-pointer"
                    >
                      <option value="All">All Durations</option>
                      <option value="Half Day">Half Day (1–5 hours)</option>
                      <option value="Full Day">Full Day (6–12 hours)</option>
                      <option value="Multi-Day">Multi-Day Trips</option>
                    </select>
                  </div>
                </div>

                {/* Tour Style */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">Tour Style / Budget</label>
                  <div className="relative">
                    <Sparkles size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A017]" />
                    <select
                      value={selectedTourStyle}
                      onChange={e => setSelectedTourStyle(e.target.value)}
                      className="w-full text-xs font-bold text-gray-800 bg-gray-50/70 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 appearance-none focus:outline-none focus:border-[#0B3B8C] cursor-pointer"
                    >
                      <option value="All">All Tour Styles</option>
                      <option value="Private">Private / Exclusive Charter</option>
                      <option value="Group">Shared / Group Excursion</option>
                      <option value="Luxury">Luxury / Premium Package</option>
                      <option value="Budget">Budget / Economy Friendly</option>
                    </select>
                  </div>
                </div>

                {/* Guest Count */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">Guest Count</label>
                  <div className="relative">
                    <Users size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B3B8C]" />
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={guestCount}
                      onChange={e => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-xs font-bold text-gray-800 bg-gray-50/70 border border-gray-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#0B3B8C]"
                    />
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="space-y-1 sm:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Max Package Price</label>
                    <span className="text-xs font-black text-[#0B3B8C]">{formatPrice(maxPrice)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 font-bold">$10</span>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="5"
                      value={maxPrice}
                      onChange={e => setMaxPrice(parseInt(e.target.value))}
                      className="w-full accent-[#0B3B8C] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-[10px] text-gray-400 font-bold">$500</span>
                  </div>
                </div>

              </div>
              
              {/* Blockout Dates Warning Alert */}
              {selectedDate && blockedDates.has(selectedDate) && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start animate-pulse">
                  <AlertTriangle className="text-red-500 shrink-0 w-5 h-5" />
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-red-950 uppercase tracking-wider">Date is Blocked or Fully Booked</h5>
                    <p className="text-[11px] text-red-700 leading-relaxed font-semibold">
                      Your chosen travel date <strong className="text-red-900">{selectedDate}</strong> is a high-demand peak blockout slot or fully booked. Please select another date, or clear the date filter to review other available times.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
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
                  <div className="relative h-56 overflow-hidden group cursor-pointer">
                    <div onClick={() => navigate('tour-detail', tour.name.toLowerCase().replace(/\s+/g, '-'))} className="w-full h-full">
                      <ProgressiveImage src={tour.image} alt={tour.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="absolute top-3 left-3 bg-[#0B3B8C] text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                      {tour.badge || tour.category}
                    </div>
                    
                    {/* Wishlist Button */}
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
                      className={`absolute top-3 right-3 p-2 rounded-full z-10 transition-all ${
                        isInWishlist(tour.id)
                          ? 'bg-[#D4A017] text-white shadow-lg'
                          : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <Heart size={16} fill={isInWishlist(tour.id) ? "currentColor" : "none"} />
                    </button>

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
