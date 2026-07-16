import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Page } from '../hooks/useHashRouter';
import { 
  Compass, Calendar, Check, ArrowRight, MessageCircle, Star, Clock, List, 
  HelpCircle, X, Shield, ChevronDown, ChevronUp, Sparkles, Image as ImageIcon, 
  MapPin, Search, Filter, Info, Plane, Award, Eye, Trash, RefreshCw, ThumbsUp, UserCheck
} from 'lucide-react';
import { ProgressiveImage } from '../components/ProgressiveImage';
import GuestReviews from '../components/GuestReviews';
import { useScrollY } from '../hooks/useScrollY';
import { useAnalytics } from '../context/AnalyticsContext';
import Breadcrumbs from '../components/Breadcrumbs';
import InteractiveMap from '../components/InteractiveMap';
import { getSiteContent } from '../lib/cmsStore';
import { motion, AnimatePresence } from 'motion/react';

interface SafarisProps {
  navigate: (page: Page, id?: string) => void;
}

// 1. Static Default Safaris (Preserved and Enhanced)
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
      'Close encounters with elephants, lions, leopards, and rare African wild dogs'
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
      { day: 'Day 1', title: 'Flight-in Beach to Bush & Rufiji River Boat Cruise', desc: 'Board your morning flight from Zanzibar to Selous at 07:30 AM. Land in the African bush by 08:15 AM. Meet your driver and begin wildlife spotting immediately. Check into your luxury river camp for hot lunch. At 03:30 PM, board a specialized boat on Rufiji River to view hunting fish eagles, crocodiles, and bathing hippos during sunset.' },
      { day: 'Day 2', title: 'Open-top Savannah Game Drive & Return to Beach Island', desc: 'Initialize with early morning tea and coffee, then head out at 06:30 AM for tracking active predators like lions and leopards. Spot giraffes, zebras, and impalas. Savor a picnic breakfast inside the park under a majestic Acacia. Transfer back to the airstrip for your 04:15 PM flight, landing back in Zanzibar by 05:00 PM.' }
    ],
    circuit: 'Southern',
    style: 'Luxury Glamping',
    interests: ['The Big Five', 'River Boat Cruise', 'Photography'],
    parks: ['Nyerere National Park', 'Selous Game Reserve'],
    safariVehicle: '4x4 Open-sided Land Cruiser',
    wildlife: 'Lions, Wild Hunting Dogs, Hippos, Giraffes, Elephants',
    gameDrives: 'Morning Boat Cruise + Deep Savannah Drives'
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
    ],
    circuit: 'Northern',
    style: 'Premium Lodges',
    interests: ['The Big Five', 'Great Migration', 'Photography'],
    parks: ['Serengeti National Park', 'Ngorongoro Crater'],
    safariVehicle: 'Luxury 4x4 Land Cruiser with pop-up roof',
    wildlife: 'The Big Five: Lion, Leopard, Elephant, Buffalo, Black Rhino',
    gameDrives: 'Unlimited Day Drives + Caldera Floor Descent'
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
    ],
    circuit: 'Southern',
    style: 'Budget Day Trips',
    interests: ['The Big Five', 'Photography'],
    parks: ['Mikumi National Park'],
    safariVehicle: 'Custom open-air 4x4 Safari Vehicle',
    wildlife: 'Elephants, Giraffes, Lions, Zebras, Hippos, Wildebeests',
    gameDrives: 'Full Day Intensive Game Drive'
  }
];

