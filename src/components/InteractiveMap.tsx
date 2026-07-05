import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, MapPin, Sparkles, Shield, ArrowRight, Star, Clock, Tag } from 'lucide-react';

interface MapLocation {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
  duration: string;
  region: 'Zanzibar' | 'Mainland';
  highlights: string[];
}

interface InteractiveMapProps {
  mode: 'tours' | 'safaris';
  height?: string;
}

const ZANZIBAR_TOUR_LOCATIONS: MapLocation[] = [
  {
    id: 'stone-town',
    name: 'Stone Town Historical Tour',
    category: 'Culture & Heritage',
    price: '$45',
    image: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Explore UNESCO heritage alleys, Sultanate palaces, and historical slave quarters.',
    duration: '4 Hours',
    region: 'Zanzibar',
    highlights: ['House of Wonders', 'Old Slave Market', 'Forodhani Gardens Gardens']
  },
  {
    id: 'spice-farm',
    name: 'Spice Farm Plantation Tour',
    category: 'Swahili Culinary',
    price: '$35',
    image: 'https://images.pexels.com/photos/2835547/pexels-photo-2835547.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Touch, smell, and taste exotic tropical spices at a rural organic plantation.',
    duration: '3 Hours',
    region: 'Zanzibar',
    highlights: ['Cardamom & Vanilla tasting', 'Spice crown ceremony', 'Fresh tropical fruits lunch']
  },
  {
    id: 'prison-island',
    name: 'Prison Island Tortoise Tour',
    category: 'Wildlife & History',
    price: '$40',
    image: 'https://images.pexels.com/photos/5033320/pexels-photo-5033320.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Visit the historic quarantine station and feed Aldabra giant tortoises.',
    duration: '3.5 Hours',
    region: 'Zanzibar',
    highlights: ['Feed 150-year-old tortoises', 'Quarantine jail museum', 'Prussian blue reef snorkeling']
  },
  {
    id: 'jozani-forest',
    name: 'Jozani Forest National Park',
    category: 'Endemic Nature',
    price: '$50',
    image: 'https://images.pexels.com/photos/4032590/pexels-photo-4032590.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Walk through mangrove boardwalks and spot endemic Red Colobus monkeys.',
    duration: '3 Hours',
    region: 'Zanzibar',
    highlights: ['Endemic Red Colobus monkeys', 'Eucalyptus & mahogany trails', 'Salt marsh mangrove boardwalk']
  },
  {
    id: 'safari-blue',
    name: 'Safari Blue Sandbank Cruise',
    category: 'Water Adventure',
    price: '$85',
    image: 'https://images.pexels.com/photos/1078983/pexels-photo-1078983.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Sail on traditional wooden dhows, snorkel crystal reefs, and feast on seafood.',
    duration: 'Full Day',
    region: 'Zanzibar',
    highlights: ['Fumba bay cruise', 'Baobab island exploration', 'Grilled lobster feast']
  },
  {
    id: 'nakupenda-sandbank',
    name: 'Nakupenda Sandbank Picnic',
    category: 'Water Adventure',
    price: '$75',
    image: 'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Relax on a pristine white sandbank and enjoy fresh grilled lobster.',
    duration: '6 Hours',
    region: 'Zanzibar',
    highlights: ['Pristine sandbar picnic', 'Fresh fruit platter', 'Snorkeling in shallow sand banks']
  },
  {
    id: 'nungwi-aquarium',
    name: 'Nungwi Turtle Conservation',
    category: 'Wildlife Sanctuary',
    price: '$65',
    image: 'https://images.pexels.com/photos/3041883/pexels-photo-3041883.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Swim with sea turtles in a natural tidal pool and watch the dhow sunset.',
    duration: '5 Hours',
    region: 'Zanzibar',
    highlights: ['Swim in a natural lagoon', 'Turtle rescue release program', 'Northern sunset over Nungwi']
  },
  {
    id: 'mnemba-atoll',
    name: 'Mnemba Island Snorkeling',
    category: 'Water Adventure',
    price: '$70',
    image: 'https://images.pexels.com/photos/1680140/pexels-photo-1680140.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Snorkel the vibrant marine conservation area with dolphins and corals.',
    duration: '5 Hours',
    region: 'Zanzibar',
    highlights: ['Wild dolphin spotting', 'Vibrant coral reef snorkeling', 'Tropical beach snack break']
  }
];

