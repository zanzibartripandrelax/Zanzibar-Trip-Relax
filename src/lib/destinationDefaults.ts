export interface Destination {
  id: string; // unique slug e.g. "serengeti"
  name: string;
  region: 'northern' | 'southern' | 'western' | 'zanzibar';
  image: string;
  videoUrl?: string;
  description: string;
  history?: string;
  culture?: string;
  wildlife?: string;
  marineLife?: string;
  geography?: string;
  climate?: string;
  bestTime: string;
  whyVisit?: string;
  highlights: string[];
  topAttractions?: string[];
  thingsToDo?: string[];
  beaches?: string[];
  nationalParks?: string[];
  localExperiences?: string[];
  travelTips?: string[];
  weatherTemp?: string;
  weatherIcon?: 'sun' | 'cloud' | 'cloud-rain' | 'wind' | 'thermometer';
  mapUrl?: string;
  gallery?: string[];
  videos?: string[];
  faqs?: { q: string; a: string }[];
  relatedRestaurants?: string[];
  nearbyAttractions?: string[];
  similarDestinations?: string[]; // IDs of similar destinations
  travelGuide?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  stats?: { label: string; value: string }[];
  visible?: boolean;
  archived?: boolean;
}

export interface ActivityItem {
  id: string;
  name: string;
  description: string;
  image: string;
  destinationIds: string[]; // Linked destinations
  tags?: string[];
}

export const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'snorkeling',
    name: 'Snorkeling',
    description: 'Explore vibrant pristine coral gardens and swim with exotic reef fish in warm crystal-clear waters.',
    image: 'https://images.pexels.com/photos/1450363/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
    destinationIds: ['unguja', 'pemba', 'mafia'],
    tags: ['Marine', 'Adventure', 'Day Trip']
  },
  {
    id: 'safari',
    name: 'Wildlife Game Drives',
    description: 'Track the legendary Big Five across sweeping savanna plains in customized 4x4 open safari vehicles.',
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600',
    destinationIds: ['serengeti', 'tarangire', 'ngorongoro', 'selous', 'ruaha', 'mikumi', 'katavi'],
    tags: ['Wildlife', 'Safari', 'Multi-day']
  },
  {
    id: 'trekking',
    name: 'Mountain Trekking',
    description: 'Conquer Africa’s highest peaks, traversing dramatic volcanic landscapes and mist-shrouded rainforests.',
    image: 'https://images.unsplash.com/photo-1589553460730-dfeb1e41d8e1?auto=format&fit=crop&w=600&q=80',
    destinationIds: ['kilimanjaro', 'meru', 'udzungwa'],
    tags: ['Adventure', 'Hiking', 'Challenging']
  },
  {
    id: 'culture',
    name: 'Cultural Swahili Immersions',
    description: 'Engage with historic local communities, spice farmers, and witness traditional Swahili village lifestyles.',
    image: 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=600',
    destinationIds: ['unguja', 'ngorongoro', 'lengai'],
    tags: ['Culture', 'Local Experience', 'Family']
  },
  {
    id: 'diving',
    name: 'Scuba Diving',
    description: 'Descend into famous vertical coral drop-offs, deep walls, and explore diverse marine reserves.',
    image: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=600',
    destinationIds: ['unguja', 'pemba', 'mafia'],
    tags: ['Marine', 'Diving', 'Adventure']
  },
  {
    id: 'hiking',
    name: 'Nature Walks & Hiking',
    description: 'Guided wilderness foot safaris tracking endemic bird species and rare primates in protected reserves.',
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=600&q=80',
    destinationIds: ['arusha', 'udzungwa', 'kitulo', 'gombe', 'mahale'],
    tags: ['Hiking', 'Nature', 'Day Trip']
  }
];

