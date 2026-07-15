import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Compass, Calendar, BookOpen, Clock, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { Page } from '../hooks/useHashRouter';
import { useCMSStore } from '../lib/cmsStore';
import { ProgressiveImage } from './ProgressiveImage';
import { usePreferences } from '../context/UserPreferencesContext';

// Dynamic imports of search targets
import { tours } from '../data/tours';
import { safarisData } from '../pages/Safaris';
import { blogPosts } from '../pages/BlogDetail';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (page: Page, id?: string) => void;
}

interface SearchResult {
  id: string;
  type: 'tour' | 'safari' | 'package' | 'blog';
  title: string;
  description: string;
  price?: string;
  duration?: string;
  image: string;
  category?: string;
}

export default function SearchOverlay({ isOpen, onClose, navigate }: SearchOverlayProps) {
  const { t, language } = useLanguage();
  const { formatPrice } = usePreferences();
  const content = useCMSStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'tour' | 'safari' | 'package' | 'blog'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveTab('all');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      // Disable scrolling on background body
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle global keybindings to open/close search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Index all data for real-time search
  const searchableItems = useMemo<SearchResult[]>(() => {
    const list: SearchResult[] = [];

    // 1. Add Tours
    tours.forEach(tour => {
      list.push({
        id: tour.id,
        type: 'tour',
        title: tour.name,
        description: tour.description,
        price: tour.price,
        duration: tour.duration,
        image: tour.image,
        category: tour.category
      });
    });

    // 2. Add Safaris
    safarisData.forEach(safari => {
      list.push({
        id: safari.id,
        type: 'safari',
        title: safari.title,
        description: safari.desc,
        price: safari.price,
        duration: safari.duration,
        image: safari.image,
        category: safari.type
      });
    });

    // 3. Add Holiday Packages from CMS
    const cmsPackages = (content.tours || [])
      .filter(t => t.category === 'package' && t.visible !== false)
      .map(t => ({
        id: t.id,
        type: 'package' as const,
        title: t.title,
        description: t.shortDesc || t.desc || '',
        price: t.price.startsWith('$') ? t.price : `$${t.price}`,
        duration: t.duration || 'Flexible Duration',
        image: t.img,
        category: t.location || 'Zanzibar'
      }));

    cmsPackages.forEach(pkg => {
      list.push(pkg);
    });

    // 4. Add Blog Posts
    Object.values(blogPosts).forEach(post => {
      list.push({
        id: String(post.id),
        type: 'blog',
        title: post.title,
        description: post.excerpt,
        image: post.image,
        category: post.category,
        duration: post.readTime
      });
    });

    return list;
  }, []);

  // Filter items based on activeTab and search query
  const filteredResults = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    
    // Filter by type first
    let items = searchableItems;
    if (activeTab !== 'all') {
      items = searchableItems.filter(item => item.type === activeTab);
    }

    if (!cleanQuery) {
      return items.slice(0, 5); // Return top 5 items when query is empty as recommendations
    }

    // Perform basic search match on title, description, and category
    return items.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(cleanQuery);
      const matchDesc = item.description.toLowerCase().includes(cleanQuery);
      const matchCat = item.category?.toLowerCase().includes(cleanQuery) || false;
      return matchTitle || matchDesc || matchCat;
    });
  }, [query, activeTab, searchableItems]);

  const handleItemClick = (item: SearchResult) => {
    onClose();
    if (item.type === 'tour') {
      navigate('tour-detail', item.id);
    } else if (item.type === 'blog') {
      navigate('blog-detail', item.id);
    } else if (item.type === 'safari') {
      navigate('safaris');
      // Scroll to element after a slight delay
      setTimeout(() => {
        const el = document.getElementById(item.id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    } else if (item.type === 'package') {
      navigate('packages');
      // Scroll to element after a slight delay
      setTimeout(() => {
        const el = document.getElementById(item.id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  const getBadgeStyles = (type: string) => {
    switch (type) {
      case 'tour':
        return 'bg-[#0B3B8C]/15 text-[#0B3B8C] border-[#0B3B8C]/20';
      case 'safari':
        return 'bg-amber-600/10 text-amber-600 border-amber-600/20';
      case 'package':
        return 'bg-emerald-600/10 text-emerald-600 border-emerald-600/20';
      case 'blog':
        return 'bg-indigo-600/10 text-indigo-600 border-indigo-600/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tour': return language === 'en' ? 'Day Tour' : 'Ziara ya Siku';
      case 'safari': return language === 'en' ? 'Wildlife Safari' : 'Safari ya Porini';
      case 'package': return language === 'en' ? 'Holiday Package' : 'Kifurushi cha Likizo';
      case 'blog': return language === 'en' ? 'Travel Guide' : 'Mwongozo wa Safari';
      default: return '';
    }
  };

  // Helper function to highlight matching search characters
  const renderHighlightedText = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-slate-900 rounded-sm px-0.5 font-bold">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const POPULAR_SEARCH_KEYWORDS = ['Stone Town', 'Prison Island', 'Safari Blue', 'Nungwi', 'Mnemba', 'Serengeti', 'Selous', 'Kilimanjaro', 'Transfer'];

  // Dynamic Typing Suggestions (Auto-completes)
  const typingSuggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const cleanQuery = query.toLowerCase();
    
    // Find keywords that contain the query, but are not exactly the query
    const matches = POPULAR_SEARCH_KEYWORDS.filter(kw => 
      kw.toLowerCase().includes(cleanQuery) && kw.toLowerCase() !== cleanQuery
    );
    
    // Also extract some partial words from matching item titles
    if (matches.length < 3) {
      const titleMatches = searchableItems
        .filter(item => item.title.toLowerCase().includes(cleanQuery))
        .map(item => item.title.split(' ')[0])
        .filter((val, idx, self) => val && val.length > 3 && self.indexOf(val) === idx && val.toLowerCase() !== cleanQuery);
      
      return [...matches, ...titleMatches.slice(0, 3)].slice(0, 4);
    }
    
    return matches.slice(0, 4);
  }, [query, searchableItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-10 md:pt-20 px-4">
      {/* Dark Blurred Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#060B16]/75 backdrop-blur-md cursor-pointer"
      />

      {/* Main Search Panel Card */}
      <motion.div 
        initial={{ scale: 0.95, y: -20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: -20, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-3xl bg-[#0C1527] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
      >
        {/* Glow lights */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#D4A017]/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#0B3B8C]/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-white/10 p-4 md:p-5">
          <Search size={22} className="text-[#D4A017] shrink-0 mr-4" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full bg-transparent text-white placeholder-slate-400 font-medium text-base md:text-lg focus:outline-none pr-10"
          />
          {query ? (
            <button 
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-14 text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <X size={16} />
            </button>
          ) : (
            <span className="absolute right-16 hidden sm:inline-flex items-center gap-1 text-[10px] bg-white/5 border border-white/10 text-slate-400 font-bold px-2 py-1 rounded-md tracking-widest uppercase font-mono">
              ESC
            </span>
          )}
          <button 
            onClick={onClose}
            className="ml-2 text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Category Tabs */}
        <div className="flex bg-[#070D1A] px-4 py-2 border-b border-white/5 gap-1.5 overflow-x-auto scrollbar-none select-none">
          {[
            { id: 'all', label: t('search.all'), icon: <Compass size={13} /> },
            { id: 'tour', label: t('search.tours'), icon: <Tag size={13} /> },
            { id: 'safari', label: t('search.safaris'), icon: <Sparkles size={13} /> },
            { id: 'package', label: t('search.packages'), icon: <Calendar size={13} /> },
            { id: 'blog', label: t('search.blogs'), icon: <BookOpen size={13} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                activeTab === tab.id
                  ? 'bg-[#D4A017] text-[#0A1224] border-[#D4A017]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Content Body (Scrollable) */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 max-h-[50vh]">
          {/* Typing Suggestions */}
          {typingSuggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-xl">
              <span className="text-[10px] uppercase tracking-wider font-black text-[#D4A017] px-1 font-mono">Suggestions:</span>
              {typingSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setQuery(suggestion); inputRef.current?.focus(); }}
                  className="bg-white/5 hover:bg-[#D4A017]/10 text-slate-300 hover:text-[#D4A017] border border-white/5 hover:border-[#D4A017]/30 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {filteredResults.length > 0 ? (
            <div className="space-y-3">
              {/* Category label for popular vs matching */}
              <div className="text-[10px] uppercase tracking-widest font-black text-slate-500 flex items-center justify-between pb-1">
                <span>{query ? `${filteredResults.length} Adventure Matches` : 'Suggested Excursions'}</span>
                {!query && <span className="font-mono text-slate-600">Featured</span>}
              </div>

              {filteredResults.map(item => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-4 bg-[#111A2E]/60 hover:bg-[#15213b] border border-white/5 p-3 rounded-2xl cursor-pointer group transition-all duration-200 hover:-translate-y-0.5"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 relative">
                    <ProgressiveImage src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    {/* Tiny type indicator icon on image */}
                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm p-1 rounded-md text-white z-10">
                      {item.type === 'tour' && <Tag size={8} />}
                      {item.type === 'safari' && <Sparkles size={8} />}
                      {item.type === 'package' && <Calendar size={8} />}
                      {item.type === 'blog' && <BookOpen size={8} />}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[8px] md:text-[9px] uppercase font-black px-2 py-0.5 rounded-md border tracking-wider ${getBadgeStyles(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                      {item.category && (
                        <span className="text-[9px] text-slate-400 truncate max-w-[120px] font-semibold">{item.category}</span>
                      )}
                    </div>
                    <h4 className="text-sm md:text-base font-bold text-white tracking-tight group-hover:text-[#D4A017] transition-colors truncate">
                      {renderHighlightedText(item.title, query)}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {renderHighlightedText(item.description, query)}
                    </p>
                  </div>

                  {/* Pricing / Duration Pill */}
                  <div className="text-right shrink-0 flex flex-col justify-center items-end pl-2">
                    {item.price && (
                      <span className="text-sm font-extrabold text-[#D4A017] font-mono leading-none">{formatPrice(item.price)}</span>
                    )}
                    {item.duration && (
                      <span className="text-[9px] text-slate-400 font-bold mt-1.5 flex items-center gap-1 font-mono uppercase tracking-wider">
                        <Clock size={10} />
                        {item.duration}
                      </span>
                    )}
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors group-hover:translate-x-1 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 space-y-4">
              <div className="space-y-1">
                <Compass size={36} className="mx-auto text-[#D4A017] animate-pulse" />
                <p className="text-sm font-bold">
                  {t('search.noResults')} <span className="text-[#D4A017]">"{query}"</span>
                </p>
                <p className="text-xs text-slate-500">
                  {language === 'en' 
                    ? 'No exact match. Try using simple terms, or explore our top-recommended Zanzibar excursions below:' 
                    : 'Hakuna matokeo sawa. Jaribu maneno rahisi, au chunguza ziara zetu zinazopendekezwa zaidi chini:'}
                </p>
              </div>

              {/* No-result recommendations (showing top 2 bestsellers) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                {searchableItems.slice(0, 2).map(item => (
                  <div
                    key={`no-res-${item.id}`}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 p-2.5 rounded-xl cursor-pointer group transition-all"
                  >
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-white/5">
                      <ProgressiveImage src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-black text-white truncate group-hover:text-[#D4A017] transition-colors">{item.title}</h5>
                      <span className="text-[10px] text-[#D4A017] font-extrabold font-mono">{item.price ? formatPrice(item.price) : 'Best Rate'}</span>
                    </div>
                    <ArrowRight size={12} className="text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular search filters row */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <h5 className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
              {t('search.quickFilters')}
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SEARCH_KEYWORDS.map(kw => (
                <button
                  key={kw}
                  onClick={() => { setQuery(kw); inputRef.current?.focus(); }}
                  className="bg-white/5 hover:bg-white/10 text-white hover:text-[#D4A017] text-xs font-semibold px-3 py-1 rounded-xl transition-all border border-white/5 flex items-center gap-1"
                >
                  <Search size={11} className="text-[#D4A017]/50" />
                  <span>{kw}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Footer */}
        <div className="bg-[#070D1A] border-t border-white/10 px-4 md:px-6 py-3.5 flex items-center justify-between text-[10px] text-slate-500 font-bold tracking-wider font-mono uppercase">
          <span>{t('search.shortcut')}</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Compass size={12} className="animate-pulse text-[#D4A017]" />
            <span>Zanzibar Trip & Relax Live Index</span>
          </span>
        </div>

      </motion.div>
    </div>
  );
}
