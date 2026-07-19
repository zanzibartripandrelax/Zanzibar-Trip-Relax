import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, Mail, Phone, Globe, Users, Home as HomeIcon, MessageSquare, Check, ExternalLink, Sparkles } from 'lucide-react';
import { showToast } from './ToastNotification';
import { supabase } from '../lib/supabase';

interface UnifiedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName?: string;
  category?: string;
  basePrice?: number;
}

export default function UnifiedBookingModal({
  isOpen,
  onClose,
  packageName = 'Zanzibar Day Tour',
  category = 'tour',
  basePrice = 120
}: UnifiedBookingModalProps) {
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

  // Auto-fill from localStorage if available
  useEffect(() => {
    if (isOpen) {
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
      } catch (e) {
        console.warn('Failed to parse returning user info', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const bookingId = `ZTR-${category.toUpperCase().slice(0, 3)}-${Math.floor(10000 + Math.random() * 90000)}`;
    const totalGuests = parseInt(formData.adults) + parseInt(formData.children);
    const calculatedPrice = basePrice * parseInt(formData.adults) + (basePrice * 0.5 * parseInt(formData.children));

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
      product_name: packageName,
      product_category: category,
      adults_count: parseInt(formData.adults),
      children_count: parseInt(formData.children),
      pickup_hotel: formData.hotelName.trim() || 'Stone Town Port Office',
      payment_choice: 'later',
      total_price: calculatedPrice,
      deposit_amount: 0,
      balance_remaining: calculatedPrice,
      special_requests: formData.specialRequests.trim(),
      status: 'On Hold'
    };

    // 1. Save to Supabase Bookings table
    try {
      await supabase.from('bookings').insert([
        {
          reference_code: bookingId,
          customer_name: formData.fullName.trim(),
          customer_email: formData.email.trim(),
          customer_phone: formData.whatsapp.trim(),
          product_name: packageName,
          product_category: category,
          travel_date: formData.travelDate,
          guest_count: totalGuests,
          pickup_location: formData.hotelName.trim() || 'Stone Town Port Office',
          total_price: calculatedPrice,
          payment_status: 'pending',
          status: 'pending',
          details: bookingPayload
        }
      ]);
    } catch (err) {
      console.warn('Supabase bookings write skipped:', err);
    }

    // 2. Save in Local Storage backups
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
    } catch (err) {
      console.warn('Local storage write skipped:', err);
    }

    setIsSubmitting(false);
    setBookingSuccess(bookingPayload);
    showToast(`Booking ${bookingId} created successfully!`, 'success');
  };

  const generateWhatsAppUrl = () => {
    if (!bookingSuccess) return '#';
    const message = `Hello Zanzibar Trip & Relax! I have just booked *${bookingSuccess.product_name}* via your 3-click checkout.\n\n*Booking ID:* ${bookingSuccess.id}\n*Name:* ${bookingSuccess.lead_traveler_name}\n*Date:* ${bookingSuccess.travel_date}\n*Guests:* ${bookingSuccess.adults_count} Adults, ${bookingSuccess.children_count} Children\n*Hotel:* ${bookingSuccess.pickup_hotel}\n\nPlease confirm my booking status.`;
    return `https://wa.me/255629506063?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#020C1F]/80 backdrop-blur-md"
      />

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white text-[#020C1F] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header bar */}
        <div className="bg-[#0B3B8C] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4A017] font-mono flex items-center gap-1">
              <Sparkles size={10} /> 3-Click Direct Checkout
            </span>
            <h3 className="text-sm font-bold truncate max-w-[280px]">Booking: {packageName}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form area or Success page */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!bookingSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs focus:border-[#0B3B8C] focus:bg-white outline-none text-slate-800 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs focus:border-[#0B3B8C] focus:bg-white outline-none text-slate-800 transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">WhatsApp / Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="e.g. +1 555 123 4567"
                      className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs focus:border-[#0B3B8C] focus:bg-white outline-none text-slate-800 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Country & Travel Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Country of Residence *</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={e => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g. United Kingdom"
                      className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs focus:border-[#0B3B8C] focus:bg-white outline-none text-slate-800 transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Travel Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                    <input
                      type="date"
                      required
                      value={formData.travelDate}
                      onChange={e => setFormData({ ...formData, travelDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs focus:border-[#0B3B8C] focus:bg-white outline-none text-slate-800 transition-all font-medium cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Adults & Children */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Adults</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                    <select
                      value={formData.adults}
                      onChange={e => setFormData({ ...formData, adults: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs focus:border-[#0B3B8C] focus:bg-white outline-none text-slate-800 transition-all font-medium appearance-none cursor-pointer"
                    >
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9+'].map(num => <option key={num} value={num}>{num} Adults</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Children</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                    <select
                      value={formData.children}
                      onChange={e => setFormData({ ...formData, children: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs focus:border-[#0B3B8C] focus:bg-white outline-none text-slate-800 transition-all font-medium appearance-none cursor-pointer"
                    >
                      {['0', '1', '2', '3', '4', '5+'].map(num => <option key={num} value={num}>{num} Children</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Hotel Name */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Hotel / Pickup Location *</label>
                <div className="relative">
                  <HomeIcon className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    required
                    value={formData.hotelName}
                    onChange={e => setFormData({ ...formData, hotelName: e.target.value })}
                    placeholder="e.g. Melia Zanzibar or Stone Town Port"
                    className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs focus:border-[#0B3B8C] focus:bg-white outline-none text-slate-800 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Special Requests (Optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                  <textarea
                    value={formData.specialRequests}
                    onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                    rows={2}
                    placeholder="Any specific requests, dietary notes, or preferred schedule..."
                    className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-xs focus:border-[#0B3B8C] focus:bg-white outline-none text-slate-800 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D4A017] hover:bg-[#b8860b] text-[#020C1F] font-black text-xs uppercase tracking-wider py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <span>Processing Checkout...</span>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Confirm & Book Now</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            // Success Screen
            <div className="text-center space-y-6 py-6 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check size={28} className="animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-serif font-black text-slate-900 uppercase">Booking Secured!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your direct travel request has been compiled and saved. We've instantly registered your checkout ticket with the Zanzibar Desk.
                </p>
              </div>

              {/* Ticket code card */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 max-w-sm mx-auto">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Reference Code</span>
                <span className="text-base font-mono font-black text-[#0B3B8C] block">{bookingSuccess.id}</span>
                <div className="border-t border-dashed border-slate-200 pt-2 text-[10px] text-slate-500 flex justify-between">
                  <span>Product: {bookingSuccess.product_name}</span>
                  <span>Date: {bookingSuccess.travel_date}</span>
                </div>
              </div>

              {/* Action options */}
              <div className="space-y-3 max-w-sm mx-auto pt-2">
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span>Share Ticket on WhatsApp</span>
                </a>
                
                <button
                  onClick={() => {
                    setBookingSuccess(null);
                    onClose();
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
