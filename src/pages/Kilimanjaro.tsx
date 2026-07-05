import { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { Shield, Clock, Compass, Star, CheckCircle, ChevronDown, ChevronUp, MessageCircle, ArrowRight, List, X, Check, Image as ImageIcon, Sparkles, HelpCircle } from 'lucide-react';
import { getSiteContent } from '../lib/cmsStore';
import { useScrollY } from '../hooks/useScrollY';
import { ProgressiveImage } from '../components/ProgressiveImage';
import GuestReviews from '../components/GuestReviews';
import { useAnalytics } from '../context/AnalyticsContext';

interface KilimanjaroProps {
  navigate: (page: Page, id?: string) => void;
}

const routesData = [
  {
    id: 'machame-route',
    name: 'Machame Route (Whiskey Route)',
    difficulty: 'High / Heavy-Grade Adventure',
    duration: '7 Days / 6 Nights',
    successRate: '92% Ascent Success',
    scenicVal: 'Very High (Stunning panoramic shifts)',
    basePrice: '$1,350/person',
    desc: 'The Whiskey Route is widely celebrated as the most scenic, visually dramatic, and rewarding track to Uhuru Peak. Trekkers walk past gorgeous giant Groundsel plants and wild heathers, ascend the famous Barranco Wall, and traverse the massive Shira Plateau. Its clever "climb high, sleep low" horizontal profiles facilitate excellent biological acclimatization, supporting outstanding success rates for active adventurers.',
    highlights: [
      'Climbing the legendary, high-adrenaline but non-technical Barranco Wall',
      'Traversing the scenic Shira Plateau with crater-rim views of Shira peak',
      'Climbing Lava Tower at 4,630 meters for premium body acclimatization',
      'Sleeping inside premium, high-altitude double-walled geodesic tents',
      'Sunrise on the glaciers overlooking Kenya'
    ],
    bestTimeToVisit: 'January to March (Warm & clear weather) and July to October (Dry and cool panoramic skies).',
    whatToBring: [
      'Rating down sleeping bag (certified -10°C comfort or lower)',
      'Waterproof, broken-in leather trekking boots with vibram soles',
      'Four-layer heavy thermal top & bottom base clothing arrays',
      'Polarized alpine snow ski goggles and thermal gloves'
    ],
    included: [
      'Return private resort transfers between Kilimanjaro Airport (JRO) & Park Gate',
      'Expert, licensed bilingual head guides, emergency spotters, and wilderness cooks',
      'KPAP-compliant wages, warm shelters, clothes, and organic nutrition for mountain porters',
      '3 Nutritious hot culinary-balanced high-energy meals prepared daily in mountain dome kitchens',
      'State-of-the-art double-layer mountain dome tents, dining shelters, chairs, and field stoves'
    ],
    excluded: [
      'Gear rental costs (sleeping bags, trekking poles, duffle protectors)',
      'Tanzanian entry tourist visas ($50–$100 country dependent)',
      'Customary mountain crew porter tipping (suggested $15–$20 split per day)'
    ],
    pricingTable: [
      { tier: 'Solo Climber Private Expedition', rate: '$1,650 USD' },
      { tier: 'Climber Duo Group (2 People)', rate: '$1,450 / person' },
      { tier: 'Team Squad Promo (3–5 climbers)', rate: '$1,350 / person' },
      { tier: 'Corporate / Large Group Pool (6+ people)', rate: '$1,250 / person' }
    ],
    faqs: [
      { q: 'Is climbing the Barranco Wall dangerous?', a: 'No, it looks dramatic from below, but it is a highly secure, fun crawl with plenty of footholds. No ropes, harnesses, or technical climbing gear are needed!' },
      { q: 'Do you carry hyperbaric oxygen chambers or tanks?', a: 'Yes! Our custom medical guides carry pulse oximeters, emergency bottled medical oxygen, and premium first-aid trauma bags on every trek.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1433052/pexels-photo-1450352.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    seoMetadata: {
      title: 'Kilimanjaro Machame Route Climb | 7-Day Whiskey Trail',
      desc: 'Climb Mount Kilimanjaro via the scenic Machame (Whiskey) Route. Complete 7-day all-inclusive expedition guided by certified KPAP ethical operators.',
      keywords: ['Machame Route Kilimanjaro', 'Whiskey Route Climb', 'Climb Kilimanjaro Zanzibar', 'Kilimanjaro Trekking Tours', 'Uhuru Peak Guides']
    },
    itinerary: [
      { day: 'Day 1', title: 'Machame Gate (1,800m) to Machame Camp (2,835m)', activity: 'A 5-6 hour walk up the lush Kilimanjaro rainforest belt, where blue monkeys and colobus monkeys roam.' },
      { day: 'Day 2', title: 'Machame Camp (2,835m) to Shira 2 Camp (3,840m)', activity: 'Leave the trees for the steep heather moorlands. Traverse rocky ridges and sleep on the high Shira Plateau.' },
      { day: 'Day 3', title: 'Shira 2 Camp to Lava Tower (4,630m) to Barranco Camp (3,960m)', activity: 'A crucial acclimatization step! Hike to the massive Lava Tower, then descend into the beautiful Barranco Valley.' },
      { day: 'Day 4', title: 'Barranco Camp (3,960m) to Karanga Camp (3,963m)', activity: 'Tackle the fun Barranco Wall scrambles, then walk past giant lobelias to reach the alpine desert Karanga camp.' },
      { day: 'Day 5', title: 'Karanga Camp (3,963m) to Barafu Camp (4,640m)', activity: 'Move over rocky barren desert fields. Rest early to prepare for the midnight summit assault.' },
      { day: 'Day 6', title: 'Barafu Camp (4,640m) to Uhuru Peak (5,895m) to Mweka Camp (3,100m)', activity: 'Summit Night! Push through steep ash scree starting at midnight. Stand on the Roof of Africa for sunrise, then descend.' },
      { day: 'Day 7', title: 'Mweka Camp (3,100m) to Mweka Gate (1,630m) & JRO Airport', activity: 'A final gentle descend through rainforests. Receive official Gold Peak Diplomas, say goodbye to the crew, and transfer.' }
    ]
  },
  {
    id: 'marangu-route',
    name: 'Marangu Route (Coca-Cola Route)',
    difficulty: 'Medium / Shelter Lodge Trek',
    duration: '6 Days / 5 Nights',
    successRate: '82% Ascent Success',
    scenicVal: 'High (Beautiful forest and volcanic saddles)',
    basePrice: '$1,290/person',
    desc: 'The Marangu Route is the classic pathway up Mount Kilimanjaro. It is famous for being the only path that provides solar-powered A-frame wooden sleeping huts instead of tents. Since you descend down the same path, it is physically gentle. The 6-day itinerary features a critical acclimatization day to offset the classic rapid vertical rise.',
    highlights: [
      'Sleeping inside comfortable A-frame wooden chalets with solar power',
      'The gentlest and most direct trail gradient up Mount Kilimanjaro',
      'Incredibly high success rates on the 6-day acclimatization trek',
      'Panoramic walks through the Mawenzi peak volcanic saddle',
      'Walking past stunning high-altitude heather gardens'
    ],
    bestTimeToVisit: 'Dry seasons (July to November and January to March) are ideal to avoid muddy trail sections.',
    whatToBring: [
      'Premium winter thermal sleep liners for the cabin beds',
      'Comfortable lightweight indoor shoes (crocs or slippers) for the huts',
      'Warm down jackets and fleece layers for high-frigid base summits',
      'Sturdy hiking poles (highly helpful for steep ash descents)'
    ],
    included: [
      'Return hotel and Kilimanjaro airport road transportations',
      'All permit fees, national park fees, rescue taxes, and environmental levies',
      'Shared accommodation beds inside the Mandara, Horombo, and Kibo huts',
      'All hot chef-cooked breakfasts, picnic trail lunches, and hot dinners',
      'Highly licensed head guides, assistant spotters, porters and cooks'
    ],
    excluded: [
      'Sack down sleeping bags and personal outdoor walking poles',
      'Required tipping for the mountain staff and crew members',
      'Personal travel medications and summit insurance coverage'
    ],
    pricingTable: [
      { tier: 'Private Solo Hut Expedition', rate: '$1,550 USD' },
      { tier: 'Standard Rate (2–4 Climbers)', rate: '$1,290 / person' },
      { tier: 'Group Rate (5+ Climbers pool)', rate: '$1,180 / person' },
      { tier: 'Children cabin promo (Ages 10–14)', rate: '$950 USD' }
    ],
    faqs: [
      { q: 'Are there charging points or hot showers inside the huts?', a: 'Some communal dining halls in Mandara and Horombo huts have basic solar-charging panels for phones. There are no showers on the mountain; our porters supply bowls of warm wash water to your cabins daily!' },
      { q: 'Is the 5-day option available?', a: 'Yes, but success rates drop beneath 50% due to altitude sickness. Out of safety, we only offer the 6-day profile which features a critical acclimatization day at Horombo Hut.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1433052/pexels-photo-1450352.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    seoMetadata: {
      title: 'Kilimanjaro Marangu Route Hut Hike | 6-Day Coca-Cola Trail',
      desc: 'Climb Mount Kilimanjaro via the classic 6-day Marangu Route. Experience the only trail offering cozy solar-powered wooden mountain cabins.',
      keywords: ['Marangu Route Climb', 'Coca Cola Route Kilimanjaro', 'Horombo Hut Kilimanjaro', 'Kilimanjaro mountain cabin tours', 'Mount Kilimanjaro Hikes']
    },
    itinerary: [
      { day: 'Day 1', title: 'Marangu Gate (1,870m) to Mandara Hut (2,700m)', activity: 'A pleasant 4-hour walk through deep green rainforests to reach the historic Mandara cabins.' },
      { day: 'Day 2', title: 'Mandara Hut (2,700m) to Horombo Hut (3,720m)', activity: 'Traverse moorland landscapes with beautiful panoramas of Mawenzi and Kibo peaks. Sleep in clean wooden huts.' },
      { day: 'Day 3', title: 'Horombo Hut Acclimatization Day (Mawenzi Walk)', activity: 'Spend the day practicing active acclimatization. Take an elegant day hike to Mawenzi Ridge or Zebra Rocks, then return.' },
      { day: 'Day 4', title: 'Horombo Hut (3,720m) to Kibo Hut (4,700m)', activity: 'Trek through the alpine desert saddle between Mawenzi and Kibo peaks, resting early to prepare for the midnight push.' },
      { day: 'Day 5', title: 'Kibo Hut (4,700m) to Uhuru Peak (5,895m) to Horombo Hut (3,720m)', activity: 'Summit Night! Push through steep frozen scree starting at midnight. Reach Gillman’s Point (5,685m) at sunrise, then step onto Uhuru Peak.' },
      { day: 'Day 6', title: 'Horombo Hut (3,720m) to Marangu Gate & Airport', activity: 'A gentle final loop down past the heath zones. Collect your official climbing diplomas and transfer back to your hotel.' }
    ]
  },
  {
    id: 'lemosho-route',
    name: 'Lemosho Route (Premium Route)',
    difficulty: 'Moderate / Highest Safety Success',
    duration: '8 Days / 7 Nights',
    successRate: '96% Ascent Success',
    scenicVal: 'Exceptional (Untouched forests and volcanic cathedrals)',
    basePrice: '$1,690/person',
    desc: 'The Lemosho Route is widely considered the ultimate luxury trail up Mount Kilimanjaro. It starts on the quiet western rainforest slopes, then merges into the Shira Plateau. With a generous 8-day profile, it features the most natural and gradual acclimatization curve, yielding the mountain`s highest summit success rate.',
    highlights: [
      'Lush, quiet western forests where wild antelope and birds roam',
      'The absolute highest and safest acclimatization profile on Mount Kilimanjaro',
      'Outstanding, breathtaking panoramas of the Great Barranco Wall',
      'Premium spacious tents, clean private chemical toilet setups, and dedicated dining domes',
      'Traversing the dramatic geological volcanic structures of Shira Ridge'
    ],
    bestTimeToVisit: 'January to March and June to October. Clear weather during these months provides breathtaking, unclouded mountain vistas.',
    whatToBring: [
      'Rating down sleeping bag (certified -15°C comfort recommended)',
      'Waterproof, broken-in leather trekking boots with extra boot laces',
      'Heavy thermal ski down jacket and windproof rain gear shell',
      'Reliable headlamp with extra batteries (essential for summit night)'
    ],
    included: [
      'Return airport transportations and park transfers',
      'Spacious double-walled mountaineering tents and memory foam floor pads',
      'All high-concession entry fees, rescue taxes, and environmental levies',
      'Dedicated private mountain chef team providing premium multi-course menus',
      'Certified medical guides with emergency bottled oxygen tanks'
    ],
    excluded: [
      'Required tipping for the mountain staff and crew members',
      'Personal travel medications and required mountain summit insurance',
      'Tanzanian entry visa fees ($50–$100 country dependent)'
    ],
    pricingTable: [
      { tier: 'Private Solo Lemosho Expedition', rate: '$1,950 USD' },
      { tier: 'Standard Rate (2–4 Climbers)', rate: '$1,690 / person' },
      { tier: 'Group Rate (5+ Climbers pool)', rate: '$1,550 / person' },
      { tier: 'Children under 14 promo', rate: '$1,250 USD' }
    ],
    faqs: [
      { q: 'Is there a toilet tent included?', a: 'Yes, our premium Lemosho packages include private, highly sanitary mobile chemical toilet tents with privacy screens at every camp.' },
      { q: 'What is the standard summit success rate?', a: 'Because the 8-day progression features a natural and gradual acclimatization curve, Lemosho boasts Mount Kilimanjaro`s highest summit success rate, over 96%!' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1433052/pexels-photo-1450352.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    seoMetadata: {
      title: 'Kilimanjaro Lemosho Route Climb | 8-Day Premium Trail',
      desc: 'Climb Mount Kilimanjaro via the scenic 8-day Lemosho Route. Complete all-inclusive premium expedition with the highest summit success rates.',
      keywords: ['Lemosho Route Kilimanjaro', 'Premium Kilimanjaro Climb', '8-Day Lemosho Hike', 'Kilimanjaro western slopes', 'Uhuru Peak Treks']
    },
    itinerary: [
      { day: 'Day 1', title: 'Londorossi Gate (2,100m) to Mti Mkubwa (2,650m)', activity: 'A peaceful, uncrowded walk through pristine rainforests to reach the "Big Tree" camp.' },
      { day: 'Day 2', title: 'Mti Mkubwa (2,650m) to Shira 1 Camp (3,500m)', activity: 'A steady climb through heather zones, crossing volcanic ridges to sleep on the west Shira Plateau.' },
      { day: 'Day 3', title: 'Shira 1 Camp (3,500m) to Shira 2 Camp (3,840m)', activity: 'Traverse the Shira caldera flat lands and cathedral peaks, marveling at the spectacular sunset views over Mount Meru.' },
      { day: 'Day 4', title: 'Shira 2 Camp to Lava Tower (4,630m) to Barranco Camp (3,960m)', activity: 'Acclimatize at Lava Tower (4,630m), then enjoy the scenic descent into the beautiful Barranco Valley.' },
      { day: 'Day 5', title: 'Barranco Camp (3,960m) to Karanga Camp (3,963m)', activity: 'Tackle the fun scrambles of the Barranco Wall, then hike past giant lobelia gardens.' },
      { day: 'Day 6', title: 'Karanga Camp (3,963m) to Barafu Camp (4,640m)', activity: 'Move over rocky barren desert terrains, resting early to prepare for the midnight summit assault.' },
      { day: 'Day 7', title: 'Barafu Camp (4,640m) to Uhuru Peak (5,895m) to Mweka Camp (3,100m)', activity: 'Summit Day! Push through frozen ash fields to Uhuru Peak, celebrate on the summit, then descend to Mweka.' },
      { day: 'Day 8', title: 'Mweka Camp (3,100m) to Mweka Gate & JRO Airport', activity: 'A final gentle loop down past forest canopies. Retrieve your climbing diplomas and safely transfer.' }
    ]
  }
];

export default function Kilimanjaro({ navigate }: KilimanjaroProps) {
  const { trackWhatsAppClick } = useAnalytics();
  const scrollY = useScrollY();
  const [openRoute, setOpenRoute] = useState<string | null>(null);

  const content = getSiteContent();
  const bgImages = content.kilimanjaroBgImages && content.kilimanjaroBgImages.length > 0
    ? content.kilimanjaroBgImages
    : [
        'https://images.unsplash.com/photo-1589553460730-dfeb1e41d8e1?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1600&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80'
      ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bgImages.length);
    }, 5000); // auto-slide every 5 seconds
    return () => clearInterval(timer);
  }, [bgImages.length]);

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      
      {/* Hero Header with auto-slide background and dark gradient overlay */}
      <section className="relative h-[55vh] flex items-center justify-center overflow-hidden">
        {/* Background images */}
        <div className="absolute inset-0 z-0" style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.15)` }}>
          {bgImages.map((img, index) => (
            <div
              key={index}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
              style={{
                backgroundImage: `url('${img}')`,
                opacity: index === activeSlide ? 1 : 0,
              }}
            />
          ))}
          {/* Dark gradient overlay for high contrast and luxury readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-zinc-950/95" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl space-y-3" style={{ transform: `translateY(-${scrollY * 0.1}px)` }}>
          <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/15 px-4 py-2 rounded-full border border-[#D4A017]/25 inline-block">
            🏔️ Mount Kilimanjaro Treks — 5,895m
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Roof of Africa Climb
          </h1>
          <p className="text-sm md:text-base text-zinc-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Ascend the highest volcano and free-standing mountain peak in the world. Walk under pristine glaciers with experienced, KPAP-compliant ethical native crews.
          </p>
        </div>
      </section>

      {/* Safety standards */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4 items-start">
            <Shield className="w-10 h-10 text-[#0B3B8C] shrink-0" />
            <div>
              <h4 className="font-extrabold text-[#0B3B8C] text-sm">Oxygen-Supported Safeties</h4>
              <p className="text-gray-500 text-xs mt-1">Our certified guides carry pulse oximeters, emergency hyperbaric bottled oxygen tanks, and coordinate direct helicopter evacuations.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <Star className="w-10 h-10 text-[#D4A017] shrink-0" />
            <div>
              <h4 className="font-extrabold text-[#0B3B8C] text-sm">KPAP-Compliant Ethical Porting</h4>
              <p className="text-gray-500 text-xs mt-1">We pay high wages under Kilimanjaro Porters Assistance Project standards, guaranteeing warm tents, clothing, and healthy food rations.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <CheckCircle className="w-10 h-10 text-[#0B3B8C] shrink-0" />
            <div>
              <h4 className="font-extrabold text-[#0B3B8C] text-sm">Optimal Acclimatization</h4>
              <p className="text-gray-500 text-xs mt-1">Our 7 and 8-day expedition profiles prioritize healthy paced acclimatization, resulting in outstanding Uhuru Peak climbing success.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Routes listing */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Select Climbing Routes
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Compare differences between our professional 6, 7, and 8-day premium trails up Mount Kilimanjaro, then click to expand itineraries.
            </p>
          </div>

          <div className="space-y-6">
            {routesData.map((route, idx) => {
              const isExpanded = openRoute === route.id;
              return (
                <div key={idx} className="bg-white border border-gray-150 rounded-2xl shadow-sm p-6 space-y-4 transition-all hover:shadow-md">
                  <button
                    type="button"
                    onClick={() => setOpenRoute(isExpanded ? null : route.id)}
                    className="w-full text-left flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-grow">
                      <h3 className="font-extrabold text-[#0B3B8C] text-lg lg:text-xl flex items-center gap-2">
                        <Sparkles size={16} className="text-[#D4A017]" /> {route.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <span>Duration: <strong className="text-[#D4A017]">{route.duration}</strong></span>
                        <span>Success Rate: <strong className="text-green-600">{route.successRate}</strong></span>
                        <span>Difficulty: <strong className="text-[#0B3B8C]">{route.difficulty}</strong></span>
                      </div>
                    </div>
                    <div className="text-gray-400 shrink-0">
                      {isExpanded ? <ChevronUp size={22} className="text-[#D4A017]" /> : <ChevronDown size={22} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="pt-6 border-t border-gray-100 animate-fade-in space-y-6">
                      <p className="text-gray-650 text-sm leading-relaxed font-medium">
                        {route.desc}
                      </p>

                      {/* Day-by-day Itinerary */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest">Day-by-Day Progression Description</h4>
                        <div className="space-y-4">
                          {route.itinerary.map((it, idx) => (
                            <div key={idx} className="bg-neutral-50 rounded-xl p-4 border border-gray-100 flex gap-3 items-start">
                              <span className="bg-[#D4A017] text-[#0A1224] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md mt-0.5">
                                {it.day}
                              </span>
                              <div>
                                <h5 className="font-extrabold text-[#0B3B8C] text-xs md:text-sm">{it.title}</h5>
                                <p className="text-gray-500 text-[11px] md:text-xs leading-relaxed mt-1 font-medium">{it.activity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest">Selected Highlights</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {route.highlights.map((hlt, i) => (
                            <div key={i} className="flex gap-2 text-xs text-gray-650 font-medium">
                              <Check size={14} className="text-[#D4A017] mt-0.5 shrink-0" />
                              <span>{hlt}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Inclusions & Exclusions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-4 border border-gray-150 space-y-3">
                          <h4 className="font-extrabold text-green-700 text-xs uppercase tracking-widest pb-1 border-b border-green-100 flex items-center gap-1">
                            <Check size={14} /> Full Inclusions
                          </h4>
                          <ul className="space-y-2">
                            {route.included.map((inc, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-gray-550 font-medium">
                                <Check size={12} className="text-green-500 mt-1 shrink-0" />
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-150 space-y-3">
                          <h4 className="font-extrabold text-red-700 text-xs uppercase tracking-widest pb-1 border-b border-red-100 flex items-center gap-1">
                            <X size={14} /> Exclusions
                          </h4>
                          <ul className="space-y-2">
                            {route.excluded.map((exc, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-gray-550 font-medium">
                                <X size={12} className="text-red-400 mt-1 shrink-0" />
                                <span>{exc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Pack list */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                          <List size={14} className="text-[#D4A017]" /> Essential Gear & Pack Checklist
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-550 font-medium">
                          {route.whatToBring.map((gear, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-neutral-50 px-3 py-2 rounded-lg border border-gray-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] shrink-0" />
                              <span>{gear}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing matrix */}
                      <div className="bg-[#0B3B8C]/5 rounded-xl p-5 border border-[#0B3B8C]/15 space-y-3">
                        <h4 className="text-xs font-extrabold text-[#0B3B8C] uppercase tracking-widest">Climbing Cost & Rate Matrix</h4>
                        <div className="divide-y divide-zinc-200">
                          {route.pricingTable.map((priceTier, i) => (
                            <div key={i} className="flex justify-between items-center py-2 text-xs font-bold font-medium text-gray-700">
                              <span>{priceTier.tier}</span>
                              <span className="text-[#0B3B8C] font-black">{priceTier.rate}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* FAQs */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                          <HelpCircle size={14} className="text-[#D4A017]" /> Route Specific Advisories
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {route.faqs.map((faq, idx) => (
                            <div key={idx} className="bg-[#D4A017]/5 rounded-xl p-4 border border-[#D4A017]/10 space-y-1">
                              <h5 className="font-extrabold text-[#0B3B8C] text-xs">Q: {faq.q}</h5>
                              <p className="text-gray-500 text-[11px] leading-relaxed font-medium">A: {faq.a}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Photo Landscapes */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                          <ImageIcon size={14} className="text-[#D4A017]" /> Alpine Landscapes Gallery
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {route.gallery.map((url, i) => (
                            <div key={i} className="h-20 sm:h-32 rounded-xl overflow-hidden border border-gray-200">
                              <ProgressiveImage src={url} alt={`Landscape ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Search SEO pane */}
                      <div className="bg-[#0B1E3D] text-[#D4A017] p-4 rounded-xl font-mono text-[10px]">
                        <span className="text-white block font-bold mb-1">🔗 SEO SEARCH INDEX PARAMETERS</span>
                        <p><strong>Title:</strong> {route.seoMetadata.title}</p>
                        <p className="mt-0.5 text-zinc-300"><strong>Description:</strong> {route.seoMetadata.desc}</p>
                        <p className="mt-0.5 text-zinc-400"><strong>Keywords:</strong> {route.seoMetadata.keywords.join(', ')}</p>
                      </div>

                      {/* Conversational booking hooks */}
                      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200">
                        <p className="text-xs text-neutral-500 font-bold uppercase">Ready to talk to a mountain trek designer surcharges?</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem('booking_prefilled_category', 'kilimanjaro');
                              localStorage.setItem('booking_prefilled_tour', route.name);
                              navigate('booking', `package=${encodeURIComponent(route.name)}`);
                            }}
                            className="bg-[#D4A017] hover:bg-[#c49010] text-white font-extrabold text-xs px-5 py-3 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            Inquire & Book Route <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials and customer reviews section */}
      <section className="py-16 px-4 bg-gray-100 border-t border-b border-gray-200">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/20 inline-block">
              ⭐️ Verified Climber Testimonials
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B3B8C] tracking-tight uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
              What Our Climbers Say
            </h2>
            <p className="text-gray-500 text-xs md:text-sm max-w-lg mx-auto font-medium">
              Read verified testimonials from adventurers who conquered Uhuru Peak with our professional mountain guides.
            </p>
          </div>
          <GuestReviews navigate={navigate} />
        </div>
      </section>

      {/* Preparation Faqs section block */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <Compass className="w-10 h-10 mx-auto text-[#D4A017] mb-2" />
            <h3 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>Trek Preparation Advice</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 border space-y-2">
              <h4 className="font-extrabold text-[#0B3B8C] text-sm">When is the best time?</h4>
              <p className="text-gray-500 text-xs leading-relaxed font-medium">January to March is warmest and generally dry. June to October is cooler but offers pristine cloudless panoramas overlooking Mount Meru.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border space-y-2">
              <h4 className="font-extrabold text-[#0B3B8C] text-sm">What is included?</h4>
              <p className="text-gray-500 text-xs leading-relaxed font-medium">All mountain entry permit tickets, wilderness rescue coordination, professional certified head guides, cooks and porters, three hot nutritious meals daily, dining tents, and oxygen tanks.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border space-y-2">
              <h4 className="font-extrabold text-[#0B3B8C] text-sm">Is gear rentable?</h4>
              <p className="text-gray-500 text-xs leading-relaxed font-medium">No technical mountaineering gear or ropes are needed. You need standard trekking poles, thermal base garments, sleeping bag, and waterproof boots. We can rent gear at the base offices!</p>
            </div>
          </div>

          <div className="text-center pt-6 space-y-4">
            <p className="text-gray-500 text-sm max-w-md mx-auto">Ready to experience Mount Kilimanjaro mountaineering? Speak with our trip designers today.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigate('booking')}
                className="bg-[#0B3B8C] hover:bg-[#0a3280] text-white font-extrabold text-xs px-6 py-3.5 rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Inquire & Book <ArrowRight size={14} />
              </button>
              <a
                href="https://wa.me/255629506063?text=Hi!%20Interested%2520in%2520climbing%252520Kilimanjaro.%252520Could%252520you%25252520assist?"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('Kilimanjaro bottom section', 'Kilimanjaro Climb')}
                className="bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-xs px-6 py-3.5 rounded-full flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider"
              >
                <MessageCircle size={14} fill="white" /> WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
