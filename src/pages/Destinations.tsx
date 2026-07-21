import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Sparkles, ArrowRight, Info, Calendar, Globe, Star, 
  ChevronRight, ArrowLeft, Send, CheckCircle2, AlertCircle, 
  Camera, HelpCircle, Briefcase, Compass, Search
} from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { getSiteContent, getHotels, Destination, TourItem } from '../lib/cmsStore';
import UnifiedBookingModal from '../components/UnifiedBookingModal';

// Static Categories data for main landing
const REGIONS = [
  {
    id: 'northern',
    name: 'Northern Tanzania',
    tagline: 'Classic Wildlife Safaris & Snowy Volcanic Peaks',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    description: 'Home to the world\'s most legendary wildlife sanctuaries, endless golden plains, and the roof of Africa, Mount Kilimanjaro.',
    destinations: ['serengeti', 'ngorongoro', 'tarangire', 'manyara', 'kilimanjaro', 'meru', 'lengai']
  },
  {
    id: 'southern',
    name: 'Southern Tanzania',
    tagline: 'Untamed Wilderness & Authentic Bush tracking',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    description: 'Pure, remote, and massive wildlife reserves, offering quiet tracking paths away from heavy tourist crowds.',
    destinations: ['selous', 'ruaha', 'mikumi']
  },
  {
    id: 'zanzibar',
    name: 'Zanzibar Archipelago',
    tagline: 'Pristine Beach Escapes & Swahili Spice Cultures',
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Tropical spice islands lined with crystal-blue waters, historic Stone Town architecture, and pristine sandbanks.',
    destinations: ['unguja', 'pemba', 'mafia']
  }
];

