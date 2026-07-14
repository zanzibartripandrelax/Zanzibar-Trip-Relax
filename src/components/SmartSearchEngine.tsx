import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Calendar as CalendarIcon, Users, Search, 
  ChevronRight, Plus, Minus, Check, ChevronDown, X, Compass,
  Star, Award, Sparkles, TrendingUp, CheckCircle2, Clock, 
  AlertTriangle, ArrowRight, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Page } from '../hooks/useHashRouter';

interface SmartSearchEngineProps {
  navigate: (page: Page, id?: string) => void;
}

// 1. HIGHLY TARGETED SEARCHABLE ITEMS (Tours, Safaris, Kilimanjaro climbs, Packages)
interface SearchableItem {
  id: string;
  title: string;
  category: 'packages' | 'safari' | 'kilimanjaro' | 'tour';
  destination: 'zanzibar' | 'mainland' | 'kilimanjaro';
  basePrice: number;
  standardNights: number;
  extraNightPrice: number;
  durationText: string;
  image: string;
  summary: string;
  highlights: string[];
  rating: number;
  reviewsCount: number;
  matchTags: string[];
  maxAdults: number;
  maxChildren: number;
  suitability: 'Couples' | 'Families' | 'Groups' | 'Solo' | 'All';
}

const searchableItems: SearchableItem[] = [
  {
    id: '3-day-escape',
    title: '3-Day Zanzibar Romantic Escape',
    category: 'packages',
    destination: 'zanzibar',
    basePrice: 350,
    standardNights: 2,
    extraNightPrice: 95,
    durationText: '3 Days / 2 Nights',
    image: 'https://images.pexels.com/photos/1547843/pexels-photo-1547843.jpeg?auto=compress&cs=tinysrgb&w=800',
    summary: 'Perfect for couples, honeymooners, and weekend travelers who want an intimate, high-comfort luxury taste of Zanzibar’s historical charm.',
    highlights: ['Boutique historic riad stay', 'Prison Island Giant Tortoises', 'Private waterfront dhow sail', 'Rooftop candle-lit dinner'],
    rating: 4.9,
    reviewsCount: 142,
    matchTags: ['Couples Choice', 'Romantic Highlight', 'Short Escape'],
    maxAdults: 2,
    maxChildren: 1,
    suitability: 'Couples'
  },
  {
    id: '5-day-beach-adventure',
    title: '5-Day Ultimate Beach & Tour Adventure',
    category: 'packages',
    destination: 'zanzibar',
    basePrice: 650,
    standardNights: 4,
    extraNightPrice: 110,
    durationText: '5 Days / 4 Nights',
    image: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800',
    summary: 'Our legendary best-selling holiday package. Combining historic architecture, world-class dhow sailing, and pristine reef snorkeling.',
    highlights: ['Safari Blue sailing cruise', 'Organic spice farms walk', 'Muyuni Bay snorkeling', 'Nungwi beachfront luxury'],
    rating: 5.0,
    reviewsCount: 310,
    matchTags: ['Best Seller', 'Adventure Combo', 'Beaches Master'],
    maxAdults: 6,
    maxChildren: 4,
    suitability: 'Families'
  },
  {
    id: '7-day-zanzibar-combo',
    title: '7-Day Heritage, Nature & Ocean Combo',
    category: 'packages',
    destination: 'zanzibar',
    basePrice: 1150,
    standardNights: 6,
    extraNightPrice: 125,
    durationText: '7 Days / 6 Nights',
    image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800',
    summary: 'A luxury, deep week-long immersion that unifies every ecological, historical, and marine aspect of Zanzibar.',
    highlights: ['Stone Town Sultanates', 'Jozani Forest Red Monkeys', 'Safari Blue Ocean Cruise', 'Paje beach windsurfing'],
    rating: 4.95,
    reviewsCount: 88,
    matchTags: ['Full Week Special', 'Luxe Leisure', 'Slow Travel Choice'],
    maxAdults: 8,
    maxChildren: 5,
    suitability: 'Families'
  },
  {
    id: 'serengeti-wildlife-3-days',
    title: '3-Day Serengeti Wildlife Safari',
    category: 'safari',
    destination: 'mainland',
    basePrice: 850,
    standardNights: 2,
    extraNightPrice: 180,
    durationText: '3 Days / 2 Nights',
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=800',
    summary: 'Witness the iconic Great Migration across boundless golden acacia savannahs in the Serengeti.',
    highlights: ['Serengeti game drives', 'High chance of Big Five', 'Luxury tented camp', 'Professional driver-guide'],
    rating: 4.98,
    reviewsCount: 195,
    matchTags: ['Wildlife Focus', 'Big Five Special', 'High Adventure'],
    maxAdults: 12,
    maxChildren: 6,
    suitability: 'Groups'
  },
  {
    id: 'ngorongoro-crater-2-days',
    title: '2-Day Ngorongoro Crater Classic',
    category: 'safari',
    destination: 'mainland',
    basePrice: 450,
    standardNights: 1,
    extraNightPrice: 150,
    durationText: '2 Days / 1 Night',
    image: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=800',
    summary: 'Unmatched volcanic sanctuary home to majestic rhinos, lions, leopards, and over 25,000 large mammals.',
    highlights: ['Crater floor game drive', 'Maasai village tour option', 'Stunning lodge views', 'All-inclusive park fees'],
    rating: 4.88,
    reviewsCount: 124,
    matchTags: ['Natural Wonder', 'Short Safari', 'Volcano Crater'],
    maxAdults: 6,
    maxChildren: 3,
    suitability: 'All'
  },
  {
    id: 'machame-route-7-days',
    title: 'Machame Route Mount Kilimanjaro',
    category: 'kilimanjaro',
    destination: 'kilimanjaro',
    basePrice: 1650,
    standardNights: 6,
    extraNightPrice: 200,
    durationText: '7 Days / 6 Nights',
    image: 'https://images.pexels.com/photos/1645028/pexels-photo-1645028.jpeg?auto=compress&cs=tinysrgb&w=800',
    summary: 'Summit the legendary snowy roof of Africa via the highly scenic Machame "Whiskey" Route.',
    highlights: ['98% summit success rate', 'Acclimatization built-in', 'Full porter team support', 'All meals & camping gear'],
    rating: 4.97,
    reviewsCount: 220,
    matchTags: ['Summit Peak', 'Scenic Overviews', 'Porter Choice'],
    maxAdults: 15,
    maxChildren: 0,
    suitability: 'Solo'
  },
  {
    id: 'safari-blue',
    title: 'Safari Blue Ocean Cruise',
    category: 'tour',
    destination: 'zanzibar',
    basePrice: 85,
    standardNights: 0,
    extraNightPrice: 0,
    durationText: 'Full Day Excursion',
    image: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800',
    summary: 'Sail the turquoise waters of Menai Bay on a traditional dhow, snorkel coral reefs, and feast on fresh rock lobster.',
    highlights: ['Hand-built wooden dhow', 'Marine reef snorkeling', 'Rock-fire lobster banquet', 'Mangrove lagoon swim'],
    rating: 4.96,
    reviewsCount: 540,
    matchTags: ['Signature Excursion', 'Top Marine Activity', 'Lobster BBQ'],
    maxAdults: 30,
    maxChildren: 15,
    suitability: 'All'
  },
  {
    id: 'stone-town',
    title: 'Stone Town Historical Tour',
    category: 'tour',
    destination: 'zanzibar',
    basePrice: 45,
    standardNights: 0,
    extraNightPrice: 0,
    durationText: 'Half Day Excursion',
    image: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=800',
    summary: 'Explore the UNESCO World Heritage Site of Stone Town with its winding lanes, spice markets, and historical landmarks.',
    highlights: ['Certified historian guide', 'Anglican slave market site', 'Bustling Darajani markets', 'Freddie Mercury birthplace'],
    rating: 4.82,
    reviewsCount: 204,
    matchTags: ['UNESCO Heritage', 'Culture & History', 'Local Market Walk'],
    maxAdults: 50,
    maxChildren: 25,
    suitability: 'All'
  }
];

