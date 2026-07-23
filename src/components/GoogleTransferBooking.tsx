import React, { useState, useMemo } from 'react';
import { 
  Users, Calendar, Clock, MapPin, ArrowRight, CheckCircle2, 
  Phone, RefreshCw, ArrowDown, Edit3, Send, Check
} from 'lucide-react';
import GooglePlacesAutocomplete, { PlaceResult } from './GooglePlacesAutocomplete';
import GoogleTransferMap from './GoogleTransferMap';
import { showToast } from './ToastNotification';
import { Page } from '../hooks/useHashRouter';

interface GoogleTransferBookingProps {
  navigate?: (page: Page, id?: string) => void;
}

export interface VehicleOption {
  id: string;
  name: string;
  category: string;
  capacity: number;
  basePrice: number;
  perKmRate: number;
}

const VEHICLE_CATALOG: VehicleOption[] = [
  { id: 'v-standard', name: 'Standard Sedan Car', category: 'Standard', capacity: 3, basePrice: 15, perKmRate: 0.5 },
  { id: 'v-suv', name: 'SUV Cruiser 4x4', category: 'SUV 4x4', capacity: 6, basePrice: 25, perKmRate: 0.7 },
  { id: 'v-minivan', name: 'Executive Minivan (Toyota Alphard)', category: 'Executive Minivan', capacity: 13, basePrice: 35, perKmRate: 0.85 },
  { id: 'v-coaster', name: 'Coaster Group Bus', category: 'Group Coach', capacity: 25, basePrice: 65, perKmRate: 1.2 }
];

