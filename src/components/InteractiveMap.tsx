import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, MapPin, Sparkles, Shield, ArrowRight, Star, Clock, 
  Calendar, Users, MessageCircle, CheckCircle, X, ExternalLink, PhoneCall
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MapLocation {
  id: string;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  mapQuery: string;
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
    numericPrice: 45,
    mapQuery: 'Stone Town, Zanzibar, Tanzania',
    image: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Explore UNESCO heritage alleys, Sultanate palaces, and historical slave quarters with a local Swahili historian.',
    duration: '4 Hours',
    region: 'Zanzibar',
    highlights: ['House of Wonders', 'Old Slave Market', 'Forodhani Gardens', 'Freddie Mercury House']
  },
  {
    id: 'spice-farm',
    name: 'Spice Farm Plantation Tour',
    category: 'Swahili Culinary',
    price: '$35',
    numericPrice: 35,
    mapQuery: 'Kizimbani Spice Farm, Zanzibar, Tanzania',
    image: 'https://images.pexels.com/photos/2835547/pexels-photo-2835547.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Touch, smell, and taste exotic tropical spices at a rural organic plantation with a traditional coconut climber show.',
    duration: '3 Hours',
    region: 'Zanzibar',
    highlights: ['Cardamom & Vanilla tasting', 'Spice crown ceremony', 'Fresh tropical fruits lunch', 'Herbal spice tea']
  },
  {
    id: 'prison-island',
    name: 'Prison Island Tortoise Tour',
    category: 'Wildlife & History',
    price: '$40',
    numericPrice: 40,
    mapQuery: 'Changuu Island, Zanzibar, Tanzania',
    image: 'https://images.pexels.com/photos/5033320/pexels-photo-5033320.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Visit the historic quarantine station and feed Aldabra giant tortoises dating back over 150 years.',
    duration: '3.5 Hours',
    region: 'Zanzibar',
    highlights: ['Feed 150-year-old tortoises', 'Quarantine jail museum', 'Prussian blue reef snorkeling', 'Dhow boat ride']
  },
  {
    id: 'jozani-forest',
    name: 'Jozani Forest National Park',
    category: 'Endemic Nature',
    price: '$50',
    numericPrice: 50,
    mapQuery: 'Jozani Chwaka Bay National Park, Zanzibar, Tanzania',
    image: 'https://images.pexels.com/photos/4032590/pexels-photo-4032590.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Walk through mangrove boardwalks and spot endemic Red Colobus monkeys found nowhere else on earth.',
    duration: '3 Hours',
    region: 'Zanzibar',
    highlights: ['Endemic Red Colobus monkeys', 'Eucalyptus & mahogany trails', 'Salt marsh mangrove boardwalk', 'Nature guide']
  },
  {
    id: 'safari-blue',
    name: 'Safari Blue Sandbank Cruise',
    category: 'Water Adventure',
    price: '$85',
    numericPrice: 85,
    mapQuery: 'Fumba, Zanzibar, Tanzania',
    image: 'https://images.pexels.com/photos/1078983/pexels-photo-1078983.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Sail on traditional wooden dhows across Menai Bay, snorkel crystal coral reefs, and feast on grilled lobster seafood.',
    duration: 'Full Day',
    region: 'Zanzibar',
    highlights: ['Fumba bay dhow cruise', 'Baobab island exploration', 'Grilled lobster seafood feast', 'Sandbank snorkeling']
  },
  {
    id: 'nakupenda-sandbank',
    name: 'Nakupenda Sandbank Picnic',
    category: 'Water Adventure',
    price: '$75',
    numericPrice: 75,
    mapQuery: 'Nakupenda Sandbank, Zanzibar, Tanzania',
    image: 'https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Relax on a pristine white sandbank appearing in the turquoise ocean and enjoy fresh tropical fruits and seafood.',
    duration: '6 Hours',
    region: 'Zanzibar',
    highlights: ['Pristine sandbar picnic', 'Fresh fruit platter', 'Snorkeling in shallow sand banks', 'Tropical sunbathing']
  },
  {
    id: 'nungwi-aquarium',
    name: 'Nungwi Turtle Conservation',
    category: 'Wildlife Sanctuary',
    price: '$65',
    numericPrice: 65,
    mapQuery: 'Baraka Natural Aquarium, Nungwi, Zanzibar, Tanzania',
    image: 'https://images.pexels.com/photos/3041883/pexels-photo-3041883.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Swim alongside rescued sea turtles in a natural tidal lagoon and enjoy northern Zanzibar sunset views.',
    duration: '5 Hours',
    region: 'Zanzibar',
    highlights: ['Swim in natural lagoon', 'Turtle rescue release program', 'Northern sunset over Nungwi', 'Village walk']
  },
  {
    id: 'mnemba-atoll',
    name: 'Mnemba Island Snorkeling',
    category: 'Water Adventure',
    price: '$70',
    numericPrice: 70,
    mapQuery: 'Mnemba Island, Zanzibar, Tanzania',
    image: 'https://images.pexels.com/photos/1680140/pexels-photo-1680140.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Snorkel the vibrant marine conservation area with wild dolphins, sea turtles, and colorful coral gardens.',
    duration: '5 Hours',
    region: 'Zanzibar',
    highlights: ['Wild dolphin spotting', 'Vibrant coral reef snorkeling', 'Tropical beach snack break', 'Crystal clear waters']
  }
];

