import { useState } from 'react';
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { ProgressiveImage } from '../components/ProgressiveImage';
import Breadcrumbs from '../components/Breadcrumbs';

interface BlogDetailProps {
  navigate: (page: Page, id?: string) => void;
  blogId: string | null;
}

const STATIC_BLOG_POSTS: Record<string, {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorBio: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}> = {
  '1': {
    id: 1,
    title: 'Top 10 Hidden Beaches in Zanzibar',
    excerpt: 'Discover secluded spots away from the crowds where you can enjoy pristine white sands and crystal-clear waters in complete tranquility.',
    content: `Zanzibar is famous for its stunning beaches, but beyond the popular tourist spots lie hidden gems waiting to be discovered. Here are our top 10 secluded beaches that offer tranquility and untouched beauty.

## 1. Kizimkazi Beach
Located on the southern tip of Zanzibar, Kizimkazi offers a peaceful escape from the tourist crowds. The beach is known for its dolphin tours and traditional fishing villages. The waters are calm and perfect for swimming.

## 2. Paje Beach (Off-Season)
While Paje is popular with kite surfers, visiting during the off-season reveals a completely different experience. The wide expanse of white sand becomes a private paradise.

## 3. Bwejuu Beach
This pristine stretch of coastline on the southeast offers swaying palm trees and traditional dhow boats. It's perfect for those seeking authentic Zanzibar away from resorts.

## 4. Matemwe Beach
Overlooking the Mnemba Atoll, Matemwe offers spectacular views and excellent snorkeling opportunities. The village atmosphere adds cultural charm.

## 5. Kiwengwa Beach
A quieter alternative to Nungwi, Kiwengwa stretches for miles with powdery white sand. The nearby coral reef creates natural swimming pools at low tide.

## Tips for Finding Hidden Beaches
- Visit during weekdays for fewer crowds
- Explore beyond resort areas
- Ask locals for recommendations
- Consider traditional fishing villages
- Respect local communities and customs

Each of these beaches offers a unique glimpse into Zanzibar's natural beauty. Whether you're seeking solitude, photography opportunities, or authentic cultural experiences, these hidden gems won't disappoint.`,
    category: 'Beaches',
    author: 'Gerevas Paulo Mtaki',
    authorBio: 'Founder of Zanzibar Trip & Relax with 10+ years guiding travelers across Tanzania.',
    date: 'June 10, 2024',
    readTime: '8 min read',
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['beaches', 'hidden gems', 'travel tips', 'zanzibar'],
  },
  '2': {
    id: 2,
    title: 'The Ultimate Guide to Zanzibar Spice Tours',
    excerpt: 'Learn about the aromatic spices that gave Zanzibar its name as the Spice Island, and what to expect on a spice farm visit.',
    content: `Zanzibar earned its nickname as the "Spice Island" through centuries of thriving spice trade. Today, spice tours offer visitors an immersive sensory experience.

## What to Expect on a Spice Tour
Your journey begins with a guided walk through lush spice farms where you'll see, smell, and taste various spices in their natural state.

## Common Spices You'll Discover

### Cloves
Zanzibar was once the world's leading clove producer. These aromatic flower buds are harvested and dried for use in cooking and traditional medicine.

### Cinnamon
The inner bark of cinnamon trees is harvested and dried into the familiar quills. You'll learn to identify the tree and taste fresh cinnamon.

### Nutmeg
This versatile spice comes from the seed of an evergreen tree. The surrounding red membrane (mace) is also used as a separate spice.

### Vanilla
One of the most expensive spices, vanilla orchids are hand-pollinated and the pods cured over months.

### Cardamom, Turmeric & More
Discover dozens of additional spices including cardamom, ginger, turmeric, lemongrass, and black pepper.

## Beyond Spices
- Fresh tropical fruits
- Traditional cooking demonstrations
- Natural dye plants
- Medicinal herbs

## Tips for Your Visit
- Wear comfortable walking shoes
- Bring a hat and sunscreen
- Taste everything offered
- Purchase fresh spices to take home
- Tip your guide

A spice tour is an essential Zanzibar experience that connects you to the island's rich history and culture.`,
    category: 'Culture',
    author: 'Gerevas Paulo Mtaki',
    authorBio: 'Founder of Zanzibar Trip & Relax with 10+ years guiding travelers across Tanzania.',
    date: 'June 5, 2024',
    readTime: '6 min read',
    image: 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['spices', 'culture', 'tours', 'zanzibar'],
  },
  '3': {
    id: 3,
    title: 'Witnessing the Great Migration: A Complete Guide',
    excerpt: 'Everything you need to know about planning your Serengeti safari to witness the annual wildebeest migration.',
    content: `The Great Migration is one of nature's most spectacular events. Over 1.5 million wildebeest, along with hundreds of thousands of zebras and gazelles, make their circular journey through Tanzania's Serengeti ecosystem.

## Understanding the Migration Cycle

### December - March: Southern Serengeti
The herds gather in the southern Serengeti and Ngorongoro Conservation Area for calving season. This is the best time to witness thousands of newborn calves.

### April - May: Moving Northwest
As the rains begin to taper, the herds start moving northwest toward the central Serengeti. This is a time of constant movement.

### June - July: Western Corridor
The migration reaches the western Serengeti and the Grumeti River. Here, dramatic river crossings begin as crocodiles await their annual feast.

### August - October: Northern Serengeti
The herds push north toward Kenya's Masai Mara, crossing the Mara River in spectacular fashion. This is peak crossing season.

### November: Return South
The cycle begins again as the herds return to the southern plains for the next calving season.

## Best Ways to Experience the Migration
- Guided vehicle safaris
- Walking safaris with Maasai guides
- Hot air balloon rides over the herds
- Mobile tented camps that follow the herds

## Planning Your Trip
- Book 6-12 months in advance for peak season
- Choose camps based on migration timing
- Consider fly-in options for remote areas
- Allow at least 3-4 days for the best experience

The Great Migration is a life-changing experience. Let us help you plan the perfect safari to witness this natural wonder.`,
    category: 'Safari',
    author: 'Gerevas Paulo Mtaki',
    authorBio: 'Founder of Zanzibar Trip & Relax with 10+ years guiding travelers across Tanzania.',
    date: 'May 28, 2024',
    readTime: '10 min read',
    image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['safari', 'migration', 'serengeti', 'wildlife'],
  },
  '4': {
    id: 4,
    title: 'Best Time to Visit Zanzibar: Month by Month',
    excerpt: 'A detailed breakdown of weather patterns, festivals, and seasonal activities to help you plan the perfect trip.',
    content: `Planning your Zanzibar trip requires understanding the island's seasonal variations. Here's a comprehensive month-by-month guide.

## Dry Season (June - October)
The best time to visit for beach activities and clear skies.

### June - July
- Cool, dry weather
- Perfect beach conditions
- Peak tourist season
- Higher accommodation rates

### August - October
- Warm, pleasant temperatures
- Excellent diving visibility
- Great for all outdoor activities

## Short Rainy Season (November - December)
Brief afternoon showers bring lush landscapes and fewer crowds.

### November
- Occasional afternoon showers
- Lower prices
- Lush, green scenery

### December
- Mix of rain and sun
- Festive holiday atmosphere
- Whale watching opportunities

## Hot Season (January - February)
Warm temperatures and generally dry conditions.

- Perfect for water activities
- Calm seas for boat trips
- Good for diving and snorkeling

## Long Rainy Season (March - May)
The wettest period with heavy tropical downpours.

- Significantly fewer tourists
- Best prices
- Lush vegetation
- Some boat trips may be cancelled

## Special Events
- **Sauti za Busara Festival** (February): African music festival
- **Zanzibar International Film Festival** (July): East Africa's largest film festival
- **Mwaka Kogwa** (July): Traditional Shirazi New Year celebration

## Our Recommendation
June to October offers the most reliable weather, but November and January to February provide excellent value with still-great conditions.`,
    category: 'Travel Tips',
    author: 'Gerevas Paulo Mtaki',
    authorBio: 'Founder of Zanzibar Trip & Relax with 10+ years guiding travelers across Tanzania.',
    date: 'May 20, 2024',
    readTime: '7 min read',
    image: 'https://images.pexels.com/photos/1320688/pexels-photo-1320688.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['travel tips', 'weather', 'planning', 'zanzibar'],
  },
  '5': {
    id: 5,
    title: 'Stone Town: A Walking History Lesson',
    excerpt: 'Explore the UNESCO World Heritage site and discover centuries of Swahili, Arab, Persian, Indian and European influences.',
    content: `Stone Town, the historic heart of Zanzibar City, is a living museum where every winding alley tells a story. This UNESCO World Heritage Site captures centuries of trade, culture, and conquest.

## The History of Stone Town
Formerly the capital of the Sultanate of Zanzibar, this coastal settlement evolved into a major trading hub for spices, ivory, and unfortunately, slaves. Today, it stands as a testament to Swahili coastal culture.

## Must-Visit Sites

### The Old Fort (Ngome Kongwa)
Built in the 17th century by Omani Arabs, this fort now hosts cultural events and a craft market.

### The House of Wonders (Beit-al-Ajaib)
The largest building in Stone Town, this palace was the first in East Africa to have electricity and an elevator.

### Christ Church Cathedral
Built on the site of the former slave market, this Anglican cathedral includes a moving memorial to victims of the slave trade.

### The Old Dispensary
An elegant four-story building showcasing Indian, European, and Arab architectural influences.

### Freddie Mercury Museum
The birthplace of Queen's legendary frontman has been converted into a museum celebrating his life and legacy.

## Walking Through the Alleyways
- Lose yourself in the labyrinthine streets
- Admire the ornate wooden Zanzibar doors
- Discover hidden rooftop restaurants
- Browse the bustling Darajani Market
- Visit historic hammam (public baths)

## Tips for Visiting
- Dress modestly out of respect
- Hire a local guide for deeper insights
- Bring water and wear comfortable shoes
- Visit early morning or late afternoon
- Allow at least a full day

Stone Town is best experienced slowly, allowing its stories to unfold one alley at a time.`,
    category: 'Culture',
    author: 'Gerevas Paulo Mtaki',
    authorBio: 'Founder of Zanzibar Trip & Relax with 10+ years guiding travelers across Tanzania.',
    date: 'May 15, 2024',
    readTime: '9 min read',
    image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['stone town', 'history', 'unesco', 'culture'],
  },
  '6': {
    id: 6,
    title: 'Traditional Zanzibar Cuisine: Dishes You Must Try',
    excerpt: 'From Biryani to Zanzibar pizza, explore the unique flavors and culinary traditions of the islands.',
    content: `Zanzibar's cuisine reflects its position as a historic trade crossroads. Indian, Arab, Persian, and African influences blend into a unique culinary tradition you won't find anywhere else.

## Must-Try Dishes

### Zanzibar Pizza
Unlike any pizza you've had before, this street food favorite is a thin, crispy crepe filled with meat, vegetables, egg, and cheese. Find vendors at Forodhani Gardens night market.

### Biryani
Indian-inspired rice dish with aromatic spices, meat, and fried potatoes. Zanzibar's version has adapted over generations into a local specialty.

### Octopus Curry
Fresh seafood meets Swahili spices in this creamy curry. Best enjoyed at beachside restaurants where the catch is fresh daily.

### Pilau
Fragrant spiced rice cooked with meat (usually goat or chicken). The spice blend—pilau masala—is what makes this dish special.

### Urojo (Zanzibar Mix)
A thick yellow soup with potatoes, cassava, and various toppings including bhajias (fritters), coconut chutney, and kachumbari (fresh salad).

### Lobster and Seafood
Grilled lobster, prawns, and fish straight from the Indian Ocean to your plate. Nungwi and Kendwa offer the freshest catches.

## Sweet Treats

### Halwa
A jelly-like confection made from sugar, cardamom, rose water, and nuts. A traditional Arabic sweet.

### Kashata
Coconut and peanut brittle candy, perfect with coffee or tea.

## Where to Eat
- Forodhani Gardens night market (Stone Town)
- Local restaurants (mama lishe)
- Beachside grills in Nungwi
- Hotel restaurants for upscale dining

Don't leave Zanzibar without trying its incredible food—it's as memorable as any beach or safari.`,
    category: 'Food',
    author: 'Gerevas Paulo Mtaki',
    authorBio: 'Founder of Zanzibar Trip & Relax with 10+ years guiding travelers across Tanzania.',
    date: 'May 8, 2024',
    readTime: '5 min read',
    image: 'https://images.pexels.com/photos/1540181/pexels-photo-1540181.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['food', 'cuisine', 'restaurants', 'local'],
  },
  '7': {
    id: 7,
    title: 'Snorkeling and Diving in Zanzibar',
    excerpt: 'A guide to the best underwater spots including Mnemba Atoll, Tumbatu Island, and the colorful coral gardens.',
    content: `Zanzibar's warm Indian Ocean waters harbor incredible marine biodiversity. From vibrant coral reefs to swimming with dolphins, here's your guide to underwater adventures.

## Top Snorkeling Spots

### Mnemba Atoll Marine Reserve
The crown jewel of Zanzibar snorkeling. Crystal-clear waters reveal technicolor coral gardens, schools of tropical fish, and sometimes dolphins.

### Chumbe Island Coral Park
A protected marine sanctuary with pristine coral formations. Guided snorkeling available with educational components about coral conservation.

### Tumbatu Island
Less visited but spectacular, this island offers excellent visibility and diverse marine life including turtles and rays.

## Diving Experiences

### For Beginners
Several dive centers offer discovery dives and certification courses. Nungwi and Paje have well-regarded schools.

### Experienced Divers
Wall dives, drift dives, and rweck dives await. The Leven Bank offers advanced diving with strong currents and pelagic species.

### What You Might See
- Sea turtles (green and hawksbill)
- Reef sharks
- Dolphins
- Manta rays (seasonal)
- Whale sharks (seasonal)
- Hundreds of tropical fish species
- Vibrant hard and soft corals

## Best Conditions
- June to October: Best visibility
- February to March: Whale shark season
- Year-round diving with variable conditions

## Responsible Snorkeling & Diving
- Never touch coral or marine life
- Use reef-safe sunscreen
- Maintain neutral buoyancy
- Don't feed fish
- Choose eco-conscious operators

Zanzibar's underwater world rivals its famous beaches. A day snorkeling or diving here will be among your most memorable experiences.`,
    category: 'Adventure',
    author: 'Gerevas Paulo Mtaki',
    authorBio: 'Founder of Zanzibar Trip & Relax with 10+ years guiding travelers across Tanzania.',
    date: 'April 30, 2024',
    readTime: '7 min read',
    image: 'https://images.pexels.com/photos/68163/pexels-photo-68163.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['snorkeling', 'diving', 'adventure', 'marine'],
  },
  '8': {
    id: 8,
    title: 'Planning Your Honeymoon in Zanzibar',
    excerpt: 'Romantic resorts, private beaches, and unforgettable experiences for couples planning their dream honeymoon.',
    content: `Zanzibar has become one of Africa's premier honeymoon destinations. Pristine beaches, luxury resorts, and romantic experiences make it perfect for newlyweds.

## Where to Stay

### Nungwi & Kendwa (North)
Home to the finest beachfront resorts with sunset views. This area offers the best swimming beaches and luxury accommodations.

### Paje & Jambiani (East)
Trendy beach towns with boutique resorts and renowned kite surfing. Perfect for couples who want activity options alongside relaxation.

### Private Islands
Mnemba Island Lodge offers the ultimate in exclusive luxury—your own private island with just a handful of bandas.

## Romantic Experiences

### Sunset Dhow Cruise
Sail the Indian Ocean on a traditional dhow, champagne in hand, as the sun dips below the horizon.

### Private Beach Dinner
Many resorts can arrange a table for two on the beach, complete with candles, seafood, and wine.

### Couple's Spa Day
Indulge in massages, body scrubs, and treatments using local spices and essential oils.

### Safari Extensions
Combine your beach honeymoon with a Serengeti safari for the complete African adventure.

## Planning Tips

### Timing
June to October offers reliable dry weather (peak season)
November and January-February provide value with good weather

### Booking
- Book 6+ months in advance for peak season
- Consider all-inclusive packages
- Request honeymoon packages/discounts
- Book spa treatments and dinners in advance

### What to Pack
- Light, breathable clothing
- Elegant resort wear
- Reef-safe sunscreen
- Good walking shoes for Stone Town
- Waterproof phone case

Zanzibar honeymoons blend adventure and romance perfectly. Let us help you plan the trip of a lifetime.`,
    category: 'Romance',
    author: 'Gerevas Paulo Mtaki',
    authorBio: 'Founder of Zanzibar Trip & Relax with 10+ years guiding travelers across Tanzania.',
    date: 'April 22, 2024',
    readTime: '8 min read',
    image: 'https://images.pexels.com/photos/1547843/pexels-photo-1547843.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['honeymoon', 'romance', 'luxury', 'resorts'],
  },
};