// Rich default fallback data for destinations to guarantee absolute content quality
const DESTINATION_FALLBACKS: Record<string, {
  tagline: string;
  bestTime: string;
  duration: string;
  wildlife: string;
  overview: string;
  highlights: string[];
  thingsToDo: string[];
  travelTips: string[];
  gallery: string[];
  faqs: { q: string; a: string }[];
  nearbyAttractions: string[];
  mapQuery: string;
}> = {
  serengeti: {
    tagline: 'The Ultimate Wilderness Stage & Home of the Great Migration',
    bestTime: 'July to October (Migration Crossing) or Jan to March (Calving)',
    duration: '3 - 5 Days',
    wildlife: 'Lions, Leopards, Cheetahs, Millions of Wildebeest, Elephants',
    overview: 'Serengeti National Park is a world-renowned UNESCO Heritage Site, presenting the most iconic wildlife spectacle on Earth. Its endless golden grasslands are home to massive lion prides, elusive leopards, and the great annual migratory herds.',
    highlights: [
      'Witness the legendary Mara River crossings filled with apex crocodiles',
      'Glide over the endless golden plains in a sunrise hot air balloon',
      'Observe active cheetah and lion hunts in the Seronera Valley'
    ],
    thingsToDo: [
      'Sunrise Hot Air Balloon Safari with champagne breakfast',
      'Northern Mara River migration game drives',
      'Guided walking safaris in private concessions'
    ],
    travelTips: [
      'Book at least 8 to 12 months in advance for the Great Migration season',
      'Pack neutral-colored clothing (avoid blue and black which attract tsetse flies)',
      'Prepare warm layers for early morning game drives'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'When is the best time to see the Great Migration?', a: 'The herds are usually in the Northern Serengeti crossing the Mara River from July to October, and in the Southern plains for calving season from January to March.' },
      { q: 'Is the Serengeti safe for families?', a: 'Yes, our custom game drives are executed in heavy-duty, fully enclosed 4x4 pop-top safari cruisers led by highly certified professional guides.' }
    ],
    nearbyAttractions: ['Ngorongoro Crater', 'Olduvai Gorge', 'Lake Natron'],
    mapQuery: 'Serengeti National Park Tanzania'
  },
  ngorongoro: {
    tagline: 'The Garden of Eden & World\'s Largest Unbroken Volcanic Caldera',
    bestTime: 'Year-round high quality viewing',
    duration: '1 - 2 Days',
    wildlife: 'Rare Black Rhinos, Giant Tusker Elephants, Dense Lion Prides',
    overview: 'The Ngorongoro Crater is a breathtaking natural sanctuary enclosed within a massive volcanic caldera. Spanning over 260 square kilometers, it shelters over 25,000 large mammals living in complete ecological harmony, including Africa\'s last remaining black rhinos.',
    highlights: [
      'Descend 600 meters into a prehistoric pristine caldera',
      'Track rare, highly endangered wild Black Rhinos on the crater floor',
      'Meet local Maasai communities guarding ancestral pastoral lands'
    ],
    thingsToDo: [
      'Full-day deep crater floor 4x4 tracking game drive',
      'Crater rim walking safari with armed rangers',
      'Maasai cultural boma visits'
    ],
    travelTips: [
      'Depart early at 6:00 AM to enjoy the crater floor before crowds arrive',
      'Temperatures on the high crater rim drop significantly at night, pack heavy jackets',
      'Keep cameras ready as wildlife is incredibly dense and active here'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Can you see the Big Five in Ngorongoro?', a: 'Yes! Ngorongoro is one of the easiest places in Africa to see all Big Five (Lion, Leopard, Elephant, Rhino, Buffalo) in a single afternoon.' }
    ],
    nearbyAttractions: ['Lake Manyara', 'Tarangire National Park'],
    mapQuery: 'Ngorongoro Crater Tanzania'
  },
  tarangire: {
    tagline: 'The Playground of Giants & Ancient Baobab Forests',
    bestTime: 'June to October (Dry season river congregations)',
    duration: '1 - 2 Days',
    wildlife: 'Massive Elephant Herds, Tree-Climbing Pythons, Oryx, Kudus',
    overview: 'Tarangire National Park is famous for its colossal baobab trees that dominate the landscape, and its massive elephant population. During the dry season, the Tarangire River becomes a critical life source, drawing thousands of migratory animals to its shores.',
    highlights: [
      'Photograph thousands of wild elephants gathering by the Tarangire River',
      'Marvel at iconic baobab trees dating back over 1,000 years',
      'Spot rare tree-climbing lions and massive pythons'
    ],
    thingsToDo: [
      'Riverside morning game drives',
      'Luxury lodge bush dinners under the stars',
      'Bird-watching excursions (over 550 registered species)'
    ],
    travelTips: [
      'Great for travelers arriving from Arusha as a direct starting day',
      'Use high-strength insect repellent to avoid local tsetse flies',
      'Linger near the river swamps for the highest concentration of predator action'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1504431505707-ca113764839e?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Is Tarangire worth visiting?', a: 'Absolutely. It is less crowded than Serengeti but offers arguably the most dramatic elephant encounters in East Africa.' }
    ],
    nearbyAttractions: ['Lake Manyara', 'Mto wa Mbu Cultural Village'],
    mapQuery: 'Tarangire National Park Tanzania'
  },
  manyara: {
    tagline: 'Soda Lakes, Tree-Climbing Lions & Millions of Flamingos',
    bestTime: 'November to May (Wet season birding) or June to Oct (Dry season)',
    duration: '1 Day',
    wildlife: 'Tree-Climbing Lions, Pink Flamingos, Baboon Troops, Hippos',
    overview: 'Lake Manyara National Park is a scenic gem nestled at the base of the dramatic Rift Valley Escarpment. It offers a unique mix of lush groundwater forests, grassy plains, and a massive alkaline soda lake shimmering with pink flamingos.',
    highlights: [
      'See thousands of bright pink flamingos blanketing the lake shore',
      'Search for Lake Manyara\'s unique tree-climbing lions',
      'Walk on the treetop canopy walkway suspended 18 meters high'
    ],
    thingsToDo: [
      'Scenic lake game drives',
      'Treetop Canopy Walkway experience',
      'Night safari game drive (one of the few parks offering this)'
    ],
    travelTips: [
      'Perfect as a half-day excursion when traveling between Tarangire and Ngorongoro',
      'Bring binoculars for spectacular bird-watching across the lake front',
      'Keep car windows rolled up around the lush forests due to curious baboons'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1504431505707-ca113764839e?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Why do Manyara lions climb trees?', a: 'While not fully known, experts believe they climb trees to escape biting insects on the ground and to catch cool lake breezes.' }
    ],
    nearbyAttractions: ['Tarangire', 'Ngorongoro Rim'],
    mapQuery: 'Lake Manyara National Park Tanzania'
  },
  kilimanjaro: {
    tagline: 'Stand on the Roof of Africa & Conquering Uhuru Peak',
    bestTime: 'January to March or July to October (Dry clear skies)',
    duration: '5 - 9 Days',
    wildlife: 'Colobus Monkeys, Alpine flora, Giant Groundsels',
    overview: 'Mount Kilimanjaro is the tallest free-standing volcanic mountain in the world and the highest point in Africa, rising 5,895 meters above sea level. Climbing Kilimanjaro takes you through five distinct ecological climate zones, from lush rainforests to alpine deserts and glacial ice fields.',
    highlights: [
      'Conquer Uhuru Peak, the highest summit in Africa',
      'Trek through 5 distinct ecological zones in a single week',
      'Camp amidst majestic ancient glaciers and starry skies'
    ],
    thingsToDo: [
      'Guided multi-day mountain trekking (Machame, Lemosho, or Marangu route)',
      'Alpine photography at Barranco Wall',
      'Stargazing above the cloud line'
    ],
    travelTips: [
      'Choose a longer route (7-8 days) to ensure proper acclimatization and summit success',
      'Invest in high-quality waterproof gear and broken-in hiking boots',
      'Listen to your guides and walk "Pole Pole" (slowly slowly)'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1589553460730-1651fa2de0c7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Do I need professional climbing experience?', a: 'No, Kilimanjaro is a trekking mountain. However, superb cardiovascular fitness and determination are highly recommended.' }
    ],
    nearbyAttractions: ['Moshi Town', 'Materuni Waterfalls', 'Chemka Hot Springs'],
    mapQuery: 'Mount Kilimanjaro Tanzania'
  },
  meru: {
    tagline: 'Tanzania\'s Spectacular Second Highest Peak & Wildlife Haven',
    bestTime: 'June to October (Clear views of Kilimanjaro)',
    duration: '3 - 4 Days',
    wildlife: 'Colobus Monkeys, Leopards, Giraffes, Buffaloes',
    overview: 'Mount Meru is a stunning stratovolcano located inside Arusha National Park. Rising to 4,562 meters, it serves as a spectacular trek in its own right, offering unmatched views of Mount Kilimanjaro and rich wildlife encounters along its lower slopes.',
    highlights: [
      'Hike with an armed ranger through rich wildlife habitats',
      'Walk along a dramatic volcanic crater ridge rim',
      'Enjoy spectacular morning views of neighboring Mount Kilimanjaro'
    ],
    thingsToDo: [
      '4-Day guided mountain climb to Socialist Peak',
      'Walking safaris on the lower slopes',
      'Arusha National Park game drives'
    ],
    travelTips: [
      'Perfect acclimatization trek prior to climbing Kilimanjaro',
      'Keep a lookout for beautiful black-and-white colobus monkeys in the canopy',
      'Sturdy hiking poles are highly beneficial on the sandy scree paths near the summit'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Is Mount Meru harder than Kilimanjaro?', a: 'Meru is steeper and physically demanding, but its shorter duration makes it a fantastic, compact mountain challenge.' }
    ],
    nearbyAttractions: ['Momella Lakes', 'Arusha Town'],
    mapQuery: 'Mount Meru Tanzania'
  },
  lengai: {
    tagline: 'The Mountain of God & Active Carbonatite Volcano',
    bestTime: 'June to September (Dry cool hiking nights)',
    duration: '1 - 2 Days',
    wildlife: 'Flamingos in nearby Lake Natron, Zebras, Golden Jackals',
    overview: 'Ol Doinyo Lengai is an active volcano located in the Gregory Rift valley. Known by the Maasai as the "Mountain of God", it is the only active volcano in the world that erupts natrocarbonatite lava, a unique, cool, silvery-black lava.',
    highlights: [
      'Climb an active volcanic cone under starlit night skies',
      'Witness unique bubbling silver-black lava inside the crater',
      'Explore the dramatic Rift Valley and Lake Natron salt flats'
    ],
    thingsToDo: [
      'Midnight volcanic summit climb',
      'Lake Natron flamingo viewing walks',
      'Local Maasai cultural village walks'
    ],
    travelTips: [
      'The climb is extremely steep and scree-heavy; professional hiking boots are mandatory',
      'Climbs start at midnight to reach the summit by sunrise and avoid the brutal daytime heat',
      'Bring plenty of drinking water and a reliable headlamp'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Is Ol Doinyo Lengai safe to climb?', a: 'Yes, but it is physically challenging due to the steep gradient. Climbs are accompanied by local guides who monitor volcano activity.' }
    ],
    nearbyAttractions: ['Lake Natron', 'Ngare Sero Waterfalls'],
    mapQuery: 'Ol Doinyo Lengai Tanzania'
  },
  selous: {
    tagline: 'Untamed Riverine Wilderness & Africa\'s Largest Game Reserve',
    bestTime: 'June to October (Dry season river banks)',
    duration: '3 - 4 Days',
    wildlife: 'Endangered Wild Dogs, Hippos, Crocodiles, Apex Cats',
    overview: 'Nyerere National Park (formerly Selous Game Reserve) is one of the largest protected wildlife areas in the world. Its dramatic Rufiji River network provides a gorgeous backdrop for water safaris, teeming with hippos, crocodiles, and the rare African wild dog.',
    highlights: [
      'Experience a unique boat safari along the mighty Rufiji River',
      'Track endangered African wild dogs in untouched wilderness',
      'Join an intimate guided walking safari with armed rangers'
    ],
    thingsToDo: [
      'Rufiji River boat safari',
      'Guided walking bush treks',
      'Full-day game driving in private sectors'
    ],
    travelTips: [
      'Excellent choice for travelers flying directly from Zanzibar (only 30-min flight)',
      'A boat safari is highly recommended—it offers a unique perspective on wildlife',
      'Stay in a riverside lodge for the ultimate tranquil sounds of Africa'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Can you fly to Selous from Zanzibar?', a: 'Yes! Daily coastal flights operate between Zanzibar and Selous, making it the perfect 2-3 day beach-and-safari add-on.' }
    ],
    nearbyAttractions: ['Rufiji River', 'Mikumi National Park'],
    mapQuery: 'Nyerere National Park Tanzania'
  },
  ruaha: {
    tagline: 'Remote, Rugged & Dramatic Big Cat Territory',
    bestTime: 'June to October (Excellent predator activity)',
    duration: '3 - 4 Days',
    wildlife: 'Huge Lion Prides, Cheetahs, Wild Dogs, Elephants, Kudus',
    overview: 'Ruaha National Park is a rugged, remote paradise famous for its massive populations of elephants and bold predator prides. Its spectacular baobab-studded scenery and wild rivers offer an authentic, private safari atmosphere with very few other vehicles.',
    highlights: [
      'Witness epic battles between massive lion prides and buffaloes',
      'Explore pristine, rugged scenery filled with baobabs and wild rivers',
      'Spot rare antelopes like the Greater and Lesser Kudu'
    ],
    thingsToDo: [
      'Prickly bush tracking game drives',
      'Dry river bed walking tours',
      'Luxury fly-camping in deep wild concessions'
    ],
    travelTips: [
      'Great for seasoned safari enthusiasts who prefer remote, uncrowded parks',
      'Take advantage of coastal light aircraft flights connecting from Zanzibar or Dar es Salaam',
      'Keep binoculars handy to watch high-intensity predator behavior near water holes'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Why is Ruaha called a hidden gem?', a: 'Because it is located in the southern circuit and receives a fraction of the visitors of the northern parks, while having an equally dense predator population.' }
    ],
    nearbyAttractions: ['Nyerere National Park', 'Iringa Town Heritage'],
    mapQuery: 'Ruaha National Park Tanzania'
  },
  mikumi: {
    tagline: 'Zanzibar\'s Most Accessible Safari & The Mkata Floodplains',
    bestTime: 'Year-round, best in June to October',
    duration: '2 - 3 Days',
    wildlife: 'Lions, Giraffes, Zebras, Wildebeest, Elands, Leopards',
    overview: 'Mikumi National Park is nestled between the Uluguru Mountains and the Lumango range. Its open horizons and rich floodplains draw comparison to the Serengeti, providing excellent and easy wildlife viewing for travelers seeking a short, high-value safari.',
    highlights: [
      'Spot the beautiful Maasai Giraffes feeding in acacia forests',
      'Observe elephants and lions on the open Mkata Floodplain',
      'Visit the local hippo pools to see hundreds of hippos up close'
    ],
    thingsToDo: [
      'Mkata Floodplain game drives',
      'Hippo pool morning visits',
      'Local Swahili village cultural tours'
    ],
    travelTips: [
      'By far the easiest safari destination to access by vehicle or light aircraft from Zanzibar and Dar es Salaam',
      'Perfect for a 2-day/1-night quick safari escape',
      'Visit the local hippo pools in the late afternoon for active feeding shows'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Is a weekend safari in Mikumi sufficient?', a: 'Yes! A 2-day/1-night trip gives you ample time to explore the main floodplains and spot lions, elephants, giraffes, and hippos.' }
    ],
    nearbyAttractions: ['Udzungwa Mountains', 'Selous Game Reserve'],
    mapQuery: 'Mikumi National Park Tanzania'
  },
  unguja: {
    tagline: 'The Spice Island Core, Historic Stone Town & White Sands',
    bestTime: 'June to October (Cool dry season) or December to February',
    duration: '3 - 7 Days',
    wildlife: 'Rare Red Colobus Monkeys, Dolphins, Green Turtles',
    overview: 'Unguja is the largest and most famous island of the Zanzibar Archipelago. It blends exotic spice plantations, the historic streets of Stone Town, and pristine palm-fringed coral beaches like Nungwi and Kendwa.',
    highlights: [
      'Wander the ancient spice-scented alleyways of Stone Town (UNESCO)',
      'Swim with wild sea turtles in natural coral lagoons',
      'Track endangered Red Colobus monkeys in Jozani Forest'
    ],
    thingsToDo: [
      'Stone Town cultural historical walking tour',
      'Nungwi beach relaxation and sunset dhow cruises',
      'Safari Blue sandbank full-day snorkeling cruise'
    ],
    travelTips: [
      'Stay in Stone Town for 1-2 nights to soak in the culture, then head to the beaches',
      'Respect local cultures by dressing modestly when walking through Stone Town',
      'Kendwa Beach has minimal tide changes, making it ideal for swimming at any hour'
    ],
    gallery: [
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Is Unguja safe for solo travelers?', a: 'Yes, Unguja is highly welcoming and safe. Standard travel vigilance applies, especially in busy Stone Town alleys.' }
    ],
    nearbyAttractions: ['Prison Island', 'Jozani Forest', 'Mnemba Atoll'],
    mapQuery: 'Zanzibar Unguja Tanzania'
  },
  pemba: {
    tagline: 'The Green Island & Elite Marine Diving Concessions',
    bestTime: 'July to October or January to March',
    duration: '3 - 5 Days',
    wildlife: 'Pemba Flying Foxes, Green Turtles, Whale Sharks',
    overview: 'Pemba Island is a lush, hilly sanctuary famous for its deep clove plantations and untouched marine coral reefs. Far quieter than Unguja, Pemba is a dream destination for diving enthusiasts and travelers seeking secluded luxury.',
    highlights: [
      'Dive in spectacular underwater vertical drop-off walls',
      'Explore dense clove forests and organic spice farms',
      'Relax on isolated sandbanks with crystal clear waters'
    ],
    thingsToDo: [
      'Deep sea scuba diving in Pemba channel',
      'Ngezi Forest nature trek',
      'Sandbank picnic and snorkeling'
    ],
    travelTips: [
      'Ideal for advanced scuba divers seeking healthy wall dives',
      'Book a resort with a dedicated dive center for smooth daily logistics',
      'Pack lightweight rain gear as Pemba is beautifully lush and green year-round'
    ],
    gallery: [
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    faqs: [
      { q: 'How do I get to Pemba Island?', a: 'Pemba is accessible via a short 20-minute flight from Zanzibar (Unguja) airport or Dar es Salaam.' }
    ],
    nearbyAttractions: ['Misali Island Marine Park', 'Ngezi Forest Reserve'],
    mapQuery: 'Pemba Island Tanzania'
  },
  'stone-town': {
    tagline: 'Step back in time inside Zanzibar\'s ancient heart',
    bestTime: 'Year-round, dry months preferred',
    duration: '1 - 2 Days',
    wildlife: 'Swahili cultural heritage & vibrant street life',
    overview: 'Stone Town is the historic heart of Zanzibar City, a stunning labyrinth of narrow winding alleyways, spice markets, grand carved wooden doors, and historic limestone architectures blending Arab, Persian, Indian, and European influences.',
    highlights: [
      'Wander the maze of historic, narrow coral-stone streets',
      'Discover the House of Wonders and the Old Fort',
      'Indulge in fresh seafood at the lively Forodhani Gardens night market'
    ],
    thingsToDo: [
      'Guided historical architecture walking tour',
      'Sunset rooftop dining with panoramic minaret views',
      'Browse traditional fabric, jewelry, and local art bazaars'
    ],
    travelTips: [
      'Dress conservatively out of respect for local Islamic culture (cover shoulders and knees)',
      'Hire a licensed guide to avoid getting lost and to unlock rich historical contexts',
      'Enjoy fresh local sugarcane juice at the waterfront parks'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Is Stone Town walkable?', a: 'Completely. Cars are banned in the narrowest lanes, making walking the absolute best way to experience it.' }
    ],
    nearbyAttractions: ['Prison Island', 'Spice Farms', 'Jozani Forest'],
    mapQuery: 'Stone Town Zanzibar'
  },
  'prison-island': {
    tagline: 'Historic quarantine island and giant tortoise sanctuary',
    bestTime: 'Year-round, morning visits are best',
    duration: 'Half Day',
    wildlife: '100+ year old Aldabra Giant Tortoises, Peacocks',
    overview: 'Prison Island (Changuu Island) is a small, scenic tropical getaway located just 5.6 km off Stone Town. Originally built as a prison quarantine station, it is today a serene sanctuary for giant tortoises gifted from Seychelles.',
    highlights: [
      'Interact with and feed ancient Aldabra Giant Tortoises',
      'Tour the historic ruins of the old quarantine jailhouse',
      'Snorkel the vibrant shallow coral reef surrounding the island'
    ],
    thingsToDo: [
      'Feed and photograph the giant Aldabra tortoises',
      'Walk through the historical prison museum',
      'Relax on the beautiful white sandbank spit'
    ],
    travelTips: [
      'The traditional motorized dhow boat ride from Stone Town takes about 20-30 minutes',
      'Combine this with a Stone Town city tour for a perfect full-day trip',
      'Wear swimming gear as the snorkeling right off the boat is excellent'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'Are the tortoises wild?', a: 'They live in a large, spacious sanctuary where you can walk amongst them under shady trees.' }
    ],
    nearbyAttractions: ['Stone Town', 'Nakupenda Sandbank'],
    mapQuery: 'Changuu Island Zanzibar'
  },
  mafia: {
    tagline: 'Swim with Majestic Whale Sharks & Protected Marine Havens',
    bestTime: 'October to February (Best whale shark sighting window)',
    duration: '3 - 5 Days',
    wildlife: 'Whale Sharks, Seahorses, Coral Reef Networks, Fruit Bats',
    overview: 'Mafia Island is a tranquil, eco-conscious tropical paradise. Its protected Marine Park encompasses diverse coral ecosystems, providing a safe haven for seahorses, sea turtles, and majestic whale sharks that feed in the shallow channels.',
    highlights: [
      'Swim safely with giant, gentle Whale Sharks in the wild',
      'Snorkel in Chole Bay, Africa\'s finest marine park sanctuary',
      'Wander through historical ruins on Chole Island'
    ],
    thingsToDo: [
      'Whale Shark swimming excursions',
      'Chole Bay coral drift diving',
      'Bird-watching boat cruises in mangrove estuaries'
    ],
    travelTips: [
      'The whale shark season runs from October through February; plan accordingly',
      'Bring cash (USD/TZS) as ATM access is extremely limited on the island',
      'Mafia is a quiet island focused on marine nature; do not expect heavy nightlife'
    ],
    gallery: [
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    faqs: [
      { q: 'Is swimming with whale sharks safe?', a: 'Absolutely. Whale sharks are gentle filter-feeders with no teeth. Excursions follow strict ecological guidelines.' }
    ],
    nearbyAttractions: ['Chole Island Ruins', 'Juani Island Blue Lagoon'],
    mapQuery: 'Mafia Island Tanzania'
  }
};

