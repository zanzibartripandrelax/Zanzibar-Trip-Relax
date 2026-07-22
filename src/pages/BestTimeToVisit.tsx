import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, CloudSun, Compass, Sun, Droplets, Thermometer, MapPin, Sparkles, CheckCircle2, ArrowRight, Table, Info, Wind } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';

interface BestTimeToVisitProps {
  navigate: (page: Page, id?: string) => void;
}

interface SeasonData {
  id: string;
  name: string;
  months: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  bestFor: string[];
  expectText: string;
  highlights: string[];
}

export default function BestTimeToVisit({ navigate }: BestTimeToVisitProps) {
  const [activeSeason, setActiveSeason] = useState<string>('dry');
  const [kiliAltitude, setKiliAltitude] = useState<string>('summit');

  const seasons: SeasonData[] = [
    {
      id: 'dry',
      name: 'Dry Season',
      months: 'June to October',
      icon: <Sun className="w-6 h-6 text-amber-400" />,
      color: 'text-amber-400 border-amber-500/30',
      bgGradient: 'from-amber-500/10 to-amber-900/5',
      bestFor: [
        'Big Five safaris',
        'Great Migration river crossings',
        'Mount Kilimanjaro climbing',
        'Wildlife photography',
        'Family safaris'
      ],
      expectText: 'The dry season offers sunny days, cooler mornings, and excellent wildlife viewing. Animals gather around rivers and waterholes, making them easier to spot during game drives.',
      highlights: [
        'Great Migration in Northern Serengeti',
        'Excellent wildlife viewing',
        'Comfortable safari weather',
        'Clear skies',
        'Peak travel season'
      ]
    },
    {
      id: 'short',
      name: 'Short Rains',
      months: 'November to December',
      icon: <CloudSun className="w-6 h-6 text-emerald-400" />,
      color: 'text-emerald-400 border-emerald-500/30',
      bgGradient: 'from-emerald-500/10 to-emerald-900/5',
      bestFor: [
        'Birdwatching',
        'Green landscapes',
        'Photography',
        'Lower travel costs'
      ],
      expectText: 'Light rainfall transforms Tanzania into a lush green paradise. Safari roads remain accessible, wildlife is still active, and visitor numbers are lower than during peak season.',
      highlights: [
        'Beautiful scenery',
        'Migratory birds',
        'Excellent photography',
        'Better accommodation availability'
      ]
    },
    {
      id: 'calving',
      name: 'Calving Season',
      months: 'January to March',
      icon: <Sparkles className="w-6 h-6 text-[#D4A017]" />,
      color: 'text-[#D4A017] border-[#D4A017]/35',
      bgGradient: 'from-[#D4A017]/10 to-[#D4A017]/5',
      bestFor: [
        'Great Migration calving',
        'Predator action',
        'Wildlife enthusiasts',
        'Warm Zanzibar holidays'
      ],
      expectText: 'Thousands of wildebeest calves are born in the southern Serengeti and Ndutu region. This attracts lions, cheetahs, hyenas, and other predators, creating unforgettable safari moments.',
      highlights: [
        'Baby animals',
        'Big cat sightings',
        'Warm temperatures',
        'Excellent beach holidays'
      ]
    },
    {
      id: 'long',
      name: 'Long Rains',
      months: 'March to May',
      icon: <Droplets className="w-6 h-6 text-blue-400" />,
      color: 'text-blue-400 border-blue-500/30',
      bgGradient: 'from-blue-500/10 to-blue-900/5',
      bestFor: [
        'Budget travel',
        'Birdwatching',
        'Peaceful safaris',
        'Lush scenery'
      ],
      expectText: 'This is Tanzania\'s greenest season, with fewer tourists and attractive accommodation rates. While rain showers are more frequent, they often occur in the afternoon, leaving plenty of time for exploration.',
      highlights: [
        'Quiet parks',
        'Lower prices',
        'Incredible landscapes',
        'Outstanding birdlife'
      ]
    }
  ];

  const activities = [
    { name: 'Big Five Safari', best: 'June – October', icon: '🦁' },
    { name: 'Great Migration River Crossings', best: 'July – October', icon: '🦓' },
    { name: 'Great Migration Calving', best: 'January – March', icon: '🍼' },
    { name: 'Birdwatching', best: 'November – April', icon: '🦜' },
    { name: 'Zanzibar Beach Holiday', best: 'June – March', icon: '🏖️' },
    { name: 'Diving & Snorkelling', best: 'October – March', icon: '🤿' },
    { name: 'Dolphin Tours', best: 'Year-round', icon: '🐬' },
    { name: 'Safari Blue', best: 'Year-round', icon: '⛵' },
    { name: 'Mount Kilimanjaro Climbing', best: 'January – March & June – October', icon: '🏔️' },
    { name: 'Honeymoon', best: 'June – October & January – March', icon: '💖' },
  ];

  return (
    <div className="bg-[#020C1F] min-h-screen text-white font-sans selection:bg-[#D4A017] selection:text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0A1A3A] to-[#020C1F] py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,160,23,0.08),transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A017]/10 text-[#D4A017] text-[11px] font-extrabold uppercase tracking-widest border border-[#D4A017]/25">
            <Compass className="w-3 h-3 animate-spin" /> Swahili Coast & Safari Guide
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight uppercase font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
            Best Time to Visit <span className="text-[#D4A017]">Tanzania & Zanzibar</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Discover the perfect time to experience Tanzania's spectacular wildlife, breathtaking landscapes, and the tropical paradise of Zanzibar. Plan your Big Five safari, migration crossings, or island retreat around ideal seasons.
          </p>
        </div>
      </div>

      {/* Tanzania at a Glance Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-[#0A1224] to-[#0A1A3A] border border-white/5 rounded-3xl p-8 lg:p-12 shadow-xl flex flex-col lg:flex-row gap-10 items-center justify-between">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-2xl lg:text-3xl font-bold font-serif text-white tracking-tight">Tanzania at a Glance</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tanzania is an exceptional year-round destination characterized by two distinct climatic cycles. The optimal time for your visit heavily depends on the activities and wildlife experiences you prioritize.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 w-full sm:w-56 hover:border-[#D4A017]/40 transition-colors">
              <Sun className="w-10 h-10 text-amber-400" />
              <div>
                <h4 className="font-bold text-sm tracking-wide uppercase text-white">Dry Season</h4>
                <p className="text-amber-400 font-extrabold text-xs mt-1">June to October</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 w-full sm:w-56 hover:border-emerald-500/40 transition-colors">
              <Droplets className="w-10 h-10 text-emerald-400" />
              <div>
                <h4 className="font-bold text-sm tracking-wide uppercase text-white">Green Season</h4>
                <p className="text-emerald-400 font-extrabold text-xs mt-1">November to May</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Seasons Segment */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-serif text-white uppercase tracking-tight">Discover the Four Seasonal Phases</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Click on a seasonal phase below to explore its distinct wildlife patterns, travel climates, and experience highlights.
          </p>
        </div>

        {/* Season Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {seasons.map((season) => (
            <button
              key={season.id}
              onClick={() => setActiveSeason(season.id)}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all text-center space-y-2 cursor-pointer ${
                activeSeason === season.id
                  ? `bg-white/5 border-[#D4A017] shadow-lg shadow-[#D4A017]/5`
                  : 'bg-[#0A1224] border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {season.icon}
              <span className="font-bold text-sm tracking-wide text-white block">{season.name}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">{season.months}</span>
            </button>
          ))}
        </div>

        {/* Active Season Details Container */}
        {(() => {
          const s = seasons.find((x) => x.id === activeSeason) || seasons[0];
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-gradient-to-br ${s.bgGradient} border border-white/10 rounded-3xl p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start`}
            >
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#D4A017]">Seasonal Cycle Detail</span>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mt-1">{s.name} ({s.months})</h3>
                </div>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {s.expectText}
                </p>
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#D4A017] rounded-full"></span> Best suited for
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {s.bestFor.map((bf, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-full bg-white/5 text-xs text-white border border-white/5 flex items-center gap-1">
                        ✨ {bf}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#030e25] border border-white/5 rounded-2xl p-6 space-y-5">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#D4A017] border-b border-white/5 pb-2">
                  Experience Highlights
                </h4>
                <ul className="space-y-3">
                  {s.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A017] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })()}
      </div>

      {/* Activity Timeline Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-serif text-white uppercase tracking-tight flex items-center justify-center gap-2">
            <Table className="w-6 h-6 text-[#D4A017]" /> Activity Suitability Grid
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Find the perfect window to book specific adventures, dives, safaris, or luxury honey-moons.
          </p>
        </div>

        <div className="bg-[#0A1224] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-widest text-[#D4A017]">Excursion / Activity</th>
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-widest text-[#D4A017]">Ideal Travel Months</th>
                  <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-widest text-[#D4A017] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {activities.map((act, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                      <span className="text-lg bg-white/5 w-8 h-8 rounded-full flex items-center justify-center">{act.icon}</span>
                      <span>{act.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{act.best}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate('booking')}
                        className="text-[10px] font-black uppercase tracking-wider text-[#D4A017] hover:text-white transition-colors flex items-center gap-1 ml-auto"
                      >
                        Book Window <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Regional Climates & Interactive Kilimanjaro Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-serif text-white uppercase tracking-tight">Weather & Regional Climates</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Review detailed regional expectations, and prepare accordingly for coastal beaches or massive alpine ranges.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Northern Tanzania */}
          <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-8 space-y-5 hover:border-white/10 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-white font-serif">Northern Tanzania</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">National Parks & Serengeti</p>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Daytime temperatures generally average between <strong className="text-white">20°C and 30°C</strong>, varying with altitude, national park topology, and the time of year. Nights on the rim of the Ngorongoro Crater can drop drastically.
            </p>
          </div>

          {/* Zanzibar Archipelago */}
          <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-8 space-y-5 hover:border-white/10 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
              <Sun className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-white font-serif">Zanzibar Island</h3>
              <p className="text-xs text-[#D4A017] font-bold uppercase tracking-wider">Swahili Coast Beachfront</p>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Warm tropical weather governs Zanzibar year-round with steady, beautiful temperatures between <strong className="text-white">25°C and 32°C</strong>. Soft indian ocean breezes and crystal-clear waters make it perfect in almost every month.
            </p>
          </div>

          {/* Kilimanjaro Interactive Gradient */}
          <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-8 space-y-5 hover:border-white/10 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Thermometer className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">Altitude Gradient</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-white font-serif">Mount Kilimanjaro</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Uhuru Peak Microclimates</p>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Climbing Kilimanjaro is like trekking from the equator to the North Pole in days. Temperatures vary dramatically based on your camp's altitude.
              </p>

              {/* Interactive Altitude Switcher */}
              <div className="bg-[#030e25] border border-white/10 rounded-xl p-1.5 grid grid-cols-3 gap-1">
                {(['base', 'mid', 'summit'] as const).map((alt) => (
                  <button
                    key={alt}
                    onClick={() => setKiliAltitude(alt)}
                    className={`px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      kiliAltitude === alt ? 'bg-[#D4A017] text-[#020C1F]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {alt}
                  </button>
                ))}
              </div>

              {/* Displaying selected altitude details */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center min-h-[60px] flex flex-col justify-center">
                {kiliAltitude === 'base' && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Rainforest Base</span>
                    <strong className="text-base text-emerald-400">20°C to 30°C</strong>
                  </div>
                )}
                {kiliAltitude === 'mid' && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Mid-Mountain Heather</span>
                    <strong className="text-base text-amber-400">5°C to 15°C</strong>
                  </div>
                )}
                {kiliAltitude === 'summit' && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Summit (Uhuru Peak)</span>
                    <strong className="text-base text-blue-400">-20°C to -5°C</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#030e25] border border-white/5 rounded-xl p-3 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Trekking packages require serious dynamic layering equipment. Check our booking guide checklists for pre-departure support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action & recommendation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0A1224] to-[#0A1A3A] border border-[#D4A017]/20 p-8 lg:p-16 text-center space-y-6 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(212,160,23,0.06),transparent_40%)]" />
          <div className="max-w-2xl mx-auto relative z-10 space-y-6">
            <h2 className="text-2xl lg:text-4xl font-serif font-bold text-white uppercase tracking-tight">Our Professional Recommendation</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              If you want the ultimate East African adventure, we highly recommend combining a <strong className="text-white">Northern Circuit Wildlife Safari</strong> with a relaxing <strong className="text-[#D4A017]">Zanzibar Beach Holiday</strong>. Experience Africa's spectacular wild predators before unwinding on world-famous tropical sands.
            </p>
            <div className="h-px bg-white/10" />
            <p className="text-xs text-slate-400">
              Our travel specialists at <strong className="text-white">Zanzibar Trip & Relax</strong> can help you design a customized private itinerary matching your precise travel dates, budget, and group goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => navigate('booking')}
                className="w-full sm:w-auto bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black uppercase tracking-wider text-xs px-8 py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Book Custom Trip</span> <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('contact')}
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold border border-white/20 uppercase tracking-wider text-xs px-8 py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Consult a Specialist</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
