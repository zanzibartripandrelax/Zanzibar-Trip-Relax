import React, { useState, useEffect, useMemo } from 'react';
import { Page } from '../hooks/useHashRouter';
import { motion, AnimatePresence } from 'motion/react';
import { showToast } from '../components/ToastNotification';
import { 
  Calendar, User, Phone, Mail, CheckCircle2, Globe, Users, Home as HomeIcon,
  MessageSquare, Check, Sparkles, MapPin, Star, Clock, Compass, ArrowRight, ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCMSStore, getHotels } from '../lib/cmsStore';
import { allPackages } from '../data/bookingData';

interface BookingProps {
  navigate: (page: Page, id?: string) => void;
  queryParams?: Record<string, string>;
}

export default function Booking({ navigate, queryParams }: BookingProps) {
  const content = useCMSStore();
  const hotelsList = useMemo(() => getHotels(), []);

  // 1. Gather all possible booking packages across Tours, Holiday Packages, Safaris, and Kilimanjaro
  const allExperiences = useMemo(() => {
    const cmsList = (content.tours || []).map(t => {
      let cat = 'tour';
      if (t.category === 'package' || t.category === 'packages') cat = 'packages';
      else if (t.category === 'safari') cat = 'safari';
      else if (t.category === 'kilimanjaro') cat = 'kilimanjaro';
      else if (t.category === 'transfer') cat = 'transfer';

      return {
        id: t.id,
        name: t.title,
        basePrice: typeof t.price === 'number' ? t.price : parseFloat(String(t.price).replace(/[^0-9.]/g, '')) || 120,
        duration: t.duration || 'Flexible Day Tour',
        image: t.img || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
        category: cat,
        description: t.shortDesc || 'Custom guided private tracking excursion.'
      };
    });

    const staticList = allPackages.map(p => ({
      id: p.id,
      name: p.name,
      basePrice: p.basePrice || 150,
      duration: p.duration || 'Flexible',
      image: p.image || 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600',
      category: p.category || 'packages',
      description: p.description || 'Premium tropical Swahili coast holiday retreat.'
    }));

    // Merge lists by name key to avoid duplication
    const merged = [...cmsList];
    for (const item of staticList) {
      if (!merged.some(m => (m?.name || '').toLowerCase() === (item?.name || '').toLowerCase())) {
        merged.push(item);
      }
    }

    // Add hotels as bookable items
    for (const h of hotelsList) {
      merged.push({
        id: h.id,
        name: `Luxury Stay: ${h.name}`,
        basePrice: (h as any).price || 180,
        duration: 'Per Night Stay',
        image: h.image || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80',
        category: 'hotel',
        description: `${(h as any).location || h.zoneId || 'Zanzibar'} • Premium luxury oceanside resort stay.`
      });
    }

    return merged;
  }, [content.tours, hotelsList]);

  // Selected package state
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);

  // Form input states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    country: '',
    travelDate: '',
    adults: '2',
    children: '0',
    hotelName: '',
    specialRequests: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Set default tomorrow date picker
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    setFormData(prev => ({
      ...prev,
      travelDate: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  // Sync state with URL parameters
  useEffect(() => {
    if (queryParams && Object.keys(queryParams).length > 0) {
      const packageParam = queryParams.package || queryParams.id || queryParams.product || queryParams.tour || queryParams.safari;
      if (packageParam) {
        const decodedParam = decodeURIComponent(packageParam).trim().toLowerCase();
        const matched = allExperiences.find(exp => 
          (exp?.id || '').toLowerCase() === decodedParam || 
          (exp?.name || '').toLowerCase() === decodedParam
        );
        if (matched) {
          setSelectedPackage(matched);
        } else {
          // If no direct ID matches, create custom prefilled option
          setSelectedPackage({
            id: 'custom-package',
            name: decodeURIComponent(packageParam),
            basePrice: 150,
            duration: 'Custom Request',
            image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
            category: queryParams.category || 'tour',
            description: 'Custom selected Zanzibar itinerary request.'
          });
        }
      }
    }
  }, [queryParams, allExperiences]);

  // Load returning user data if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ztr_returning_user_info');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          fullName: parsed.name || '',
          email: parsed.email || '',
          whatsapp: parsed.phone || parsed.whatsapp || '',
          hotelName: parsed.pickupLocation || ''
        }));
      }
    } catch (err) {
      console.warn('Failed to pre-fill returning client dossier', err);
    }
  }, []);

  const totalGuests = useMemo(() => {
    return parseInt(formData.adults) + parseInt(formData.children);
  }, [formData.adults, formData.children]);

  const estimatedTotalCost = useMemo(() => {
    if (!selectedPackage) return 0;
    const price = selectedPackage.basePrice;
    return price * parseInt(formData.adults) + (price * 0.5 * parseInt(formData.children));
  }, [selectedPackage, formData.adults, formData.children]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) {
      showToast('Please select an excursion package first.', 'error');
      return;
    }

    setIsSubmitting(true);
    const bookingId = `ZTR-${selectedPackage.category.toUpperCase().slice(0, 3)}-${Math.floor(10000 + Math.random() * 90000)}`;

    const bookingPayload = {
      id: bookingId,
      reference: bookingId,
      created_at: new Date().toISOString(),
      lead_traveler_name: formData.fullName.trim(),
      lead_traveler_email: formData.email.trim(),
      lead_traveler_phone: formData.whatsapp.trim(),
      lead_traveler_whatsapp: formData.whatsapp.trim(),
      nationality: formData.country.trim(),
      travel_date: formData.travelDate,
      product_name: selectedPackage.name,
      product_category: selectedPackage.category,
      adults_count: parseInt(formData.adults),
      children_count: parseInt(formData.children),
      pickup_hotel: formData.hotelName.trim() || 'Stone Town Port / Airport',
      payment_choice: 'later',
      total_price: estimatedTotalCost,
      deposit_amount: 0,
      balance_remaining: estimatedTotalCost,
      special_requests: formData.specialRequests.trim(),
      status: 'On Hold'
    };

    // 1. Insert directly into Supabase 'bookings' table
    try {
      await supabase.from('bookings').insert([
        {
          reference_code: bookingId,
          customer_name: formData.fullName.trim(),
          customer_email: formData.email.trim(),
          customer_phone: formData.whatsapp.trim(),
          product_name: selectedPackage.name,
          product_category: selectedPackage.category,
          travel_date: formData.travelDate,
          guest_count: totalGuests,
          pickup_location: formData.hotelName.trim() || 'Stone Town Port / Airport',
          total_price: estimatedTotalCost,
          payment_status: 'pending',
          status: 'pending',
          details: bookingPayload
        }
      ]);
    } catch (supabaseErr) {
      console.warn('Supabase bookings writing skipped:', supabaseErr);
    }

    // 2. Save in Local Storage Backups
    try {
      const existing = JSON.parse(localStorage.getItem('ztr_local_bookings_backup') || '[]');
      localStorage.setItem('ztr_local_bookings_backup', JSON.stringify([bookingPayload, ...existing]));
      localStorage.setItem('ztr_bookings', JSON.stringify([bookingPayload, ...existing]));

      // Save user details for their next visit
      localStorage.setItem('ztr_returning_user_info', JSON.stringify({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.whatsapp.trim(),
        pickupLocation: formData.hotelName.trim()
      }));
    } catch (localStorageErr) {
      console.warn('LocalStorage backup skipped:', localStorageErr);
    }

    setIsSubmitting(false);
    setBookingSuccess(bookingPayload);
    showToast(`Direct Booking ${bookingId} Secured Successfully!`, 'success');
  };

  const generateWhatsAppUrl = () => {
    if (!bookingSuccess) return '#';
    const msg = `Hello Zanzibar Trip & Relax! I have secured my booking for *${bookingSuccess.product_name}* via your simplified portal.\n\n*Booking ID:* ${bookingSuccess.id}\n*Client:* ${bookingSuccess.lead_traveler_name}\n*Date:* ${bookingSuccess.travel_date}\n*Guests:* ${bookingSuccess.adults_count} Adults, ${bookingSuccess.children_count} Children\n*Hotel:* ${bookingSuccess.pickup_hotel}\n\nPlease confirm my direct checkout ticket.`;
    return `https://wa.me/255629506063?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="bg-[#020C1F] text-white min-h-screen pt-24 pb-16 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Step Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] bg-[#D4A017]/15 text-[#D4A017] uppercase tracking-[0.25em] font-black px-4 py-1.5 rounded-full border border-[#D4A017]/20">
            Secure Direct Checkout
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white uppercase leading-none">
            3-CLICK CHECKOUT
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-light max-w-md mx-auto leading-relaxed">
            Secure your Zanzibar adventure in minutes. No credit cards required upfront. Lock your travel dates and pay directly on arrival.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!bookingSuccess ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">
              
              {/* Left Column: Experience Selection Summary */}
              <div className="lg:col-span-1 bg-[#0A1224] border border-white/5 rounded-3xl p-6 space-y-6">
                <h3 className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">1. Experience Selected</h3>
                
                {selectedPackage ? (
                  <div className="space-y-4">
                    <div className="h-44 rounded-2xl overflow-hidden relative border border-white/5 shadow-inner">
                      <img 
                        src={selectedPackage.image} 
                        alt={selectedPackage.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 bg-[#D4A017] text-[#020C1F] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        {selectedPackage.category}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-sm font-serif font-bold text-white tracking-tight">{selectedPackage.name}</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">{selectedPackage.description}</p>
                    </div>

                    <div className="border-t border-dashed border-white/10 pt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-light">Duration</span>
                        <span className="font-bold text-slate-200">{selectedPackage.duration}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-light">Base Rate</span>
                        <span className="font-bold text-slate-200">${selectedPackage.basePrice} USD / Adult</span>
                      </div>
                    </div>

                    <div className="bg-[#D4A017]/5 border border-[#D4A017]/10 p-3 rounded-xl text-center">
                      <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Estimated Checkout Total</span>
                      <span className="text-xl font-mono font-black text-[#D4A017] block">${estimatedTotalCost} USD</span>
                      <span className="text-[9px] text-slate-400 italic font-light block mt-0.5">Pay later upon arrival</span>
                    </div>

                    <button
                      onClick={() => setSelectedPackage(null)}
                      className="w-full text-center text-red-400 hover:text-red-300 text-[10px] font-bold uppercase tracking-wider hover:underline transition-all cursor-pointer"
                    >
                      Change Excursion Choice
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      Please pick your preferred excursion or private luxury hotel stay from our direct directory listing beneath:
                    </p>
                    <div className="relative">
                      <Compass className="absolute left-3.5 top-3.5 text-slate-450" size={14} />
                      <select
                        onChange={(e) => {
                          const matched = allExperiences.find(exp => exp.id === e.target.value);
                          if (matched) setSelectedPackage(matched);
                        }}
                        className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-slate-200 outline-none focus:border-[#D4A017] transition-all cursor-pointer appearance-none"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Select Excursion or Stay --</option>
                        {allExperiences.map(exp => (
                          <option key={exp.id} value={exp.id}>
                            {exp.name} (${exp.basePrice} USD)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Required Checkout Fields Form */}
              <div className="lg:col-span-2 bg-[#0A1224] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-xs font-bold text-[#D4A017] uppercase tracking-wider">2. Provide Travel Dossier Details</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 text-slate-450" size={14} />
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-[#D4A017] transition-all"
                      />
                    </div>
                  </div>

                  {/* Email & WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 text-slate-450" size={14} />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-[#D4A017] transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp / Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 text-slate-450" size={14} />
                        <input
                          type="tel"
                          required
                          value={formData.whatsapp}
                          onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                          placeholder="e.g. +1 555 123 4567"
                          className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-[#D4A017] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Country & Travel Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Country of Residence *</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-3.5 text-slate-450" size={14} />
                        <input
                          type="text"
                          required
                          value={formData.country}
                          onChange={e => setFormData({ ...formData, country: e.target.value })}
                          placeholder="United Kingdom"
                          className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-[#D4A017] transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Travel Date *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3.5 text-slate-450" size={14} />
                        <input
                          type="date"
                          required
                          value={formData.travelDate}
                          onChange={e => setFormData({ ...formData, travelDate: e.target.value })}
                          className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-[#D4A017] transition-all cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Adults & Children */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Adults</label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-3.5 text-slate-450" size={14} />
                        <select
                          value={formData.adults}
                          onChange={e => setFormData({ ...formData, adults: e.target.value })}
                          className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-slate-200 outline-none focus:border-[#D4A017] transition-all cursor-pointer"
                        >
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9+'].map(n => <option key={n} value={n}>{n} Adults</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Children</label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-3.5 text-slate-450" size={14} />
                        <select
                          value={formData.children}
                          onChange={e => setFormData({ ...formData, children: e.target.value })}
                          className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-slate-200 outline-none focus:border-[#D4A017] transition-all cursor-pointer"
                        >
                          {['0', '1', '2', '3', '4', '5+'].map(n => <option key={n} value={n}>{n} Children</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Hotel / Pickup location */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hotel / Pickup Location *</label>
                    <div className="relative">
                      <HomeIcon className="absolute left-3.5 top-3.5 text-slate-450" size={14} />
                      <input
                        type="text"
                        required
                        value={formData.hotelName}
                        onChange={e => setFormData({ ...formData, hotelName: e.target.value })}
                        placeholder="e.g. Melia Resort Zanzibar or Stone Town Port"
                        className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-[#D4A017] transition-all"
                      />
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Special Requests (Optional)</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3.5 text-slate-450" size={14} />
                      <textarea
                        value={formData.specialRequests}
                        onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                        rows={3}
                        placeholder="Any flight numbers, dietary restrictions, child age configurations..."
                        className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-[#D4A017] transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedPackage}
                    className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black uppercase text-xs tracking-wider py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pt-4"
                  >
                    {isSubmitting ? (
                      <span>Saving Secure Booking...</span>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Confirm & Submit Booking Ticket</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          ) : (
            // Breathtaking Success Screen
            <div className="max-w-md mx-auto bg-[#0A1224] border border-white/5 rounded-3xl p-8 text-center space-y-6 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} className="animate-bounce" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-serif font-black text-white uppercase tracking-tight">Booking Secured!</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Excellent choice! Your checkout has been locked with the Zanzibar desk. A ticketing reference code has been dynamically compiled.
                </p>
              </div>

              {/* Dynamic Ticket code card */}
              <div className="bg-[#0C1930] border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                <span className="text-[9px] text-slate-500 uppercase tracking-[0.25em] font-black block">System Reference Code</span>
                <span className="text-xl font-mono font-black text-[#D4A017] block">{bookingSuccess.id}</span>
                
                <div className="border-t border-dashed border-white/10 pt-3 text-[10px] text-slate-400 flex flex-col items-center gap-1 font-light">
                  <span>Experience: {bookingSuccess.product_name}</span>
                  <span>Lead Traveler: {bookingSuccess.lead_traveler_name}</span>
                  <span>Date Locked: {bookingSuccess.travel_date}</span>
                </div>
              </div>

              {/* Action operations */}
              <div className="space-y-3 pt-2">
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span>Share Ticket on WhatsApp</span>
                </a>
                
                <button
                  onClick={() => {
                    setBookingSuccess(null);
                    setSelectedPackage(null);
                    navigate('home');
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
