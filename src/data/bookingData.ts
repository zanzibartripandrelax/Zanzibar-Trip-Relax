// UNIFIED MASTER EXPERIENCE REPOSITORY
export interface PackageItem {
  id: string;
  name: string;
  category: 'tour' | 'kilimanjaro' | 'safari' | 'transfer' | 'packages';
  categoryLabel: string;
  basePrice: number;
  duration: string;
  includesPickup: boolean;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  description: string;
}

export interface HolidayPackageDetails {
  itinerary: { day: number; title: string; desc: string }[];
  hotels: string[];
  inclusions: string[];
  exclusions: string[];
  gallery: string[];
  reviewsList: { author: string; rating: number; text: string; date: string }[];
  faqs: { q: string; a: string }[];
  mapUrl: string;
}

export const allPackages: PackageItem[] = [
  // Excursions (Tours)
  {
    id: 'safari-blue',
    name: 'Safari Blue Adventure',
    category: 'tour',
    categoryLabel: 'Zanzibar Excursion',
    basePrice: 85,
    duration: 'Full Day (8 hrs)',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.96,
    reviews: 540,
    badge: 'Signature Excursion',
    description: 'Sail the turquoise waters of Menai Bay on a traditional dhow, snorkel coral reefs, and feast on unlimited lobsters.'
  },
  {
    id: 'stone-town',
    name: 'Stone Town Historical Tour',
    category: 'tour',
    categoryLabel: 'Zanzibar Excursion',
    basePrice: 45,
    duration: 'Half Day (4 hrs)',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.82,
    reviews: 204,
    badge: 'UNESCO Heritage',
    description: 'Explore the winding lanes, historical slave markets, old sultanates, and Freddie Mercury birthplace with certified guides.'
  },
  {
    id: 'prison-island',
    name: 'Prison Island Tour',
    category: 'tour',
    categoryLabel: 'Zanzibar Excursion',
    basePrice: 50,
    duration: 'Half Day (4 hrs)',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.85,
    reviews: 168,
    badge: 'Family Favorite',
    description: 'Visit historic Changuu Island to see Aldabra Giant Tortoises, swim in shallow coral sands, and explore colonial quarantine ruins.'
  },
  {
    id: 'mnemba-snorkeling',
    name: 'Mnemba Island Snorkeling',
    category: 'tour',
    categoryLabel: 'Zanzibar Excursion',
    basePrice: 35,
    duration: 'Half Day (5 hrs)',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.91,
    reviews: 412,
    badge: 'Best Coral Reefs',
    description: 'Snorkel the pristine marine sanctuary at Mnemba Atoll. Encounter wild spinner dolphins, turtles, and tropical coral fish.'
  },
  {
    id: 'spice-farm',
    name: 'Tangy Spice Farm Tour',
    category: 'tour',
    categoryLabel: 'Zanzibar Excursion',
    basePrice: 15,
    duration: '3 Hours',
    includesPickup: false,
    image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.78,
    reviews: 135,
    description: 'Smell, taste, and pick organic cardamoms, vanilla beans, cloves, and tropical fruits in organic plantations.'
  },
  {
    id: 'sunset-dhow',
    name: 'Sunset Dhow Cruise',
    category: 'tour',
    categoryLabel: 'Zanzibar Excursion',
    basePrice: 25,
    duration: '3 Hours',
    includesPickup: false,
    image: 'https://images.pexels.com/photos/1547843/pexels-photo-1547843.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.89,
    reviews: 247,
    badge: 'Highly Romantic',
    description: 'Glide on a traditional sailing dhow. Enjoy live Swahili music, local bites, and spectacular ocean sunset views.'
  },
  {
    id: 'jozani-forest',
    name: 'Jozani Forest National Park',
    category: 'tour',
    categoryLabel: 'Zanzibar Excursion',
    basePrice: 25,
    duration: 'Half Day (3 hrs)',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.79,
    reviews: 98,
    description: 'Walk through mangrove boardwalks and high canopy mahogany forest to photograph rare Red Colobus Monkeys.'
  },

  // Holiday Packages
  {
    id: '3-day-escape',
    name: '3-Day Zanzibar Romantic Escape',
    category: 'packages',
    categoryLabel: 'Zanzibar Package',
    basePrice: 350,
    duration: '3 Days / 2 Nights',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/1547843/pexels-photo-1547843.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.90,
    reviews: 142,
    badge: 'Couples Choice',
    description: 'Perfect for couples. Combining romantic Stone Town boutique hotels, private waterfront sails, and candle-lit rooftop dinners.'
  },
  {
    id: '5-day-beach-adventure',
    name: '5-Day Ultimate Beach & Tour Adventure',
    category: 'packages',
    categoryLabel: 'Zanzibar Package',
    basePrice: 650,
    duration: '5 Days / 4 Nights',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 5.0,
    reviews: 310,
    badge: 'Best Seller',
    description: 'Our legendary package. Uniting spice farms walk, Safari Blue ocean cruises, Jozani monkeys, and pristine Nungwi resort stays.'
  },
  {
    id: '7-day-zanzibar-combo',
    name: '7-Day Heritage, Nature & Ocean Combo',
    category: 'packages',
    categoryLabel: 'Zanzibar Package',
    basePrice: 1150,
    duration: '7 Days / 6 Nights',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.95,
    reviews: 88,
    badge: 'Luxury Leisure',
    description: 'Deep Zanzibar immersion. Combining five-star beach stays, spice trails, dolphin encounters, forest trails, and historical alleys.'
  },

  // Safaris
  {
    id: 'serengeti-wildlife-3-days',
    name: '3-Day Serengeti Wildlife Safari',
    category: 'safari',
    categoryLabel: 'Tanzania Safari',
    basePrice: 850,
    duration: '3 Days / 2 Nights',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.98,
    reviews: 195,
    badge: 'Wildlife Focus',
    description: 'Witness the iconic Serengeti game plains, herds of wild animals, the Great Migration, and high chances of spotting the Big Five.'
  },
  {
    id: 'ngorongoro-crater-2-days',
    name: '2-Day Ngorongoro Crater Classic',
    category: 'safari',
    categoryLabel: 'Tanzania Safari',
    basePrice: 450,
    duration: '2 Days / 1 Night',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.88,
    reviews: 124,
    badge: 'Natural Wonder',
    description: 'Embark on a crater-floor game drive inside the ancient volcanic crater harboring over 25,000 massive wild mammals.'
  },

  // Kilimanjaro climbs
  {
    id: 'machame-route-7-days',
    name: 'Machame Route Mount Kilimanjaro',
    category: 'kilimanjaro',
    categoryLabel: 'Kilimanjaro Trek',
    basePrice: 1650,
    duration: '7 Days / 6 Nights',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/1645028/pexels-photo-1645028.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.97,
    reviews: 220,
    badge: 'Summit Success',
    description: 'Climb the snowy roof of Africa via the highly scenic Machame Route. Complete porter, safety, and delicious catering support.'
  },

  // Airport Transfers
  {
    id: 'airport-oneway',
    name: 'Airport Transfer - One Way',
    category: 'transfer',
    categoryLabel: 'Airport Transfer',
    basePrice: 40,
    duration: '1 Way',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.90,
    reviews: 350,
    description: 'Settle in a modern air-conditioned private vehicle from Zanzibar Airport (ZNZ) or ferry directly to any resort island-wide.'
  },
  {
    id: 'airport-round',
    name: 'Airport Transfer - Round Trip',
    category: 'transfer',
    categoryLabel: 'Airport Transfer',
    basePrice: 70,
    duration: 'Round Trip',
    includesPickup: true,
    image: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.95,
    reviews: 180,
    description: 'Worry-free pre-scheduled holiday transport: Airport to resort and resort back to airport, fully customized around your flight times.'
  }
];