export default function Safaris({ navigate }: SafarisProps) {
  const { trackWhatsAppClick } = useAnalytics();
  const scrollY = useScrollY();

  // Active overlays and modals
  const [selectedSafari, setSelectedSafari] = useState<any | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'itinerary' | 'lodging' | 'pricing' | 'faq' | 'gallery'>('overview');
  const [showCustomPlanner, setShowCustomPlanner] = useState(false);

  // Comparison State
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Filter finder state
  const [filterCircuit, setFilterCircuit] = useState<string>('Any');
  const [filterDuration, setFilterDuration] = useState<string>('Any');
  const [filterStyle, setFilterStyle] = useState<string>('Any');
  const [filterInterest, setFilterInterest] = useState<string>('Any');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Big Five visual checklist state (stored in session to stay interactive)
  const [checkedBigFive, setCheckedBigFive] = useState<Record<string, boolean>>({
    Lion: true, Leopard: false, Elephant: true, Buffalo: true, Rhino: false
  });

  // Step-by-step Custom Safari Builder state
  const [plannerStep, setPlannerStep] = useState(1);
  const [plannerData, setPlannerData] = useState({
    circuit: 'Custom Combination',
    style: 'Premium Classic',
    wildlife: [] as string[],
    groupType: 'Family Safari',
    travelMonth: 'September',
    duration: '4-6 Days',
    guestsCount: 2,
    leadName: '',
    contactNum: ''
  });

  // Load and merge dynamic Supabase / Local CMS Safaris with our static defaults
  const mergedSafaris = useMemo(() => {
    const cmsContent = getSiteContent();
    const cmsTours = cmsContent?.tours || [];
    
    // Filter out active safaris from CMS
    const cmsSafaris = cmsTours.filter(t => t.category === 'safari' && t.visible !== false);
    
    // Format CMS safaris to match Unified structure
    const formattedCms = cmsSafaris.map((t: any) => {
      // Determine circuit
      let circuit: 'Northern' | 'Southern' = 'Southern';
      const loc = (t.location || '').toLowerCase();
      const titleLower = t.title.toLowerCase();
      if (loc.includes('serengeti') || loc.includes('ngorongoro') || loc.includes('manyara') || loc.includes('northern') || titleLower.includes('serengeti') || titleLower.includes('crater')) {
        circuit = 'Northern';
      }

      // Determine style
      let style: 'Luxury Glamping' | 'Premium Lodges' | 'Budget Day Trips' = 'Premium Lodges';
      const durationLower = (t.duration || '').toLowerCase();
      if (durationLower.includes('1 day') || titleLower.includes('day trip')) {
        style = 'Budget Day Trips';
      } else if (titleLower.includes('glamping') || titleLower.includes('luxury') || (t.shortDesc || '').toLowerCase().includes('glamp')) {
        style = 'Luxury Glamping';
      }

      // Process itinerary
      const itineraryDays = t.itineraryDays?.map(day => ({
        day: `Day ${day.dayNumber}`,
        title: day.title,
        desc: day.description
      })) || t.itinerary?.map((text, idx) => ({
        day: `Day ${idx + 1}`,
        title: 'Daily Excursion',
        desc: text
      })) || [];

      // Process pricing
      const rateStr = t.price.startsWith('$') ? t.price : `$${t.price}`;
      const pricingTable = t.pricingTable || [
        { tier: 'Adult Base Rate', rate: rateStr },
        { tier: 'Single Supplement Fee', rate: t.singleSupplement ? `$${t.singleSupplement} USD` : 'Inquire' }
      ];

      return {
        id: t.id,
        title: t.title,
        duration: t.duration || 'Custom Duration',
        price: rateStr,
        type: t.packageCategory || 'Wild Safari',
        bestFor: t.tags?.join(', ') || 'Wildlife Tracking',
        image: t.img,
        desc: t.longDescription || t.desc || t.shortDesc || '',
        highlights: t.highlights && t.highlights.length > 0 ? t.highlights : ['Expert Local Spotter guide', 'All Meals included', 'Return Coastal bush flights'],
        bestTimeToVisit: t.bestTimeToVisit || 'June to October for dry wildlife gatherings.',
        whatToBring: t.whatToBring && t.whatToBring.length > 0 ? t.whatToBring : ['Light neutral clothing', 'Insect repellent', 'Long-zoom camera', 'Binoculars'],
        included: t.included && t.included.length > 0 ? t.included : ['Charter return flights', 'Park entries and concessions', 'Private 4x4 Jeep with pop-up roof', 'Full Board meals'],
        excluded: t.excluded && t.excluded.length > 0 ? t.excluded : ['International visa fees', 'Tips for drivers ($15/day)', 'Premium bar spirits'],
        pricingTable: pricingTable,
        faqs: t.faqs && t.faqs.length > 0 ? t.faqs : [
          { q: 'Are flights included in the rates?', a: 'Yes, all our packages flying from Zanzibar include return airfare, airport transfers, and baggage handling.' }
        ],
        gallery: t.gallery && t.gallery.length > 0 ? t.gallery : [t.img],
        seoMetadata: {
          title: t.seoTitle || t.title,
          desc: t.seoDescription || t.shortDesc || t.title,
          keywords: t.metaKeywords || ['Tanzania Safari', 'Zanzibar Fly-In Safari']
        },
        itinerary: itineraryDays,
        circuit: circuit,
        style: style,
        interests: t.tags || ['The Big Five', 'Photography'],
        parks: t.location ? [t.location] : ['National Park Sanctuary'],
        safariVehicle: t.safariVehicle || 'Customized 4x4 Safari Cruiser',
        wildlife: t.wildlife || 'Vast East African wildlife species',
        gameDrives: t.gameDrives || 'Daily morning & afternoon drives'
      };
    });

    // Merge static and dynamic, filtering out duplicates by title
    const seenTitles = new Set<string>();
    const finalMerged: any[] = [];

    // Prioritize dynamic CMS safaris
    formattedCms.forEach(s => {
      const cleanTitle = s.title.trim().toLowerCase();
      if (!seenTitles.has(cleanTitle)) {
        seenTitles.add(cleanTitle);
        finalMerged.push(s);
      }
    });

    // Bring in default safaris if not already covered
    safarisData.forEach(s => {
      const cleanTitle = s.title.trim().toLowerCase();
      if (!seenTitles.has(cleanTitle)) {
        seenTitles.add(cleanTitle);
        finalMerged.push(s);
      }
    });

    return finalMerged;
  }, []);

  // Filter and search logic
  const filteredSafaris = useMemo(() => {
    return mergedSafaris.filter(safari => {
      // Search term match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesText = 
          safari.title.toLowerCase().includes(query) ||
          safari.desc.toLowerCase().includes(query) ||
          safari.parks.some((p: string) => p.toLowerCase().includes(query));
        if (!matchesText) return false;
      }

      // Circuit filter
      if (filterCircuit !== 'Any' && safari.circuit !== filterCircuit) return false;

      // Style filter
      if (filterStyle !== 'Any' && safari.style !== filterStyle) return false;

      // Duration filter
      if (filterDuration !== 'Any') {
        const daysMatch = safari.duration.match(/\d+/);
        const days = daysMatch ? parseInt(daysMatch[0], 10) : 1;
        if (filterDuration === '1-Day' && days !== 1) return false;
        if (filterDuration === '2-3-Days' && (days < 2 || days > 3)) return false;
        if (filterDuration === '4-Plus-Days' && days < 4) return false;
      }

      // Interest filter
      if (filterInterest !== 'Any' && !safari.interests.includes(filterInterest)) return false;

      return true;
    });
  }, [mergedSafaris, filterCircuit, filterDuration, filterStyle, filterInterest, searchQuery]);

  // Compared Packages List
  const comparedPackages = useMemo(() => {
    return mergedSafaris.filter(s => comparedIds.includes(s.id));
  }, [comparedIds, mergedSafaris]);

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setComparedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) return prev; // Maximum of 3
      return [...prev, id];
    });
  };

  const handleOpenDetails = (safari: any) => {
    setSelectedSafari(safari);
    setDetailTab('overview');
  };

  const handleToggleBigFive = (animal: string) => {
    setCheckedBigFive(prev => ({ ...prev, [animal]: !prev[animal] }));
  };

  const handlePlannerPrev = () => {
    setPlannerStep(prev => Math.max(1, prev - 1));
  };

  const handlePlannerNext = () => {
    setPlannerStep(prev => Math.min(4, prev + 1));
  };

  const handlePlannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const summary = `
🐾 *CUSTOM TANZANIA SAFARI DESIGN* 🐾
*Name:* ${plannerData.leadName}
*Travelers:* ${plannerData.guestsCount} guests
*Month:* ${plannerData.travelMonth}
*Duration:* ${plannerData.duration}
*Preferred Circuit:* ${plannerData.circuit}
*Accommodation Style:* ${plannerData.style}
*Group Type:* ${plannerData.groupType}
*Dream Wildlife/Experience:* ${plannerData.wildlife.join(', ') || 'General Safari exploration'}
*Contact Phone:* ${plannerData.contactNum || 'N/A'}
`;

    const waUrl = `https://wa.me/255629506063?text=${encodeURIComponent(summary.trim())}`;
    trackWhatsAppClick('Custom Safari Planner', plannerData.leadName);
    window.open(waUrl, '_blank');
    setShowCustomPlanner(false);
    setPlannerStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 animate-fade-in font-sans">
      
      {/* Cinematic Hero Header */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1600')",
            transform: `translateY(${scrollY * 0.2}px) scale(1.1)`
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/75 to-slate-950/95" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl space-y-4">
          <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] md:text-xs bg-[#D4A017]/15 px-4 py-2 rounded-full border border-[#D4A017]/30 inline-flex items-center gap-1.5 backdrop-blur-sm shadow-md">
            <Sparkles size={12} className="text-[#D4A017]" /> Tanzania Wilderness Expeditions
          </span>
          <h1 className="text-4xl md:text-7xl font-black text-white leading-none tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Bespoke Tanzania Safaris
          </h1>
          <p className="text-sm md:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-light">
            Fly directly from Zanzibar sands to legendary national parks. Experience private open-top Land Cruiser game drives, premium eco-glamping, and deep wildlife encounters.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => setShowCustomPlanner(true)}
              className="bg-[#D4A017] hover:bg-[#b58812] text-slate-950 text-xs md:text-sm font-black px-6 py-3.5 rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-[#D4A017]/20 uppercase tracking-wider"
            >
              <Compass size={16} />
              <span>Plan My Custom Safari</span>
            </button>
            <a 
              href="#featured-packages" 
              className="bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-black px-6 py-3.5 rounded-full transition-all flex items-center gap-1.5 border border-white/15 backdrop-blur-sm"
            >
              <span>Explore Packages</span>
              <ChevronDown size={16} />
            </a>
          </div>
        </div>

        {/* Floating Factoids Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 border-t border-white/5 backdrop-blur-md py-4 hidden md:block">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-8 text-center text-white">
            <div className="flex items-center justify-center gap-3">
              <Plane className="text-[#D4A017]" size={20} />
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-wider text-slate-100">Scenic Flights Included</p>
                <p className="text-[10px] text-slate-400">Door-to-door beach to bush flights</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 border-l border-white/10">
              <Shield className="text-[#D4A017]" size={20} />
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-wider text-slate-100">Registered Local Operator</p>
                <p className="text-[10px] text-slate-400">Direct bookings supporting rangers</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 border-l border-white/10">
              <Award className="text-[#D4A017]" size={20} />
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-wider text-slate-100">Bespoke 4x4 Fleet</p>
                <p className="text-[10px] text-slate-400">Guaranteed window seats on all drives</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ label: 'Tanzania Safaris' }]} navigate={navigate} />

      {/* Why Choose Us Brand Trust Section */}
      <section className="py-20 px-6 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#0B3B8C] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              The Luxury of Seamless Wilderness
            </h2>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
              We handle every component of your mainland adventure. All safari packages include return regional flights, airport meet-and-greets, park concessions, private 4x4 Land Cruisers, certified guides, gourmet hot buffet meals, and prestigious partner lodges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3 transition-all hover:shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-[#0B3B8C]/10 flex items-center justify-center text-[#0B3B8C]">
                <UserCheck size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Elite Native Spotters</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Our guides were born near the parks. They hold professional naturalist certifications and track animal prides by scent and prints.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3 transition-all hover:shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                <Compass size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Guaranteed Window Seats</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Never look over someone’s shoulder. We guarantee spacious window seating with open pop-up roof photography angles for every guest.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3 transition-all hover:shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Award size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Sustainable Lodging</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Rest with a clean conscience. We partner exclusively with low-impact eco-lodges operating on solar-grid energy and waste recycling.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-3 transition-all hover:shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
                <ThumbsUp size={20} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Direct Local Pricing</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                No middleman commissions. By booking directly with us, you save up to 30% and ensure the funds empower rangers and village schools directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Circuit / Safari Style Quick Filters */}
      <section className="py-12 bg-slate-100 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
            <span className="text-[#0B3B8C] text-[10px] font-extrabold uppercase tracking-widest bg-[#0B3B8C]/10 px-3 py-1 rounded-full">
              Explore Circuits & Styles
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Select Your Safari Vibe
            </h3>
            <p className="text-xs text-slate-500">Pick a circuit category to instantly highlight matching expeditions.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button 
              onClick={() => { setFilterCircuit('Northern'); setFilterStyle('Any'); }}
              className={`p-4 rounded-3xl border text-center transition-all cursor-pointer ${
                filterCircuit === 'Northern' 
                  ? 'bg-[#0B3B8C] text-white border-[#0B3B8C]' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-black uppercase tracking-wider">Northern Circuit</p>
              <p className="text-[10px] opacity-70 mt-0.5">Serengeti & Crater</p>
            </button>
            <button 
              onClick={() => { setFilterCircuit('Southern'); setFilterStyle('Any'); }}
              className={`p-4 rounded-3xl border text-center transition-all cursor-pointer ${
                filterCircuit === 'Southern' 
                  ? 'bg-[#0B3B8C] text-white border-[#0B3B8C]' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-black uppercase tracking-wider">Southern Circuit</p>
              <p className="text-[10px] opacity-70 mt-0.5">Selous & Mikumi</p>
            </button>
            <button 
              onClick={() => { setFilterStyle('Luxury Glamping'); setFilterCircuit('Any'); }}
              className={`p-4 rounded-3xl border text-center transition-all cursor-pointer ${
                filterStyle === 'Luxury Glamping' 
                  ? 'bg-[#0B3B8C] text-white border-[#0B3B8C]' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-black uppercase tracking-wider">Luxury Glamping</p>
              <p className="text-[10px] opacity-70 mt-0.5">River Tents & Camps</p>
            </button>
            <button 
              onClick={() => { setFilterStyle('Budget Day Trips'); setFilterCircuit('Any'); }}
              className={`p-4 rounded-3xl border text-center transition-all cursor-pointer ${
                filterStyle === 'Budget Day Trips' 
                  ? 'bg-[#0B3B8C] text-white border-[#0B3B8C]' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-black uppercase tracking-wider">Budget Day Trips</p>
              <p className="text-[10px] opacity-70 mt-0.5">Mikumi Sun-Up to Sun-Down</p>
            </button>
            <button 
              onClick={() => { setFilterCircuit('Any'); setFilterStyle('Any'); setFilterDuration('Any'); setFilterInterest('Any'); setSearchQuery(''); }}
              className="p-4 rounded-3xl border text-center bg-[#D4A017] hover:bg-amber-500 text-slate-950 border-[#D4A017] transition-all cursor-pointer"
            >
              <p className="text-sm font-black uppercase tracking-wider">Reset Finder</p>
              <p className="text-[10px] opacity-80 mt-0.5">Show All Safaris</p>
            </button>
          </div>
        </div>
      </section>

      {/* Safari Finder Form / Filter Panel */}
      <section className="py-8 px-6 bg-slate-900 border-b border-slate-800 text-white shadow-xl relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-[#D4A017] flex items-center justify-center">
                <Filter size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider">Safari Interactive Finder</h4>
                <p className="text-[10px] text-slate-400">Narrow down your perfect expedition specs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
              {/* Select Circuit */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Safari Circuit</label>
                <select 
                  value={filterCircuit}
                  onChange={(e) => setFilterCircuit(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4A017]"
                >
                  <option value="Any">All Circuits (Northern / Southern)</option>
                  <option value="Northern">Northern Circuit (Serengeti, Ngorongoro)</option>
                  <option value="Southern">Southern Circuit (Nyerere, Mikumi)</option>
                </select>
              </div>

              {/* Select Duration */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Trip Duration</label>
                <select 
                  value={filterDuration}
                  onChange={(e) => setFilterDuration(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4A017]"
                >
                  <option value="Any">Any Duration</option>
                  <option value="1-Day">1 Day Excursions</option>
                  <option value="2-3-Days">Short (2 - 3 Days)</option>
                  <option value="4-Plus-Days">Extended (4+ Days)</option>
                </select>
              </div>

              {/* Select Interest */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Key Sight Focus</label>
                <select 
                  value={filterInterest}
                  onChange={(e) => setFilterInterest(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#D4A017]"
                >
                  <option value="Any">Any Wildlife Spot</option>
                  <option value="The Big Five">The Big Five</option>
                  <option value="Great Migration">Great Wildebeest Migration</option>
                  <option value="River Boat Cruise">River Boat Cruises</option>
                  <option value="Photography">Landscape Photography</option>
                </select>
              </div>

              {/* Text Search Input */}
              <div className="space-y-1 relative">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Search keyword</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Serengeti, Boat..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-[#D4A017]"
                  />
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Safaris Display List */}
      <section id="featured-packages" className="py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[#D4A017] text-xs font-black uppercase tracking-widest block">Tanzania Wilderness Plains</span>
              <h2 className="text-2xl md:text-4xl font-black text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                All-Inclusive Expeditions ({filteredSafaris.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium max-w-xs">
              Every flight safari departs directly from Zanzibar (ZNZ) with private flight connections and elite guides.
            </p>
          </div>

          {filteredSafaris.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center max-w-xl mx-auto space-y-4">
              <Compass className="w-12 h-12 mx-auto text-slate-400 animate-spin-slow" />
              <h3 className="text-lg font-black text-slate-900">No matching safaris found</h3>
              <p className="text-xs text-slate-500">
                Try widening your search terms or resetting the filter parameters above to view our core safari catalog.
              </p>
              <button 
                onClick={() => { setFilterCircuit('Any'); setFilterStyle('Any'); setFilterDuration('Any'); setFilterInterest('Any'); setSearchQuery(''); }}
                className="bg-[#0B3B8C] text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredSafaris.map((safari) => {
                const isCompared = comparedIds.includes(safari.id);
                return (
                  <div 
                    key={safari.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Card Header Media */}
                    <div className="relative h-56 overflow-hidden">
                      <ProgressiveImage 
                        src={safari.image} 
                        alt={safari.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                      
                      <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                        <span className="bg-[#0B3B8C] text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-md">
                          ✈️ {safari.type}
                        </span>
                        <span className="bg-[#D4A017] text-slate-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-md">
                          📍 {safari.circuit} Circuit
                        </span>
                      </div>

                      {/* Compare Checkbox */}
                      <button 
                        onClick={(e) => toggleCompare(safari.id, e)}
                        className={`absolute top-4 right-4 w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md ${
                          isCompared 
                            ? 'bg-[#D4A017] border-[#D4A017] text-slate-950' 
                            : 'bg-black/30 border-white/25 text-white hover:bg-black/50'
                        }`}
                        title="Compare Safari side-by-side"
                      >
                        {isCompared ? <Check size={14} strokeWidth={3} /> : <span className="text-[10px] font-bold">+</span>}
                      </button>

                      {/* Duration Tag */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-1 text-white text-xs font-bold">
                        <Clock size={12} className="text-[#D4A017]" />
                        <span>{safari.duration}</span>
                      </div>
                    </div>

                    {/* Card Body content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2 text-left">
                        <span className="text-[9px] text-[#D4A017] uppercase font-black tracking-wider">
                          Best For: {safari.bestFor}
                        </span>
                        <h3 className="text-lg md:text-xl font-bold text-[#0B3B8C] leading-snug line-clamp-1 hover:text-[#D4A017] transition-all cursor-pointer" onClick={() => handleOpenDetails(safari)}>
                          {safari.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium">
                          {safari.desc}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <MapPin size={12} className="text-[#0B3B8C]" />
                          <span>Parks: {safari.parks.join(', ')}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">All-Inclusive Rate</p>
                          <p className="text-xl md:text-2xl font-black text-slate-900">{safari.price}</p>
                        </div>

                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => handleOpenDetails(safari)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer"
                            title="Interactive details view"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => {
                              localStorage.setItem('booking_prefilled_category', 'safari');
                              localStorage.setItem('booking_prefilled_tour', safari.title);
                              navigate('booking', `package=${encodeURIComponent(safari.title)}`);
                            }}
                            className="bg-[#0B3B8C] hover:bg-[#093175] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1"
                          >
                            <span>Book</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Side-by-Side Compare Modal Overlay */}
      <AnimatePresence>
        {showCompareModal && comparedPackages.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200"
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-[#0B3B8C] text-white">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Compare Safari Specifications
                  </h3>
                  <p className="text-xs text-slate-200">Side-by-side analytical tour comparison</p>
                </div>
                <button 
                  onClick={() => setShowCompareModal(false)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 min-w-[600px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="py-3 px-4 font-black uppercase text-slate-500 text-[10px]">Specification</th>
                      {comparedPackages.map((pkg, idx) => (
                        <th key={pkg.id} className="py-3 px-4 w-1/3">
                          <p className="font-extrabold text-[#0B3B8C] text-sm">{pkg.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{pkg.type}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-3.5 px-4 font-bold bg-slate-50 text-slate-600">Base Price</td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="py-3.5 px-4 text-slate-900 font-black text-sm text-emerald-600">{pkg.price} <span className="text-[10px] text-slate-400 font-normal">/ guest</span></td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold bg-slate-50 text-slate-600">Duration</td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="py-3.5 px-4 font-extrabold">{pkg.duration}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold bg-slate-50 text-slate-600">Primary Circuit</td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="py-3.5 px-4"><span className="px-2.5 py-1 rounded bg-[#D4A017]/10 text-[#D4A017] text-[10px] font-bold uppercase">{pkg.circuit} Circuit</span></td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold bg-slate-50 text-slate-600">Lodging Style</td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="py-3.5 px-4 font-semibold text-slate-800">{pkg.style}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold bg-slate-50 text-slate-600">Wildlife to Spot</td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="py-3.5 px-4 text-slate-500 font-medium">{pkg.wildlife || 'Big Game Plains'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold bg-slate-50 text-slate-600">Vehicle Type</td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="py-3.5 px-4 text-slate-500 font-medium">{pkg.safariVehicle || 'Custom 4x4 Cruiser'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-bold bg-slate-50 text-slate-600">Key Attraction Parks</td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="py-3.5 px-4 text-[#0B3B8C] font-semibold">{pkg.parks.join(', ')}</td>
                      ))}
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-4 px-4 font-bold text-slate-600">Action</td>
                      {comparedPackages.map(pkg => (
                        <td key={pkg.id} className="py-4 px-4">
                          <button 
                            onClick={() => {
                              localStorage.setItem('booking_prefilled_category', 'safari');
                              localStorage.setItem('booking_prefilled_tour', pkg.title);
                              navigate('booking', `package=${encodeURIComponent(pkg.title)}`);
                            }}
                            className="w-full bg-[#0B3B8C] hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl transition-all uppercase tracking-wider"
                          >
                            Book Package
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Compare Bar */}
      {comparedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-white/10 px-6 py-4 rounded-3xl shadow-2xl z-40 flex flex-col sm:flex-row items-center gap-4 max-w-xl w-11/12 animate-fade-in-up backdrop-blur-md">
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Compare Safari Packages ({comparedIds.length}/3)</h4>
            <p className="text-[10px] text-slate-400">Review specs, price points, and vehicles side-by-side</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-center">
            <button 
              onClick={() => setComparedIds([])} 
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl transition-all"
            >
              Clear
            </button>
            <button 
              onClick={() => setShowCompareModal(true)} 
              className="bg-[#D4A017] hover:bg-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all uppercase tracking-wider"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* Custom Safari Step-by-Step Planner Modal */}
      <AnimatePresence>
        {showCustomPlanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              {/* Header */}
              <div className="bg-[#0B3B8C] text-white p-6 relative">
                <button 
                  onClick={() => setShowCustomPlanner(false)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer"
                >
                  <X size={16} />
                </button>
                <span className="text-[#D4A017] text-[10px] font-black uppercase tracking-widest block mb-1">
                  Step {plannerStep} of 4
                </span>
                <h3 className="text-lg md:text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Design Your Private Safari
                </h3>
                <p className="text-xs text-slate-200">Our local travel experts craft a tailored itinerary at no charge.</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-1">
                <div 
                  className="bg-[#D4A017] h-full transition-all duration-300"
                  style={{ width: `${(plannerStep / 4) * 100}%` }}
                />
              </div>

              {/* Content Form */}
              <form onSubmit={handlePlannerSubmit} className="p-6 text-left space-y-6 max-h-[60vh] overflow-y-auto">
                {/* STEP 1: Circuit & Accommodation */}
                {plannerStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[#0B3B8C] text-sm uppercase tracking-wider">Circuit & Accommodation preferences</h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 block">Where would you like to explore?</label>
                      <select 
                        value={plannerData.circuit}
                        onChange={(e) => setPlannerData({ ...plannerData, circuit: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800"
                      >
                        <option value="Northern Circuit (Serengeti, Ngorongoro Crater)">Northern Circuit (Serengeti, Ngorongoro Crater)</option>
                        <option value="Southern Circuit (Nyerere, Mikumi National Parks)">Southern Circuit (Nyerere, Mikumi National Parks)</option>
                        <option value="Custom Combination (Beach, Bush, & Flights)">Custom Combination (Beach, Bush, & Flights)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 block">Accommodation & Style</label>
                      <select 
                        value={plannerData.style}
                        onChange={(e) => setPlannerData({ ...plannerData, style: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800"
                      >
                        <option value="Ultra-Luxury Glamping (Premium river tents & private pools)">Ultra-Luxury Glamping (Premium river tents & private pools)</option>
                        <option value="Premium Classic (Boutique forest lodges & standard camps)">Premium Classic (Boutique forest lodges & standard camps)</option>
                        <option value="Budget-Conscious Day Trips (Fast, action-packed flight tours)">Budget-Conscious Day Trips (Fast, action-packed flight tours)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 2: Wildlife and Focus */}
                {plannerStep === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[#0B3B8C] text-sm uppercase tracking-wider">Dream Wildlife & Focus</h4>
                    <p className="text-[11px] text-slate-400">What is on your bucket list? (Select multiple)</p>

                    <div className="grid grid-cols-2 gap-3.5">
                      {['The Big Five', 'Wildebeest Migration', 'River Boat Cruise', 'Nature Walking Safaris', 'Bird Watching', 'Photography'].map((wild) => {
                        const isSelected = plannerData.wildlife.includes(wild);
                        return (
                          <button 
                            type="button"
                            key={wild}
                            onClick={() => {
                              const copy = isSelected 
                                ? plannerData.wildlife.filter(w => w !== wild)
                                : [...plannerData.wildlife, wild];
                              setPlannerData({ ...plannerData, wildlife: copy });
                            }}
                            className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                              isSelected 
                                ? 'bg-[#0B3B8C]/10 border-[#0B3B8C] text-[#0B3B8C] font-extrabold' 
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <span>{wild}</span>
                            {isSelected && <Check size={14} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: Travel Parameters */}
                {plannerStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[#0B3B8C] text-sm uppercase tracking-wider">Group & Dates</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 block">Estimated Month</label>
                        <select 
                          value={plannerData.travelMonth}
                          onChange={(e) => setPlannerData({ ...plannerData, travelMonth: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800"
                        >
                          {['June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 block">Safari Duration</label>
                        <select 
                          value={plannerData.duration}
                          onChange={(e) => setPlannerData({ ...plannerData, duration: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800"
                        >
                          <option value="1 Day">1 Day</option>
                          <option value="2-3 Days">2-3 Days</option>
                          <option value="4-6 Days">4-6 Days</option>
                          <option value="7+ Days">7+ Days</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 block">Travelers Count</label>
                        <input 
                          type="number" 
                          min={1} 
                          max={30}
                          value={plannerData.guestsCount}
                          onChange={(e) => setPlannerData({ ...plannerData, guestsCount: parseInt(e.target.value, 10) || 1 })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 block">Travel Party Vibe</label>
                        <select 
                          value={plannerData.groupType}
                          onChange={(e) => setPlannerData({ ...plannerData, groupType: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-xs text-slate-800"
                        >
                          <option value="Family Safari">Family Safari (Kid-Friendly)</option>
                          <option value="Savoring Honeymoon">Savoring Honeymoon</option>
                          <option value="Couples Trip">Couples Trip</option>
                          <option value="Group Adventure">Group Adventure</option>
                          <option value="Solo Exploration">Solo Exploration</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Personal Info & Submit */}
                {plannerStep === 4 && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[#0B3B8C] text-sm uppercase tracking-wider">Contact & Summary</h4>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 block">Your Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={plannerData.leadName}
                        onChange={(e) => setPlannerData({ ...plannerData, leadName: e.target.value })}
                        placeholder="e.g. Dr. Emily Carter"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:border-[#D4A017]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 block">WhatsApp or Phone number (with country code)</label>
                      <input 
                        type="tel" 
                        required
                        value={plannerData.contactNum}
                        onChange={(e) => setPlannerData({ ...plannerData, contactNum: e.target.value })}
                        placeholder="e.g. +44 7911 123456"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:border-[#D4A017]"
                      />
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1 font-medium text-slate-600">
                      <span className="text-[#0B3B8C] font-extrabold block">📑 Ready to Dispatch Summary</span>
                      <p><strong>Preferred Circuit:</strong> {plannerData.circuit}</p>
                      <p><strong>Travelers:</strong> {plannerData.guestsCount} guests | <strong>Party Style:</strong> {plannerData.groupType}</p>
                      <p><strong>Timeline:</strong> {plannerData.travelMonth} ({plannerData.duration})</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex justify-between gap-4">
                  {plannerStep > 1 && (
                    <button 
                      type="button"
                      onClick={handlePlannerPrev}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-3 px-5 rounded-full cursor-pointer"
                    >
                      Back
                    </button>
                  )}
                  {plannerStep < 4 ? (
                    <button 
                      type="button"
                      onClick={handlePlannerNext}
                      className="bg-[#0B3B8C] hover:bg-slate-800 text-white text-xs font-black py-3 px-6 rounded-full ml-auto cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Next Step</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      className="bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-black py-3 px-6 rounded-full ml-auto cursor-pointer flex items-center gap-1.5 shadow-lg"
                    >
                      <MessageCircle size={14} fill="white" />
                      <span>Submit to WhatsApp</span>
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Luxury Detailed Safari Tabbed Overlay Modal Dialog */}
      <AnimatePresence>
        {selectedSafari && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl relative"
            >
              {/* Sticky Title Header */}
              <div className="p-6 border-b border-slate-200 bg-[#0B3B8C] text-white flex justify-between items-center relative">
                <div>
                  <span className="text-[#D4A017] uppercase tracking-widest font-black text-[9px] bg-[#D4A017]/10 px-2.5 py-1 rounded-full border border-[#D4A017]/20 inline-block mb-1">
                    ✈️ All-Inclusive {selectedSafari.type}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {selectedSafari.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedSafari(null)}
                  className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full cursor-pointer transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sub-tabbed Navigation Bar */}
              <div className="flex bg-slate-100 border-b border-slate-200 p-1 overflow-x-auto">
                {(['overview', 'itinerary', 'lodging', 'pricing', 'faq', 'gallery'] as const).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`flex-1 min-w-[80px] text-[10px] font-black py-2.5 px-1 text-center uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                      detailTab === tab 
                        ? 'bg-[#0B3B8C] text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Modal Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-left">
                
                {/* TAB 1: OVERVIEW */}
                {detailTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="relative h-64 rounded-3xl overflow-hidden shadow-md">
                      <ProgressiveImage src={selectedSafari.image} alt={selectedSafari.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-extrabold text-[#0B3B8C] text-base uppercase tracking-wider">Expedition Summary</h4>
                      <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                        {selectedSafari.desc}
                      </p>
                    </div>

                    {/* Quick Metrics Panel */}
                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scenic value</span>
                        <p className="text-[#D4A017] font-black text-sm md:text-base mt-0.5">★★★★★</p>
                      </div>
                      <div className="text-center border-l border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vehicle fleet</span>
                        <p className="text-slate-800 font-extrabold text-xs mt-0.5">{selectedSafari.safariVehicle || 'Custom 4x4 Cruiser'}</p>
                      </div>
                      <div className="text-center border-l border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Game drives count</span>
                        <p className="text-slate-800 font-extrabold text-xs mt-0.5">{selectedSafari.gameDrives || 'Daily Drives'}</p>
                      </div>
                    </div>

                    {/* The Big Five Interactive Checklist */}
                    <div className="bg-teal-500/5 border border-teal-500/10 p-5 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center">
                        <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                          🦁 The Big Five Sighting Checklist
                        </h5>
                        <span className="text-[10px] text-teal-600 font-bold">Tap to toggle spotted</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.keys(checkedBigFive).map((animal) => (
                          <button 
                            key={animal}
                            onClick={() => handleToggleBigFive(animal)}
                            className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                              checkedBigFive[animal] 
                                ? 'bg-teal-50 border-teal-500 text-teal-800 font-bold' 
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="text-base block mb-0.5">
                              {animal === 'Lion' && '🦁'}
                              {animal === 'Leopard' && '🐆'}
                              {animal === 'Elephant' && '🐘'}
                              {animal === 'Buffalo' && '🐃'}
                              {animal === 'Rhino' && '🦏'}
                            </span>
                            <span className="text-[9px] block leading-none">{animal}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-slate-400 text-xs uppercase tracking-widest">Key Experience Highlights</h4>
                      <div className="space-y-2">
                        {selectedSafari.highlights.map((hlt: string, i: number) => (
                          <div key={i} className="flex gap-2.5 items-start text-xs text-slate-700 font-medium">
                            <Check className="text-[#D4A017] shrink-0 mt-0.5" size={14} />
                            <span>{hlt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ITINERARY */}
                {detailTab === 'itinerary' && (
                  <div className="space-y-6">
                    <h4 className="font-extrabold text-[#0B3B8C] text-base uppercase tracking-wider flex items-center gap-1.5">
                      <Compass size={18} className="text-[#D4A017]" /> Staggered Daily Timelines
                    </h4>

                    {selectedSafari.itinerary && selectedSafari.itinerary.length > 0 ? (
                      <div className="space-y-6 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#0B3B8C]/15">
                        {selectedSafari.itinerary.map((step: any, idx: number) => (
                          <div key={idx} className="relative pl-9 text-left space-y-1">
                            <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full border border-white bg-[#D4A017] flex items-center justify-center text-[8px] font-black text-[#020C1F] shadow-sm" />
                            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-2">
                              <span className="bg-[#D4A017]/10 text-[#D4A017] px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                {step.day || `Day ${idx + 1}`}
                              </span>
                              <h5 className="font-extrabold text-slate-900 text-sm">{step.title}</h5>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center">No day-by-day programs available for this custom package.</p>
                    )}

                    <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                      <h4 className="text-sm font-bold text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                        <MapPin className="text-[#D4A017]" size={16} /> Circuit Route Preview
                      </h4>
                      <div className="rounded-2xl overflow-hidden border border-gray-100">
                        <InteractiveMap mode="safaris" height="280px" />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: LODGING */}
                {detailTab === 'lodging' && (
                  <div className="space-y-6">
                    <h4 className="font-extrabold text-[#0B3B8C] text-base uppercase tracking-wider">Luxury Partner Lodging</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      We partner exclusively with certified eco-luxury properties situated near natural water sources for stellar wildlife sightings.
                    </p>

                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex gap-4 items-start">
                        <div className="w-16 h-16 rounded-xl bg-slate-200 shrink-0 overflow-hidden">
                          <ProgressiveImage src="https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=300" alt="River Glamping Lodge" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <h5 className="font-extrabold text-slate-900 text-sm">Swahili Plains Eco-Camp</h5>
                            <span className="text-[#D4A017] text-[10px]">★★★★★</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Suite category: Luxury River Tent</p>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Set on private wood terraces alongside a hippopotamus bend, featuring en-suite safari showers, solar lighting, and direct animal-viewing balconies.
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex gap-4 items-start">
                        <div className="w-16 h-16 rounded-xl bg-slate-200 shrink-0 overflow-hidden">
                          <ProgressiveImage src="https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=300" alt="Boutique Forest Lodge" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <h5 className="font-extrabold text-slate-900 text-sm">Serengeti Acacia Luxury Glamping</h5>
                            <span className="text-[#D4A017] text-[10px]">★★★★★</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Suite category: Canopy Forest Suite</p>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Perched near acacia groves with sweeping grassland panoramas, Omani-styled carpets, hot showers, and campfires.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: PRICING & INCLUSIONS */}
                {detailTab === 'pricing' && (
                  <div className="space-y-6">
                    <h4 className="font-extrabold text-[#0B3B8C] text-base uppercase tracking-wider">Inclusions & Pricing Details</h4>

                    <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-3 text-xs">
                      <h5 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider border-b border-slate-200 pb-2">Dynamic Rates Matrix</h5>
                      <div className="divide-y divide-slate-150">
                        {selectedSafari.pricingTable.map((price: any, i: number) => (
                          <div key={i} className="flex justify-between items-center py-2.5">
                            <span className="font-medium text-slate-600">{price.tier}</span>
                            <span className="font-black text-slate-900">{price.rate}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Covered */}
                      <div className="border border-green-200 rounded-2xl p-5 text-xs space-y-3">
                        <h5 className="font-extrabold text-green-700 uppercase text-[10px] tracking-widest flex items-center gap-1">
                          <Check size={14} /> Included in Rate
                        </h5>
                        <ul className="space-y-2">
                          {selectedSafari.included.map((inc: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5 text-slate-600 font-medium">
                              <Check size={12} className="text-green-500 shrink-0 mt-0.5" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Excluded */}
                      <div className="border border-red-150 rounded-2xl p-5 text-xs space-y-3">
                        <h5 className="font-extrabold text-red-700 uppercase text-[10px] tracking-widest flex items-center gap-1">
                          <X size={14} /> Excluded (Out of pocket)
                        </h5>
                        <ul className="space-y-2">
                          {selectedSafari.excluded.map((exc: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5 text-slate-600 font-medium">
                              <X size={12} className="text-red-400 shrink-0 mt-0.5" />
                              <span>{exc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: FAQs & ADVISORIES */}
                {detailTab === 'faq' && (
                  <div className="space-y-6">
                    <h4 className="font-extrabold text-[#0B3B8C] text-base uppercase tracking-wider">Safari Practical advisories</h4>

                    <div className="space-y-3 text-xs">
                      <p className="font-bold text-slate-400 uppercase tracking-widest">Selected Packing Checklist</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSafari.whatToBring.map((item: string, i: number) => (
                          <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 text-slate-600 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="font-bold text-slate-400 uppercase tracking-widest">Expedition FAQs</p>
                      {selectedSafari.faqs.map((faq: any, i: number) => (
                        <div key={i} className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-xs space-y-1">
                          <h5 className="font-extrabold text-[#0B3B8C]">Q: {faq.q}</h5>
                          <p className="text-slate-500 font-medium leading-relaxed">A: {faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: MASONRY GALLERY */}
                {detailTab === 'gallery' && (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-[#0B3B8C] text-base uppercase tracking-wider">Plains Landscapes Gallery</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedSafari.gallery.map((url: string, i: number) => (
                        <div key={i} className="rounded-2xl overflow-hidden h-40 border border-slate-200">
                          <ProgressiveImage src={url} alt={`Landscape ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Sticky Footer Booking Panel */}
              <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">All-Inclusive Rate</p>
                  <p className="text-2xl font-black text-slate-900">{selectedSafari.price} <span className="text-xs font-normal text-slate-400">/ guest</span></p>
                </div>

                <div className="flex gap-2.5">
                  <a 
                    href={`https://wa.me/255629506063?text=${encodeURIComponent(`Hi Gerevas Mtaki! I'm interested in booking the "${selectedSafari.title}". Could you guide me through scheduling details?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick('Safari Detail Sidebar', selectedSafari.title)}
                    className="bg-[#25D366] hover:bg-[#1ebd5a] text-white text-xs font-black py-3 px-5 rounded-full flex items-center gap-1.5 shadow"
                  >
                    <MessageCircle size={14} fill="white" />
                    <span>WhatsApp</span>
                  </a>
                  <button 
                    onClick={() => {
                      localStorage.setItem('booking_prefilled_category', 'safari');
                      localStorage.setItem('booking_prefilled_tour', selectedSafari.title);
                      navigate('booking', `package=${encodeURIComponent(selectedSafari.title)}`);
                    }}
                    className="bg-[#0B3B8C] hover:bg-[#093175] text-white text-xs font-black py-3 px-6 rounded-full uppercase tracking-wider"
                  >
                    Go Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guest Reviews Section */}
      <section className="py-20 px-6 bg-slate-100 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/20 inline-block">
              ⭐️ Verified Safari Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[#0B3B8C] tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
              What Our Safari Guests Say
            </h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto font-medium">
              Read verified feedback from travelers who flew from Zanzibar to mainland national parks with us.
            </p>
          </div>
          <GuestReviews navigate={navigate} />
        </div>
      </section>

      {/* Full-Width Coordinator CTA Footer Section */}
      <section className="bg-slate-900 py-20 px-6 relative overflow-hidden text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=1200')" }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <Compass className="w-12 h-12 mx-auto text-[#D4A017] animate-spin-slow" />
          <h3 className="text-3xl md:text-5xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Designing a Lifetime Memory
          </h3>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
            Every traveler wants something different. Speak directly with Gerevas Mtaki (Founder & CEO) on WhatsApp to design unique multi-day combinations, adding Zanzibar beaches and Kilimanjaro climbing routes.
          </p>
          
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => setShowCustomPlanner(true)}
              className="bg-[#D4A017] hover:bg-amber-500 text-slate-950 font-black px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all shadow-md"
            >
              Start Custom Design
            </button>
            <a 
              href="https://wa.me/255629506063?text=Hi%20Gerevas!%20I'd%20like%20to%20design%20a%20custom%20Tanzania%20safari%20combo%20with%20Zanzibar%20beach%20stay."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('Safari Bottom Banner', 'General Query')}
              className="bg-[#25D366] hover:bg-[#1ebd5a] text-white font-black px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-md"
            >
              <MessageCircle size={14} fill="white" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