export default function Destinations({ navigate }: { navigate: (page: Page) => void }) {
  const [siteContent] = useState(getSiteContent());
  const [tours] = useState<TourItem[]>(siteContent.tours || []);
  const [hotels] = useState(getHotels());

  // Navigation states linked to URL Hash
  const [currentDestId, setCurrentDestId] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingModalProduct, setBookingModalProduct] = useState({ name: '', category: '', price: 120 });
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [selectedDestTab, setSelectedDestTab] = useState<'all' | 'zanzibar' | 'safaris' | 'treks'>('all');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('destinations/') && hash !== 'destinations') {
        const id = hash.split('/')[1];
        setCurrentDestId(id || null);
      } else {
        setCurrentDestId(null);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Map simple destination ID back to structured list data
  const currentDestObj = useMemo(() => {
    if (!currentDestId) return null;
    const cmsDest = (siteContent.destinations || []).find((d: any) => d.id === currentDestId);
    const defaults = DESTINATION_FALLBACKS[currentDestId] || {
      tagline: 'Magnificent Swahili Coast Discovery',
      bestTime: 'June to October',
      duration: '3 - 5 Days',
      wildlife: 'Exotic Swahili Coast Species',
      overview: 'Experience the pristine landscapes, high-quality hospitality, and ultimate travel trails of Tanzania.',
      highlights: ['Scenic photography', 'Expert local guides', 'Seamless transport logistics'],
      thingsToDo: ['Guided scenic hikes', 'Cultural village walkabouts', 'Sunset dhow excursions'],
      travelTips: ['Always carry fresh drinking water', 'Respect local traditions', 'Pack comfortable active shoes'],
      gallery: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80'],
      faqs: [{ q: 'Is transit logistics covered?', a: 'Yes! Every booking handles high-tier, air-conditioned private vehicle or flight shuttles.' }],
      nearbyAttractions: ['Stone Town', 'Local Spice Farms'],
      mapQuery: 'Zanzibar Tanzania'
    };

    return {
      id: currentDestId,
      name: cmsDest?.name || currentDestId.charAt(0).toUpperCase() + currentDestId.slice(1) + ' National Park',
      image: cmsDest?.image || (cmsDest as any)?.img || defaults.gallery[0],
      description: cmsDest?.description || defaults.overview,
      ...defaults
    };
  }, [currentDestId, siteContent]);

  // Tours related to this destination
  const relatedTours = useMemo(() => {
    if (!currentDestId) return [];
    return tours.filter(t => {
      const destId = currentDestId.toLowerCase();
      const hasDestId = (t as any).destinationIds?.includes(currentDestId);
      const titleMatch = (t.title || '').toLowerCase().includes(destId);
      const descMatch = (t.shortDesc || '').toLowerCase().includes(destId);
      return hasDestId || titleMatch || descMatch;
    });
  }, [tours, currentDestId]);

  // Packages (Holiday Packages) related
  const relatedPackages = useMemo(() => {
    if (!currentDestId) return [];
    return tours.filter(t => {
      const isPkg = t.category === 'packages' || t.category === 'package';
      if (!isPkg) return false;
      const destId = currentDestId.toLowerCase();
      const hasDestId = (t as any).destinationIds?.includes(currentDestId);
      const titleMatch = (t.title || '').toLowerCase().includes(destId);
      const descMatch = (t.shortDesc || '').toLowerCase().includes(destId);
      return hasDestId || titleMatch || descMatch;
    });
  }, [tours, currentDestId]);

  const CARDS_DATA = useMemo(() => [
    {
      id: 'unguja',
      name: 'Zanzibar Coast & Beaches',
      tagline: 'Pristine white sands & turquoise Indian Ocean waters',
      image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1200&q=80',
      stat: 'From $399',
      category: 'zanzibar',
      gridClass: 'md:col-span-2 md:row-span-1'
    },
    {
      id: 'stone-town',
      name: 'Stone Town Cultural Hub',
      tagline: 'Ancient Swahili architectures & exotic spice alleys',
      image: 'https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=1200&q=80',
      stat: 'From $149',
      category: 'zanzibar',
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 'serengeti',
      name: 'Serengeti National Park',
      tagline: 'Classic wildlife safaris & the Great Wildebeest Migration',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      stat: 'From $899',
      category: 'safaris',
      gridClass: 'md:col-span-2 md:row-span-2'
    },
    {
      id: 'ngorongoro',
      name: 'Ngorongoro Crater',
      tagline: 'The pristine Eden shelter of dense predator prides & rhinos',
      image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1200&q=80',
      stat: 'From $799',
      category: 'safaris',
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 'kilimanjaro',
      name: 'Mount Kilimanjaro',
      tagline: 'Conquer the spectacular volcanic snowy roof of Africa',
      image: 'https://images.unsplash.com/photo-1589553460730-1651fa2de0c7?auto=format&fit=crop&w=1200&q=80',
      stat: 'From $1,499',
      category: 'treks',
      gridClass: 'md:col-span-2 md:row-span-1'
    },
    {
      id: 'pemba',
      name: 'Pemba Island Seclusion',
      tagline: 'Lush clove hills and world-class vertical dive walls',
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
      stat: 'From $699',
      category: 'zanzibar',
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 'prison-island',
      name: 'Prison Island Sanctuary',
      tagline: 'Meet Aldabra giant tortoises & tour the historic old quarantine station',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      stat: 'From $99',
      category: 'zanzibar',
      gridClass: 'md:col-span-1 md:row-span-1'
    }
  ], []);

  const filteredCards = useMemo(() => {
    return CARDS_DATA.filter(card => {
      const matchSearch = card.name.toLowerCase().includes(destSearchQuery.toLowerCase()) || 
                          card.tagline.toLowerCase().includes(destSearchQuery.toLowerCase());
      const matchTab = selectedDestTab === 'all' || card.category === selectedDestTab;
      return matchSearch && matchTab;
    });
  }, [CARDS_DATA, destSearchQuery, selectedDestTab]);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-16 selection:bg-[#D4A017] selection:text-white mt-16 font-sans">
      
      {/* 1. DEDICATED CLEAN DESTINATION PAGE VIEW */}
      {currentDestObj ? (
        <div className="animate-fade-in space-y-12">
          
          {/* Hero Banner Area */}
          <div className="relative h-[65vh] min-h-[420px] w-full flex items-end overflow-hidden">
            <img 
              src={currentDestObj.image} 
              alt={currentDestObj.name} 
              className="absolute inset-0 w-full h-full object-cover transform scale-100 hover:scale-105 transition-all duration-10000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/20" />
            
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 relative z-10 space-y-3">
              <button 
                onClick={() => window.location.hash = 'destinations'}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl mb-4 backdrop-blur-md transition-all border border-white/10 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Destinations</span>
              </button>
              
              <div className="space-y-2">
                <span className="bg-[#D4A017] text-[#020C1F] text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full">
                  CURATED DESTINATION
                </span>
                <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase leading-none">
                  {currentDestObj.name}
                </h1>
                <p className="text-slate-300 font-light text-xs sm:text-sm max-w-xl">
                  {currentDestObj.tagline}
                </p>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl pt-4 text-white">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Best Season</span>
                  <span className="text-[11px] font-bold">{currentDestObj.bestTime}</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Wildlife Highlight</span>
                  <span className="text-[11px] font-bold">{currentDestObj.wildlife}</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Ideal Duration</span>
                  <span className="text-[11px] font-bold">{currentDestObj.duration}</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Client Rating</span>
                    <span className="text-[11px] font-bold">4.9 / 5.0</span>
                  </div>
                  <Star size={12} className="text-[#D4A017] fill-[#D4A017]" />
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout of Destination sections */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            {/* Overview & Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 space-y-4 shadow-sm">
                  <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Info className="text-[#0B3B8C]" size={18} />
                    <span>Overview</span>
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-xs sm:text-sm font-light whitespace-pre-line">
                    {currentDestObj.description}
                  </p>
                </div>

                {/* Highlights and Things to Do */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 space-y-4 shadow-sm">
                  <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="text-[#D4A017]" size={18} />
                    <span>Key Highlights & Things to Do</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentDestObj.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-[#0B3B8C]/10 text-[#0B3B8C] flex items-center justify-center font-mono font-bold text-[10px] shrink-0">{idx + 1}</span>
                        <span className="text-xs text-slate-600 leading-relaxed font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Book / Travel Tips side panel */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#0A1224] to-[#0B3B8C] text-white p-6 rounded-3xl text-center space-y-4 shadow-xl">
                  <h3 className="text-base font-serif font-bold text-white uppercase tracking-tight">Ready to Experience?</h3>
                  <p className="text-xs text-slate-300 font-light">
                    Have our custom travel operators book an all-inclusive customized private tour to {currentDestObj.name}.
                  </p>
                  <button 
                    onClick={() => {
                      setBookingModalProduct({
                        name: `${currentDestObj.name} Explorer`,
                        category: 'tour',
                        price: 150
                      });
                      setBookingModalOpen(true);
                    }}
                    className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black uppercase text-xs py-3.5 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Book Experience Now
                  </button>
                </div>

                {/* Travel Tips */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-[#0B3B8C] uppercase tracking-wider">Useful Travel Tips</h4>
                  <ul className="space-y-3">
                    {currentDestObj.travelTips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-600 leading-relaxed font-light">
                        <span className="text-[#D4A017] font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Google Map Section */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                <Globe className="text-[#0B3B8C]" size={18} />
                <span>Geographic Map Location</span>
              </h3>
              <div className="rounded-2xl overflow-hidden h-72 border border-slate-100 relative">
                <iframe 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(currentDestObj.mapQuery)}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0" 
                  allowFullScreen={true} 
                  loading="lazy" 
                />
              </div>
            </div>

            {/* Recommended Tours & Packages */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-black text-slate-900 uppercase">Recommended Tours & Packages</h3>
              
              {relatedTours.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedTours.map((tour, idx) => {
                    const tourTitle = tour.title || (tour as any).name || 'Excursion';
                    const tourImg = tour.img || (tour as any).image || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80';
                    const tourPrice = (tour as any).basePrice || (typeof tour.price === 'number' ? tour.price : parseFloat(String(tour.price).replace(/[^0-9.]/g, '')) || 120);
                    return (
                      <div key={`${tour.id}-${idx}`} className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-all items-center">
                        <img src={tourImg} alt={tourTitle} className="w-16 h-16 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{tourTitle}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{tour.duration || 'Flexible'} • ${tourPrice} USD</p>
                          <button
                            onClick={() => {
                              setBookingModalProduct({
                                name: tourTitle,
                                category: tour.category || 'tour',
                                price: tourPrice
                              });
                              setBookingModalOpen(true);
                            }}
                            className="text-[#0B3B8C] hover:text-[#D4A017] text-[10px] font-bold mt-1 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Book Tour Now</span>
                            <ArrowRight size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 font-light">Custom specialized itineraries matching {currentDestObj.name} will be designed on request.</p>
                </div>
              )}
            </div>

            {/* Gallery images */}
            {currentDestObj.gallery && currentDestObj.gallery.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <Camera className="text-[#0B3B8C]" size={18} />
                  <span>Visual Gallery</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {currentDestObj.gallery.map((img, idx) => (
                    <div key={idx} className="h-40 bg-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            <div className="space-y-4">
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="text-[#D4A017]" size={18} />
                <span>Frequently Asked Questions</span>
              </h3>
              <div className="space-y-3">
                {currentDestObj.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-bold text-[#0B3B8C] uppercase tracking-wider block">Question • {faq.q}</span>
                    <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        
        // 2. MAIN CATEGORIES OVERVIEW PAGE VIEW
        <div className="animate-fade-in space-y-16 pb-20">
          
          {/* Stunning Hero Header section */}
          <div className="relative w-full h-[45vh] min-h-[350px] flex items-center justify-center overflow-hidden bg-[#0A1224] rounded-b-[40px] shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1600&q=80" 
              alt="Zanzibar Destination Hero" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1224] via-[#0A1224]/55 to-black/10" />
            
            <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-6">
              <div className="inline-flex items-center gap-1.5 bg-[#D4A017]/10 text-[#D4A017] text-[10px] uppercase tracking-widest font-black px-4 py-1.5 rounded-full border border-[#D4A017]/20 backdrop-blur-md">
                <Sparkles size={11} className="animate-pulse" />
                <span>Curated East Africa Kingdoms</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase leading-none">
                OUR DESTINATIONS
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
                Discover Zanzibar's turquoise coasts, historic stone alleys, and Tanzania's legendary wildlife plains. Start exploring our handpicked premium destination hubs below.
              </p>

              {/* Integrated Search Input in Hero */}
              <div className="max-w-md mx-auto bg-white/95 rounded-2xl shadow-xl p-1.5 flex items-center border border-white/20 backdrop-blur-md">
                <div className="flex items-center pl-3 text-slate-400">
                  <Search size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search destinations (e.g. Serengeti, Stone Town...)" 
                  value={destSearchQuery}
                  onChange={(e) => setDestSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 text-xs font-semibold text-[#0A1224] placeholder:text-slate-450 focus:ring-0 outline-none px-2.5 py-2"
                />
                {destSearchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setDestSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 px-2 text-xs font-black"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Filters section */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2 border-b border-slate-100 pb-6">
              {[
                { id: 'all', label: 'All Circuits' },
                { id: 'zanzibar', label: 'Zanzibar Archipelago' },
                { id: 'safaris', label: 'Tanzania Safaris' },
                { id: 'treks', label: 'Mountain Treks' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDestTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all duration-300 border cursor-pointer ${
                    selectedDestTab === tab.id
                      ? 'bg-[#0B3B8C] border-[#0B3B8C] text-white shadow-md shadow-[#0B3B8C]/10'
                      : 'bg-white border-slate-100 text-slate-500 hover:text-[#0B3B8C] hover:border-[#0B3B8C]/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Asymmetrical Masonry Grid Layout of Destination Cards */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px] md:auto-rows-[280px]">
                {filteredCards.map(card => (
                  <div
                    key={card.id}
                    onClick={() => window.location.hash = `#destinations/${card.id}`}
                    className={`group relative rounded-[24px] overflow-hidden shadow-md border border-slate-150/45 cursor-pointer transform hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-end ${card.gridClass}`}
                  >
                    {/* Background Image */}
                    <img
                      src={card.image}
                      alt={card.name}
                      className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient overlay that shifts on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:via-black/50 transition-all duration-500" />
                    
                    {/* Dynamic Floating Key Stat (e.g. From $399) */}
                    <div className="absolute top-4 right-4 bg-[#D4A017] text-[#0A1224] text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-md">
                      {card.stat}
                    </div>

                    {/* Overlay Text Details */}
                    <div className="p-6 relative z-10 space-y-2">
                      <span className="text-[#D4A017] text-[9px] font-black uppercase tracking-widest block">
                        {card.category === 'zanzibar' ? 'Zanzibar Circuit' : card.category === 'safaris' ? 'Wilderness Safari' : 'Volcano Trek'}
                      </span>
                      <h3 className="text-xl md:text-2xl font-serif font-black tracking-tight text-white uppercase leading-tight">
                        {card.name}
                      </h3>
                      <p className="text-slate-300 text-xs font-light line-clamp-2 max-w-lg">
                        {card.tagline}
                      </p>
                      
                      {/* Interactive Button row that slides up on hover */}
                      <div className="pt-2 flex flex-wrap gap-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:translate-y-2 sm:group-hover:translate-y-0">
                        <span className="inline-flex items-center gap-1 bg-white/15 text-white hover:bg-white/25 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md transition-all">
                          <span>Explore Guide</span>
                          <ChevronRight size={12} />
                        </span>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.hash = `#tours?search=${encodeURIComponent(card.name.split(' ')[0])}`;
                          }}
                          className="inline-flex items-center gap-1 bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md"
                        >
                          <span>See Tours</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-[32px] shadow-sm max-w-xl mx-auto space-y-4">
                <div className="text-4xl text-slate-350">🗺️</div>
                <h3 className="text-base font-serif font-bold text-[#0A1224] uppercase tracking-wide">No destinations found</h3>
                <p className="text-xs text-slate-400 font-light max-w-sm mx-auto">
                  We couldn't find any destination matching "{destSearchQuery}". Please try another search keyword or circuit filter.
                </p>
                <button
                  onClick={() => {
                    setDestSearchQuery('');
                    setSelectedDestTab('all');
                  }}
                  className="px-5 py-2.5 bg-[#0B3B8C] text-white text-xs font-extrabold uppercase rounded-full shadow-md"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Booking popup modal state */}
      <UnifiedBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        packageName={bookingModalProduct.name}
        category={bookingModalProduct.category}
        basePrice={bookingModalProduct.price}
      />

    </div>
  );
}
