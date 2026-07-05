import { useEffect } from 'react';
import { Leaf, Award, Globe, Heart, Shield, Sparkles, Flame, CheckCircle, Droplet, Users, ArrowRight } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { ProgressiveImage } from '../components/ProgressiveImage';
import { getSustainability } from '../lib/cmsStore';

interface SustainabilityProps {
  navigate: (page: Page) => void;
}

export default function Sustainability({ navigate }: SustainabilityProps) {
  const content = getSustainability();

  // Scroll to hash element if provided
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const id = hash.split('?')[1];
      if (id) {
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 350);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#070e1b] text-white pb-24">
      {/* Immersive Header Banner */}
      <section className="relative h-[48vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/3474320/pexels-photo-3474320.jpeg?auto=compress&cs=tinysrgb&w=1600')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070e1b] via-[#070e1b]/70 to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-[#D4A017]/10 border border-[#D4A017]/30 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase text-[#D4A017] tracking-widest">
            <Leaf size={11} className="animate-bounce" />
            <span>Eco-Friendly & Sustainable Tourism</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            {content.introTitle}
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-semibold">
            {content.introSubtitle}
          </p>
        </div>
      </section>

      {/* Grid of Core Actions driven by getSustainability() */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        
        {/* SECTION 1: Environmental Conservation & Wildlife Protection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[#D4A017] text-xs font-black uppercase tracking-widest block font-mono">
              Category 01 & 02 • Preservation
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Environmental Conservation & Wildlife Protection
            </h2>
            <div className="w-16 h-1 bg-[#D4A017] rounded-full" />
            
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-semibold">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-xs font-black text-[#D4A017] uppercase tracking-wider flex items-center gap-2">
                  <Leaf size={14} /> Marine Reef Restoration
                </h4>
                <p className="text-xs leading-normal text-slate-300">{content.conservationText}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-xs font-black text-[#D4A017] uppercase tracking-wider flex items-center gap-2">
                  <Shield size={14} /> Endemic Wildlife Safeguards
                </h4>
                <p className="text-xs leading-normal text-slate-300">{content.wildlifeText}</p>
              </div>
            </div>
          </div>

          <div className="relative group z-10">
            <div className="absolute inset-0 bg-[#D4A017]/10 rounded-3xl blur-2xl group-hover:bg-[#D4A017]/20 transition-colors pointer-events-none" />
            <ProgressiveImage 
              src="https://images.pexels.com/photos/1680140/pexels-photo-1680140.jpeg?auto=compress&cs=tinysrgb&w=800" 
              alt="Beautiful marine conservation coral reef and sea turtles" 
              className="w-full rounded-3xl shadow-2xl object-cover h-[350px] border border-white/10 relative"
            />
          </div>
        </div>

        {/* SECTION 2: Community Support & Local Partnerships */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
          <div className="lg:order-2 space-y-6">
            <span className="text-[#D4A017] text-xs font-black uppercase tracking-widest block font-mono">
              Category 03 & 04 • Swahili Community
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Community Support & Local Partnerships
            </h2>
            <div className="w-16 h-1 bg-[#D4A017] rounded-full" />
            
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-semibold">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-xs font-black text-[#D4A017] uppercase tracking-wider flex items-center gap-2">
                  <Users size={14} /> Direct Coastal Village Upliftment
                </h4>
                <p className="text-xs leading-normal text-slate-300">{content.communityText}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-xs font-black text-[#D4A017] uppercase tracking-wider flex items-center gap-2">
                  <Heart size={14} /> 100% Native Swahili Operations
                </h4>
                <p className="text-xs leading-normal text-slate-300">{content.partnershipsText}</p>
              </div>
            </div>
          </div>

          <div className="lg:order-1 relative group z-10">
            <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-2xl group-hover:bg-blue-500/20 transition-colors pointer-events-none" />
            <ProgressiveImage 
              src="https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800" 
              alt="Swahili fishermen dhow boat captains at school kids donation drive" 
              className="w-full rounded-3xl shadow-2xl object-cover h-[350px] border border-white/10 relative"
            />
          </div>
        </div>

        {/* SECTION 3: Plastic Reduction, Responsible Tourism & Carbon Footprint */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#D4A017] text-xs font-black uppercase tracking-widest block font-mono">
              Category 05, 06 & 07 • Future Impact
            </span>
            <h3 className="text-2xl font-black uppercase tracking-wider" style={{ fontFamily: 'Playfair Display, serif' }}>
              Responsible Carbon & Plastic Reduction Initiatives
            </h3>
            <p className="text-xs text-slate-400 font-bold">Small-group travels designed to respect cultures, eliminate plastics, and plant mangroves.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0A1224] p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Droplet size={18} />
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Zero-Plastic Policy</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                {content.plasticReductionText}
              </p>
            </div>

            <div className="bg-[#0A1224] p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="h-9 w-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <Globe size={18} />
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Responsible swahili Etiquette</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                {content.responsibleTourismText}
              </p>
            </div>

            <div className="bg-[#0A1224] p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="h-9 w-9 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/20 flex items-center justify-center text-[#D4A017]">
                <Sparkles size={18} />
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Carbon offsetting & Mangroves</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                {content.carbonInitiativesText}
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* Big callout for guest involvement */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-r from-[#D4A017]/20 to-[#0A1224]/50 border border-[#D4A017]/30 rounded-3xl p-8 text-center space-y-6">
          <Award size={36} className="mx-auto text-[#D4A017] animate-pulse" />
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-extrabold" style={{ fontFamily: 'Playfair Display, serif' }}>
              Join Our Responsible Eco-Excursions
            </h3>
            <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed font-semibold">
              When you book through Zanzibar Trip & Relax, you support native Swahili guides, protect delicate Indian Ocean reefs, and ensure children in local villages have access to textbooks.
            </p>
          </div>
          <button
            onClick={() => navigate('booking')}
            className="inline-flex items-center gap-1.5 bg-[#D4A017] hover:bg-white text-[#0A1224] text-xs font-black px-6 py-3.5 rounded-full uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[#D4A017]/25"
          >
            <span>Book Eco-Friendly Tour</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
