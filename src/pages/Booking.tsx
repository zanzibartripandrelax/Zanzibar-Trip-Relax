import React, { useState, useEffect, useMemo } from 'react';
import { Page } from '../hooks/useHashRouter';
import { AnimatePresence } from 'motion/react';
import { showToast } from '../components/ToastNotification';
import { 
  Calendar, User, Phone, Mail, CheckCircle2, Globe, Users, Home as HomeIcon,
  MessageSquare, Check, Compass, Download, ExternalLink, ArrowRight
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

  // Sync state with URL parameters or localStorage
  useEffect(() => {
    const prefilledFromStorage = localStorage.getItem('booking_prefilled_tour');
    const packageParam = queryParams?.package || queryParams?.id || queryParams?.product || queryParams?.tour || queryParams?.safari || prefilledFromStorage;
    
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
          category: queryParams?.category || localStorage.getItem('booking_prefilled_category') || 'tour',
          description: 'Custom selected Zanzibar itinerary request.'
        });
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
          fullName: parsed.name || prev.fullName,
          email: parsed.email || prev.email,
          whatsapp: parsed.phone || parsed.whatsapp || prev.whatsapp,
          hotelName: parsed.pickupLocation || prev.hotelName
        }));
      }
    } catch (err) {
      console.warn('Failed to pre-fill returning client info', err);
    }
  }, []);

  const totalGuests = useMemo(() => {
    return parseInt(formData.adults, 10) + parseInt(formData.children, 10);
  }, [formData.adults, formData.children]);

  const estimatedTotalCost = useMemo(() => {
    if (!selectedPackage) return 0;
    const price = selectedPackage.basePrice;
    return price * parseInt(formData.adults, 10) + (price * 0.5 * parseInt(formData.children, 10));
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
      lead_traveler_name: formData.fullName.trim() || 'Guest Traveler',
      lead_traveler_email: formData.email.trim() || 'Not provided',
      lead_traveler_phone: formData.whatsapp.trim(),
      lead_traveler_whatsapp: formData.whatsapp.trim(),
      nationality: formData.country.trim() || 'International',
      travel_date: formData.travelDate,
      product_name: selectedPackage.name,
      product_category: selectedPackage.category,
      adults_count: parseInt(formData.adults, 10),
      children_count: parseInt(formData.children, 10),
      pickup_hotel: formData.hotelName.trim() || 'Stone Town Port / Airport',
      payment_choice: 'later',
      total_price: estimatedTotalCost,
      special_requests: formData.specialRequests.trim(),
      status: 'Pending Confirmation' // Status Rule 4
    };

    // 1. Insert directly into Supabase 'bookings' table
    try {
      await supabase.from('bookings').insert([
        {
          reference_code: bookingId,
          customer_name: formData.fullName.trim() || 'Guest Traveler',
          customer_email: formData.email.trim() || null,
          customer_phone: formData.whatsapp.trim(),
          product_name: selectedPackage.name,
          product_category: selectedPackage.category,
          travel_date: formData.travelDate,
          guest_count: totalGuests,
          pickup_location: formData.hotelName.trim() || 'Stone Town Port / Airport',
          total_price: estimatedTotalCost,
          payment_status: 'pending',
          status: 'Pending Confirmation',
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
    showToast(`Booking ${bookingId} Submitted Successfully!`, 'success');
  };

  const generateWhatsAppUrl = () => {
    if (!bookingSuccess) return '#';
    const msg = `Hello Zanzibar Trip & Relax! I have submitted my booking for *${bookingSuccess.product_name}* (Ref: ${bookingSuccess.id}).\n\n*Traveler:* ${bookingSuccess.lead_traveler_name}\n*Date:* ${bookingSuccess.travel_date}\n*Guests:* ${bookingSuccess.adults_count} Adults, ${bookingSuccess.children_count} Children\n*Hotel:* ${bookingSuccess.pickup_hotel}\n\nPlease review and send my pickup confirmation.`;
    return `https://wa.me/255629506063?text=${encodeURIComponent(msg)}`;
  };

  const currentStep = bookingSuccess ? 3 : (selectedPackage && formData.fullName ? 2 : 1);

  return (
    <div className="bg-[#020C1F] text-white min-h-screen pt-24 pb-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Step Header & Progress (Rule 10: Step 1: Guest Details -> Step 2: Booking Review -> Step 3: Booking Submitted) */}
        <div className="text-center space-y-4">
          <span className="text-[10px] bg-[#D4A017]/15 text-[#D4A017] uppercase tracking-[0.25em] font-black px-4 py-1.5 rounded-full border border-[#D4A017]/20">
            Zanzibar Trip & Relax
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white uppercase leading-none">
            Reservation Progress
          </h1>

          {/* Clean Stepper Bar (Rule 10) */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-xl mx-auto pt-2 text-xs font-bold">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${currentStep >= 1 ? 'bg-[#D4A017] text-[#020C1F] border-[#D4A017]' : 'bg-white/5 text-slate-400 border-white/10'}`}>
              <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">1</span>
              <span>Guest Details</span>
            </div>

            <span className="text-slate-600">↓</span>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${currentStep >= 2 ? 'bg-[#D4A017] text-[#020C1F] border-[#D4A017]' : 'bg-white/5 text-slate-400 border-white/10'}`}>
              <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">2</span>
              <span>Booking Review</span>
            </div>

            <span className="text-slate-600">↓</span>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${currentStep === 3 ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white/5 text-slate-400 border-white/10'}`}>
              <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">3</span>
              <span>Booking Submitted</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!bookingSuccess ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
              
              {/* Left Column: Selected Excursion Card (Col-4) */}
              <div className="lg:col-span-5 bg-[#0A1224] border border-white/10 rounded-3xl p-6 space-y-5 shadow-xl">
                <h3 className="text-xs font-black text-[#D4A017] uppercase tracking-wider">
                  Step 1: Experience Selection
                </h3>
                
                {selectedPackage ? (
                  <div className="space-y-4">
                    <div className="h-44 rounded-2xl overflow-hidden relative border border-white/10 shadow-inner">
                      <img 
                        src={selectedPackage.image} 
                        alt={selectedPackage.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-3 bg-[#D4A017] text-[#020C1F] text-[9px] font-black uppercase px-2.5 py-1 rounded-full">
                        {selectedPackage.category}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-serif font-bold text-white leading-tight">{selectedPackage.name}</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">{selectedPackage.description}</p>
                    </div>

                    <div className="border-t border-dashed border-white/10 pt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-light">Duration</span>
                        <span className="font-bold text-slate-200">{selectedPackage.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-light">Rate / Guest</span>
                        <span className="font-bold text-slate-200">${selectedPackage.basePrice} USD</span>
                      </div>
                    </div>

                    <div className="bg-[#D4A017]/10 border border-[#D4A017]/20 p-3 rounded-2xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Estimated Total Price</span>
                      <span className="text-2xl font-mono font-black text-[#D4A017] block">${estimatedTotalCost} USD</span>
                      <span className="text-[10px] text-emerald-400 italic font-medium block mt-0.5">Pay later on arrival • No credit card needed</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPackage(null)}
                      className="w-full text-center text-slate-400 hover:text-white text-[10px] font-bold uppercase tracking-wider hover:underline transition-all cursor-pointer"
                    >
                      Choose Different Excursion
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Please pick your preferred excursion or private luxury stay:
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

              {/* Right Column: Guest Information & Review (Col-7) */}
              <div className="lg:col-span-7 bg-[#0A1224] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <h3 className="text-xs font-black text-[#D4A017] uppercase tracking-wider">
                  Step 2: Guest Details & Review
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
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
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">WhatsApp / Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                        <input
                          type="tel"
                          required
                          value={formData.whatsapp}
                          onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                          placeholder="e.g. +255 629 506 063"
                          className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-[#D4A017] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address (Optional)</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-[#D4A017] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Country & Travel Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Country of Residence</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                        <input
                          type="text"
                          value={formData.country}
                          onChange={e => setFormData({ ...formData, country: e.target.value })}
                          placeholder="United Kingdom"
                          className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-[#D4A017] transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Travel Date *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
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
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Adults</label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
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
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Children</label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hotel / Pickup Location *</label>
                    <div className="relative">
                      <HomeIcon className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Special Requests (Optional)</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                      <textarea
                        value={formData.specialRequests}
                        onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                        rows={2}
                        placeholder="Dietary requests, flight numbers, child seats..."
                        className="w-full bg-[#0C1930] border border-white/10 py-3 pl-10 pr-4 rounded-xl text-xs text-white outline-none focus:border-[#D4A017] transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedPackage}
                    className="w-full bg-[#D4A017] hover:bg-amber-400 text-[#020C1F] font-black uppercase text-xs tracking-wider py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pt-4"
                  >
                    {isSubmitting ? (
                      <span>Saving Booking...</span>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Submit Reservation</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="max-w-lg mx-auto bg-[#0A1224] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-200 shadow-2xl animate-scale-up">
              {/* STEP 3: BOOKING SUBMITTED (Rule 3 & Rule 10) */}
              
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-serif font-black text-white uppercase tracking-tight">
                  Booking Received
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Thank you for booking with Zanzibar Trip & Relax. Your reservation has been received successfully.
                </p>
              </div>

              {/* Reference Number Card (Rule 3) */}
              <div className="bg-[#0C1930] border border-white/10 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Booking Reference Number</span>
                <span className="text-2xl font-mono font-black text-[#D4A017] block">{bookingSuccess.id}</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  Status: Pending Confirmation
                </span>
              </div>

              {/* What Happens Next Explanation (Rule 3) */}
              <div className="space-y-3 text-xs bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="font-bold text-slate-100">
                  Our Reservations Team will personally review your booking and send:
                </p>
                <ul className="space-y-1 text-slate-300 font-medium pl-1">
                  <li>• Pickup Time</li>
                  <li>• Driver Details</li>
                  <li>• Guide Information</li>
                  <li>• Final Confirmation</li>
                  <li>• Payment Instructions (if required)</li>
                </ul>
                
                <div className="border-t border-white/10 pt-2 text-slate-300 font-semibold space-y-0.5">
                  <p>You will receive these details via:</p>
                  <p className="text-emerald-400">✓ WhatsApp</p>
                  <p className="text-emerald-400">✓ Email (if provided)</p>
                </div>
              </div>

              {/* Action Buttons (Rule 3) */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink size={15} fill="white" />
                  <span>Follow-up on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Booking Summary</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBookingSuccess(null);
                    setSelectedPackage(null);
                    navigate('home');
                  }}
                  className="w-full text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider py-2 text-center underline cursor-pointer"
                >
                  Track Booking / Return to Home
                </button>
              </div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
