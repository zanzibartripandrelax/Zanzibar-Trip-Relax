export interface Tour {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: string;
  duration: string;
  groupSize: string;
  includes: string[];
  image: string;
  badge?: string;
  category: string;
  highlights: string[];
  itinerary: { time: string; title: string; activity: string }[];
  included: string[];
  excluded: string[];
  whatToBring: string[];
  bestTimeToVisit: string;
  faq: { q: string; a: string }[];
  gallery: string[];
  pricingTable: { tier: string; price: string }[];
  seoMetadata: { title: string; desc: string; keywords: string[] };
  relatedTours: string[];
}

export const tours: Tour[] = [
  {
    id: 'stone-town',
    name: 'Stone Town Historical Tour',
    description: 'Explore the UNESCO World Heritage Site of Stone Town with its labyrinthine alleys, ancient mosques, and spice markets.',
    longDescription: 'Immerse yourself in centuries of Swahili, Omani, Persian, Indian, and British history in the winding, coral-stone streets of Stone Town. Your certified historian guide will lead you on a profound journey, unraveling the geopolitical and mercantile importance of Zanzibar throughout antiquity. Visit majestic landmarks like the Sultan’s architectural legacy at the House of Wonders, the monumental Old Fort, the haunting Anglican Cathedral built atop the former slave chambers, and the colorful, bustling bazaar at Darajani Market.',
    price: 'From $45/person',
    duration: 'Half Day (4 hrs)',
    groupSize: '1–15 people',
    includes: ['Local certified guide', 'Entrance fees', 'Mineral bottled water', 'Hotel pickup & drop-off'],
    image: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'UNESCO Heritage',
    category: 'Culture',
    highlights: [
      'Anglican Slave Market Site and underground holding cells memorial',
      'The Old Fort (built by Omani Arabs in 1698 after defeating the Portuguese)',
      'Intricate Zanzibar doors displaying social status and regional origin carvings',
      'Bustling Darajani wet market with exotic spices and local vanilla auctions',
      'Birthplace home and museum of rock-and-roll icon Freddy Mercury'
    ],
    itinerary: [
      { time: '09:00 AM', title: 'Hotel Pickup & Assembly', activity: 'Our private guide and driver collect you from your resort lobby in an air-conditioned vehicle to travel to the historic center of Zanzibar.' },
      { time: '09:30 AM', title: 'Historic Slave Chambers Memorial', activity: 'A deeply emotional visit to the Anglican Cathedral and the dark subterranean cells where slaves were held in chains before auction.' },
      { time: '10:30 AM', title: 'Carved Zanzibar Doors Tour', activity: 'Traverse the narrow alleys of Stone Town, examining Brass-Studded Indian doors and elegant semi-circular Omani archways.' },
      { time: '11:15 AM', title: 'Sultanate Landmarks Walk', activity: 'Explore the Palace Museum, the Old Fort courts, the House of Wonders facade, and the breezy shores of the Indian Ocean harbor.' },
      { time: '12:00 PM', title: 'Darajani Market & Spices Bazaars', activity: 'Experience the smells and sounds of the seafood, fruit, and spice stalls. Watch locals auction fresh cloves and nutmeg.' },
      { time: '01:00 PM', title: 'Drop-off at Zanzibar Resort', activity: 'Board your private transport for a secure and comfortable ride back to your coastal beach hotel.' }
    ],
    included: [
      'Focal, professional English or multilingual certified guide fees',
      'Anglican Church & Old Fort monument admission tickets',
      'Private modern air-conditioned vehicle transfers',
      'Aromatic Swahili ginger-infused tea and chilled spring water'
    ],
    excluded: [
      'Lunches or restaurant snacks during the market walks',
      'Souvenirs, handcraft canvas carvings, or personal organic spice shopping',
      'Voluntary helper tips for local guides and drivers'
    ],
    whatToBring: [
      'Modest cultural clothing covering both shoulders and knees',
      'Breathable, broken-in walking shoes or durable sandals',
      'Broad-brimmed sun hat, polarized sunglasses, and skin sunblock',
      'USD cash or Tanzanian Shillings for market vendor souvenirs'
    ],
    bestTimeToVisit: 'Year-round. Mornings are most pleasant to escape mid-day heat, with bustling market setups.',
    faq: [
      { q: 'Is there a strict dress code for Stone Town?', a: 'Yes, Zanzibar is predominantly Muslim. Out of cultural respect, travelers must keep their shoulders and knees fully covered during the walking tour.' },
      { q: 'Is the tour accessible for children and senior citizens?', a: 'Absolutely, though the ancient stone-alley paths are uneven, so a slow, customized walking pace can be accommodated.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1320688/pexels-photo-1320688.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Solo Traveler (1 Person)', price: '$45' },
      { tier: 'Couples & Duo (2 People)', price: '$35 / person' },
      { tier: 'Small Group (3–5 People)', price: '$30 / person' },
      { tier: 'Family & Large (6+ People)', price: '$22 / person' }
    ],
    seoMetadata: {
      title: 'Stone Town Historical Walking Tour | Zanzibar Trip & Relax',
      desc: 'Embark on a guided walkthrough of Stone Town, Zanzibar. Learn about ancient Omani Sultanates, historical slave routes, and Swahili architecture with native guides.',
      keywords: ['Stone Town', 'Zanzibar History', 'Old Fort Tour', 'Slave Market Memorial', 'Zanzibar Cultural Tour']
    },
    relatedTours: ['prison-island', 'spice-farm', 'sunset-dhow']
  },
  {
    id: 'safari-blue',
    name: 'Safari Blue Adventure',
    description: 'Sail the turquoise waters of Menai Bay on a traditional dhow, snorkel coral reefs, and feast on a fresh seafood lunch on a sandbar.',
    longDescription: 'Prepare for the ultimate marine adventure in East Africa. Board a hand-crafted wooden sailing dhow from the shores of Fumba and glide into the pristine marine conservation area of Menai Bay. Watch wild bottlenose and spinner dolphins playing in the wake, then jump into the sparkling waters to snorkel among vibrant coral beds teeming with tropical reef fish. Ascend onto a pure, shifting white sandbar to sunbathe under premium canvas shades. Celebrate the day with an unforgettable, all-you-can-eat wood-fire seafood banquet on Kwale Island, followed by swimming in a natural ancient mangrove lagoon wrapper.',
    price: 'From $80/person',
    duration: 'Full Day (8 hrs)',
    groupSize: '2–20 people',
    includes: ['Sailing dhow', 'High-grade snorkel mask & fins', 'Gourmet seafood BBQ lunch', 'Chilled beverages & fresh fruits', 'Expert marine guide'],
    image: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Signature Excursion',
    category: 'Ocean',
    highlights: [
      'Traditional hand-built wooden dhow sailing through Menai Bay',
      'Snorkeling premium protected coral reefs with high-visibility marine life',
      'Feasting on fresh rock lobsters, ocean crabs, calamari, and grilled fish BBQ',
      'Relaxation on a temporary tide-rising desert island sandbar',
      'Swimming among centuries-old Baobab trees and natural mangrove lagoons'
    ],
    itinerary: [
      { time: '08:00 AM', title: 'Pickup from Beach Resort', activity: 'A scenic coastal transfer brings you from your hotel to the Fumba boating peninsula on the southwest coast.' },
      { time: '09:00 AM', title: 'Dhow Briefing & Set Sail', activity: 'Board your traditional vessel, meet the experienced captain and safety marines, and receive snorkel fitting instructions.' },
      { time: '10:00 AM', title: 'Sandbar Comfort & Sunbathe', activity: 'Anchor on a pristine sandbar completely surrounded by turquoise waves. Taste fresh coconuts, mangoes, and pineapple.' },
      { time: '11:15 AM', title: 'Deep Marine Reef Snorkeling', activity: 'Slip into clear oceanic lagoons. Glide alongside surgeonfish, sea turtles, anemones, and colorful reef barriers.' },
      { time: '01:00 PM', title: 'Seafood Buffet Feast on Kwale Island', activity: 'Indulge in a premium, freshly prepared fire-cooked feast: lobster, tiger prawns, grilled snapper, coconut rice, and Swahili chips.' },
      { time: '03:00 PM', title: 'Mangrove Lagoon & Ancient Baobab', activity: 'Swim inside a hidden turquoise lagoon surrounded by mangroves, and photograph a fallen giant Baobab tree over 500 years old.' },
      { time: '04:30 PM', title: 'Return to Shore & Resort Drop-off', activity: 'Sail back into Fumba Harbor under majestic triangular canvasses as the sun starts to cool. Private transfer back to hotel.' }
    ],
    included: [
      'Return beach resort private transfers on air-conditioned buses',
      'Full sea-dnow boat licensing and marine park conservation entries',
      'Unlimited tropical fruits, beers, soft drinks, and fresh coconuts',
      'Premium seafood BBQ lunch with vegetarian/chicken options'
    ],
    excluded: [
      'Premium spirits or fine dining wines',
      'Professional Go-Pro rental (available on-site for booking)',
      'Staff tips and personal crew gratitudes'
    ],
    whatToBring: [
      'Swimsuits, rash guards, and quick-dry UV beach towels',
      'Water shoes or sturdy flip-flops for volcanic coral shorelines',
      'De-fogging reef-safe sun protection lotion',
      'Waterproof phone case or action camera'
    ],
    bestTimeToVisit: 'Dry seasons (July to October and January to March) offer the absolute clearest water visibility and calmest winds.',
    faq: [
      { q: 'What happens if the tide is high or weather is bad?', a: 'Our marine captains check swell forecasts. If weather renders the trip unsafe, we offer instant date rescheduling or 100% money refunds.' },
      { q: 'Are there alternative food options if I have shellfish allergies?', a: 'Yes, we prepare delicious vegan skewers, grilled farm chicken breast, and coconut rice. Simply notify us upon booking!' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Solo Adventure Rate', price: '$120' },
      { tier: 'Standard Rate (2–4 Pax)', price: '$85 / person' },
      { tier: 'Group Rate (5–9 Pax)', price: '$75 / person' },
      { tier: 'Private Dhow Hire (Up to 15 Pax)', price: '$950 total' }
    ],
    seoMetadata: {
      title: 'Safari Blue Boat Tour | Best Zanzibar Seafood Sailing Adventure',
      desc: 'Experience Safari Blue in Zanzibar. Sail on local dhow boats, snorkel Menai Bay reef gardens, and feast on unlimited lobsters on Kwale Sandbar.',
      keywords: ['Safari Blue', 'Zanzibar Boat Tour', 'Kwale Island Lobster BBQ', 'Menai Bay Snorkeling', 'Swahili Sailing Dhow']
    },
    relatedTours: ['nakupenda-sandbank', 'sunset-dhow', 'mnemba-snorkeling']
  },
  {
    id: 'prison-island',
    name: 'Prison Island Tour',
    description: 'Visit historic Changuu Island to see giant Aldabra tortoises, swim in crystal waters, and explore colonial ruins.',
    longDescription: 'Journey just 5.6 kilometers across the serene waters of the Zanzibar channel from Stone Town to Changuu Island, famously known as Prison Island. Originally built in the 1890s by British administrators to imprison rebellious Swahili captives, the quarantine structures were converted into a therapeutic yellow-fever hospital. Today, this scenic tropical setting is a national sanctuary hosting dozens of majestic Aldabra Giant Tortoises — gifted from the British Governor of the Seychelles in 1919. Hand-feed these fascinating, 200-kilogram prehistoric creatures, explore the colonial ruins, and snorkel the shallow surrounding reef gardens.',
    price: 'From $50/person',
    duration: 'Half Day (4 hrs)',
    groupSize: '2–12 people',
    includes: ['Private motorized wooden boat transfer', 'Changuu island entry permits', 'Certified guide', 'Snorkeling mask and fins'],
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Family Favorite',
    category: 'Island',
    highlights: [
      'Hand-feeding and bathing 150-year-old Aldabra Giant Tortoises',
      'Walking through historic quarantine ruins and rusty iron prison cells',
      'Snorkeling over shallow, colorful reef gardens with starfish and anemones',
      'Panoramic wooden boat cruise with views of Stone Town’s waterfront',
      'Secluded coastal trails adorned with peacocks and regional birds'
    ],
    itinerary: [
      { time: '09:00 AM', title: 'Boating Embarkation from Beach', activity: 'Meet your private marine guide on the Stone Town beach and climb aboard our stable wooden motorized boat.' },
      { time: '09:30 AM', title: 'Arrival at Changuu Jetty', activity: 'Step off onto the white sands and walk under the shade of massive trees to the protected tortoise reserve.' },
      { time: '09:45 AM', title: 'Aldabra Tortoise Experience', activity: 'Feed fresh crisp cabbage leaves and scratch the long leathery necks of giant tortoises, learning about their life cycles.' },
      { time: '11:00 AM', title: 'Colonial Ruins & Cell Exploration', activity: 'Walk through the historical brick-clamped prison blocks, solitary cells, and quarantine arches.' },
      { time: '11:45 AM', title: 'Shallow Reef Snorkeling', activity: 'Walk down to the pristine beach sand Flats. Swim or snorkel to admire beautiful marine life and sea stars.' },
      { time: '01:00 PM', title: 'Sailing back to Stone Town', activity: 'Unwind as the boat motors back. Safely disembark onto Stone Town beach to continue your day.' }
    ],
    included: [
      'Round-trip private motorized boat charter with lifejackets',
      'Official Changuu Tortoise Sanctuary entrance tickets',
      'Expert commentary from a local bilingual island ranger',
      'Cold bottled mineral water on-board the vessel'
    ],
    excluded: [
      'Resort land transfers (unless explicitly booked as custom combo)',
      'Gratuities for boat crew and guide',
      'Personal beach sunscreen and towels'
    ],
    whatToBring: [
      'Camera or phone for incredible tortoise selfies',
      'Comfortable swimwear and a dry change of clothes',
      'Sun hat, sandals, and high-factor sun cream',
      'Small cash notes in Tanzanian Shilling or Dollars'
    ],
    bestTimeToVisit: 'Mornings are best to avoid peak tropical midday heat. The tortoises are also far more active and playful after waking up.',
    faq: [
      { q: 'How old is the oldest tortoise on Prison Island?', a: 'The oldest tortoises currently residing in the Changuu Sanctuary are estimated to be over 190 years old!' },
      { q: 'Is the boat trip safe for travelers prone to motion sickness?', a: 'Yes, the channel between Stone Town and Prison Island is shallow and shielded, resulting in highly gentle boat rides.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/4058314/pexels-photo-4058314.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Solo Traveler Rate', price: '$80' },
      { tier: 'Couples Rate (2 People)', price: '$50 / person' },
      { tier: 'Standard Group (3–6 Pax)', price: '$35 / person' },
      { tier: 'Family Special (Kids under 12)', price: '50% Discount' }
    ],
    seoMetadata: {
      title: 'Prison Island Tour Zanzibar | Meet Giant Aldabra Tortoises',
      desc: 'Take a boat trip from Stone Town to Changuu (Prison Island). Hand-feed giant Aldabra tortoises, explore colonial quarantine ruins, and snorkel the reef.',
      keywords: ['Prison Island Zanzibar', 'Changuu Island Tour', 'Giant Tortoise Feeding', 'Zanzibar Day Excursions', 'Zanzibar Reef Snorkeling']
    },
    relatedTours: ['stone-town', 'nakupenda-sandbank', 'mnemba-snorkeling']
  },
  {
    id: 'mnemba-snorkeling',
    name: 'Mnemba Island Snorkeling',
    description: 'Snorkel the legendary waters of Mnemba Atoll — home to dolphins, turtles, reef sharks, and spectacular coral gardens.',
    longDescription: 'Disembark on a premier aquatic safari tour to Mnemba Atoll, widely celebrated as the crown jewel of dive sites in East Africa. This vast, seven-by-four-kilometer marine conservation area surrounds the private island of Mnemba, creating a secure natural nursery for hundreds of marine species. Slip on your high-grade mask and dive into waters boasting up to 30 meters of vertical visibility. Glide past pristine coral pinnacles to spot elegant green sea turtles, playful wild bottlenose dolphins, camouflage octopuses, starfish, and dense clouds of neon-colored reef fish under the tropical sun.',
    price: 'From $95/person',
    duration: 'Full Day (7 hrs)',
    groupSize: '2–10 people',
    includes: ['Private speedboat or boat charter', 'Pro snorkel equipment', 'Tropical seafood lunch on beach', 'Marine marine park fee', 'Fruit snacks'],
    image: 'https://images.pexels.com/photos/4058314/pexels-photo-4058314.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Top Rated',
    category: 'Ocean',
    highlights: [
      'Snorkeling the shallow reef wall of the marine conservation atoll',
      'Incredibly high chance of dolphin sightings and close swimming',
      'Breathtaking emerald clear water with spectacular reef biodiversity',
      'Relaxation on the beach sandbanks near the exclusive Mnemba island',
      'Fresh tropical fruit buffet and delicious traditional local lunch'
    ],
    itinerary: [
      { time: '07:30 AM', title: 'Resort Transfer to Muyuni Beach', activity: 'Drive in our private air-conditioned vehicle to the northeast fishing shores of Muyuni Bay.' },
      { time: '08:30 AM', title: 'Boat Embarkation & Lifejackets', activity: 'Board our fast skiff and receive safety briefs on marine conservation protocols before cruising.' },
      { time: '09:00 AM', title: 'Dolphin Spotting & Coast Run', activity: 'Search the bay where elegant resident dolphin pods feed and jump. Witness their gorgeous acrobatics.' },
      { time: '09:45 AM', title: 'Atoll Coral Garden Snorkeling', activity: 'Enter the warm currents of Mnemba Atoll. Walk over corals visually, spotting clownfish, puffers, and green turtles.' },
      { time: '12:00 PM', title: 'Sandbank Relaxation Break', activity: 'Disembark onto a temporary low-tide sandbar to sunbathe, enjoy watermelon, bananas, and coconut.' },
      { time: '01:00 PM', title: 'Swahili Fish Lunch on Muyuni Beach', activity: 'Enjoy fresh fire-grilled sailfish or lobster BBQ on the beach shores, accompanied by local rice.' },
      { time: '2:30 PM', title: 'Comfortable Return to Resort', activity: 'Re-board your dedicated private shuttle for a relaxing drive back to your resort.' }
    ],
    included: [
      'All high-grade snorkeling gear (carbon masks, snorkels, fins)',
      'Muyuni Bay marine conservation park authority tickets',
      'High-speed private boat transfer with safety crew',
      'Gourmet barbecue lunch right on the beach sand'
    ],
    excluded: [
      'Stepping foot onto Mnemba Private Island (restricted to luxury hotel guests)',
      'Sub-surface scuba diving tanks (unless arranged as specialist upgrade)',
      'Tips for professional snorkeling guides and drivers'
    ],
    whatToBring: [
      'Premium swimsuit, rash guards, or UPF swimming shirts',
      'Waterproof GoPro cameras or action cameras with floating hand-grips',
      'Biodegradable reef-friendly sunscreen',
      'Dry towels and light beach wear wrapper'
    ],
    bestTimeToVisit: 'July to March. Mornings generally boast calmer waves and the best dolphin activity patterns.',
    faq: [
      { q: 'Can we go onto the Mnemba Island beach?', a: 'No, Mnemba Island is a highly private beach resort owned by andBeyond. Stepping onto the dry white land is restricted to preserve avian and marine boundaries, but we snorkel directly in its prime coral perimeter.' },
      { q: 'Are we guaranteed to see and swim with dolphins?', a: 'While nature is wild, our experienced captains trace active pods daily, yielding a 90%+ sighting rate!' }
    ],
    gallery: [
      'https://images.pexels.com/photos/4058314/pexels-photo-4058314.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Solo Luxe Rate', price: '$150' },
      { tier: 'Couples Rate (2 People)', price: '$95 / person' },
      { tier: 'Standard Group (3–5 People)', price: '$85 / person' },
      { tier: 'Shared Boat Promo (6+ People)', price: '$75 / person' }
    ],
    seoMetadata: {
      title: 'Mnemba Island Snorkeling Tour | Zanzibar Dolphin Swim Atoll',
      desc: 'Book Mnemba Island snorkeling. Spot wild dolphins, swim with sea turtles, and explore the richest coral reefs in East Africa with local guides.',
      keywords: ['Mnemba Island Snorkeling', 'Mnemba Atoll Coral Reef', 'Swim with Dolphins Zanzibar', 'Zanzibar Speedboat Excursions', 'Muyuni Beach Tour']
    },
    relatedTours: ['safari-blue', 'nakupenda-sandbank', 'dolphin-kizimkazi']
  },
  {
    id: 'spice-farm',
    name: 'Spice Farm Tour',
    description: 'Discover why Zanzibar is called the Spice Island. Touch, smell, and taste cloves, vanilla, cinnamon, cardamom, and more.',
    longDescription: 'Take a sensory trip into the core history of Zanzibar’s legendary agricultural legacy. Guided by experienced multi-generation Swahili spice farmers, you will walk through the botanical jungles of tropical plantations. Interact with the flora directly: touch medicinal roots, scrape vanilla vines, peel rich bark off cinnamon trees, scratch freshly pulled turmeric bulbs, and crack red-pod nutmeg shells. Conclude this authentic excursion with an incredible, traditional vegetarian Swahili lunch cooked by the community using the fresh ginger, lemongrass, coconut, and cloves harvested right before you.',
    price: 'From $35/person',
    duration: '3 Hours',
    groupSize: '1–20 people',
    includes: ['Private farm transport', 'Professional local spice guide', 'Swahili vegetarian lunch', 'Handmade natural leaf gifts'],
    image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Organic & Authentic',
    category: 'Culture',
    highlights: [
      'A multi-sensory tour tasting, holding, and smelling wild spices',
      'Learning the historical background of global spice trade and Omani Sultans',
      'Watching a skilled local "butterfly man" climb a towering palm tree singing Swahili songs',
      'Enjoying a rich Swahili coconut-milk "Pilau" lunch with fresh herbs',
      'Receiving beautiful handmade crowns, necklaces, and rings woven from leaves'
    ],
    itinerary: [
      { time: '09:00 AM', title: 'Pickup from Resort Lobby', activity: 'Board our comfortable air-conditioned van for a direct transit to the lush rural farming belt of Kizimbani.' },
      { time: '09:45 AM', title: 'Guided Spice Walk & Peeling', activity: 'Trek under massive cocoa palms. Touch and smell green cardamom pods, peppercorns, star anise, and lemon grass.' },
      { time: '11:00 AM', title: 'Coconuts Climbing & "Jambo" Song', activity: 'Gather under giant palms to watch a climber scaling 30-meter trees with no ropes, harvesting fresh young coconuts.' },
      { time: '11:30 AM', title: 'Fresh Swahili Farm Feast', activity: 'Dine in a rustic stone-paved veranda. Savor hand-stirred spinach in coconut juice (Mchuzi), red beans, and saffron rice.' },
      { time: '12:30 PM', title: 'Handcrafted Souvenirs Gift Session', activity: 'Drapery, bracelets, and crown caps hand-woven out of coconut fronds are gifted to you.' },
      { time: '01:00 PM', title: 'Return Transit back to Hotel', activity: 'Board your private shuttle to comfortably head back to the beach for afternoon naps.' }
    ],
    included: [
      'Private air-conditioned hotel pickup and delivery',
      'Exclusive farm guide interpreter and palm-tree climbers fees',
      'Full, healthy Swahili farm lunch cooked on site',
      'Unlimited fresh drinking coconuts and spring water jars'
    ],
    excluded: [
      'Grated spice essential oils or packaged spices bought on farm shops',
      'Tips for the tireless local farmers and climbers',
      'Alcoholic items or beverages'
    ],
    whatToBring: [
      'Comfortable lightweight clothing and mosquito repellent spray',
      'Close-toe trainers or easy walking shoes for organic earth trails',
      'Polarized sunglasses and camera for gorgeous farm portraits',
      'Small dollar notes to support local farming families directly'
    ],
    bestTimeToVisit: 'Mornings, which is when the plants are fresh and the temperature under the canopy is cool and breezy.',
    faq: [
      { q: 'Is this spice farm tour suitable for small toddlers?', a: 'Perfect! Children love smelling cacao pods, trying natural lipsticks from lipstick-tree fruits, and watching the climbers.' },
      { q: 'Can we buy real authenticated spices to take abroad?', a: 'Yes, the farm cooperative sells organic, freshly vacuum-sealed cloves, vanilla beans, and cinnamon curls at superb rates that support the local village.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/2826787/pexels-photo-2826787.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Solo organic walk', price: '$55' },
      { tier: 'Standard rate (2–5 Pax)', price: '$35 / person' },
      { tier: 'Group rate (6+ Pax)', price: '$25 / person' },
      { tier: 'Children under 6 rate', price: 'Free Entry' }
    ],
    seoMetadata: {
      title: 'Zanzibar Spice Farm Guided Tour | Authentic Swahili Lunch',
      desc: 'Walk through organic spice farms in Zanzibar. Learn how vanilla, cloves, and cinnamon grow. Indulge in an incredible authentic Swahili harvest lunch.',
      keywords: ['Zanzibar Spice Farm', 'Kizimbani Spice Tour', 'Cloves Nutmeg Vanilla Zanzibar', 'Zanzibar Eco Tourism', 'Zanzibar Culinary Tours']
    },
    relatedTours: ['stone-town', 'jozani-forest', 'safari-blue']
  },
  {
    id: 'sunset-dhow',
    name: 'Sunset Dhow Cruise',
    description: 'Glide across the Indian Ocean on a traditional wooden dhow as the sun melts into the horizon. Sundowners included.',
    longDescription: 'Witness the iconic majesty of a real Zanzibar sunset. Step aboard a beautifully restored, varnished wooden sailing dhow in Nungwi or Stone Town, and set sail into calm Indian Ocean waters. Watch the billowing white sails catch the steady Swahili trade winds as you move away from the shoreline. Relax on plush cushions as our attentive crew serves cold drinks, professional Swahili cocktails, beers, and gourmet finger snacks. Watch the skies transform from infinite cyan into a brilliant display of gold, fiery orange, and violet as the sun drops behind the oceanic horizon.',
    price: 'From $55/person',
    duration: '2.5 Hours',
    groupSize: '2–20 people',
    includes: ['Traditional wooden dhow cruise', 'Chilled beers & Swahili tropical punches', 'Salty & sweet finger-food boards', 'Mellow local acoustic guitar/vibes'],
    image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Highly Romantic',
    category: 'Ocean',
    highlights: [
      'Sailing on a traditional non-motorized high-masted wooden dhow',
      'Stunning unobstructed golden hour and sunset views from the water',
      'Open bar serving beers, tropical juices, Swahili mocktails or wine',
      'Attentive crew providing premium hospitality, narration, and Swahili singing',
      'Delicious snacks like spiced samosas, grilled prawns, and local cassava crisps'
    ],
    itinerary: [
      { time: '04:00 PM', title: 'Beach Boarding & Crew Meet-Up', activity: 'Meet our crew on Nungwi/Kendwa beach sands, remove shoes to climb aboard the dry carpeted dhow deck.' },
      { time: '04:30 PM', title: 'Hoist sails and head seaward', activity: 'Watch the sailors hoist the massive triangular sail. Glide out as Omani-style coastal views begin to unfold.' },
      { time: '05:00 PM', title: 'Open Bar & Aperitifs served', activity: 'Sip chilled prosecco, Tusker lager beers, or fresh passiflora juice. Nibble on spicy coconut fish skewers.' },
      { time: '06:00 PM', title: 'The Golden Hour Sunset Photo-shoot', activity: 'The sunset begins. Our crew assists with breathtaking silhouette photography against the deep golden sky.' },
      { time: '06:45 PM', title: 'Lighthouse return & evening drop-off', activity: 'Cruise back as stars become visible. Step ashore onto the dry sand, perfectly relaxed.' }
    ],
    included: [
      '2.5 hours of sailing boat charter with licensed captains',
      'Open selection of premium snacks, coconut cubes, and samosas',
      'Local beers, wines, sodas, and chilled mineral water bottles',
      'Background acoustic music or local coastal Swahili sea-chants'
    ],
    excluded: [
      'Inland hotel transfers (available as optional checkout add-on)',
      'Foreign imported fine whiskeys or champagnes',
      'Staff tips and personal crew gratuities'
    ],
    whatToBring: [
      'Smart casual coastal attire (great for photographs)',
      'Light cardigans or windswept scarves for cooling sea breezes',
      'Sunglasses, camera, and a sense of absolute relaxation',
      'Slight cash for dock helper tips'
    ],
    bestTimeToVisit: 'July to March. Calm clear evenings with minimal cloud banks yield the absolute most dramatic sunset skies.',
    faq: [
      { q: 'Is there a private cruise option for proposals or honeymoons?', a: 'Absolutely, we offer custom private dhow charters complete with live violinists, specialized seafood grills, and champagne bottles.' },
      { q: 'Will my feet or clothes get wet during onboarding?', a: 'We board directly off Nungwi beach shores. You may step briefly in ankle-deep surf, so rolling up pants is smart!' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Shared Sunset Sail Rate', price: '$55 / person' },
      { tier: 'VIP Couples Package (Shared boat)', price: '$120 total' },
      { tier: 'Private Dhow Sunset Charter (Up to 10 Pax)', price: '$550 flat' },
      { tier: 'Private Dhow Charter (11–20 Pax Pool)', price: '$850 flat' }
    ],
    seoMetadata: {
      title: 'Zanzibar Sunset Dhow Cruise | Romantic Ocean Sailing',
      desc: 'Sail on traditional wooden dhows into Nungwi’s golden sunset. Enjoy open-bar beers, mocktails, and fresh Swahili seafood appetizers under dry starry skies.',
      keywords: ['Zanzibar Sunset Cruise', 'Nungwi Dhow Sailing', 'Romantic Zanzibar Excursions', 'Zanzibar ocean trips', 'Zanzibar Sundowners']
    },
    relatedTours: ['safari-blue', 'mnemba-snorkeling', 'nakupenda-sandbank']
  },
  {
    id: 'dolphin-kizimkazi',
    name: 'Dolphin Tour Kizimkazi',
    description: 'Swim with wild spinner and bottlenose dolphins in the warm waters off Kizimkazi village in southern Zanzibar.',
    longDescription: 'Head to the scenic fishing village of Kizimkazi along the southern coast of Zanzibar, famous for harboring massive residential and migratory pods of Indo-Pacific bottlenose and acrobatic spinner dolphins. Wake at dawn to board our secure, motorized marine skiff as the ocean is calmest. Slip carefully into the warm waters alongside these highly social, intelligent marine mammals. Out of passion for animal wellness, our tour strictly adheres to low-impact, non-intrusive swim standards that respect the natural behavior and comfort zones of these incredible creatures.',
    price: 'From $60/person',
    duration: 'Half Day (4 hrs)',
    groupSize: '2–12 people',
    includes: ['Experienced marine boat captain', 'Professional snorkeling gear', 'Responsible animal-safe guide', 'Return transfers', 'Water'],
    image: 'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Wild Animals',
    category: 'Ocean',
    highlights: [
      'Swimming alongside wild bottlenose and spinner dolphins in open waters',
      'Cruising Kizimkazi’s picturesque, volcanic limestone coastline',
      'Enjoying a scenic sunrise boat ride on the Indian Ocean',
      'Responsible animal-interaction policy ensuring zero tracking stress',
      'Snorkeling reef beds teeming with rich regional fish'
    ],
    itinerary: [
      { time: '05:30 AM', title: 'Early Sunrise Pickup from Hotel', activity: 'Initialize your morning with a secure private transfer to Zanzibar’s southern shores.' },
      { time: '06:30 AM', title: 'Arrival at Kizimkazi Beach shores', activity: 'Meet our boat captains, put on premium wetsuits/lifejackets, and board the motorized boat engines.' },
      { time: '07:00 AM', title: 'Dolphin Spotting & Swims', activity: 'Scan ocean waves. Carefully enter the water as dolphins swim near, listening to their beautiful clicks.' },
      { time: '08:30 AM', title: 'Scenic Reef Snorkeling', activity: 'Anchor in Kizimkazi Coral gardens. Swim under the morning sun with blue-spotted rays and parrotfish.' },
      { time: '09:30 AM', title: 'Warm Beach Breakfast', activity: 'Unwind on shore to dry off, enjoying hot coffee, ginger tea, scrambled eggs, and delicious fruits.' },
      { time: '10:30 AM', title: 'Return Transit to Beach Hotel', activity: 'Hop in our transfers to head back to rest, arriving back in time for sunny lunch.' }
    ],
    included: [
      'Dedicated round-trip air-conditioned hotel transfers',
      'Professional marine captain and specialized dolphin-spotter guide fees',
      'Excellent hot beach-side breakfast and fresh water bottles',
      'All marine gear, fins, masks, and animal-safety briefings'
    ],
    excluded: [
      'Underwater camera or Go-Pro recordings (can be rented on-site)',
      'Sub-surface scuba regulator kits',
      'Gratuities for boat captains and local crews'
    ],
    whatToBring: [
      'High-quality swimwear, sunscreen, and polarized sunglasses',
      'Quick-dry towels and warm outer sweaters for the early morning boat breeze',
      'Action underwater camera for incredible swimming recordings',
      'Small dollar cash notes for local helper tips'
    ],
    bestTimeToVisit: 'Dry seasons (July to March) are ideal. Early morning starts at 06:00 AM are critical as dolphins dive deep once the midday sun heats up.',
    faq: [
      { q: 'Is it completely safe to swim with the dolphins?', a: 'Completely! These are beautiful, highly peaceful, non-aggressive wild animals. They are deeply curious about swimmers, and we keep secure distance boundaries.' },
      { q: 'What is your ethical policy regarding the dolphins?', a: 'Our guides do not feed, wrap, pursue, or trap the dolphins. We cut boat hulls off and allow dolphins to choose to approach or leap around on their own terms.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/4058314/pexels-photo-4058314.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Solo Early Bird', price: '$95' },
      { tier: 'Standard rate (2–4 Pax)', price: '$60 / person' },
      { tier: 'Group rate (5+ Pax)', price: '$50 / person' },
      { tier: 'Children under 10 promo', price: '40% Discount' }
    ],
    seoMetadata: {
      title: 'Kizimkazi Dolphin Swim Tour | Ethical Zanzibar Ocean Trip',
      desc: 'Swim with wild spinner and bottleneck dolphins off the shores of Kizimkazi. Book early-morning responsible marine tours with expert conservationist guides.',
      keywords: ['Zanzibar Dolphin Tour', 'Kizimkazi Swim with Dolphins', 'Responsible Marine Tourism', 'Ocean Excursions Zanzibar', 'Zanzibar Wildlife Tours']
    },
    relatedTours: ['mnemba-snorkeling', 'jozani-forest', 'safari-blue']
  },
  {
    id: 'jozani-forest',
    name: 'Jozani Forest Tour',
    description: 'Walk through the ancient Jozani-Chwaka Bay National Park, home to the rare Red Colobus monkey found only in Zanzibar.',
    longDescription: 'Explore Zanzibar’s interior wilderness inside Jozani-Chwaka Bay National Park, the island\'s only national park. This dense, lush jungle canopy is a critical conservation sanctuary for the highly endangered Zanzibar Red Colobus monkey (Procolobus kirkii) — a remarkable evolutionary species found nowhere else on earth. Accompanied by certified national park rangers, you will walk along pristine forest trails under towering mahogany trees to spot these playful, highly social primates. Tour the ancient mangrove swamp biosphere via raised structural wooden boardwalks to learn about tidal eco-filtration.',
    price: 'From $40/person',
    duration: '3 Hours',
    groupSize: '1–15 people',
    includes: ['Park conservation permits', 'Certified ranger guide', 'Air-conditioned transfers', 'Cold drinking water'],
    image: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'National Park',
    category: 'Nature',
    highlights: [
      'Up-close photography of the rare endemic Zanzibar Red Colobus Monkey',
      'Trekking under ancient African mahogany, palm, and eucalyptus trees',
      'Walking raised wooden suspended loops over saline mangrove habitats',
      'Spotting rare elephant-shrews, chameleons, and bird combinations',
      'Sovereign forest commentary detailing Zanzibar’s botanical remedies'
    ],
    itinerary: [
      { time: '09:00 AM', title: 'Pickup from Beach Hotel', activity: 'Meet our professional driver to cruise inland towards the lush tropical center of Zanzibar Island.' },
      { time: '09:45 AM', title: 'National Park Ranger Intro', activity: 'Register at the forestry office, meet your dedicated local ranger, and learn about the park’s wildlife preservation efforts.' },
      { time: '10:00 AM', title: 'Mahogany Forest Trail Trek', activity: 'Hike deep under massive trees. Spot Sykes monkeys, colossal blue butterflies, and unique insect species.' },
      { time: '10:45 AM', title: 'Red Colobus Monkey Sanctuary', activity: 'Arrive at the open feeding grounds of Kirk`s red monkeys. Watch them leap, play, nurse, and feed on young leaves.' },
      { time: '11:30 AM', title: 'Saltwater Mangrove Boardwalk', activity: 'Walk suspended over black and red mangroves, learning how their roots filter seawater and secure Zanzibar shores.' },
      { time: '12:00 PM', title: 'Depart Jozani for Resort', activity: 'Say goodbye to your park ranger and board your transfer to head back to your beach hotel.' }
    ],
    included: [
      'Return private air-conditioned transport and fuel',
      'All official Jozani National Park entry and ranger fees',
      'Zanzibar wildlife preservation tax and local tourist levies',
      'Cold bottled spring drinking water'
    ],
    excluded: [
      'Direct contact or touching of monkeys (strictly forbidden for disease safety)',
      'Meals, snacks, or alcoholic beverages',
      'Guide tips and helper gratitudes'
    ],
    whatToBring: [
      'Humble close-toe walking shoes or durable running trainers',
      'High-factor eco insect repellent and light breath canvas pants',
      'Telephoto camera or smartphone with high optical zoom',
      'Small cash notes in USD/TSH for souvenir stores or park donations'
    ],
    bestTimeToVisit: 'Dry months (July to March) are perfect. Midmornings are outstandingly beautiful as filtered sunlight shines elegantly through the tree leaves.',
    faq: [
      { q: 'Can we get close to and feed the Red Colobus monkeys?', a: 'To protect the monkeys from contracting human colds, viruses, or bacteria, park regulations mandate that all tourists stay at least 3 meters away. Feeding them is strictly prohibited, though they are very comfortable around humans and will hop exceptionally close!' },
      { q: 'Is there a risk of aggressive monkey behavior?', a: 'Not at all. The Kirk`s Red Colobus is a peaceful leaf-eating monkey with no aggression records, unlike baboons.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3474320/pexels-photo-3474320.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Solo Trekker Price', price: '$75' },
      { tier: 'Standard rate (2–4 Pax)', price: '$40 / person' },
      { tier: 'Group rate (5+ Pax)', price: '$35 / person' },
      { tier: 'Kids under 12 Special', price: '50% Discount' }
    ],
    seoMetadata: {
      title: 'Jozani Forest Tour Zanzibar | Red Colobus Monkey Sanctuary',
      desc: 'Visit Jozani National Park in Zanzibar. Experience a guided trek to photograph Kirk`s red colobus monkeys and hike through the ocean mangrove forests.',
      keywords: ['Jozani Forest Tour', 'Zanzibar Red Colobus Monkey', 'Zanzibar National Park', 'Mangrove Boardwalk Zanzibar', 'Zanzibar Nature Trails']
    },
    relatedTours: ['spice-farm', 'stone-town', 'safari-blue']
  },
  {
    id: 'nakupenda-sandbank',
    name: 'Nakupenda Sandbank Picnic',
    description: 'Sail to the legendary "I Love You" sandbank for a private beach picnic surrounded by turquoise infinity waters.',
    longDescription: '"Nakupenda" translates directly to "I love you" in Swahili, and this gorgeous sandbar behaves like a magical white ribbon appearing from the ocean at low tide. Embark from Stone Town on a direct motorized boat to this stunning, isolated desert island. Feel the pure coral sand between your toes as our crew erects private cotton shade canvas sails. Snorkel in the deep surrounding marine channels, collect unique seashells, swim in the calm turquoise sea, and indulge in an incredible beach BBQ feast of fresh lobster, grilled jumbo prawns, calamari, octopuses, and local spiced rice.',
    price: 'From $70/person',
    duration: 'Half Day (4 hrs)',
    groupSize: '2–20 people',
    includes: ['Private dhow/boat transfer', 'Luxury beach BBQ picnic', 'Water, beer & vintage sodas', 'Snorkeling mask and fins', 'Guide'],
    image: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Exclusive Experience',
    category: 'Island',
    highlights: [
      'Gazing at breathtaking, 360-degree ocean views on a pristine shifting sandbar',
      'Feasting on freshly fire-lit lobsters, octopus, prawns, and crabs hot on the beach',
      'Snorkeling over high-visibility coral marine beds surrounding the islet',
      'Sipping chilled sparkling wine, juices, or cold beers in tropical beach shades',
      'An extraordinarily romantic experience ideal for surprise proposals and honeymoons'
    ],
    itinerary: [
      { time: '09:00 AM', title: 'Boating Depart from Stone Town', activity: 'Board our motorized wooden boat and enjoy the 20-minute cruise across the emerald channel.' },
      { time: '09:20 AM', title: 'Sandbar Landing & Tent erection', activity: 'Step onto the pristine white sandbar. Relax as the crew sets up premium visual shade banners and canvas.' },
      { time: '09:45 AM', title: 'Turquoise Waters Snorkeling', activity: 'Slip on snorkeling fins and swim around the sandbar edge, meeting colorful marine life.' },
      { time: '11:15 AM', title: 'Tropical Fruit Tasting Board', activity: 'Taste sweet sliced watermelon, coconut, mangoes, passionfruit, and chilled beverages.' },
      { time: '12:00 PM', title: 'Grand Seafood BBQ Feast', activity: 'Enjoy fresh lobsters, giant tiger prawns, grilled calamari, and spiced Swahili rice prepared by the cooks.' },
      { time: '01:00 PM', title: 'Sailing Sunset Return Trip', activity: 'Pack up before the high tide slowly submerges the sandbar. Return comfortably back to Stone Town beach.' }
    ],
    included: [
      'Return private marine transfers from Stone Town waterfront',
      'Sumptuous, freshly grilled seafood BBQ lunch feast (lobster & prawns)',
      'Unlimited ice-cold local beers, soft drinks, and spring water',
      'All snorkeling equipment rentals and beach sail shade setups'
    ],
    excluded: [
      'Resort land transfers (unless booked as optional custom checkout addon)',
      'Grated imported heavy liquors or luxury champagnes',
      'Staff tips and crew gratitudes'
    ],
    whatToBring: [
      'Beach bikinis, boardshorts, and highly fashionable eyewear',
      'Wide-brimmed sun hat, beach towels, and extra dry clothes',
      'Biodegradable reef-safe sun protect cream',
      'GoPro or waterproof camera for outstanding drone-like shots'
    ],
    bestTimeToVisit: 'July to March. Low tide schedules dictate sandbar size, which our coordinates align to perfectly.',
    faq: [
      { q: 'Is there a private toilet available on the sandbank?', a: 'Since it is a temporary sandbar that is fully submerged twice daily at high tide, there are no standing brick facilities on the island. A tent wrap or the boat restroom is utilized.' },
      { q: 'Will the sandbar totally disappear during our picnic?', a: 'No, we calculate daily Swahili tide charts carefully. We land during optimal low tide and depart well before the rising tide water rolls over the high sand.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Solo sandbank escape', price: '$130' },
      { tier: 'Couples rate (2 People)', price: '$75 / person' },
      { tier: 'Standard Group (3–6 Pax)', price: '$65 / person' },
      { tier: 'Large Group Promo (7+ Pax)', price: '$55 / person' }
    ],
    seoMetadata: {
      title: 'Nakupenda Sandbank Picnic Tour | Zanzibar Seafood Desert Island',
      desc: 'Sail to the jaw-dropping Nakupenda Sandbar in Zanzibar. Snorkel crystal-clear infinite sand flats and enjoy a premium fresh lobster seafood picnic.',
      keywords: ['Nakupenda Sandbank Zanzibar', 'Zanzibar Sandbar Picnic', 'Zanzibar Beach Excursions', 'Zanzibar private dhow trips', 'Snorkeling Stone Town']
    },
    relatedTours: ['safari-blue', 'prison-island', 'stone-town']
  },
  {
    id: 'quad-bike',
    name: 'Quad Bike Adventure',
    description: 'Rev through Zanzibar beaches, plantations, and villages on an exhilarating quad bike adventure for all levels.',
    longDescription: 'Saddle up for an adrenaline-fueled exploration of Zanzibar’s beautiful countryside. Our Quad Bike (ATV) adventure takes you far off the standard resort paths into the real, beating heart of the island. Following a comprehensive safety training session, our professional trail guides will lead you through coconut plantations, past local clay-brick Swahili villages, over rugged mud forest tracks, and onto the remote white-sand dunes of northern Zanzibar. Interact with local children, see beautiful vistas, and enjoy a side of paradise that standard tours simply cannot reach.',
    price: 'From $65/person',
    duration: '2–3 Hours',
    groupSize: '1–10 people',
    includes: ['Automatic 350cc Quad bike', 'Safety helmet & goggles', 'Expert pathfinder guide', 'Safety training', 'Cold water'],
    image: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Adrenaline High',
    category: 'Adventure',
    highlights: [
      'Driving high-torque automatic ATVs through tropical trails',
      'Traversing local clay-walled Swahili neighborhoods and villages',
      'Zooming across hidden coconut palm fields and rural tracks',
      'Reaching untouched beaches and remote coastal dunes in northern Zanzibar',
      'Invaluable photoshoots on your powerful quad bike in beautiful wild scenery'
    ],
    itinerary: [
      { time: '09:00 AM', title: 'Pickup or Arrival at ATV Base', activity: 'Meet our team at our modern northern base. Receive a warm welcome and briefing.' },
      { time: '09:30 AM', title: 'Safety Gear & Quad Practice', activity: 'Put on custom sanitized helmets and goggles, and practice riding on our secure training flat track.' },
      { time: '10:00 AM', title: 'Village and Plantation Trails', activity: 'Drive past local clay-wall houses, banana palms, and local schools. Listen to local kids cheer "Jambo!"' },
      { time: '11:00 AM', title: 'Off-Road Dune beach runs', activity: 'Power onto the wild, empty sandy bays of northern Zanzibar for a thrilling coastal ride.' },
      { time: '11:45 AM', title: 'Acoustic farm cool-down', activity: 'Stop at a coconut orchard for fresh local juices, fruit skewers, and dynamic photographs.' },
      { time: '12:30 PM', title: 'Transfer return to Resort', activity: 'Clean up from the dust at our base and hop on our transfer back to your beach hotel.' }
    ],
    included: [
      'Fuel, ATV maintenance, and automatic 350cc quad bikes',
      'Excellent sanitized safety helmets, headwraps, and eye goggles',
      'First-aid backup support vehicles and professional guide leads',
      'Local farm entrance fees and fresh drinking water'
    ],
    excluded: [
      'Inland resort transit (can be requested as simple addon)',
      'Damage insurance excesses caused by dangerous careless driving',
      'Tips for the specialized ATV track engineers and guides'
    ],
    whatToBring: [
      'Comfortable trainers or close-toe shoes (sandals not allowed)',
      'Clothes that you do not mind getting dusty or muddy',
      'UV sunglasses, sunscreen, and action cameras',
      'Bandana or scarf to protect your nose from dust tracks'
    ],
    bestTimeToVisit: 'Year-round. Mornings are great for cooler breezes, while afternoons offer beautiful, dusty golden-hour lighting.',
    faq: [
      { q: 'Is a driving license required to ride the quad bikes?', a: 'No official motorcycle or car license is legally required! Our bikes are stable four-wheel automatic models which are exceptionally easy to operate, even for complete beginners.' },
      { q: 'Can children ride as passengers?', a: 'Yes! Children aged 5 to 12 can safely ride as passengers behind adult drivers under a reduced ticket rate.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Single Rider ATV Rate', price: '$95' },
      { tier: 'Double Rider (Driver + Passenger)', price: '$135 total' },
      { tier: 'Group Discount (3+ Quads)', price: '$85 / quad' },
      { tier: 'Sunset Special Upgrade', price: '+$15 / person' }
    ],
    seoMetadata: {
      title: 'Zanzibar Quad Bike (ATV) Adventure | Rural Off-Road Trails',
      desc: 'Embark on an exhilarating Quad Bike tour in Zanzibar. Ride across scenic coconut plantations, muddy jungle tracks, and remote northern sand dunes.',
      keywords: ['Zanzibar Quad Bike', 'ATV Zanzibar Tour', 'Zanzibar Adventure Excursions', 'Off Road Zanzibar', 'Nungwi Quad Activity']
    },
    relatedTours: ['spice-farm', 'jozani-forest', 'safari-blue']
  },
  {
    id: 'fishing-experience',
    name: 'Zanzibar Traditional Deep Sea Fishing',
    description: 'Embark on a professional deep-sea game fishing trip in the fertile waters off Zanzibar.',
    longDescription: 'Experience the thrill of sport fishing in the rich waters of the Zanzibar channel and the open Indian Ocean. Our fully equipped professional fishing vessels, rigged with outriggers, downriggers, GPS, and high-quality Shimano and Penn reels, are guided by expert captains who know every seasonal migratory route. Whether you are aiming for Marlin, Sailfish, Yellowfin Tuna, Kingfish, or Wahoo, our ethical catch-and-release and sustainable fishing practices ensure an exhilarating and ecologically conscious voyage in paradise.',
    price: 'From $150/person',
    duration: 'Half Day (5 hrs)',
    groupSize: '1–6 people',
    includes: ['Professional fishing vessel', 'Master Captain & deckhand guides', 'High-end rods, lures, and live bait', 'Snacks, fresh fruit, and drinks', 'All licenses & safety gear'],
    image: 'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Sport Fishing',
    category: 'Ocean',
    highlights: [
      'Sailing the Indian Ocean on a rigged sport-fishing vessel',
      'Trolling for prestigious game fish like Kingfish, Tuna, and Wahoo',
      'Guided by a local Zanzibari master captain with decades of experience',
      'Equipped with top-of-the-line Shimano and Penn rods and reels',
      'Complimentary fresh sashimi preparation of your sustainable catch of the day'
    ],
    itinerary: [
      { time: '06:00 AM', title: 'Early Morning Docking', activity: 'Meet your private crew at the Nungwi or Kendwa marina dock, receive safety briefing, and board our game boat.' },
      { time: '06:30 AM', title: 'Setting the Trolling Lines', activity: 'Head out to deep water drop-offs where currents meet, setting up outriggers and lures for big game.' },
      { time: '08:30 AM', title: 'Sport Fishing Action', activity: 'Experience the rush when a line screams. Work with our expert deckhand to safely land your prize.' },
      { time: '10:30 AM', title: 'Tropical Refreshments on Board', activity: 'Cool down with chilled soft drinks, fresh Zanzibar pineapples, and freshly made snacks on deck.' },
      { time: '11:00 AM', title: 'Return to Shore & Drop-off', activity: 'Steer back to the docks. Celebrate your catch with photos, and transfer back to your beach resort.' }
    ],
    included: [
      'Private fully equipped sport-fishing boat and fuel',
      'Certified local master captain and professional deckhand',
      'State-of-the-art Penn and Shimano reels and high-quality lures',
      'Chilled soda, spring water, fresh local seasonal fruits, and snacks'
    ],
    excluded: [
      'Gratuities for captain and deck crew',
      'Hotel pickup (can be added as an optional transfer extra)'
    ],
    whatToBring: [
      'Sunglasses with polarized lenses (critical for spotting fish)',
      'Sun protection cream, lip balm, and protective sun shirt',
      'Seasickness medication (highly recommended to take 1 hour before departure)',
      'Camera or phone with waterproof pouch for capture'
    ],
    bestTimeToVisit: 'September to March for Yellowfin Tuna and Billfish, year-round for Kingfish and giant Trevally.',
    faq: [
      { q: 'Do I need any prior fishing experience?', a: 'Not at all! Our professional deck crew and captain will handle all rod rigging, lure selection, and hook settings, helping beginners and kids land their first big ocean fish.' },
      { q: 'Can we keep our catch?', a: 'Yes! While we encourage catch-and-release for endangered billfish, edible species like Yellowfin Tuna and Kingfish can be filleted and prepared for lunch, or shared with local fishing communities.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Half-Day Private Boat (Up to 4 Pax)', price: '$550 total' },
      { tier: 'Full-Day Deep Sea Charter (Up to 4 Pax)', price: '$850 total' },
      { tier: 'Extra Angler Rate', price: '$75 / person' }
    ],
    seoMetadata: {
      title: 'Zanzibar Deep Sea Sport Fishing | Traditional Big Game Charters',
      desc: 'Book a professional deep sea fishing charter in Zanzibar. Troll the Indian Ocean drop-offs for Yellowfin Tuna, Wahoo, Sailfish, and Marlin with local captains.',
      keywords: ['Zanzibar Fishing', 'Zanzibar Sport Fishing Charter', 'Deep Sea Fishing Zanzibar', 'Nungwi Fishing Boat', 'Shimano Rods Zanzibar']
    },
    relatedTours: ['safari-blue', 'mnemba-snorkeling', 'sunset-dhow']
  },
  {
    id: 'blue-lagoon',
    name: 'Blue Lagoon Snorkeling & Starfish Tour',
    description: 'Explore the hidden underwater paradise of the Blue Lagoon at Michamvi, and spot vibrant giant starfish.',
    longDescription: 'Discover the magical underwater world of Zanzibar’s eastern coastline. Located in the protected, crystal-clear mangrove-lined waters of Michamvi Peninsula, the Blue Lagoon is a shallow marine haven. Slip into serene, calm waters to explore thriving soft coral gardens home to clownfish, blue-striped snappers, and beautiful marine life. Following snorkeling, we visit the shallow sandbanks where giant, brightly colored starfish gather in abundance. Perfect for families, non-swimmers, and children, this tour offers some of the calmest water conditions on the island.',
    price: 'From $35/person',
    duration: 'Half Day (3 hrs)',
    groupSize: '2–12 people',
    includes: ['Professional snorkeling guide', 'Premium mask, snorkel, and life jacket', 'Traditional outrigger dhow boat', 'Cold water and fresh tropical fruits'],
    image: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Eco Marine',
    category: 'Ocean',
    highlights: [
      'Snorkeling shallow coral gardens in calm, current-free waters',
      'Discovering the natural starfish fields of Michamvi Peninsula',
      'Exploring the unique mangrove lagoons and marine nursery ecosystems',
      'Relaxing on the pristine, peaceful beaches of Michamvi',
      'Excellent photography with massive red and orange starfish'
    ],
    itinerary: [
      { time: '09:00 AM', title: 'Michamvi Gathering', activity: 'Meet our local beach guide on Michamvi beach and board a stable, traditional outrigger dhow.' },
      { time: '09:30 AM', title: 'Blue Lagoon Snorkeling', activity: 'Slide into the warm, transparent waters. Marvel at soft corals, clownfish, and sea anemones.' },
      { time: '10:45 AM', title: 'Starfish Sanctuary Walk', activity: 'Wade onto the shallow sandbars to observe and photograph majestic giant starfish in their natural habitat.' },
      { time: '11:30 AM', title: 'Fresh Swahili Fruit Picnic', activity: 'Feast on sweet local fruits, fresh coconut juices, and traditional snacks under a beach umbrella.' },
      { time: '12:00 PM', title: 'Return & Coast Resort Transit', activity: 'Sail back to the starting point. Private transfer back to your beach resort.' }
    ],
    included: [
      'All marine conservation permissions and guide fees',
      'Premium quality snorkeling masks, snorkels, and safety life vests',
      'Traditional boat transit and skilled captain',
      'Sweet local mangoes, watermelons, pineapples, and chilled bottled water'
    ],
    excluded: [
      'Lunches or full dinners',
      'Tips for guide and boat captain'
    ],
    whatToBring: [
      'Swimsuit, rash guard, and dry clothes',
      'Water shoes (highly recommended to protect feet near shallow corals)',
      'Reef-safe biodegradable sunscreen',
      'Waterproof camera or protective pouch'
    ],
    bestTimeToVisit: 'Highly dependent on the tides. Low-to-mid tide schedules provide the absolute best visibility and shallow sandbar exposure.',
    faq: [
      { q: 'Can I pick up or hold the starfish?', a: 'To protect these delicate marine creatures, we strictly request that you do not lift them out of the water, as they cannot breathe. Our guide will show you how to safely touch and photograph them while fully submerged.' },
      { q: 'Is this tour suitable for non-swimmers?', a: 'Yes! The Blue Lagoon is very shallow and protected from rough ocean waves, and we provide comfortable high-buoyancy life vests. A guide is always by your side.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Solo Snorkeler', price: '$55' },
      { tier: 'Standard Rate (2–4 Pax)', price: '$35 / person' },
      { tier: 'Family Special (5+ Pax)', price: '$28 / person' }
    ],
    seoMetadata: {
      title: 'Blue Lagoon Snorkeling Tour Zanzibar | Michamvi Starfish Adventure',
      desc: 'Snorkel the serene, shallow Blue Lagoon in Michamvi, Zanzibar. Discover vibrant starfish fields, protected coral gardens, and calm mangrove channels with native guides.',
      keywords: ['Blue Lagoon Zanzibar', 'Michamvi Starfish Tour', 'Zanzibar Starfish Snorkeling', 'Michamvi Lagoon', 'Zanzibar Snorkel Excursion']
    },
    relatedTours: ['mnemba-snorkeling', 'safari-blue', 'jozani-forest']
  },
  {
    id: 'cave-experience',
    name: 'Kuza Cave & Ancient Swahili Caves Experience',
    description: 'Swim in the sacred, crystal-clear fresh waters of Kuza Cave and discover Swahili culture.',
    longDescription: 'Discover the spiritual, geological, and historical wonder of Kuza Cave in Jambiani. Formed over 250,000 years of erosion, this ancient limestone cave houses a deep, subterranean pool of pure, mineral-rich fresh water. Regarded as sacred by local Swahili communities, swimming in the cave’s cool, crystal-clear waters is believed to have therapeutic and healing properties. Following your therapeutic swim, participate in an authentic Swahili cultural workshop. Join local musicians for a traditional drumming session, learn standard Swahili cooking with local organic herbs and spices, and listen to fascinating local history.',
    price: 'From $40/person',
    duration: 'Half Day (4 hrs)',
    groupSize: '1–15 people',
    includes: ['Cave entrance permits', 'Certified cultural guide', 'Traditional Swahili drumming workshop', 'Spiced tea and local snacks', 'Hotel transfers'],
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800',
    badge: 'Cultural Swim',
    category: 'Culture',
    highlights: [
      'Swimming in the crystal-clear freshwater pools of Kuza Cave',
      'Exploring deep limestone formations and stalactites dating back 250k years',
      'Participating in an energetic Swahili drumming and dancing workshop',
      'Learning Swahili cooking methods with native village chefs',
      'Learning about Zanzibari culture, history, and ancient medicine'
    ],
    itinerary: [
      { time: '09:00 AM', title: 'Jambiani Resort Pickup', activity: 'Board our comfortable air-conditioned transfer from your resort and travel to the historic village of Jambiani.' },
      { time: '09:30 AM', title: 'Kuza Cave Guided Walk', activity: 'Wander down the lush nature trails to the limestone sinkhole entrance. Descend into the cavern with your local guide.' },
      { time: '10:00 AM', title: 'Therapeutic Cave Swim', activity: 'Float in the deep, healing, mineral-rich fresh water pool. Enjoy the surreal acoustic echoes of the cave.' },
      { time: '11:15 AM', title: 'Swahili Drumming & Cooking', activity: 'Gather at the cultural center for a hands-on workshop. Learn to cook coconut curry and play traditional Swahili drums.' },
      { time: '12:30 PM', title: 'Spiced Tea Tasting & Departure', activity: 'Sip on local lemongrass tea, snap beautiful memories, and transfer back to your beach hotel.' }
    ],
    included: [
      'All cave entry and conservation municipal tickets',
      'Dedicated native Swahili guide and workshop hosts',
      'Private air-conditioned vehicle resort transfers',
      'Traditional drumming lesson instruments and food ingredients'
    ],
    excluded: [
      'Souvenir purchases or external restaurant lunches',
      'Voluntary tips for cave musicians and guides'
    ],
    whatToBring: [
      'Swimwear and secure towel (changing rooms are available at the base)',
      'Comfortable walking shoes with good grip for cave stone steps',
      'Mosquito repellent for the jungle nature trail walk',
      'Warm sweater or dry clothes for post-cave relaxation'
    ],
    bestTimeToVisit: 'Year-round. The cave pool maintains a cool, refreshing temperature of around 24°C regardless of external heat.',
    faq: [
      { q: 'Is the cave deep? Is it safe for children?', a: 'The freshwater pool reaches depths of 2-3 meters in the center, but has shallow ledges around the border. Life jackets and swimming rings are provided, making it highly secure for children and beginners under adult supervision.' },
      { q: 'Can we take pictures inside the cave?', a: 'Yes! The cave is illuminated by natural sunlight filtering through the sinkhole, creating stunning, magical photo opportunities. Flash photography is allowed.' }
    ],
    gallery: [
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600'
    ],
    pricingTable: [
      { tier: 'Solo Explorer', price: '$60' },
      { tier: 'Standard Group (2–4 Pax)', price: '$40 / person' },
      { tier: 'Large Group Discount (5+ Pax)', price: '$32 / person' }
    ],
    seoMetadata: {
      title: 'Kuza Cave Tour Zanzibar | Jambiani Ancient Cave & Swahili Culture',
      desc: 'Explore and swim in the crystal-clear freshwater pool of Kuza Cave in Jambiani, Zanzibar. Participate in Swahili cooking and drumming workshops with local guides.',
      keywords: ['Kuza Cave Zanzibar', 'Jambiani Cave Swim', 'Zanzibar Caves Tour', 'Swahili Drumming Workshop', 'Zanzibar Cultural Experience']
    },
    relatedTours: ['jozani-forest', 'spice-farm', 'stone-town']
  }
];

export const tourNames = tours.map(t => t.name);
