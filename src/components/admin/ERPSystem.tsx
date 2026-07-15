import React, { useState } from 'react';
import { 
  Bus, Users, UserCheck, BarChart3, Settings, Calendar, Plus, Search, 
  MapPin, Clock, CheckCircle2, AlertCircle, Fuel, ShieldCheck, User
} from 'lucide-react';

interface ERPSystemProps {
  session: any;
}

export default function ERPSystem({ session }: ERPSystemProps) {
  const [subTab, setSubTab] = useState<'bookings' | 'vehicles' | 'routes' | 'drivers' | 'reports'>('bookings');

  // Vehicles List
  const [vehicles, setVehicles] = useState<any[]>(() => {
    const cached = localStorage.getItem('ztr_erp_vehicles');
    if (cached) return JSON.parse(cached);
    return [
      { id: 'v1', plate: 'ZNZ 7721', model: 'Toyota Alphard (Gold)', capacity: 7, status: 'Active', driver: 'Ali Khamis', fuel: '85%', nextService: '2026-08-15' },
      { id: 'v2', plate: 'ZNZ 4492', model: 'Toyota Coaster (Silver)', capacity: 26, status: 'Active', driver: 'Nassor Juma', fuel: '60%', nextService: '2026-08-10' },
      { id: 'v3', plate: 'ZNZ 1104', model: 'Toyota Hiace (Executive)', capacity: 14, status: 'Maintenance', driver: 'Unassigned', fuel: '100%', nextService: '2026-07-20' }
    ];
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>ERP & Operations Control</h2>
          <p className="text-xs text-slate-400">Manage fleet logistics, driver assignments, route optimization and operational reporting</p>
        </div>

        <div className="flex gap-2 bg-[#121B30] p-1 rounded-xl border border-white/5">
          {[
            { id: 'bookings', label: 'Operations', icon: Calendar },
            { id: 'vehicles', label: 'Fleet', icon: Bus },
            { id: 'drivers', label: 'Crew', icon: Users },
            { id: 'reports', label: 'Intelligence', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                subTab === tab.id ? 'bg-[#D4A017] text-[#020C1F] shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 md:p-8">
        {subTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Fleet Inventory Management</h3>
              <button className="bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-[10px] font-black px-4 py-2 rounded-xl transition-all flex items-center gap-2">
                <Plus size={14} /> Add New Vehicle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="bg-[#121B30]/50 border border-white/5 rounded-3xl p-6 space-y-4 hover:border-[#D4A017]/20 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-[#D4A017]/10 flex items-center justify-center text-[#D4A017]">
                      <Bus size={24} />
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      vehicle.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{vehicle.plate}</h4>
                    <p className="text-xs text-slate-400">{vehicle.model}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Assigned Driver</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-200">
                        <UserCheck size={12} className="text-[#D4A017]" />
                        <span>{vehicle.driver}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Capacity</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-200">
                        <Users size={12} className="text-[#D4A017]" />
                        <span>{vehicle.capacity} Guests</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Fuel Level</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-200">
                        <Fuel size={12} className="text-emerald-400" />
                        <span>{vehicle.fuel}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider block">Next Service</span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-200">
                        <ShieldCheck size={12} className="text-blue-400" />
                        <span>{vehicle.nextService}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold py-2 rounded-xl transition-all">
                      Maintenance Log
                    </button>
                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold py-2 rounded-xl transition-all">
                      Edit Specs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {subTab === 'bookings' && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
              <Calendar size={32} />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">Daily Operational Dispatch</h3>
              <p className="text-sm text-slate-400 mt-1">Assign drivers, vehicles, and guides to upcoming tour departures and airport transfers.</p>
              <button className="mt-6 bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-xs font-bold py-3 px-8 rounded-xl transition-all">
                Launch Dispatch Console
              </button>
            </div>
          </div>
        )}
        
        {subTab === 'drivers' && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
              <User size={32} />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">Staff & Driver Management</h3>
              <p className="text-sm text-slate-400 mt-1">Track driver licenses, certifications, and shift availability.</p>
              <button className="mt-6 bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-xs font-bold py-3 px-8 rounded-xl transition-all">
                Manage Crew Profiles
              </button>
            </div>
          </div>
        )}

        {subTab === 'reports' && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
              <BarChart3 size={32} />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">Operational Intelligence</h3>
              <p className="text-sm text-slate-400 mt-1">Review fuel efficiency, vehicle utilization rates, and staff performance metrics.</p>
              <button className="mt-6 bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] text-xs font-bold py-3 px-8 rounded-xl transition-all">
                Generate ERP Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