const relatedPosts = [
  { id: 1, title: 'Top 10 Hidden Beaches', image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 2, title: 'Spice Tour Guide', image: 'https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 3, title: 'Serengeti Safari', image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 5, title: 'Stone Town History', image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

export default function BlogDetail({ navigate, blogId }: BlogDetailProps) {
  const [imgError, setImgError] = useState(false);
  const post = blogId ? blogPosts[blogId] : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-dark mb-4">Article Not Found</h1>
          <button type="button" onClick={() => navigate('blog')} className="text-[#0B3B8C] font-medium flex items-center gap-2 mx-auto">
            <ArrowLeft size={18} /> Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <section className="relative h-[50vh] overflow-hidden">
        <ProgressiveImage src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E3D]/80 via-transparent to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20">
          <div className="max-w-4xl mx-auto">
            <button type="button" onClick={() => navigate('blog')} className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft size={16} /> Back to Blog
            </button>
            <span className="inline-block bg-[#D4A017] text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D4A017] flex items-center justify-center text-white font-semibold">
                  {post.author[0]}
                </div>
                {post.author}
              </span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {post.date}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ label: 'Travel Blog', page: 'blog' }, { label: post.title }]} navigate={navigate} />

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <span className="flex items-center gap-2 text-gray-500 text-sm">
              <Share2 size={16} /> Share
            </span>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#1877F2] hover:bg-[#166fe5] flex items-center justify-center text-white transition-colors">
              <Facebook size={14} />
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#1DA1F2] hover:bg-[#1991d2] flex items-center justify-center text-white transition-colors">
              <Twitter size={14} />
            </a>
            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#0077B5] hover:bg-[#00669c] flex items-center justify-center text-white transition-colors">
              <Linkedin size={14} />
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' - ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] flex items-center justify-center text-white transition-colors">
              <MessageCircle size={14} />
            </a>
          </div>

          <article className="prose prose-lg max-w-none prose-headings:text-[#0B3B8C] prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed">
            {post.content.split('\n').map((paragraph, i) => {
              if (paragraph.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-bold text-[#0B3B8C] mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-semibold text-[#0B3B8C] mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
              }
              if (paragraph.startsWith('- ')) {
                return <li key={i} className="text-gray-600 list-disc ml-5">{paragraph.replace('- ', '')}</li>;
              }
              if (paragraph.trim()) {
                return <p key={i} className="mb-4">{paragraph}</p>;
              }
              return null;
            })}
          </article>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author */}
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#0B3B8C] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {post.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-bold text-[#0B3B8C]">{post.author}</h4>
                <p className="text-sm text-gray-500 mb-2">Founder & CEO</p>
                <p className="text-gray-600 text-sm">{post.authorBio}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related articles */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0B3B8C] mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
            Related Articles
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {relatedPosts.filter(r => r.id !== post.id).slice(0, 4).map(related => (
              <button
                key={related.id}
                type="button"
                onClick={() => { navigate('blog-detail', String(related.id)); window.scrollTo(0, 0); }}
                className="text-left group"
              >
                <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                  <ProgressiveImage src={related.image} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="font-semibold text-brand-dark group-hover:text-[#0B3B8C] transition-colors text-sm">
                  {related.title}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-brand-dark">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Experience Zanzibar?
          </h2>
          <p className="text-white/70 mb-6">Let us help you plan your perfect trip</p>
          <button type="button" onClick={() => navigate('booking')} className="bg-[#D4A017] hover:bg-[#c49010] text-white font-semibold px-8 py-3 rounded-full transition-colors">
            Plan Your Trip
          </button>
        </div>
      </section>
    </div>
  );
}

export const getBlogPostsFromStorage = (): Record<string, any> => {
  const local = localStorage.getItem('ztr_dynamic_blog_posts');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return STATIC_BLOG_POSTS;
    }
  }
  return STATIC_BLOG_POSTS;
};

export const saveBlogPosts = (newPosts: Record<string, any>) => {
  localStorage.setItem('ztr_dynamic_blog_posts', JSON.stringify(newPosts));
  // Keep the in-memory exported reference synchronized immediately!
  Object.keys(blogPosts).forEach(key => delete blogPosts[key]);
  Object.assign(blogPosts, newPosts);
};

export const blogPosts: Record<string, any> = getBlogPostsFromStorage();

