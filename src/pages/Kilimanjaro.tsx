import React, { useState, useEffect, FormEvent } from 'react';
import { Page } from '../hooks/useHashRouter';
import { 
  Shield, Clock, Compass, Star, CheckCircle, ChevronDown, ChevronUp, 
  MessageCircle, ArrowRight, List, X, Check, Image as ImageIcon, 
  Sparkles, HelpCircle, MapPin, Award, Heart, HelpCircle as HelpIcon, 
  CheckSquare, Calendar, User, Info, Activity, DollarSign 
} from 'lucide-react';
import { getSiteContent } from '../lib/cmsStore';
import { useScrollY } from '../hooks/useScrollY';
import { ProgressiveImage } from '../components/ProgressiveImage';
import { useAnalytics } from '../context/AnalyticsContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { supabase } from '../lib/supabase';

interface KilimanjaroProps {
  navigate: (page: Page, id?: string) => void;
}

// 6 Kilimanjaro Routes compact specification
const routesData = [
  {
    id: 'machame-route',
    name: 'Machame Route (Whiskey Route)',
    tagline: 'The most scenic and popular route with high success rate.',
    difficulty: 'Challenging',
    duration: '7 Days / 6 Nights',
    successRate: '92%',
    scenicVal: 'Very High',
    accommodation: 'Double-walled Dome Tents',
    scenicRating: '5/5',
    basePrice: 1350,
    desc: 'The Whiskey Route is celebrated as the most scenic, dramatic, and rewarding track to Uhuru Peak. Trekkers climb the Barranco Wall and traverse the Shira Plateau. Its climb high, sleep low profile facilitates excellent acclimatization.',
    highlights: [
      'Climbing the legendary, high-adrenaline Barranco Wall',
      'Traversing Shira Plateau with crater-rim views',
      'Climbing Lava Tower (4,630m) for body acclimatization',
      'Sleeping inside premium high-altitude geodesic tents',
      'Breathtaking sunrise on the glaciers overlooking Kenya'
    ],
    bestTimeToVisit: 'Jan-Mar & Jul-Oct (Dry and clear skies).',
    whatToBring: [
      'Rating down sleeping bag (certified -10°C comfort or lower)',
      'Waterproof, broken-in trekking boots with vibram soles',
      'Four-layer heavy thermal top & bottom base clothing arrays',
      'Polarized alpine snow goggles and thermal gloves'
    ],
    included: [
      'JRO Airport transfers and park gate round-trip transport',
      'Certified licensed head guides, assistant spotters, and chefs',
      'KPAP-compliant ethical wages, warm shelters, and clothing for porters',
      '3 Nutritious hot meals prepared daily in mountain dome kitchens',
      'High-quality mountain tents, dining shelters, tables, and chairs'
    ],
    excluded: [
      'Personal gear rentals (sleeping bags, trekking poles)',
      'Tanzanian entry tourist visa fees ($50–$100)',
      'Customary mountain crew tips (suggested $15–$20 per day)'
    ],
    pricingTable: [
      { tier: 'Solo Climber Private Expedition', price: 1650 },
      { tier: 'Climber Duo Group (2 People)', price: 1450 },
      { tier: 'Team Squad Promo (3–5 climbers)', price: 1350 },
      { tier: 'Corporate Pool (6+ people)', price: 1250 }
    ],
    faqs: [
      { q: 'Is climbing the Barranco Wall dangerous?', a: 'No, it looks dramatic from below, but it is a secure climb with plenty of footholds. No ropes or technical climbing gear are needed!' },
      { q: 'Do you carry emergency medical oxygen?', a: 'Yes! Our custom medical guides carry pulse oximeters, emergency bottled medical oxygen, and first-aid trauma bags on every trek.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1589553460730-dfeb1e41d8e1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80'
    ],
    itinerary: [
      { day: 'Day 1', title: 'Machame Gate (1,800m) to Machame Camp (2,835m)', time: '5-6 hrs', elevation: '1,800m to 2,835m', accommodation: 'Machame Camp', meals: 'L, D', activity: 'A pleasant walk through the dense rainforest belt with opportunities to spot blue monkeys and colobus monkeys.' },
      { day: 'Day 2', title: 'Machame Camp (2,835m) to Shira 2 Camp (3,840m)', time: '4-5 hrs', elevation: '2,835m to 3,840m', accommodation: 'Shira 2 Camp', meals: 'B, L, D', activity: 'Leave the trees for the steep heather moorlands. Traverse rocky ridges and sleep on the high Shira Plateau.' },
      { day: 'Day 3', title: 'Shira 2 Camp to Lava Tower (4,630m) to Barranco Camp (3,960m)', time: '6-7 hrs', elevation: '3,840m to 4,630m to 3,960m', accommodation: 'Barranco Camp', meals: 'B, L, D', activity: 'A crucial acclimatization step! Climb to the massive Lava Tower, then descend into the beautiful Barranco Valley.' },
      { day: 'Day 4', title: 'Barranco Camp (3,960m) to Karanga Camp (3,963m)', time: '4-5 hrs', elevation: '3,960m to 3,963m', accommodation: 'Karanga Camp', meals: 'B, L, D', activity: 'Tackle the fun Barranco Wall scramble, then walk past giant lobelias to reach the alpine desert Karanga camp.' },
      { day: 'Day 5', title: 'Karanga Camp (3,963m) to Barafu Camp (4,640m)', time: '3-4 hrs', elevation: '3,963m to 4,640m', accommodation: 'Barafu Camp', meals: 'B, L, D', activity: 'Move over rocky barren desert fields. Rest early to prepare for the midnight summit assault.' },
      { day: 'Day 6', title: 'Barafu Camp (4,640m) to Uhuru Peak (5,895m) to Mweka Camp (3,100m)', time: '11-14 hrs', elevation: '4,640m to 5,895m to 3,100m', accommodation: 'Mweka Camp', meals: 'B, L, D', activity: 'Summit Night! Push through steep ash scree starting at midnight. Stand on the Roof of Africa for sunrise, then descend.' },
      { day: 'Day 7', title: 'Mweka Camp (3,100m) to Mweka Gate (1,630m) & transfer', time: '3-4 hrs', elevation: '3,100m to 1,630m', accommodation: 'Hotel (Arusha)', meals: 'B, L', activity: 'A final gentle descent through rainforests. Receive official Gold Peak Diplomas and transfer back.' }
    ]
  },
  {
    id: 'marangu-route',
    name: 'Marangu Route (Coca-Cola Route)',
    tagline: 'The classic pathway featuring comfortable A-frame wooden sleeping huts.',
    difficulty: 'Moderate',
    duration: '6 Days / 5 Nights',
    successRate: '82%',
    scenicVal: 'High',
    accommodation: 'Solar-Powered Huts',
    scenicRating: '4/5',
    basePrice: 1290,
    desc: 'The Marangu Route is the classic pathway up Mount Kilimanjaro. It is famous for being the only path providing solar-powered wooden sleeping huts instead of tents, making it physically gentler and highly accessible.',
    highlights: [
      'Sleeping inside comfortable A-frame wooden chalets with solar power',
      'The gentlest and most direct trail gradient up Mount Kilimanjaro',
      'Highly accessible option with no camping required',
      'Panoramic walks through the Mawenzi peak volcanic saddle',
      'Walking past stunning high-altitude heather gardens'
    ],
    bestTimeToVisit: 'July to November and January to March to avoid muddy trails.',
    whatToBring: [
      'Premium winter thermal sleep liners for the cabin beds',
      'Comfortable lightweight indoor slippers or crocs for the huts',
      'Warm down jackets and fleece layers for high-frigid base summits',
      'Sturdy hiking poles for steep ash descents'
    ],
    included: [
      'All JRO Airport road transfers and park transport permits',
      'All national park gate entry and rescue tax allowances',
      'Shared accommodation beds inside Mandara, Horombo, and Kibo huts',
      'All hot chef-cooked breakfasts, trail lunches, and hot dinners',
      'Highly licensed head guides, assistant spotters, porters and cooks'
    ],
    excluded: [
      'Personal winter sleeping bags and trekking poles',
      'Customary tips for the mountain crew members',
      'Personal travel medications and summit insurance'
    ],
    pricingTable: [
      { tier: 'Solo Climber Private Expedition', price: 1550 },
      { tier: 'Climber Duo Group (2 People)', price: 1390 },
      { tier: 'Standard Group Rate (3–5 climbers)', price: 1290 },
      { tier: 'Large Team Promo (6+ people)', price: 1180 }
    ],
    faqs: [
      { q: 'Are there charging points or hot showers inside the huts?', a: 'Some communal dining halls have basic solar-charging panels. There are no showers; our crew supplies bowls of warm wash water to your cabins daily!' },
      { q: 'Is the 5-day option available?', a: 'Yes, but success rates drop beneath 50%. Out of safety, we only offer the 6-day profile which features a critical acclimatization day at Horombo Hut.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80'
    ],
    itinerary: [
      { day: 'Day 1', title: 'Marangu Gate (1,870m) to Mandara Hut (2,700m)', time: '4 hrs', elevation: '1,870m to 2,700m', accommodation: 'Mandara Hut', meals: 'L, D', activity: 'A pleasant 4-hour walk through deep green rainforests to reach the historic Mandara cabins.' },
      { day: 'Day 2', title: 'Mandara Hut (2,700m) to Horombo Hut (3,720m)', time: '6 hrs', elevation: '2,700m to 3,720m', accommodation: 'Horombo Hut', meals: 'B, L, D', activity: 'Traverse moorland landscapes with beautiful panoramas of Mawenzi and Kibo peaks. Sleep in clean wooden huts.' },
      { day: 'Day 3', title: 'Horombo Hut Acclimatization Day (Mawenzi Walk)', time: '3 hrs', elevation: '3,720m (acclimatization)', accommodation: 'Horombo Hut', meals: 'B, L, D', activity: 'Spend the day practicing active acclimatization. Take an elegant day hike to Mawenzi Ridge or Zebra Rocks, then return.' },
      { day: 'Day 4', title: 'Horombo Hut (3,720m) to Kibo Hut (4,700m)', time: '5-6 hrs', elevation: '3,720m to 4,700m', accommodation: 'Kibo Hut', meals: 'B, L, D', activity: 'Trek through the alpine desert saddle between Mawenzi and Kibo peaks, resting early to prepare for the midnight push.' },
      { day: 'Day 5', title: 'Kibo Hut (4,700m) to Uhuru Peak (5,895m) to Horombo Hut (3,720m)', time: '11-13 hrs', elevation: '4,700m to 5,895m to 3,720m', accommodation: 'Horombo Hut', meals: 'B, L, D', activity: 'Summit Night! Push through steep frozen scree starting at midnight. Reach Gillman’s Point (5,685m) at sunrise, then step onto Uhuru Peak.' },
      { day: 'Day 6', title: 'Horombo Hut (3,720m) to Marangu Gate & transfer', time: '5-6 hrs', elevation: '3,720m to 1,870m', accommodation: 'Hotel (Arusha)', meals: 'B, L', activity: 'A gentle final loop down past the heath zones. Collect your official climbing diplomas and transfer back.' }
    ]
  },
  {
    id: 'lemosho-route',
    name: 'Lemosho Route (Premium Route)',
    tagline: 'The ultimate luxury trail starting from the quiet, wild western slopes.',
    difficulty: 'Moderate / High Success',
    duration: '8 Days / 7 Nights',
    successRate: '96%',
    scenicVal: 'Exceptional',
    accommodation: 'Premium Dome Tents',
    scenicRating: '5/5',
    basePrice: 1690,
    desc: 'The Lemosho Route is widely considered the ultimate premium trail up Mount Kilimanjaro. It starts on the quiet western rainforest slopes, then merges into the Shira Plateau, offering a gradual acclimatization curve.',
    highlights: [
      'Lush, quiet western forests where wild antelope and birds roam',
      'The absolute highest and safest acclimatization profile on Mount Kilimanjaro',
      'Outstanding, breathtaking panoramas of the Great Barranco Wall',
      'Premium spacious tents, private chemical toilets, and dedicated dining domes',
      'Traversing the dramatic geological volcanic structures of Shira Ridge'
    ],
    bestTimeToVisit: 'January to March and June to October for pristine unclouded mountain vistas.',
    whatToBring: [
      'Rating down sleeping bag (certified -15°C comfort recommended)',
      'Waterproof, broken-in leather trekking boots with extra laces',
      'Heavy thermal ski down jacket and windproof rain gear shell',
      'Reliable headlamp with extra batteries for summit night'
    ],
    included: [
      'Airport meet & greet transfers and park entry transportations',
      'Spacious double-walled mountaineering tents and memory foam floor pads',
      'All high-concession entry fees, rescue taxes, and environmental levies',
      'Dedicated private chef team providing premium multi-course menus',
      'Certified medical guides with emergency bottled oxygen tanks'
    ],
    excluded: [
      'Customary tips for the mountain porters and crew members',
      'Personal travel medications and required mountain summit insurance',
      'Tanzanian entry visa fees ($50–$100)'
    ],
    pricingTable: [
      { tier: 'Solo Climber Private Expedition', price: 1950 },
      { tier: 'Climber Duo Group (2 People)', price: 1790 },
      { tier: 'Standard Group Rate (3–5 climbers)', price: 1690 },
      { tier: 'Large Team Promo (6+ people)', price: 1550 }
    ],
    faqs: [
      { q: 'Is a toilet tent included?', a: 'Yes, our premium Lemosho packages include private, highly sanitary mobile chemical toilet tents with privacy screens at every camp.' },
      { q: 'What is the standard summit success rate?', a: 'Because the 8-day progression features a natural and gradual acclimatization curve, Lemosho boasts Mount Kilimanjaro’s highest summit success rate, over 96%!' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80'
    ],
    itinerary: [
      { day: 'Day 1', title: 'Londorossi Gate (2,100m) to Mti Mkubwa (2,650m)', time: '3-4 hrs', elevation: '2,100m to 2,650m', accommodation: 'Mti Mkubwa Camp', meals: 'L, D', activity: 'A peaceful, uncrowded walk through pristine rainforests to reach the "Big Tree" camp.' },
      { day: 'Day 2', title: 'Mti Mkubwa (2,650m) to Shira 1 Camp (3,500m)', time: '5-6 hrs', elevation: '2,650m to 3,500m', accommodation: 'Shira 1 Camp', meals: 'B, L, D', activity: 'A steady climb through heather zones, crossing volcanic ridges to sleep on the west Shira Plateau.' },
      { day: 'Day 3', title: 'Shira 1 Camp (3,500m) to Shira 2 Camp (3,840m)', time: '4 hrs', elevation: '3,500m to 3,840m', accommodation: 'Shira 2 Camp', meals: 'B, L, D', activity: 'Traverse the Shira caldera flat lands and cathedral peaks, marveling at the spectacular sunset views over Mount Meru.' },
      { day: 'Day 4', title: 'Shira 2 Camp to Lava Tower (4,630m) to Barranco Camp (3,960m)', time: '6-7 hrs', elevation: '3,840m to 4,630m to 3,960m', accommodation: 'Barranco Camp', meals: 'B, L, D', activity: 'Acclimatize at Lava Tower (4,630m), then enjoy the scenic descent into the beautiful Barranco Valley.' },
      { day: 'Day 5', title: 'Barranco Camp (3,960m) to Karanga Camp (3,963m)', time: '4-5 hrs', elevation: '3,960m to 3,963m', accommodation: 'Karanga Camp', meals: 'B, L, D', activity: 'Tackle the fun scrambles of the Barranco Wall, then hike past giant lobelia gardens.' },
      { day: 'Day 6', title: 'Karanga Camp (3,963m) to Barafu Camp (4,640m)', time: '3-4 hrs', elevation: '3,963m to 4,640m', accommodation: 'Barafu Camp', meals: 'B, L, D', activity: 'Move over rocky barren desert terrains, resting early to prepare for the midnight summit assault.' },
      { day: 'Day 7', title: 'Barafu Camp (4,640m) to Uhuru Peak (5,895m) to Mweka Camp (3,100m)', time: '11-14 hrs', elevation: '4,640m to 5,895m to 3,100m', accommodation: 'Mweka Camp', meals: 'B, L, D', activity: 'Summit Day! Push through frozen ash fields to Uhuru Peak, celebrate on the summit, then descend to Mweka.' },
      { day: 'Day 8', title: 'Mweka Camp (3,100m) to Mweka Gate & transfer', time: '3-4 hrs', elevation: '3,100m to 1,630m', accommodation: 'Hotel (Arusha)', meals: 'B, L', activity: 'A final gentle loop down past forest canopies. Retrieve your climbing diplomas and safely transfer.' }
    ]
  },
  {
    id: 'rongai-route',
    name: 'Rongai Route (Northern Slopes)',
    tagline: 'The only path approaching from the quiet northern slopes near Kenya.',
    difficulty: 'Moderate',
    duration: '6 Days / 5 Nights',
    successRate: '85%',
    scenicVal: 'High',
    accommodation: 'Camping Tents',
    scenicRating: '4/5',
    basePrice: 1390,
    desc: 'Rongai is the only route approaching Kilimanjaro from the north. It experiences significantly less rainfall, making it the perfect choice during the wetter months.',
    highlights: [
      'Quiet, uncrowded trails with high chances of spotting wild elephant',
      'Approaching from the drier northern side of the mountain',
      'Panoramic descent via the Marangu Route on the southern side',
      'Gentle gradients that are easy on the knees',
      'Wild wilderness camping under clear star-filled skies'
    ],
    bestTimeToVisit: 'Year-round. Exceptional during the green season (April, May, November).',
    whatToBring: [
      'Comfortable down sleeping bag (comfort rating -10°C)',
      'Waterproof, breathable jacket and pants shell',
      'Sturdy leather trekking boots'
    ],
    included: [
      'Roundtrip airport and gate transfers',
      'Professional certified wilderness guide crew',
      'Camping tents and double-thick foam mattresses',
      'Chef-cooked nutritious high-energy meals daily'
    ],
    excluded: [
      'Customary mountain tips for the guides and porters',
      'Personal travel medications and summit-grade insurance'
    ],
    pricingTable: [
      { tier: 'Solo Private Expedition', price: 1690 },
      { tier: 'Climber Duo Group (2 People)', price: 1490 },
      { tier: 'Standard Group Rate (3–5 climbers)', price: 1390 },
      { tier: 'Large Team Promo (6+ people)', price: 1290 }
    ],
    faqs: [
      { q: 'Why choose the Northern side?', a: 'The northern slopes are rain-shadowed, meaning they are much drier and calmer during the wetter months.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80'
    ],
    itinerary: [
      { day: 'Day 1', title: 'Rongai Gate (1,950m) to First Cave Camp (2,620m)', time: '3-4 hrs', elevation: '1,950m to 2,620m', accommodation: 'First Cave Camp', meals: 'L, D', activity: 'A gentle hike starting from fields through pine forests where black and white colobus monkeys live.' },
      { day: 'Day 2', title: 'First Cave Camp to Kikelelwa Camp (3,600m)', time: '6-7 hrs', elevation: '2,620m to 3,600m', accommodation: 'Kikelelwa Camp', meals: 'B, L, D', activity: 'Hike through open moorland towards the jagged Mawenzi peak, enjoying magnificent valley vistas.' },
      { day: 'Day 3', title: 'Kikelelwa Camp to Mawenzi Tarn Camp (4,330m)', time: '3-4 hrs', elevation: '3,600m to 4,330m', accommodation: 'Mawenzi Tarn Camp', meals: 'B, L, D', activity: 'A short but steep climb up grassy slopes. Camp is beautifully located in a volcanic bowl next to a tarn lake.' },
      { day: 'Day 4', title: 'Mawenzi Tarn Camp to Kibo Hut (4,700m)', time: '5-6 hrs', elevation: '4,330m to 4,700m', accommodation: 'Kibo Hut', meals: 'B, L, D', activity: 'Cross the barren alpine desert saddle between Mawenzi and Kibo. Rest early for the midnight summit push.' },
      { day: 'Day 5', title: 'Kibo Hut (4,700m) to Uhuru Peak (5,895m) to Horombo Hut (3,720m)', time: '11-13 hrs', elevation: '4,700m to 5,895m to 3,720m', accommodation: 'Horombo Hut', meals: 'B, L, D', activity: 'Push through frozen scree starting at midnight. Reach Gillman’s Point at sunrise, walk around the crater rim to Uhuru Peak, then descend.' },
      { day: 'Day 6', title: 'Horombo Hut (3,720m) to Marangu Gate & transfer', time: '5-6 hrs', elevation: '3,720m to 1,870m', accommodation: 'Hotel (Arusha)', meals: 'B, L', activity: 'Gentle final descent through lush forest. Collect your climbing certificate and transfer back.' }
    ]
  },
  {
    id: 'northern-circuit',
    name: 'Northern Circuit (Longest Route)',
    tagline: 'The newest, longest, and most comprehensive route with 98% success rate.',
    difficulty: 'Extreme Endurance',
    duration: '9 Days / 8 Nights',
    successRate: '98%',
    scenicVal: 'Outstanding',
    accommodation: 'Camping Tents',
    scenicRating: '5/5',
    basePrice: 1890,
    desc: 'The Northern Circuit is the ultimate, longest route on Mount Kilimanjaro. It circles the high northern slopes, offering 360-degree vistas and virtually 100% acclimatization.',
    highlights: [
      'The longest route with the absolute highest success rate (98%)',
      'Traversing nearly 360 degrees of the mountain’s dramatic upper slopes',
      'Spectacular views over the remote northern face and Kenyan plains',
      'Virtually uncrowded trails for an exclusive private adventure feeling',
      'Unrivaled alpine desert scenery and glacier vistas'
    ],
    bestTimeToVisit: 'January to March and June to October (highly stable weather).',
    whatToBring: [
      'Heavy-duty alpine down sleeping bag (certified -15°C comfort)',
      'Windproof, waterproof outer shell and multiple dry fleece layers',
      'Comfortable hiking backpack and reliable water filters'
    ],
    included: [
      'All airport meet-greet road transfers and private 4x4 resort transport',
      'Double-walled extreme mountain tents and thick foam floor pads',
      'Certified high-altitude guides carrying hyperbaric oxygen chambers',
      '3 gourmet chef-cooked high-energy hot meals prepared daily'
    ],
    excluded: [
      'Tipping split among mountain porters and crew',
      'Personal medical high-altitude summit insurance and entry visas'
    ],
    pricingTable: [
      { tier: 'Private Solo Expedition', price: 2190 },
      { tier: 'Climber Duo Group (2 People)', price: 1990 },
      { tier: 'Standard Group Rate (3–5 climbers)', price: 1890 },
      { tier: 'Large Team Promo (6+ people)', price: 1750 }
    ],
    faqs: [
      { q: 'Why does it have a 98% success rate?', a: 'Because it takes 9 full days! The extremely gradual vertical progression gives the human body plenty of biological time to acclimatize.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1589553460730-dfeb1e41d8e1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80'
    ],
    itinerary: [
      { day: 'Day 1', title: 'Londorossi Gate (2,100m) to Mti Mkubwa (2,650m)', time: '3-4 hrs', elevation: '2,100m to 2,650m', accommodation: 'Mti Mkubwa Camp', meals: 'L, D', activity: 'A pleasant first day hiking through quiet pristine rainforests.' },
      { day: 'Day 2', title: 'Mti Mkubwa to Shira 1 Camp (3,500m)', time: '5-6 hrs', elevation: '2,650m to 3,500m', accommodation: 'Shira 1 Camp', meals: 'B, L, D', activity: 'Climb through heather moorland zones, crossing rocky ridges to sleep on Shira Plateau.' },
      { day: 'Day 3', title: 'Shira 1 Camp to Shira 2 Camp (3,840m)', time: '3-4 hrs', elevation: '3,500m to 3,840m', accommodation: 'Shira 2 Camp', meals: 'B, L, D', activity: 'A gentle scenic hike across the plateau with panoramic views.' },
      { day: 'Day 4', title: 'Shira 2 Camp to Lava Tower to Moir Hut (4,200m)', time: '6-7 hrs', elevation: '3,840m to 4,630m to 4,200m', accommodation: 'Moir Hut', meals: 'B, L, D', activity: 'Hike to Lava Tower for acclimatization, then detour north to the secluded Moir Hut.' },
      { day: 'Day 5', title: 'Moir Hut to Buffalo Camp (4,020m)', time: '5-6 hrs', elevation: '4,200m to 4,020m', accommodation: 'Buffalo Camp', meals: 'B, L, D', activity: 'Trek up out of Moir Valley, looping around the high northern slopes with views of Kenya.' },
      { day: 'Day 6', title: 'Buffalo Camp to Third Cave (3,875m)', time: '5-6 hrs', elevation: '4,020m to 3,875m', accommodation: 'Third Cave Camp', meals: 'B, L, D', activity: 'A scenic trek through remote high valleys, crossing dry watercourses and alpine fields.' },
      { day: 'Day 7', title: 'Third Cave to School Hut (4,750m)', time: '4-5 hrs', elevation: '3,875m to 4,750m', accommodation: 'School Hut', meals: 'B, L, D', activity: 'A steady climb up into the alpine desert zone, reaching School Hut by early afternoon to rest.' },
      { day: 'Day 8', title: 'School Hut (4,750m) to Uhuru Peak (5,895m) to Mweka Camp (3,100m)', time: '12-15 hrs', elevation: '4,750m to 5,895m to 3,100m', accommodation: 'Mweka Camp', meals: 'B, L, D', activity: 'Summit Day! Push to the crater rim at sunrise. Walk to Uhuru Peak, celebrate, then descend to Mweka Camp.' },
      { day: 'Day 9', title: 'Mweka Camp to Mweka Gate & transfer', time: '3-4 hrs', elevation: '3,100m to 1,630m', accommodation: 'Hotel (Arusha)', meals: 'B, L', activity: 'A final gentle loop down forest trails. Collect climbing certificates and transfer to JRO Airport.' }
    ]
  },
  {
    id: 'umbwe-route',
    name: 'Umbwe Route (Steep & Direct)',
    tagline: 'The most direct, steepest, and physically challenging trail up the mountain.',
    difficulty: 'Extreme',
    duration: '6 Days / 5 Nights',
    successRate: '70%',
    scenicVal: 'High (Dramatic)',
    accommodation: 'Camping Tents',
    scenicRating: '4/5',
    basePrice: 1250,
    desc: 'Umbwe is famous as the most demanding, direct, and steepest path on the mountain. It is recommended only for experienced, physically strong high-altitude climbers.',
    highlights: [
      'Extremely steep, high-adrenaline narrow ridge lines and vertical forests',
      'Completely quiet, wild, and uncrowded path with zero traffic',
      'Incredible, dramatic views of the southern glaciers of Kibo',
      'Merging with the Machame route for summit preparation at Barafu Camp',
      'The ultimate test of pure cardiovascular endurance and hiking strength'
    ],
    bestTimeToVisit: 'January to March and June to October. Highly challenging in wet seasons.',
    whatToBring: [
      'Waterproof mountain leather trekking boots with vibram grip',
      'Heavy-duty hiking poles to protect knees on steep descents',
      'Quality thermal underwear arrays and certified warm sleep bags'
    ],
    included: [
      'Roundtrip airport and hotel shuttle logistics',
      'Certified high-altitude guide team carrying rescue oxygen',
      'Spacious double-layer dome tents and foam sleeping pads',
      'All high-energy chef-cooked breakfasts, trail lunches, and hot dinners'
    ],
    excluded: [
      'Mountain crew gratuities and customary tips',
      'Personal entry visas and mandatory mountain summit insurance'
    ],
    pricingTable: [
      { tier: 'Solo Private Expedition', price: 1450 },
      { tier: 'Climber Duo Group (2 People)', price: 1350 },
      { tier: 'Standard Group Rate (3–5 climbers)', price: 1250 },
      { tier: 'Large Team Promo (6+ people)', price: 1150 }
    ],
    faqs: [
      { q: 'Is Umbwe suitable for beginners?', a: 'No, Umbwe ascends very rapidly, which increases the risk of altitude sickness. It is designed for experienced mountaineers.' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=600&q=80'
    ],
    itinerary: [
      { day: 'Day 1', title: 'Umbwe Gate (1,600m) to Umbwe Cave Camp (2,850m)', time: '5-6 hrs', elevation: '1,600m to 2,850m', accommodation: 'Umbwe Cave Camp', meals: 'L, D', activity: 'A steep, challenging climb through winding mossy rainforest paths along narrow ridge lines.' },
      { day: 'Day 2', title: 'Umbwe Cave Camp to Barranco Camp (3,960m)', time: '4-5 hrs', elevation: '2,850m to 3,960m', accommodation: 'Barranco Camp', meals: 'B, L, D', activity: 'Leave the forest. The trail climbs steeply up rocky heathers before descending into Barranco Valley.' },
      { day: 'Day 3', title: 'Barranco Camp to Karanga Camp (3,963m)', time: '4 hrs', elevation: '3,960m to 3,963m', accommodation: 'Karanga Camp', meals: 'B, L, D', activity: 'Tackle the Barranco Wall scramble, then traverse ridges to reach Karanga Camp.' },
      { day: 'Day 4', title: 'Karanga Camp to Barafu Camp (4,640m)', time: '3-4 hrs', elevation: '3,963m to 4,640m', accommodation: 'Barafu Camp', meals: 'B, L, D', activity: 'Move over rocky alpine desert plains. Rest early for the midnight summit push.' },
      { day: 'Day 5', title: 'Barafu Camp (4,640m) to Uhuru Peak (5,895m) to Mweka Camp (3,100m)', time: '11-14 hrs', elevation: '4,640m to 5,895m to 3,100m', accommodation: 'Mweka Camp', meals: 'B, L, D', activity: 'Summit Day! Climb frozen scree fields starting at midnight. Reach Uhuru Peak at sunrise, celebrate, and descend.' },
      { day: 'Day 6', title: 'Mweka Camp to Mweka Gate & transfer', time: '3-4 hrs', elevation: '3,100m to 1,630m', accommodation: 'Hotel (Arusha)', meals: 'B, L', activity: 'A final gentle walk down through the forest zone. Retrieve your official diplomas and transfer back.' }
    ]
  }
];

// Equipment checklist grouped into categories
const equipmentChecklist = [
  {
    category: 'Clothing',
    items: [
      { name: '4-layer thermal tops & bottoms', desc: 'Moisture-wicking synthetic base layers' },
      { name: 'Heavy-duty insulated down jacket', desc: 'Warm wind-resistant winter parka with hood' },
      { name: 'Waterproof gore-tex jacket & pants', desc: 'Breathable outer shell layers' },
      { name: 'Trekking pants & fleece jackets', desc: 'Mid-layer warm synthetic clothing' },
      { name: 'Thermal beanie & sun brim hat', desc: 'Protection against extreme cold and intense sun' }
    ]
  },
  {
    category: 'Footwear',
    items: [
      { name: 'Waterproof broken-in leather boots', desc: 'High ankle support with premium vibram soles' },
      { name: 'Lightweight camp shoes / crocs', desc: 'To relax your feet inside the campsite tents' },
      { name: 'Thick thermal wool trekking socks', desc: '4-5 pairs of organic wool or high-blend socks' },
      { name: 'Waterproof gaiters', desc: 'Prevents ash and water from entering your boots' }
    ]
  },
  {
    category: 'Sleeping Equipment',
    items: [
      { name: 'Extreme down sleeping bag', desc: 'Rated -15°C comfort limit or lower' },
      { name: 'Thermal sleeping bag liner', desc: 'Adds extra warmth and keeps bag clean' },
      { name: 'Inflatable pillow (Optional)', desc: 'For extra neck comfort' }
    ]
  },
  {
    category: 'Accessories & Electronics',
    items: [
      { name: 'Reliable headlamp with extra batteries', desc: 'Crucial for midnight summit assault hours' },
      { name: 'Polarized alpine snow ski goggles', desc: 'Protects eyes from intense glacial snow glare' },
      { name: 'Trekking poles with shock absorbers', desc: 'Saves knees during steep rocky descents' },
      { name: 'Hydration bladder & thermal bottles', desc: 'At least 3L water carrying capacity' },
      { name: 'High-capacity power bank', desc: 'Cold drains phone batteries quickly' }
    ]
  },
  {
    category: 'Optional Rentals',
    items: [
      { name: 'Warm trekking poles rent', desc: 'Available at base offices in Arusha' },
      { name: 'Insulated heavy down jacket rent', desc: 'Available for hire at base' },
      { name: 'Extreme sleeping bag rent', desc: 'Available for hire' },
      { name: 'Waterproof duffle bag protector rent', desc: 'Keep luggage dry' }
    ]
  }
];

// Verified Guest Reviews
const verifiedReviews = [
  {
    id: 'rev-1',
    name: 'Sarah Jenkins',
    country: 'United Kingdom',
    route: 'Lemosho 8-Day',
    rating: 5,
    comment: 'Conquering Uhuru Peak was a dream come true! Zanzibar Trip & Relax provided an outstanding crew. The organic food was delicious, and the private chemical toilet was a massive savior. Most of all, our guides kept us fully safe and motivated on summit night.',
    date: 'January 2026'
  },
  {
    id: 'rev-2',
    name: 'Gautam & Anjali',
    country: 'India',
    route: 'Machame 7-Day',
    rating: 5,
    comment: 'Excellent horizontal profile. Climbing the Barranco Wall was an adrenaline rush but completely secure under guide coordination. The porters\' beautiful singing on summit night filled us with the energy we needed. Truly outstanding local operator!',
    date: 'February 2026'
  },
  {
    id: 'rev-3',
    name: 'Markus Koch',
    country: 'Germany',
    route: 'Marangu 6-Day',
    rating: 5,
    comment: 'Felt very comfortable staying in Horombo huts instead of camping in tents. The guides performed clinical health checks with pulse oximeters twice daily. Highly professional service and smooth airport transfer logistics.',
    date: 'October 2025'
  }
];

export default function Kilimanjaro({ navigate }: KilimanjaroProps) {
  const { trackWhatsAppClick } = useAnalytics();
  const scrollY = useScrollY();
  
  // State definitions
  const [selectedRoute, setSelectedRoute] = useState(routesData[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'pricing' | 'inclusions' | 'exclusions' | 'gallery' | 'faqs' | 'reviews'>('overview');
  const [expandedDay, setExpandedDay] = useState<string | null>('Day 1');
  const [checklistTicked, setChecklistTicked] = useState<Record<string, boolean>>({});
  const [activeChecklistCat, setActiveChecklistCat] = useState('Clothing');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  
  // FAQs Accordion states
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Review slider
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);

  // Enquiry Form State
  const [formData, setFormData] = useState({
    routeId: selectedRoute.id,
    travelDate: '',
    adults: 2,
    children: 0,
    roomPreference: 'Double Sharing',
    fullName: '',
    email: '',
    whatsapp: '',
    country: '',
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Sync route selection in form when route selection changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, routeId: selectedRoute.id }));
  }, [selectedRoute]);

  // Handle slide background
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
    }, 6000);
    return () => clearInterval(timer);
  }, [bgImages.length]);

  // Dynamic CMS Overriding
  // If the admin added or customized Kilimanjaro tours in getSiteContent().tours with category 'kilimanjaro', we merge/override them
  const cmsRoutes = content.tours?.filter(t => t.category === 'kilimanjaro') || [];
  const processedRoutes = [...routesData];
  
  // Map any CMS tours to our visual model
  cmsRoutes.forEach(cms => {
    const existingIdx = processedRoutes.findIndex(r => r.id === cms.id || r.name.toLowerCase() === cms.title.toLowerCase());
    const basePriceNum = parseInt(cms.price.replace(/[^0-9]/g, '')) || 1290;
    const mappedRoute = {
      id: cms.id,
      name: cms.title,
      tagline: cms.shortDesc || 'Customized mountain trekking route.',
      difficulty: cms.difficulty || 'Challenging',
      duration: cms.duration || '7 Days / 6 Nights',
      successRate: cms.scenicValue || '90%', // Using scenicValue for success rate or default
      scenicVal: 'High',
      accommodation: cms.pickupDetails || 'Camping Tents',
      scenicRating: '5/5',
      basePrice: basePriceNum,
      desc: cms.longDescription || cms.shortDesc || '',
      highlights: cms.highlights && cms.highlights.length > 0 ? cms.highlights : ['Expert mountain guidance', 'Pristine trail scenery'],
      bestTimeToVisit: cms.bestTimeToVisit || 'Jan-Mar & Jul-Oct',
      whatToBring: cms.whatToBring && cms.whatToBring.length > 0 ? cms.whatToBring : ['Standard high altitude mountain trekking gear'],
      included: cms.included && cms.included.length > 0 ? cms.included : ['Certified mountain crew guides, park fees, and rescue fees'],
      excluded: cms.excluded && cms.excluded.length > 0 ? cms.excluded : ['Porter tipping, personal travel visas, and mountain gear hire'],
      pricingTable: cms.pricingTable && cms.pricingTable.length > 0 ? cms.pricingTable.map(pt => ({ tier: pt.tier, price: parseInt(pt.rate.replace(/[^0-9]/g, '')) || basePriceNum })) : [
        { tier: 'Solo Private Expedition', price: basePriceNum + 300 },
        { tier: 'Standard Group (2-4 People)', price: basePriceNum },
        { tier: 'Promo Team Rate (5+ People)', price: basePriceNum - 100 }
      ],
      faqs: cms.faqs && cms.faqs.length > 0 ? cms.faqs : [{ q: 'What is the route safety standard?', a: 'Oxygen-supported guides on every single trek.' }],
      gallery: cms.gallery && cms.gallery.length > 0 ? cms.gallery : [
        'https://images.unsplash.com/photo-1589553460730-dfeb1e41d8e1?auto=format&fit=crop&w=600&q=80'
      ],
      itinerary: cms.itineraryDays && cms.itineraryDays.length > 0 
        ? cms.itineraryDays.map(id => ({
            day: `Day ${id.dayNumber}`,
            title: id.title,
            time: id.travelTime || '5 hrs',
            elevation: 'Variable',
            accommodation: id.accommodation || 'Mountain Camp',
            meals: id.meals || 'B, L, D',
            activity: id.description
          }))
        : (cms.itinerary || []).map((itStr, i) => ({
            day: `Day ${i + 1}`,
            title: `Stage ${i + 1}`,
            time: '5 hrs',
            elevation: 'Variable',
            accommodation: 'Mountain Camp',
            meals: 'B, L, D',
            activity: itStr
          }))
    };

    if (existingIdx !== -1) {
      processedRoutes[existingIdx] = { ...processedRoutes[existingIdx], ...mappedRoute };
    } else {
      processedRoutes.push(mappedRoute);
    }
  });

  // Checklist handler
  const toggleChecklistItem = (name: string) => {
    setChecklistTicked(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Lightbox handler
  const openImageInLightbox = (imgUrl: string) => {
    setLightboxImg(imgUrl);
  };

  // Scroll to booking anchor
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit Enquiry Form
  const handleSubmitEnquiry = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.whatsapp) {
      setSubmitError('Please fill in all required contact details.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    const activeRouteName = processedRoutes.find(r => r.id === formData.routeId)?.name || 'Kilimanjaro Route';
    
    // Construct formatted submission message
    const formattedMessage = `
Selected Route: ${activeRouteName}
Preferred Travel Date: ${formData.travelDate || 'Flexible / To Be Arranged'}
Number of Adults: ${formData.adults}
Number of Children: ${formData.children}
Room/Tent Preference: ${formData.roomPreference}
Country of Origin: ${formData.country || 'Not specified'}
WhatsApp Number: ${formData.whatsapp}
Special Demands or Requests: ${formData.specialRequests || 'None'}
    `.trim();

    try {
      // 1. Insert into Supabase 'contact_submissions'
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.whatsapp,
          subject: `🏔️ Kilimanjaro Trek Enquiry: ${activeRouteName}`,
          message: formattedMessage,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        throw new Error(error.message);
      }

      // 2. Log activity log to local CMS
      const cmsLogs = JSON.parse(localStorage.getItem('site_activity_logs') || '[]');
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: formData.fullName,
        role: 'Guest / Client',
        action: `Submitted Kilimanjaro Trek Enquiry Form for: ${activeRouteName}`,
        previousValue: 'N/A',
        newValue: 'Enquiry Registered',
        ipAddress: 'Guest Client'
      };
      localStorage.setItem('site_activity_logs', JSON.stringify([newLog, ...cmsLogs]));

      setSubmitSuccess(true);
      // Reset contact fields but preserve route
      setFormData(prev => ({
        ...prev,
        fullName: '',
        email: '',
        whatsapp: '',
        country: '',
        specialRequests: ''
      }));
    } catch (err: any) {
      console.error('Submission error:', err);
      // Fallback: Save to local storage mock in case database table fails
      const localEnquiries = JSON.parse(localStorage.getItem('ztr_local_enquiries') || '[]');
      localEnquiries.push({
        id: `enq-${Date.now()}`,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.whatsapp,
        subject: `🏔️ Kilimanjaro Trek Enquiry: ${activeRouteName}`,
        message: formattedMessage,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('ztr_local_enquiries', JSON.stringify(localEnquiries));
      
      setSubmitSuccess(true); // Treat as success in UI with notice
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020916] text-white animate-fade-in font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] lg:h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Slide Background */}
        <div className="absolute inset-0 z-0" style={{ transform: `translateY(${scrollY * 0.25}px) scale(1.08)` }}>
          {bgImages.map((img, index) => (
            <div
              key={index}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1500 ease-in-out"
              style={{
                backgroundImage: `url('${img}')`,
                opacity: index === activeSlide ? 1 : 0,
              }}
            />
          ))}
          {/* Elite gradient dark overlays for premium readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020916] via-[#020916]/40 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020916]/80 via-transparent to-black/45" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-3xl space-y-6 md:space-y-8 animate-fade-in text-left">
            {/* Swahili Badge */}
            <span className="inline-flex items-center gap-2 text-[#D4A017] uppercase tracking-widest font-black text-[10px] bg-[#D4A017]/10 border border-[#D4A017]/35 px-4 py-2 rounded-full shadow-lg backdrop-blur-md">
              <Sparkles size={12} className="animate-pulse" /> Mount Kilimanjaro Treks — 5,895M
            </span>
            
            {/* Title & Subtitle */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Mount Kilimanjaro Treks
              </h1>
              <p className="text-sm sm:text-lg text-slate-350 max-w-2xl font-medium leading-relaxed">
                Reach the Roof of Africa with experienced local mountain guides. Hand-crafted, luxury adventures under pristine glaciers with a 100% KPAP ethical support crew.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl pt-2">
              {[
                { label: 'KPAP Compliant', desc: 'Ethical Porter Care', icon: Award },
                { label: 'Licensed Guides', desc: 'Wilderness WFR Certified', icon: Compass },
                { label: 'Emergency Oxygen', desc: 'Carried On All Climbs', icon: Shield },
                { label: '24/7 Support', desc: 'Live Ground Monitoring', icon: Clock }
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <badge.icon className="w-5 h-5 text-[#D4A017] shrink-0" />
                  <div>
                    <h5 className="text-[11px] font-extrabold text-white leading-tight">{badge.label}</h5>
                    <p className="text-[9px] text-slate-400 font-medium">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-3">
              <button
                type="button"
                onClick={() => scrollToSection('routes-comparison-section')}
                className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-lg shadow-[#D4A017]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                Book Your Trek <ArrowRight size={14} />
              </button>
              
              <a
                href="https://wa.me/255629506063?text=Hi!%20I%20am%20interested%20in%20climbing%20Mount%20Kilimanjaro.%20Could%20you%20please%20help%20me%20plan%20my%20itinerary?"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('Kilimanjaro Hero', 'Kilimanjaro Treks')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2"
              >
                <MessageCircle size={15} fill="white" /> WhatsApp an Expert
              </a>
            </div>
          </div>
        </div>

        {/* Quick Information Panel */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#020916] to-transparent pt-12 pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              {[
                { title: 'Starting Price', val: '$1,290 / person' },
                { title: 'Duration Range', val: '6 - 9 Days' },
                { title: 'Best Season', val: 'Jan-Mar & Jul-Oct' },
                { title: 'Maximum Altitude', val: '5,895m (Uhuru Peak)' },
                { title: 'Difficulty', val: 'High / Adventure' }
              ].map((item, idx) => (
                <div key={idx} className="text-center border-r border-white/10 last:border-0 px-2">
                  <span className="block text-[10px] uppercase font-black tracking-wider text-slate-400">{item.title}</span>
                  <strong className="block text-sm sm:text-base text-[#D4A017] font-black mt-1">{item.val}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ label: 'Kilimanjaro Treks' }]} navigate={navigate} />

      {/* 2. WHY CHOOSE ZANZIBAR TRIP & RELAX */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="text-center space-y-3 mb-14">
          <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/25 inline-block">
            🌟 Professional Climbing Operators
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Why Choose Zanzibar Trip & Relax?
          </h2>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-medium">
            Conquering the roof of Africa requires the absolute best team. We combine safety, ethical guidelines, and five-star outdoor dining.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              title: 'KPAP Ethical Crew',
              desc: 'We strictly comply with Kilimanjaro Porters Assistance Project rules. Porters receive fair wages, organic food, and premium waterproof dome shelters.',
              icon: Heart
            },
            {
              title: 'Certified Mountain Guides',
              desc: 'Every trip is led by licensed head guides with certified Wilderness First Responder (WFR) training and 10+ years of high-summit experience.',
              icon: Award
            },
            {
              title: 'Emergency Oxygen Support',
              desc: 'We pack state-of-the-art pulse oximeters, emergency hyperbaric bottled oxygen tanks, and direct wilderness rescue helipad connections.',
              icon: Shield
            },
            {
              title: 'Daily Health Monitoring',
              desc: 'Our guides perform a vital health check twice daily, measuring oxygen saturation levels, heart rate, and temperature to ensure healthy pacing.',
              icon: Activity
            },
            {
              title: 'High Summit Success',
              desc: 'By pacing our routes and utilizing horizontal acclimatization (climb high, sleep low), we secure an outstanding 96% climb success rate.',
              icon: Star
            },
            {
              title: 'Airport Transfers Included',
              desc: 'Arrive stress-free! Round-trip private private airport transfers between Kilimanjaro International Airport (JRO) and Arusha hotel are completely included.',
              icon: MapPin
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#0A1224] border border-white/5 hover:border-[#D4A017]/20 p-6 rounded-3xl transition-all shadow-xl group hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#D4A017]/10 border border-[#D4A017]/20 flex items-center justify-center text-[#D4A017] mb-5 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-white text-lg mb-2">{item.title}</h4>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ROUTE COMPARISON CARDS */}
      <section id="routes-comparison-section" className="py-20 bg-gradient-to-b from-[#020916] to-[#01040a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/25 inline-block">
              🏔️ Choose Your Ascent
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Compare Climbing Routes
            </h2>
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-medium">
              We guide climbs on all six official routes. Select a route to load statistics, visual timelines, pricing matrices, and equipment sheets below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {processedRoutes.map((route) => {
              const isSelected = selectedRoute.id === route.id;
              return (
                <div 
                  key={route.id} 
                  className={`bg-[#0A1224] border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                    isSelected ? 'border-[#D4A017] shadow-xl shadow-[#D4A017]/5 scale-[1.01]' : 'border-white/5 shadow-sm hover:border-white/10'
                  }`}
                >
                  {/* Route Card Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <img 
                      src={route.gallery?.[0] || 'https://images.unsplash.com/photo-1589553460730-dfeb1e41d8e1?auto=format&fit=crop&w=600&q=80'} 
                      alt={route.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1224] via-transparent to-black/25" />
                    
                    {/* Floating difficulty badge */}
                    <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-[10px] text-white font-black uppercase tracking-wider px-3 py-1 rounded-full border border-white/15">
                      {route.difficulty}
                    </span>
                    
                    {/* Success rate floating indicator */}
                    <span className="absolute bottom-4 left-4 bg-emerald-500/15 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-lg border border-emerald-500/25">
                      🏆 {route.successRate} success
                    </span>
                  </div>

                  {/* Route Details body */}
                  <div className="p-6 space-y-4 flex-grow">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-white text-lg hover:text-[#D4A017] transition-colors">{route.name}</h3>
                      <p className="text-slate-400 text-xs italic leading-snug">{route.tagline}</p>
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-black/20 p-3 rounded-2xl border border-white/5">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Duration</span>
                        <strong className="text-white font-bold">{route.duration}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Accommodation</span>
                        <strong className="text-white font-bold truncate block">{route.accommodation}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Scenic Value</span>
                        <strong className="text-[#D4A017] font-bold">{route.scenicVal}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Starting Price</span>
                        <strong className="text-emerald-400 font-black">${route.basePrice}</strong>
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                      {route.desc}
                    </p>
                  </div>

                  {/* Booking / Details trigger footer */}
                  <div className="p-6 bg-[#0c162b] border-t border-white/5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoute(route);
                        scrollToSection('active-route-details-tabs');
                      }}
                      className="flex-1 text-center bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRoute(route);
                        scrollToSection('expedition-enquiry-form');
                      }}
                      className="flex-1 text-center bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black text-xs uppercase tracking-wider py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Book This
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. ROUTE DETAIL EXPANDABLE PANEL (TABBED) */}
      <section id="active-route-details-tabs" className="py-20 bg-[#020916] border-b border-white/5 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header showing currently loaded details */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/5">
            <div className="space-y-1">
              <span className="text-xs uppercase font-black text-[#D4A017] tracking-widest flex items-center gap-1.5">
                <Compass className="w-4 h-4 animate-spin-slow text-[#D4A017]" /> Active Route Detail Explorer
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                {selectedRoute.name} Details
              </h3>
            </div>
            
            {/* Quick stats chips */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/5 text-slate-300 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-lg border border-white/10">
                ⏱️ {selectedRoute.duration}
              </span>
              <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-lg border border-emerald-500/25">
                🏆 {selectedRoute.successRate} Success
              </span>
              <span className="bg-[#D4A017]/10 text-[#D4A017] text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-lg border border-[#D4A017]/20">
                ⛺ {selectedRoute.accommodation}
              </span>
            </div>
          </div>

          {/* Premium tabs bar */}
          <div className="flex flex-wrap gap-1 bg-[#0A1224] p-1.5 rounded-2xl border border-white/5 mb-8 overflow-x-auto">
            {(['overview', 'itinerary', 'pricing', 'inclusions', 'exclusions', 'gallery', 'faqs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[100px] text-center font-extrabold text-[11px] uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-[#D4A017] text-[#020C1F]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Active Tab Panel Card */}
          <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl min-h-[400px]">
            
            {/* TAB: OVERVIEW & STATISTICS */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                  <h4 className="text-xl font-bold text-white flex items-center gap-2">
                    <Info className="text-[#D4A017] w-5 h-5" /> Expedition Overview
                  </h4>
                  <p className="text-slate-350 text-xs sm:text-sm leading-relaxed">
                    {selectedRoute.desc}
                  </p>
                  
                  {/* Highlights section */}
                  <div className="space-y-3 bg-black/20 p-5 rounded-2xl border border-white/5">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Route Highlights</h5>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedRoute.highlights.map((hlt, i) => (
                        <li key={i} className="flex gap-2.5 text-xs text-slate-300 font-medium">
                          <Check size={14} className="text-[#D4A017] mt-0.5 shrink-0" />
                          <span>{hlt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Scenic Rating</span>
                      <strong className="text-[#D4A017] text-sm">Rating: {selectedRoute.scenicRating} ({selectedRoute.scenicVal})</strong>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Best Season</span>
                      <strong className="text-[#D4A017] text-sm">{selectedRoute.bestTimeToVisit}</strong>
                    </div>
                  </div>
                </div>

                {/* 6. ROUTE STATISTICS BADGES */}
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Route Blueprint</h4>
                  {[
                    { label: 'Total Duration', val: selectedRoute.duration, icon: Clock, color: 'text-sky-400' },
                    { label: 'Success Rate', val: selectedRoute.successRate, icon: Award, color: 'text-emerald-400' },
                    { label: 'Maximum Altitude', val: '5,895m (Uhuru Peak)', icon: Compass, color: 'text-orange-400' },
                    { label: 'Difficulty Grade', val: selectedRoute.difficulty, icon: Activity, color: 'text-red-400' },
                    { label: 'Accommodation', val: selectedRoute.accommodation, icon: Shield, color: 'text-yellow-400' },
                    { label: 'Starting Price', val: `$${selectedRoute.basePrice} / person`, icon: DollarSign, color: 'text-teal-400' }
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-black/25 p-3.5 rounded-2xl border border-white/5">
                      <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] block font-bold text-slate-400 uppercase leading-none">{stat.label}</span>
                        <strong className="text-white text-xs sm:text-sm font-extrabold mt-1 block">{stat.val}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: VISUAL DAY-BY-DAY ITINERARY TIMELINE */}
            {activeTab === 'itinerary' && (
              <div className="space-y-8">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-white flex items-center gap-2">
                    <List className="text-[#D4A017] w-5 h-5" /> Day-by-Day Visual Timeline
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Follow the vertical profile trail. Click any day segment to expand or collapse details.
                  </p>
                </div>

                {/* 5. VISUAL TIMELINE */}
                <div className="relative border-l-2 border-dashed border-[#D4A017]/30 pl-6 sm:pl-8 ml-3 space-y-6">
                  {selectedRoute.itinerary.map((it, idx) => {
                    const isOpen = expandedDay === it.day;
                    return (
                      <div key={idx} className="relative group">
                        
                        {/* Timeline Pin Indicator */}
                        <div className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isOpen ? 'bg-[#D4A017] border-[#D4A017] text-[#020C1F] scale-110' : 'bg-[#020916] border-slate-500 text-slate-400'
                        }`}>
                          <span className="text-[10px] font-black">{idx + 1}</span>
                        </div>

                        {/* Timeline Day Card */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden transition-all">
                          
                          {/* Segment trigger */}
                          <button
                            type="button"
                            onClick={() => setExpandedDay(isOpen ? null : it.day)}
                            className="w-full text-left p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                          >
                            <div className="space-y-1">
                              <span className="text-[#D4A017] text-[10px] uppercase font-black tracking-widest">{it.day}</span>
                              <h5 className="font-extrabold text-white text-sm md:text-base leading-tight">{it.title}</h5>
                              
                              {/* Quick day specs */}
                              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400 uppercase pt-1">
                                <span>⏳ {it.time}</span>
                                <span>🏔️ {it.elevation}</span>
                                <span>🏕️ {it.accommodation}</span>
                                <span>🍳 Meals: {it.meals}</span>
                              </div>
                            </div>
                            <div className="text-slate-400 shrink-0">
                              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          </button>

                          {/* Expandable details */}
                          {isOpen && (
                            <div className="p-4 bg-black/25 border-t border-white/5 text-slate-350 text-xs sm:text-sm leading-relaxed space-y-4 animate-fade-in">
                              <p className="font-medium leading-relaxed">
                                {it.activity}
                              </p>
                              
                              {/* Day Illustration */}
                              <div className="relative h-40 sm:h-52 rounded-xl overflow-hidden border border-white/5 bg-slate-900">
                                <img 
                                  src={selectedRoute.gallery[idx % selectedRoute.gallery.length]} 
                                  alt={it.title} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <span className="absolute bottom-3 left-3 text-[10px] font-black text-[#D4A017] bg-black/60 px-2.5 py-1 rounded-md">
                                  {it.accommodation} Altitude Point
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: PRICING CARDS */}
            {activeTab === 'pricing' && (
              <div className="space-y-8">
                <div className="text-left">
                  <h4 className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="text-[#D4A017] w-5 h-5" /> Expedition Pricing Matrix
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Book private or small group expeditions. Prices are fully inclusive of crew salaries and park fees.
                  </p>
                </div>

                {/* 7. PRICING CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {selectedRoute.pricingTable.map((pt, idx) => (
                    <div key={idx} className="bg-[#0c162b] border border-white/5 hover:border-[#D4A017]/25 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg">
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{pt.tier}</span>
                        <div className="text-3xl font-black text-white">
                          ${pt.price}
                          <span className="text-[10px] text-slate-400 font-medium ml-1">/ person</span>
                        </div>
                      </div>

                      <ul className="text-[10px] text-slate-400 space-y-1 border-t border-white/5 pt-3">
                        <li className="flex items-center gap-1.5"><Check size={10} className="text-emerald-400" /> Private Tents / Huts</li>
                        <li className="flex items-center gap-1.5"><Check size={10} className="text-emerald-400" /> All-Inclusive Catering</li>
                        <li className="flex items-center gap-1.5"><Check size={10} className="text-emerald-400" /> KPAP Ethical Porter wages</li>
                      </ul>

                      <button
                        type="button"
                        onClick={() => {
                          navigate('booking', `package=${encodeURIComponent(selectedRoute.name)}`);
                        }}
                        className="w-full text-center bg-white/5 hover:bg-[#D4A017] hover:text-[#020C1F] text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  * Group promotions apply to multiple climbers booking together as a single squad party.
                </p>
              </div>
            )}

            {/* TAB: INCLUSIONS */}
            {activeTab === 'inclusions' && (
              <div className="space-y-6">
                <h4 className="text-lg font-extrabold text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> All-Inclusive Standard Amenities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRoute.included.map((inc, i) => (
                    <div key={i} className="flex gap-3 bg-white/5 p-4 rounded-xl border border-white/5 text-xs sm:text-sm text-slate-300 font-medium">
                      <Check className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: EXCLUSIONS */}
            {activeTab === 'exclusions' && (
              <div className="space-y-6">
                <h4 className="text-lg font-extrabold text-red-450 flex items-center gap-2">
                  <X className="w-5 h-5 text-red-400" /> Excluded Parameters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRoute.excluded.map((exc, i) => (
                    <div key={i} className="flex gap-3 bg-white/5 p-4 rounded-xl border border-white/5 text-xs sm:text-sm text-slate-300 font-medium">
                      <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                      <span>{exc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: LIGHTBOX GALLERY */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="text-[#D4A017] w-5 h-5" /> Expedition Photo Gallery
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedRoute.gallery.map((imgUrl, i) => (
                    <div 
                      key={i} 
                      onClick={() => openImageInLightbox(imgUrl)}
                      className="h-32 sm:h-44 rounded-2xl overflow-hidden border border-white/5 bg-slate-900 group relative cursor-pointer"
                    >
                      <ProgressiveImage src={imgUrl} alt={`Route Alpine ${i + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-[10px] text-[#D4A017] font-black uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-full">
                          🔍 View Larger
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ROUTE FAQs */}
            {activeTab === 'faqs' && (
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="text-[#D4A017] w-5 h-5" /> Route Specific Advisories
                </h4>
                <div className="space-y-4">
                  {selectedRoute.faqs.map((faq, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                      <h5 className="font-extrabold text-[#D4A017] text-xs uppercase tracking-wider">Q: {faq.q}</h5>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">A: {faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <Star className="text-[#D4A017] w-5 h-5" /> {selectedRoute.name} Guest Reviews
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verifiedReviews.filter(r => r.route.toLowerCase().includes(selectedRoute.id.split('-')[0])).map((rev, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-3 shadow-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="block text-white text-sm font-black">{rev.name}</strong>
                          <span className="text-[10px] text-slate-400">{rev.country} • {rev.route}</span>
                        </div>
                        <span className="text-[#D4A017] font-bold text-xs">{rev.date}</span>
                      </div>
                      <div className="flex gap-0.5 text-[#D4A017]">
                        {[...Array(rev.rating)].map((_, rIdx) => <Star key={rIdx} size={12} fill="#D4A017" />)}
                      </div>
                      <p className="text-slate-300 text-xs italic leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 9. EQUIPMENT CHECKLIST SECTION */}
      <section className="py-20 bg-[#01040a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-14">
            <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/25 inline-block">
              🎒 Gear & packing blueprint
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Equipment Checklist
            </h2>
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-medium">
              Interactive high-altitude packing planner. Tick items off your checklist as you secure them!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category selection sidebar */}
            <div className="space-y-1 bg-[#0A1224] p-3 rounded-2xl border border-white/5 h-fit">
              {equipmentChecklist.map((cat) => (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => setActiveChecklistCat(cat.category)}
                  className={`w-full text-left font-black text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all flex justify-between items-center cursor-pointer ${
                    activeChecklistCat === cat.category 
                      ? 'bg-[#D4A017] text-[#020C1F]' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{cat.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                    activeChecklistCat === cat.category ? 'bg-black/25 text-white' : 'bg-white/5 text-slate-450'
                  }`}>
                    {cat.items.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Checklist active items list */}
            <div className="lg:col-span-3 bg-[#0A1224] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4">
              <h4 className="text-lg font-black text-white flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <CheckSquare className="text-[#D4A017] w-5 h-5" /> Packing List: {activeChecklistCat}
              </h4>

              <div className="divide-y divide-white/5 space-y-4">
                {equipmentChecklist.find(c => c.category === activeChecklistCat)?.items.map((item, idx) => {
                  const isChecked = !!checklistTicked[item.name];
                  return (
                    <div 
                      key={idx} 
                      onClick={() => toggleChecklistItem(item.name)}
                      className="flex items-start gap-4 pt-4 first:pt-0 group cursor-pointer"
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isChecked ? 'bg-[#D4A017] border-[#D4A017] text-[#020C1F]' : 'border-slate-600 group-hover:border-white'
                      }`}>
                        {isChecked && <Check size={12} strokeWidth={4} />}
                      </div>
                      <div>
                        <strong className={`block text-xs sm:text-sm font-extrabold ${isChecked ? 'line-through text-slate-500' : 'text-white'}`}>
                          {item.name}
                        </strong>
                        <p className="text-[11px] sm:text-xs text-slate-450 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. INTERACTIVE ELEVATION MAP PROFILE VISUALIZATION */}
      <section className="py-20 bg-[#020916] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-14">
            <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/25 inline-block">
              🗺️ Elevation Profile & Milestones
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Interactive Ascent Profile
            </h2>
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-medium">
              Explore altitude transitions from lush rainforest park gates to the snow-covered glacial Uhuru Summit.
            </p>
          </div>

          {/* Graphical Elevation timeline profile card */}
          <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              
              {/* Profile Visualizer */}
              <div className="lg:col-span-2 bg-black/25 p-4 rounded-2xl border border-white/5 relative">
                <div className="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-widest flex items-center gap-1">
                  <Activity size={12} className="text-[#D4A017] animate-pulse" /> Vertical Altitude progression (Meters)
                </div>
                
                {/* Simulated Elevation bars chart */}
                <div className="h-60 flex items-end gap-3 pt-8 pb-4 border-b border-slate-800">
                  {[
                    { label: 'Gate', alt: '1,800m', pct: 'h-[30%]', desc: 'Rainforest' },
                    { label: 'Camp 1', alt: '2,835m', pct: 'h-[48%]', desc: 'Heath' },
                    { label: 'Plat', alt: '3,840m', pct: 'h-[65%]', desc: 'Moorland' },
                    { label: 'Tower', alt: '4,630m', pct: 'h-[78%]', desc: 'Alpine desert' },
                    { label: 'Wall', alt: '3,960m', pct: 'h-[67%]', desc: 'Campsite' },
                    { label: 'Base', alt: '4,640m', pct: 'h-[79%]', desc: 'Scree' },
                    { label: 'Summit', alt: '5,895m', pct: 'h-[100%] border-[#D4A017]', desc: 'Uhuru Peak' }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group">
                      <span className="text-[9px] text-[#D4A017] font-black mb-1 group-hover:scale-110 transition-transform">
                        {bar.alt}
                      </span>
                      <div className={`w-full bg-gradient-to-t from-white/5 to-[#D4A017]/30 border-t-2 border-slate-500 rounded-t-md cursor-pointer group-hover:from-white/10 group-hover:to-[#D4A017]/50 group-hover:border-[#D4A017] transition-all ${bar.pct}`} />
                      <span className="text-[10px] text-slate-400 font-extrabold mt-2 tracking-tight text-center">
                        {bar.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-medium pt-3">
                  <span>🟢 Rain Forest Zone: 1,800m - 2,800m</span>
                  <span>🟡 Moorland Zone: 2,800m - 4,000m</span>
                  <span>🟠 Alpine Desert Zone: 4,000m - 5,000m</span>
                  <span>⚪ Glacial Extreme Zone: 5,000m - 5,895m</span>
                </div>
              </div>

              {/* Milestones Sidebar descriptions */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Key Trail Milestones</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Barranco Wall (3,960m)', desc: 'An exciting, vertical scramble requiring zero technical climbing ropes.' },
                    { label: 'Lava Tower (4,630m)', desc: 'A volcanic plug landmark crossed for acclimatization on Lemosho and Machame.' },
                    { label: 'Uhuru Peak (5,895m)', desc: 'The physical summit peak on the crater rim. The physical Roof of Africa.' }
                  ].map((ml, idx) => (
                    <div key={idx} className="bg-black/20 p-3.5 rounded-xl border border-white/5 space-y-1">
                      <h5 className="font-bold text-white text-xs">{ml.label}</h5>
                      <p className="text-slate-400 text-[11px] leading-relaxed font-medium">{ml.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 12. GENERAL ACCORDION FAQs */}
      <section className="py-20 bg-[#01040a] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="text-center space-y-3 mb-14">
            <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/25 inline-block">
              ❓ Mountain Climbing Advisories
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-medium">
              Find answers to the most common questions regarding training, gear rentals, altitude sickness, and mountain safety.
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {[
              {
                q: 'Which Kilimanjaro route is best for beginners?',
                a: 'The Lemosho 8-day and Machame 7-day are highly recommended for beginners. They offer longer profiles with natural climb-high sleep-low horizontal stages, maximizing biological body acclimatization and safety success.'
              },
              {
                q: 'Is altitude sickness common, and how do you manage it?',
                a: 'Mild altitude symptoms (headache, slight nausea) are common. Our professional guides carry oximeters and medical oxygen on every single climb. They conduct vital health checks twice daily to monitor pulse and blood saturation.'
              },
              {
                q: 'Can absolute beginners climb Mount Kilimanjaro?',
                a: 'Yes! Kilimanjaro is a trekking mountain rather than a technical rock climb. No ropes, harnesses, or helmets are required. However, physical cardiovascular endurance training is strongly recommended.'
              },
              {
                q: 'Is climbing equipment available for rent?',
                a: 'Yes, you can rent heavy gear (including certified -15°C down sleeping bags, trekking poles, down jackets, and water bottles) directly from our base equipment offices in Arusha before the climb.'
              },
              {
                q: 'What emergency procedures are in place during a climb?',
                a: 'Our guides are Wilderness First Responder certified. If altitude sickness becomes severe, we coordinate immediate stretcher descent and immediate helicopter evacuation supported by medical services.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden shadow-md">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <span className="font-extrabold text-white text-xs sm:text-sm tracking-wide">{faq.q}</span>
                    <span className="text-[#D4A017] shrink-0">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-5 bg-black/20 border-t border-white/5 text-slate-350 text-xs sm:text-sm leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 13. VERIFIED REVIEWS CAROUSEL */}
      <section className="py-20 bg-[#020916] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="text-center space-y-3 mb-14">
            <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px] bg-[#D4A017]/10 px-4 py-2 rounded-full border border-[#D4A017]/25 inline-block">
              ⭐ Verified Climber Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              What Our Climbers Say
            </h2>
            <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto font-medium">
              Read verified testimonials from global adventurers who conquered Uhuru Peak with our professional guides.
            </p>
          </div>

          {/* Review Carousel Card */}
          <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 sm:p-10 relative shadow-2xl space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <strong className="block text-white text-base sm:text-lg font-black">{verifiedReviews[currentReviewIdx].name}</strong>
                <span className="text-xs text-slate-400">{verifiedReviews[currentReviewIdx].country} • Completed {verifiedReviews[currentReviewIdx].route}</span>
              </div>
              <span className="text-[#D4A017] font-extrabold text-xs uppercase bg-[#D4A017]/10 px-3 py-1 rounded-md">
                {verifiedReviews[currentReviewIdx].date}
              </span>
            </div>

            <div className="flex gap-1 text-[#D4A017]">
              {[...Array(verifiedReviews[currentReviewIdx].rating)].map((_, i) => <Star key={i} size={15} fill="#D4A017" />)}
            </div>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed italic">
              "{verifiedReviews[currentReviewIdx].comment}"
            </p>

            {/* Slider navigation */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setCurrentReviewIdx(prev => (prev - 1 + verifiedReviews.length) % verifiedReviews.length)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-[#D4A017] flex items-center justify-center cursor-pointer font-bold"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setCurrentReviewIdx(prev => (prev + 1) % verifiedReviews.length)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-[#D4A017] flex items-center justify-center cursor-pointer font-bold"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 14. RELATED ROUTES RECOMMENDATIONS */}
      <section className="py-20 bg-[#01040a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h4 className="text-lg font-bold text-white mb-8" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Recommended Alternate Routes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {processedRoutes.filter(r => r.id !== selectedRoute.id).slice(0, 3).map((route) => (
              <div 
                key={route.id} 
                onClick={() => {
                  setSelectedRoute(route);
                  scrollToSection('active-route-details-tabs');
                }}
                className="bg-[#0A1224] border border-white/5 rounded-2xl overflow-hidden p-4 flex gap-4 cursor-pointer hover:border-[#D4A017]/30 transition-all"
              >
                <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden shrink-0">
                  <img src={route.gallery[0]} alt={route.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1 justify-center flex flex-col">
                  <h5 className="font-extrabold text-white text-xs uppercase sm:text-sm line-clamp-1">{route.name}</h5>
                  <p className="text-[10px] text-slate-400 font-medium">⏱️ {route.duration} • 🏆 {route.successRate} success</p>
                  <strong className="text-[#D4A017] text-[11px] font-black block">From ${route.basePrice}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15. FLOATING BOOKING PANEL (DESKTOP GRID SIDEBAR & MOBILE FIXED BOTTOM BAR) */}
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Left Column: Extensive Details & Trust parameters */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Secure Your Expedition Place
            </h3>
            <p className="text-slate-450 text-xs sm:text-sm leading-relaxed">
              Ready to challenge yourself on the Roof of Africa? Fill out our formal expedition builder enquiry below. A certified luxury climb planner will customize your dates and team specifications immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3">
              <Shield className="w-8 h-8 text-[#D4A017] shrink-0" />
              <div>
                <strong className="text-white text-xs block">No Deposit Risk</strong>
                <p className="text-[10px] text-slate-400 leading-snug">Secure dates completely risk-free. Pay deposits only after final guide-itinerary clearance.</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3">
              <Calendar className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white text-xs block">Flexible Departures</strong>
                <p className="text-[10px] text-slate-400 leading-snug">Private expeditions depart daily. Group joint departures can be arranged year-round.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 16. ENQUIRY FORM / STICKY SIDEBAR PANEL */}
        <div id="expedition-enquiry-form" className="lg:sticky lg:top-24 bg-[#0A1224] border border-[#D4A017]/20 p-6 rounded-3xl shadow-2xl space-y-6 scroll-mt-12">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#D4A017] tracking-widest block">Book Your Ascent</span>
            <h4 className="text-lg font-black text-white uppercase">Trek enquiry Builder</h4>
            <div className="text-slate-400 text-xs font-medium">Selected: <strong className="text-white">{selectedRoute.name}</strong></div>
          </div>

          <form onSubmit={handleSubmitEnquiry} className="space-y-4">
            
            {/* Route selection sync dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Climbing Route</label>
              <select
                value={formData.routeId}
                onChange={(e) => {
                  const r = processedRoutes.find(rt => rt.id === e.target.value);
                  if (r) setSelectedRoute(r);
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4A017]"
              >
                {processedRoutes.map(r => (
                  <option key={r.id} value={r.id} className="bg-[#0A1224]">{r.name}</option>
                ))}
              </select>
            </div>

            {/* Travel Date & Climber counters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Preferred Date</label>
                <input
                  type="date"
                  value={formData.travelDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, travelDate: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017] cursor-pointer"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Room / Tent</label>
                <select
                  value={formData.roomPreference}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomPreference: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option className="bg-[#0A1224]">Double Sharing</option>
                  <option className="bg-[#0A1224]">Private Solo Tent</option>
                  <option className="bg-[#0A1224]">Family Shelter</option>
                </select>
              </div>
            </div>

            {/* Adults and Children limits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Adults (15+ yrs)</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formData.adults}
                  onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Children (10-14 yrs)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.children}
                  onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                />
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Sarah Jenkins"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4A017]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Email Address *</label>
              <input
                type="email"
                required
                placeholder="sarah@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4A017]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+44 7911 123456"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Country</label>
                <input
                  type="text"
                  placeholder="United Kingdom"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                />
              </div>
            </div>

            {/* Special requests */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Special Demands / Dietary / Gear Needs</label>
              <textarea
                placeholder="Vegan diet, renting walking poles..."
                rows={2}
                value={formData.specialRequests}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4A017] resize-none"
              />
            </div>

            {submitError && (
              <div className="text-red-400 text-[11px] font-semibold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="text-emerald-400 text-[11px] font-extrabold bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 leading-relaxed text-center">
                🎉 Your expedition blueprint request was sent successfully! Our certified guide specialists will contact you on WhatsApp / Email within 4 hours.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-center bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black text-xs uppercase tracking-wider py-4 rounded-full shadow-lg shadow-[#D4A017]/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer block"
            >
              {isSubmitting ? 'Sending Request...' : 'Submit Trek Enquiry'}
            </button>
          </form>
        </div>
      </div>

      {/* MOBILE FIXED BOTTOM CTA BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0A1224]/95 backdrop-blur-md border-t border-white/10 py-3.5 px-4 z-40 flex md:hidden justify-between items-center gap-3">
        <div className="text-left">
          <span className="block text-[9px] uppercase text-slate-400">Starting from</span>
          <strong className="block text-emerald-400 text-sm font-black">${selectedRoute.basePrice} <span className="text-[10px] text-slate-400 font-medium">/ person</span></strong>
        </div>
        
        <div className="flex gap-2 flex-grow max-w-[240px]">
          <button
            type="button"
            onClick={() => scrollToSection('expedition-enquiry-form')}
            className="flex-1 bg-[#D4A017] text-[#020C1F] font-black text-[10px] uppercase tracking-wider py-3 rounded-full text-center"
          >
            Inquire Now
          </button>
          <a
            href="https://wa.me/255629506063?text=Hi!%20Interested%20in%2520climbing%252520Kilimanjaro.%252520Can%252520you%252520help%25252520me?"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 text-white p-3 rounded-full flex items-center justify-center shadow-lg"
          >
            <MessageCircle size={15} fill="white" />
          </a>
        </div>
      </div>

      {/* Image Lightbox Overlay Modal */}
      {lightboxImg && (
        <div 
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        >
          <button 
            type="button" 
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full"
          >
            <X size={20} />
          </button>
          <img src={lightboxImg} alt="Lightbox View" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/10" />
        </div>
      )}

    </div>
  );
}
