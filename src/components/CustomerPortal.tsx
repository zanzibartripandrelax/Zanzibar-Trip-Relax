import React, { useState, useEffect } from 'react';
import { Search, Shield, Plane, Clock, User, MessageSquare, Star, Printer, X, Check, Calendar, Sliders, FileText } from 'lucide-react';
import { TransferBooking, DriverItem, VehicleItem } from '../types/transfer';
import { showToast } from '../components/ToastNotification';
import { updateBookingStatus } from '../services/bookingService';
import { addActivityLog } from '../lib/cmsStore';

interface CustomerPortalProps {
  drivers: DriverItem[];
  vehicles: VehicleItem[];
}

export default function CustomerPortal({ drivers, vehicles }: CustomerPortalProps) {
  const [searchRef, setSearchRef] = useState('');
  const [activeBooking, setActiveBooking] = useState<TransferBooking | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<DriverItem | null>(null);
  const [assignedVehicle, setAssignedVehicle] = useState<VehicleItem | null>(null);

  // Review states
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  // Modify date/time states
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleLookup = () => {
    if (!searchRef.trim()) {
      showToast('Please enter a booking reference code.', 'error');
      return;
    }

    const cleanRef = searchRef.trim().toUpperCase();
    const allBookings = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
    const found = allBookings.find(
      (b: any) =>
        b.reference_code === cleanRef ||
        b.id === cleanRef ||
        (b.details && b.details.reference === cleanRef)
    );

    if (found) {
      // Standardize schema
      const stdBooking: TransferBooking = {
        id: found.id,
        reference_code: found.reference_code || cleanRef,
        full_name: found.full_name || found.customer_name,
        email: found.email || found.customer_email,
        whatsapp_number: found.whatsapp_number || found.customer_phone,
        tour_name: found.tour_name || found.product_name || 'Airport Transfer',
        preferred_date: found.preferred_date || found.travel_date,
        preferred_time: found.details?.preferred_time || found.details?.details?.preferred_time || '12:00',
        number_of_guests: found.number_of_guests || found.guest_count || 1,
        pickup_location: found.pickup_location || found.pickup_hotel || 'Zanzibar Airport (ZNZ)',
        destination_location: found.details?.destination_location || found.details?.details?.destination_location || 'Stone Town Hotels',
        message: found.message || found.special_requests || '',
        status: found.status || 'pending',
        created_at: found.created_at || new Date().toISOString(),
        vehicle_id: found.vehicle_id || found.details?.vehicle_id || 'v-3',
        driver_id: found.driver_id || found.details?.driver_id || 'd-1',
        luggage_count: found.details?.luggage_count || 2,
        flight_number: found.details?.flight_number || '',
        total_price: found.total_price || found.details?.total_price || 40,
        payment_status: found.payment_status || found.details?.payment_status || 'pending',
      };

      setActiveBooking(stdBooking);
      setHasReviewed(false);
      setShowReschedule(false);

      // Match dynamic drivers and vehicles
      const drv = drivers.find((d) => d.id === stdBooking.driver_id) || drivers[0];
      const veh = vehicles.find((v) => v.id === stdBooking.vehicle_id) || vehicles[0];

      setAssignedDriver(drv || null);
      setAssignedVehicle(veh || null);
      showToast('Booking record loaded successfully!', 'success');
    } else {
      showToast('No booking reference matching those details was found in our database.', 'error');
      setActiveBooking(null);
    }
  };

  // Check if modification is allowed (> 24 hours notice)
  const isModificationAllowed = () => {
    if (!activeBooking) return false;
    try {
      const travelDateTime = new Date(`${activeBooking.preferred_date}T${activeBooking.preferred_time || '12:00'}`);
      const now = new Date();
      const differenceMs = travelDateTime.getTime() - now.getTime();
      const differenceHours = differenceMs / (1000 * 60 * 60);
      return differenceHours > 24;
    } catch {
      return false;
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;

    if (!isModificationAllowed()) {
      showToast('Cancellations or rescheduled requests inside of 24 hours of departure must be processed by our WhatsApp dispatch coordinator.', 'error');
      return;
    }

    const success = await updateBookingStatus(
      activeBooking.id,
      activeBooking.reference_code,
      'confirmed',
      activeBooking.payment_status as any,
      {
        preferred_date: newDate,
        preferred_time: newTime,
        travel_date: newDate,
      }
    );

    if (success) {
      showToast('Booking date and pickup time successfully updated!', 'success');
      setActiveBooking({
        ...activeBooking,
        preferred_date: newDate,
        preferred_time: newTime,
      });
      setShowReschedule(false);
      addActivityLog(activeBooking.full_name, 'Guest', `Rescheduled booking ${activeBooking.reference_code} to ${newDate} ${newTime}.`);
    } else {
      showToast('Rescheduling failed. Please contact our 24/7 Operations Desk.', 'error');
    }
  };

  const handleCancelBooking = async () => {
    if (!activeBooking) return;

    if (!isModificationAllowed()) {
      showToast('Cancellations within 24 hours of departure are locked and subject to terms. Please message our support desk to coordinate.', 'error');
      return;
    }

    if (!confirm('Are you absolutely sure you want to cancel this transfer booking? A complete reimbursement will be automatically issued.')) {
      return;
    }

    const success = await updateBookingStatus(
      activeBooking.id,
      activeBooking.reference_code,
      'cancelled',
      activeBooking.payment_status as any,
      { reason: 'Cancelled by customer self-service portal' }
    );

    if (success) {
      showToast('Transfer booking cancelled. Refund initiated.', 'success');
      setActiveBooking({
        ...activeBooking,
        status: 'cancelled',
      });
      addActivityLog(activeBooking.full_name, 'Guest', `Cancelled booking reference ${activeBooking.reference_code} via client dashboard.`);
    } else {
      showToast('Cancellation request failed. Please contact support.', 'error');
    }
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;

    showToast('Thank you! Your feedback has been registered. Our managers will review your driver rating.', 'success');
    setHasReviewed(true);
    addActivityLog(activeBooking.full_name, 'Guest', `Submitted a ${rating}-star driver rating for transfer ${activeBooking.reference_code}.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Search Header panel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Search size={16} className="text-[#D4A017]" />
            <span>Manage Existing Transfer Booking</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Enter your booking reference number (e.g. ZTR-2026-1482) to view live dispatches, download vouchers, or message your driver.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            placeholder="e.g. ZTR-2026-4831"
            className="flex-grow px-4 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B3B8C] uppercase tracking-wider"
          />
          <button
            type="button"
            onClick={handleLookup}
            className="bg-[#0B3B8C] hover:bg-blue-900 text-white font-extrabold px-6 py-3 rounded-2xl text-xs transition-all uppercase tracking-wider cursor-pointer"
          >
            Find Voucher
          </button>
        </div>
      </div>

      {activeBooking && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in print:block">
          
          {/* Main Voucher/Invoice Details card */}
          <div className="lg:col-span-2 space-y-6 print:w-full">
            
            {/* Voucher Badge wrapper */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0B3B8C] to-blue-900 p-5 text-white flex justify-between items-center">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#D4A017] font-mono">Official Transfer Voucher</span>
                  <h4 className="font-extrabold text-xs tracking-wider font-mono">{activeBooking.reference_code}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-black px-2.5 py-1 rounded-lg bg-white/10 text-white">
                    {activeBooking.status === 'confirmed' ? '✓ Secured / Confirmed' : activeBooking.status === 'cancelled' ? '🗙 Cancelled' : '● On Hold'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-xs">
                
                {/* Visual Pipeline Tracker */}
                {activeBooking.status !== 'cancelled' && (
                  <div className="border-b pb-5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Live Dispatch Milestone Progress</p>
                    <div className="grid grid-cols-4 text-center text-[10px] font-extrabold">
                      <div className="space-y-1">
                        <div className="mx-auto w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">✓</div>
                        <span className="text-emerald-600">Pending</span>
                      </div>
                      <div className="space-y-1">
                        <div className={`mx-auto w-5 h-5 rounded-full flex items-center justify-center font-bold ${activeBooking.status === 'confirmed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>✓</div>
                        <span className={activeBooking.status === 'confirmed' ? 'text-emerald-600' : 'text-slate-400'}>Confirmed</span>
                      </div>
                      <div className="space-y-1">
                        <div className="mx-auto w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold">3</div>
                        <span className="text-slate-400">Driver Assigned</span>
                      </div>
                      <div className="space-y-1">
                        <div className="mx-auto w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold">4</div>
                        <span className="text-slate-400">Arrived</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Lead Passenger</span>
                    <p className="font-extrabold text-slate-700">{activeBooking.full_name}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Contact Info</span>
                    <p className="font-extrabold text-slate-700">{activeBooking.whatsapp_number}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pickup Zone</span>
                    <p className="font-extrabold text-slate-700">{activeBooking.pickup_location}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Drop-off Zone</span>
                    <p className="font-extrabold text-slate-700">{activeBooking.destination_location || 'Resort Location'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pickup Schedule</span>
                    <p className="font-extrabold text-slate-700">{activeBooking.preferred_date} • {activeBooking.preferred_time || '12:00'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Party / Bags</span>
                    <p className="font-extrabold text-slate-700">{activeBooking.number_of_guests} travelers ({activeBooking.luggage_count || 2} Luggage Bags)</p>
                  </div>
                </div>

                {activeBooking.flight_number && (
                  <div className="bg-blue-50 border border-blue-100/50 p-3 rounded-2xl flex items-center gap-3">
                    <Plane className="text-blue-600" size={14} />
                    <div>
                      <p className="text-[10px] text-blue-500 font-black uppercase tracking-wider">Live Flight Inbound</p>
                      <p className="font-extrabold text-blue-800">Flight number: {activeBooking.flight_number} (Radar Autotracking active)</p>
                    </div>
                  </div>
                )}

                {activeBooking.message && (
                  <div className="bg-slate-50 p-3 rounded-2xl border">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Special Requests</span>
                    <p className="font-medium text-slate-600">{activeBooking.message}</p>
                  </div>
                )}

                {/* Pricing Summary */}
                <div className="border-t pt-4 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Value Paid</span>
                    <p className="text-[#D4A017] font-black text-base font-mono">${activeBooking.total_price}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Status of Payment</span>
                    <p className="font-extrabold text-emerald-600 uppercase text-[10px] flex items-center gap-1 justify-end">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {activeBooking.payment_status === 'fully_paid' ? 'Fully Pre-Paid' : 'Pay Driver on Arrival'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t flex justify-between gap-3 print:hidden">
                <button
                  onClick={handlePrintVoucher}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 font-extrabold bg-white border px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Download Voucher PDF</span>
                </button>

                {activeBooking.status !== 'cancelled' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowReschedule(true)}
                      className="text-blue-600 hover:text-blue-800 font-extrabold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Reschedule Ride
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      className="text-rose-600 hover:text-rose-800 font-extrabold bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      Cancel Transfer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Reschedule Dialog Form */}
            {showReschedule && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 animate-fade-in print:hidden">
                <div className="flex justify-between items-center border-b pb-3">
                  <h4 className="font-extrabold text-[#0B3B8C] text-xs uppercase tracking-wider">Change Travel Date / Time</h4>
                  <button onClick={() => setShowReschedule(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
                <form onSubmit={handleReschedule} className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">New Transfer Date *</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-2.5 border rounded-xl font-bold text-slate-700 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">New Pick-up Time *</label>
                    <input
                      type="time"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full p-2.5 border rounded-xl font-bold text-slate-700 bg-white"
                    />
                  </div>
                  <div className="col-span-2 pt-2">
                    <button
                      type="submit"
                      className="w-full bg-[#0B3B8C] hover:bg-blue-900 text-white font-extrabold py-2.5 rounded-xl uppercase tracking-wider"
                    >
                      Confirm Direct Reschedule
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column - Assigned Driver card & Leave Review */}
          <div className="space-y-6 print:hidden">
            
            {/* Driver Profile */}
            {assignedDriver && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Assigned Chauffeur Specs</span>
                
                <div className="flex items-center gap-4">
                  <img
                    src={assignedDriver.photo}
                    alt={assignedDriver.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-xs">{assignedDriver.name}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Licensed Tour Guide & Driver</p>
                    <div className="flex items-center gap-1 text-amber-500 text-[10px] font-black mt-0.5">
                      <Star size={10} fill="currentColor" stroke="none" />
                      <span>{assignedDriver.rating || 5.0} Perfect Rating</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4 text-xs font-semibold text-slate-600">
                  <p>● <strong>Languages Spoken:</strong> {assignedDriver.languages.join(', ')}</p>
                  <p>● <strong>Cruiser Plate:</strong> {assignedVehicle?.plate || 'ZAN 882'}</p>
                  <p>● <strong>Model:</strong> {assignedVehicle?.model || 'Toyota cruiser A/C'}</p>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://wa.me/${assignedDriver.phone.replace(/[\s+]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp Direct Message</span>
                  </a>
                </div>
              </div>
            )}

            {/* Leave Driver Review */}
            {activeBooking.status === 'confirmed' && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                <span className="text-[8px] font-black uppercase tracking-widest text-[#D4A017] block">Review Chauffeur Service</span>
                
                {hasReviewed ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center text-xs space-y-1.5 animate-fade-in">
                    <p className="font-bold text-emerald-800">✓ Feedback registered!</p>
                    <p className="text-emerald-600">Your trip review helps us maintain the best luxury ratings in Zanzibar.</p>
                  </div>
                ) : (
                  <form onSubmit={submitReview} className="space-y-3">
                    <p className="text-[10px] text-slate-500 font-medium">Rate your transport experience today:</p>
                    
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star size={18} fill={rating >= star ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience (e.g. driver hospitality, Wi-Fi connectivity, A/C efficiency)..."
                      className="w-full p-2.5 border rounded-xl text-xs font-semibold text-slate-700 bg-white"
                      rows={3}
                      required
                    />

                    <button
                      type="submit"
                      className="w-full bg-[#0B3B8C] hover:bg-blue-900 text-white font-extrabold py-2 rounded-xl text-xs uppercase tracking-wider"
                    >
                      Submit Driver Review
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
