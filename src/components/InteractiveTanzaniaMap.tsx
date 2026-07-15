import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, MapPin, Trees, Anchor, Plane, Hotel, Sparkles, 
  ChevronRight, ZoomIn, ZoomOut, RefreshCw, Eye
} from 'lucide-react';

export interface MapMarker {
  id: string;
  name: string;
  category: 'park' | 'beach' | 'airport' | 'hotel' | 'attraction';
  region: 'northern' | 'southern' | 'western' | 'zanzibar';
  x: number; // SVG ViewBox coordinates (0-800)
  y: number; // SVG ViewBox coordinates (0-600)
  description: string;
  destinationId?: string; // If mapping to destination page
  image: string;
}

const MAP_MARKERS: MapMarker[] = [
  // 1. National Parks & Safaris
  {
    id: 'serengeti-marker',
    name: 'Serengeti National Park',
    category: 'park',
    region: 'northern',
    x: 235,
    y: 110,
    description: 'Home of the legendary Great Wildebeest Migration and spectacular predator density.',
    destinationId: 'serengeti',
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'ngorongoro-marker',
    name: 'Ngorongoro Conservation Area',
    category: 'park',
    region: 'northern',
    x: 335,
    y: 125,
    description: 'A massive volcanic caldera sheltering over 25,000 large mammals and rare black rhinos.',
    destinationId: 'ngorongoro',
    image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'kilimanjaro-marker',
    name: 'Mount Kilimanjaro',
    category: 'park',
    region: 'northern',
    x: 440,
    y: 135,
    description: 'The Roof of Africa. The tallest free-standing mountain on Earth at 5,895m.',
    destinationId: 'kilimanjaro',
    image: 'https://images.pexels.com/photos/1433052/pexels-photo-1433052.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'tarangire-marker',
    name: 'Tarangire National Park',
    category: 'park',
    region: 'northern',
    x: 380,
    y: 200,
    description: 'Famous for its giant ancient Baobab trees and massive seasonal elephant herds.',
    destinationId: 'tarangire',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'lake-manyara-marker',
    name: 'Lake Manyara National Park',
    category: 'park',
    region: 'northern',
    x: 350,
    y: 165,
    description: 'A scenic soda lake hosting pink flamingos and legendary tree-climbing lions.',
    destinationId: 'manyara',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'nyerere-marker',
    name: 'Nyerere National Park (Selous)',
    category: 'park',
    region: 'southern',
    x: 470,
    y: 430,
    description: 'Africa\'s largest untouched wilderness reserve. Renowned for boat safaris on the Rufiji River.',
    destinationId: 'selous',
    image: 'https://images.unsplash.com/photo-1504541982953-47402ac73d70?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ruaha-marker',
    name: 'Ruaha National Park',
    category: 'park',
    region: 'southern',
    x: 300,
    y: 380,
    description: 'Wild, rugged, and remote. Home to 10% of the world\'s remaining wild lion population.',
    destinationId: 'ruaha',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'mikumi-marker',
    name: 'Mikumi National Park',
    category: 'park',
    region: 'southern',
    x: 420,
    y: 370,
    description: 'The Mkata Floodplain of Mikumi is often compared to the Serengeti for its wildlife density.',
    destinationId: 'mikumi',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'udzungwa-marker',
    name: 'Udzungwa Mountains',
    category: 'park',
    region: 'southern',
    x: 375,
    y: 405,
    description: 'The Eastern Arc Galapagos. Exceptional biodiversity, waterfalls, and endemic primates.',
    destinationId: 'udzungwa',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80'
  },

  // 2. Tropical Beaches & Islands
  {
    id: 'unguja-marker',
    name: 'Unguja (Zanzibar Island)',
    category: 'beach',
    region: 'zanzibar',
    x: 585,
    y: 295,
    description: 'The main island of the archipelago, lined with powdery sand beaches and spice groves.',
    destinationId: 'unguja',
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'pemba-marker',
    name: 'Pemba Island',
    category: 'beach',
    region: 'zanzibar',
    x: 605,
    y: 215,
    description: 'The Green Island. Famous for clove plantations, deep-wall diving, and dense forests.',
    destinationId: 'pemba',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'mafia-marker',
    name: 'Mafia Island',
    category: 'beach',
    region: 'zanzibar',
    x: 608,
    y: 380,
    description: 'A marine paradise renowned for swimming with massive gentle whale sharks.',
    destinationId: 'mafia',
    image: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=400&q=80'
  },

  // 3. Airports
  {
    id: 'znz-airport',
    name: 'Zanzibar Intl Airport (ZNZ)',
    category: 'airport',
    region: 'zanzibar',
    x: 575,
    y: 300,
    description: 'Abeid Amani Karume International Airport, the main aerial entry point to Zanzibar.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'jro-airport',
    name: 'Kilimanjaro Intl Airport (JRO)',
    category: 'airport',
    region: 'northern',
    x: 430,
    y: 150,
    description: 'Gateway to the Northern Circuit safaris and Kilimanjaro climbing treks.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'dar-airport',
    name: 'Julius Nyerere Intl Airport (DAR)',
    category: 'airport',
    region: 'southern',
    x: 550,
    y: 345,
    description: 'Tanzania\'s primary international airport based in the commercial capital of Dar es Salaam.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80'
  },

  // 4. Hotels & Lodges
  {
    id: 'four-seasons-serengeti',
    name: 'Four Seasons Safari Lodge',
    category: 'hotel',
    region: 'northern',
    x: 255,
    y: 95,
    description: 'Ultra-luxury lodge overlooking an active elephant watering hole in central Serengeti.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ngorongoro-crater-lodge',
    name: 'Ngorongoro Crater Lodge',
    category: 'hotel',
    region: 'northern',
    x: 325,
    y: 110,
    description: 'A dramatic luxury camp perched directly on the high rim of Ngorongoro Caldera.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'zanzibar-serena-hotel',
    name: 'Zanzibar Serena Hotel',
    category: 'hotel',
    region: 'zanzibar',
    x: 580,
    y: 290,
    description: 'An elegant seafront hotel in Stone Town reflecting rich Swahili-sultan history.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'
  },

  // 5. Attractions
  {
    id: 'stone-town-attraction',
    name: 'Stone Town Historic Site',
    category: 'attraction',
    region: 'zanzibar',
    x: 585,
    y: 285,
    description: 'A UNESCO World Heritage site featuring historic coral stone architecture and carved wooden doors.',
    destinationId: 'unguja',
    image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'mnemba-reef-attraction',
    name: 'Mnemba Island Marine Atoll',
    category: 'attraction',
    region: 'zanzibar',
    x: 595,
    y: 275,
    description: 'The snorkeling and diving crown jewel of Zanzibar, teeming with green turtles and dolphins.',
    destinationId: 'unguja',
    image: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'prison-island-attraction',
    name: 'Prison Island Giant Tortoises',
    category: 'attraction',
    region: 'zanzibar',
    x: 578,
    y: 298,
    description: 'A beautiful sanctuary for giant Aldabra tortoises brought over in the late 19th century.',
    destinationId: 'unguja',
    image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=400&q=80'
  }
];

