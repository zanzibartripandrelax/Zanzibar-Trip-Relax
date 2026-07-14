import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, MapPin, Download, Save, MessageSquare, Star, Trash2, Shield, PhoneCall, Check, X, AlertCircle } from 'lucide-react';
import { showToast } from './ToastNotification';

interface TransferTrackerProps {
  onBackToBooking?: () => void;
}

export default function TransferTracker({ onBackToBooking }: TransferTrackerProps) {
  const [searchRef, setSearchRef] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [foundBooking, setFoundBooking] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit fields state
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editFlight, setEditFlight] = useState('');
  const [editHotel, setEditHotel] = useState('');
  const [editMsg, setEditMsg] = useState('');

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  // Load sample reference from URL if present (hash route parameters etc.)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('ref=')) {
      const parts = hash.split('ref=');
      if (parts[1]) {
        setSearchRef(parts[1].split('&')[0]);
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRef.trim() && !searchEmail.trim()) {
      showToast('Please enter a booking reference or registered email', 'error');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      // Look in both local list keys
      const bookings = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
      const backupBookings = JSON.parse(localStorage.getItem('ztr_local_bookings_backup') || '[]');
      const allMerged = [...bookings, ...backupBookings];

      const found = allMerged.find((b: any) => {
        const matchesRef = searchRef ? (b.id?.toLowerCase() === searchRef.toLowerCase() || b.reference?.toLowerCase() === searchRef.toLowerCase() || b.reference_code?.toLowerCase() === searchRef.toLowerCase()) : false;
        const matchesEmail = searchEmail ? (b.email?.toLowerCase() === searchEmail.trim().toLowerCase() || b.lead_traveler_email?.toLowerCase() === searchEmail.trim().toLowerCase()) : false;
        return matchesRef || matchesEmail;
      });

      if (found) {
        setFoundBooking(found);
        setEditDate(found.pickup_date || found.preferred_date || found.travel_date || '');
        setEditTime(found.pickup_time || found.pickup_time || '12:00');
        setEditFlight(found.flight_no || found.flightNo || '');
        setEditHotel(found.hotel_name || found.pickup_location || found.hotelName || '');
        setEditMsg(found.message || found.special_requests || '');
        setHasReviewed(false);
        showToast('Reservation retrieved successfully!', 'success');
      } else {
        showToast('No matching active transfer reservation found.', 'error');
      }
      setIsSearching(false);
    }, 800);
  };

  const handleUpdateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundBooking) return;

    setIsSaving(true);
    setTimeout(() => {
      const bookings = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
      
      // Update target booking in array
      const updatedList = bookings.map((b: any) => {
        if (b.id === foundBooking.id || b.reference === foundBooking.reference || b.reference_code === foundBooking.reference_code) {
          return {
            ...b,
            pickup_date: editDate,
            preferred_date: editDate,
            travel_date: editDate,
            pickup_time: editTime,
            flight_no: editFlight,
            flightNo: editFlight,
            hotel_name: editHotel,
            pickup_location: editHotel,
            message: editMsg,
            special_requests: editMsg
          };
        }
        return b;
      });

      localStorage.setItem('ztr_bookings', JSON.stringify(updatedList));

      // Also update backup if present
      const backup = JSON.parse(localStorage.getItem('ztr_local_bookings_backup') || '[]');
      const updatedBackup = backup.map((b: any) => {
        if (b.reference === foundBooking.reference || b.id === foundBooking.id) {
          return {
            ...b,
            travel_date: editDate,
            pickup_time: editTime,
            flightNo: editFlight,
            pickup_hotel: editHotel,
            special_requests: editMsg
          };
        }
        return b;
      });
      localStorage.setItem('ztr_local_bookings_backup', JSON.stringify(updatedBackup));

      // Log action
      const logs = JSON.parse(localStorage.getItem('ztr_activity_logs') || '[]');
      const newLog = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: foundBooking.full_name || foundBooking.customer_name || 'Guest',
        role: 'Guest',
        action: `Modified transfer booking ${foundBooking.id || foundBooking.reference} logistics details.`
      };
      localStorage.setItem('ztr_activity_logs', JSON.stringify([newLog, ...logs]));

      setFoundBooking({
        ...foundBooking,
        pickup_date: editDate,
        preferred_date: editDate,
        pickup_time: editTime,
        flight_no: editFlight,
        hotel_name: editHotel,
        message: editMsg
      });

      setIsSaving(false);
      showToast('Your transfer details have been rescheduled!', 'success');
    }, 1000);
  };

  const handleCancelBooking = () => {
    if (!foundBooking) return;
    
    // Check if within 24 hours prior
    const rideDateStr = editDate;
    const rideTimeStr = editTime;
    const rideDateTime = new Date(`${rideDateStr}T${rideTimeStr}`);
    const timeDiffMs = rideDateTime.getTime() - Date.now();
    const hoursRemaining = timeDiffMs / (1000 * 60 * 60);

    const isRefundable = hoursRemaining > 24;

    const message = isRefundable 
      ? "Are you sure you want to cancel this transfer booking? You are within the 24-hour free cancellation window. A full refund will be processed."
      : "Warning: Your transfer is scheduled in less than 24 hours. Cancellation may incur an administrative fee. Proceed with cancellation request?";

    if (confirm(message)) {
      const bookings = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
      const updatedList = bookings.map((b: any) => {
        if (b.id === foundBooking.id || b.reference === foundBooking.reference || b.reference_code === foundBooking.reference_code) {
          return { ...b, status: 'Cancelled' };
        }
        return b;
      });
      localStorage.setItem('ztr_bookings', JSON.stringify(updatedList));

      // Activity logs
      const logs = JSON.parse(localStorage.getItem('ztr_activity_logs') || '[]');
      const newLog = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: foundBooking.full_name || foundBooking.customer_name || 'Guest',
        role: 'Guest',
        action: `Cancelled transfer booking ${foundBooking.id || foundBooking.reference_code}`
      };
      localStorage.setItem('ztr_activity_logs', JSON.stringify([newLog, ...logs]));

      setFoundBooking({ ...foundBooking, status: 'Cancelled' });
      showToast('Transfer booking cancelled successfully.', 'info');
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    // Save review to local reviews registry
    const reviews = JSON.parse(localStorage.getItem('ztr_customer_reviews') || '[]');
    const newReview = {
      id: `rev-${Date.now()}`,
      bookingId: foundBooking.id || foundBooking.reference_code,
      customerName: foundBooking.full_name || foundBooking.customer_name,
      rating: reviewRating,
      text: reviewText,
      category: 'transfer',
      date: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem('ztr_customer_reviews', JSON.stringify([newReview, ...reviews]));

    setHasReviewed(true);
    showToast('Thank you for your valuable feedback!', 'success');
  };

  const handleDownloadVoucher = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Search Bar console */}
      {!foundBooking && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-[#0B3B8C] font-serif">Manage & Track Your Transfers</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              Modify schedules, view assigned vehicles, print transfer vouchers, or coordinate support logs effortlessly.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Booking Reference ID</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. ZTR-TR-29381"
                    value={searchRef}
                    onChange={(e) => setSearchRef(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5">Registered Email</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-[#0B3B8C] hover:bg-blue-900 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow"
            >
              <span>{isSearching ? 'Retrieving Ledger Details...' : 'Lookup Transfer Booking'}</span>
            </button>

            {onBackToBooking && (
              <button
                type="button"
                onClick={onBackToBooking}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs text-center cursor-pointer transition-all"
              >
                ← Back to Booking Terminal
              </button>
            )}
          </form>
        </div>
      )}

      {/* Booking Details Sheet */}
      {foundBooking && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          
          {/* Left panel: Reschedule and modification */}
          <div className="lg:col-span-7 space-y-6 print:hidden">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-extrabold text-[#0B3B8C] text-sm flex items-center gap-2">
                  <Calendar size={16} className="text-[#D4A017]" />
                  <span>Reschedule & Edit Transfer Logistics</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setFoundBooking(null)}
                  className="text-xs text-[#0B3B8C] font-black hover:underline"
                >
                  Change Reference ID
                </button>
              </div>

              {foundBooking.status === 'Cancelled' ? (
                <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Transfer Reservation Cancelled</h4>
                    <p className="mt-1">This transfer trip has been marked as Cancelled. Scheduling edits are no longer accepted. For refunds, contact customer support.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateBooking} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Pickup Date</label>
                      <input
                        type="date"
                        required
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Pickup Time</label>
                      <input
                        type="time"
                        required
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Flight / Vessel No</label>
                      <input
                        type="text"
                        value={editFlight}
                        onChange={(e) => setEditFlight(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800 bg-slate-50"
                        placeholder="e.g. QR149"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Hotel or Specific Address</label>
                      <input
                        type="text"
                        value={editHotel}
                        onChange={(e) => setEditHotel(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800 bg-slate-50"
                        placeholder="e.g. Essque Zalu Hotel"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Special Dispatch Notes / Requests</label>
                    <textarea
                      value={editMsg}
                      onChange={(e) => setEditMsg(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800 bg-slate-50"
                      placeholder="e.g. Requires toddler baby booster seats"
                    />
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-[#0B3B8C] hover:bg-blue-900 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Save size={14} />
                      <span>{isSaving ? 'Rescheduling...' : 'Apply Reschedule Logs'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelBooking}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-rose-200"
                    >
                      <Trash2 size={14} />
                      <span>Cancel Reservation</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Leave excursion feedback/review */}
            {foundBooking.status !== 'Cancelled' && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h4 className="font-extrabold text-[#0B3B8C] text-sm flex items-center gap-2">
                  <Star size={16} className="text-[#D4A017] fill-current" />
                  <span>Submit Zanzibar Ride Excursion Feedback</span>
                </h4>

                {hasReviewed ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-xs text-center font-bold">
                    Thank you! Your verified five-star Swahili feedback has been filed in our public CMS.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                    <div className="flex gap-2 items-center">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Select Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-[#D4A017] p-1 transition-all"
                        >
                          <Star size={18} className={star <= reviewRating ? 'fill-current' : 'opacity-30'} />
                        </button>
                      ))}
                    </div>

                    <textarea
                      required
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share details about your transfer ride experience with Zanzibar Trip & Relax..."
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 font-medium"
                    />

                    <button
                      type="submit"
                      className="bg-[#D4A017] hover:bg-[#b5880c] text-[#020C1F] font-black uppercase px-6 py-2.5 rounded-xl text-[10px]"
                    >
                      Publish Public Ride Review
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right panel: Digital transfer voucher display & download */}
          <div className="lg:col-span-5 space-y-6 print:col-span-12 print:w-full">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 space-y-6 relative overflow-hidden" id="print-voucher">
              {/* Receipt Watermark and Header */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B3B8C]/5 rounded-full -translate-y-10 translate-x-10 pointer-events-none" />
              
              <div className="text-center pb-4 border-b border-dashed border-slate-200">
                <span className="text-[#D4A017] font-extrabold uppercase text-[9px] tracking-widest block mb-1">Zanzibar Trip & Relax</span>
                <h4 className="text-lg font-black text-[#0B3B8C] font-serif">OFFICIAL TRAVEL VOUCHER</h4>
                <div className="mt-2 inline-block bg-slate-100 font-mono text-[10px] font-extrabold px-3 py-0.5 rounded-full border text-slate-700">
                  REF: {foundBooking.id || foundBooking.reference || foundBooking.reference_code}
                </div>
              </div>

              {/* Status and dates block */}
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Voucher Status</span>
                  <span className={`font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                    foundBooking.status?.toLowerCase() === 'confirmed' || foundBooking.status?.toLowerCase() === 'secured'
                      ? 'bg-emerald-100 text-emerald-800'
                      : foundBooking.status?.toLowerCase() === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                  }`}>
                    {foundBooking.status || 'Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-slate-400 font-mono text-[9px] uppercase block">Lead Passenger</span>
                    <span className="font-extrabold text-slate-800 text-xs block truncate">{foundBooking.full_name || foundBooking.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[9px] uppercase block">WhatsApp Link</span>
                    <span className="font-bold text-slate-800 text-xs block truncate">{foundBooking.whatsapp_number || foundBooking.customer_phone}</span>
                  </div>
                </div>

                <div className="space-y-2 border-b pb-4">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-rose-500 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase block font-mono">Pickup Zone Coordinate</span>
                      <span className="font-extrabold text-slate-800">{foundBooking.pickup || foundBooking.pickup_location}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[#0B3B8C] mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase block font-mono">Drop-off Destination</span>
                      <span className="font-extrabold text-slate-800">{foundBooking.destination || 'Selected Beach Resort Area'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-slate-400 font-mono text-[9px] uppercase block">Transfer Schedule</span>
                    <span className="font-extrabold text-slate-800">{editDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[9px] uppercase block">Assigned Time</span>
                    <span className="font-extrabold text-[#D4A017]">{editTime}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-slate-400 font-mono text-[9px] uppercase block">Travelers Count</span>
                    <span className="font-extrabold text-slate-800">{foundBooking.number_of_guests || 2} Pax</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-mono text-[9px] uppercase block">Flight/Vessel No</span>
                    <span className="font-extrabold text-slate-800">{editFlight || 'Not Listed'}</span>
                  </div>
                </div>

                {foundBooking.vehicle_name && (
                  <div className="bg-slate-50 border p-3 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Selected Vehicle Fleet</span>
                    <p className="font-extrabold text-slate-700">{foundBooking.vehicle_name}</p>
                  </div>
                )}

                {foundBooking.driver_name && (
                  <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 p-3 rounded-xl">
                    <img 
                      src={foundBooking.driver_photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=compress&cs=tinysrgb&w=100"} 
                      alt="Driver portrait" 
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <span className="text-[9px] text-blue-500 uppercase font-mono block">Professional Chauffeur</span>
                      <p className="font-extrabold text-slate-800">{foundBooking.driver_name}</p>
                      <p className="text-[10px] text-slate-400">WhatsApp: {foundBooking.driver_whatsapp || '+255 777 101 202'}</p>
                    </div>
                  </div>
                )}

                {/* Subtotal quotation in USD */}
                <div className="pt-2 flex justify-between items-center text-sm font-black text-slate-800">
                  <span>Grand Total Price Due:</span>
                  <span className="text-xl text-[#D4A017]">${foundBooking.total_amount || foundBooking.total_price || 40}</span>
                </div>
              </div>

              {/* QR Code Simulation */}
              <div className="flex justify-center py-4 border-t border-dashed">
                <div className="border p-2 bg-slate-100 rounded-xl flex flex-col items-center gap-1">
                  <div className="w-24 h-24 bg-white flex items-center justify-center p-1 border">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
                      <rect x="10" y="10" width="20" height="20" fill="currentColor" />
                      <rect x="70" y="10" width="20" height="20" fill="currentColor" />
                      <rect x="10" y="70" width="20" height="20" fill="currentColor" />
                      <rect x="35" y="35" width="30" height="30" fill="currentColor" />
                      <rect x="15" y="45" width="10" height="10" fill="currentColor" />
                      <rect x="45" y="15" width="10" height="10" fill="currentColor" />
                      <rect x="75" y="75" width="15" height="15" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Digital Boarding Pass</span>
                </div>
              </div>

              {/* Action utilities */}
              <div className="grid grid-cols-2 gap-2 pt-2 print:hidden">
                <button
                  type="button"
                  onClick={handleDownloadVoucher}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Download size={13} />
                  Print Voucher
                </button>
                <a
                  href={`https://wa.me/255777101202?text=Hello%20Zanzibar%20Trip%20and%20Relax,%20I'm%20coordinating%20my%20airport%20transfer%20ref%20${foundBooking.id || foundBooking.reference}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 text-center cursor-pointer transition-all"
                >
                  <PhoneCall size={13} />
                  Support WhatsApp
                </a>
              </div>
            </div>

            {/* Refund rules panel */}
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl space-y-2 print:hidden text-xs text-slate-600">
              <h4 className="font-extrabold text-[#0B3B8C] text-xs uppercase flex items-center gap-2">
                <Shield size={14} className="text-[#D4A017]" />
                <span>Zanzibar Passenger Refund Policy</span>
              </h4>
              <p className="leading-relaxed">
                Reservations cancelled 24 hours or more before scheduled vehicle boarding are fully refundable (100% reimbursement). Within 24 hours, the booking goes into lock-down and rescheduling depends on fleet vehicle slot limits.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