export default function GoogleTransferBooking({ navigate }: GoogleTransferBookingProps) {
  // 1. Trip Type
  const [tripType, setTripType] = useState<'one_way' | 'round_trip'>('one_way');

  // 2. Locations State
  const [pickupPlace, setPickupPlace] = useState<PlaceResult | null>({
    name: 'Zanzibar Intl Airport (ZNZ)',
    address: 'Abeid Amani Karume International Airport, Kisauni, Zanzibar',
    lat: -6.2220,
    lng: 39.2248,
    placeId: 'ChIJK...'
  });

  const [destinationPlace, setDestinationPlace] = useState<PlaceResult | null>({
    name: 'Nungwi Beach Resorts',
    address: 'Nungwi Beach, North Coast, Zanzibar',
    lat: -5.7262,
    lng: 39.2891,
    placeId: 'ChIJN...'
  });

  // 3. Dates & Times
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [pickupDate, setPickupDate] = useState(todayStr);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnDate, setReturnDate] = useState(todayStr);
  const [returnTime, setReturnTime] = useState('14:00');

  // 4. Passenger Count & Contact
  const [passengers, setPassengers] = useState(2);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [guestName, setGuestName] = useState('');

  // 5. Route Stats from Map
  const [routeStats, setRouteStats] = useState<{ distanceKm: number; durationText: string }>({
    distanceKm: 64,
    durationText: '1 hr 15 mins'
  });

  // 6. Submission & Confirmation state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Handle Form Submit
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupPlace || !destinationPlace) {
      showToast('Please select both Pickup and Destination locations', 'error');
      return;
    }

    if (!whatsappNumber.trim()) {
      showToast('Please enter your WhatsApp Phone Number', 'error');
      return;
    }

    // Auto recommend vehicle based on passenger count
    let vehicle = VEHICLE_CATALOG[0]; // Standard Sedan
    if (passengers > 13) {
      vehicle = VEHICLE_CATALOG[3]; // Coaster Bus
    } else if (passengers > 6) {
      vehicle = VEHICLE_CATALOG[2]; // Minivan
    } else if (passengers > 3) {
      vehicle = VEHICLE_CATALOG[1]; // SUV 4x4
    }

    // Auto calculate price
    const dist = routeStats.distanceKm || 25;
    let calculatedPrice = Math.round(vehicle.basePrice + (dist * vehicle.perKmRate));
    if (tripType === 'round_trip') {
      calculatedPrice = Math.round(calculatedPrice * 1.8);
    }
    const finalPrice = Math.max(15, calculatedPrice);

    const refCode = `ZTR-TR-${Math.floor(100000 + Math.random() * 900000)}`;

    const bookingData = {
      id: refCode,
      reference_code: refCode,
      booking_id: refCode,
      customer_name: guestName.trim() || 'Guest',
      guest_name: guestName.trim() || 'Guest',
      whatsapp: whatsappNumber.trim(),
      
      pickup: pickupPlace.name,
      destination: destinationPlace.name,
      pickup_location: {
        name: pickupPlace.name,
        address: pickupPlace.address,
        lat: pickupPlace.lat,
        lng: pickupPlace.lng
      },
      destination_location: {
        name: destinationPlace.name,
        address: destinationPlace.address,
        lat: destinationPlace.lat,
        lng: destinationPlace.lng
      },
      coordinates: {
        pickup: { lat: pickupPlace.lat, lng: pickupPlace.lng },
        destination: { lat: destinationPlace.lat, lng: destinationPlace.lng }
      },

      trip_type: tripType,
      date: pickupDate,
      time: pickupTime,
      preferred_date: pickupDate,
      pickup_time: pickupTime,
      return_date: tripType === 'round_trip' ? returnDate : null,
      return_time: tripType === 'round_trip' ? returnTime : null,

      passengers,
      number_of_guests: passengers,

      distance_km: dist,
      duration_text: routeStats.durationText || '45 mins',

      recommended_vehicle: vehicle.name,
      vehicle: vehicle.name,
      vehicle_details: vehicle,

      price: finalPrice,
      total_price: finalPrice,
      currency: 'USD',
      status: 'Pending',
      created_at: new Date().toISOString(),
      category: 'transfer'
    };

    // Save to localStorage for Admin Dashboard sync
    try {
      const existing = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
      const updated = [bookingData, ...existing];
      localStorage.setItem('ztr_bookings', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving transfer booking to localStorage:', err);
    }

    setConfirmedBooking(bookingData);
    setIsSubmitted(true);
    setIsConfirmed(false);
  };

  const handleConfirmBookingAction = () => {
    setIsConfirmed(true);
    showToast(`Booking ${confirmedBooking?.reference_code} confirmed!`, 'success');

    // Pre-fill WhatsApp desk confirmation message
    const text = `Jambo! I would like to confirm my transfer booking:\n\n` +
      `📍 *Pickup:* ${confirmedBooking?.pickup}\n` +
      `🏁 *Destination:* ${confirmedBooking?.destination}\n` +
      `📅 *Date & Time:* ${confirmedBooking?.date} @ ${confirmedBooking?.time}\n` +
      `👥 *Passengers:* ${confirmedBooking?.passengers} Pax\n` +
      `🚘 *Vehicle:* ${confirmedBooking?.recommended_vehicle}\n` +
      `💵 *Price:* $${confirmedBooking?.price} USD\n` +
      `🔖 *Ref ID:* ${confirmedBooking?.reference_code}\n` +
      `📱 *WhatsApp:* ${confirmedBooking?.whatsapp}\n\n` +
      `Please assign my driver. Asante sana!`;

    window.open(`https://wa.me/255777101202?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Step 2: Simple Confirmation Page */}
      {isSubmitted && confirmedBooking ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-10 space-y-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2 border-b border-slate-100 pb-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              Transfer Reservation Calculated
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0B3B8C] font-serif">
              Transfer Summary
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Review your Zanzibar transfer details below and confirm your booking.
            </p>
          </div>

          {/* Confirmation Grid Details */}
          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Left Summary Details (7 Cols) */}
            <div className="md:col-span-7 space-y-6">
              {/* Pickup -> Destination Visual Route */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    A
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pickup Location</span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{confirmedBooking.pickup_location.name}</h4>
                    <p className="text-xs text-slate-500">{confirmedBooking.pickup_location.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-3">
                  <ArrowDown className="text-slate-400" size={18} />
                  <span className="text-[11px] text-slate-400 font-mono font-semibold">
                    {confirmedBooking.distance_km} km ({confirmedBooking.duration_text})
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    B
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destination</span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{confirmedBooking.destination_location.name}</h4>
                    <p className="text-xs text-slate-500">{confirmedBooking.destination_location.address}</p>
                  </div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Distance</span>
                  <span className="font-black text-[#0B3B8C] text-sm font-mono">{confirmedBooking.distance_km} km</span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Travel Time</span>
                  <span className="font-black text-[#D4A017] text-sm font-mono">{confirmedBooking.duration_text}</span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Trip Type</span>
                  <span className="font-bold text-slate-800 text-xs uppercase">{confirmedBooking.trip_type.replace('_', ' ')}</span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Vehicle</span>
                  <span className="font-bold text-slate-900 text-xs truncate block">{confirmedBooking.recommended_vehicle}</span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm col-span-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Date & Time</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {confirmedBooking.date} @ {confirmedBooking.time} ({confirmedBooking.passengers} Pax)
                  </span>
                </div>
              </div>

              {/* Price & Reference Box */}
              <div className="p-5 bg-gradient-to-r from-[#0B3B8C] to-[#082E6E] text-white rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#D4A017] block tracking-wider">Total Fixed Price</span>
                  <span className="text-xs text-blue-200 block">Booking Ref: <strong className="font-mono text-white">{confirmedBooking.reference_code}</strong></span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-[#D4A017]">${confirmedBooking.price}</span>
                  <span className="text-xs text-blue-200 block">USD</span>
                </div>
              </div>

              {/* Confirmation Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmBookingAction}
                  className="w-full sm:flex-1 bg-[#D4A017] hover:bg-[#c29212] text-[#020C1F] font-black py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-98 cursor-pointer border border-yellow-300"
                >
                  <Send size={18} />
                  <span>Confirm Booking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer border border-slate-300"
                >
                  <Edit3 size={16} />
                  <span>Edit Booking</span>
                </button>
              </div>

              {isConfirmed && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
                  <Check className="text-emerald-600 shrink-0" size={18} />
                  <span>Booking details sent to WhatsApp dispatch team. Driver info will be shared shortly!</span>
                </div>
              )}
            </div>

            {/* Right Interactive Google Map (5 Cols) */}
            <div className="md:col-span-5 space-y-3">
              <span className="text-xs font-bold text-[#0B3B8C] uppercase tracking-wider block">Route Map</span>
              <GoogleTransferMap
                pickup={confirmedBooking.pickup_location}
                destination={confirmedBooking.destination_location}
                heightClass="h-72 md:h-96"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Step 1: Clean Booking.com Style Form + Google Map Above The Fold */
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Booking Card (7 Cols) */}
          <form onSubmit={handleSubmitBooking} className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
            {/* Title */}
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl md:text-2xl font-black text-[#0B3B8C] font-serif">
                Book Your Zanzibar Transfer
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Fast & easy private airport and hotel shuttles across Zanzibar.
              </p>
            </div>

            {/* 1. Trip Type Switcher */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Trip Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTripType('one_way')}
                  className={`py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
                    tripType === 'one_way'
                      ? 'bg-[#0B3B8C] text-white border-[#0B3B8C] shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowRight size={16} />
                  <span>One Way</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTripType('round_trip')}
                  className={`py-3 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border-2 ${
                    tripType === 'round_trip'
                      ? 'bg-[#0B3B8C] text-white border-[#0B3B8C] shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <RefreshCw size={14} />
                  <span>Round Trip</span>
                </button>
              </div>
            </div>

            {/* 2. Pickup & Destination Google Maps Autocomplete */}
            <div className="space-y-4">
              <GooglePlacesAutocomplete
                label="Pickup Location"
                value={pickupPlace?.name || ''}
                onChange={(place) => setPickupPlace(place)}
                placeholder="Search hotel, villa, airport, ferry terminal, beach..."
                icon={<MapPin size={18} className="text-emerald-600" />}
              />

              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={() => {
                    const temp = pickupPlace;
                    setPickupPlace(destinationPlace);
                    setDestinationPlace(temp);
                  }}
                  className="p-2 rounded-full bg-slate-100 hover:bg-blue-50 text-[#0B3B8C] border border-slate-300 transition-transform active:scale-95 cursor-pointer shadow-xs"
                  title="Swap locations"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              <GooglePlacesAutocomplete
                label="Destination"
                value={destinationPlace?.name || ''}
                onChange={(place) => setDestinationPlace(place)}
                placeholder="Search hotel, villa, airport, ferry terminal, beach..."
                icon={<MapPin size={18} className="text-red-600" />}
              />
            </div>

            {/* 3. Date & Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar size={14} className="text-[#D4A017]" />
                  <span>Pickup Date</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0B3B8C] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock size={14} className="text-[#D4A017]" />
                  <span>Pickup Time</span>
                </label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0B3B8C] outline-none"
                  required
                />
              </div>
            </div>

            {/* Return Date/Time if Round Trip */}
            {tripType === 'round_trip' && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar size={14} className="text-[#D4A017]" />
                    <span>Return Date</span>
                  </label>
                  <input
                    type="date"
                    min={pickupDate || todayStr}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0B3B8C] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock size={14} className="text-[#D4A017]" />
                    <span>Return Time</span>
                  </label>
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0B3B8C] outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* 4. Number of Passengers */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={15} className="text-[#D4A017]" />
                <span>Number of Passengers</span>
              </label>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-extrabold text-slate-800">Passengers Count</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-300 font-extrabold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer active:scale-95 text-base shadow-xs"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-slate-900 text-base font-mono">{passengers}</span>
                  <button
                    type="button"
                    onClick={() => setPassengers(passengers + 1)}
                    className="w-9 h-9 rounded-xl bg-white border border-slate-300 font-extrabold text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer active:scale-95 text-base shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Guest Name (Optional) & WhatsApp Number (Required) */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Phone size={15} className="text-[#D4A017]" />
                  <span>WhatsApp Number *</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +255 777 101 202 or +44 7700 900077"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0B3B8C] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:border-[#0B3B8C] outline-none"
                />
              </div>
            </div>

            {/* 6. Book Transfer Button (Large Gold) */}
            <button
              type="submit"
              className="w-full py-4 bg-[#D4A017] hover:bg-[#c29212] text-[#020C1F] font-black text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-yellow-300"
            >
              <span>Book Transfer</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Right Column: Single Interactive Google Map (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <GoogleTransferMap
              pickup={pickupPlace}
              destination={destinationPlace}
              onRouteCalculated={(stats) => setRouteStats(stats)}
              heightClass="h-80 md:h-[480px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