interface InteractiveTanzaniaMapProps {
  navigate: (page: string, id?: string) => void;
}

export default function InteractiveTanzaniaMap({ navigate }: InteractiveTanzaniaMapProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'park' | 'beach' | 'airport' | 'hotel' | 'attraction'>('all');
  const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // Zoom factor
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const categories = [
    { id: 'all', label: 'All Markers', icon: <Compass size={14} /> },
    { id: 'park', label: 'National Parks & Safaris', icon: <Trees size={14} className="text-emerald-400" /> },
    { id: 'beach', label: 'Beaches & Islands', icon: <Anchor size={14} className="text-sky-400" /> },
    { id: 'airport', label: 'Airports', icon: <Plane size={14} className="text-amber-400" /> },
    { id: 'hotel', label: 'Luxury Lodging', icon: <Hotel size={14} className="text-violet-400" /> },
    { id: 'attraction', label: 'Top Attractions', icon: <Sparkles size={14} className="text-[#D4A017]" /> }
  ];

  const filteredMarkers = MAP_MARKERS.filter(marker => {
    return activeCategory === 'all' || marker.category === activeCategory;
  });

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => {
    setZoom(z => {
      const next = Math.max(z - 0.25, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedMarker(null);
  };

  const getMarkerColor = (cat: string) => {
    switch (cat) {
      case 'park': return 'bg-emerald-500 text-white ring-emerald-500/30';
      case 'beach': return 'bg-sky-500 text-white ring-sky-500/30';
      case 'airport': return 'bg-amber-500 text-white ring-amber-500/30';
      case 'hotel': return 'bg-violet-500 text-white ring-violet-500/30';
      case 'attraction':
      default:
        return 'bg-[#D4A017] text-white ring-[#D4A017]/30';
    }
  };

  const getMarkerIcon = (cat: string) => {
    switch (cat) {
      case 'park': return <Trees size={12} />;
      case 'beach': return <Anchor size={12} />;
      case 'airport': return <Plane size={12} />;
      case 'hotel': return <Hotel size={12} />;
      case 'attraction':
      default:
        return <Sparkles size={12} />;
    }
  };

  return (
    <div className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden p-6 sm:p-8 space-y-6 shadow-2xl relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(212,160,23,0.03),transparent_50%)]" />
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] text-[#D4A017] uppercase font-black tracking-widest block">Geographic Guide</span>
          <h2 className="text-2xl font-serif font-black text-white uppercase tracking-tight">Interactive Tanzania Atlas</h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Click markers to discover parks, remote islands, flight hubs, and world-class luxury lodges across Tanzania and Zanzibar.
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-[#020C1F] border border-white/10 p-1 rounded-xl">
          <button 
            onClick={handleZoomIn} 
            title="Zoom In"
            className="p-2 hover:bg-white/5 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ZoomIn size={16} />
          </button>
          <button 
            onClick={handleZoomOut} 
            title="Zoom Out"
            className="p-2 hover:bg-white/5 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ZoomOut size={16} />
          </button>
          <button 
            onClick={handleReset} 
            title="Reset Map"
            className="p-2 hover:bg-[#D4A017] hover:text-[#020C1F] rounded-lg text-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Categories Toolbar */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none relative z-10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id as any);
              setSelectedMarker(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-[#D4A017] to-[#b8860b] text-[#020C1F]'
                : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Main Map Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Interactive SVG Wrapper */}
        <div className="lg:col-span-8 bg-[#020C1F] border border-white/5 rounded-2xl relative aspect-[4/3] w-full overflow-hidden shadow-inner group">
          
          {/* Legend widget inside map */}
          <div className="absolute bottom-4 left-4 z-20 bg-[#0A1224]/80 backdrop-blur-md border border-white/10 p-3 rounded-xl hidden sm:block text-[10px] space-y-1">
            <span className="font-extrabold text-white block mb-1 uppercase tracking-wider">Map Legend</span>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>National Parks & Safaris</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              <span>Beaches & Island Escapes</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Airport Connections</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
              <span>Premium Lodges</span>
            </div>
          </div>

          <div 
            className="w-full h-full transition-transform duration-300 ease-out origin-center select-none"
            style={{ 
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
            <svg viewBox="0 0 800 600" className="w-full h-full text-slate-700">
              {/* Lake Victoria (Top Left/Center) */}
              <path 
                d="M 180 30 Q 240 10 320 40 Q 340 70 300 90 Q 240 110 180 80 Z" 
                fill="#0A1D3D" 
                stroke="#1E293B" 
                strokeWidth="2" 
                className="opacity-50"
              />
              <text x="210" y="60" fill="#38BDF8" className="text-[10px] uppercase font-black tracking-widest font-mono opacity-30">Lake Victoria</text>
              
              {/* Lake Tanganyika (Left/Bottom) */}
              <path 
                d="M 60 160 Q 90 280 80 440 Q 60 450 40 400 Q 50 250 40 170 Z" 
                fill="#0A1D3D" 
                stroke="#1E293B" 
                strokeWidth="2" 
                className="opacity-50"
              />
              <text x="35" y="300" fill="#38BDF8" className="text-[10px] uppercase font-black tracking-widest font-mono opacity-30 origin-center -rotate-90">Lake Tanganyika</text>
              
              {/* Lake Nyasa (Bottom Left/Center) */}
              <path 
                d="M 220 450 Q 280 500 270 560 Q 250 570 230 530 Q 200 480 210 460 Z" 
                fill="#0A1D3D" 
                stroke="#1E293B" 
                strokeWidth="2" 
                className="opacity-50"
              />
              <text x="220" y="520" fill="#38BDF8" className="text-[10px] uppercase font-black tracking-widest font-mono opacity-30 origin-center -rotate-45">Lake Nyasa</text>
              
              {/* Indian Ocean Backdrop */}
              <rect x="620" y="0" width="180" height="600" fill="#030712" opacity="0.3" />
              <text x="680" y="450" fill="#38BDF8" className="text-[11px] uppercase font-black tracking-widest font-mono opacity-30 origin-center rotate-90">Indian Ocean</text>

              {/* Tanzania Polygonal boundaries for High-Tech Aesthetic */}
              <path 
                d="M 100 120 L 160 110 L 180 80 L 300 90 L 320 50 L 360 40 L 400 60 L 440 60 L 520 120 L 520 180 L 560 210 L 550 260 L 600 300 L 590 350 L 630 380 L 620 440 L 640 480 L 610 560 L 520 560 L 460 510 L 340 500 L 280 550 L 260 550 L 230 500 L 220 450 L 130 420 L 110 440 L 80 430 L 90 280 L 60 160 Z" 
                fill="none" 
                stroke="#D4A017" 
                strokeWidth="2" 
                strokeDasharray="4 4" 
                className="opacity-40"
              />
              <path 
                d="M 100 120 L 160 110 L 180 80 L 300 90 L 320 50 L 360 40 L 400 60 L 440 60 L 520 120 L 520 180 L 560 210 L 550 260 L 600 300 L 590 350 L 630 380 L 620 440 L 640 480 L 610 560 L 520 560 L 460 510 L 340 500 L 280 550 L 260 550 L 230 500 L 220 450 L 130 420 L 110 440 L 80 430 L 90 280 L 60 160 Z" 
                fill="#050E21" 
                className="opacity-75"
              />
            </svg>

            {/* Glowing Map Markers placed overlay */}
            <AnimatePresence>
              {filteredMarkers.map((marker) => {
                const isHovered = hoveredMarker?.id === marker.id;
                const isSelected = selectedMarker?.id === marker.id;

                return (
                  <div
                    key={marker.id}
                    style={{ 
                      position: 'absolute', 
                      left: `${(marker.x / 800) * 100}%`, 
                      top: `${(marker.y / 600) * 100}%` 
                    }}
                    className="transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
                    onMouseEnter={() => setHoveredMarker(marker)}
                    onMouseLeave={() => setHoveredMarker(null)}
                    onClick={() => setSelectedMarker(marker)}
                  >
                    {/* Ring pulsar animation */}
                    <span className={`absolute inset-0 rounded-full animate-ping opacity-60 scale-150 duration-1000 ${
                      marker.category === 'park' ? 'bg-emerald-400' :
                      marker.category === 'beach' ? 'bg-sky-400' :
                      marker.category === 'airport' ? 'bg-amber-400' :
                      marker.category === 'hotel' ? 'bg-violet-400' :
                      'bg-[#D4A017]'
                    }`} />
                    
                    {/* Core pin button */}
                    <button
                      className={`w-6.5 h-6.5 rounded-full flex items-center justify-center border border-white/25 shadow-lg transition-all ${
                        isHovered || isSelected ? 'scale-125 bg-white text-[#020C1F]' : getMarkerColor(marker.category)
                      }`}
                    >
                      {getMarkerIcon(marker.category)}
                    </button>

                    {/* Tiny text identifier */}
                    <span className="absolute left-7 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] font-black tracking-wider uppercase bg-black/65 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/5 text-slate-300 hidden md:block">
                      {marker.name.replace(' National Park', '').replace(' Conservation Area', '').replace(' Island', '')}
                    </span>
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected / Info Panel Column */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-[#020C1F]/40 border border-white/5 rounded-2xl p-5 min-h-[300px] relative">
          
          <AnimatePresence mode="wait">
            {selectedMarker || hoveredMarker ? (
              <motion.div
                key={(selectedMarker || hoveredMarker)!.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 flex-grow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5">
                    <img 
                      src={(selectedMarker || hoveredMarker)!.image} 
                      alt={(selectedMarker || hoveredMarker)!.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] uppercase font-black text-[#D4A017] tracking-wider border border-white/10">
                      {(selectedMarker || hoveredMarker)!.category.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-[#D4A017] uppercase tracking-wider block">
                      {(selectedMarker || hoveredMarker)!.region} Circuit
                    </span>
                    <h3 className="text-base font-black text-white leading-tight font-serif">
                      {(selectedMarker || hoveredMarker)!.name}
                    </h3>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">
                    {(selectedMarker || hoveredMarker)!.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  {(selectedMarker || hoveredMarker)!.destinationId ? (
                    <button
                      onClick={() => navigate('destinations', (selectedMarker || hoveredMarker)!.destinationId)}
                      className="w-full py-2.5 rounded-xl bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#D4A017]/10 cursor-pointer"
                    >
                      <span>Explore Destination</span>
                      <Eye size={12} />
                    </button>
                  ) : (
                    <div className="text-center py-2.5 text-[10px] text-slate-500 font-extrabold uppercase bg-white/5 rounded-xl">
                      📍 General Geographic Marker
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex-grow flex flex-col justify-center items-center text-center p-6 space-y-3 text-slate-500">
                <Compass className="w-10 h-10 animate-spin text-[#D4A017]/30" style={{ animationDuration: '15s' }} />
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Select an Atlas Marker</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mt-1">
                    Hover over pins to preview landscapes, or click on points directly to unveil customized details, activities, and access professional travel landing pages.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Quick Info footer */}
          <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-500 flex justify-between items-center bg-slate-950/20 p-2.5 rounded-xl">
            <span className="flex items-center gap-1">
              <MapPin size={10} className="text-[#D4A017]" /> Tanzania & Zanzibar
            </span>
            <span>Local Guides Active</span>
          </div>

        </div>
      </div>
    </div>
  );
}
