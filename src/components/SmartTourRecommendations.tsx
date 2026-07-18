import { useState, useMemo } from 'react';
import { usePreferences, Currency } from '../context/UserPreferencesContext';
import { tours, Tour } from '../data/tours';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Sparkles, Sliders, DollarSign, Calendar, Heart, ArrowRight } from 'lucide-react';
import { ProgressiveImage } from './ProgressiveImage';

interface SmartTourRecommendationsProps {
  navigate: (page: string, id?: string) => void;
  titleClassName?: string;
}

const TRAVEL_STYLES = [
  { id: 'All', label: 'Any Style', swLabel: 'Mtindo Wowote' },
  { id: 'Culture', label: 'Culture & History', swLabel: 'Utamaduni' },
  { id: 'Ocean', label: 'Ocean & Snorkeling', swLabel: 'Bahari' },
  { id: 'Island', label: 'Island Day Picnic', swLabel: 'Visiwa' },
  { id: 'Nature', label: 'Nature & Wildlife', swLabel: 'Wanyamapori' },
];

export default function SmartTourRecommendations({ navigate, titleClassName }: SmartTourRecommendationsProps) {
  const { t, language } = useLanguage();
  const { formatPrice, userProfile, updateUserProfile, favorites, toggleFavorite } = usePreferences();
  const [showFilters, setShowFilters] = useState(false);

  // Local state initialized with user preferences session state
  const [budget, setBudget] = useState(userProfile.budget || 200);
  const [duration, setDuration] = useState(userProfile.duration || 8);
  const [style, setStyle] = useState(userProfile.travelStyle || 'All');

  // Multi-variant recommendation engine
  const recommendedTours = useMemo(() => {
    // Score all tours
    const scored = tours.map(tour => {
      let score = 0;

      // 1. Budget proximity
      const priceMatch = tour.price.match(/([0-9,]+)/);
      const priceVal = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
      if (priceVal > 0) {
        if (priceVal <= budget) {
          score += 25; // Good price point
        } else {
          // Slight penalty if price exceeds budget slider
          score -= Math.round(((priceVal - budget) / budget) * 15);
        }
      }

      // 2. Duration proximity
      // Parse duration in hours (e.g., 'Half Day (4 hrs)' -> 4, 'Full Day (8 hrs)' -> 8, '3 Hours' -> 3)
      const hrMatch = tour.duration.match(/([0-9.]+)\s*(hr|hour|day)/i);
      let tourHours = 4; // Default half day
      if (hrMatch) {
        const val = parseFloat(hrMatch[1]);
        if (hrMatch[2].toLowerCase().startsWith('day') && val < 5) {
          tourHours = val * 8; // Multi-day scaled
        } else {
          tourHours = val;
        }
      }
      
      const hoursDiff = Math.abs(tourHours - duration);
      score += Math.max(0, 15 - hoursDiff * 2); // Closer duration gets more points

      // 3. Travel Style / Category match
      if (style !== 'All') {
        if (tour.category.toLowerCase() === style.toLowerCase()) {
          score += 40; // Direct category match
        } else if (
          (style === 'Ocean' && tour.category === 'Island') ||
          (style === 'Island' && tour.category === 'Ocean') ||
          (style === 'Nature' && tour.category === 'Culture')
        ) {
          score += 15; // Smart secondary match
        }
      } else {
        score += 10; // Neutral baseline
      }

      // 4. Favorites & Recency boost
      if (favorites.includes(tour.id)) {
        score += 5; // Boost favorites slightly
      }

      return { tour, score };
    });

    // Sort by highest matching score and return top 3
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.tour);
  }, [budget, duration, style, favorites]);

  const handleApplyPreferences = () => {
    updateUserProfile({ budget, duration, travelStyle: style });
  };

  return (
    <div className="bg-gradient-to-br from-[#0B3B8C]/5 via-white to-amber-500/5 rounded-3xl p-6 md:p-8 border border-gray-150 shadow-sm relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4A017]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#0B3B8C]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title & Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1 bg-[#D4A017]/15 text-amber-700 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-2 font-mono">
            <Sparkles size={10} className="text-[#D4A017] animate-pulse" />
            <span>AI Concierge</span>
          </div>
          <h3 className={`text-xl md:text-2xl font-black text-[#0B3B8C] tracking-tight uppercase ${titleClassName || ''}`} style={{ fontFamily: 'Playfair Display, serif' }}>
            {language === 'en' ? 'Smart Tour Recommendations' : 'Mapendekezo ya Ziara Bora ya AI'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xl font-medium">
            {language === 'en' 
              ? 'Tweak sliders to match your exact budget, duration, and vacation vibe to discover your perfect Zanzibar itinerary instantly.' 
              : 'Hariri bajeti yako, muda wa safari, na mtindo wa likizo ili upate mapendekezo ya ziara zinazokufaa papo hapo.'}
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-full border text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
            showFilters 
              ? 'bg-[#0B3B8C] text-white border-[#0B3B8C]' 
              : 'bg-white hover:bg-slate-50 text-slate-700 border-gray-200'
          }`}
        >
          <Sliders size={13} />
          <span>{showFilters ? t('btn.sending', 'Hide Knobs') : t('nav.planMyTrip', 'Configure Preferences')}</span>
        </button>
      </div>

      {/* Sliders Panel */}
      <AnimatePresence>
        {(showFilters || style !== 'All' || budget !== 200 || duration !== 8) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-150/60 rounded-2xl p-4 md:p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10"
          >
            {/* 1. Travel Style selector */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
                {language === 'en' ? 'Vacation Vibe' : 'Mtindo wa Likizo'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TRAVEL_STYLES.map(ts => (
                  <button
                    key={ts.id}
                    onClick={() => { setStyle(ts.id); handleApplyPreferences(); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      style === ts.id
                        ? 'bg-[#0B3B8C] text-white border-[#0B3B8C]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-gray-150'
                    }`}
                  >
                    {language === 'en' ? ts.label : ts.swLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Budget slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-slate-500">
                <span>{language === 'en' ? 'Max Budget' : 'Gharama ya Juu'}</span>
                <span className="font-mono text-xs text-[#0B3B8C]">{formatPrice(`$${budget}`)}</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="5"
                value={budget}
                onChange={(e) => { setBudget(Number(e.target.value)); handleApplyPreferences(); }}
                className="w-full accent-[#0B3B8C] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold font-mono">
                <span>{formatPrice('$30')}</span>
                <span>{formatPrice('$300')}</span>
              </div>
            </div>

            {/* 3. Duration slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-slate-500">
                <span>{language === 'en' ? 'Preferred Duration' : 'Muda wa Safari'}</span>
                <span className="font-mono text-xs text-[#0B3B8C]">{duration} {duration === 12 ? 'Full Day+' : `${duration} Hours`}</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="1"
                value={duration}
                onChange={(e) => { setDuration(Number(e.target.value)); handleApplyPreferences(); }}
                className="w-full accent-[#0B3B8C] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold font-mono">
                <span>2 hrs</span>
                <span>12 hrs</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        <AnimatePresence mode="popLayout">
          {recommendedTours.map((tour, idx) => (
            <motion.div
              layout
              key={`${tour.id}-${idx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-150/60 shadow-sm hover:shadow-md transition-all flex flex-col group h-full"
            >
              {/* Image box */}
              <div className="relative h-44 overflow-hidden shrink-0">
                <ProgressiveImage
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#0B3B8C] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full z-10">
                  {tour.badge || tour.category}
                </div>
                <button
                  onClick={() => toggleFavorite(tour.id)}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all border cursor-pointer ${
                    favorites.includes(tour.id)
                      ? 'bg-rose-500/20 border-rose-500 text-rose-500'
                      : 'bg-black/20 hover:bg-black/30 border-white/10 text-white'
                  }`}
                  aria-label="Add to Favourites"
                >
                  <Heart size={14} fill={favorites.includes(tour.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="absolute bottom-2.5 right-2.5 bg-white/95 text-[#0B3B8C] text-xs font-black px-2 py-0.5 rounded-md font-mono">
                  {formatPrice(tour.price)}
                </div>
              </div>

              {/* Text content */}
              <div className="p-4 flex flex-col flex-grow">
                <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#0B3B8C] transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {tour.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed flex-grow font-medium">
                  {tour.description}
                </p>

                {/* Info and CTA button */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
                  <div className="text-[10px] text-slate-400 font-bold font-mono uppercase">
                    🕒 {tour.duration}
                  </div>
                  
                  <button
                    onClick={() => navigate('tour-detail', tour.id)}
                    className="text-[10px] font-black uppercase tracking-widest text-[#D4A017] hover:text-[#0B3B8C] flex items-center gap-1 group/btn cursor-pointer"
                  >
                    <span>View Tour</span>
                    <ArrowRight size={11} className="transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
