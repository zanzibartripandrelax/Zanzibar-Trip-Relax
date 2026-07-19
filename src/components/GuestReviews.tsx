import { useState, useEffect, FormEvent } from 'react';
import { Star, ShieldCheck, Quote, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

interface Review {
  id: string;
  name: string;
  country: string;
  rating: number;
  comment: { en: string; sw: string };
  date: string;
  tour: { en: string; sw: string };
}

const staticReviews: Review[] = [
  {
    id: 's1',
    name: 'Sarah Jenkins',
    country: 'United Kingdom',
    rating: 5,
    comment: {
      en: 'Absolutely breathtaking! Our boat guide was so knowledgeable and knew exactly when to visit the sandbank to avoid the crowds. The fresh marine feast was legendary.',
      sw: 'Inashangaza sana! Kiongozi wetu wa boti alikuwa na ujuzi mwingi na alijua vizuri wakati wa kutembelea fungu la mchanga ili kuepuka umati. Karamu ya vyakula vya baharini ilikuwa ya hadithi.'
    },
    date: 'June 2025',
    tour: {
      en: 'Safari Blue Ocean Cruise',
      sw: 'Safari ya Bahari ya Safari Blue'
    }
  },
  {
    id: 's2',
    name: 'David Müller',
    country: 'Germany',
    rating: 5,
    comment: {
      en: 'Highly professional local team. Handled our airport welcome, Stone Town heritage walk, and safari transfers with absolute punctuality. Deeply comfortable air-conditioned cars.',
      sw: 'Timu ya kienyeji yenye weledi wa hali ya juu. Walishughulikia mapokezi yetu ya uwanja vya ndege, matembezi ya urithi wa Stone Town, na uhamishaji wa safari kwa usahihi kabisa. Magari ya faraja yenye kiyoyozi.'
    },
    date: 'May 2025',
    tour: {
      en: 'Private Transfers & Stone Town',
      sw: 'Uhamisho wa Kibinafsi & Stone Town'
    }
  },
  {
    id: 's3',
    name: 'Elena Rostova',
    country: 'Switzerland',
    rating: 5,
    comment: {
      en: 'An incredible lifetime experience flying from Zanzibar to Serengeti. Tracking the Big Five with our private ranger and the accommodations at the wild lodge were flawless.',
      sw: 'Uzoefu wa kushangaza wa maisha kuruka kutoka Zanzibar kwenda Serengeti. Kufuatilia Wanyama Watano Wakubwa na mgambo wetu wa kibinafsi na malazi kwenye loji ya porini yalikuwa kamili.'
    },
    date: 'April 2025',
    tour: {
      en: 'Tanzania mainland Safari Combo',
      sw: 'Mchanganyiko wa Safari Bara la Tanzania'
    }
  },
  {
    id: 's4',
    name: "James & Priya O'Brien",
    country: 'Ireland',
    rating: 5,
    comment: {
      en: 'The Nakupenda Sandbar was a jaw-dropping natural wonder. Vetted local captains, pristine snorkeling reefs, and infinite hospitality. Booking was extremely transparent.',
      sw: 'Fungu la mchanga la Nakupenda lilikuwa ajabu la asili la kushangaza. Manahodha waliohakikiwa, miamba safi ya kupiga mbizi, na ukarimu usio na mwisho. Uhifadhi ulikuwa wazi kabisa.'
    },
    date: 'June 2025',
    tour: {
      en: 'Nakupenda Private Day Tour',
      sw: 'Ziara ya Kibinafsi ya Siku ya Nakupenda'
    }
  },
  {
    id: 's5',
    name: 'Ingrid Schmidt',
    country: 'Austria',
    rating: 5,
    comment: {
      en: 'Mnemba marine coral was like swimming inside a tropical aquarium. Saw sea turtles and school dolphins close up. They care deeply about marine eco-protection.',
      sw: 'Miamba ya baharini ya Mnemba ilikuwa kama kuogelea ndani ya akwariamu ya kitropiki. Tuliona kobe wa baharini na makundi ya pomboo kwa karibu. Wanajali sana ulinzi wa mazingira ya baharini.'
    },
    date: 'May 2025',
    tour: {
      en: 'Mnemba Island Reef Snorkeling',
      sw: 'Kupiga Mbizi Kwenye Miamba ya Mnemba'
    }
  },
  {
    id: 's6',
    name: 'Ryan Okafor',
    country: 'Nigeria',
    rating: 5,
    comment: {
      en: 'Our cultural walking tour through the narrow lanes of Stone Town was highly educational. Our native guide brought historical door carvings and spice history to life.',
      sw: 'Matembezi yetu ya kitamaduni katika vichochoro vyembamba vya Stone Town yalikuwa ya kuelimisha sana. Kiongozi wetu mzaliwa wa hapa alifufua michongo ya milango ya kihistoria na historia ya viungo.'
    },
    date: 'March 2025',
    tour: {
      en: 'Stone Town Cultural Walk',
      sw: 'Matembezi ya Kitamaduni ya Stone Town'
    }
  }
];

interface GuestReviewsProps {
  navigate?: (page: any, id?: string) => void;
}

export default function GuestReviews({ navigate }: GuestReviewsProps) {
  const { language, t } = useLanguage();
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>(staticReviews);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isPaused, setIsPaused] = useState(false);

  // Fetch real-time client reviews from Supabase database
  useEffect(() => {
    async function loadDbFeedback() {
      try {
        const { data, error } = await supabase
          .from('customer_feedback')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setDbReviews(data);
        }
      } catch (err) {
        console.warn('Could not load dynamic customer feedback:', err);
      }
    }
    loadDbFeedback();
  }, []);

  // Merge static and dynamic reviews
  useEffect(() => {
    if (dbReviews.length === 0) {
      setReviews(staticReviews);
      return;
    }

    const formattedDb: Review[] = dbReviews.map((r) => {
      const formattedDate = r.created_at 
        ? new Date(r.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'sw-TZ', { month: 'long', year: 'numeric' })
        : (language === 'en' ? 'Recent Guest' : 'Mgeni wa Sasa');
      
      return {
        id: `db-${r.id}`,
        name: r.guest_name || 'Verified Client',
        country: language === 'en' ? 'Verified Reviewer' : 'Mkaguzi Aliyethibitishwa',
        rating: r.rating_stars || 5,
        comment: {
          en: r.comments,
          sw: r.comments
        },
        date: formattedDate,
        tour: {
          en: r.toured_package || 'Zanzibar Immersion Tour',
          sw: r.toured_package || 'Safari ya Kipekee ya Zanzibar'
        }
      };
    });

    // Interleave dynamic reviews with premium curated ones
    const merged = [...formattedDb, ...staticReviews];
    setReviews(merged);
  }, [dbReviews, language]);

  // Handle Autoplay carousel transitions
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, 6000); // Transition every 6 seconds

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, reviews.length]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleViewAll = () => {
    if (navigate) {
      navigate('reviews');
    } else {
      window.location.hash = '#reviews';
    }
  };

  // Motion animation parameters for clean slide transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 160 : -160,
      opacity: 0,
      scale: 0.96
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 28 },
        opacity: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 160 : -160,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 28 },
        opacity: { duration: 0.2 }
      }
    })
  };

  const activeReview = reviews[currentIndex] || reviews[0] || staticReviews[0];

  return (
    <section id="guest-reviews" className="bg-[#FAFBFD] py-24 px-4 border-t border-b border-gray-100 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Modern Booking.com style Rating Hub Top Summary */}
        <div className="bg-[#0B3B8C] text-white rounded-3xl p-8 md:p-10 mb-14 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center justify-center">
            <Quote size={200} className="text-[#D4A017]" />
          </div>

          <div className="space-y-3 z-10">
            <div className="inline-flex items-center gap-1.5 bg-[#D4A017] text-[#0A1224] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              <ShieldCheck size={12} /> {t('reviews.vetted')}
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              {t('reviews.title')}
            </h2>
            <p className="text-white/70 text-xs md:text-sm max-w-xl">
              {t('reviews.subtitle')}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-5 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6 z-10 w-full md:w-auto">
            <div className="text-center md:text-left">
              <div className="text-5xl font-extrabold text-white leading-none">4.9<span className="text-xl font-medium text-white/60">/5</span></div>
              <div className="text-xs text-[#D4A017] font-semibold mt-1.5">{t('reviews.satisfaction')}</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="text-[#D4A017]" fill="currentColor" />
                ))}
              </div>
              <div className="text-xs text-white/80 font-medium mt-1">{t('reviews.count')}</div>
              <div className="text-[10px] text-white/50">{t('reviews.platforms')}</div>
            </div>
          </div>
        </div>

        {/* Dynamic Testimonial Carousel Frame */}
        <div className="relative max-w-4xl mx-auto px-1 sm:px-4">
          <div 
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute -top-12 -left-3 text-slate-100 pointer-events-none select-none hidden sm:block">
              <Quote size={120} className="fill-slate-50 opacity-40" />
            </div>

            {/* Testimonial Active Slide Container */}
            <div className="min-h-[320px] sm:min-h-[280px] flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeReview.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -40) {
                      handleNext();
                    } else if (info.offset.x > 40) {
                      handlePrev();
                    }
                  }}
                  className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 w-full relative z-10 cursor-grab active:cursor-grabbing select-none"
                >
                  <div>
                    {/* Visual Header with Initials Avatar & Star Rating */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B3B8C] to-[#0A1E3D] flex items-center justify-center text-[#D4A017] font-bold text-sm uppercase shadow-sm">
                          {activeReview.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#0B3B8C] text-base">{activeReview.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-400 font-semibold">{activeReview.country}</span>
                            <span className="text-[10px] text-slate-300">•</span>
                            <span className="text-[11px] text-slate-400">{activeReview.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stars Display */}
                      <div className="flex gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100/30 w-fit shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={i < activeReview.rating ? "text-[#D4A017]" : "text-slate-200"} 
                            fill={i < activeReview.rating ? "currentColor" : "none"} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review text */}
                    <div className="relative pl-1">
                      <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-normal italic pr-2">
                        "{language === 'en' ? activeReview.comment.en : activeReview.comment.sw}"
                      </p>
                    </div>
                  </div>

                  {/* Completed Excursion Footer Tag */}
                  <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-450 block text-[10px] font-semibold uppercase tracking-wider">{t('reviews.completed')}</span>
                      <span className="text-xs font-bold text-[#0B3B8C] mt-0.5 block">
                        {language === 'en' ? activeReview.tour.en : activeReview.tour.sw}
                      </span>
                    </div>

                    {/* Verified buyer checkmark */}
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50 w-fit">
                      <ShieldCheck size={13} className="shrink-0" />
                      <span className="text-[10px] font-bold tracking-wider uppercase">Verified Guest</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Custom styled absolute arrow navigation buttons (hidden on smaller phones, shown elsewhere) */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 lg:-left-16 z-20 hidden sm:block">
              <button
                onClick={handlePrev}
                aria-label={t('reviews.prev')}
                className="w-12 h-12 bg-white hover:bg-[#0B3B8C] text-[#0B3B8C] hover:text-white border border-slate-100 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 lg:-right-16 z-20 hidden sm:block">
              <button
                onClick={handleNext}
                aria-label={t('reviews.next')}
                className="w-12 h-12 bg-white hover:bg-[#0B3B8C] text-[#0B3B8C] hover:text-white border border-slate-100 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Interactive Pagination indicators & Actions row */}
          <div className="flex flex-col items-center justify-center gap-6 mt-8">
            
            {/* Carousel navigation dots */}
            <div className="flex items-center gap-2">
              {/* Prev icon button for mobile/touch users */}
              <button 
                onClick={handlePrev} 
                className="p-2 text-slate-400 hover:text-[#0B3B8C] sm:hidden cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className="relative py-2 focus:outline-none cursor-pointer"
                  >
                    <span 
                      className={`block rounded-full transition-all duration-350 ${
                        index === currentIndex 
                          ? 'w-6 h-2 bg-[#0B3B8C]' 
                          : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                      }`} 
                    />
                  </button>
                ))}
              </div>

              {/* Next icon button for mobile/touch users */}
              <button 
                onClick={handleNext} 
                className="p-2 text-slate-400 hover:text-[#0B3B8C] sm:hidden cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Read More & Action Button */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <button
                onClick={handleViewAll}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#0B3B8C] hover:text-[#0B3B8C]/80 transition-all uppercase tracking-wider cursor-pointer bg-white px-6 py-2.5 rounded-full shadow-sm hover:shadow-md border border-slate-100"
              >
                <MessageSquare size={14} />
                <span>{t('reviews.more')}</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