const suggestionsList = [
  { value: 'all', label: 'All Destinations', desc: 'Browse tours, packages, and safaris', icon: '🌍' },
  { value: 'zanzibar', label: 'Zanzibar Island', desc: 'Sunny beaches & Stone Town cultural heritage', icon: '🏝️' },
  { value: 'mainland', label: 'Tanzania Safari', desc: 'Wildlife expeditions in Serengeti & Ngorongoro', icon: '🦁' },
  { value: 'kilimanjaro', label: 'Kilimanjaro', desc: 'Climbing the roof of Africa mountain trek', icon: '🏔️' },
];

// Helper to add days to a date string (YYYY-MM-DD)
const addDays = (dateStr: string, days: number): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

// Helper to calculate nights between two date strings
const calculateNights = (arrStr: string, depStr: string): number => {
  if (!arrStr || !depStr) return 7;
  const d1 = new Date(arrStr);
  const d2 = new Date(depStr);
  const diffTime = d2.getTime() - d1.getTime();
  if (diffTime <= 0) return 1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function SmartSearchEngine({ navigate }: SmartSearchEngineProps) {
  // --- States ---
  const [destination, setDestination] = useState('all');
  const [destQuery, setDestQuery] = useState('');
  
  // Set default check-in to 3 days out, default stays is 7 nights
  const [arrival, setArrival] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0];
  });
  const [nights, setNights] = useState(7);
  const [departure, setDeparture] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 10);
    return today.toISOString().split('T')[0];
  });

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);

  // Popover controls
  const [activePopover, setActivePopover] = useState<'destination' | 'dates' | 'travellers' | null>(null);
  
  // Price breakdown modal/tooltip reference
  const [activeBreakdownId, setActiveBreakdownId] = useState<string | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedDest = localStorage.getItem('ztr_search_destination');
    const savedArrival = localStorage.getItem('ztr_search_arrival');
    const savedDeparture = localStorage.getItem('ztr_search_departure');
    const savedAdults = localStorage.getItem('ztr_search_adults');
    const savedChildren = localStorage.getItem('ztr_search_children');
    const savedInfants = localStorage.getItem('ztr_search_infants');
    const savedChildAges = localStorage.getItem('ztr_search_child_ages');

    if (savedDest) {
      setDestination(savedDest);
      const matched = suggestionsList.find(d => d.value === savedDest);
      if (matched) setDestQuery(matched.label);
    }
    if (savedArrival) {
      setArrival(savedArrival);
    }
    if (savedDeparture) {
      setDeparture(savedDeparture);
      if (savedArrival) {
        setNights(calculateNights(savedArrival, savedDeparture));
      }
    }
    if (savedAdults) setAdults(Number(savedAdults));
    if (savedInfants) setInfants(Number(savedInfants));
    if (savedChildren) {
      const parsedChildren = Number(savedChildren);
      setChildren(parsedChildren);
      if (savedChildAges) {
        try {
          setChildAges(JSON.parse(savedChildAges));
        } catch {
          setChildAges(Array(parsedChildren).fill(5));
        }
      } else {
        setChildAges(Array(parsedChildren).fill(5));
      }
    }
  }, []);

  // --- Two-Way Binding Handlers for Dates & Nights ---
  const handleArrivalChange = (newArrival: string) => {
    setArrival(newArrival);
    // Move departure date based on arrival and current nights selection
    const newDep = addDays(newArrival, nights);
    setDeparture(newDep);
  };

  const handleDepartureChange = (newDeparture: string) => {
    setDeparture(newDeparture);
    // Recalculate nights
    let computedNights = calculateNights(arrival, newDeparture);
    if (computedNights < 1) {
      computedNights = 1;
      const nextDay = addDays(arrival, 1);
      setDeparture(nextDay);
    }
    setNights(computedNights);
  };

  const handleNightsChange = (newNights: number) => {
    const validNights = Math.max(1, Math.min(30, newNights));
    setNights(validNights);
    // Shift departure
    const newDep = addDays(arrival, validNights);
    setDeparture(newDep);
  };

  // --- Child Counter Adjusters ---
  const handleAddChild = () => {
    if (children >= 10) return;
    const nextCount = children + 1;
    setChildren(nextCount);
    setChildAges(prev => [...prev, 5]); // default child age is 5
  };

  const handleRemoveChild = () => {
    if (children <= 0) return;
    const nextCount = children - 1;
    setChildren(nextCount);
    setChildAges(prev => prev.slice(0, -1));
  };

  const handleChildAgeChange = (index: number, age: number) => {
    setChildAges(prev => {
      const next = [...prev];
      next[index] = age;
      return next;
    });
  };

  // Autocomplete Filter
  const filteredSuggestions = useMemo(() => {
    if (!destQuery) return suggestionsList;
    return suggestionsList.filter(s => 
      s.label.toLowerCase().includes(destQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(destQuery.toLowerCase())
    );
  }, [destQuery]);

  // Handle destination selection
  const handleSelectDestination = (val: string, label: string) => {
    setDestination(val);
    setDestQuery(label === 'All Destinations' ? '' : label);
    setActivePopover(null);
  };

  // Label Formats
  const currentDestinationLabel = useMemo(() => {
    const matched = suggestionsList.find(s => s.value === destination);
    return matched ? matched.label : 'All Destinations';
  }, [destination]);

  const dateLabel = useMemo(() => {
    if (!arrival || !departure) return 'Choose dates';
    const d1 = new Date(arrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const d2 = new Date(departure).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${d1} - ${d2} (${nights} Night${nights !== 1 ? 's' : ''})`;
  }, [arrival, departure, nights]);

  const travelersLabel = useMemo(() => {
    const parts = [`${adults} Adult${adults !== 1 ? 's' : ''}`];
    if (children > 0) {
      parts.push(`${children} Child${children !== 1 ? 'ren' : ''}`);
    }
    if (infants > 0) {
      parts.push(`${infants} Infant${infants !== 1 ? 's' : ''}`);
    }
    return parts.join(', ');
  }, [adults, children, infants]);

  // --- Save Search Info ---
  const saveSearchState = () => {
    localStorage.setItem('ztr_search_destination', destination);
    localStorage.setItem('ztr_search_arrival', arrival);
    localStorage.setItem('ztr_search_departure', departure);
    localStorage.setItem('ztr_search_adults', String(adults));
    localStorage.setItem('ztr_search_children', String(children));
    localStorage.setItem('ztr_search_infants', String(infants));
    localStorage.setItem('ztr_search_child_ages', JSON.stringify(childAges));
  };

  // --- DYNAMIC PRICING ENGINE ---
  const calculatePackagePricing = (item: SearchableItem) => {
    // 1. Base price for adults
    const adultCost = item.basePrice * adults;

    // 2. Base price for children based on ages
    const childCost = childAges.reduce((acc, age) => {
      if (age <= 2) return acc; // Infant is Free!
      if (age <= 5) return acc + Math.round(item.basePrice * 0.5); // Toddler enjoys 50% discount
      return acc + Math.round(item.basePrice * 0.75); // Older kids get 25% discount
    }, 0);

    // 3. Extra stay nights calculation (if standard stay nights differs)
    let extraNightCost = 0;
    let extraNightsCount = 0;
    if (item.standardNights > 0 && nights > item.standardNights) {
      extraNightsCount = nights - item.standardNights;
      
      // Extra night adult supplement
      const adultExtra = item.extraNightPrice * adults * extraNightsCount;
      
      // Extra night children supplement with age-based discount
      const childExtra = childAges.reduce((acc, age) => {
        if (age <= 2) return acc;
        if (age <= 5) return acc + Math.round(item.extraNightPrice * 0.5 * extraNightsCount);
        return acc + Math.round(item.extraNightPrice * 0.75 * extraNightsCount);
      }, 0);
      
      extraNightCost = adultExtra + childExtra;
    }

    const subtotal = adultCost + childCost + extraNightCost;
    
    // Calculate Zanzibar Tourism & VAT tax (18%)
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    return {
      adultCost,
      childCost,
      extraNightsCount,
      extraNightCost,
      subtotal,
      tax,
      total,
      breakdown: {
        adultsText: `${adults} × $${item.basePrice} = $${adultCost}`,
        childrenText: children > 0 
          ? childAges.map((age, i) => {
              const discount = age <= 2 ? 'Free' : age <= 5 ? '50% off' : '25% off';
              const rate = age <= 2 ? 0 : age <= 5 ? item.basePrice * 0.5 : item.basePrice * 0.75;
              return `Child ${i+1} (Age ${age}): ${discount} ($${Math.round(rate)})`;
            }).join(', ')
          : 'None',
        extraNightsText: extraNightsCount > 0 
          ? `${extraNightsCount} extra night(s) supplement (+ $${item.extraNightPrice}/adult/night) = $${extraNightCost}`
          : 'None',
        taxText: `VAT & Tourism Surcharge (18%) = $${tax}`
      }
    };
  };

  // --- RECON RECOMMENDATION ALGORITHM ---
  const calculateMatchScore = (item: SearchableItem): { score: number; reason: string } => {
    let score = 0;
    let reasons: string[] = [];

    // 1. Destination fit (max 40 pts)
    if (destination === 'all') {
      score += 40;
    } else if (item.destination === destination) {
      score += 40;
      reasons.push(`Direct match for ${currentDestinationLabel}`);
    } else {
      score += 5;
    }

    // 2. Stays/Nights fit (max 30 pts)
    if (item.standardNights === 0) {
      // Day tour
      if (nights <= 2) {
        score += 30;
        reasons.push('Perfect single-day activity duration');
      } else {
        score += 15;
        reasons.push('Excellent excursion to add to your stay');
      }
    } else {
      // Overnight packages
      const diff = Math.abs(nights - item.standardNights);
      if (diff === 0) {
        score += 30;
        reasons.push(`Exact fit for your ${nights}-night calendar`);
      } else if (diff === 1) {
        score += 25;
        reasons.push('Highly compatible length (±1 night)');
      } else if (diff <= 3) {
        score += 15;
        reasons.push('Flexible package adjustment available');
      } else {
        score += 5;
      }
    }

    // 3. Capacities & Party Fit (max 20 pts)
    const partySize = adults + children;
    if (partySize <= item.maxAdults + item.maxChildren) {
      score += 20;
    } else {
      score += 5;
    }

    // 4. Group configuration (max 10 pts)
    if (children > 0) {
      if (item.suitability === 'Families') {
        score += 10;
        reasons.push('Kid-friendly & top-rated for family dynamics');
      } else if (item.suitability === 'All') {
        score += 8;
      }
    } else {
      if (adults === 2 && item.suitability === 'Couples') {
        score += 10;
        reasons.push('Extremely romantic couples selection');
      } else if (adults === 1 && item.suitability === 'Solo') {
        score += 10;
        reasons.push('Solo adventurer friendly pace');
      } else if (item.suitability === 'Groups' && partySize >= 4) {
        score += 10;
        reasons.push('Outstanding team & group activities');
      } else if (item.suitability === 'All') {
        score += 7;
      }
    }

    return {
      score: Math.min(100, score),
      reason: reasons[0] || 'Highly recommended local experience'
    };
  };

  // --- FILTERED MATCH RESULTS ---
  const matchingResults = useMemo(() => {
    let list = [...searchableItems];

    // Filter by destination if chosen
    if (destination !== 'all') {
      list = list.filter(item => item.destination === destination);
    }

    // Add matching score and price calculations
    const evaluated = list.map(item => {
      const { score, reason } = calculateMatchScore(item);
      const pricing = calculatePackagePricing(item);
      return {
        ...item,
        score,
        matchReason: reason,
        pricing
      };
    });

    // Sort by match score descending
    return evaluated.sort((a, b) => b.score - a.score);
  }, [destination, arrival, departure, nights, adults, children, childAges]);

  // --- Real-Time Urgency Indicator ---
  const getAvailabilityStatus = (dateStr: string, index: number) => {
    const today = new Date();
    const arrDate = new Date(dateStr);
    const diffDays = Math.ceil((arrDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Date in the past', type: 'error', icon: AlertTriangle };
    }
    if (diffDays <= 7) {
      return { 
        text: `Urgent: Only 2 slots left for ${new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}! 🔥`, 
        type: 'danger', 
        icon: Clock 
      };
    }
    if (diffDays <= 14) {
      return { 
        text: `High Demand: 92% of our guides reserved on these dates.`, 
        type: 'warning', 
        icon: TrendingUp 
      };
    }
    
    // Deterministic state based on item index
    if (index % 3 === 0) {
      return { text: 'Available - Instant Confirmation ✅', type: 'success', icon: CheckCircle2 };
    } else {
      return { text: 'Best Price Guaranteed for this stay.', type: 'guarantee', icon: Award };
    }
  };

  // --- Book Now Handler ---
  const handleBookNow = (item: typeof searchableItems[0]) => {
    saveSearchState();
    
    // Map custom search inputs to standard booking routing parameters
    const paramString = `package=${encodeURIComponent(item.title)}&arrival=${arrival}&adults=${adults}&children=${children}`;
    
    // Navigate using router query system
    navigate('booking', paramString);
  };

  return (
    <div className="relative z-30 max-w-5xl mx-auto w-full">
      {/* Popovers Background Dimmer */}
      {activePopover && (
        <div 
          className="fixed inset-0 z-40 bg-transparent cursor-default" 
          onClick={() => setActivePopover(null)} 
        />
      )}

      {/* --- 1. SEARCH WIDGET CARD --- */}
      <div className="bg-[#0A1224]/95 backdrop-blur-md rounded-2xl border-2 border-white/10 shadow-2xl p-5 md:p-6 relative z-50">
        
        {/* PRIMARY SEARCH BOX INPUT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#121B30] p-3 rounded-2xl border border-white/5 relative items-center shadow-lg">
          
          {/* A. DESTINATION AUTOCOMPLETE FIELD */}
          <div className="relative w-full">
            <button
              type="button"
              id="search-dest-btn"
              onClick={() => setActivePopover(activePopover === 'destination' ? null : 'destination')}
              className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all hover:bg-white/5 border border-transparent hover:border-white/5 group ${
                activePopover === 'destination' ? 'bg-white/5 border-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <MapPin className="text-[#D4A017] group-hover:scale-110 transition-transform shrink-0" size={18} />
                <div className="min-w-0 text-left">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Destination</span>
                  <span className="block text-xs font-extrabold text-white truncate">
                    {currentDestinationLabel}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>

            {/* Destination Dropdown */}
            <AnimatePresence>
              {activePopover === 'destination' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-[#0A1224] border border-white/10 rounded-xl shadow-2xl p-4 z-50 max-h-[300px] overflow-y-auto"
                >
                  {/* Search Filter Input */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                    <input
                      type="text"
                      placeholder="Search regions..."
                      value={destQuery}
                      onChange={(e) => setDestQuery(e.target.value)}
                      className="w-full bg-[#121B30] border border-white/15 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4A017] font-semibold"
                    />
                    {destQuery && (
                      <button 
                        type="button"
                        onClick={() => setDestQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Location</span>
                    {filteredSuggestions.length === 0 ? (
                      <p className="text-[10px] text-slate-500 font-bold py-2 text-center">No locations found.</p>
                    ) : (
                      filteredSuggestions.map(s => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => handleSelectDestination(s.value, s.label)}
                          className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between hover:bg-white/5 group border border-transparent hover:border-white/5 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-base shrink-0">{s.icon}</span>
                            <div className="min-w-0">
                              <span className="block text-slate-200 group-hover:text-white truncate font-bold">{s.label}</span>
                              <span className="block text-[9px] text-slate-400 truncate font-semibold mt-0.5">{s.desc}</span>
                            </div>
                          </div>
                          {destination === s.value && (
                            <Check size={14} className="text-[#D4A017] shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* B. DATE & NIGHTS BINDER FIELD */}
          <div className="relative w-full">
            <button
              type="button"
              id="search-dates-btn"
              onClick={() => setActivePopover(activePopover === 'dates' ? null : 'dates')}
              className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all hover:bg-white/5 border border-transparent hover:border-white/5 group ${
                activePopover === 'dates' ? 'bg-white/5 border-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <CalendarIcon className="text-[#D4A017] group-hover:scale-110 transition-transform shrink-0" size={18} />
                <div className="min-w-0 text-left">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Dates & Nights</span>
                  <span className="block text-xs font-extrabold text-white truncate">
                    {dateLabel}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>

            {/* Date/Nights Popover Panel */}
            <AnimatePresence>
              {activePopover === 'dates' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 top-full mt-2 bg-[#0A1224] border border-white/10 rounded-xl shadow-2xl p-5 z-50 w-[94vw] sm:w-[320px] space-y-4"
                >
                  <div className="pb-2 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-widest font-mono">Date & Duration Setup</span>
                    <button type="button" onClick={() => setActivePopover(null)} className="text-slate-400 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>

                  {/* 1. Arrival Date */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Check-In / Arrival Date (Required)
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={arrival}
                      onChange={(e) => handleArrivalChange(e.target.value)}
                      className="w-full bg-[#121B30] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4A017] font-semibold cursor-pointer"
                    />
                  </div>

                  {/* 2. Nights Auto-Calculators */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Stay Duration (Nights)
                      </label>
                      <span className="text-xs font-mono font-black text-[#D4A017]">{nights} Night(s)</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-[#121B30] border border-white/10 rounded-lg p-1.5">
                      <button
                        type="button"
                        onClick={() => handleNightsChange(nights - 1)}
                        className="h-8 w-8 rounded bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={nights}
                        onChange={(e) => handleNightsChange(Number(e.target.value))}
                        className="bg-transparent text-center text-xs text-white font-bold w-12 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      
                      <button
                        type="button"
                        onClick={() => handleNightsChange(nights + 1)}
                        className="h-8 w-8 rounded bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Quick stay picks */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1.5">
                      {[3, 5, 7, 10].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleNightsChange(val)}
                          className={`py-1 text-[9px] font-black uppercase rounded-md transition-colors cursor-pointer text-center ${
                            nights === val 
                              ? 'bg-[#D4A017] text-[#020C1F]' 
                              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {val} Nts
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Check-Out Date */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Check-Out / Departure Date (Auto)
                    </label>
                    <input
                      type="date"
                      min={addDays(arrival, 1)}
                      value={departure}
                      onChange={(e) => handleDepartureChange(e.target.value)}
                      className="w-full bg-[#121B30] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4A017] font-semibold cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="w-full bg-[#D4A017] text-[#020C1F] hover:bg-opacity-90 font-black text-[10px] uppercase tracking-widest py-2 rounded-lg transition-all cursor-pointer"
                  >
                    Confirm Stay Calendar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* C. GUESTS & OPTIONAL CHILDREN AGES FIELD */}
          <div className="relative w-full">
            <button
              type="button"
              id="search-guests-btn"
              onClick={() => setActivePopover(activePopover === 'travellers' ? null : 'travellers')}
              className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-all hover:bg-white/5 border border-transparent hover:border-white/5 group ${
                activePopover === 'travellers' ? 'bg-white/5 border-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Users className="text-[#D4A017] group-hover:scale-110 transition-transform shrink-0" size={18} />
                <div className="min-w-0 text-left">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Travellers</span>
                  <span className="block text-xs font-extrabold text-white truncate">
                    {travelersLabel}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </button>

            {/* Guests Popover Panel */}
            <AnimatePresence>
              {activePopover === 'travellers' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 bg-[#0A1224] border border-white/10 rounded-xl shadow-2xl p-5 z-50 w-full sm:w-[280px] space-y-4"
                >
                  <div className="pb-2 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-widest font-mono">Party Configuration</span>
                    <button type="button" onClick={() => setActivePopover(null)} className="text-slate-400 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>

                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-black text-white">Adults</span>
                      <span className="block text-[9px] text-slate-400 font-semibold">Age 12+ (Required)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#121B30] rounded-lg border border-white/5 px-2 py-1 shrink-0">
                      <button
                        type="button"
                        disabled={adults <= 1}
                        onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                        className="h-6 w-6 rounded bg-white/5 text-slate-300 hover:text-white flex items-center justify-center disabled:opacity-20 transition-colors cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-bold text-white min-w-[14px] text-center">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(prev => prev + 1)}
                        className="h-6 w-6 rounded bg-white/5 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-black text-white">Children</span>
                      <span className="block text-[9px] text-slate-400 font-semibold">Ages 2 to 11 (Optional)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#121B30] rounded-lg border border-white/5 px-2 py-1 shrink-0">
                      <button
                        type="button"
                        disabled={children <= 0}
                        onClick={handleRemoveChild}
                        className="h-6 w-6 rounded bg-white/5 text-slate-300 hover:text-white flex items-center justify-center disabled:opacity-20 transition-colors cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-bold text-white min-w-[14px] text-center">{children}</span>
                      <button
                        type="button"
                        onClick={handleAddChild}
                        className="h-6 w-6 rounded bg-white/5 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-black text-white">Infants</span>
                      <span className="block text-[9px] text-slate-400 font-semibold">Under 2 years (Free)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#121B30] rounded-lg border border-white/5 px-2 py-1 shrink-0">
                      <button
                        type="button"
                        disabled={infants <= 0}
                        onClick={() => setInfants(prev => Math.max(0, prev - 1))}
                        className="h-6 w-6 rounded bg-white/5 text-slate-300 hover:text-white flex items-center justify-center disabled:opacity-20 transition-colors cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-bold text-white min-w-[14px] text-center">{infants}</span>
                      <button
                        type="button"
                        onClick={() => setInfants(prev => prev + 1)}
                        className="h-6 w-6 rounded bg-white/5 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Dynamically Rendered Children Age Selection (Booking.com style requirement) */}
                  {children > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-2.5">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                        Provide Children Ages
                      </span>
                      <p className="text-[9px] text-slate-400 leading-normal font-semibold">
                        Ages determine special child-rate discounts (up to 100% off for toddlers & infants!).
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                        {childAges.map((age, i) => (
                          <div key={i} className="space-y-1">
                            <span className="block text-[9px] font-bold text-slate-300 font-mono">Child {i + 1} Age</span>
                            <select
                              value={age}
                              onChange={(e) => handleChildAgeChange(i, Number(e.target.value))}
                              className="w-full bg-[#121B30] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#D4A017] font-semibold cursor-pointer"
                            >
                              <option value={1}>Under 2 (Infant - Free)</option>
                              <option value={4}>4 yrs (50% Off)</option>
                              <option value={8}>8 yrs (25% Off)</option>
                              <option value={10}>10 yrs (25% Off)</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="w-full bg-[#D4A017] text-[#020C1F] hover:bg-opacity-90 font-black text-[10px] uppercase tracking-widest py-2 rounded-lg transition-all cursor-pointer"
                  >
                    Apply Guest List
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* D. LIVE SEARCH DISPATCH TRIGGER */}
          <div className="w-full">
            <button
              type="button"
              onClick={() => {
                saveSearchState();
                const targetResults = document.getElementById('live-search-results-anchor');
                if (targetResults) {
                  targetResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#D4A017] to-[#c49010] hover:scale-[1.02] active:scale-[0.98] text-[#020C1F] flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-[#D4A017]/10 cursor-pointer"
            >
              <Search size={14} className="shrink-0" />
              <span>Explore Deals</span>
            </button>
          </div>

        </div>

      </div>

      {/* --- 2. INSTANT SEARCH RESULTS DASHBOARD (HOMEPAGE INTEGRATED) --- */}
      <div id="live-search-results-anchor" className="mt-8">
        <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-6 shadow-md overflow-hidden relative">
          
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[#D4A017] text-xs font-black uppercase tracking-wider font-mono">
                Booking.com Real-time Matching
              </span>
              <h2 className="text-xl md:text-2xl font-black text-[#0B3B8C] tracking-tight mt-0.5">
                Available Tours & Custom Packages
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Prices include all-inclusive private transports, local certified guides, and custom child discounts.
              </p>
            </div>
            
            {/* Filter Stats badge */}
            <div className="bg-[#0B3B8C]/10 border border-[#0B3B8C]/20 px-4 py-2 rounded-xl text-[#0B3B8C] shrink-0 text-left">
              <span className="block text-[9px] font-black uppercase tracking-wider leading-none">Matches Found</span>
              <span className="block text-sm font-extrabold font-mono mt-1">{matchingResults.length} Available Packages</span>
            </div>
          </div>

          {/* RESULTS GRID / CONTAINER */}
          {matchingResults.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center space-y-4">
              <div className="h-12 w-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                  No direct packages matched your criteria
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We specialize in custom tailor-made travels! Let our native beach experts and safari coordinators custom design your exact holiday.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('trip-builder')}
                  className="bg-[#0B3B8C] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg hover:bg-opacity-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Compass size={14} /> Open Custom Trip Builder
                </button>
                <a
                  href="https://wa.me/255629506063"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-550 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock size={14} /> Talk to Expert on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            /* Results Cards list */
            <div className="space-y-6">
              {matchingResults.map((item, idx) => {
                const isSelectedForBreakdown = activeBreakdownId === item.id;
                const statusInfo = getAvailabilityStatus(arrival, idx);
                const StatusIcon = statusInfo.icon;

                return (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden grid grid-cols-1 md:grid-cols-12 relative group"
                  >
                    
                    {/* Image Area - 4 cols */}
                    <div className="md:col-span-4 relative h-48 md:h-full min-h-[180px] bg-slate-100 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      
                      {/* Match Score Badge */}
                      <div className="absolute top-3 left-3 bg-[#0B3B8C] text-white px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1">
                        <Sparkles size={11} className="text-[#D4A017] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider font-mono">
                          {item.score}% Match
                        </span>
                      </div>

                      {/* Suitability Badge */}
                      <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-[#0B3B8C] text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-slate-200">
                        {item.suitability} Choice
                      </span>
                    </div>

                    {/* Meta Description Area - 5 cols */}
                    <div className="md:col-span-5 p-5 md:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
                      <div>
                        
                        {/* Rating Row */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="flex items-center text-[#D4A017]">
                            <Star size={12} fill="currentColor" />
                            <span className="text-xs font-black ml-1 text-slate-800">{item.rating}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">({item.reviewsCount} reviews)</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wider ml-auto font-mono">
                            {item.category}
                          </span>
                        </div>

                        <h3 className="text-base md:text-lg font-black text-[#0B3B8C] group-hover:text-[#D4A017] transition-colors leading-tight">
                          {item.title}
                        </h3>
                        
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">
                          {item.summary}
                        </p>

                        {/* Matches Reason Tag */}
                        <div className="bg-amber-50 border border-amber-100/55 rounded-lg px-2.5 py-1.5 mt-3 flex items-center gap-2">
                          <span className="text-base leading-none">💡</span>
                          <p className="text-[10px] text-amber-800 font-bold leading-normal">
                            {item.matchReason}
                          </p>
                        </div>

                        {/* Bullets */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3.5 pt-3.5 border-t border-slate-100">
                          {item.highlights.slice(0, 4).map((h, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 min-w-0">
                              <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                              <span className="truncate">{h}</span>
                            </div>
                          ))}
                        </div>

                      </div>

                      {/* Real-time Availability Notification */}
                      <div className="mt-4 pt-3 border-t border-slate-150 flex items-center gap-2">
                        <StatusIcon 
                          size={13} 
                          className={`shrink-0 ${
                            statusInfo.type === 'danger' ? 'text-red-500 animate-pulse' :
                            statusInfo.type === 'warning' ? 'text-amber-500' :
                            statusInfo.type === 'success' ? 'text-emerald-500' :
                            'text-[#0B3B8C]'
                          }`} 
                        />
                        <span className={`text-[10px] font-black uppercase tracking-wide leading-none ${
                          statusInfo.type === 'danger' ? 'text-red-500 font-black' :
                          statusInfo.type === 'warning' ? 'text-amber-600' :
                          statusInfo.type === 'success' ? 'text-emerald-600 font-black' :
                          'text-slate-500'
                        }`}>
                          {statusInfo.text}
                        </span>
                      </div>

                    </div>

                    {/* Pricing and CTAs - 3 cols */}
                    <div className="md:col-span-3 p-5 md:p-6 bg-slate-50/50 flex flex-col justify-between text-right min-h-[200px] md:min-h-0">
                      
                      {/* Price header */}
                      <div className="space-y-1 text-center md:text-right">
                        <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Stay Price ({nights} Nt{nights !== 1 ? 's' : ''})
                        </span>
                        
                        {/* Dynamic Computed Price display */}
                        <div className="inline-flex flex-col items-center md:items-end">
                          <div className="flex items-baseline gap-1 justify-center md:justify-end text-slate-800">
                            <span className="text-[10px] font-mono font-bold text-slate-400">Total:</span>
                            <span className="text-2xl font-black text-[#0B3B8C] font-mono">
                              ${item.pricing.total.toLocaleString()}
                            </span>
                          </div>
                          
                          {/* Surcharges inclusive line */}
                          <span className="block text-[9px] text-slate-400 font-mono mt-0.5 leading-none font-bold">
                            Includes 18% VAT & Surcharges
                          </span>
                        </div>

                        {/* Breakdown toggle */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveBreakdownId(isSelectedForBreakdown ? null : item.id)}
                            className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-[#D4A017] hover:text-[#c49010] cursor-pointer"
                          >
                            <span>{isSelectedForBreakdown ? 'Hide Cost Details' : 'View Cost Details'}</span>
                            <ChevronDown size={10} className={`transform transition-transform ${isSelectedForBreakdown ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Detailed Pricing Breakdown Drawer / Panel */}
                      <AnimatePresence>
                        {isSelectedForBreakdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-left bg-[#121B30] border border-white/5 rounded-xl p-3.5 mt-2 space-y-2 relative z-10"
                          >
                            <span className="block text-[9px] font-black text-[#D4A017] uppercase tracking-widest font-mono border-b border-white/5 pb-1">
                              Calculated Breakdown
                            </span>
                            
                            <div className="text-[9px] text-slate-300 space-y-1 font-mono font-bold">
                              <div className="flex justify-between gap-2 border-b border-white/5 pb-1">
                                <span>Adult Cost:</span>
                                <span className="text-white">${item.pricing.adultCost}</span>
                              </div>
                              
                              <div className="flex justify-between gap-2 border-b border-white/5 pb-1">
                                <span>Children Discounts:</span>
                                <span className="text-emerald-400">
                                  {item.pricing.childCost > 0 ? `+$${item.pricing.childCost}` : 'Free ($0)'}
                                </span>
                              </div>

                              {item.pricing.extraNightsCount > 0 && (
                                <div className="flex justify-between gap-2 border-b border-white/5 pb-1">
                                  <span>Extra {item.pricing.extraNightsCount} Night stays:</span>
                                  <span className="text-amber-400">+${item.pricing.extraNightCost}</span>
                                </div>
                              )}

                              <div className="flex justify-between gap-2 border-b border-white/5 pb-1">
                                <span>Local Tourism Tax (18%):</span>
                                <span className="text-slate-400">+${item.pricing.tax}</span>
                              </div>

                              <div className="flex justify-between gap-2 text-[#D4A017] pt-1 text-[10px] font-black border-t border-dashed border-white/10">
                                <span>Grand Total:</span>
                                <span>${item.pricing.total}</span>
                              </div>
                            </div>
                            
                            {item.pricing.extraNightsCount > 0 && (
                              <p className="text-[8px] text-amber-500 leading-normal font-bold">
                                *Standard package is {item.standardNights} nights. Your stays of {nights} nights include custom extra-night resort supplements.
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Direct Booking action */}
                      <div className="pt-4 text-center md:text-right">
                        <button
                          type="button"
                          onClick={() => handleBookNow(item)}
                          className="w-full py-2.5 bg-[#0B3B8C] hover:bg-opacity-95 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-1.5 shadow-md shadow-[#0B3B8C]/10 cursor-pointer"
                        >
                          <span>Secure Spot</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