const TANZANIA_SAFARI_LOCATIONS: MapLocation[] = [
  {
    id: 'selous-fly-in',
    name: 'Nyerere (Selous) Game Reserve',
    category: 'Wild Fly-In Safari',
    price: '$790',
    image: 'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: "Africa's largest game reserve. Deep wilderness off-road drives and unique riverboat water safaris.",
    duration: '2 Days / 1 Night',
    region: 'Mainland',
    highlights: ['Rufiji River boat cruise', 'African wild dogs tracking', 'Scenic flight over the Indian Ocean']
  },
  {
    id: 'serengeti-seronera',
    name: 'Serengeti Endless Savannahs',
    category: 'Northern Great Migration',
    price: '$1,350',
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Golden endless plains, premier big cats tracking, and the monumental Wildebeest Migration.',
    duration: '4 Days / 3 Nights',
    region: 'Mainland',
    highlights: ['Great Migration herds', 'Hot air balloon safaris', 'Luxury savannah wilderness lodges']
  },
  {
    id: 'ngorongoro-crater',
    name: 'Ngorongoro Volcanic Crater',
    category: 'Natural World Wonder',
    price: '$950',
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Pristine 600m volcanic caldera hosting over 30,000 animals including rare black rhinos.',
    duration: '3 Days / 2 Nights',
    region: 'Mainland',
    highlights: ['Guaranteed Big Five views', 'Volcanic caldera rim walk', 'Massai tribe cultural visits']
  }
];

