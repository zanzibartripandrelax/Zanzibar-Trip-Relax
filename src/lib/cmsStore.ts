import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Destination, ActivityItem, DEFAULT_DESTINATIONS, DEFAULT_ACTIVITIES, DEFAULT_ATTRACTIONS } from './destinationDefaults';

export type { Destination, ActivityItem };

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string; // e.g. "B, L, D"
  activities?: string[];
  images?: string[];
  gpsLocation?: { lat: number; lng: number; label: string };
  travelTime?: string;
}

export interface TourItem {
  id: string;
  title: string;
  slug: string;
  category: 'tour' | 'package' | 'safari' | 'transfer' | 'kilimanjaro' | 'honeymoon' | 'day-trip' | string;
  shortDesc: string;
  desc?: string; // Legacy
  scenicValue?: string; // Legacy
  longDescription?: string;
  highlights?: string[];
  included?: string[];
  excluded?: string[];
  price: string;
  discountPrice?: string;
  duration: string;
  location: string;
  difficulty?: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
  img: string;
  gallery?: string[];
  videoUrl?: string;
  mapUrl?: string;
  pickupDetails?: string;
  dropoffDetails?: string;
  availability?: string;
  maxGuests?: number;
  languages?: string[];
  itineraryDays?: ItineraryDay[];
  itinerary?: string[]; // Legacy support
  visible?: boolean;
  archived?: boolean;
  featured?: boolean;
  bestTimeToVisit?: string;
  whatToBring?: string[];
  tags?: string[];
  pricingTable?: { tier: string; rate: string }[];
  faqs?: { q: string; a: string }[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  lastUpdated?: string;
  destinationIds?: string[]; // Related destinations
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface CompanyValue {
  title: string;
  desc: string;
  icon: string;
}

export interface FaqItem {
  category: string;
  q: string;
  a: string;
}

export interface TestimonialItem {
  id: string;
  guest_name: string;
  rating_stars: number;
  toured_package: string;
  comments: string;
  source: 'Google' | 'TripAdvisor' | 'Facebook' | 'Custom';
  guest_photo?: string;
}

export interface MediaFile {
  id: string;
  name: string;
  folder: string;
  url: string;
  size: string;
  dimensions: string;
  filePath?: string;
  uploadedAt?: string;
  altText?: string;
  focalPoint?: { x: number; y: number };
  originalUrl?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export interface Coupon {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number; // e.g. 15 for 15% or 50 for $50
  expirationDate: string; // YYYY-MM-DD
  maxUses: number;
  usedCount: number;
  minBookingAmount: number;
  applicableCategory: string; // 'all', 'tour', 'package', 'safari', 'transfer'
  applicableDepartures: 'all' | 'shared_only' | 'private_only';
  oneTimeUse: boolean;
}

export interface DateBlockage {
  id: string;
  date: string; // YYYY-MM-DD
  status: 'available' | 'limited' | 'fully_booked' | 'guaranteed_departure' | 'private_only' | 'seasonal_closure';
  notes?: string;
}

export interface YoutubeVideo {
  id: string;
  title: string;
  url: string;
  embedId: string;
  description?: string;
}

export interface Attraction {
  id: string;
  destinationId: string;
  name: string;
  image: string;
  description: string;
  location: string;
  mapUrl?: string;
  thingsToDo: string[];
  relatedTours?: string[]; // list of related tour IDs or titles
}

export interface Region {
  id: string;
  name: string;
  image: string;
  description: string;
  tagline: string;
  tag: string;
  destCount?: number;
}

export interface SiteContent {
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    workingHours: string;
    ownerEmail: string;
  };
  hero: {
    headingPart1: string;
    headingPart2: string;
    headingPart3: string;
    subtitle: string;
    primaryButtonText: string;
    primaryButtonAction: string;
    secondaryButtonText: string;
    secondaryButtonAction: string;
    bgImages: string[];
  };
  about: {
    heroTitle: string;
    heroSubtitle: string;
    storyTitle: string;
    storyText1: string;
    storyText2: string;
    stats: { value: string; label: string }[];
    values: CompanyValue[];
    team: TeamMember[];
  };
  tours: TourItem[];
  packages: any[]; // Holiday Packages
  hotels: any[];
  transfers: any[];
  blog_posts: any[];
  reviews: any[];
  faqs: FaqItem[];
  testimonials: TestimonialItem[];
  newsletterBgImages?: string[];
  kilimanjaroBgImages?: string[];
  youtubeVideos?: YoutubeVideo[];
  destinations?: Destination[];
  activities?: ActivityItem[];
  regions?: Region[];
  attractions?: Attraction[];
  logos?: SiteLogos;
}

export interface SiteLogos {
  headerLogo: string;
  footerLogo: string;
  darkLogo: string;
  lightLogo: string;
  mobileLogo: string;
  favicon: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  if (errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('unavailable')) {
    console.warn(`Firestore operating in offline mode for ${operationType} on ${path}: ${errMsg}`);
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Minimal sync timestamp helper (No heavy JSON is ever stored in localStorage)
function updateSyncTimestamp(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ztr_cms_sync_timestamp', Date.now().toString());
    }
  } catch (e) {
    // Ignore storage quota warnings for lightweight string
  }
}

export const DEFAULT_SITE_LOGOS: SiteLogos = {
  headerLogo: '/src/assets/images/logo.png',
  footerLogo: '/src/assets/images/logo.png',
  darkLogo: '/src/assets/images/logo.png',
  lightLogo: '/src/assets/images/logo.png',
  mobileLogo: '/src/assets/images/logo.png',
  favicon: '/src/assets/images/logo.png'
};

const DEFAULT_SITE_CONTENT: SiteContent = {
  contact: {
    phone: '+255 629 506 063',
    whatsapp: '+255 629 506 063',
    email: 'info@zanzibartripandrelax.com',
    address: 'Stone Town, Zanzibar, Tanzania',
    workingHours: 'Daily: 07:00 AM - 10:00 PM',
    ownerEmail: 'zavoyatour@gmail.com',
  },
  hero: {
    headingPart1: 'Discover Zanzibar Like a Local.',
    headingPart2: 'Customized Tours & Safaris.',
    headingPart3: 'Relax in Swahili Paradise.',
    subtitle: 'Explore pristine beaches, immersive Swahili culture, and spectacular Tanzanian safaris with Zanzibar\'s premier local operator.',
    primaryButtonText: 'Book a Tour',
    primaryButtonAction: 'tours',
    secondaryButtonText: 'Plan My Trip',
    secondaryButtonAction: 'booking',
    bgImages: [
      'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1920',
      'https://images.pexels.com/photos/1320688/pexels-photo-1320688.jpeg?auto=compress&cs=tinysrgb&w=1920',
    ],
  },
  about: {
    heroTitle: 'About Us',
    heroSubtitle: 'Zanzibar Trip & Relax is a registered, fully licensed local tour operator based in the heart of historic Stone Town.',
    storyTitle: 'Our Authentic Story',
    storyText1: 'We began with a simple vision: to protect travelers from predatory tour pricing while establishing a platform that supports local guides and protects beautiful marine ecosystems. Born and raised in Zanzibar, our guides understand every reef, tide pool, spice farm, and backstreet history.',
    storyText2: 'Today, we curator bespoke holidays that connect global minds to Tanzania’s mainland safaris, Uhuru peak climbing summits of Mount Kilimanjaro, and crystal-clear turquoise private beaches of structural islands.',
    stats: [
      { value: '5,000+', label: 'Happy Travelers' },
      { value: '50+', label: 'Countries Served' },
      { value: '10+', label: 'Years Experience' },
      { value: '5.0★', label: 'Guest Rating' },
    ],
    values: [
      { title: 'Local Authenticity', desc: 'Every experience is guided by native experts who live and breathe Zanzibar culture.', icon: 'Globe' },
      { title: 'Eco-Protection', desc: 'We educate tourists to protect marine zones, corals, and avoid stepping on reef barriers.', icon: 'Leaf' },
      { title: 'Ethical Wages', desc: 'Compliance with KPAP porters guidelines ensuring high wages and warm mountain shelters.', icon: 'Heart' },
      { title: 'Transparent Cost', desc: 'No hidden dynamic pricing. Direct bookings empower the island community directly.', icon: 'Award' },
    ],
    team: [
      { name: 'Gerevas Paulo Mtaki', role: 'Founder & CEO', bio: 'Born near Serengeti National Park, Gerevas founded Zanzibar Trip & Relax to share the extraordinary beauty of his homeland with travelers worldwide. With 10+ years in Tanzania tourism, he leads every guest experience with passion, integrity, and deep local knowledge.', image: '/src/assets/images/ceo_gerevas.jpg' },
      { name: 'Careen Harrison Kiondo', role: 'Co-Founder & Guest Experience Specialist', bio: 'Careen brings 8+ years of hospitality expertise to every guest interaction. She oversees all guest relations, custom trip planning, and ensures every journey exceeds expectations. Her warm personality and attention to detail make every guest feel like family.', image: '/src/assets/images/cofounder_careen_1781838357793.jpg' },
      { name: 'Harrison Kiondo', role: 'Tourism Consultant', bio: "With extensive expertise in Tanzania's tourism sector, Harrison serves as a trusted advisor to Zanzibar Trip & Relax. His deep understanding of Tanzania's diverse attractions — from safari parks to coastal resorts — helps ensure our guests enjoy well-planned, authentic, and memorable travel experiences.", image: '/src/assets/images/Tourism Consultant Harrison Kiondo.jpg' },
    ],
  },
  tours: [
    { id: 'safari-blue', title: 'Safari Blue Ocean Cruise', slug: 'safari-blue', category: 'tour', shortDesc: 'Sail past Sandbanks, snorkel clear lagoon corals, and enjoy a fresh seafood buffet on Kwale Island.', price: '$80', duration: 'Full Day (8 hrs)', location: 'Menai Bay, Fumba', img: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=600', visible: true },
    { id: 'mnemba-snorkeling', title: 'Mnemba Island Snorkeling', slug: 'mnemba-snorkeling', category: 'tour', shortDesc: 'Swim in crystal-clear waters alongside wild dolphins, sea turtles, and starfish near the famous private island.', price: '$35', duration: 'Half Day (4 hrs)', location: 'Matemwe, Nungwi', img: 'https://images.pexels.com/photos/1450363/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600', visible: true },
    { id: 'stone-town', title: 'Stone Town Historical Tour', slug: 'stone-town-walk', category: 'tour', shortDesc: 'Explore the narrow coral lanes, rich sultan history, bustling local bazaars, and Fredy Mercury museum.', price: '$45', duration: 'Half Day (4 hrs)', location: 'Stone Town', img: 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1600', visible: true },
    { id: 'prison-island', title: 'Prison Island & Giant Tortoises', slug: 'prison-island', category: 'tour', shortDesc: 'A short boat ride to feed Aldabra giant tortoises dating back to 100 years and snorkel the prison reef flats.', price: '$50', duration: 'Half Day (4 hrs)', location: 'Stone Town Harbor', img: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1600', visible: true },
    { id: 'spice-farm', title: 'Zanzibar Spice Farm Tour', slug: 'spice-farm', category: 'tour', shortDesc: 'Touch, smell, and taste organic spices like cloves, vanilla, and nutmeg on a private guided farm walkthrough.', price: '$30', duration: '3 Hours', location: 'Kizimbani, Zanzibar', img: 'https://images.pexels.com/photos/1012509/pexels-photo-1012509.jpeg?auto=compress&cs=tinysrgb&w=600', visible: true },
    { id: 'jozani-forest', title: 'Jozani Chwaka Bay National Park Guided Tour', slug: 'jozani-forest', category: 'tour', shortDesc: 'Spot the endemic, playful red colobus monkeys in Zanzibar’s only national park and explore mangrove boardwalks.', price: '$40', duration: '3 Hours', location: 'Jozani, Central Region', img: 'https://images.pexels.com/photos/2289409/pexels-photo-2289409.jpeg?auto=compress&cs=tinysrgb&w=600', visible: true },
    { id: 'dolphin-kizimkazi', title: 'Dolphin Safari at Kizimkazi', slug: 'dolphin-kizimkazi', category: 'tour', shortDesc: 'Take a boat ride at sunrise to swim with wild dolphins in the pristine coastal waters of Kizimkazi.', price: '$45', duration: 'Half Day (5 hrs)', location: 'Kizimkazi, South Coast', img: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=600', visible: true },
    { id: 'nakupenda-sandbank', title: 'Nakupenda Sandbank Beach Picnic', slug: 'nakupenda-sandbank', category: 'tour', shortDesc: 'A complete tropical beach picnic on a stunning sandbank with snorkeling and fresh wood-fire lobsters.', price: '$65', duration: 'Full Day (8 hrs)', location: 'Stone Town Harbor', img: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600', visible: true },
    { id: 'sunset-dhow', title: 'Traditional Sunset Dhow Cruise', slug: 'sunset-dhow', category: 'tour', shortDesc: 'Watch the golden sunset sink into the Indian Ocean while sailing on a traditional wooden Swahili dhow with live music and appetizers.', price: '$40', duration: '2–3 Hours', location: 'Stone Town or Nungwi', img: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=600', visible: true },
    { id: 'quad-bike', title: 'Exhilarating Quad Bike (ATV) Safari', slug: 'quad-bike', category: 'tour', shortDesc: 'Rev through scenic coconut plantations, Swahili clay villages, muddy forest tracks, and coastal dunes.', price: '$65', duration: '3 Hours', location: 'Nungwi Base, North Coast', img: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=600', visible: true },
    { id: 'fishing-experience', title: 'Traditional Deep Sea Sport Fishing', slug: 'fishing-experience', category: 'tour', shortDesc: 'Troll the deep Indian Ocean drop-offs for Yellowfin Tuna, Wahoo, Sailfish, and Kingfish with high-end rods and captains.', price: '$150', duration: 'Half Day (5 hrs)', location: 'Nungwi Docks, North Coast', img: 'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=600', visible: true },
    { id: 'blue-lagoon', title: 'Blue Lagoon & Starfish Snorkeling', slug: 'blue-lagoon', category: 'tour', shortDesc: 'Explore calm soft coral gardens and marvel at giant orange starfish on shallow Michamvi sandbars.', price: '$35', duration: '3 Hours', location: 'Michamvi, East Coast', img: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=600', visible: true },
    { id: 'cave-experience', title: 'Kuza Cave Cultural Swim', slug: 'cave-experience', category: 'tour', shortDesc: 'Swim in sacred, therapeutic fresh water cavern pools and enjoy Swahili drumming and cooking lessons.', price: '$40', duration: 'Half Day (4 hrs)', location: 'Jambiani, East Coast', img: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600', visible: true },
    {
      id: '3-day-escape',
      title: '3-Day Zanzibar Romantic Escape',
      slug: '3-day-escape',
      category: 'package',
      shortDesc: 'Perfect for couples, honeymooners, and weekend travelers who want an intimate, high-comfort luxury taste of Zanzibar’s charm.',
      price: '$350',
      duration: '3 Days / 2 Nights',
      location: 'Stone Town & Prison Island Sanctuary',
      img: 'https://images.pexels.com/photos/1547843/pexels-photo-1547843.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Couples Choice', 'Honeymoon Special', 'Short Escape'],
      highlights: [
        'Welcome private Airport meet & greet and direct resort transfers',
        'Hand-feeding prehistoric Aldabra Giant Tortoises on Changuu Island',
        'Private wooden chartered boat sailing past Stone Town’s classic waterfront',
        'Authentic candle-lit seafood dinner at a gorgeous rooftop terrace',
        'Guided historical tour of Omani Fort lanes and Arab doors'
      ],
      bestTimeToVisit: 'Year-round. Outstandingly romantic during warm months.',
      whatToBring: ['Smart casual clothing', 'Swimwear', 'Camera', 'Small cash USD'],
      included: ['2 Nights boutique riad', 'Transfers', 'Guide fees', 'Ferry logistics', 'Tortoise reserve passes'],
      excluded: ['Lunches', 'Flights', 'Tips'],
      visible: true,
      itineraryDays: [
        { dayNumber: 1, title: 'Welcome Greeting & Stone Town Sunset Walks', description: 'Step out to meet your private driver at Zanzibar Airport ZNZ.' },
        { dayNumber: 2, title: 'Prison Island Tortoises & White Sandbank Picnic', description: 'Board a comfortable private wooden boat to Changuu Island.' },
        { dayNumber: 3, title: 'Historic Stone Town Walking Tour & Departure', description: 'Follow our historian guide past the copper-studded Omani and Arab doors.' }
      ]
    },
    {
      id: '5-day-beach-adventure',
      title: '5-Day Ultimate Beach & Tour Adventure',
      slug: '5-day-beach-adventure',
      category: 'package',
      shortDesc: 'Our legendary best-selling holiday package combining history, sailing, snorkeling, and spice farms.',
      price: '$650',
      duration: '5 Days / 4 Nights',
      location: 'Stone Town, Safari Blue, Spice Farms & Nungwi',
      img: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Best Seller', 'Adventure Combo', 'Beaches Master'],
      visible: true,
      itineraryDays: [
        { dayNumber: 1, title: 'Arrival & North Coast Transfer', description: 'Arrival at ZNZ airport and transfer to Nungwi.' },
        { dayNumber: 2, title: 'Mnemba Snorkeling Expedition', description: 'Full day marine adventure.' },
        { dayNumber: 3, title: 'Spice Farm & Jozani Monkeys', description: 'Organic farm tour and red colobus monkey spotting.' },
        { dayNumber: 4, title: 'Safari Blue Marine Safari', description: 'Full day dhow sailing in Menai Bay.' },
        { dayNumber: 5, title: 'Stone Town & Departure', description: 'Walking tour and final airport transfer.' }
      ]
    },
    {
      id: '7-day-zanzibar-combo',
      title: '7-Day Heritage, Nature & Ocean Combo',
      slug: '7-day-zanzibar-combo',
      category: 'package',
      shortDesc: 'Deep Zanzibar immersion combining five-star beach stays, spice trails, and history.',
      price: '$1150',
      duration: '7 Days / 6 Nights',
      location: 'Stone Town, Paje & Nungwi',
      img: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Luxury Leisure', 'Full Immersion'],
      visible: true,
      itineraryDays: [
        { dayNumber: 1, title: 'Arrival & Swahili Welcome', description: 'Transfer to Stone Town and Swahili dinner.' },
        { dayNumber: 2, title: 'Prison Island & Giant Tortoises', description: 'Meet the giants of Changuu Island.' },
        { dayNumber: 3, title: 'Spice Farms & Bwejuu Beach', description: 'Farm-to-table lunch and transfer to Bwejuu.' },
        { dayNumber: 4, title: 'Mnemba Snorkeling', description: 'Outer reef snorkeling expedition.' },
        { dayNumber: 5, title: 'Leisure Day', description: 'Beachside relaxation at Bwejuu.' },
        { dayNumber: 6, title: 'Safari Blue Adventure', description: 'Full day marine safari.' },
        { dayNumber: 7, title: 'Jozani Forest & Departure', description: 'Monkey spotting and airport transfer.' }
      ]
    }
  ],
  packages: [],
  hotels: [],
  transfers: [],
  blog_posts: [],
  reviews: [],
  faqs: [
    { category: 'Visas & Customs', q: 'Do I need a visa to enter Zanzibar (Tanzania)?', a: 'Most international travelers require a visa. You can apply easily online via the official Tanzania eVisa system (recommended at least 2 weeks before) or purchase a Visa on Arrival at Abeid Amani Karume International Airport (ZNZ) for $50 for standard nations or $100 for citizens of the USA.' },
    { category: 'Visas & Customs', q: 'What is the passport validity requirement?', a: 'Your passport must have at least six (6) months of validity remaining from your arrival date and at least two blank consecutive pages.' },
    { category: 'Health & Vaccine Safety', q: 'Are vaccinations required to visit?', a: 'Yellow Fever vaccinations are required ONLY if you are transit-traveling from or through a high-risk Yellow Fever destination (e.g., Kenya, Ethiopia) for more than 12 hours. We suggest standard vaccines like Hepatitis A/B, Tetanus, Typhoid. Malaria prophylaxis is recommended; consult your travel physician.' },
    { category: 'Health & Vaccine Safety', q: 'Is water safe to drink?', a: 'No, do not drink tap water in Zanzibar. We provide unlimited clean bottled spring drinking water on all our tours and transfers for tourist safety.' },
  ],
  testimonials: [
    { id: 't1', guest_name: 'Sarah Jenkins', rating_stars: 5, toured_package: '5 Day Beach & Adventure', comments: 'Our guide Nassor made the trip perfect. Snorkeling at Mnemba was paradise, and everything was highly organized without hidden charges.', source: 'TripAdvisor' },
    { id: 't2', guest_name: 'David Müller', rating_stars: 5, toured_package: 'Stone Town Walk & Safari Blue', comments: 'Superb local driver! Very safe driving, clean microbuses, and amazing fresh lobster feast on Kwale. Highly recommend!', source: 'Google' },
    { id: 't3', guest_name: 'Elena Rostova', rating_stars: 5, toured_package: 'Zanzibar + Safari Combo', comments: 'The transition between Zanzibar resort flight and Serengeti safari lodge was absolutely flawless. Khamis is a brilliant driver.', source: 'Facebook' },
  ],
  newsletterBgImages: [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&w=1600&q=80'
  ],
  kilimanjaroBgImages: [
    'https://images.unsplash.com/photo-1589553460730-dfeb1e41d8e1?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80'
  ],
  youtubeVideos: [
    {
      id: 'yt-1',
      title: 'Zanzibar Vacation Travel Guide 4K',
      url: 'https://www.youtube.com/watch?v=COH39I_8Vv8',
      embedId: 'COH39I_8Vv8',
      description: 'Explore the stunning beaches and historical streets of Zanzibar in pristine 4K resolution.'
    },
    {
      id: 'yt-2',
      title: 'Nakupenda Sandbank Beach Bliss',
      url: 'https://www.youtube.com/watch?v=L38fR_vK-iU',
      embedId: 'L38fR_vK-iU',
      description: 'Experience Nakupenda Sandbank, a magical tropical paradise off the coast of Stone Town.'
    },
    {
      id: 'yt-3',
      title: 'Tanzania Wildlife Safari Serengeti',
      url: 'https://www.youtube.com/watch?v=aD77-k1tZxs',
      embedId: 'aD77-k1tZxs',
      description: 'Witness the incredible lions, leopards, and giant elephant herds roaming the Serengeti plains.'
    }
  ],
  destinations: DEFAULT_DESTINATIONS,
  activities: DEFAULT_ACTIVITIES,
  regions: [
    {
      id: 'northern',
      name: 'Northern Tanzania',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      description: 'The iconic safari capital of East Africa. Experience the endless plains of the Serengeti, the breathtaking caldera of Ngorongoro Crater, and stand in the shadow of Mount Kilimanjaro, the Roof of Africa.',
      destCount: 7,
      tagline: 'Classic Safaris & Rooftop Peaks',
      tag: 'Wildlife & Adventure'
    },
    {
      id: 'southern',
      name: 'Southern Tanzania',
      image: 'https://images.pexels.com/photos/1013329/pexels-photo-1013329.jpeg?auto=compress&cs=tinysrgb&w=1200',
      description: 'A wild, untouched frontier for the true adventurer. Discover the vast plains of Nyerere (Selous), the giant lion prides of Ruaha, and the breathtaking water channels of Mikumi.',
      destCount: 3,
      tagline: 'Untamed Wilderness & Boat Safaris',
      tag: 'Raw & Exclusive'
    },
    {
      id: 'zanzibar',
      name: 'Zanzibar Archipelago',
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
      description: 'The ancient clove-scented Swahili coast. Relax on the powdery white-sand beaches of Unguja, dive the pristine walls of Pemba, and swim with gentle whale sharks in Mafia Island.',
      destCount: 3,
      tagline: 'Swahili Culture & Turquoise Shores',
      tag: 'Beach & Culture'
    }
  ],
  attractions: DEFAULT_ATTRACTIONS
};

export const DEFAULT_MEDIA: MediaFile[] = [
  { 
    id: 'm1', 
    name: 'Zanzibar_Paradise_Hero.jpeg', 
    folder: 'banners', 
    url: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200', 
    size: '245 KB', 
    dimensions: '1920x1080',
    filePath: 'banners/Zanzibar_Paradise_Hero.jpeg',
    uploadedAt: '2026-07-01T12:00:00Z',
    altText: 'Scenic view of Zanzibar paradise beach with turquoise water'
  },
  { 
    id: 'm2', 
    name: 'Nakupenda_Sandbank.jpeg', 
    folder: 'banners', 
    url: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=1200', 
    size: '184 KB', 
    dimensions: '1920x1080',
    filePath: 'banners/Nakupenda_Sandbank.jpeg',
    uploadedAt: '2026-07-02T12:00:00Z',
    altText: 'Nakupenda sandbank island in Zanzibar under blue sky'
  },
  { 
    id: 'm3', 
    name: 'Stone_Town_Street.jpeg', 
    folder: 'tours', 
    url: 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1200', 
    size: '312 KB', 
    dimensions: '1600x1200',
    filePath: 'tours/Stone_Town_Street.jpeg',
    uploadedAt: '2026-07-03T12:00:00Z',
    altText: 'A historic street alleyway in Stone Town, Zanzibar'
  },
  { 
    id: 'm4', 
    name: 'Owner_Nassor.jpeg', 
    folder: 'avatars', 
    url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300', 
    size: '42 KB', 
    dimensions: '300x300',
    filePath: 'avatars/Owner_Nassor.jpeg',
    uploadedAt: '2026-07-04T12:00:00Z',
    altText: 'Nassor, the owner and founder of Zanzibar Trip & Relax'
  },
  { 
    id: 'm5', 
    name: 'Serengeti_Jeep_Safari.jpeg', 
    folder: 'safaris', 
    url: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1200', 
    size: '260 KB', 
    dimensions: '1920x1080',
    filePath: 'safaris/Serengeti_Jeep_Safari.jpeg',
    uploadedAt: '2026-07-05T12:00:00Z',
    altText: 'A safari jeep parked near a magnificent lion in the Serengeti savanna'
  },
];

const DEFAULT_COUPONS: Coupon[] = [
  { id: 'c1', name: 'WELCOME10', type: 'percentage', value: 10, expirationDate: '2028-12-31', maxUses: 1000, usedCount: 14, minBookingAmount: 0, applicableCategory: 'all', applicableDepartures: 'all', oneTimeUse: false },
  { id: 'c2', name: 'SAVE50', type: 'fixed', value: 50, expirationDate: '2028-12-31', maxUses: 500, usedCount: 8, minBookingAmount: 300, applicableCategory: 'all', applicableDepartures: 'all', oneTimeUse: false },
  { id: 'c3', name: 'HONEYMOON15', type: 'percentage', value: 15, expirationDate: '2028-12-31', maxUses: 200, usedCount: 3, minBookingAmount: 400, applicableCategory: 'package', applicableDepartures: 'private_only', oneTimeUse: true },
  { id: 'c4', name: 'LOCAL5', type: 'percentage', value: 5, expirationDate: '2028-12-31', maxUses: 1000, usedCount: 95, minBookingAmount: 0, applicableCategory: 'tour', applicableDepartures: 'shared_only', oneTimeUse: false },
  { id: 'c5', name: 'RETURN10', type: 'percentage', value: 10, expirationDate: '2028-12-31', maxUses: 300, usedCount: 22, minBookingAmount: 50, applicableCategory: 'all', applicableDepartures: 'all', oneTimeUse: false }
];

const DEFAULT_BLOCKAGES: DateBlockage[] = [
  { id: 'b1', date: '2026-07-25', status: 'fully_booked', notes: 'Mnemba Island Private Charter' },
  { id: 'b2', date: '2026-08-15', status: 'guaranteed_departure', notes: 'Safari Blue Coral Fest guaranteed' },
  { id: 'b3', date: '2026-11-10', status: 'seasonal_closure', notes: 'Monsoon season maintenance closure' },
  { id: 'b4', date: '2026-06-30', status: 'limited', notes: 'Low seats left' }
];

export interface SeasonalityConfig {
  peakStartMonth: number; // 1-12
  peakStartDay: number;
  peakEndMonth: number;
  peakEndDay: number;
  peakStartMonth2: number; // second window (e.g. Dec-Feb)
  peakStartDay2: number;
  peakEndMonth2: number;
  peakEndDay2: number;
  peakPct: number; // e.g. 15
  greenPct: number; // e.g. -10
}

export interface TransportZone {
  id: string;
  name: string;
  price: number;
  enabled?: boolean;
}

export interface HotelOption {
  id: string;
  name: string;
  zoneId: string;
  enabled?: boolean;
  destinationId?: string;
  image?: string;
  description?: string;
  stars?: string;
  category?: string;
}

const DEFAULT_SEASONALITY: SeasonalityConfig = {
  peakStartMonth: 6, // June
  peakStartDay: 1,
  peakEndMonth: 10, // October
  peakEndDay: 31,
  peakStartMonth2: 12, // Dec
  peakStartDay2: 15,
  peakEndMonth2: 2, // Feb
  peakEndDay2: 28,
  peakPct: 15,
  greenPct: -10
};

const DEFAULT_ZONES: TransportZone[] = [
  { id: 'z1', name: 'Zone 1 – Stone Town', price: 0 },
  { id: 'z2', name: 'Zone 2 – Bububu', price: 10 },
  { id: 'z3', name: 'Zone 3 – Matemwe', price: 25 },
  { id: 'z4', name: 'Zone 4 – Kiwengwa', price: 25 },
  { id: 'z5', name: 'Zone 5 – Pwani Mchangani', price: 30 },
  { id: 'z6', name: 'Zone 6 – Uroa', price: 20 },
  { id: 'z7', name: 'Zone 7 – Michamvi', price: 25 },
  { id: 'z8', name: 'Zone 8 – Paje', price: 20 },
  { id: 'z9', name: 'Zone 9 – Jambiani', price: 20 },
  { id: 'z10', name: 'Zone 10 – Makunduchi', price: 30 },
  { id: 'z11', name: 'Zone 11 – Nungwi', price: 35 },
  { id: 'z12', name: 'Zone 12 – Kendwa', price: 35 },
];

const DEFAULT_HOTELS: HotelOption[] = [
  { id: 'h1', name: 'Zanzibar Royal Beach Resort', zoneId: 'z11', destinationId: 'unguja', image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Perched on Nungwi beach with premium infinity pools, private beach stretches, and beautiful ocean sunset dining.', stars: '5', category: 'Premium Elite' },
  { id: 'h2', name: 'Baraza Heritage Hotel', zoneId: 'z1', destinationId: 'unguja', image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Rich Swahili architectural palace in the heart of Stone Town, boasting historical suites and premium rooftop dining.', stars: '5', category: 'Heritage Luxury' },
  { id: 'h3', name: 'Paje Blue Surf Palms Resort', zoneId: 'z8', destinationId: 'unguja', image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Exclusive eco-conscious sanctuary nestled inside pristine private tropical palm forests, offering high-end luxury suites.', stars: '4', category: 'Eco Premium' },
  { id: 'h4', name: 'Gold Zanzibar Beach House', zoneId: 'z12', destinationId: 'unguja', image: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'An elegant oasis in Kendwa Beach with premium beachside villas, fine dining options, and extreme-tides wellness treatments.', stars: '5', category: 'Premium Elite' },
  { id: 'h5', name: 'Zuri Zanzibar Resort', zoneId: 'z12', destinationId: 'unguja', image: 'https://images.pexels.com/photos/261181/pexels-photo-261181.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Bespoke design resort featuring dynamic thatch villas, award-winning spice gardens, and beautiful private turquoise ocean bays.', stars: '5', category: 'Ultra Luxury' },
  { id: 'h6', name: 'Matemwe Lodge', zoneId: 'z3', destinationId: 'unguja', image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Perched on high coral cliffs overlooking a pristine lagoon and the world-famous snorkeling sandbanks of Mnemba Atoll.', stars: '4', category: 'Scenic Premium' },
  { id: 'h7', name: 'Melia Zanzibar Resort', zoneId: 'z4', destinationId: 'unguja', image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Stunning all-inclusive resort on the east coast, built along private cliffs with a dramatic 300-meter jetty lounge.', stars: '5', category: 'Premium Elite' },
  { id: 'h8', name: 'Michamvi Sunset Bay', zoneId: 'z7', destinationId: 'unguja', image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Nestled in a tranquil, protected crescent bay on the Michamvi Peninsula, perfect for swimming and witnessing spectacular Zanzibar sunsets.', stars: '4', category: 'Boutique Relax' },
  { id: 'h9', name: 'Riu Palace Zanzibar', zoneId: 'z11', destinationId: 'unguja', image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Sprawling premium adult-only cliffside sanctuary, offering all-suite configurations and stellar sea views.', stars: '5', category: 'Ultra Luxury' },
  { id: 'h10', name: 'Royal Zanzibar Beach Resort', zoneId: 'z11', destinationId: 'unguja', image: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'A massive beachfront resort offering infinite-pool swim-up bars, traditional Swahili architectures, and family gardens.', stars: '5', category: 'Premium Elite' },
  { id: 'h11', name: 'Z Hotel', zoneId: 'z11', destinationId: 'unguja', image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Chic, boutique beachfront hotel on the vibrant Nungwi sands, combining contemporary style with Swahili warmth.', stars: '4', category: 'Boutique Elite' },
  { id: 'h12', name: 'Nungwi Dreams', zoneId: 'z11', destinationId: 'unguja', image: 'https://images.pexels.com/photos/261181/pexels-photo-261181.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Modern, design-centric suites located in the quiet eastern Nungwi sector, offering infinity rooftop lounges and starfish snorkeling reefs.', stars: '5', category: 'Premium Elite' },
  { id: 'h13', name: 'Nungwi Inn', zoneId: 'z11', destinationId: 'unguja', image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Cozy, traditional thatched beach cottages on the white sands of Nungwi, ideal for budget-friendly beach escapes.', stars: '3', category: 'Standard Beach' },
  { id: 'h14', name: 'Serengeti Serena Safari Lodge', zoneId: 'z1', destinationId: 'serengeti', image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600', description: 'Built of natural stone and wood on a ridge overlooking the endless savanna, blending seamlessly into the acacia-dotted landscape.', stars: '5', category: 'Safari Lodge Elite' },
  { id: 'h15', name: 'Ngorongoro Serena Safari Lodge', zoneId: 'z1', destinationId: 'ngorongoro', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80', description: 'Perched directly on the jagged rim of the ancient volcanic caldera, offering majestic sweeping floor views from every room window.', stars: '5', category: 'Safari Lodge Elite' },
  { id: 'h16', name: 'Manyara Wildlife Safari Camp', zoneId: 'z1', destinationId: 'manyara', image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80', description: 'Overlooking the dynamic, pink-hued soda lake, offering beautiful canvas-roof suites and wild tree-climbing lion sightings.', stars: '4', category: 'Eco Camp' },
  { id: 'h17', name: 'Tarangire Sopa Lodge', zoneId: 'z1', destinationId: 'tarangire', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80', description: 'Built nestled among giant, ancient thousand-year-old baobab trees, offering spacious luxury suites and close encounters with massive elephant herds.', stars: '4', category: 'Baobab Premium' }
];

export interface ExtendedSeason {
  id: string;
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  adjustmentPct: number;
  isDiscount: boolean;
}

const DEFAULT_EXTENDED_SEASONS: ExtendedSeason[] = [
  { id: 's-low', name: 'Low Season', startMonth: 3, startDay: 1, endMonth: 5, endDay: 31, adjustmentPct: 10, isDiscount: true },
  { id: 's-high', name: 'High Season', startMonth: 6, startDay: 1, endMonth: 8, endDay: 31, adjustmentPct: 10, isDiscount: false },
  { id: 's-peak', name: 'Peak Season', startMonth: 9, startDay: 1, endMonth: 10, endDay: 31, adjustmentPct: 15, isDiscount: false },
  { id: 's-festive', name: 'Festive Season', startMonth: 12, startDay: 15, endMonth: 1, endDay: 10, adjustmentPct: 25, isDiscount: false },
];

export interface JobVacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  desc: string;
  requirements: string[];
  benefits: string[];
  status: 'open' | 'closed';
}

const DEFAULT_VACANCIES: JobVacancy[] = [
  {
    id: 'job-1',
    title: 'Senior Swahili Safari Guide',
    department: 'Guiding & Operations',
    location: 'Arusha & Serengeti National Parks',
    type: 'Full-time',
    salary: '$1,200 - $1,800 / Month',
    desc: 'Lead bespoke 4x4 Safari Landcruiser game drives, explaining wildlife ecosystems, tracks, and local Maasai cultural heritage to VIP international guests.',
    requirements: [
      '5+ years experience as a licensed safari guide',
      'Valid TALA (Tanzania Association of Tour Operators) guiding license',
      'Fluency in English and Swahili (German or French is a big plus)',
      'Exceptional knowledge of avian and mammalian biology'
    ],
    benefits: [
      'Full comprehensive corporate health cover',
      'Performance-based tip bonuses directly from guests',
      'Premium custom outdoor exploration gear & uniform'
    ],
    status: 'open'
  },
  {
    id: 'job-2',
    title: 'Guest Experience & Desk Coordinator',
    department: 'Sales & Guest Services',
    location: 'Stone Town Corporate Office',
    type: 'Full-time',
    salary: '$800 - $1,100 / Month',
    desc: 'Manage daily incoming booking requests, structure custom itinerary proposals, coordinate airport transfer logistics, and maintain our high-response live WhatsApp helpdesk.',
    requirements: [
      'High proficiency in written English and digital communication tools',
      'Strong organizational skills with ability to coordinate multi-resort itineraries',
      'Prior experience in travel agency operations or hospitality concierge desk'
    ],
    benefits: [
      'Modern workspace with high-speed internet stipend',
      'Annual luxury coastal hotel stay credits',
      'Continuous professional hospitality and sales training'
    ],
    status: 'open'
  },
  {
    id: 'job-3',
    title: 'Eco-Marine Excursion Captain',
    department: 'Guiding & Operations',
    location: 'Nungwi & Fumba Shore bases',
    type: 'Seasonal',
    salary: '$700 - $950 / Month',
    desc: 'Captain our high-quality fiber and traditional wooden dhow vessels for marine excursions, ensuring 100% safety, snorkeling guidance, and adherence to reef-protection standards.',
    requirements: [
      'Valid maritime coastal pilot captain license',
      'Advanced certificate in first aid & ocean rescue lifeguard skills',
      'Passionate advocate for reef conservation and marine-friendly sailing'
    ],
    benefits: [
      'Complimentary fresh seafood lunches on-site',
      'Flexible off-season schedules',
      'Conservation-advocacy reward allowances'
    ],
    status: 'open'
  }
];

export interface SustainabilityContent {
  introTitle: string;
  introSubtitle: string;
  conservationText: string;
  communityText: string;
  partnershipsText: string;
  responsibleTourismText: string;
  wildlifeText: string;
  plasticReductionText: string;
  carbonInitiativesText: string;
}

const DEFAULT_SUSTAINABILITY: SustainabilityContent = {
  introTitle: 'Eco-Conscious Tourism & Community Empowerment',
  introSubtitle: 'We believe that premium travel must protect the delicate coral reefs, support local Swahili villages, and guarantee fair wages to mountain porters.',
  conservationText: 'Zanzibar\'s marine environments are highly fragile. We actively fund coral propagation initiatives at Mnemba Atoll and educate all guests to avoid stepping on shallow reef barriers or disturbing sea turtle nesting grounds.',
  communityText: '10% of every booking directly funds primary school textbooks, sanitary facilities, and clean drinking water wells in rural Zanzibar coastal villages.',
  partnershipsText: 'We exclusively hire local captains, dhow sailors, and village chefs, ensuring that 100% of tour financial benefits stay within the local Swahili community.',
  responsibleTourismText: 'We operate high-quality, small-group excursions that respect local Swahili traditions, modest dress codes, and historic stone architecture.',
  wildlifeText: 'We strictly comply with national park safety rules. Our safari guides maintain professional distance from hunting cats and never bait wild dolphins in Kizimkazi.',
  plasticReductionText: 'We have eliminated single-use plastic bottles on all excursions. Guests are provided with refillable luxury bamboo flasks and premium mineral water dispensers.',
  carbonInitiativesText: 'We participate in local mangrove reforestation programs in Jozani and offset 100% of our domestic fly-in safari emissions through local tree planting.'
};

const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: `log-${Date.now()}-1`,
    timestamp: new Date().toLocaleString(),
    user: 'Gerevas Paulo Mtaki',
    role: 'Super Admin',
    action: 'Created "Audit Logs" reports module to monitor administrative security compliance.',
    previousValue: 'N/A',
    newValue: 'Audit Logs Module Installed',
    ipAddress: '197.250.3.112'
  },
  {
    id: `log-${Date.now()}-2`,
    timestamp: new Date().toLocaleString(),
    user: 'Gerevas Paulo Mtaki',
    role: 'Super Admin',
    action: 'Migrated CMS store to strict Firestore backend layer.',
    previousValue: 'localStorage Heavy Caching',
    newValue: 'Firestore Cloud Single Source of Truth',
    ipAddress: '197.250.3.112'
  }
];

// IN-MEMORY CACHE VARIABLES (No heavy JSON stored in localStorage)
let cachedSiteContent: SiteContent = DEFAULT_SITE_CONTENT;
let cachedSiteLogos: SiteLogos = DEFAULT_SITE_LOGOS;
let cachedMediaLibrary: MediaFile[] = DEFAULT_MEDIA;
let cachedActivityLogs: ActivityLog[] = DEFAULT_ACTIVITY_LOGS;
let cachedCoupons: Coupon[] = DEFAULT_COUPONS;
let cachedDateBlockages: DateBlockage[] = DEFAULT_BLOCKAGES;
let cachedSeasonality: SeasonalityConfig = DEFAULT_SEASONALITY;
let cachedExtendedSeasonality: ExtendedSeason[] = DEFAULT_EXTENDED_SEASONS;
let cachedTransportZones: TransportZone[] = DEFAULT_ZONES;
let cachedHotels: HotelOption[] = DEFAULT_HOTELS;
let cachedVacancies: JobVacancy[] = DEFAULT_VACANCIES;
let cachedSustainability: SustainabilityContent = DEFAULT_SUSTAINABILITY;

// Clean legacy heavy JSON keys from localStorage on store boot
if (typeof window !== 'undefined') {
  const HEAVY_KEYS = [
    'site_content_dynamic',
    'site_media_library',
    'ztr_site_logos',
    'ztr_coupons',
    'ztr_date_blockages',
    'ztr_seasonality',
    'ztr_extended_seasonality',
    'ztr_transport_zones',
    'ztr_hotel_list_dynamic',
    'ztr_vacancies',
    'ztr_sustainability_content',
    'site_activity_logs'
  ];
  HEAVY_KEYS.forEach(key => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {}
  });
  updateSyncTimestamp();
}

// Subscribe to Firestore for real-time live synchronization
let isListenersInitialized = false;

function setupFirestoreListeners(): void {
  if (isListenersInitialized || typeof window === 'undefined') return;
  isListenersInitialized = true;

  // 1. Site Content
  onSnapshot(doc(db, 'cms', 'site_content'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedSiteContent = docSnap.data()!.data as SiteContent;
      updateSyncTimestamp();
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'site_content'), { data: DEFAULT_SITE_CONTENT }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/site_content'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/site_content'));

  // 2. Site Logos
  onSnapshot(doc(db, 'cms', 'site_logos'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedSiteLogos = docSnap.data()!.data as SiteLogos;
      updateSyncTimestamp();
      window.dispatchEvent(new Event('ztr_logos_updated'));
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'site_logos'), { data: DEFAULT_SITE_LOGOS }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/site_logos'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/site_logos'));

  // 3. Media Library
  onSnapshot(doc(db, 'cms', 'media_library'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedMediaLibrary = docSnap.data()!.data as MediaFile[];
      updateSyncTimestamp();
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'media_library'), { data: DEFAULT_MEDIA }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/media_library'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/media_library'));

  // 4. Activity Logs
  onSnapshot(doc(db, 'cms', 'activity_logs'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedActivityLogs = docSnap.data()!.data as ActivityLog[];
      updateSyncTimestamp();
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'activity_logs'), { data: DEFAULT_ACTIVITY_LOGS }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/activity_logs'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/activity_logs'));

  // 5. Coupons
  onSnapshot(doc(db, 'cms', 'coupons'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedCoupons = docSnap.data()!.data as Coupon[];
      updateSyncTimestamp();
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'coupons'), { data: DEFAULT_COUPONS }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/coupons'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/coupons'));

  // 6. Date Blockages
  onSnapshot(doc(db, 'cms', 'date_blockages'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedDateBlockages = docSnap.data()!.data as DateBlockage[];
      updateSyncTimestamp();
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'date_blockages'), { data: DEFAULT_BLOCKAGES }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/date_blockages'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/date_blockages'));

  // 7. Seasonality
  onSnapshot(doc(db, 'cms', 'seasonality'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedSeasonality = docSnap.data()!.data as SeasonalityConfig;
      updateSyncTimestamp();
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'seasonality'), { data: DEFAULT_SEASONALITY }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/seasonality'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/seasonality'));

  // 8. Extended Seasonality
  onSnapshot(doc(db, 'cms', 'extended_seasonality'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedExtendedSeasonality = docSnap.data()!.data as ExtendedSeason[];
      updateSyncTimestamp();
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'extended_seasonality'), { data: DEFAULT_EXTENDED_SEASONS }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/extended_seasonality'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/extended_seasonality'));

  // 9. Transport Zones
  onSnapshot(doc(db, 'cms', 'transport_zones'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedTransportZones = docSnap.data()!.data as TransportZone[];
      updateSyncTimestamp();
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'transport_zones'), { data: DEFAULT_ZONES }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/transport_zones'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/transport_zones'));

  // 10. Hotels
  onSnapshot(doc(db, 'cms', 'hotels'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedHotels = docSnap.data()!.data as HotelOption[];
      updateSyncTimestamp();
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'hotels'), { data: DEFAULT_HOTELS }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/hotels'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/hotels'));

  // 11. Vacancies
  onSnapshot(doc(db, 'cms', 'vacancies'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedVacancies = docSnap.data()!.data as JobVacancy[];
      updateSyncTimestamp();
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'vacancies'), { data: DEFAULT_VACANCIES }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/vacancies'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/vacancies'));

  // 12. Sustainability
  onSnapshot(doc(db, 'cms', 'sustainability'), (docSnap) => {
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedSustainability = docSnap.data()!.data as SustainabilityContent;
      updateSyncTimestamp();
      triggerCMSSync();
    } else {
      setDoc(doc(db, 'cms', 'sustainability'), { data: DEFAULT_SUSTAINABILITY }).catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/sustainability'));
    }
  }, err => handleFirestoreError(err, OperationType.GET, 'cms/sustainability'));
}

// Trigger Firestore real-time initialization
setupFirestoreListeners();

// ==========================================
// PUBLIC GETTERS AND SETTERS
// ==========================================

export function getSiteLogos(): SiteLogos {
  return cachedSiteLogos;
}

export function saveSiteLogos(logos: SiteLogos): void {
  cachedSiteLogos = logos;
  updateSyncTimestamp();
  window.dispatchEvent(new Event('ztr_logos_updated'));
  triggerCMSSync();

  // Update favicon if provided
  if (logos.favicon && typeof document !== 'undefined') {
    const faviconLink = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
    faviconLink.type = 'image/x-icon';
    faviconLink.rel = 'shortcut icon';
    faviconLink.href = logos.favicon;
    document.getElementsByTagName('head')[0]?.appendChild(faviconLink);
  }

  setDoc(doc(db, 'cms', 'site_logos'), { data: logos })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/site_logos'));
}

export function useSiteLogos(): SiteLogos {
  const [logos, setLogos] = useState<SiteLogos>(getSiteLogos());
  useEffect(() => {
    const handleUpdate = () => setLogos(getSiteLogos());
    window.addEventListener('ztr_logos_updated', handleUpdate);
    window.addEventListener('cms_sync', handleUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'ztr_cms_sync_timestamp' || e.key === 'ztr_cms_last_sync') handleUpdate();
    });
    return () => {
      window.removeEventListener('ztr_logos_updated', handleUpdate);
      window.removeEventListener('cms_sync', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);
  return logos;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  if (trimmed.length === 11 && !trimmed.includes('/')) {
    return trimmed;
  }
  return null;
}

export function getYouTubeEmbedUrl(urlOrId: string): string {
  const id = extractYouTubeId(urlOrId) || urlOrId.trim();
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
}

export function getYouTubeThumbnail(urlOrId: string): string {
  const id = extractYouTubeId(urlOrId) || urlOrId.trim();
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function getGoogleMapEmbedUrl(inputUrl: string): string {
  if (!inputUrl) return 'https://maps.google.com/maps?q=Zanzibar+Island&t=&z=10&ie=UTF8&iwloc=&output=embed';
  const trimmed = inputUrl.trim();
  if (trimmed.includes('output=embed')) return trimmed;
  if (trimmed.includes('<iframe')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) return srcMatch[1];
  }
  if (trimmed.includes('google.com/maps')) {
    const atMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
    }
    const placeMatch = trimmed.match(/place\/([^\/]+)/);
    if (placeMatch) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
}

export function getSiteContent(): SiteContent {
  return cachedSiteContent;
}

export async function syncSiteContentFromDb(): Promise<SiteContent | null> {
  try {
    const docSnap = await getDoc(doc(db, 'cms', 'site_content'));
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedSiteContent = docSnap.data()!.data as SiteContent;
      updateSyncTimestamp();
      triggerCMSSync();
      return cachedSiteContent;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'cms/site_content');
  }
  return cachedSiteContent;
}

export function saveSiteContent(content: SiteContent, user = 'Super Admin', action = 'Updated settings'): void {
  cachedSiteContent = content;
  addActivityLog(user, user === 'Super Admin' ? 'Super Admin' : 'Staff', action);
  updateSyncTimestamp();
  triggerCMSSync();

  setDoc(doc(db, 'cms', 'site_content'), { data: content })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/site_content'));
}

export function getMediaLibrary(): MediaFile[] {
  return cachedMediaLibrary;
}

export async function syncMediaLibraryFromDb(): Promise<MediaFile[] | null> {
  try {
    const docSnap = await getDoc(doc(db, 'cms', 'media_library'));
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedMediaLibrary = docSnap.data()!.data as MediaFile[];
      updateSyncTimestamp();
      triggerCMSSync();
      return cachedMediaLibrary;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'cms/media_library');
  }
  return cachedMediaLibrary;
}

export function saveMediaLibrary(media: MediaFile[]): void {
  cachedMediaLibrary = media;
  updateSyncTimestamp();
  triggerCMSSync();

  setDoc(doc(db, 'cms', 'media_library'), { data: media })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/media_library'));
}

export function getMediaItem(id: string): MediaFile | undefined {
  return cachedMediaLibrary.find(m => m.id === id);
}

export function updateMediaItem(id: string, updates: Partial<MediaFile>): void {
  const updated = cachedMediaLibrary.map(item => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    return item;
  });
  saveMediaLibrary(updated);
}

export function addMediaItem(item: Omit<MediaFile, 'id' | 'uploadedAt'> & { id?: string; uploadedAt?: string }): MediaFile {
  const newItem: MediaFile = {
    ...item,
    id: item.id || `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    uploadedAt: item.uploadedAt || new Date().toISOString()
  };
  const updated = [newItem, ...cachedMediaLibrary];
  saveMediaLibrary(updated);
  return newItem;
}

export function deleteMediaItem(id: string): void {
  const updated = cachedMediaLibrary.filter(m => m.id !== id);
  saveMediaLibrary(updated);
}

export function getActivities(): ActivityLog[] {
  return cachedActivityLogs;
}

export function addActivityLog(
  user: string,
  role: string,
  action: string,
  previousValue?: string,
  newValue?: string,
  ipAddress?: string
): void {
  const ips = ['197.250.3.112', '102.223.11.45', '41.59.81.201', '196.43.12.94', '41.210.150.11'];
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleString(),
    user,
    role,
    action,
    previousValue: previousValue || 'N/A',
    newValue: newValue || 'N/A',
    ipAddress: ipAddress || ips[Math.floor(Math.random() * ips.length)]
  };
  cachedActivityLogs = [newLog, ...cachedActivityLogs].slice(0, 500);
  updateSyncTimestamp();
  triggerCMSSync();

  setDoc(doc(db, 'cms', 'activity_logs'), { data: cachedActivityLogs })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/activity_logs'));
}

export function getCoupons(): Coupon[] {
  return cachedCoupons;
}

export function saveCoupons(coupons: Coupon[]): void {
  cachedCoupons = coupons;
  updateSyncTimestamp();
  triggerCMSSync();

  setDoc(doc(db, 'cms', 'coupons'), { data: coupons })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/coupons'));
}

export function getDateBlockages(): DateBlockage[] {
  return cachedDateBlockages;
}

export function saveDateBlockages(blockages: DateBlockage[]): void {
  cachedDateBlockages = blockages;
  updateSyncTimestamp();
  triggerCMSSync();

  setDoc(doc(db, 'cms', 'date_blockages'), { data: blockages })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/date_blockages'));
}

export function getSeasonalityConfig(): SeasonalityConfig {
  return cachedSeasonality;
}

export function saveSeasonalityConfig(config: SeasonalityConfig): void {
  cachedSeasonality = config;
  updateSyncTimestamp();
  triggerCMSSync();

  setDoc(doc(db, 'cms', 'seasonality'), { data: config })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/seasonality'));
}

export function getExtendedSeasonality(): ExtendedSeason[] {
  return cachedExtendedSeasonality;
}

export function saveExtendedSeasonality(seasons: ExtendedSeason[]): void {
  cachedExtendedSeasonality = seasons;
  updateSyncTimestamp();
  triggerCMSSync();

  setDoc(doc(db, 'cms', 'extended_seasonality'), { data: seasons })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/extended_seasonality'));
}

export function getTransportZones(): TransportZone[] {
  return cachedTransportZones;
}

export function saveTransportZones(zones: TransportZone[]): void {
  cachedTransportZones = zones;
  updateSyncTimestamp();
  triggerCMSSync();

  setDoc(doc(db, 'cms', 'transport_zones'), { data: zones })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/transport_zones'));
}

export function getHotels(): HotelOption[] {
  return cachedHotels;
}

export function saveHotels(hotels: HotelOption[]): void {
  cachedHotels = hotels;
  updateSyncTimestamp();
  triggerCMSSync();

  setDoc(doc(db, 'cms', 'hotels'), { data: hotels })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/hotels'));
}

export async function syncHotelsFromDb(): Promise<HotelOption[] | null> {
  try {
    const docSnap = await getDoc(doc(db, 'cms', 'hotels'));
    if (docSnap.exists() && docSnap.data()?.data) {
      cachedHotels = docSnap.data()!.data as HotelOption[];
      updateSyncTimestamp();
      triggerCMSSync();
      return cachedHotels;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'cms/hotels');
  }
  return cachedHotels;
}

export function getJobs(): JobVacancy[] {
  return cachedVacancies;
}

export function saveJobs(jobs: JobVacancy[]): void {
  cachedVacancies = jobs;
  updateSyncTimestamp();
  triggerCMSSync();

  setDoc(doc(db, 'cms', 'vacancies'), { data: jobs })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/vacancies'));
}

export function getSustainability(): SustainabilityContent {
  return cachedSustainability;
}

export function saveSustainability(content: SustainabilityContent): void {
  cachedSustainability = content;
  updateSyncTimestamp();
  triggerCMSSync();

  setDoc(doc(db, 'cms', 'sustainability'), { data: content })
    .catch(err => handleFirestoreError(err, OperationType.WRITE, 'cms/sustainability'));
}

// React Hook for CMS data with auto-refresh on changes
export function useCMSStore(): SiteContent {
  const [content, setContent] = useState<SiteContent>(getSiteContent());

  useEffect(() => {
    const handleSync = () => {
      setContent(getSiteContent());
    };

    window.addEventListener('cms_sync', handleSync);
    window.addEventListener('storage', (e) => {
      if (e.key === 'ztr_cms_sync_timestamp' || e.key === 'ztr_cms_last_sync') handleSync();
    });

    return () => {
      window.removeEventListener('cms_sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  return content;
}

// Helper to trigger sync across components
export function triggerCMSSync(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cms_sync'));
  }
}