const TANZANIA_SAFARI_LOCATIONS: MapLocation[] = [
  {
    id: 'selous-fly-in',
    name: 'Nyerere (Selous) Game Reserve',
    category: 'Wild Fly-In Safari',
    price: '$790',
    numericPrice: 790,
    mapQuery: 'Nyerere National Park, Tanzania',
    image: 'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: "Africa's largest game reserve. Deep wilderness off-road 4x4 game drives and unique riverboat water safaris on Rufiji River.",
    duration: '2 Days / 1 Night',
    region: 'Mainland',
    highlights: ['Rufiji River boat cruise', 'African wild dogs tracking', 'Scenic flight over Indian Ocean', 'Full board lodge']
  },
  {
    id: 'serengeti-seronera',
    name: 'Serengeti Endless Savannahs',
    category: 'Northern Great Migration',
    price: '$1,350',
    numericPrice: 1350,
    mapQuery: 'Serengeti National Park, Tanzania',
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Golden endless plains, premier big cats tracking, and the monumental Wildebeest Migration across northern Tanzania.',
    duration: '4 Days / 3 Nights',
    region: 'Mainland',
    highlights: ['Great Migration herds', 'Hot air balloon safaris', 'Luxury savannah wilderness lodges', 'Big Five tracking']
  },
  {
    id: 'ngorongoro-crater',
    name: 'Ngorongoro Volcanic Crater',
    category: 'Natural World Wonder',
    price: '$950',
    numericPrice: 950,
    mapQuery: 'Ngorongoro Conservation Area, Tanzania',
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Pristine 600m volcanic caldera hosting over 30,000 animals including rare black rhinos, lions, and flamingo lakes.',
    duration: '3 Days / 2 Nights',
    region: 'Mainland',
    highlights: ['Guaranteed Big Five views', 'Volcanic caldera rim walk', 'Massai tribe cultural visits', 'Crater floor picnic']
  }
];

