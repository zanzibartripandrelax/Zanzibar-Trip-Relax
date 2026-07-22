import React, { useEffect, useRef, useState } from 'react';
import { Heart, Award, Globe, Leaf, ArrowRight, Target, Eye } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { getSiteContent } from '../lib/cmsStore';
import { useLanguage } from '../context/LanguageContext';
import { ProgressiveImage } from '../components/ProgressiveImage';

interface AboutProps {
  navigate: (page: Page) => void;
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${className} transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
}

const valueIconMap: Record<string, any> = {
  Globe,
  Leaf,
  Heart,
  Award,
};

const getTeamFallback = (name: string) => {
  if (name === "Careen Harrison Kiondo") {
    return "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=600";
  }
  if (name === "Harrison Kiondo") {
    return "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600";
  }
  // Default to Gerevas / Founder local photo
  return "/src/assets/images/ceo_gerevas.jpg";
};

export default function About({ navigate }: AboutProps) {
  const content = getSiteContent();
  const { about } = content;
  const { t, tDefault } = useLanguage();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const id = hash.split('?')[1];
      if (id) {
        // Special mapping for values/sustainability/whychooseus/team
        let targetId = id;
        if (id === 'why-choose-us' || id === 'sustainability') targetId = 'values';
        if (id === 'about-us' || id === 'story') targetId = 'about-us';
        
        const element = document.getElementById(targetId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      }
    }
  }, []);

  const translatedStats = about.stats.map(stat => {
    let transLabel = stat.label;
    if (stat.label === 'Happy Travelers') transLabel = t('about.happyTravelers');
    if (stat.label === 'Countries Served') transLabel = t('about.countriesServed');
    if (stat.label === 'Years Experience') transLabel = t('about.yearsExperience');
    if (stat.label === 'Guest Rating') transLabel = t('about.guestRating');
    return { ...stat, label: transLabel };
  });

  const translatedValues = about.values.map(val => {
    let transTitle = val.title;
    let transDesc = val.desc;
    if (val.title === 'Local Authenticity') { transTitle = t('value.local'); transDesc = t('value.localDesc'); }
    if (val.title === 'Eco-Protection') { transTitle = t('value.eco'); transDesc = t('value.ecoDesc'); }
    if (val.title === 'Ethical Wages') { transTitle = t('value.wages'); transDesc = t('value.wagesDesc'); }
    if (val.title === 'Transparent Cost') { transTitle = t('value.transparent'); transDesc = t('value.transparentDesc'); }
    return { ...val, title: transTitle, desc: transDesc };
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/2087394/pexels-photo-2087394.jpeg?auto=compress&cs=tinysrgb&w=1600')" }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            {tDefault('about.heroTitle', about.heroTitle)}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {tDefault('about.heroSubtitle', about.heroSubtitle)}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="-mt-12 relative z-20 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {translatedStats.map((stat, i) => (
            <div key={i}>
              <div className="text-2xl md:text-3xl font-bold text-[#D4A017]">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Story */}
      <section id="about-us" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#D4A017] text-sm font-semibold uppercase tracking-widest mb-3 block">
                {t('about.ourStory')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B3B8C] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                {tDefault('about.storyTitle', about.storyTitle)}
              </h2>
              <div className="gold-line-left" />
              <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-line">
                {tDefault('about.storyText1', about.storyText1)}
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed whitespace-pre-line">
                {tDefault('about.storyText2', about.storyText2)}
              </p>
              <button type="button" onClick={() => navigate('contact')} className="bg-[#0B3B8C] hover:bg-[#0a3280] text-white font-semibold px-6 py-3 rounded-full transition-colors flex items-center gap-2 cursor-pointer">
                {t('about.getInTouch')} <ArrowRight size={18} />
              </button>
            </div>
            <div className="relative">
              <ProgressiveImage 
                src={about.team[0]?.image || "/src/assets/images/ceo_gerevas.jpg"} 
                alt="Gerevas Paulo Mtaki, Founder & CEO of Zanzibar Trip & Relax" 
                className="w-full rounded-2xl shadow-xl object-cover max-h-[500px]" 
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getTeamFallback("Gerevas Paulo Mtaki");
                }}
              />
              <div className="absolute -bottom-6 -left-6 bg-[#D4A017] text-[#0B1E3D] p-4 rounded-xl shadow-lg border border-white/20">
                <div className="font-extrabold">{about.team[0]?.name || "Gerevas Paulo Mtaki"}</div>
                <div className="text-xs font-bold opacity-90">{about.team[0]?.role || "Founder & CEO"}</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-[#F4E7D3]">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-[#0B3B8C] rounded-full flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3B8C] mb-3">{t('about.ourMission')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('about.ourMissionDesc')}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-[#D4A017] rounded-full flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-[#0B1E3D]" />
              </div>
              <h3 className="text-xl font-bold text-[#0B3B8C] mb-3">{t('about.ourVision')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('about.ourVisionDesc')}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Values */}
      <section id="values" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <span className="text-[#D4A017] text-sm font-semibold uppercase tracking-widest mb-2 block">
              {t('about.whatWeStandFor')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B3B8C] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              {t('about.ourValues')}
            </h2>
            <div className="gold-line" />
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {translatedValues.map((val, i) => {
              const IconComp = valueIconMap[val.icon] || Heart;
              return (
                <div key={i}>
                  <AnimatedSection>
                    <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors h-full">
                      <div className="w-14 h-14 bg-[#0B3B8C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComp className="w-7 h-7 text-[#0B3B8C]" />
                      </div>
                      <h3 className="font-bold text-[#0B3B8C] mb-2">{val.title}</h3>
                      <p className="text-sm text-gray-600">{val.desc}</p>
                    </div>
                  </AnimatedSection>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <span className="text-[#D4A017] text-sm font-semibold uppercase tracking-widest mb-2 block">The People Behind It</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B3B8C] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Meet Our Team</h2>
            <div className="gold-line" />
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {about.team.map((member, i) => (
              <div key={i}>
                <AnimatedSection>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                    <div className="relative h-64 shrink-0">
                      <ProgressiveImage 
                        src={member.image} 
                        alt={
                          member.name === "Gerevas Paulo Mtaki" 
                            ? "Gerevas Paulo Mtaki, Founder & CEO of Zanzibar Trip & Relax" 
                            : member.name === "Harrison Kiondo" 
                            ? "Harrison Kiondo, Tourism Consultant and Advisor at Zanzibar Trip & Relax" 
                            : member.name === "Careen Harrison Kiondo" 
                            ? "Careen Harrison Kiondo, Co-Founder and Guest Experience Specialist at Zanzibar Trip & Relax" 
                            : `${member.name}, ${member.role} at Zanzibar Trip & Relax`
                        } 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getTeamFallback(member.name);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E3D]/80 to-transparent" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-[#0B3B8C]">{member.name}</h3>
                      <p className="text-[#D4A017] text-sm font-medium mb-3">{member.role}</p>
                      <p className="text-gray-650 text-xs leading-relaxed flex-1">{member.bio}</p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#0B1E3D]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Experience Zanzibar?
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Let us help you plan an unforgettable adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button type="button" onClick={() => navigate('booking')} className="bg-[#D4A017] hover:bg-[#c49010] text-[#0B1E3D] font-bold px-8 py-4 rounded-full transition-colors cursor-pointer">
              Book Custom Trip
            </button>
            <button type="button" onClick={() => navigate('contact')} className="border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-[#0B3B8C] transition-all cursor-pointer">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
