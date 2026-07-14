import { supabase } from './supabase';

export interface TourItem {
  id: string;
  title: string;
  category: 'tour' | 'package' | 'safari' | 'transfer' | string;
  desc: string;
  price: string;
  duration: string;
  scenicValue?: string;
  img: string;
  itinerary?: string[];
  longDescription?: string;
  visible?: boolean;
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
  faqs: FaqItem[];
  testimonials: TestimonialItem[];
  newsletterBgImages?: string[];
  kilimanjaroBgImages?: string[];
  youtubeVideos?: YoutubeVideo[];
}

// Default initial state matching exactly current designs and details
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
    secondaryButtonAction: 'trip-builder',
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
    storyText2: 'Today, we curate bespoke holidays that connect global minds to Tanzania’s mainland safaris, Uhuru peak climbing summits of Mount Kilimanjaro, and crystal-clear turquoise private beaches of structural islands.',
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
    { id: '1', title: 'Safari Blue Ocean Cruise', category: 'tour', desc: 'Sail past Sandbanks, snorkel clear lagoon corals, and enjoy a fresh seafood buffet on Kwale Island.', price: '$45', duration: 'Full Day', scenicValue: 'Exceptional', img: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: '2', title: 'Mnemba Island Snorkeling', category: 'tour', desc: 'Swim in crystal-clear waters alongside wild dolphins, sea turtles, and starfish near the famous private island.', price: '$35', duration: 'Half Day', scenicValue: 'Splendid', img: 'https://images.pexels.com/photos/1450363/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: '3', title: 'Stone Town Cultural Walk', category: 'tour', desc: 'Explore the narrow coral lanes, rich sultan history, bustling local bazaars, and Fredy Mercury museum.', price: '$20', duration: '3 Hours', scenicValue: 'High', img: 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1600' },
    { id: '4', title: 'Prison Island & Giant Tortoises', category: 'tour', desc: 'A short boat ride to feed Aldabra giant tortoises dating back to 100 years and snorkel the prison reef flats.', price: '$25', duration: '3 Hours', scenicValue: 'Medium-High', img: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1600' },
    { id: '5', title: 'Tangy Spice Farm Tour', category: 'tour', desc: 'Smell, taste, and pick dynamic tropical spices, vanilla pod vines, cloves, and receive hand-woven coconut hats.', price: '$15', duration: '2 Hours', scenicValue: 'Medium', img: 'https://images.pexels.com/photos/2826787/pexels-photo-2826787.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: '6', title: 'Jozani Forest National Park', category: 'tour', desc: 'Walk alongside adorable rare red colobus monkeys in a deep mahogany forest and pristine coastal mangrove boardwalks.', price: '$25', duration: '3 Hours', scenicValue: 'High', img: 'https://images.pexels.com/photos/3474320/pexels-photo-3474320.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 'sunset-dhow', title: 'Sunset Dhow Cruise', category: 'tour', desc: 'Glide across the Indian Ocean on a traditional wooden dhow as the sun melts into the horizon. Sundowners included.', price: '$55', duration: '2.5 Hours', scenicValue: 'High', img: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 'dolphin-kizimkazi', title: 'Dolphin Tour Kizimkazi', category: 'tour', desc: 'Swim with wild spinner and bottlenose dolphins in the warm waters off Kizimkazi village in southern Zanzibar.', price: '$60', duration: 'Half Day (4 hrs)', scenicValue: 'Splendid', img: 'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 'nakupenda-sandbank', title: 'Nakupenda Sandbank Picnic', category: 'tour', desc: 'Sail to the legendary "I Love You" sandbank for a private beach picnic surrounded by turquoise infinity waters.', price: '$70', duration: 'Half Day (4 hrs)', scenicValue: 'Exceptional', img: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=800' },
    { id: 'quad-bike', title: 'Quad Bike Adventure', category: 'tour', desc: 'Rev through Zanzibar beaches, plantations, and villages on an exhilarating quad bike adventure for all levels.', price: '$65', duration: '2–3 Hours', scenicValue: 'High', img: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800' },
  ],
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
  ]
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

export function getSiteContent(): SiteContent {
  const local = localStorage.getItem('site_content_dynamic');
  if (local) {
    try {
      const parsed = JSON.parse(local) as SiteContent;
      let modified = false;
      // Ensure missing default tours are merged back
      if (parsed && parsed.tours) {
        const existingTitles = new Set(parsed.tours.map(t => t.title.toLowerCase()));
        const missingTours = DEFAULT_SITE_CONTENT.tours.filter(t => !existingTitles.has(t.title.toLowerCase()));
        if (missingTours.length > 0) {
          parsed.tours = [...parsed.tours, ...missingTours];
          modified = true;
        }
      }
      if (parsed && !parsed.youtubeVideos) {
        parsed.youtubeVideos = DEFAULT_SITE_CONTENT.youtubeVideos;
        modified = true;
      }
      if (modified) {
        localStorage.setItem('site_content_dynamic', JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_SITE_CONTENT;
    }
  }
  return DEFAULT_SITE_CONTENT;
}

export async function syncSiteContentFromDb(): Promise<SiteContent | null> {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('data')
      .eq('id', 'global_cms_state')
      .maybeSingle();

    if (!error && data && data.data) {
      const dbContent = data.data as SiteContent;
      const local = localStorage.getItem('site_content_dynamic');
      let merged = { ...dbContent };

      if (local) {
        try {
          const parsed = JSON.parse(local) as SiteContent;
          if (parsed && parsed.tours) {
            const existingIds = new Set(dbContent.tours.map(t => t.id));
            const newLocalTours = parsed.tours.filter(t => !existingIds.has(t.id));
            if (newLocalTours.length > 0) {
              merged.tours = [...dbContent.tours, ...newLocalTours];
            }
          }
        } catch {}
      }

      // Ensure all default static tours are in the merged tours list too
      const existingTitles = new Set(merged.tours.map(t => t.title.toLowerCase()));
      const missingTours = DEFAULT_SITE_CONTENT.tours.filter(t => !existingTitles.has(t.title.toLowerCase()));
      if (missingTours.length > 0) {
        merged.tours = [...merged.tours, ...missingTours];
      }

      localStorage.setItem('site_content_dynamic', JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.warn('Could not sync site content from Supabase:', err);
  }
  return null;
}

export function saveSiteContent(content: SiteContent, user = 'Super Admin', action = 'Updated settings'): void {
  localStorage.setItem('site_content_dynamic', JSON.stringify(content));
  addActivityLog(user, user === 'Super Admin' ? 'Super Admin' : 'Staff', action);

  // Sync to Supabase if config is set up
  supabase.from('site_config').upsert([{ id: 'global_cms_state', data: content }])
    .then(({ error }) => {
      if (error) console.log('Supabase sync info:', error.message);
    });
}

export function getMediaLibrary(): MediaFile[] {
  const local = localStorage.getItem('site_media_library');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_MEDIA;
    }
  }
  return DEFAULT_MEDIA;
}

export async function syncMediaLibraryFromDb(): Promise<MediaFile[] | null> {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('data')
      .eq('id', 'site_media_library_state')
      .maybeSingle();
      
    if (!error && data && data.data) {
      const dbMedia = data.data as MediaFile[];
      localStorage.setItem('site_media_library', JSON.stringify(dbMedia));
      return dbMedia;
    }
  } catch (err) {
    console.warn('Could not sync media library from Supabase:', err);
  }
  return null;
}

export function saveMediaLibrary(media: MediaFile[]): void {
  localStorage.setItem('site_media_library', JSON.stringify(media));
  
  // Sync metadata and image references to Supabase table site_config
  supabase.from('site_config').upsert([{ id: 'site_media_library_state', data: media }])
    .then(({ error }) => {
      if (error) console.log('Supabase media sync info:', error.message);
    });
}

export function getMediaItem(id: string): MediaFile | undefined {
  const media = getMediaLibrary();
  return media.find(m => m.id === id);
}

export function updateMediaItem(id: string, updates: Partial<MediaFile>): void {
  const media = getMediaLibrary();
  const updated = media.map(item => {
    if (item.id === id) {
      return {
        ...item,
        ...updates
      };
    }
    return item;
  });
  saveMediaLibrary(updated);
}

export function addMediaItem(item: Omit<MediaFile, 'id' | 'uploadedAt'> & { id?: string; uploadedAt?: string }): MediaFile {
  const media = getMediaLibrary();
  const newItem: MediaFile = {
    ...item,
    id: item.id || `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    uploadedAt: item.uploadedAt || new Date().toISOString()
  };
  const updated = [newItem, ...media];
  saveMediaLibrary(updated);
  return newItem;
}

export function deleteMediaItem(id: string): void {
  const media = getMediaLibrary();
  const updated = media.filter(m => m.id !== id);
  saveMediaLibrary(updated);
}

export function getActivities(): ActivityLog[] {
  const local = localStorage.getItem('site_activity_logs');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return [];
    }
  }
  return [];
}

export function addActivityLog(
  user: string,
  role: string,
  action: string,
  previousValue?: string,
  newValue?: string,
  ipAddress?: string
): void {
  const logs = getActivities();
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
  localStorage.setItem('site_activity_logs', JSON.stringify([newLog, ...logs].slice(0, 500)));
}

// Coupons management
export function getCoupons(): Coupon[] {
  const local = localStorage.getItem('ztr_coupons');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_COUPONS;
    }
  }
  return DEFAULT_COUPONS;
}

export function saveCoupons(coupons: Coupon[]): void {
  localStorage.setItem('ztr_coupons', JSON.stringify(coupons));
}

// Date Blockages management
export function getDateBlockages(): DateBlockage[] {
  const local = localStorage.getItem('ztr_date_blockages');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_BLOCKAGES;
    }
  }
  return DEFAULT_BLOCKAGES;
}

export function saveDateBlockages(blockages: DateBlockage[]): void {
  localStorage.setItem('ztr_date_blockages', JSON.stringify(blockages));
}

// Default items templates
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

// Seasonality Settings Interface & Helpers
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
  { id: 'h1', name: 'Zanzibar Royal Beach Resort', zoneId: 'z11' },
  { id: 'h2', name: 'Baraza Heritage Hotel', zoneId: 'z1' },
  { id: 'h3', name: 'Paje Blue Surf Palms Resort', zoneId: 'z8' },
  { id: 'h4', name: 'Gold Zanzibar Beach House', zoneId: 'z12' },
  { id: 'h5', name: 'Zuri Zanzibar Resort', zoneId: 'z12' },
  { id: 'h6', name: 'Matemwe Lodge', zoneId: 'z3' },
  { id: 'h7', name: 'Melia Zanzibar Resort', zoneId: 'z4' },
  { id: 'h8', name: 'Michamvi Sunset Bay', zoneId: 'z7' },
  { id: 'h9', name: 'Riu Palace Zanzibar', zoneId: 'z11' },
  { id: 'h10', name: 'Royal Zanzibar Beach Resort', zoneId: 'z11' },
  { id: 'h11', name: 'Z Hotel', zoneId: 'z11' },
  { id: 'h12', name: 'Nungwi Dreams', zoneId: 'z11' },
  { id: 'h13', name: 'Nungwi Inn', zoneId: 'z11' },
];

export function getSeasonalityConfig(): SeasonalityConfig {
  const local = localStorage.getItem('ztr_seasonality');
  if (local) {
    try { return JSON.parse(local); } catch { return DEFAULT_SEASONALITY; }
  }
  return DEFAULT_SEASONALITY;
}

export function saveSeasonalityConfig(config: SeasonalityConfig): void {
  localStorage.setItem('ztr_seasonality', JSON.stringify(config));
}

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

export function getExtendedSeasonality(): ExtendedSeason[] {
  const local = localStorage.getItem('ztr_extended_seasonality');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return DEFAULT_EXTENDED_SEASONS;
    }
  }
  return DEFAULT_EXTENDED_SEASONS;
}

export function saveExtendedSeasonality(seasons: ExtendedSeason[]): void {
  localStorage.setItem('ztr_extended_seasonality', JSON.stringify(seasons));
}

export function getTransportZones(): TransportZone[] {
  const local = localStorage.getItem('ztr_transport_zones');
  if (local) {
    try { return JSON.parse(local); } catch { return DEFAULT_ZONES; }
  }
  return DEFAULT_ZONES;
}

export function saveTransportZones(zones: TransportZone[]): void {
  localStorage.setItem('ztr_transport_zones', JSON.stringify(zones));
}

export function getHotels(): HotelOption[] {
  const local = localStorage.getItem('ztr_hotel_list_dynamic');
  if (local) {
    try { return JSON.parse(local); } catch { return DEFAULT_HOTELS; }
  }
  return DEFAULT_HOTELS;
}

export function saveHotels(hotels: HotelOption[]): void {
  localStorage.setItem('ztr_hotel_list_dynamic', JSON.stringify(hotels));
}

// Initialise defaults on execution
if (!localStorage.getItem('site_content_dynamic')) {
  localStorage.setItem('site_content_dynamic', JSON.stringify(DEFAULT_SITE_CONTENT));
}
if (!localStorage.getItem('site_media_library')) {
  localStorage.setItem('site_media_library', JSON.stringify(DEFAULT_MEDIA));
}
if (!localStorage.getItem('ztr_coupons')) {
  localStorage.setItem('ztr_coupons', JSON.stringify(DEFAULT_COUPONS));
}
if (!localStorage.getItem('ztr_date_blockages')) {
  localStorage.setItem('ztr_date_blockages', JSON.stringify(DEFAULT_BLOCKAGES));
}
if (!localStorage.getItem('ztr_seasonality')) {
  localStorage.setItem('ztr_seasonality', JSON.stringify(DEFAULT_SEASONALITY));
}
if (!localStorage.getItem('ztr_extended_seasonality')) {
  localStorage.setItem('ztr_extended_seasonality', JSON.stringify(DEFAULT_EXTENDED_SEASONS));
}
if (!localStorage.getItem('ztr_transport_zones')) {
  localStorage.setItem('ztr_transport_zones', JSON.stringify(DEFAULT_ZONES));
}
if (!localStorage.getItem('ztr_hotel_list_dynamic')) {
  localStorage.setItem('ztr_hotel_list_dynamic', JSON.stringify(DEFAULT_HOTELS));
} else {
  // Update if missing Riu Palace
  try {
    const existing = JSON.parse(localStorage.getItem('ztr_hotel_list_dynamic') || '[]');
    if (!existing.some((h: any) => h.name && h.name.includes('Riu Palace'))) {
      localStorage.setItem('ztr_hotel_list_dynamic', JSON.stringify(DEFAULT_HOTELS));
    }
  } catch (e) {
    localStorage.setItem('ztr_hotel_list_dynamic', JSON.stringify(DEFAULT_HOTELS));
  }
}

// ==========================================
// CAREERS (JOBS) MANAGEMENT SCHEMA
// ==========================================

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

export function getJobs(): JobVacancy[] {
  const local = localStorage.getItem('ztr_vacancies');
  if (local) {
    try { return JSON.parse(local); } catch { return DEFAULT_VACANCIES; }
  }
  return DEFAULT_VACANCIES;
}

export function saveJobs(jobs: JobVacancy[]): void {
  localStorage.setItem('ztr_vacancies', JSON.stringify(jobs));
}

// ==========================================
// SUSTAINABILITY PAGE SCHEMA
// ==========================================

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

export function getSustainability(): SustainabilityContent {
  const local = localStorage.getItem('ztr_sustainability_content');
  if (local) {
    try { return JSON.parse(local); } catch { return DEFAULT_SUSTAINABILITY; }
  }
  return DEFAULT_SUSTAINABILITY;
}

export function saveSustainability(content: SustainabilityContent): void {
  localStorage.setItem('ztr_sustainability_content', JSON.stringify(content));
}

// Initialise defaults on execution
if (!localStorage.getItem('ztr_vacancies')) {
  localStorage.setItem('ztr_vacancies', JSON.stringify(DEFAULT_VACANCIES));
}
if (!localStorage.getItem('ztr_sustainability_content')) {
  localStorage.setItem('ztr_sustainability_content', JSON.stringify(DEFAULT_SUSTAINABILITY));
}

if (getActivities().length <= 1) {
  // Clear and seed rich initial logs to demonstrate security tracking
  localStorage.removeItem('site_activity_logs');
  addActivityLog(
    'Gerevas Paulo Mtaki',
    'Super Admin',
    'Created "Audit Logs" reports module to monitor administrative security compliance.',
    'N/A',
    'Audit Logs Module Installed',
    '197.250.3.112'
  );
  addActivityLog(
    'admin',
    'Guest / External',
    'Failed login attempt: Invalid password credentials entered.',
    'N/A',
    'N/A',
    '198.51.100.42'
  );
  addActivityLog(
    'Gerevas Paulo Mtaki',
    'Super Admin',
    'Updated security policy and clearances for [Accountant] role.',
    'none',
    'write',
    '197.250.3.112'
  );
  addActivityLog(
    'Gerevas Paulo Mtaki',
    'Super Admin',
    'Provisioned new staff role [Accountant] for user [frank_accountant].',
    'N/A',
    'Accountant Active',
    '197.250.3.112'
  );
  addActivityLog(
    'System Mailer',
    'System',
    'Password reset requested: dispatched recovery link to email janesmith@zanzibartrip.com',
    'N/A',
    'Reset Link Dispatched',
    '127.0.0.1'
  );
  addActivityLog(
    'Manager Amin',
    'Manager',
    'Logged into Admin Portal successfully using Manager clearance from device "MacBook Pro - Safari".',
    'N/A',
    'N/A',
    '102.223.11.45'
  );
  addActivityLog(
    'Manager Amin',
    'Manager',
    'Updated booking status of "Zanzibar Spice Tour & Dhow Excursion" to Confirmed.',
    'Pending',
    'Confirmed',
    '102.223.11.45'
  );
  addActivityLog(
    'Neema Marketing',
    'Marketing',
    'Uploaded 3 new high-resolution promotional banners for the Summer Excursion campaign.',
    'N/A',
    'Assets Added',
    '41.59.81.201'
  );
  addActivityLog(
    'Captain Guide Ali',
    'Guide',
    'Completed Zanzibar North Coast Safari expedition and updated passenger feedback checklist.',
    'Active',
    'Completed',
    '196.43.12.94'
  );
  addActivityLog(
    'Gerevas Paulo Mtaki',
    'Super Admin',
    'Terminated credentials and role permissions for temporary coordinator [temp_coordinator].',
    'Active',
    'Revoked',
    '197.250.3.112'
  );
  addActivityLog(
    'System Initializer',
    'Super Admin',
    'CMS database template seeded successfully.',
    'N/A',
    'Seeded',
    '127.0.0.1'
  );
}
