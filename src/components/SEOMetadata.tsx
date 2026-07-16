import { useEffect } from 'react';
import { tours } from '../data/tours';
import { getSiteContent } from '../lib/cmsStore';

export interface SeoPageConfig {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogType: string;
  ogImage: string;
}

export interface SeoSettingsMap {
  [pageId: string]: SeoPageConfig;
}

export const DEFAULT_SEO_SETTINGS: SeoSettingsMap = {
  home: {
    title: 'Zanzibar Trip & Relax | Local Zanzibar Tour Operator & Safaris',
    description: 'Explore pristine Zanzibar beaches, historic Stone Town, marine dolphin safaris, and custom Tanzanian mainland adventures with Zanzibar\'s premier licensed local guides.',
    keywords: 'Zanzibar trips, Zanzibar local tours, Tanzania safaris, Stone Town guided walks, Mnemba Island snorkeling, Jozani Forest monkeys',
    canonicalUrl: 'https://zanzibartripandrelax.com/',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  about: {
    title: 'About Us | Certified KPAP Ethical Tour Guides in Zanzibar',
    description: 'Discover the honest story of Zanzibar Trip & Relax. Owned and guided by authentic native coordinators based in historic Stone Town supporting reef conservation and fair wages.',
    keywords: 'local Zanzibar operators, Gerevas Paulo Mtaki, Careen Harrison, KPAP Kilimanjaro, eco travel Zanzibar',
    canonicalUrl: 'https://zanzibartripandrelax.com/about',
    ogType: 'about',
    ogImage: 'https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  tours: {
    title: 'Zanzibar Day Excursions, Snorkeling & Spice Farm Tours',
    description: 'Book fully private and guided single-day tours in Zanzibar. Safari Blue ocean cruises, swim with dolphins at Mnemba reef, organic spice fields, prison island giant tortoises.',
    keywords: 'Safari Blue cruise, Mnemba Island snorkeling, Prison Island tortoise tours, spice farm guide',
    canonicalUrl: 'https://zanzibartripandrelax.com/tours',
    ogType: 'product',
    ogImage: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  packages: {
    title: 'Zanzibar Holiday Packages | Custom Multi-Day Beaches Tours',
    description: 'Handcrafted all-inclusive private Zanzibar vacation packages. 3-day romantic couples retreats, 5-day beach adventures, or 7-day wildlife combos with airport transfers.',
    keywords: 'Zanzibar holiday packages, Zanzibar honeymoon tours, 5 day beach adventure, Zanzibar tour itineraries',
    canonicalUrl: 'https://zanzibartripandrelax.com/packages',
    ogType: 'product',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  safaris: {
    title: 'Tanzania Wildlife Safaris | Serengeti, Ngorongoro & Tarangire',
    description: 'Bespoke multi-day safaris from Zanzibar. Experience the Great Migration across Serengeti plains and spot the Big Five in Ngorongoro Crater with native professional spotters.',
    keywords: 'Serengeti safari Zanzibar, Tanzania budget safaris, Ngorongoro day trip, Big Five wildlife drive',
    canonicalUrl: 'https://zanzibartripandrelax.com/tanzania-safaris',
    ogType: 'product',
    ogImage: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  kilimanjaro: {
    title: 'Climb Mount Kilimanjaro Tours | Complete Uhuru Peak Guides',
    description: 'Summits of Africa! Join our expert-led, KPAP ethical climbing expeditions up Mount Kilimanjaro via scenic Machame, Lemosho, and classic Marangu cabin routes.',
    keywords: 'Climb Mt Kilimanjaro, Mount Kilimanjaro routes, Machame Route booking, Lemosho climbing expedition, Uhuru peak summit',
    canonicalUrl: 'https://zanzibartripandrelax.com/kilimanjaro',
    ogType: 'product',
    ogImage: 'https://images.pexels.com/photos/1433052/pexels-photo-1433052.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  booking: {
    title: 'Book Zanzibar Tours & Safaris Online | Secure Payment',
    description: 'Reserve your customizable Swahili coast experiences, hotel packages, and private airport transfers with real-time billing and secure deposit schemes.',
    keywords: 'Zanzibar booking checkout, secure paypal Zanzibar, book transport Stone Town, Zanzibar vacation planner',
    canonicalUrl: 'https://zanzibartripandrelax.com/booking',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  gallery: {
    title: 'Zanzibar Travel Photo Gallery | Beautiful Beaches & Safari Highlights',
    description: 'Browse high-definition photos of tropical Zanzibar beaches, active mainland safaris, historic Stone Town, and vibrant marine life captured on our tours.',
    keywords: 'Zanzibar photo gallery, tropical beach pictures, Tanzania safari images, Stone Town photos',
    canonicalUrl: 'https://zanzibartripandrelax.com/gallery',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  contact: {
    title: 'Contact Us | Zanzibar Trip & Relax Travel Planners',
    description: 'Get in touch with local travel experts in Zanzibar. Inquire about custom safari packages, airport transfers, hotel booking, or local day excursions.',
    keywords: 'contact Zanzibar operator, email Zanzibar trip, Zanzibar phone number, local Swahili guide',
    canonicalUrl: 'https://zanzibartripandrelax.com/contact',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  blog: {
    title: 'Zanzibar Travel Blog | Local Safari Tips & Swahili Coast Insights',
    description: 'Read expert-curated guides, packing lists, weather reports, and travel advice for Zanzibar and Tanzania mainland safaris from our native operators.',
    keywords: 'Zanzibar travel blog, Zanzibar packing list, safaris in Serengeti, Swahili customs',
    canonicalUrl: 'https://zanzibartripandrelax.com/blog',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1320688/pexels-photo-1320688.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  reviews: {
    title: 'Guest Reviews & Feedback | Verified Zanzibar Trip & Relax Experiences',
    description: 'Read genuine client testimonials, TripAdvisor feedback, and travel reviews of our private Zanzibar beach holidays, safaris, and Kilimanjaro climbs.',
    keywords: 'Zanzibar travel reviews, TripAdvisor Zanzibar Trip and Relax, customer testimonials Kilimanjaro',
    canonicalUrl: 'https://zanzibartripandrelax.com/reviews',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  'trip-builder': {
    title: 'Custom Trip Builder | Tailor Your Zanzibar Dream Vacation',
    description: 'Build your bespoke Zanzibar and Tanzania itinerary in real-time. Pick day tours, multi-day safaris, luxury hotels, and transfers that fit your budget.',
    keywords: 'Zanzibar itinerary builder, custom Tanzania trips, tailor made Africa holidays, interactive trip builder',
    canonicalUrl: 'https://zanzibartripandrelax.com/trip-builder',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  faq: {
    title: 'Frequently Asked Questions | Zanzibar Travel Tips & Safety',
    description: 'Answers to your questions about Zanzibar visas, vaccinations, malaria risk, payment methods, local customs, and travel safety protocols.',
    keywords: 'Zanzibar travel FAQ, Zanzibar visa requirements, malaria prophylaxis Zanzibar, Zanzibar local tipping',
    canonicalUrl: 'https://zanzibartripandrelax.com/faq',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  policies: {
    title: 'Privacy Policy & Terms of Service | Zanzibar Trip & Relax',
    description: 'Review our transparent booking agreements, free cancellation policies, safety protocols, and privacy statements for a worry-free African getaway.',
    keywords: 'Zanzibar booking terms, refund policy tours, privacy policy travel, tour conditions',
    canonicalUrl: 'https://zanzibartripandrelax.com/policies',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  admin: {
    title: 'Admin Dashboard | Zanzibar Trip & Relax Control Panel',
    description: 'Secured administrative dashboard to monitor bookings, adjust real-time pricing, update tours list, and manage customer inquiries.',
    keywords: 'admin dashboard, secure backend',
    canonicalUrl: 'https://zanzibartripandrelax.com/admin',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  'manage-booking': {
    title: 'Manage Your Booking | Zanzibar Trip & Relax Reservation Portal',
    description: 'View, customize, or modify your existing Zanzibar vacation reservations. Real-time updates with no deposit required.',
    keywords: 'manage booking Zanzibar, update reservation, edit itinerary, view travel invoice',
    canonicalUrl: 'https://zanzibartripandrelax.com/manage-booking',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  careers: {
    title: 'Join Our Team | Careers at Zanzibar Trip & Relax',
    description: 'Exciting job opportunities for licensed local tour guides, boat captains, safari driver-guides, and digital travel coordinators in Zanzibar.',
    keywords: 'Zanzibar tour guide jobs, travel coordinator careers, work in Zanzibar tourism',
    canonicalUrl: 'https://zanzibartripandrelax.com/careers',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  sustainability: {
    title: 'Eco-Tourism & Reef Conservation | Sustainable Zanzibar Trips',
    description: 'Learn about our local sustainability initiatives, fair KPAP porter treatment on Mt. Kilimanjaro, reef preservation projects, and community support.',
    keywords: 'sustainable travel Zanzibar, KPAP certified partner, eco-friendly beach tours, reef conservation Fumba',
    canonicalUrl: 'https://zanzibartripandrelax.com/sustainability',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  transfers: {
    title: 'Zanzibar Private Airport Transfers & Resort Shuttles',
    description: 'Book reliable, fully licensed, air-conditioned private vehicles from Abeid Amani Karume International Airport (ZNZ) to Nungwi, Kendwa, Paje, and Stone Town.',
    keywords: 'Zanzibar airport transfer, private taxi Nungwi, ZNZ airport shuttle, Zanzibar stone town transport',
    canonicalUrl: 'https://zanzibartripandrelax.com/airport-transfer',
    ogType: 'website',
    ogImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  'tour-detail': {
    title: 'View Tour Details | Handcrafted Guided Zanzibar Experiences',
    description: 'Explore specific itineraries, real photos, tiered prices, duration, and reviews for our private guided Zanzibar tours and snorkeling excursions.',
    keywords: 'guided Zanzibar tour details, private excursions Swahili coast, price estimator',
    canonicalUrl: 'https://zanzibartripandrelax.com/tours',
    ogType: 'product',
    ogImage: 'https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  'blog-detail': {
    title: 'Zanzibar Travel Article | Swahili Coast Expert Insights',
    description: 'Discover the best local spots, travel regulations, safety tips, and packing requirements in Zanzibar with our deep-dive travel guides.',
    keywords: 'Zanzibar travel advice, local Swahili tips, vacation planning guides',
    canonicalUrl: 'https://zanzibartripandrelax.com/blog',
    ogType: 'article',
    ogImage: 'https://images.pexels.com/photos/1320688/pexels-photo-1320688.jpeg?auto=compress&cs=tinysrgb&w=1200'
  }
};

const BLOG_POSTS_METADATA: Record<string, { title: string; excerpt: string; image: string; tags: string[]; author: string; date: string }> = {
  '1': {
    title: 'Top 10 Hidden Beaches in Zanzibar',
    excerpt: 'Discover secluded spots away from the crowds where you can enjoy pristine white sands and crystal-clear waters in complete tranquility.',
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['beaches', 'hidden gems', 'travel tips', 'zanzibar'],
    author: 'Gerevas Paulo Mtaki',
    date: '2024-06-10'
  },
  '2': {
    title: 'The Ultimate Guide to Zanzibar Spice Tours',
    excerpt: 'Learn about the aromatic spices that gave Zanzibar its name as the Spice Island, and what to expect on a spice farm visit.',
    image: 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['spices', 'culture', 'tours', 'zanzibar'],
    author: 'Gerevas Paulo Mtaki',
    date: '2024-06-05'
  },
  '3': {
    title: 'Witnessing the Great Migration: A Complete Guide',
    excerpt: 'Everything you need to know about planning your Serengeti safari to witness the annual wildebeest migration.',
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['safari', 'migration', 'serengeti', 'wildlife'],
    author: 'Gerevas Paulo Mtaki',
    date: '2024-05-28'
  },
  '4': {
    title: 'Best Time to Visit Zanzibar: Month by Month',
    excerpt: 'A detailed breakdown of weather patterns, festivals, and seasonal activities to help you plan the perfect trip.',
    image: 'https://images.pexels.com/photos/1320688/pexels-photo-1320688.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['travel tips', 'weather', 'planning', 'zanzibar'],
    author: 'Gerevas Paulo Mtaki',
    date: '2024-05-20'
  },
  '5': {
    title: 'Stone Town: A Walking History Lesson',
    excerpt: 'Explore the UNESCO World Heritage site and discover centuries of Swahili, Arab, Persian, Indian and European influences.',
    image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['stone town', 'history', 'unesco', 'culture'],
    author: 'Gerevas Paulo Mtaki',
    date: '2024-05-15'
  },
  '6': {
    title: 'Traditional Zanzibar Cuisine: Dishes You Must Try',
    excerpt: 'From Biryani to Zanzibar pizza, explore the unique flavors and culinary traditions of the islands.',
    image: 'https://images.pexels.com/photos/1540181/pexels-photo-1540181.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['food', 'cuisine', 'restaurants', 'local'],
    author: 'Gerevas Paulo Mtaki',
    date: '2024-05-08'
  },
  '7': {
    title: 'Snorkeling and Diving in Zanzibar',
    excerpt: 'A guide to the best underwater spots including Mnemba Atoll, Tumbatu Island, and the colorful coral gardens.',
    image: 'https://images.pexels.com/photos/68163/pexels-photo-68163.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['snorkeling', 'diving', 'adventure', 'marine'],
    author: 'Gerevas Paulo Mtaki',
    date: '2024-04-30'
  },
  '8': {
    title: 'Planning Your Honeymoon in Zanzibar',
    excerpt: 'Romantic resorts, private beaches, and unforgettable experiences for couples planning their dream honeymoon.',
    image: 'https://images.pexels.com/photos/1547843/pexels-photo-1547843.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['honeymoon', 'romance', 'luxury', 'resorts'],
    author: 'Gerevas Paulo Mtaki',
    date: '2024-04-22'
  }
};

interface SEOMetadataProps {
  pageId: string;
}

export default function SEOMetadata({ pageId }: SEOMetadataProps) {
  // Pull editable settings from storage, falling back to defaults and handling dynamics
  const getSeoConfigForPage = (): SeoPageConfig => {
    // 1. Dynamic check for tour-detail
    if (pageId === 'tour-detail') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const slug = hash.replace('tour-detail/', '').replace('tours/', '');
      
      const staticTour = tours.find(st => 
        st.id === slug || 
        st.name.toLowerCase().replace(/\s+/g, '-') === slug ||
        slug.includes(st.id) ||
        st.id.includes(slug)
      );

      if (staticTour) {
        return {
          title: `${staticTour.seoMetadata?.title || staticTour.name} | Zanzibar Trip & Relax`,
          description: staticTour.seoMetadata?.desc || staticTour.description,
          keywords: (staticTour.seoMetadata?.keywords || []).join(', ') || 'Zanzibar tour, excursion',
          canonicalUrl: `https://zanzibartripandrelax.com/tours/${staticTour.id}`,
          ogType: 'product',
          ogImage: staticTour.image
        };
      }
    }

    // 2. Dynamic check for blog-detail
    if (pageId === 'blog-detail') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const blogId = hash.replace('blog-detail/', '').replace('blog/', '');
      const matchedBlog = BLOG_POSTS_METADATA[blogId] || BLOG_POSTS_METADATA['1'];
      
      return {
        title: `${matchedBlog.title} | Zanzibar Travel Blog`,
        description: matchedBlog.excerpt,
        keywords: matchedBlog.tags.join(', '),
        canonicalUrl: `https://zanzibartripandrelax.com/blog/${blogId || '1'}`,
        ogType: 'article',
        ogImage: matchedBlog.image
      };
    }

    // 2.5 Dynamic check for destinations
    if (pageId === 'destinations') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash.includes('destinations/')) {
        const destId = hash.split('destinations/')[1];
        try {
          const content = getSiteContent();
          const matchedDest = (content.destinations || []).find(d => d.id === destId);
          if (matchedDest) {
            return {
              title: `${matchedDest.seoTitle || matchedDest.name} | Zanzibar Trip & Relax`,
              description: matchedDest.seoDescription || matchedDest.description,
              keywords: (matchedDest.metaKeywords || []).join(', ') || `${matchedDest.name} travel, ${matchedDest.name} safari`,
              canonicalUrl: `https://zanzibartripandrelax.com/destinations/${matchedDest.id}`,
              ogType: 'website',
              ogImage: matchedDest.image
            };
          }
        } catch (err) {
          console.warn('Error reading destination for SEO:', err);
        }
      }
    }

    // 3. Check for LocalStorage Admin configurations
    const local = localStorage.getItem('ztr_seo_settings');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed[pageId]) {
          return parsed[pageId];
        }
      } catch (e) {
        console.error('Error reading custom dynamic SEO properties', e);
      }
    }

    return DEFAULT_SEO_SETTINGS[pageId] || DEFAULT_SEO_SETTINGS['home'];
  };

  const config = getSeoConfigForPage();

  useEffect(() => {
    // 1. Update basic Document Title
    document.title = config.title;

    // 2. Helper to set/update header meta tags
    const updateMetaTag = (attr: { key: string; val: string }, newValue: string) => {
      let element = document.querySelector(`meta[${attr.key}="${attr.val}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr.key, attr.val);
        document.head.appendChild(element);
      }
      element.setAttribute('content', newValue);
    };

    // 3. Update descriptive indicators
    updateMetaTag({ key: 'name', val: 'description' }, config.description);
    updateMetaTag({ key: 'name', val: 'keywords' }, config.keywords);

    // 3b. Google Search Console site verification
    const gscId = (import.meta as any).env.VITE_GSC_VERIFICATION_ID || '';
    if (gscId) {
      updateMetaTag({ key: 'name', val: 'google-site-verification' }, gscId);
    }

    // 4. Update Open Graph Social Standards
    updateMetaTag({ key: 'property', val: 'og:title' }, config.title);
    updateMetaTag({ key: 'property', val: 'og:description' }, config.description);
    updateMetaTag({ key: 'property', val: 'og:type' }, config.ogType);
    updateMetaTag({ key: 'property', val: 'og:url' }, config.canonicalUrl);
    updateMetaTag({ key: 'property', val: 'og:image' }, config.ogImage);
    updateMetaTag({ key: 'property', val: 'og:site_name' }, 'Zanzibar Trip & Relax');

    // 5. Update Twitter Cards
    updateMetaTag({ key: 'name', val: 'twitter:card' }, 'summary_large_image');
    updateMetaTag({ key: 'name', val: 'twitter:title' }, config.title);
    updateMetaTag({ key: 'name', val: 'twitter:description' }, config.description);
    updateMetaTag({ key: 'name', val: 'twitter:image' }, config.ogImage);

    // 6. Update Canonical URL Link Rel
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', config.canonicalUrl);

    // 7. Dynamic JSON-LD Graph Construction
    const schemaGraph: any[] = [
      // A. Travel Agency / Local Business Schema
      {
        '@type': 'TravelAgency',
        '@id': 'https://zanzibartripandrelax.com/#agency',
        'name': 'Zanzibar Trip & Relax Ltd.',
        'image': 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
        'telephone': '+255629506063',
        'email': 'info@zanzibartripandrelax.com',
        'url': 'https://zanzibartripandrelax.com',
        'priceRange': '$$',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Kenyatta Road',
          'addressLocality': 'Stone Town, Zanzibar City',
          'postalCode': 'ZNZ-91100',
          'addressCountry': 'TZ'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': -6.1627,
          "longitude": 39.1911
        },
        'openingHoursSpecification': {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
          ],
          'opens': '07:00',
          'closes': '22:00'
        },
        'sameAs': [
          'https://www.facebook.com/zanzibartripandrelax',
          'https://www.instagram.com/zanzibartripandrelax',
          'https://www.tripadvisor.com/Attraction_Review-g488129-d26458291-Reviews-Zanzibar_Trip_And_Relax-Stone_Town_Zanzibar_Island_Zanzibar_Archipelago.html'
        ]
      },
      // B. WebSite & SearchAction Schema
      {
        '@type': 'WebSite',
        '@id': 'https://zanzibartripandrelax.com/#website',
        'url': 'https://zanzibartripandrelax.com/',
        'name': 'Zanzibar Trip & Relax',
        'description': 'Zanzibar\'s leading certified local tour guide service.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': 'https://zanzibartripandrelax.com/?search={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      },
      // C. WebPage Schema for the current page
      {
        '@type': 'WebPage',
        '@id': `${config.canonicalUrl}#webpage`,
        'url': config.canonicalUrl,
        'name': config.title,
        'isPartOf': { '@id': 'https://zanzibartripandrelax.com/#website' },
        'description': config.description,
        'breadcrumb': { '@id': `${config.canonicalUrl}#breadcrumb` }
      },
      // D. Breadcrumbs
      {
        '@type': 'BreadcrumbList',
        '@id': `${config.canonicalUrl}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://zanzibartripandrelax.com/'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': pageId.replace('-', ' ').toUpperCase(),
            'item': config.canonicalUrl
          }
        ]
      },
      // E. Primary Image Object
      {
        '@type': 'ImageObject',
        '@id': `${config.ogImage}#primaryimage`,
        'url': config.ogImage,
        'caption': config.title
      }
    ];

    // F. Conditional FAQ Page Schema (FAQ and Dynamic FAQs)
    if (pageId === 'faq') {
      try {
        const content = getSiteContent();
        const dbFaqs = content.faqs || [];
        if (dbFaqs.length > 0) {
          const faqSchema = {
            '@type': 'FAQPage',
            '@id': 'https://zanzibartripandrelax.com/#faq-schema',
            'mainEntity': dbFaqs.map(item => ({
              '@type': 'Question',
              'name': item.q,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': item.a
              }
            }))
          };
          schemaGraph.push(faqSchema);
        }
      } catch (e) {
        console.warn('Could not populate dynamic FAQ schema:', e);
      }
    }

    // G. Conditional Tour Details Schema
    if (pageId === 'tour-detail') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const slug = hash.replace('tour-detail/', '').replace('tours/', '');
      const matchedTour = tours.find(st => st.id === slug);

      if (matchedTour) {
        const tourSchema = {
          '@type': 'Tour',
          '@id': `https://zanzibartripandrelax.com/#tour-${matchedTour.id}`,
          'name': matchedTour.name,
          'description': matchedTour.description,
          'image': matchedTour.image,
          'provider': { '@id': 'https://zanzibartripandrelax.com/#agency' },
          'itinerary': matchedTour.itinerary.map((step, idx) => ({
            '@type': 'HowToStep',
            'position': idx + 1,
            'name': step.title,
            'text': step.activity
          })),
          'offers': {
            '@type': 'AggregateOffer',
            'priceCurrency': 'USD',
            'lowPrice': '15',
            'highPrice': '120',
            'offerCount': matchedTour.pricingTable?.length || 4,
            'priceRange': matchedTour.price
          }
        };
        schemaGraph.push(tourSchema);
      }
    }

    // H. Conditional Blog Posting Article Schema
    if (pageId === 'blog-detail') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const blogId = hash.replace('blog-detail/', '').replace('blog/', '');
      const matchedBlog = BLOG_POSTS_METADATA[blogId] || BLOG_POSTS_METADATA['1'];

      const articleSchema = {
        '@type': 'NewsArticle',
        '@id': `https://zanzibartripandrelax.com/#blogpost-${blogId}`,
        'headline': matchedBlog.title,
        'description': matchedBlog.excerpt,
        'image': [matchedBlog.image],
        'datePublished': `${matchedBlog.date}T09:00:00+03:00`,
        'dateModified': '2026-07-03T02:00:00+03:00',
        'author': {
          '@type': 'Person',
          'name': matchedBlog.author,
          'jobTitle': 'Founder of Zanzibar Trip & Relax'
        },
        'publisher': {
          '@id': 'https://zanzibartripandrelax.com/#agency'
        }
      };
      schemaGraph.push(articleSchema);
    }

    // H.5 Conditional Destination TouristDestination Schema
    if (pageId === 'destinations') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash.includes('destinations/')) {
        const destId = hash.split('destinations/')[1];
        try {
          const content = getSiteContent();
          const matchedDest = (content.destinations || []).find(d => d.id === destId);
          if (matchedDest) {
            const destSchema = {
              '@type': 'TouristDestination',
              '@id': `https://zanzibartripandrelax.com/#destination-${matchedDest.id}`,
              'name': matchedDest.name,
              'description': matchedDest.description,
              'image': matchedDest.image,
              'touristType': ['Wildlife', 'Safari', 'Culture', 'Beach', 'Leisure'],
              'geo': {
                '@type': 'GeoCoordinates',
                'latitude': matchedDest.region === 'zanzibar' ? -6.1659 : -2.1540,
                'longitude': matchedDest.region === 'zanzibar' ? 39.2026 : 34.6857
              }
            };
            schemaGraph.push(destSchema);
          }
        } catch (err) {
          console.warn('Error constructing destination schema:', err);
        }
      }
    }

    // I. Inject Structured JSON-LD Script
    let ldScript = document.getElementById('ztr-jsonld-schema') as HTMLScriptElement;
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.id = 'ztr-jsonld-schema';
      ldScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(ldScript);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': schemaGraph
    };

    ldScript.textContent = JSON.stringify(schemaData, null, 2);

    // Initialise robots trigger states
    if (!localStorage.getItem('ztr_robots_txt_enabled')) {
      localStorage.setItem('ztr_robots_txt_enabled', 'true');
    }
  }, [pageId, config]);

  return null; // pure side-effect component
}