export default function InteractiveMap({ mode, height = '550px' }: InteractiveMapProps) {
  const locations = mode === 'tours' ? ZANZIBAR_TOUR_LOCATIONS : TANZANIA_SAFARI_LOCATIONS;
  const [activeId, setActiveId] = useState<string>(locations[0]?.id || '');
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'Zanzibar' | 'Mainland'>('All');

  const filteredLocations = useMemo(() => {
    if (selectedRegion === 'All') return locations;
    return locations.filter(loc => loc.region === selectedRegion);
  }, [selectedRegion, locations]);

  const activeLoc = useMemo(() => {
    return locations.find(loc => loc.id === activeId) || locations[0];
  }, [activeId, locations]);

  const handleBookingRedirect = () => {
    // Navigate smoothly to secure reservation tab with state
    window.location.hash = `#booking?experience=${encodeURIComponent(activeLoc.name)}&category=${mode}`;
  };

  return (
    <div className="w-full bg-[#070e1b] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col xl:flex-row relative">
      
      {/* LEFT COLUMN: Luxury Illustrated Interactive SVG Explorer */}
      <div className="w-full xl:w-[500px] shrink-0 bg-gradient-to-b from-[#091122] to-[#040a15] border-b xl:border-b-0 xl:border-r border-white/10 p-6 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4A017]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-[#D4A017]/10 p-2 rounded-xl border border-[#D4A017]/30">
              <Compass size={18} className="text-[#D4A017] animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest font-sans">
                Swahili Interactive Explorer
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">Premium visualized routes & destination hotspots.</p>
            </div>
          </div>

          {/* Region Tabs */}
          <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-2xl">
            {(['All', 'Zanzibar', 'Mainland'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setSelectedRegion(r);
                  const firstOfRegion = locations.find(l => r === 'All' || l.region === r);
                  if (firstOfRegion) setActiveId(firstOfRegion.id);
                }}
                className={`flex-1 text-center py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                  selectedRegion === r
                    ? 'bg-[#D4A017] text-[#0A1224] shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'All' ? 'All Sites' : r === 'Zanzibar' ? 'Zanzibar Isles' : 'Mainland Safaris'}
              </button>
            ))}
          </div>

          {/* Map Illustration Stage */}
          <div className="relative w-full h-[220px] bg-[#0A1224]/50 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center p-2 shadow-inner">
            
            {/* SVG MAP ILLUSTRATION */}
            <svg viewBox="0 0 400 200" className="w-full h-full text-slate-500 max-w-sm select-none">
              {/* Mainland Tanzania Path Mock */}
              <g className="opacity-80">
                <path 
                  d="M 20,20 C 40,20 60,10 80,30 C 100,50 140,40 160,60 C 180,80 170,120 150,140 C 130,160 80,180 50,170 C 20,160 10,100 20,20 Z" 
                  fill="#111d35" 
                  stroke="#334155" 
                  strokeWidth="1.5"
                  className="transition-colors hover:fill-[#1b2b4d]"
                />
                <text x="70" y="90" fill="#64748b" className="text-[10px] font-black uppercase tracking-widest font-mono">Tanzania</text>
                <text x="70" y="102" fill="#475569" className="text-[8px] font-bold uppercase tracking-wider font-mono">Mainland</text>
              </g>

              {/* Zanzibar Island Path Mock */}
              <g className="opacity-90">
                <path 
                  d="M 260,70 C 275,55 295,45 300,60 C 305,75 295,110 290,130 C 285,150 270,160 260,140 C 250,120 250,85 260,70 Z" 
                  fill="#1d2e4f" 
                  stroke="#D4A017" 
                  strokeWidth="1.5"
                  className="transition-colors hover:fill-[#253b64]"
                />
                {/* Pemba Island */}
                <path 
                  d="M 310,20 C 315,15 325,10 325,20 C 325,30 318,45 315,50 C 310,45 305,30 310,20 Z" 
                  fill="#14213d" 
                  stroke="#334155" 
                  strokeWidth="1"
                />
                <text x="295" y="110" fill="#D4A017" className="text-[10px] font-black uppercase tracking-wider font-mono">Unguja</text>
                <text x="295" y="120" fill="#94a3b8" className="text-[7px] font-black uppercase tracking-widest">Zanzibar</text>
              </g>

              {/* Dotted Flight Route Connections */}
              <line x1="130" y1="95" x2="265" y2="105" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="4,6" className="animate-pulse" />
              <line x1="80" y1="50" x2="265" y2="105" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="4,6" className="opacity-50" />
              <line x1="110" y1="130" x2="265" y2="105" stroke="#D4A017" strokeWidth="1.5" strokeDasharray="4,6" className="opacity-50" />

              {/* Interactive Vector Hotspots */}
              {/* Zanzibar Stone Town / Airport */}
              <circle cx="265" cy="105" r="5" fill="#D4A017" className="cursor-pointer hover:r-7 transition-all" onClick={() => setActiveId(mode === 'tours' ? 'stone-town' : 'selous-fly-in')} />
              <circle cx="265" cy="105" r="10" fill="none" stroke="#D4A017" strokeWidth="1" className="animate-ping" style={{ transformOrigin: '265px 105px' }} />

              {/* Nungwi Hotspot */}
              <circle cx="270" cy="65" r="4" fill="#0B3B8C" className="cursor-pointer" onClick={() => setActiveId(mode === 'tours' ? 'nungwi-aquarium' : 'selous-fly-in')} />
              
              {/* Mnemba Hotspot */}
              <circle cx="295" cy="60" r="4" fill="#0B3B8C" className="cursor-pointer" onClick={() => setActiveId(mode === 'tours' ? 'mnemba-atoll' : 'selous-fly-in')} />

              {/* Selous Game Reserve Hotspot */}
              <circle cx="110" cy="130" r="5" fill="#D4A017" className="cursor-pointer" onClick={() => setActiveId(mode === 'safaris' ? 'selous-fly-in' : 'jozani-forest')} />
              
              {/* Serengeti Hotspot */}
              <circle cx="80" cy="50" r="5" fill="#D4A017" className="cursor-pointer" onClick={() => setActiveId(mode === 'safaris' ? 'serengeti-seronera' : 'safari-blue')} />

              {/* Ngorongoro Hotspot */}
              <circle cx="110" cy="65" r="5" fill="#D4A017" className="cursor-pointer" onClick={() => setActiveId(mode === 'safaris' ? 'ngorongoro-crater' : 'nakupenda-sandbank')} />

              {/* Labels for landmarks */}
              <text x="235" y="13" fill="#475569" className="text-[7px] font-bold font-sans tracking-wide uppercase">Indian Ocean</text>
              <text x="25" y="190" fill="#475569" className="text-[7px] font-bold font-sans tracking-widest uppercase">Tanzania Safari Circuits</text>
            </svg>

            {/* Flight Path Dotted Overlay Indicator */}
            {mode === 'safaris' && (
              <div className="absolute bottom-3 right-3 bg-[#0A1224]/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/15 text-[8px] font-black uppercase text-[#D4A017] tracking-wider pointer-events-none select-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] animate-pulse" />
                Fly-In Dotted Corridors
              </div>
            )}
          </div>

          {/* Quick List select scroll */}
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin pr-1">
            {filteredLocations.map((loc) => {
              const isActive = loc.id === activeId;
              return (
                <button
                  key={loc.id}
                  onClick={() => setActiveId(loc.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#D4A017]/10 border-[#D4A017]/40 text-white'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin size={12} className={isActive ? 'text-[#D4A017]' : 'text-slate-500'} />
                    <span className="text-[11px] font-bold truncate">{loc.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-[#D4A017] shrink-0 ml-2">{loc.price}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Standard Safety Badges */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[8px] text-slate-500 font-mono tracking-widest uppercase mt-4">
          <span className="flex items-center gap-1">
            <Shield size={10} className="text-[#D4A017]" /> Licensed Operator
          </span>
          <span>•</span>
          <span>100% Secure Vehicles</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Luxury Destination Preview Details Card */}
      <div className="flex-grow bg-slate-950 p-6 flex flex-col justify-between h-[500px] xl:h-[550px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLoc.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col justify-between space-y-6"
          >
            {/* Visual Header Grid */}
            <div className="space-y-4">
              <div className="relative h-44 xl:h-52 w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <img 
                  src={activeLoc.image} 
                  alt={activeLoc.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Floating Tags */}
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[9px] font-black uppercase text-[#D4A017] tracking-widest flex items-center gap-1">
                  <Sparkles size={10} className="animate-pulse" />
                  <span>{activeLoc.category}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest font-black text-slate-400 font-mono">Selected Hotspot</span>
                    <h4 className="text-sm sm:text-base font-black text-white leading-tight mt-0.5" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {activeLoc.name}
                    </h4>
                  </div>
                  <div className="bg-[#D4A017] text-[#0A1224] font-mono px-3.5 py-1.5 rounded-xl font-black text-xs shadow-lg uppercase tracking-wide shrink-0 mb-0.5">
                    {activeLoc.price}
                  </div>
                </div>
              </div>

              {/* Information & Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="text-[10px] uppercase tracking-widest font-black text-[#D4A017]">Description</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                    {activeLoc.description}
                  </p>
                  <div className="flex items-center gap-4 pt-1 text-[11px] font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-[#D4A017]" />
                      Duration: {activeLoc.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star size={12} fill="#D4A017" stroke="none" />
                      5.0 (Excellent)
                    </span>
                  </div>
                </div>

                <div className="space-y-2 bg-white/5 border border-white/5 p-3 rounded-2xl">
                  <h5 className="text-[10px] uppercase tracking-widest font-black text-[#D4A017] flex items-center gap-1">
                    <Sparkles size={10} />
                    Swahili Highlight Perks
                  </h5>
                  <ul className="space-y-1.5 text-[10px] font-bold text-slate-300">
                    {activeLoc.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] shrink-0" />
                        <span className="truncate">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Premium CTA Panel */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left max-sm:text-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Estimated Private Package Fare</p>
                <div className="flex items-baseline gap-1.5 justify-center sm:justify-start mt-0.5">
                  <span className="text-xl font-black text-[#D4A017] font-mono">{activeLoc.price}</span>
                  <span className="text-[9px] text-slate-400 font-bold font-mono">USD Net / pax</span>
                </div>
              </div>

              <button
                onClick={handleBookingRedirect}
                className="w-full sm:w-auto bg-[#D4A017] hover:bg-white text-[#0A1224] text-xs font-black px-6 py-3.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 group tracking-widest uppercase cursor-pointer shadow-lg hover:shadow-[#D4A017]/25"
              >
                <span>Customize & Book Now</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
