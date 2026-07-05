import { useState } from 'react';
import { Page } from '../hooks/useHashRouter';
import { Calendar, Clock, MapPin, Check, ChevronDown, ChevronUp, Compass, ArrowRight, X, List, HelpCircle, Image as ImageIcon, Sparkles } from 'lucide-react';
import { getSiteContent } from '../lib/cmsStore';
import { ProgressiveImage } from '../components/ProgressiveImage';
import ShareButtons from '../components/ShareButtons';
import GuestReviews from '../components/GuestReviews';
import { useScrollY } from '../hooks/useScrollY';

interface PackagesProps {
  navigate: (page: Page, id?: string) => void;
}

export const packagesData = [
  {
    id: '3-day-escape',
    title: '3-Day Zanzibar Romantic Escape',
    duration: '3 Days / 2 Nights',
    price: '$350',
    destinations: 'Stone Town & Prison Island Sanctuary',
    summary: 'Perfect for couples, honeymooners, and weekend travelers who want an intimate, high-comfort luxury taste of Zanzibar’s historical charm, giant tortoise reserves, sandbanks, and rooftop panoramic dining.',
    image: 'https://images.pexels.com/photos/1547843/pexels-photo-1547843.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Couples Choice', 'Honeymoon Special', 'Short Escape'],
    highlights: [
      'Welcome private Airport meet & greet and direct resort transfers',
      'Hand-feeding prehistoric Aldabra Giant Tortoises on Changuu Island',
      'Private wooden chartered boat sailing past Stone Town’s classic waterfront',
      'Authentic candle-lit seafood dinner at a gorgeous rooftop terrace overlooking the sea',
      'Guided historical tour of Omani Fort lanes and Arab doors'
    ],
    bestTimeToVisit: 'Year-round. Outstandingly romantic during warm months (December to March) and cool breeze dry months (June to October).',
    whatToBring: [
      'Smart casual clothing (shoulders & knees covered for Stone Town walks)',
      'Swimwear, sandals, dry beach towels, and highUPF sunblock',
      'Camera or smartphone for beautiful colonial-lane photographs',
      'Small cash USD notes for shopping for local saffron or coffee spice'
    ],
    included: [
      '2 Nights boutique historic riad accommodation in Stone Town',
      'All airport-to-resort and boat-to-shore private land transfers',
      'Professional bilingual certified historian guide fees',
      'Ferry or airport greeting logistics service',
      'Changuu (Prison Island) tortoise reserve admission passes'
    ],
    excluded: [
      'Lunches and restaurant snacking outside program days',
      'International flight tickets or airport arrival tourist taxes',
      'Tips for guide and vehicle shuttle drivers'
    ],
    pricingTable: [
      { tier: 'Couples Promo (Duo rate per guest)', rate: '$350 USD' },
      { tier: 'Solo Traveler Rate', rate: '$490 USD' },
      { tier: 'Extra Night Riad supplement', rate: '+$95 / night' }
    ],
    faqs: [
      { q: 'Can we customize the hotel choice?', a: 'Yes! We coordinate transfers across budget heritage guest-houses, mid-range traditional riads, and extreme luxury colonial sultan palaces.' },
      { q: 'Is this trip package kids friendly?', a: 'Perfectly. Children absolutely adore the giant tortoises and shallow boat sails!' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1547843/pexels-photo-1547843.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    seoMetadata: {
      title: '3-Day Zanzibar Romantic Escape Holiday Package | Local Guide',
      desc: 'Book a luxury 3-Day Zanzibar holiday. Includes private airport transfers, Prison Island giant tortoise tours, historic Stone Town riads, and rooftop dinners.',
      keywords: ['Zanzibar 3 Day Package', 'Zanzibar Honeymoon Tour', 'Prison Island Package', 'Stone Town Holiday', 'Zanzibar Weekend Escape']
    },
    itinerary: [
      { day: 1, title: 'Welcome Greeting & Stone Town Sunset Walks', desc: 'Step out to meet your private driver at Zanzibar Airport ZNZ. Transfer to your deluxe historic riad in Stone Town. Sip hot spiced hibiscus tea and embark on an evening sunset walk to Forodhani Gardens to taste local skewers.' },
      { day: 2, title: 'Prison Island Tortoises & White Sandbank Picnic', desc: 'Board a comfortable private wooden boat to Changuu (Prison) Island. Feed leathery necked 190-year-old Aldabra tortoises. Snorkel warm shallow reefs, then land on a pure shifting sandbar for fresh pineapple and cold drinks.' },
      { day: 3, title: 'Historic Stone Town Walking Tour & Departure', desc: 'Follow our historian guide past the copper-studded Omani and Arab doors, House of Wonders, and Sultan Palace. Check out of the riad and transfer comfortably back to the airport.' }
    ]
  },
  {
    id: '5-day-beach-adventure',
    title: '5-Day Ultimate Beach & Tour Adventure',
    duration: '5 Days / 4 Nights',
    price: '$650',
    destinations: 'Stone Town, Safari Blue, Spice Farms & Nungwi Beach',
    summary: 'Our legendary best-selling holiday package. Combining historic architecture, world-class dhow sailing, pristine dolphin-spotting reef snorkeling, fragrant organic spice orchards, and premium beachfront relaxation on the white sun sands of northern Nungwi.',
    image: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Best Seller', 'Adventure Combo', 'Beaches Master'],
    highlights: [
      'Premium classic dhow cruising with marine reef snorkeling across Menai Bay',
      'Feasting on fresh rock-fire lobsters, marine crabs, and reef snaps on Kwale',
      'Touching, peeling, and tasting organic cardamom, vanilla, and cinnamon cloves',
      'Quiet luxury resort beachfront stays in northern Nungwi beach areas',
      'Snorkeling Muyuni Bay with views of the famous Mnemba Island Atoll'
    ],
    bestTimeToVisit: 'July to March. Dry weather yields excellent crystal-clear visibility for the marine Atoll reef snorleks.',
    whatToBring: [
      'Two changes of swimwear and reliable UV rashguard swim-tops',
      'Waterproof cameras (GoPro) and floating phone envelope straps',
      'Casual light clothes for spice farm trails (close-toe shoes smart)',
      'High-SPF reef-safe sunscreen and cooling face mists'
    ],
    included: [
      '4 Nights boutique hotels (2 Nights Stone Town + 2 Nights Nungwi Beachfront)',
      'All inland and airport private transportations (air-conditioned minivans)',
      'All tour admissions, marine conservation vouchers, and boat hire costs',
      'Full Safari Blue gourmet lobster and seafood BBQ buffet lunch with beers',
      'Expert certified island marine guides and captains'
    ],
    excluded: [
      'Personal dining meals at Nungwi (exclusive of hotel breakfast)',
      'Gratuities for marine boat crew, local farmers, and transfer drivers',
      'Travel health insurance programs'
    ],
    pricingTable: [
      { tier: 'Standard Rate (Double Share, Per Guest)', rate: '$650 USD' },
      { tier: 'Triple Share Promo rate (3 guests pool)', rate: '$590 / person' },
      { tier: 'Solo Traveler Rate', rate: '$820 USD' },
      { tier: 'Single Room occupancy supplement', rate: '+$140 total' }
    ],
    faqs: [
      { q: 'Is Safari Blue suitable for vegetarians?', a: 'Definitely. We serve delicious fire-roasted veggie skewers, coconut rice, and fresh chips along with local fruits. Inform us upon booking!' },
      { q: 'How far is the road transit between Stone Town and Nungwi?', a: 'A gentle, scenic 1-hour drive through lush rural coconut orchards in our air-conditioned shuttle.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    seoMetadata: {
      title: '5-Day Ultimate Zanzibar Beach & Tour Adventure Package',
      desc: 'Embark on our famous 5-Day Zanzibar package. Enjoy Safari Blue ocean sailing, organic spice farm trekking, historic Stone town, and premium beach resorts of Nungwi.',
      keywords: ['5 Day Zanzibar Package', 'Zanzibar Beach Tour Combo', 'Safari Blue Holiday', 'Zanzibar Spice Farm Packages', 'Nungwi Beach Holidays']
    },
    itinerary: [
      { day: 1, title: 'Arrival, Historic Check-In & Forodhani Bazaars', desc: 'Secure private pickup from ZNZ Airport. Check into your Stone Town riad. Savor a local spice coffee and walk the historic lanes of the waterfront.' },
      { day: 2, title: 'Safari Blue Sailing Cruise & Lobster Roast on Kwale', desc: 'Head to Fumba. Set sail on a traditional wooden dhow into Menai Bay. Snorkel vibrant coral reefs, meet wild dolphins, and feast on unlimited fire-grilled rock lobsters and prawns on Kwale beach.' },
      { day: 3, title: 'Fragrant Spice Farms Walk & Nungwi Coast Transit', desc: 'Check out of Stone Town. Explore spice plantations, smelling wild vanilla, cardomom, and cinnamon hooks. Watch tree climbers harvest fresh young coconuts. Direct transit to your beachfront Nungwi resort.' },
      { day: 4, title: 'Mnemba Atoll Snorkeling & dolphin spotting skiff', desc: 'Board a speedboat towards the pristine marine walls of Mnemba Atoll. Swim with tropical stars, green turtles, and giant starfish, before relaxing on sandy beaches.' },
      { day: 5, title: 'Seaside Sunrise Breakfast & Airport Return Transfer', desc: 'Enjoy a beachside morning buffet as waves roll in. Take a final swim, check out, and board our private shuttle for a comfortable ride back to the terminal.' }
    ]
  },
  {
    id: '7-day-zanzibar-combo',
    title: '7-Day Heritage, Nature & Ocean Wildlife Combo',
    duration: '7 Days / 6 Nights',
    price: '$1,150',
    destinations: 'Stone Town Sultanates, Jozani Forest Red Monkeys, Paje Beach & Safari Blue',
    summary: 'A luxury, deep week-long immersion that unifies every ecological, historical, and marine aspect of Zanzibar. Experience majestic Omani Sultanate history, walk ancient mahogany forests alongside rare colobus monkeys, swim inside black mangrove lagoons, learn windsurfing on pristine Paje beaches, and sail under majestic dhow canvases.',
    image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['Full Week Special', 'Ultimate Safari Combo', 'Slow Travel Luxe'],
    highlights: [
      'Comprehensive Omani, Persian and British historical city tour of Stone Town',
      'Walking past towering mahogany trees to spot endangered Red Colobus Monkeys',
      'Trekking black mangrove marine eco-filter suspended loop paths',
      'Direct coastal resort stays on Paje’s high-vibrant turquoise beaches',
      'A special reservation dinner at the internationally acclaimed "The Rock" restaurant'
    ],
    bestTimeToVisit: 'July to March for superb dry weather. Essential for comfortable forest strolls and sandbar landings.',
    whatToBring: [
      'Breathable walk pants and lightweight long-sleeve shirts (great for Jozani mosquito protection)',
      'Close-toe trainers, lightweight beach footwear, and ocean booties',
      'Waterproof cameras, smartphones, high-UPF sunblock creams, and insect repellents',
      'Cash or VISA card for specialized dinings at "The Rock" restaurant'
    ],
    included: [
      '6 Nights premium hotel stays (2 Nights Stone Town, 2 Nights Paje Coast, 2 Nights Nungwi Beachfront)',
      'All land transits throughout the week in private air-conditioned sprinters',
      'Full-day Safari Blue marine cruise with seafood grill and unlimited drinks',
      'Jozani National Park conservation pass, ranger and guide fees',
      'A dedicated private island concierge available 24/7 on WhatsApp'
    ],
    excluded: [
      'Dinings and beverages at "The Rock" restaurant (pre-arranged table reservation included)',
      'Tips for national park rangers, boat captains, and private drivers',
      'Airport luggage helper fees'
    ],
    pricingTable: [
      { tier: 'Shared Double Room Luxury rate (Per Guest)', rate: '$1,150 USD' },
      { tier: 'Triple Share Group Discount (3+ Guests)', rate: '$1,020 / person' },
      { tier: 'Solo Luxe Single Supplement rate', rate: '$1,440 USD' },
      { tier: 'Children rate (Ages 3–11)', rate: '$780 USD' }
    ],
    faqs: [
      { q: 'Is dinner at The Rock Restaurant included in the package cost?', a: 'We guarantee and arrange your table reservation (which typically booked 3 months in advance) and provide private return transfers. The actual food and drinks ordered are paid directly by you on-site.' },
      { q: 'Can we kitesurf at Paje?', a: 'Yes! Paje is a premium global kitesurfing hub. We can coordinate board hire and certified training lessons as optional checkout upgrades.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    seoMetadata: {
      title: '7-Day Zanzibar Heritage, Nature & Ocean Holiday Package',
      desc: 'Experience our ultimate 7-Day Zanzibar package. Stone Town walking tours, Jozani forest monkeys safari, Paje beach stays, Safari Blue cruises, and dining at The Rock.',
      keywords: ['7 Day Zanzibar Package', 'Zanzibar Nature Tour Combo', 'Jozani Red Monkey Package', 'Paje Beach Holidays', 'The Rock Restaurant Zanzibar']
    },
    itinerary: [
      { day: 1, title: 'Zanzibar Airport Welcome & Rooftop Sunset Tea', desc: 'Secure pickup off ZNZ terminal. Check in to your premium historic Stone Town riad hotel. Enjoy spiced tea on a cozy rooftop veranda as the sea breeze rolls in.' },
      { day: 2, title: 'Slave Chambers Memorial & Spice Plantation Trails', desc: 'Explore the Anglican Cathedral slave cells, old Fort, and bustling bazaars. Drive to organic spice farms to taste vanilla vines and cardamom cloves before enjoying a local harvest lunch.' },
      { day: 3, title: 'Red Colobus Monkeys Hike & Coast Paje Transit', desc: 'Drive to Jozani National Park. Spot acrobatic, endangered Red Colobus primates and Sykes monkeys. Walk elevated boardwalks over black mangrove swamps. Direct transit to your Paje beach hotel.' },
      { day: 4, title: 'Sun beach Paje, Lagoon swims or kitesurf sweeps', desc: 'Savor a lazy, tropical morning. Enjoy optional kitesurfing, swim in clear reef pools, or enjoy fresh mocktails under the coconut palms of Paje beach.' },
      { day: 5, title: 'Safari Blue Marine dhow Cruise & Kwale Lobster BBQ', desc: 'Full-day sailing adventure! Board your wooden dhow at Fumba, snorkel Menai Bay reef gardens, relax on sandbars, and enjoy a fresh lobster seafood BBQ on Kwale Island.' },
      { day: 6, title: 'The Rock Restaurant Dining & Kendwa Sunset Coast', desc: 'Unwind in the morning. At midnight, travel to the world-famous Rock Restaurant standing isolated on a coral reef. Enjoy premium seafood dining, then drive north to Kendwa beach for evening sunset views.' },
      { day: 7, title: 'Tropical beach breakfast & Return checkout transits', desc: 'Savor a warm coastal breakfast buffet. Take a final dip,pack bags, and board our private shuttle back to the Airport with unforgettable memories.' }
    ]
  }
];

export default function Packages({ navigate }: PackagesProps) {
  const scrollY = useScrollY();
  const [openItinerary, setOpenItinerary] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useState(() => {
    const dest = localStorage.getItem('ztr_search_destination') || '';
    const type = localStorage.getItem('ztr_search_type') || '';
    const arrival = localStorage.getItem('ztr_search_arrival') || '';
    const departure = localStorage.getItem('ztr_search_departure') || '';
    const adults = localStorage.getItem('ztr_search_adults') || '';
    const children = localStorage.getItem('ztr_search_children') || '';
    const budget = localStorage.getItem('ztr_search_budget') || '';
    
    if (!dest && !type && !arrival && !departure && !adults && !children && !budget) {
      return null;
    }
    return { dest, type, arrival, departure, adults: Number(adults || '2'), children: Number(children || '0'), budget };
  });

  const content = getSiteContent();
  const dynamicPackages = (content.tours || [])
    .filter(t => t.category === 'package')
    .map(t => ({
      id: t.id,
      title: t.title,
      duration: t.duration || 'Flexible Duration',
      price: t.price.startsWith('$') ? t.price : `$${t.price}`,
      destinations: t.scenicValue || 'Zanzibar Scenic Sights',
      summary: t.desc,
      image: t.img,
      tags: ['CMS Dynamic', 'Customisable'],
      highlights: [
        t.desc,
        'Flexible custom hotel upgrades',
        'Zanzibar registered local driver'
      ],
      bestTimeToVisit: 'Year-round dry periods.',
      whatToBring: ['Lightweight clothing', 'Camera', 'Beach towel'],
      included: ['Private air-conditioned shuttle transfers', 'All tour admissions', 'Professional native guide'],
      excluded: ['Tips', 'Personal shopping'],
      pricingTable: [{ tier: 'Standard Rate / Person', rate: t.price }],
      faqs: [{ q: 'Is this dynamic tour customisable?', a: 'Yes! Contact us on WhatsApp to adjust destinations, nights, or meals.' }],
      gallery: [t.img],
      seoMetadata: {
        title: `${t.title} Holiday Package | Zanzibar Trip & Relax`,
        desc: t.desc,
        keywords: ['Zanzibar dynamic packages', 'Zanzibar custom travel']
      },
      itinerary: (t.itinerary && t.itinerary.length > 0)
        ? t.itinerary.map((it, idx) => ({ day: idx + 1, title: `Day ${idx + 1} Excursion`, desc: it }))
        : [{ day: 1, title: 'Uniquely Crafted Daily Program', desc: t.desc }],
    }));

  const combinedPackages = [...packagesData, ...dynamicPackages];

  const toggleItinerary = (id: string) => {
    setOpenItinerary(openItinerary === id ? null : id);
  };

  const getFilteredPackages = () => {
    if (!searchParams) return combinedPackages;

    const scored = combinedPackages.map(pkg => {
      let score = 0;

      // 1. Destination Match
      if (searchParams.dest) {
        if (searchParams.dest === 'zanzibar') {
          if (pkg.id === '3-day-escape' || pkg.id === '5-day-beach-adventure' || pkg.tags.includes('CMS Dynamic')) {
            score += 3;
          }
        } else {
          // Mainland / Safari locations
          if (pkg.id === '7-day-zanzibar-combo') {
            score += 3;
          } else {
            score -= 1; // minor penalty for non-mainland
          }
        }
      }

      // 2. Experience Type Match
      if (searchParams.type) {
        const type = searchParams.type.toLowerCase();
        if (pkg.id === '3-day-escape') {
          const matches = ['romantic', 'honeymoon', 'anniversary', 'solo', 'cultural', 'tour'];
          if (matches.includes(type)) score += 3;
        } else if (pkg.id === '5-day-beach-adventure') {
          const matches = ['adventure', 'beach', 'diving', 'family', 'group', 'package'];
          if (matches.includes(type)) score += 3;
        } else if (pkg.id === '7-day-zanzibar-combo') {
          const matches = ['safari', 'wildlife', 'combo', 'custom', 'family', 'group'];
          if (matches.includes(type)) score += 3;
        } else if (pkg.tags.includes('CMS Dynamic')) {
          score += 2;
        }
      }

      // 3. Nights Match
      if (searchParams.arrival && searchParams.departure) {
        const ms = new Date(searchParams.departure).getTime() - new Date(searchParams.arrival).getTime();
        const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
        if (nights > 0) {
          if (nights <= 3 && pkg.id === '3-day-escape') score += 4;
          else if (nights > 3 && nights <= 5 && pkg.id === '5-day-beach-adventure') score += 4;
          else if (nights > 5 && pkg.id === '7-day-zanzibar-combo') score += 4;
          else if (pkg.tags.includes('CMS Dynamic')) score += 2;
        }
      }

      // 4. Budget Match
      if (searchParams.budget) {
        const b = searchParams.budget;
        if (b === 'budget' && (pkg.id === '3-day-escape' || pkg.id === '5-day-beach-adventure')) score += 2;
        else if (b === 'mid' && (pkg.id === '5-day-beach-adventure' || pkg.id === '7-day-zanzibar-combo')) score += 2;
        else if ((b === 'premium' || b === 'luxury') && pkg.id === '7-day-zanzibar-combo') score += 2;
      }

      return { ...pkg, score };
    });

    const hasActiveFilter = searchParams.dest || searchParams.type || (searchParams.arrival && searchParams.departure) || searchParams.budget;
    
    if (hasActiveFilter) {
      return scored.sort((a, b) => b.score - a.score);
    }
    return combinedPackages;
  };

  const filteredData = getFilteredPackages();

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      
      {/* Hero Header */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1600')",
            transform: `translateY(${scrollY * 0.3}px) scale(1.15)`
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 to-zinc-950/95" />
        <div className="relative z-10 text-center px-4 max-w-3xl space-y-3" style={{ transform: `translateY(-${scrollY * 0.1}px)` }}>
          <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/20">
            ☀️ Handcrafted Holiday Escapes
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Zanzibar Holiday Packages
          </h1>
          <p className="text-sm md:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            All-inclusive, fully private multi-day itineraries crafted to ensure a stress-free tropical dream holiday in historic Zanzibar.
          </p>
        </div>
      </section>

      {/* Search Filter Alert Banner */}
      {searchParams && (
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Compass className="text-[#D4A017] shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-bold text-[#0B3B8C]">Showing tailored matches for your search</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Filters: {searchParams.dest && <>Location: <span className="capitalize font-bold text-[#0B3B8C] mr-2">{searchParams.dest}</span></>}
                  {searchParams.type && <>Experience: <span className="capitalize font-bold text-[#0B3B8C] mr-2">{searchParams.type}</span></>}
                  {searchParams.budget && <>Budget Index: <span className="uppercase font-bold text-[#0B3B8C] mr-2">{searchParams.budget}</span></>}
                  {searchParams.arrival && <>Date: <span className="font-bold text-[#0B3B8C]">{searchParams.arrival}</span></>}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('ztr_search_destination');
                localStorage.removeItem('ztr_search_type');
                localStorage.removeItem('ztr_search_arrival');
                localStorage.removeItem('ztr_search_departure');
                localStorage.removeItem('ztr_search_adults');
                localStorage.removeItem('ztr_search_children');
                localStorage.removeItem('ztr_search_budget');
                localStorage.removeItem('ztr_search_hotel');
                setSearchParams(null);
              }}
              className="text-xs font-bold text-[#0B3B8C] hover:text-[#D4A017] flex items-center gap-1 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
            >
              <X size={14} /> Clear Search & Show All
            </button>
          </div>
        </div>
      )}

      {/* Package List */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-12">
          {filteredData.map(pkg => {
            const isItineraryOpen = openItinerary === pkg.id;
            return (
              <div key={pkg.id} className="bg-white rounded-3xl overflow-hidden shadow-md border border-gray-150 p-6 md:p-8 flex flex-col transition-all hover:shadow-xl space-y-6">
                
                {/* Visual Card Grid Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                  {/* Photo Gallery container */}
                  <div className="lg:col-span-5 relative h-64 lg:h-auto rounded-2xl overflow-hidden bg-zinc-200">
                    <ProgressiveImage src={pkg.image} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
                      {pkg.tags.map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 bg-[#0B3B8C] text-white rounded-xl shadow-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Body textual details */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-[#D4A017] font-extrabold uppercase tracking-wider bg-[#FDF6E2] px-3 py-1 rounded-xl">
                          <Clock size={14} className="text-[#0B3B8C]" /> {pkg.duration}
                        </span>
                        <p className="text-3xl font-black text-[#0B3B8C] leading-none">{pkg.price}</p>
                      </div>

                      <h2 className="text-2xl font-black text-[#0B3B8C] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {pkg.title}
                      </h2>

                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide flex items-center gap-1 pb-1 border-b border-zinc-100">
                        <MapPin size={13} className="text-[#D4A017]" /> Core Sights: {pkg.destinations}
                      </p>

                      <p className="text-gray-650 text-sm leading-relaxed font-medium">
                        {pkg.summary}
                      </p>

                      {/* Inclusive items checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {pkg.included.slice(0, 4).map((inc, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Check size={14} className="text-green-500 mr-0.5 shrink-0" />
                            <span>{inc}</span>
                          </div>
                        ))}
                      </div>

                    </div>

                    {/* Collapsible panel button triggers */}
                    <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleItinerary(pkg.id)}
                        className="bg-neutral-50 hover:bg-neutral-100 text-[#0B3B8C] text-xs font-extrabold px-5 py-3 rounded-full flex items-center gap-1 transition-colors cursor-pointer border border-[#0B3B8C]/15"
                      >
                        <span>{isItineraryOpen ? 'Hide Full Details' : 'View Full Itinerary'}</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isItineraryOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <div className="flex items-center gap-3">
                        <ShareButtons 
                          title={pkg.title} 
                          description={pkg.summary} 
                          packageId={pkg.id} 
                        />
                        
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('booking_prefilled_category', 'package');
                            localStorage.setItem('booking_prefilled_tour', pkg.title);
                            navigate('booking', `package=${encodeURIComponent(pkg.title)}`);
                          }}
                          className="bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-extrabold text-xs px-6 py-3.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wide"
                        >
                          <span>Confirm & Book</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Expanded Detailed Module */}
                {isItineraryOpen && (
                  <div className="pt-6 border-t border-zinc-150 animate-fade-in space-y-8 bg-neutral-50/50 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8">
                    
                    {/* Day-by-day Itinerary Timeline */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-[#0B3B8C] flex items-center gap-2 pb-2 border-b border-zinc-200" style={{ fontFamily: 'Playfair Display, serif' }}>
                        <Compass className="text-[#D4A017]" size={20} /> Day-by-Day Holiday Itinerary Program
                      </h4>
                      <div className="space-y-6">
                        {pkg.itinerary.map((step, idx) => (
                          <div key={idx} className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-2 shadow-sm relative">
                            <div className="flex items-center gap-2">
                              <span className="bg-[#D4A017] text-[#020C1F] text-[10px] uppercase font-black px-2.5 py-1 rounded-md">
                                Day {step.day}
                              </span>
                              <h5 className="font-extrabold text-[#0B3B8C] text-sm md:text-base">{step.title}</h5>
                            </div>
                            <p className="text-zinc-650 text-xs md:text-sm leading-relaxed font-medium">
                              {step.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Highlights Detail */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={16} className="text-[#D4A017]" /> Holiday Highlights
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {pkg.highlights.map((hlt, i) => (
                          <div key={i} className="flex gap-2 text-xs text-zinc-600 font-medium bg-white p-3.5 rounded-xl border border-zinc-100">
                            <Check size={14} className="text-[#D4A017] mt-0.5 shrink-0" />
                            <span>{hlt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Logistics Coverage & Exclusions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-3 shadow-sm">
                        <h4 className="font-extrabold text-green-700 text-xs uppercase tracking-widest pb-1 border-b border-green-100 flex items-center gap-1">
                          <Check size={14} /> Full Inclusions (What is Covered)
                        </h4>
                        <ul className="space-y-2.5">
                          {pkg.included.map((inc, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-650 font-medium">
                              <Check size={12} className="text-green-500 mt-1 shrink-0" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-3 shadow-sm">
                        <h4 className="font-extrabold text-red-700 text-xs uppercase tracking-widest pb-1 border-b border-red-100 flex items-center gap-1">
                          <X size={14} /> Exclusions (What is Out-Of-Pocket)
                        </h4>
                        <ul className="space-y-2.5">
                          {pkg.excluded.map((exc, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-650 font-medium">
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
                        <List size={16} className="text-[#D4A017]" /> Essential Gear & Pack Checklist
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-500 font-medium">
                        {pkg.whatToBring.map((gear, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-zinc-150 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] shrink-0" />
                            <span>{gear}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Pricing Matrix */}
                    <div className="bg-white rounded-2xl p-5 border border-zinc-150 space-y-3 shadow-sm">
                      <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">Holiday Package Pricing Matrix</h4>
                      <div className="divide-y divide-zinc-100">
                        {pkg.pricingTable.map((priceTier, i) => (
                          <div key={i} className="flex justify-between items-center py-2.5 text-xs font-semibold font-medium text-zinc-700">
                            <span>{priceTier.tier}</span>
                            <span className="text-[#0B3B8C] font-extrabold">{priceTier.rate}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FAQ and Travel Advisories */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <HelpCircle size={16} className="text-[#D4A017]" /> Package General Advisories & FAQs
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pkg.faqs.map((faq, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-4 border border-zinc-150 space-y-1.5 shadow-sm">
                            <h5 className="font-extrabold text-[#0B3B8C] text-xs leading-tight">Q: {faq.q}</h5>
                            <p className="text-zinc-500 text-[11px] leading-relaxed font-medium">A: {faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Photo Landscapes */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <ImageIcon size={16} className="text-[#D4A017]" /> Zanzibar Holiday Sceneries
                      </h4>
                      <div className="grid grid-cols-3 gap-3 md:gap-4">
                        {pkg.gallery.map((url, i) => (
                          <div key={i} className="h-24 md:h-36 rounded-xl overflow-hidden border border-zinc-200">
                            <ProgressiveImage src={url} alt={`Landscape ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Search SEO panel */}
                    <div className="bg-[#0B1E3D] text-[#D4A017] p-4 rounded-xl font-mono text-[10px]">
                      <span className="text-white block font-bold mb-1">🔗 SEO GOOGLE SEARCH METADATA</span>
                      <p><strong>Title:</strong> {pkg.seoMetadata.title}</p>
                      <p className="mt-0.5 text-zinc-300"><strong>Description:</strong> {pkg.seoMetadata.desc}</p>
                      <p className="mt-0.5 text-zinc-400"><strong>Keywords:</strong> {pkg.seoMetadata.keywords.join(', ')}</p>
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
              ⭐️ Verified Package Testimonials
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B3B8C] tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
              What Our Holiday Guests Say
            </h2>
            <p className="text-zinc-500 text-xs md:text-sm max-w-lg mx-auto font-medium">
              Read verified feedback from travelers who booked our multi-day, family, and honeymoon holiday packages.
            </p>
          </div>
          <GuestReviews navigate={navigate} />
        </div>
      </section>

      {/* Custom trip alert bottom banner */}
      <section className="py-16 bg-[#0B3B8C] text-white px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-xl text-[#D4A017]" style={{ fontFamily: 'Playfair Display, serif' }}>Want to Mix & Match Holiday Experiences?</h3>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              We can customize any package listed above to match your exact flight timings, hotel preferences, or budget guidelines. Add a Tanzanian safari or Kilimanjaro climb to your beach package!
            </p>
          </div>
          <button type="button" onClick={() => navigate('trip-builder')} className="bg-[#D4A017] hover:bg-[#c49010] text-white font-extrabold text-xs px-6 py-3.5 rounded-full transition-colors shrink-0 uppercase tracking-wide cursor-pointer shadow-md">
            Build My Trip Customizer
          </button>
        </div>
      </section>
    </div>
  );
}
