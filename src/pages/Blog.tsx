import { useState } from 'react';
import { Page } from '../hooks/useHashRouter';
import { blogPosts } from './BlogDetail';
import { Calendar, User, Clock, ArrowRight, Search, BookOpen } from 'lucide-react';
import { ProgressiveImage } from '../components/ProgressiveImage';

interface BlogProps {
  navigate: (page: Page, id?: string) => void;
}

const blogCategories = ['All', 'Beaches', 'Culture', 'Safari', 'Travel Tips', 'Food', 'Adventure', 'Romance'];

export default function Blog({ navigate }: BlogProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const pList = Object.values(blogPosts);

  const filteredPosts = pList.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative h-[35vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1600')" }} />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center px-4">
          <span className="text-[#D4A017] uppercase tracking-wider font-semibold text-xs mb-2 block">Swahili Travel Journal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Zanzibar Travel Insights
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Expert recommendations, local guidelines, packing tips, and wildlife journals
          </p>
        </div>
      </section>

      {/* Search & Category Filter bar */}
      <section className="bg-white border-b border-gray-100 sticky top-[68px] lg:top-[80px] z-40 shadow-sm py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full md:w-auto">
            {blogCategories.map(cat => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide shrink-0 transition-all ${selectedCategory === cat ? 'bg-[#0B3B8C] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#0B3B8C] text-sm"
            />
            <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          </div>
        </div>
      </section>

      {/* Grid listing */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative h-52 overflow-hidden cursor-pointer group" onClick={() => navigate('blog-detail', String(post.id))}>
                    <ProgressiveImage src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute top-4 left-4 bg-[#D4A017] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full z-10">
                      {post.category}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                      </div>

                      <h3
                        onClick={() => navigate('blog-detail', String(post.id))}
                        className="text-lg font-bold text-[#0B3B8C] hover:text-[#D4A017] transition-all cursor-pointer leading-snug"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                      >
                        {post.title}
                      </h3>

                      <p className="text-gray-500 text-xs leading-relaxed max-h-16 overflow-hidden">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <div className="w-6 h-6 rounded-full bg-[#0B3B8C]/15 flex items-center justify-center text-xs font-bold text-[#0B3B8C]">
                          {post.author[0]}
                        </div>
                        {post.author}
                      </span>

                      <button
                        type="button"
                        onClick={() => navigate('blog-detail', String(post.id))}
                        className="text-xs font-bold text-[#0B3B8C] hover:text-[#D4A017] flex items-center gap-1 transition-colors"
                      >
                        Read Post <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border space-y-4 max-w-lg mx-auto">
              <BookOpen className="w-12 h-12 mx-auto text-gray-300" />
              <h3 className="font-bold text-[#0B3B8C]">No Articles Found</h3>
              <p className="text-gray-500 text-xs">There are no travel guidelines matching "{searchQuery}" at this time.</p>
              <button type="button" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="text-[#D4A017] font-semibold text-xs border border-[#D4A017] px-4 py-2 rounded-full">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