export const DEFAULT_DESTINATIONS: Destination[] = [
  // ================= NORTHERN TANZANIA =================
  {
    id: 'serengeti',
    name: 'Serengeti National Park',
    region: 'northern',
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1200',
    videoUrl: 'https://www.youtube.com/embed/aD77-k1tZxs',
    description: 'The Serengeti is world-renowned for its vast, endless golden grasslands and hosting the Great Wildebeest Migration, where millions of ungulates traverse the plains in a circular survival race. It is arguably the ultimate arena for viewing lions, leopards, and cheetahs hunting in their natural, untouched habitat.',
    history: 'First established as a game reserve in 1921 and declared a national park in 1951, the Serengeti is the ancestral homeland of the Maasai people, who coexisted with the wildlife for centuries before conservation boundaries were drawn.',
    culture: 'The surrounding region is rich in Maasai heritage. Visitors can engage in respectful cultural excursions to traditional bomas, learning about the tribe\'s cattle-herding lifestyle, dynamic jumping dances, and intricate beadwork.',
    wildlife: 'Home to the world\'s largest concentrations of terrestrial predators, including over 4,000 lions, 1,000 leopards, and hundreds of cheetahs. It also hosts the Big Five, vast herds of elephants, buffaloes, giraffes, zebras, and over 500 species of birds.',
    geography: 'A vast ecosystem spanning approximately 14,750 square kilometers, characterized by endless short-grass plains in the south, rocky kopjes (granite outcrops) dotting the center, and acacia woodlands in the north.',
    climate: 'Generally warm and dry, with temperatures ranging from 15°C (59°F) at night to 28°C (82°F) during the day. The region features two rainfall periods: the short rains (November-December) and long rains (March-May).',
    bestTime: 'Late June to October for the dramatic Mara River crossings, and January to March to witness the spectacular wildebeest calving season in the southern Ndutu plains.',
    whyVisit: 'Witnessing the Great Migration is a life-changing spectacle. The sheer density of predators and the dramatic, sweeping, unobstructed views of the savanna are completely unmatched anywhere else in the world.',
    highlights: [
      'The Great Wildebeest Migration River Crossings',
      'Hot Air Balloon Safaris over the plains at sunrise',
      'Predator tracking around central Seronera Valley',
      'Exploring granite Kopjes where lions lounge'
    ],
    topAttractions: ['Seronera Valley', 'Grumeti River', 'Mara River', 'Ndutu Plains', 'Moru Kopjes'],
    thingsToDo: ['Sunrise Balloon Safari', 'Game Drive Excursions', 'Maasai Village Visit', 'Sunset Bush Dinners'],
    nationalParks: ['Serengeti National Park', 'Ngorongoro Conservation Area'],
    localExperiences: ['Maasai cultural singing and jumping ritual', 'Bush camping under stars'],
    travelTips: [
      'Pack dust-proof covers for cameras and long zoom lenses',
      'Bring warm clothing for early morning game drives',
      'Book lodging at least 8 months in advance for the migration season'
    ],
    weatherTemp: '27°C / 81°F',
    weatherIcon: 'sun',
    mapUrl: 'https://maps.google.com/maps?q=Serengeti+National+Park&t=&z=10&ie=UTF8&iwloc=&output=embed',
    gallery: [
      'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1547843/pexels-photo-1547843.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    videos: ['aD77-k1tZxs'],
    faqs: [
      { q: 'Is the Serengeti safe for children?', a: 'Yes, families regularly enjoy safaris in closed, secure 4x4 vehicles. Most lodges welcome children, though children under 6 may have game drive age limits in open vehicles.' },
      { q: 'Can we see the Big Five in the Serengeti?', a: 'Yes! Lions, leopards, elephants, and buffaloes are extremely common. Black rhinos are present but elusive, mostly sighted in the Moru Kopjes region.' }
    ],
    relatedRestaurants: ['Seronera Lodge Restaurant', 'Four Seasons Kula Sabor', 'Melia Savannah Lounge'],
    nearbyAttractions: ['Ngorongoro Crater', 'Ol Duvai Gorge', 'Lake Natron'],
    similarDestinations: ['ngorongoro', 'selous', 'ruaha'],
    travelGuide: 'A complete wilderness guide outlining safari vehicle configurations, standard tipping guidelines for safari guides ($20-$30 per day), and vaccine recommendations.',
    seoTitle: 'Serengeti Safari & Great Migration | Zanzibar Trip & Relax',
    seoDescription: 'Experience the magic of Serengeti National Park. Book tailored fly-in safaris from Zanzibar, witness the Great Wildebeest Migration, and track the legendary Big Five.',
    metaKeywords: ['Serengeti National Park', 'Serengeti Safari from Zanzibar', 'Great Migration', 'Tanzania Safari Packages', 'Big Five Safari'],
    stats: [
      { label: 'Area', value: '14,750 km²' },
      { label: 'Wildlife Species', value: '70+ Mammal Species' },
      { label: 'Big Five', value: 'All 5 Present' },
      { label: 'UNESCO Status', value: 'Inscribed 1981' }
    ],
    visible: true
  },
  {
    id: 'ngorongoro',
    name: 'Ngorongoro Crater',
    region: 'northern',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    description: 'The Ngorongoro Crater is the world\'s largest intact, unfilled volcanic caldera. Formed when a massive volcano exploded and collapsed millions of years ago, the crater rim houses a unique self-contained paradise sheltering over 25,000 large mammals, including a highly protected breeding population of critically endangered Black Rhinos.',
    history: 'Formed 2 to 3 million years ago, the caldera was designated a UNESCO World Heritage site in 1979. It is also adjacent to Oldupai Gorge, where the Leakey family discovered fossilized hominid remains dating back millions of years.',
    culture: 'The conservation area operates as a multiple land-use zone, allowing nomadic Maasai pastoralists to graze their livestock alongside wild herds, showing a beautiful balance of humans and wildlife.',
    wildlife: 'An incredibly dense animal population. You will easily spot massive bull elephants, herds of zebras, wildebeests, gazelles, hyenas, jackals, and a dense concentration of lions. It offers the absolute best chance in Tanzania to spot the rare black rhino.',
    geography: 'A deep volcanic crater measuring 19 kilometers in diameter and descending 610 meters from the rim to the volcanic floor, which contains grassland, fever-tree forests, and a central soda lake.',
    climate: 'The crater floor is warm and pleasant, while the rim sits at an altitude of 2,200m and gets very chilly and misty, with nighttime temperatures dropping to 10°C (50°F) or lower.',
    bestTime: 'Year-round. The dry season (June-October) offers easier animal spotting around waterholes, but the green season (November-May) brings beautiful birdlife and lush scenery.',
    whyVisit: 'Descending the steep crater wall into a self-contained Eden is a dramatic, unforgettable entrance. It is a highly efficient safari experience where the Big Five can easily be spotted in a single afternoon.',
    highlights: [
      'Spotting the endangered Black Rhino on the crater floor',
      'Breathtaking panoramic rim viewpoints at sunrise',
      'Picnic lunches by the hippo-filled Ngoitokitok Spring',
      'Visiting the historic Oldupai (Olduvai) Gorge museum'
    ],
    topAttractions: ['Lerai Forest', 'Lake Magadi', 'Ngoitokitok Springs', 'Oldupai Gorge', 'Olmoti Crater'],
    thingsToDo: ['Crater Floor Game Drive', 'Maasai Cultural Visit', 'Rim Walking Tours'],
    weatherTemp: '22°C / 71°F',
    weatherIcon: 'cloud',
    mapUrl: 'https://maps.google.com/maps?q=Ngorongoro+Crater&t=&z=10&ie=UTF8&iwloc=&output=embed',
    gallery: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80'
    ],
    faqs: [
      { q: 'How long are we allowed inside the Crater?', a: 'Standard crater floor transit permits are issued for a maximum of six (6) hours per vehicle per day to prevent environmental congestion.' }
    ],
    relatedRestaurants: ['Ngorongoro Crater Lodge Rim Dining', 'Serena Lodge View Restaurant'],
    nearbyAttractions: ['Serengeti National Park', 'Lake Manyara', 'Empakaai Crater'],
    similarDestinations: ['serengeti', 'manyara'],
    stats: [
      { label: 'Diameter', value: '19 km' },
      { label: 'Depth', value: '610 meters' },
      { label: 'Animal Count', value: '25,000+ Mammals' },
      { label: 'Black Rhinos', value: 'Breeding Colony' }
    ],
    visible: true
  },
  {
    id: 'tarangire',
    name: 'Tarangire National Park',
    region: 'northern',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    description: 'Known as the "Home of the Giants," Tarangire is famous for two extraordinary landmarks: colossal ancient Baobab trees that dot the undulating landscape, and massive herds of elephants (sometimes up to 300 strong) that gather along the life-giving Tarangire River during the dry months.',
    bestTime: 'June to October when thousands of migratory animals gather around the Tarangire River, creating wildlife densities rivaling the Serengeti.',
    whyVisit: 'Stunning landscapes dominated by ancient baobabs, exceptional elephant encounters, and outstanding bird watching with over 550 bird species.',
    highlights: ['Encountering elephant herds of 300+', 'Scenic views of towering thousand-year-old baobabs', 'Excellent predator action along the Tarangire Riverbed'],
    weatherTemp: '28°C / 82°F',
    weatherIcon: 'sun',
    stats: [
      { label: 'Area', value: '2,850 km²' },
      { label: 'Elephant Pop.', value: 'Over 4,000' },
      { label: 'Bird Species', value: '550+ Recorded' }
    ],
    visible: true
  },
  {
    id: 'manyara',
    name: 'Lake Manyara National Park',
    region: 'northern',
    image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
    description: 'Hemmed in between the dramatic vertical cliffs of the Great Rift Valley escarpment and a shimmering, pink-hued soda lake, Lake Manyara is legendary for its unique tree-climbing lions, dense evergreen groundwater forests, and vast flocks of flamingos lining the lakeshore.',
    bestTime: 'June to October for mammals; November to May (wet season) for breathtaking waterfalls, lush vegetation, and migratory birdwatching.',
    whyVisit: 'Witnessing tree-climbing lions lounging in acacia branches, night safaris, canoeing on the lake, and walking along the scenic treetop canopy walkway.',
    highlights: ['Tree-climbing lions sightings', 'Treetop Canopy Walkway strolls', 'Thousands of pink flamingos wading in the soda lake'],
    weatherTemp: '27°C / 80°F',
    weatherIcon: 'sun',
    stats: [
      { label: 'Area', value: '330 km²' },
      { label: 'Lake Coverage', value: 'Up to 200 km²' },
      { label: 'Avian Species', value: '400+ Types' }
    ],
    visible: true
  },
  {
    id: 'arusha',
    name: 'Arusha National Park',
    region: 'northern',
    image: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=1200&q=80',
    description: 'A multi-faceted gem sitting right on the doorstep of Tanzania\'s safari capital. Despite its compact size, Arusha National Park features breathtaking volcanic scenery, including the spectacular Mount Meru, the emerald Momella Lakes, Ngurdoto Crater, and lush montane forests hosting elegant black-and-white colobus monkeys.',
    bestTime: 'June to October and December to March for clear hiking skies and outstanding wildlife sightings.',
    whyVisit: 'Perfect for day-trip hiking safaris, scenic canoeing on Momella Lakes, and observing active groups of colobus monkeys in a tranquil wilderness without crowds.',
    highlights: ['Guided walking safaris alongside giraffes', 'Canoeing on Momella Lakes', 'Black-and-White Colobus primates tracking'],
    weatherTemp: '24°C / 75°F',
    weatherIcon: 'cloud',
    stats: [
      { label: 'Area', value: '137 km²' },
      { label: 'Mount Meru Peak', value: '4,562 meters' },
      { label: 'Walking Safaris', value: 'Highly Popular' }
    ],
    visible: true
  },
  {
    id: 'kilimanjaro',
    name: 'Mount Kilimanjaro',
    region: 'northern',
    image: 'https://images.unsplash.com/photo-1589553460730-dfeb1e41d8e1?auto=format&fit=crop&w=1200&q=80',
    description: 'Rising majestically above the dusty plains of East Africa, Mount Kilimanjaro is the iconic "Roof of Africa." As the world\'s tallest free-standing mountain and the highest point on the African continent, its snow-capped volcanic summit (Uhuru Peak) beckons thousands of intrepid trekkers every year.',
    bestTime: 'January to March and June to October when skies are clear, dry, and wind factors are minimal.',
    whyVisit: 'Conquering a legendary Seven Summit peak without requiring technical mountaineering equipment. The trek journeys through five distinct ecological zones—from tropical rainforest to arctic glaciers.',
    highlights: ['Standing on Uhuru Peak at 5,895 meters', 'Crossing the dramatic alpine desert zones', 'Breathtaking sunrise views over Mawenzi peak'],
    weatherTemp: '5°C / 41°F',
    weatherIcon: 'wind',
    stats: [
      { label: 'Elevation', value: '5,895 meters' },
      { label: 'Mountain Type', value: 'Free-standing Volcanic' },
      { label: 'Climbing Routes', value: '6 Main Paths' }
    ],
    visible: true
  },
  {
    id: 'meru',
    name: 'Mount Meru',
    region: 'northern',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    description: 'Mount Meru is Tanzania\'s second-highest mountain and the fifth-highest in Africa. It is a spectacular, steep-sided active stratovolcano featuring a dramatic collapsed caldera rim, offering breathtaking scenery and serving as an outstanding high-altitude acclimatization trek prior to climbing Kilimanjaro.',
    bestTime: 'June to October when weather is dry and visibility toward Mount Kilimanjaro is outstanding.',
    whyVisit: 'High-adrenaline volcanic ridge walking, intimate crowd-free wilderness trekking, and walking safaris through lush rainforests filled with giraffes and leopards.',
    highlights: ['Climbing the knife-edge volcanic crater rim', 'Spectacular views looking across to Mount Kilimanjaro', 'Guided forest walking safaris along the base'],
    weatherTemp: '12°C / 54°F',
    weatherIcon: 'wind',
    stats: [
      { label: 'Elevation', value: '4,562 meters' },
      { label: 'Volcanic Status', value: 'Active Stratovolcano' },
      { label: 'Climb Duration', value: '3 to 4 Days' }
    ],
    visible: true
  },
  {
    id: 'lengai',
    name: 'Ol Doinyo Lengai',
    region: 'northern',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    description: 'Known to the Maasai as the "Mountain of God," Ol Doinyo Lengai is a highly unique active volcano situated near Lake Natron. It is the only active volcano on Earth that erupts natrocarbonatite lava, a cold, silvery-black liquid that glows dark orange at night and turns white upon contact with moisture.',
    bestTime: 'June to September when trekking routes up the extremely steep, ash-covered slopes are dry and safe.',
    whyVisit: 'Witnessing active natrocarbonatite lava flows, embarking on an intense midnight volcano summit climb, and exploring the lunar landscapes of Lake Natron.',
    highlights: ['Midnight summit climb to witness active lava craters', 'Spectacular views over the desolate Lake Natron salt flats', 'Immersive Maasai cultural hikes around sacred foothills'],
    weatherTemp: '29°C / 84°F',
    weatherIcon: 'thermometer',
    stats: [
      { label: 'Elevation', value: '2,962 meters' },
      { label: 'Lava Type', value: 'Natrocarbonatite' },
      { label: 'Slope Gradient', value: 'Up to 45 Degrees' }
    ],
    visible: true
  },

  // ================= SOUTHERN TANZANIA =================
  {
    id: 'selous',
    name: 'Nyerere National Park (Selous)',
    region: 'southern',
    image: 'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=1200',
    description: 'Nyerere National Park, formerly known as the Selous Game Reserve, is one of the largest protected wildlife sanctuaries in Africa. Spanning pristine, untouched wilderness, it is bisected by the mighty Rufiji River, offering unique water-based boat safaris to spot massive crocodiles, pods of hippos, and rare wild dogs.',
    bestTime: 'June to October when wildlife congregates in huge numbers around the riverbanks and lakeshores.',
    whyVisit: 'Unrestricted off-road safaris, thrilling walking safaris, riverboat excursions, and exceptional sightings of endangered African wild dogs.',
    highlights: ['Scenic riverboat safaris on the Rufiji River', 'Tracking rare packs of African wild hunting dogs', 'Thrilling walking foot safaris with armed rangers'],
    weatherTemp: '30°C / 86°F',
    weatherIcon: 'sun',
    stats: [
      { label: 'Area', value: '30,893 km²' },
      { label: 'River System', value: 'Rufiji River Basin' },
      { label: 'Wild Dog Pop.', value: 'Largest in Africa' }
    ],
    visible: true
  },
  {
    id: 'ruaha',
    name: 'Ruaha National Park',
    region: 'southern',
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
    description: 'A rugged, semi-arid wilderness that feels completely untouched by tourism. Ruaha is legendary for its dramatic landscapes of baobabs and rocky gorges, its massive lion prides (which sometimes hunt giraffes and young elephants), and representing the geographical transition zone where East and Southern African species overlap.',
    bestTime: 'June to October when animals concentrate around the shrinking Great Ruaha River.',
    whyVisit: 'Exclusivity with almost no other tourist vehicles, witnessing massive lion prides, and seeing both Greater and Lesser Kudu in the same habitat.',
    highlights: ['Encountering giant lion prides of up to 30 members', 'Scenic safaris along the Great Ruaha River escarpment', 'Superb elephant tracking among ancient baobab trees'],
    weatherTemp: '29°C / 84°F',
    weatherIcon: 'sun',
    stats: [
      { label: 'Area', value: '20,226 km²' },
      { label: 'Elephant Pop.', value: '10,000+ Individuals' },
      { label: 'Lion Concentration', value: '10% of World Lions' }
    ],
    visible: true
  },
  {
    id: 'mikumi',
    name: 'Mikumi National Park',
    region: 'southern',
    image: 'https://images.unsplash.com/photo-1511216113906-8f57bb83e776?auto=format&fit=crop&w=1200&q=80',
    description: 'Bordered by the majestic Uluguru Mountains, Mikumi is the most accessible safari park from Dar es Salaam. Its central highlight is the Mkata Floodplain, often compared to the Serengeti for its sweeping, flat horizons, abundant herds of zebras, wildebeests, impalas, and elegant Maasai giraffes.',
    bestTime: 'Dry season (June to October) when animals gather in high densities around watering holes.',
    whyVisit: 'An easy, affordable weekend safari addition. It is highly accessible by highway and provides outstanding, reliable wildlife sightings within a short timeframe.',
    highlights: ['Game drives across the wide Mkata Floodplains', 'Observing large pods of hippos in the central pools', 'Scenic backdrop views of the Uluguru Mountain range'],
    weatherTemp: '28°C / 82°F',
    weatherIcon: 'sun',
    stats: [
      { label: 'Area', value: '3,230 km²' },
      { label: 'Flora Type', value: 'Makata Floodplains' },
      { label: 'Accessibility', value: 'Direct Highway Link' }
    ],
    visible: true
  },
  {
    id: 'udzungwa',
    name: 'Udzungwa Mountains',
    region: 'southern',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    description: 'Part of the ancient Eastern Arc Mountains, Udzungwa is a pristine tropical rainforest sanctuary known as the "Galapagos of Africa." It hosts extraordinary biodiversity, including 10 endemic primate species, beautiful waterfalls, and ancient closed forests with unique hiking opportunities.',
    bestTime: 'June to October when mountain hiking trails are less slippery and weather is pleasantly cool.',
    whyVisit: 'Exhilarating forest hikes, seeking the endemic Sanje Crested Mangabey and Iringa Red Colobus monkeys, and swimming in the pool of the 170m Sanje Waterfall.',
    highlights: ['Hiking the vertical trail to the 170m Sanje Waterfalls', 'Tracking the endemic Sanje Crested Mangabey monkey', 'Sweeping views over the Kilombero sugarcane valleys'],
    weatherTemp: '25°C / 77°F',
    weatherIcon: 'cloud-rain',
    stats: [
      { label: 'Area', value: '1,990 km²' },
      { label: 'Primate Species', value: '12 Species (10 Endemic)' },
      { label: 'Sanje Fall Height', value: '170 meters' }
    ],
    visible: true
  },
  {
    id: 'kitulo',
    name: 'Kitulo National Park',
    region: 'southern',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=80',
    description: 'Known as the "Bustani ya Mungu" (The Garden of God) or the "Serengeti of Flowers," Kitulo is a unique montane grassland plateau situated at 2,600m. It is a botanist\'s dream, hosting one of the greatest floral spectacles on Earth with 350 species of wildflowers, including 45 endemic orchid species.',
    bestTime: 'November to April (the rainy season) when the plateau explodes into a breathtaking carpet of multi-colored wildflowers.',
    whyVisit: 'Unrivaled montane botany, beautiful hiking across alpine meadows, outstanding alpine birding, and discovering rare endemic orchids.',
    highlights: ['Walking through carpets of 350+ wildflower species', 'Spotting rare endemic orchids and proteas', 'Hiking the stunning high-altitude Kipengere range'],
    weatherTemp: '16°C / 61°F',
    weatherIcon: 'wind',
    stats: [
      { label: 'Area', value: '412 km²' },
      { label: 'Elevation', value: '2,600 meters' },
      { label: 'Wildflower Types', value: '350+ Orchid Varieties' }
    ],
    visible: true
  },

  // ================= WESTERN TANZANIA =================
  {
    id: 'gombe',
    name: 'Gombe National Park',
    region: 'western',
    image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=1200&q=80',
    description: 'Gombe is Tanzania\'s smallest national park, located on the wild shores of Lake Tanganyika. It is globally famous as the site where legendary primatologist Dr. Jane Goodall conducted her pioneering, decades-long behavioral research on wild chimpanzee families starting in 1960.',
    bestTime: 'July to October (dry season) when chimpanzees reside on the lower forest slopes, making chimpanzee trekking easier.',
    whyVisit: 'An intimate, high-impact chimp tracking encounter, walking through Jane\'s historic valley paths, and swimming in the deep, ancient waters of Lake Tanganyika.',
    highlights: ['Chimpanzee trekking guided by tracking experts', 'Visiting "Jane\'s Peak" overlooking Lake Tanganyika', 'Exploring the Kakombe Waterfall trails in the forest'],
    weatherTemp: '26°C / 79°F',
    weatherIcon: 'cloud-rain',
    stats: [
      { label: 'Area', value: '52 km²' },
      { label: 'Chimp Pop.', value: 'Over 100 Chimpanzees' },
      { label: 'Lake Tanganyika', value: 'World\'s 2nd Deepest Lake' }
    ],
    visible: true
  },
  {
    id: 'mahale',
    name: 'Mahale Mountains',
    region: 'western',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    description: 'Arguably one of the most beautiful and remote destinations in Africa, Mahale is a paradise of mist-shrouded forested peaks rising directly from the white-sand beaches of turquoise Lake Tanganyika. It is home to Tanzania\'s largest population of wild chimpanzees (around 1,000 individuals).',
    bestTime: 'May to October when chimpanzees congregate in large family groups near the lower slopes and lake beaches.',
    whyVisit: 'The ultimate luxury chimpanzee trekking adventure, relaxing on pristine, private lake beaches, and kayaking on the crystal-clear Lake Tanganyika.',
    highlights: ['Tracking the famous "M Group" chimpanzees', 'Relaxing on private beaches of Lake Tanganyika', 'Kayaking and dhow cruises on the world\'s longest lake'],
    weatherTemp: '27°C / 80°F',
    weatherIcon: 'sun',
    stats: [
      { label: 'Area', value: '1,613 km²' },
      { label: 'Chimp Pop.', value: '1,000+ Chimpanzees' },
      { label: 'Peak Elevation', value: '2,462 meters' }
    ],
    visible: true
  },
  {
    id: 'katavi',
    name: 'Katavi National Park',
    region: 'western',
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
    description: 'An incredibly isolated, raw wilderness that receives very few visitors. Katavi is characterized by massive alluvial floodplains. During the dry season, the Katuma River shrinks to a muddy stream, forcing thousands of hippos to pack tightly together in spectacular territorial battles.',
    bestTime: 'July to October when water sources dry up, forcing thousands of buffaloes, elephants, and hippos into small, active water channels.',
    whyVisit: 'Absolute isolation with no other tourists, witnessing spectacular struggles among hundreds of hippos, and tracking massive herds of up to 1,000 buffaloes.',
    highlights: ['Witnessing aggressive territorial hippo battles of 200+', 'Encountering giant buffalo herds of 1,000+', 'Extremely high predator-to-prey ratios'],
    weatherTemp: '31°C / 88°F',
    weatherIcon: 'sun',
    stats: [
      { label: 'Area', value: '4,471 km²' },
      { label: 'Hippo Pop.', value: 'Vast, packed numbers' },
      { label: 'Tourist Counts', value: 'Fewer than a few hundred / year' }
    ],
    visible: true
  },

  // ================= ZANZIBAR ARCHIPELAGO =================
  {
    id: 'unguja',
    name: 'Unguja (Zanzibar Main Island)',
    region: 'zanzibar',
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
    videoUrl: 'https://www.youtube.com/embed/COH39I_8Vv8',
    description: 'Unguja, commonly known simply as Zanzibar Island, is the main and most populated island of the Zanzibar Archipelago. It is a stunning tropical island famous for its white-sand beaches, historical Stone Town core, spice farming cooperatives, and vibrant coral reefs.',
    history: 'A vital Omani-sultanate trading hub for ivory, spices, and textiles. The island core, Stone Town, is a beautiful fusion of Arab, Indian, Persian, Swahili, and European colonial architecture and historical significance.',
    culture: 'Rich Swahili culture heavily influenced by Arabian maritime traditions. Swahili hospitality, traditional dhow sailing crafts, and aromatic Swahili cuisine are fundamental to daily island life.',
    wildlife: 'The island hosts the lush Jozani Forest, home to the rare and endemic Zanzibar Red Colobus Monkey, as well as marine sanctuaries containing wild bottlenose dolphins, green sea turtles, and starfish.',
    marineLife: 'Abundant marine biodiversity around Mnemba Atoll and Chumbe Marine Reserve, containing coral gardens, reef sharks, and hundreds of tropical fish species.',
    geography: 'A low-lying coralline island stretching approximately 85 kilometers long and 30 kilometers wide, ringed by powdery white-sand beaches and barrier reefs.',
    climate: 'Tropical monsoonal climate with year-round warm temperatures averaging 26°C to 30°C (78°F to 86°F). The sea breeze provides cooling comfort.',
    bestTime: 'June to October (cool, dry season) and January to February (warm, dry period).',
    whyVisit: 'The perfect combination of tropical relaxation and deep cultural discovery. Walk historic streets, sail traditional dhows, and swim in turquoise waters.',
    highlights: [
      'Snorkeling the famous private marine reserve at Mnemba Atoll',
      'Getting lost in the historical coral-stone lanes of Stone Town',
      'Spotting rare endemic Red Colobus monkeys in Jozani Forest',
      'Taking a classic organic spice farm sensory tasting tour'
    ],
    topAttractions: ['Stone Town', 'Nungwi Beach', 'Jozani Chwaka Bay', 'Prison Island', 'Mnemba Atoll'],
    thingsToDo: ['Safari Blue Marine Sailing Cruise', 'Snorkeling Expeditions', 'Sunset Dhow Cruise', 'Cultural Walking Tour'],
    beaches: ['Nungwi Beach', 'Kendwa Beach', 'Paje Beach', 'Matemwe Beach', 'Jambiani Beach'],
    localExperiences: ['Organic spice tasting farm lunch', 'Candlelit Swahili rooftop dinner'],
    travelTips: [
      'Dress modestly when walking in Stone Town and local villages',
      'Always ask for permission before taking photographs of locals',
      'Carry some local Tanzanian Shillings or small USD cash bills'
    ],
    weatherTemp: '29°C / 84°F',
    weatherIcon: 'sun',
    mapUrl: 'https://maps.google.com/maps?q=Zanzibar+Island&t=&z=10&ie=UTF8&iwloc=&output=embed',
    gallery: [
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    videos: ['COH39I_8Vv8', 'L38fR_vK-iU'],
    faqs: [
      { q: 'Is Stone Town safe to walk at night?', a: 'Yes, Stone Town is generally very safe, but we advise sticking to well-lit main streets and avoiding dark alleyways late at night.' },
      { q: 'Do I need reef shoes for swimming?', a: 'We highly suggest wearing protective water/reef shoes on East Coast beaches like Paje and Jambiani to avoid stepping on sea urchins.' }
    ],
    relatedRestaurants: ['Emerson Spice Rooftop Tea House', 'The Rock Restaurant Zanzibar', 'Forodhani Night Market'],
    nearbyAttractions: ['Prison Island Sanctuary', 'Nakupenda Sandbank', 'Kizimkazi Dolphin Coast'],
    similarDestinations: ['pemba', 'mafia'],
    travelGuide: 'A comprehensive beach and cultural guide, outlining Swahili cultural attire etiquettes, money exchange tips, and the best local sunset viewpoints.',
    seoTitle: 'Zanzibar Island Travel Guide | Zanzibar Trip & Relax',
    seoDescription: 'Plan your ultimate Zanzibar vacation. Discover pristine beaches, historic Stone Town, and book exclusive tours like Safari Blue and Mnemba Atoll snorkeling.',
    metaKeywords: ['Zanzibar Island', 'Unguja Beach Vacation', 'Stone Town Tours', 'Mnemba Snorkeling', 'Zanzibar Travel Guide'],
    stats: [
      { label: 'Marine Species', value: '400+ Reef Species' },
      { label: 'Beaches', value: '25+ Powdery Beaches' },
      { label: 'Historical Sites', value: 'Stone Town (UNESCO)' },
      { label: 'Annual Visitors', value: '500,000+ Guests' }
    ],
    visible: true
  },
  {
    id: 'pemba',
    name: 'Pemba Island',
    region: 'zanzibar',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: 'Known as the "Green Island," Pemba is a lush, hilly, and undeveloped paradise lying north of Unguja. It is famous for producing the majority of Zanzibar\'s cloves and offering some of the most spectacular, pristine vertical wall scuba diving in East Africa.',
    bestTime: 'June to October when visibility is up to 40 meters, and seas are calm for boat diving.',
    whyVisit: 'Off-the-beaten-path island exploration, exploring rich mangrove forests, visiting ancient ruins, and diving deep, pristine channels alongside healthy reefs.',
    highlights: ['Deep scuba diving at Pemba Channel wall drop-offs', 'Walking through the ancient green Ngezi Rainforest', 'Exploring organic aromatic Clove plantations'],
    weatherTemp: '28°C / 82°F',
    weatherIcon: 'sun',
    stats: [
      { label: 'Clove Trees', value: '3.5+ Million Trees' },
      { label: 'Diving Visibility', value: 'Up to 40 meters' },
      { label: 'Marine Protection', value: 'Misali Island Conservation' }
    ],
    visible: true
  },
  {
    id: 'mafia',
    name: 'Mafia Island',
    region: 'zanzibar',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    description: 'Mafia Island is a tranquil, laid-back paradise located south of Zanzibar. Surrounded by a spectacular, legally protected marine park, its ultimate highlight is the unique opportunity to safely swim alongside massive, gentle Whale Sharks that feed in its nutrient-rich channels.',
    bestTime: 'October to February for guaranteed, unforgettable whale shark encounters; June to September for coral reef diving.',
    whyVisit: 'Swimming alongside wild whale sharks, diving in East Africa\'s largest marine park (Chole Bay), and exploring ancient, mossy historic ruins on tiny nearby islands.',
    highlights: ['Swimming alongside gentle Whale Sharks', 'Diving inside the rich Chole Bay Marine Park', 'Observing nesting green sea turtles on private sandbanks'],
    weatherTemp: '29°C / 84°F',
    weatherIcon: 'sun',
    stats: [
      { label: 'Whale Sharks', value: 'Migrating Population' },
      { label: 'Marine Park Area', value: '822 km² Protected' },
      { label: 'Coral Types', value: '50+ Hard Coral Genera' }
    ],
    visible: true
  }
];
