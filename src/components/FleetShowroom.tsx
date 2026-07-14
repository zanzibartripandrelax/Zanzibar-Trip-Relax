import React, { useState } from 'react';
import { VehicleItem } from '../types/transfer';
import { Users, Luggage, Shield, Star, Check, Sparkles, Sliders } from 'lucide-react';

interface FleetShowroomProps {
  vehicles: VehicleItem[];
  onSelectVehicle?: (vehicle: VehicleItem) => void;
}

export default function FleetShowroom({ vehicles, onSelectVehicle }: FleetShowroomProps) {
  const [filter, setFilter] = useState<'all' | 'sedan' | 'suv' | 'minivan' | 'bus'>('all');

  const filtered = vehicles.filter((v) => {
    if (filter === 'all') return true;
    const name = v.model.toLowerCase();
    if (filter === 'sedan') return name.includes('sedan') || name.includes('premio') || name.includes('allion');
    if (filter === 'suv') return name.includes('cruiser') || name.includes('prado') || name.includes('rav4');
    if (filter === 'minivan') return name.includes('alphard') || name.includes('noah') || name.includes('vellfire');
    if (filter === 'bus') return name.includes('coaster') || name.includes('bus') || name.includes('coach');
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base" style={{ fontFamily: 'Playfair Display, serif' }}>
            Zanzibar Trip & Relax Premium Fleet
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            100% Licensed commercial vehicles. All passenger seats feature comprehensive carriage liability coverage.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-2xl border">
          {(['all', 'sedan', 'suv', 'minivan', 'bus'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                filter === cat
                  ? 'bg-[#0B3B8C] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat === 'all' ? 'Show All' : cat}s
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((veh) => (
          <div
            key={veh.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
          >
            {/* Image Banner */}
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
              <img
                src={veh.image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=compress&cs=tinysrgb&w=800'}
                alt={veh.model}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{veh.status}</span>
              </div>

              {/* Float specs */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <h4 className="font-extrabold text-white text-sm tracking-tight drop-shadow-sm">{veh.model}</h4>
                {veh.priceAdjustment > 0 && (
                  <span className="bg-[#D4A017] text-[#0B3B8C] font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    +${veh.priceAdjustment} VIP Choice
                  </span>
                )}
              </div>
            </div>

            {/* Content Specifications */}
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4 text-xs">
              <div className="space-y-3">
                <p className="text-slate-500 leading-relaxed font-medium">{veh.description}</p>

                {/* Grid Cap specs */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-[#0B3B8C]" />
                    <span className="font-semibold text-slate-600">Max {veh.capacity} passengers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Luggage size={14} className="text-[#D4A017]" />
                    <span className="font-semibold text-slate-600">Fits {veh.luggageCapacity} bags</span>
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Standard Amenities Included:</p>
                  <div className="flex flex-wrap gap-1">
                    {veh.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-600 border border-slate-200/40 text-[9px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Check size={9} className="text-emerald-500" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Select Action CTA */}
              {onSelectVehicle && (
                <button
                  type="button"
                  onClick={() => onSelectVehicle(veh)}
                  className="w-full bg-[#0B3B8C] hover:bg-blue-900 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles size={12} className="text-[#D4A017]" />
                  <span>Choose This Vehicle</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="md:col-span-2 text-center p-12 border border-dashed rounded-3xl bg-slate-50">
            <p className="text-xs text-slate-400 font-medium">No vehicles in the selected category match our active Zanzibar fleet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