export const holidayPackageDetails: Record<string, HolidayPackageDetails> = {
  '3-day-escape': {
    itinerary: [
      { day: 1, title: 'Arrival & Stone Town Heritage Alleys', desc: 'Arrive at Zanzibar Airport (ZNZ). Private VIP transfer to your historic Stone Town boutique hotel. In the afternoon, enjoy a private guided walking tour of old Stone Town alleys, followed by a romantic sunset dhow cruise with Swahili acoustic music and local bites.' },
      { day: 2, title: 'Private Sandbank Picnic & Candlelit Dinner', desc: 'Board a traditional boat to a secluded white sandbank. Enjoy snorkeling in pristine reefs, fresh tropical fruits, and a private luxury seafood barbecue picnic. Spend the evening with a romantic candle-lit rooftop dinner under the starlit sky.' },
      { day: 3, title: 'Aromatic Spice Farm Tour & Departure', desc: 'Check out after breakfast. Walk through a lush, organic spice plantation to smell and taste exotic Zanzibar spices (vanilla, cloves, cardamom). Handpick fresh spices before a private VIP luxury transfer back to the airport.' }
    ],
    hotels: [
      'Tembo House Hotel (Historic waterfront boutique)',
      'Breezes Beach Club (Luxury beachfront wellness resort)'
    ],
    inclusions: [
      '2 Nights Luxury Heritage & Beach Accommodation',
      'All Private air-conditioned VIP transfers',
      'Certified multi-lingual historical tour guide',
      'Private traditional sunset dhow cruise with drinks',
      'Private sandbank boat excursion with lobster barbecue',
      'Stone Town UNESCO guided walk & entry tickets',
      'Unlimited cold mineral water during excursions'
    ],
    exclusions: [
      'International flights and Zanzibar tourist entry visa',
      'Optional travel & luggage insurance',
      'Premium imported alcoholic beverages',
      'Driver & guide gratuities (recommended)'
    ],
    gallery: [
      'https://images.pexels.com/photos/1547843/pexels-photo-1547843.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    reviewsList: [
      { author: 'Sarah & Thomas (London, UK)', rating: 5, text: 'Absolutely mesmerizing! The attention to detail from the local team was flawless. The sunset sail was the highlight of our honeymoon.', date: 'June 2026' },
      { author: 'Guillaume R. (Paris, France)', rating: 5, text: 'Beautiful heritage experience. Combining Stone Town with beach stays is highly recommended.', date: 'May 2026' }
    ],
    faqs: [
      { q: 'Is airport pickup pre-arranged?', a: 'Yes. Your personal driver will wait in the arrivals lobby holding a custom welcome sign with your name.' },
      { q: 'Can we upgrade our hotel room?', a: 'Absolutely. Use the special requests box during booking or contact us via WhatsApp for premium suite options.' }
    ],
    mapUrl: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  '5-day-beach-adventure': {
    itinerary: [
      { day: 1, title: 'Welcome & Drive to Nungwi Beach Paradise', desc: 'VIP meet & greet at Zanzibar Airport. Private transfer to a spectacular five-star beach resort in Nungwi, famous for turquoise waters and zero tide-dependence. Relax on the sandy beach before dinner.' },
      { day: 2, title: 'Snorkeling Marine Sanctuary at Mnemba Atoll', desc: 'Embark on an unforgettable snorkeling voyage to the marine sanctuary of Mnemba Island. Swim next to wild spinner dolphins, giant sea turtles, and explore colorful coral gardens.' },
      { day: 3, title: 'Rare Colobus Monkeys at Jozani Forest', desc: 'Journey to Jozani Chwaka Bay National Park, the only national park in Zanzibar. Hike deep into the mahogany canopy forest to photograph playful, rare Red Colobus Monkeys and walk along the mangrove boardwalk.' },
      { day: 4, title: 'The Legendary Safari Blue Ocean Tour', desc: 'Feast on an epic full-day marine safari in Menai Bay. Snorkel the inner coral reefs, sail a traditional dhow, swim in a natural mangrove lagoon, and indulge in an unlimited lobster and seafood barbecue on Kwale Island.' },
      { day: 5, title: 'Beach Morning & Departure Transfer', desc: 'Spend your last morning sunbathing, swimming, or purchasing beautiful African crafts. Your VIP shuttle driver will transfer you safely back to the airport for your flight home.' }
    ],
    hotels: [
      'Royal Zanzibar Beach Resort (5-Star luxury beach resort)',
      'Amaan Beach Bungalows (Comfort beachfront option)'
    ],
    inclusions: [
      '4 Nights Beach Resort accommodation in Nungwi',
      'All marine reserve park entry fees & conservation levies',
      'Private air-conditioned transport island-wide',
      'Premium snorkeling equipment & lifejackets',
      'Unlimited seafood and lobster lunch on Safari Blue tour',
      'Expert local boat captains and safety divers'
    ],
    exclusions: [
      'International flights & visa fees',
      'Premium alcoholic beverages during lunches',
      'Tips for local support staff & boat crews'
    ],
    gallery: [
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    reviewsList: [
      { author: 'The Carter Family (Chicago, USA)', rating: 5, text: 'Our kids had a blast feeding tortoises and looking for monkeys! The Mnemba dolphins came right beside our boat.', date: 'May 2026' }
    ],
    faqs: [
      { q: 'Is swimming experience required for marine tours?', a: 'No, we provide high-quality life jackets and professional instructors to assist all guests.' },
      { q: 'What is the best season for this tour?', a: 'Zanzibar is beautiful year-round, but December-February and June-October offer dry tropical breezes.' }
    ],
    mapUrl: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  '7-day-zanzibar-combo': {
    itinerary: [
      { day: 1, title: 'Arrival & Swahili Welcome Dinner', desc: 'Transfer to a romantic boutique hotel in old Stone Town. In the evening, feast on a traditional Swahili welcome dinner on a high rooftop terrace overlooking the Indian Ocean.' },
      { day: 2, title: 'Prison Island Giant Tortoise & Sandbanks', desc: 'Settle on a scenic boat ride to historical Prison Island (Changuu Island). Hand-feed giant Aldabra tortoises up to 150 years old, and swim in the beautiful, shallow white sandbanks.' },
      { day: 3, title: 'Culinary Spice Trails & Drive to Bwejuu Beach', desc: 'Walk through organic spice farm gardens. Learn how cinnamon, cardamoms, and lemongrass are harvested. Eat a traditional farm-to-table lunch, and drive to your luxurious Bwejuu beach resort.' },
      { day: 4, title: 'Dolphins & Coral Reefs Snorkeling at Mnemba', desc: 'Spend the morning boating near the private Mnemba Island. Snorkel on pristine outer reefs teeming with starfish, puffers, and beautiful corals, with high dolphin sightings.' },
      { day: 5, title: 'Leisure Day on Zanzibar\'s Best Beaches', desc: 'A full day of leisure to enjoy beachside massage therapy, kitesurfing, tropical cocktails, or simply relaxation on the award-winning Bwejuu coastline.' },
      { day: 6, title: 'Full Day Safari Blue Marine Adventure', desc: 'Sail Menai Bay on a handcrafted sailing dhow. Explore mangrove lagoons, swim in sandbanks, and enjoy a rich seafood feast on Kwale Island.' },
      { day: 7, title: 'Jozani Forest Trails & Departure', desc: 'Walk the high canopy mahogany forest to spot Zanzibar Red Colobus Monkeys before checking out and boarding your private shuttle to the airport.' }
    ],
    hotels: [
      'Emerson Spice (Luxury historic boutique hotel)',
      'Baraza Resort & Spa (Five-star boutique villas on Bwejuu)'
    ],
    inclusions: [
      '2 Nights Stone Town Heritage Hotel + 4 Nights Luxury Beach Resort',
      'All local ground & marine transfers with professional drivers',
      'All activities, entry tickets, and national park levies',
      'Daily delicious breakfast, Swahili dinner, and 2 excursion lunches',
      'Premium snorkeling equipment, bottled water, and seasonal fruits'
    ],
    exclusions: [
      'International flights & tourist visa fees',
      'Personal items, spa treatments, and gratuities'
    ],
    gallery: [
      'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1547843/pexels-photo-1547843.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    reviewsList: [
      { author: 'Emma & John H. (Sydney, Australia)', rating: 5, text: 'This was the ultimate Zanzibar immersion. Perfect balance between active tours and pure luxury relaxation at Baraza.', date: 'April 2026' }
    ],
    faqs: [
      { q: 'Is the itinerary customizable?', a: 'Yes! We can swap tours or adjust days based on your flight arrivals. Let us know during booking.' }
    ],
    mapUrl: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
};