export default function InteractiveMap({ mode, height = '600px' }: InteractiveMapProps) {
  const locations = mode === 'tours' ? ZANZIBAR_TOUR_LOCATIONS : TANZANIA_SAFARI_LOCATIONS;
  const [activeId, setActiveId] = useState<string>(locations[0]?.id || '');
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'Zanzibar' | 'Mainland'>('All');

  // Quick Booking Sheet State
  const [bookingLocation, setBookingLocation] = useState<MapLocation | null>(null);
  const [paxCount, setPaxCount] = useState<number>(2);
  const [travelDate, setTravelDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [pickupHotel, setPickupHotel] = useState<string>('');
  const [declaration, setDeclaration] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<{ ref: string; whatsappUrl: string } | null>(null);

  const filteredLocations = useMemo(() => {
    if (selectedRegion === 'All') return locations;
    return locations.filter(loc => loc.region === selectedRegion);
  }, [selectedRegion, locations]);

  const activeLoc = useMemo(() => {
    return locations.find(loc => loc.id === activeId) || locations[0];
  }, [activeId, locations]);

  const handleOpenBooking = (loc: MapLocation) => {
    setBookingLocation(loc);
    setBookingSuccess(null);
  };

  const handleCloseBooking = () => {
    setBookingLocation(null);
    setBookingSuccess(null);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingLocation || !fullName || !phone) {
      alert('Please fill in your name and WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);
    const refCode = `ZTR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalCalcUSD = bookingLocation.numericPrice * paxCount;

    const bookingPayload = {
      id: `bk_${Date.now()}`,
      reference_code: refCode,
      customer_name: fullName,
      customer_email: email,
      customer_phone: phone,
      product_name: bookingLocation.name,
      product_category: mode,
      travel_date: travelDate,
      guest_count: paxCount,
      pickup_location: pickupHotel || 'To be specified',
      total_price: totalCalcUSD,
      special_requests: declaration,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      // 1. Local storage backup saving
      const existingBookings = JSON.parse(localStorage.getItem('ztr_local_bookings_backup') || '[]');
      localStorage.setItem('ztr_local_bookings_backup', JSON.stringify([bookingPayload, ...existingBookings]));

      const currentAdminList = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
      const adminObj = {
        id: bookingPayload.id,
        reference_code: refCode,
        full_name: fullName,
        email: email,
        whatsapp_number: phone,
        tour_name: bookingLocation.name,
        preferred_date: travelDate,
        number_of_guests: paxCount,
        pickup_location: pickupHotel || 'To be specified',
        message: declaration,
        status: 'pending',
        created_at: bookingPayload.created_at
      };
      localStorage.setItem('ztr_bookings', JSON.stringify([adminObj, ...currentAdminList]));

      // 2. Supabase insert
      await supabase.from('bookings').insert([{
        reference_code: refCode,
        customer_name: fullName,
        customer_email: email,
        customer_phone: phone,
        product_name: bookingLocation.name,
        product_category: mode,
        travel_date: travelDate,
        guest_count: paxCount,
        pickup_location: pickupHotel || 'To be specified',
        total_price: totalCalcUSD,
        status: 'pending',
        details: bookingPayload
      }]);
    } catch (err) {
      console.warn('Booking saved locally fallback:', err);
    } finally {
      setIsSubmitting(false);

      const waMsg = `Jambo Zanzibar Trip & Relax! I have submitted a booking for:\n\n` +
        `📌 *Excursion:* ${bookingLocation.name}\n` +
        `🔢 *Reference:* ${refCode}\n` +
        `👥 *Guests:* ${paxCount} pax\n` +
        `📅 *Date:* ${travelDate}\n` +
        `💰 *Total Estimated Price:* $${totalCalcUSD} USD\n` +
        `👤 *Lead Guest:* ${fullName}\n` +
        `📞 *Phone:* ${phone}\n` +
        `🏨 *Hotel Pickup:* ${pickupHotel || 'To be communicated'}\n` +
        `📝 *Notes:* ${declaration || 'None'}\n\n` +
        `Please confirm our availability. Asante sana!`;

      const waUrl = `https://wa.me/255629506063?text=${encodeURIComponent(waMsg)}`;
      setBookingSuccess({ ref: refCode, whatsappUrl: waUrl });
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Main Map Explorer Container */}
      <div className="w-full bg-[#070e1b] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col xl:flex-row relative">
        
        {/* LEFT COLUMN: Hotspot Selection List & Regions */}
        <div className="w-full xl:w-[420px] shrink-0 bg-[#091122] border-b xl:border-b-0 xl:border-r border-white/10 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#D4A017]/10 p-2 rounded-xl border border-[#D4A017]/30">
                <Compass size={20} className="text-[#D4A017] animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest font-sans">
                  Swahili Interactive Explorer
                </h3>
                <p className="text-[11px] text-slate-400 font-bold">Select a hotspot to view its real Google Map</p>
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

            {/* Interactive Hotspot List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto scrollbar-thin pr-1">
              {filteredLocations.map((loc) => {
                const isActive = loc.id === activeId;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setActiveId(loc.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#D4A017]/15 border-[#D4A017] text-white shadow-lg'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#D4A017] text-[#0A1224]' : 'bg-white/10 text-slate-400'
                      }`}>
                        <MapPin size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold block truncate text-white">{loc.name}</span>
                        <span className="text-[10px] text-slate-400 block font-medium">{loc.category} • {loc.duration}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-mono font-black text-[#D4A017] block">{loc.price}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-bold">per pax</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safety Footer */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400 font-mono tracking-widest uppercase">
            <span className="flex items-center gap-1">
              <Shield size={11} className="text-[#D4A017]" /> Licensed Operator
            </span>
            <span>•</span>
            <span>100% Secure Vehicles</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Real Embedded Google Map & Selected Location Details */}
        <div className="flex-grow bg-slate-950 p-6 flex flex-col justify-between space-y-6 relative">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-black text-[#D4A017] font-mono block">
                Real Google Map Destination Location
              </span>
              <h4 className="text-lg sm:text-xl font-black text-white mt-0.5" style={{ fontFamily: 'Playfair Display, serif' }}>
                {activeLoc.name}
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-[#D4A017] font-mono">{activeLoc.price}</span>
              <button
                onClick={() => handleOpenBooking(activeLoc)}
                className="bg-[#D4A017] hover:bg-amber-400 text-[#0A1224] text-xs font-black px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 uppercase tracking-wider cursor-pointer shadow-lg active:scale-95"
              >
                <span>Book Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* REAL GOOGLE MAP IFRAME CONTAINER */}
          <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900">
            <iframe
              key={activeLoc.id}
              title={`Google Map - ${activeLoc.name}`}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(activeLoc.mapQuery)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full border-0 filter contrast-[1.05]"
              loading="lazy"
              allowFullScreen
            />
            
            <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-[10px] font-black uppercase text-[#D4A017] tracking-wider flex items-center gap-1.5 shadow-md pointer-events-none">
              <MapPin size={12} className="text-[#D4A017]" />
              <span>Exact Location: {activeLoc.mapQuery}</span>
            </div>
          </div>

          {/* Details & Perks Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-black text-[#D4A017] block">Excursion Overview</span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {activeLoc.description}
              </p>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-[#D4A017]" />
                  Duration: {activeLoc.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={13} fill="#D4A017" stroke="none" />
                  5.0 (Excellent)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-black text-[#D4A017] flex items-center gap-1">
                <Sparkles size={11} />
                Destination Perks & Highlights
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300 font-semibold">
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
      </div>

      {/* RECOMMENDED RELAXATION EXCURSIONS AT THE BOTTOM */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[#D4A017] uppercase tracking-widest font-black text-[10px] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block mb-1">
              🌴 Swahili Island Favorites
            </span>
            <h3 className="text-2xl font-black text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Recommended Relaxation Excursions
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-xs">
            Handpicked tranquil island tours and ocean excursions tailored for maximum relaxation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ZANZIBAR_TOUR_LOCATIONS.map((tour) => (
            <div
              key={tour.id}
              onClick={() => {
                setActiveId(tour.id);
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="group bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-slate-200">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-[#D4A017] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {tour.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#0B3B8C] text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
                    {tour.price}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-extrabold text-[#0B3B8C] group-hover:text-[#D4A017] transition-colors text-sm leading-snug line-clamp-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {tour.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {tour.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveId(tour.id);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="flex-1 bg-white border border-slate-200 hover:border-[#0B3B8C] text-[#0B3B8C] text-[11px] font-black py-2.5 rounded-xl transition-colors text-center uppercase tracking-wider cursor-pointer"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenBooking(tour);
                  }}
                  className="flex-1 bg-[#D4A017] hover:bg-amber-400 text-[#0A1224] text-[11px] font-black py-2.5 rounded-xl transition-colors text-center uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK INTERACTIVE BOOKING SHEET MODAL */}
      <AnimatePresence>
        {bookingLocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1224] border border-white/15 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-white"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseBooking}
                className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/10 p-2 rounded-full transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              {!bookingSuccess ? (
                <form onSubmit={handleSubmitBooking} className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#D4A017] block">
                      Direct Excursion Booking Sheet
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {bookingLocation.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Rate: <strong className="text-[#D4A017] font-mono">{bookingLocation.price}</strong> USD per guest
                    </p>
                  </div>

                  {/* Live Price Calculator Section */}
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-300 uppercase tracking-wider">Number of Guests (Pax):</span>
                      <span className="bg-[#D4A017] text-[#0A1224] px-2.5 py-0.5 rounded-md font-mono font-black text-xs">
                        {paxCount} {paxCount === 1 ? 'Guest' : 'Guests'}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={paxCount}
                      onChange={(e) => setPaxCount(parseInt(e.target.value))}
                      className="w-full accent-[#D4A017] cursor-pointer"
                    />

                    <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Calculated Live Total:</span>
                      <span className="text-xl font-black text-[#D4A017] font-mono">
                        ${bookingLocation.numericPrice * paxCount} USD
                      </span>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-300 block mb-1">
                        Date of Tour / Arrival *
                      </label>
                      <input
                        type="date"
                        required
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-300 block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-300 block mb-1">
                        WhatsApp / Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +1 555 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-black text-slate-300 block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. sarah@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-300 block mb-1">
                      Hotel Pickup Name / Special Declaration
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Pickup at Royal Zanzibar Resort Nungwi. Dietary requirements or special requests..."
                      value={declaration}
                      onChange={(e) => setDeclaration(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#D4A017] hover:bg-amber-400 text-[#0A1224] text-xs font-black py-4 rounded-2xl transition-all uppercase tracking-widest cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Processing Reservation...</span>
                    ) : (
                      <>
                        <span>Submit Tour Booking (${bookingLocation.numericPrice * paxCount} USD)</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Success Screen with WhatsApp Button */
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={36} />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-black text-emerald-400 tracking-widest block">
                      Booking Request Recorded!
                    </span>
                    <h3 className="text-2xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Asante Sana, {fullName}!
                    </h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                      Your booking request for <strong>{bookingLocation.name}</strong> on {travelDate} has been successfully logged with reference <span className="text-[#D4A017] font-mono font-bold">{bookingSuccess.ref}</span>.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <a
                      href={bookingSuccess.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-lg cursor-pointer"
                    >
                      <PhoneCall size={18} />
                      <span>Instant Follow-Up on WhatsApp</span>
                    </a>

                    <button
                      onClick={handleCloseBooking}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer block mx-auto font-medium"
                    >
                      Close window and return to explorer
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
