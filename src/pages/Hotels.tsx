import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Star, Phone, Mail, MessageCircle, Calendar, Shield, Search, ArrowRight, Compass, Heart } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { getHotels, HotelOption } from '../lib/cmsStore';
import { useAnalytics } from '../context/AnalyticsContext';

interface HotelsProps {
  navigate: (page: Page, id?: string) => void;
}

export default function Hotels({ navigate }: HotelsProps) {
  const { trackWhatsAppClick } = useAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('ztr_hotel_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const hotelsList = useMemo(() => {
    return getHotels();
  }, []);

  const destinationsList = useMemo(() => {
    const dests = new Set<string>();
    hotelsList.forEach(h => {
      if (h.destinationId) {
        dests.add(h.destinationId);
      }
    });
    return ['all', ...Array.from(dests)];
  }, [hotelsList]);

  const filteredHotels = useMemo(() => {
    return hotelsList.filter(h => {
      const matchesSearch = (h.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (h.description && (h.description || '').toLowerCase().includes((searchQuery || '').toLowerCase())) ||
        (h.category && (h.category || '').toLowerCase().includes((searchQuery || '').toLowerCase()));

      const matchesDest = selectedDestination === 'all' || h.destinationId === selectedDestination;

      return matchesSearch && matchesDest;
    });
  }, [hotelsList, searchQuery, selectedDestination]);

  const toggleWishlist = (id: string) => {
    const updated = wishlist.includes(id) 
      ? wishlist.filter(item => item !== id)
      : [...wishlist, id];
    setWishlist(updated);
    localStorage.setItem('ztr_hotel_wishlist', JSON.stringify(updated));
  };

  const getDestinationLabel = (id: string) => {
    if (id === 'unguja') return 'Zanzibar (Unguja)';
    if (id === 'serengeti') return 'Serengeti';
    if (id === 'ngorongoro') return 'Ngorongoro';
    if (id === 'manyara') return 'Lake Manyara';
    if (id === 'tarangire') return 'Tarangire';
    return id.charAt(0).toUpperCase() + id.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#020C1F] text-slate-100 font-sans pb-24">
      {/* Hero Banner */}
      <div className="relative h-[50vh] min-h-[380px] w-full flex items-end overflow-hidden border-b border-white/5">
        <img 
          src="https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1920" 
          alt="Luxury Resorts" 
          className="absolute inset-0 w-full h-full object-cover transform scale-100 hover:scale-105 transition-all duration-10000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020C1F] via-[#020C1F]/65 to-black/30" />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12 relative z-10 space-y-4">
          <span className="bg-[#D4A017]/10 text-[#D4A017] text-[10px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full border border-[#D4A017]/25">
            HANDPICKED COLLABORATORS
          </span>
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white uppercase leading-none">
              Luxury Partner Lodges
            </h1>
            <p className="text-slate-300 font-light text-xs sm:text-sm max-w-2xl leading-relaxed">
              Explore our highly vetted partner lodges, beachfront private villas, and high-altitude luxury camps carefully curated for safety, hygiene, and spectacular authentic views.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Destination Selector Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {destinationsList.map(dest => (
              <button
                key={dest}
                onClick={() => setSelectedDestination(dest)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedDestination === dest 
                    ? 'bg-[#D4A017] text-[#020C1F] shadow-lg' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {dest === 'all' ? 'All Destinations' : getDestinationLabel(dest)}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search partner hotels..."
              className="w-full bg-white/5 border border-white/5 py-3 pl-11 pr-4 rounded-xl text-xs focus:border-[#D4A017] outline-none text-white transition-all font-light"
            />
          </div>
        </div>
      </div>

      {/* Hotel Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredHotels.map(hotel => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={hotel.id} 
                className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-[#D4A017]/30 transition-all shadow-xl"
              >
                {/* Photo Header */}
                <div className="h-56 w-full relative bg-slate-900 overflow-hidden">
                  <img 
                    src={hotel.image || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80'} 
                    alt={hotel.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1224] via-transparent to-transparent" />
                  
                  {/* Category Badge */}
                  <span className="absolute top-4 left-4 bg-black/85 backdrop-blur-md text-[9px] px-2.5 py-1 rounded-full font-bold text-[#D4A017] border border-white/5 uppercase tracking-widest">
                    {hotel.category || 'Luxury Elite'}
                  </span>

                  {/* Wishlist Button */}
                  <button 
                    onClick={() => toggleWishlist(hotel.id)}
                    className="absolute top-4 right-4 h-9 w-9 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 transition-colors cursor-pointer"
                    aria-label="Add to Wishlist"
                  >
                    <Heart size={14} className={wishlist.includes(hotel.id) ? 'fill-red-500 text-red-500' : 'text-slate-300'} />
                  </button>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#D4A017] font-black uppercase tracking-wider">
                        {getDestinationLabel(hotel.destinationId || 'unguja')}
                      </span>
                      <div className="flex gap-0.5 text-[#D4A017]">
                        {Array.from({ length: Number(hotel.stars || '5') }).map((_, starIdx) => (
                          <Star key={starIdx} size={10} className="fill-[#D4A017]" />
                        ))}
                      </div>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#D4A017] transition-colors uppercase tracking-tight">
                      {hotel.name}
                    </h3>

                    <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-3">
                      {hotel.description || 'Step into pristine luxury, combining award-winning Swahili architecture, top-tier culinary offerings, and direct turquoise coastline lookouts.'}
                    </p>
                  </div>

                  {/* Book / Enquiry CTA button */}
                  <button 
                    onClick={() => {
                      navigate('booking', `hotel=${encodeURIComponent(hotel.name)}`);
                    }}
                    className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-xs font-black py-3.5 rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    <Calendar size={14} />
                    <span>Inquire Best Rates</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredHotels.length === 0 && (
            <div className="col-span-full py-20 text-center bg-[#0A1224] rounded-3xl border border-white/5 space-y-3">
              <Compass size={40} className="text-slate-600 mx-auto animate-pulse" />
              <p className="text-sm text-slate-400 font-light">No custom hotels matched your search or filters.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDestination('all');
                }}
                className="bg-white/5 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-xl transition-colors font-bold uppercase tracking-wide cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Safety Guarantee Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-gradient-to-r from-[#0A1224] to-[#040e22] border border-white/5 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A017]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white uppercase tracking-tight">Exclusive Benefits & Price Match</h2>
            <p className="text-slate-300 font-light text-xs sm:text-sm leading-relaxed">
              Booking your accommodation through Zanzibar Trip & Relax unlocks premium complimentary benefits like early check-ins, complimentary private airport transfers, premium room upgrades, and local Swahili spice gifts!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <a
              href="https://wa.me/255629506063?text=Hello%20Zanzibar%20Trip%20and%20Relax%2C%20I%20would%20like%20to%20get%20custom%20rates%20for%20luxury%20partner%20hotels%21"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('Hotels Page Partner Contact', 'General')}
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-black py-4 px-6 rounded-full transition-all uppercase tracking-wider cursor-pointer shadow-md text-center"
            >
              <MessageCircle size={15} fill="white" />
              <span>WhatsApp Concierge</span>
            </a>
            <button 
              onClick={() => navigate('contact')}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-black py-4 px-6 rounded-full transition-all uppercase tracking-wider text-center cursor-pointer"
            >
              Contact Travel Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
