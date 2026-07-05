import { useState } from 'react';
import { Page } from '../hooks/useHashRouter';
import { Compass, Calendar, Check, ArrowRight, MessageCircle, Star, Clock, List, HelpCircle, X, Shield, ChevronDown, ChevronUp, Sparkles, Image as ImageIcon, MapPin } from 'lucide-react';
import { ProgressiveImage } from '../components/ProgressiveImage';
import InteractiveMap from '../components/InteractiveMap';
import GuestReviews from '../components/GuestReviews';
import { useScrollY } from '../hooks/useScrollY';
import { useAnalytics } from '../context/AnalyticsContext';

interface SafarisProps {
  navigate: (page: Page, id?: string) => void;
}

export const safarisData = [
  {
    id: 'selous-fly-in',
    title: 'Nyerere (Selous) Game Reserve Fly-in Safari',
    duration: '2 Days / 1 Night',
    price: '$790',
    type: 'Fly-In',
    bestFor: 'Couples, Families & Luxury Escapes',
    image: 'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=800',
    desc: 'Embark on a majestic wildlife safari to Africa\'s largest protected game sanctuary — Nyerere National Park (formerly Selous Game Reserve). Just a 45-minute scenic, low-altitude flight from Zanzibar Airport, this sanctuary provides raw, untouched wilderness hosting teeming predator prides, wild hunting dogs, hippos, and giraffes. Stay in luxury eco-tents along the banks of the Rufiji River, and enjoy deep game drives alongside a unique riverboat safari to witness beasts bathing at sundown.',
    highlights: [
      'Scenic bush flight crossing the Zanzibar Channel & coastal forests',
      'High-adrenaline riverboat safari tracking massive crocodiles and pod hippos',
      'Unrestricted wilderness off-road game drives in customized open 4x4 vehicles',
      'Overnight luxurious glamping accommodations with private hot showers',
      'Close encounters with elephants, lions, leopards, leopards, and rare African wild dogs'
    ],
    bestTimeToVisit: 'June to October (Cooler, dry weather brings colossal wildlife numbers to the riverbeds for optimal sighting).',
    whatToBring: [
      'Neutral-toned, lightweight safari clothing (khaki, beige, olive)',
      'Durable hiking shoes or high-quality walking sneakers',
      'Polarized binoculars (vital for spotters) and long-zoom lens cameras',
      'Skins sunblock, heavy-grade mosquito repellent, and sunglasses'
    ],
    included: [
      'Return flights between Zanzibar (ZNZ) and Nyerere (Selous) runway',
      '1 Night boutique forest lodging or riverside luxury glamping camp',
      'All gourmet meals (Breakfast, Picnic lunches, and multi-course Bush dinners)',
      'All national park conservation entries, landing levies, and local landing taxes',
      'Dedicated private safari vehicle operations and certified ranger captains'
    ],
    excluded: [
      'Imported luxury field spirits and extra bar beers',
      'Single room occupancy supplements (unless arranged in booking checkout)',
      'Tips for professional spotters and hospitality cooks'
    ],
    pricingTable: [
      { tier: 'Double Occupancy (Per Person Rate)', rate: '$790 USD' },
      { tier: 'Single Traveler Supplement', rate: '$920 USD' },
      { tier: 'Child Rate (Ages 3–11)', rate: '$580 USD' },
      { tier: 'Private Safari exclusivity upgrade', rate: '+$180 / pax' }
    ],
    faqs: [
      { q: 'What is the flight baggage allowance limit?', a: 'Because the flights utilize small executive light aircraft, baggage is hard-capped at 15kg per traveler in soft duffle bags. Hard shell bags are prohibited.' },
      { q: 'Is Nyerere (Selous) in a malaria risk zone?', a: 'Yes, like all wildlife plains in East Africa. We heavily advise speaking with your physician regarding standard malaria prophylaxis like Malarone.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    seoMetadata: {
      title: 'Selous/Nyerere Fly-in Safari from Zanzibar | 2-Day Wilderness',
      desc: 'Book a 2-Day fly-in safari to Selous (Nyerere National Park) from Zanzibar. Includes return flights, boat safaris, open 4x4 game drives, and luxury riverside tent lodgings.',
      keywords: ['Selous Fly In Safari', 'Zanzibar Safari Packages', 'Nyerere National Park Tour', 'Rufiji River Boat Safari', 'Zanzibar Wildlife Trips']
    },
    itinerary: [
      { day: 'Day 1', title: 'Fligh-in Beach to Bush & Rufiji River Boat Cruise', desc: 'Board your morning flight from Zanzibar to Selous at 07:30 AM. Land in the African bush by 08:15 AM. Meet your driver and begin wildlife spotting immediately. Check into your luxury river camp for hot lunch. At 03:30 PM, board a specialized boat on Rufiji River to view hunting fish eagles, crocodiles, and bathing hippos during sunset.' },
      { day: 'Day 2', title: 'Open-top Savannah Game Drive & Return to Beach Island', desc: 'Initialize with early morning tea and coffee, then head out at 06:30 AM for tracking active predators like lions and leopards. Spot giraffes, zebras, and impalas. Savor a picnic breakfast inside the park under a majestic Acacia. Transfer back to the airstrip for your 04:15 PM flight, landing back in Zanzibar by 05:00 PM.' }
    ]
  },
  {
    id: 'classic-serengeti-ngorongoro',
    title: 'Classic Serengeti & Ngorongoro Crater Combo',
    duration: '4 Days / 3 Nights',
    price: '$1,650',
    type: 'Fly-In & Drive',
    bestFor: 'Once-in-a-Lifetime Travel, Honeymoons & Families',
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=800',
    desc: 'The absolute crown jewel of global wildlife watching. Fly straight from Zanzibar into the volcanic highlands and magnificent grassy plains of Northern Tanzania. Traverse the endless golden horizons of the Central Serengeti, tracking massive lions, elusive leopards resting in Acacias, and millions of wildebeests. Conclude this high-prestige travel experience by descending 600 meters into the magnificent Ngorongoro Crater, a pristine volcanic caldera sheltering over 30,000 animals including the highly endangered black rhino.',
    highlights: [
      'Speed flight straight into Central Serengeti to save valuable road time',
      'Tracking predatory lion prides and cheetahs in the grass plains',
      'Standing inside the stunning world-wonder Ngorongoro Volcanic Crater',
      'Premium overnight boutique safari lodges with rim-top caldera views',
      'Guaranteed spotting of the Legendary African Big Five (Lion, Leopard, Elephant, Buffalo, Rhino)'
    ],
    bestTimeToVisit: 'Year-round. January to March is magnificent for the Serengeti wildebeest calving, while July to October offers dramatic river crossings.',
    whatToBring: [
      'Warm jackets and fleece sweaters (Ngorongoro rims sit at high, cold altitudes)',
      'Comfortable trainers and neutral breathable clothing',
      'High-quality camera with long telephoto zoom lenses and dust protection wrappers',
      'Personal skincare products, heavy-duty insect sprays, and protective lip balms'
    ],
    included: [
      'Return flights between Zanzibar (ZNZ) and Serengeti Seronera airstrips',
      '3 Nights overnight stays in high-prestige boutique lodges/tented camps',
      'All chef-driven gourmet breakfasts, lunches, and high-altitude dinners',
      'All concession levies, conservation entry tickets, and Ngorongoro Crater descent fees',
      'Customized 4x4 Land Cruiser with pop-up roof and high-speed onboard Wi-Fi'
    ],
    excluded: [
      'Foreign visa fees to enter Tanzania (where applicable)',
      'International spirits, fine champagnes, or cabin laundry services',
      'Tips for professional safari driver guides ($15–$20/day recommended)'
    ],
    pricingTable: [
      { tier: 'Shared Double Occupancy Rate (Per Guest)', rate: '$1,650 USD' },
      { tier: 'Private Custom Honeymoon Package (For 2)', rate: '$1,950 / person' },
      { tier: 'Large Group Discount (6+ Guests Pool)', rate: '$1,480 / person' },
      { tier: 'Children (Under 12 years of age)', rate: '$990 USD' }
    ],
    faqs: [
      { q: 'Is there mobile networks and Wi-Fi on the safari camps?', a: 'Surprisingly yes! Most premium camps provide complimentary Wi-Fi in the main lounges. Our customized safari Land Cruisers also host continuous cellular-supported Wi-Fi!' },
      { q: 'Are we safe inside open safari cruisers?', a: 'Completely. Wild animals view the vehicle as a single, non-threatening object. As long as you remain inside the vehicle and listen to your professional ranger, safety is absolute.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    seoMetadata: {
      title: 'Serengeti & Ngorongoro Safari from Zanzibar | 4-Day Big Five Tour',
      desc: 'Book a luxury 4-Day fly-in safari to Serengeti National Park and the Ngorongoro Crater from Zanzibar. All-inclusive luxury travel package with Big Five spotting guides.',
      keywords: ['Serengeti Safari from Zanzibar', 'Ngorongoro Crater Tour', 'Zanzibar Fly-In Safari', 'Big Five Safaris Tanzania', 'Serengeti Wildebeest Migration']
    },
    itinerary: [
      { day: 'Day 1', title: 'Zanzibar flight into Central Serengeti Savannah', desc: 'Depart Zanzibar airport at 08:00 AM on a direct flight arriving at Seronera airstrip by 10:15 AM. Meet your driver and begin an immediate game drive tracking prides in Central Serengeti. Check-in to your luxury tented camp for sunset cocktails and campfire storytelling.' },
      { day: 'Day 2', title: 'Infinite Savannah game drives & Migration tracking', desc: 'Dedicate the full day tracking the Great Migration herds. Spot leopards, hunting leopards, and hyenas. Enjoy a gourmet hot picnic lunch under an umbrella acacia. Return to the lodge for a multi-course dinner under the stars.' },
      { day: 'Day 3', title: 'Serengeti Sunrise to Ngorongoro crater rim views', desc: 'Embark on an early morning sunrise game drive to spot active predators returning from night hunts. Return to the lodge for hot breakfast, then head to Ngorongoro Conservation Area, checking in to an exquisite rim-top lodge with views overlooking the volcanic crater floor.' },
      { day: 'Day 4', title: 'Caldera Descent, Big Five tracking & Return to Zanzibar', desc: 'Wake up early to descend 600 meters in your 4x4 into the Ngorongoro Crater floor. Spend 5 glorious hours tracking black rhinos, hippos, and vast elephant herds. Head to Lake Manyara airstrip for your afternoon flight, landing back in Zanzibar by 05:30 PM.' }
    ]
  },
  {
    id: 'mikumi-day-safari',
    title: 'Mikumi National Park Day Trip Safari',
    duration: '1 Day (From Sunrise to Sunset)',
    price: '$450',
    type: 'Full-Day Combo',
    bestFor: 'Budget-Conscious, Time-Limited or Short Day Excurions',
    image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
    desc: 'The perfect choice for holiday-makers on a tight budget or schedule. Take a day trip to experience a real wild African wildlife safari without sacrificing your beach resort nights. Savor a comfortable sunrise scenic flight from Zanzibar to Mikumi National Park, hop into custom open 4x4 land cruisers, track elephants, hippos, giraffes, lions, and zebras, and enjoy a high-quality hot lunch buffet before flying back in time for evening cocktails at your resort.',
    highlights: [
      'Early departure Zanzibar flight landing straight in the national park',
      'Incredibly affordable rate for a full-scale wild flight safari experience',
      'Immediate boarding of open 4x4 cruisers with pop-up views',
      'Hot buffet lunch surrounded by scenic wildlife pools',
      'Return beach shuttle in time for evening seaside dinners'
    ],
    bestTimeToVisit: 'Year-round. Mikumi offers incredibly rich resident wildlife near permanent drinking pools throughout dry and wet seasons.',
    whatToBring: [
      'Cool casual clothing with long caps or sun hats',
      'Reliable sunglasses, sun creams, and mosquito sprays',
      'Camera or high-resolution phone with backup batteries',
      'Slight USD/TSH cash for airport souvenir stands'
    ],
    included: [
      'Round-trip flight tickets between Zanzibar (ZNZ) and Mikumi Park runways',
      'All national park conservation entries, environmental permits, and landing fees',
      'Private seating in open 4x4 open-view safari vehicles',
      'Gourmet hot buffet lunch inside a scenic park restaurant with drinks'
    ],
    excluded: [
      'Premium alcoholic imported spirits at the park restaurant',
      'Souvenir store expenses',
      'Local vehicle driver and safari spotter tips'
    ],
    pricingTable: [
      { tier: 'Adult Day Pass Rate (All Inclusive)', rate: '$450 USD' },
      { tier: 'Child Day Pass (Ages 2–11 Pools)', rate: '$360 USD' },
      { tier: 'Private Plane Charter (Groups of 8+)', rate: 'Inquire for price' }
    ],
    faqs: [
      { q: 'Are we guaranteed to see elephants and lions?', a: 'Yes! Mikumi features a flat floodplain landscape that makes animal spotting exceptionally easy, delivering a 98%+ sightings record for elephants, giraffes, zebras, and hippos.' },
      { q: 'Is there a toilet facility on the aircraft and safari?', a: 'The short 30-minute flight does not have a toilet, but the terminal, airstrip reception, park offices, and lunch restaurant feature exceptionally clean setups.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    seoMetadata: {
      title: 'Mikumi Day Trip Safari from Zanzibar | 1-Day Fly-In Tour',
      desc: 'Book a 1-day fly-in safari to Mikumi National Park from Zanzibar. Includes return flights, park entries, hot buffet lunch, and open 4x4 safari cruiser drives.',
      keywords: ['Mikumi Day Trip Safari', 'Zanzibar 1 Day Safari', 'Mikumi Fly-In Tour', 'Zanzibar Safari Excursions', 'Tanzania Day Trips']
    },
    itinerary: [
      { day: 'Day 1', title: 'Complete Sun-Up to Sun-Down Wild African Day Safari', desc: '05:00 AM: Pick up from your resort and shuttle to Zanzibar Airport. 06:15 AM: Board your direct flight, flying over Zanzibar and landing in Mikumi Airstrip at 06:45 AM. 07:00 AM: Mount into your 4x4 Land Cruiser. Head out onto the wild plains tracking herds of elephants, antelopes, and families of lions. 12:30 PM: Take a break to enjoy a hot buffet lunch served inside a park lodge overlooking a rhino/hippo water pool. 02:00 PM: Return to game drives to spot leopards and giraffes. 04:30 PM: Head to the airstrip for your 05:00 PM return flight, landing in Zanzibar by 05:30 PM. 06:00 PM: Return shuttle drops you safely at your hotel lobby.' }
    ]
  }
];

export default function Safaris({ navigate }: SafarisProps) {
  const { trackWhatsAppClick } = useAnalytics();
  const scrollY = useScrollY();
  const [activeSafariItinerary, setActiveSafariItinerary] = useState<string | null>(null);

  const toggleSafariDetail = (id: string) => {
    setActiveSafariItinerary(activeSafariItinerary === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-zinc-50 animate-fade-in">
      
      {/* Hero Header */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1600')",
            transform: `translateY(${scrollY * 0.3}px) scale(1.15)`
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 to-zinc-950/95" />
        <div className="relative z-10 text-center px-4 max-w-3xl space-y-3" style={{ transform: `translateY(-${scrollY * 0.1}px)` }}>
          <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/20">
            🦁 Tanzania Wilderness Expeditions
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Tanzania Wild Safaris
          </h1>
          <p className="text-sm md:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Fly directly from Zanzibar Airport into the world’s most celebrated wildlife parks including the Serengeti, Ngorongoro Crater, and Nyerere (Selous) Game Reserve.
          </p>
        </div>
      </section>

      {/* Intro Editorial section */}
      <section className="py-16 bg-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
            All-Inclusive Door-to-Door Safari Packages
          </h2>
          <p className="text-zinc-500 text-sm md:text-base leading-relaxed font-medium">
            We handle every component of your mainland adventure. All listed packages include return flights, airport meet-and-greets, park entry permits, conservation guides, 4x4 safari cruisers with pop-up photography roofs, unlimited mineral water, hot buffet meals, and prestigious wilderness lodges or luxury glamping camps.
          </p>
        </div>
      </section>

      {/* Interactive Safari Flight Path Map */}
      <section className="py-16 px-4 md:px-8 bg-zinc-50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 bg-[#D4A017]/10 text-[#D4A017] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 font-mono border border-[#D4A017]/25">
              <MapPin size={10} className="animate-bounce" />
              <span>Aviation route planner</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-950 tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
              Zanzibar to Mainland Safari Map
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              View the flight paths from Zanzibar International Airport (ZNZ) directly to bush airstrips in Selous, Serengeti, and Ngorongoro Crater.
            </p>
          </div>
          <InteractiveMap mode="safaris" />
        </div>
      </section>

      {/* Main Safaris Lists */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {safarisData.map(safari => {
            const isExpanded = activeSafariItinerary === safari.id;
            return (
              <div 
                key={safari.id} 
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-zinc-100 transition-all duration-300 flex flex-col"
              >
                
                {/* Main Card Grid Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 p-6 md:p-8">
                  {/* Image Block */}
                  <div className="lg:col-span-5 relative h-64 lg:h-auto rounded-2xl overflow-hidden">
                    <ProgressiveImage src={safari.image} alt={safari.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    <div className="absolute top-4 left-4 bg-[#0B3B8C] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-md z-10">
                      ✈️ {safari.type} Package
                    </div>
                  </div>

                  {/* Core Content Block */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] text-[#D4A017] font-extrabold uppercase tracking-widest bg-[#FDF6E2] px-3 py-1 rounded-lg">
                          Best For: {safari.bestFor}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold bg-zinc-100 px-2.5 py-1 rounded-lg">
                          <Clock size={14} className="text-[#0B3B8C]" /> Duration: {safari.duration}
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-[#0B3B8C] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {safari.title}
                      </h3>

                      <p className="text-zinc-500 text-sm leading-relaxed font-medium line-clamp-3">
                        {safari.desc}
                      </p>

                      {/* Highlight Bullets */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Top Excursion Highlight:</span>
                        <div className="flex gap-2 items-start text-xs text-[#0B3B8C] font-semibold bg-[#0B3B8C]/5 p-3 rounded-xl border border-[#0B3B8C]/10">
                          <Sparkles size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
                          <span>{safari.highlights[0]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking, Drawer trigger and Rates */}
                    <div className="pt-6 border-t border-zinc-100 flex flex-wrap gap-4 items-center justify-between">
                      <div>
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">All-Inclusive Starter Rate</span>
                        <span className="text-3xl font-black text-[#D4A017]">{safari.price} <span className="text-xs font-normal text-zinc-400">/ per guest</span></span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSafariDetail(safari.id)}
                          className="bg-zinc-100 hover:bg-zinc-200 text-[#0B3B8C] font-extrabold text-xs px-5 py-3 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Full Itinerary'}</span>
                          <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('booking_prefilled_category', 'safari');
                            localStorage.setItem('booking_prefilled_tour', safari.title);
                            navigate('booking', `package=${encodeURIComponent(safari.title)}`);
                          }}
                          className="bg-[#0B3B8C] hover:bg-[#0a3280] text-white font-extrabold text-xs px-5 py-3 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Go Book Safari</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Module */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 bg-neutral-50 p-6 md:p-8 animate-fade-in space-y-8">
                    
                    {/* Day-by-day Itinerary Timeline */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-[#0B3B8C] flex items-center gap-2 pb-2 border-b border-zinc-200" style={{ fontFamily: 'Playfair Display, serif' }}>
                        <Compass className="text-[#D4A017]" size={20} /> Day-by-Day Expedition Itinerary
                      </h4>
                      <div className="space-y-6">
                        {safari.itinerary.map((step, idx) => (
                          <div key={idx} className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-2 shadow-sm">
                            <div className="flex items-center gap-2">
                              <span className="bg-[#D4A017] text-[#020C1F] text-[10px] uppercase font-black px-2.5 py-1 rounded-md">
                                {step.day}
                              </span>
                              <h5 className="font-extrabold text-[#0B3B8C] text-sm md:text-base">{step.title}</h5>
                            </div>
                            <p className="text-zinc-600 text-xs md:text-sm leading-relaxed font-medium">
                              {step.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlights Detail */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest">Selected Highlights</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {safari.highlights.map((hlt, i) => (
                          <div key={i} className="flex gap-2 text-xs text-zinc-600 font-medium">
                            <Check size={14} className="text-[#D4A017] mt-0.5 shrink-0" />
                            <span>{hlt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logistics Coverage & Exclusions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-3">
                        <h4 className="font-extrabold text-green-700 text-xs uppercase tracking-widest pb-1 border-b border-green-100 flex items-center gap-1">
                          <Check size={14} /> What is Covered (Included)
                        </h4>
                        <ul className="space-y-2">
                          {safari.included.map((inc, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 font-medium">
                              <Check size={12} className="text-green-500 mt-1 shrink-0" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-3">
                        <h4 className="font-extrabold text-red-700 text-xs uppercase tracking-widest pb-1 border-b border-red-100 flex items-center gap-1">
                          <X size={14} /> What is Excluded
                        </h4>
                        <ul className="space-y-2">
                          {safari.excluded.map((exc, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 font-medium">
                              <X size={12} className="text-red-400 mt-1 shrink-0" />
                              <span>{exc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* What to Bring and Pack List */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <List size={16} className="text-[#D4A017]" /> Pack List: Gear & Clothing
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-500 font-medium">
                        {safari.whatToBring.map((gear, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-zinc-150">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] shrink-0" />
                            <span>{gear}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Pricing Matrix */}
                    <div className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-3">
                      <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">Official Pricing Matrix</h4>
                      <div className="divide-y divide-zinc-100">
                        {safari.pricingTable.map((priceTier, i) => (
                          <div key={i} className="flex justify-between items-center py-2 text-xs font-bold font-medium">
                            <span className="text-zinc-600">{priceTier.tier}</span>
                            <span className="text-zinc-900">{priceTier.rate}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FAQ and Travel Advisories */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <HelpCircle size={16} className="text-[#D4A017]" /> Safari Advisories & FAQs
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {safari.faqs.map((faq, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-4 border border-zinc-150 space-y-1 shadow-sm">
                            <h5 className="font-extrabold text-[#0B3B8C] text-xs leading-tight">Q: {faq.q}</h5>
                            <p className="text-zinc-500 text-[11px] leading-relaxed font-medium">A: {faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Photo Landscapes */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <ImageIcon size={16} className="text-[#D4A017]" /> Safari Scenic Photo Landscapes
                      </h4>
                      <div className="grid grid-cols-3 gap-2 md:gap-4">
                        {safari.gallery.map((url, i) => (
                          <div key={i} className="h-24 md:h-36 rounded-xl overflow-hidden border border-zinc-200">
                            <ProgressiveImage src={url} alt={`Scenic ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Search SEO panel */}
                    <div className="bg-[#0B1E3D] text-[#D4A017] p-4 rounded-xl font-mono text-[11px]">
                      <span className="text-white block font-bold mb-1">🔗 SEO METADATA</span>
                      <p><strong>Title:</strong> {safari.seoMetadata.title}</p>
                      <p className="mt-0.5 text-zinc-300"><strong>Description:</strong> {safari.seoMetadata.desc}</p>
                      <p className="mt-0.5 text-zinc-400"><strong>Keywords:</strong> {safari.seoMetadata.keywords.join(', ')}</p>
                    </div>

                    {/* Conversational booking hooks */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200">
                      <p className="text-xs text-zinc-400 font-bold uppercase">Ready to talk to a travel expert about coordination?</p>
                      <div className="flex gap-2">
                        <a
                          href={`https://wa.me/255629506063?text=${encodeURIComponent(`Hi! I'm interested in booking the "${safari.title}". Could you help coordinate?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackWhatsAppClick('Safari Detail Section', safari.title)}
                          className="bg-[#25D366] hover:bg-[#1ebd5a] text-white font-extrabold text-xs px-5 py-3 rounded-full flex items-center gap-1.5 shadow-sm"
                        >
                          <MessageCircle size={14} fill="white" /> WhatsApp Trip Designer
                        </a>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials and customer reviews section */}
      <section className="py-16 px-4 bg-zinc-100 border-t border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/20 inline-block">
              ⭐️ Verified Safari Testimonials
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B3B8C] tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
              What Our Safari Guests Say
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm max-w-lg mx-auto font-medium">
              Read verified feedback from travelers who flew from Zanzibar to mainland national parks with us.
            </p>
          </div>
          <GuestReviews navigate={navigate} />
        </div>
      </section>

      {/* Safari FAQ advice bottom banner */}
      <section className="bg-[#081830] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Compass className="w-12 h-12 mx-auto text-[#D4A017]" />
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>All-Inclusive Seamless Coordination</h3>
          <p className="text-zinc-300 text-sm max-w-xl mx-auto leading-relaxed">
            Our private safaris are highly personalized. Speak directly with Gerevas Mtaki (Founder & CEO) or our tour coordination coordinators on WhatsApp to design unique multi-day combinations, adding Zanzibar beaches and Kilimanjaro packages.
          </p>
          <button type="button" onClick={() => navigate('trip-builder')} className="bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-wide transition-all shadow-md">
            Customise a Safari Combo
          </button>
        </div>
      </section>
    </div>
  );
}
