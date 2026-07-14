import React, { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { 
  Shield, Clock, Users, MapPin, CheckCircle, Navigation, Info, ArrowRight, 
  Calendar, Luggage, Plane, CreditCard, Check, Sparkles, Send, Phone, Eye, X, Award,
  Compass, RefreshCw, Tag, HelpCircle, ArrowLeftRight
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { showToast } from '../components/ToastNotification';
import TransferMap, { getRouteStats } from '../components/TransferMap';
import TransferTracker from '../components/TransferTracker';

interface TransfersProps {
  navigate: (page: Page, id?: string) => void;
}

interface RouteItem {
  id: string;
  pickup: string;
  destination: string;
  priceOneWay: number;
  priceRoundTrip: number;
  duration: string;
  enabled: boolean;
}

interface VehicleItem {
  id: string;
  plate: string;
  model: string;
  capacity: number;
  luggageCapacity: number;
  features: string[];
  image: string;
  description: string;
  status: 'Available' | 'Reserved' | 'Under Maintenance';
  priceAdjustment: number;
}

interface DriverItem {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  languages: string[];
  license: string;
  photo: string;
  status: 'Available' | 'On Trip' | 'Off Duty';
}

const DEFAULT_ROUTES: RouteItem[] = [
  { id: 'r-1', pickup: 'Zanzibar Airport (ZNZ)', destination: 'Stone Town Hotels', priceOneWay: 15, priceRoundTrip: 25, duration: '15-20 min', enabled: true },
  { id: 'r-2', pickup: 'Zanzibar Airport (ZNZ)', destination: 'Nungwi / Kendwa Resorts', priceOneWay: 40, priceRoundTrip: 75, duration: '60-70 min', enabled: true },
  { id: 'r-3', pickup: 'Zanzibar Airport (ZNZ)', destination: 'Paje / Jambiani / Bwejuu', priceOneWay: 40, priceRoundTrip: 75, duration: '55-65 min', enabled: true },
  { id: 'r-4', pickup: 'Zanzibar Airport (ZNZ)', destination: 'Matemwe / Kiwengwa / Pongwe', priceOneWay: 35, priceRoundTrip: 65, duration: '45-55 min', enabled: true },
  { id: 'r-5', pickup: 'Zanzibar Airport (ZNZ)', destination: 'Kizimkazi area hotels', priceOneWay: 45, priceRoundTrip: 85, duration: '60-75 min', enabled: true },
];

const DEFAULT_VEHICLES: VehicleItem[] = [
  { 
    id: 'v-1', 
    plate: 'ZAN 401', 
    model: 'Toyota Land Cruiser Safari Coach', 
    capacity: 7, 
    luggageCapacity: 6, 
    features: ['4x4 AWD', 'A/C', 'English guide', 'Charging ports', 'Free Wi-Fi', 'Bottled water'], 
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=compress&cs=tinysrgb&w=800', 
    description: 'Rugged luxury custom built safari coach with pop-up roof and panoramic windows.', 
    status: 'Available',
    priceAdjustment: 20
  },
  { 
    id: 'v-2', 
    plate: 'ZAN 882', 
    model: 'Toyota Alphard Executive VIP', 
    capacity: 5, 
    luggageCapacity: 4, 
    features: ['Reclining VIP seats', 'Triple A/C', 'Wi-Fi', 'Refreshments', 'Ambient lighting', 'Child seat support'], 
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=compress&cs=tinysrgb&w=800', 
    description: 'Ultra-luxurious spacious minivan. Perfect for couples, business travel, or style.', 
    status: 'Available',
    priceAdjustment: 10
  },
  { 
    id: 'v-3', 
    plate: 'ZAN 125', 
    model: 'Toyota Noah Standard Minibus', 
    capacity: 6, 
    luggageCapacity: 5, 
    features: ['A/C', 'Spacious cabin', 'Professional Driver', 'Complimentary luggage help'], 
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=compress&cs=tinysrgb&w=800', 
    description: 'Our standard cost-effective resort transfer cruiser. High dependability.', 
    status: 'Available',
    priceAdjustment: 0
  }
];

const DEFAULT_DRIVERS: DriverItem[] = [
  { id: 'd-1', name: 'Driver Juma', phone: '+255 777 101 202', whatsapp: '+255 777 101 202', email: 'juma@zanzibar-trip.com', languages: ['English', 'Swahili'], license: 'DL-ZN-2025-098', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=compress&cs=tinysrgb&w=400', status: 'Available' },
  { id: 'd-2', name: 'Driver Bakari', phone: '+255 777 303 404', whatsapp: '+255 777 303 404', email: 'bakari@zanzibar-trip.com', languages: ['English', 'German', 'Swahili'], license: 'DL-ZN-2025-554', photo: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=compress&cs=tinysrgb&w=400', status: 'Available' },
  { id: 'd-3', name: 'Driver Idi', phone: '+255 777 505 606', whatsapp: '+255 777 505 606', email: 'idi@zanzibar-trip.com', languages: ['English', 'French', 'Swahili'], license: 'DL-ZN-2025-712', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=compress&cs=tinysrgb&w=400', status: 'Available' },
];

const CURRENCY_CONVERTER: Record<string, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR' },
  TZS: { symbol: 'TSh', rate: 2600.0, label: 'TZS' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP' }
};

export default function Transfers({ navigate }: TransfersProps) {
  // Navigation active view mode
  const [activeTab, setActiveTab] = useState<'book' | 'track'>('book');

  // Load dynamic CMS config or fallbacks
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);

  useEffect(() => {
    // Inject structured SEO data & Title
    document.title = "Zanzibar Transfer Hub - Premium Airport & Resort Shuttles | Zanzibar Trip & Relax";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Book licensed private airport transfers and shared shuttles across Zanzibar. Fixed upfront pricing, real-time tracking, professional Swahili chauffeurs, and luxury vehicles.');
    }

    // JSON-LD Structured Schema
    const scriptId = 'ztr-transfer-seo-schema';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TaxiService",
      "name": "Zanzibar Trip & Relax Transfer Hub",
      "description": "Licensed premier private hotel and airport transfers in Zanzibar.",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Zanzibar Trip & Relax",
        "email": "zanzibartripandrelax@gmail.com",
        "telephone": "+255 777 101 202"
      },
      "areaServed": "Zanzibar Archipelago",
      "priceRange": "$$"
    });

    // Load LocalStorage parameters
    const localRoutes = localStorage.getItem('ztr_routes');
    if (localRoutes) {
      try { setRoutes(JSON.parse(localRoutes)); } catch { setRoutes(DEFAULT_ROUTES); }
    } else {
      setRoutes(DEFAULT_ROUTES);
      localStorage.setItem('ztr_routes', JSON.stringify(DEFAULT_ROUTES));
    }

    const localVehicles = localStorage.getItem('ztr_vehicles');
    if (localVehicles) {
      try { setVehicles(JSON.parse(localVehicles)); } catch { setVehicles(DEFAULT_VEHICLES); }
    } else {
      setVehicles(DEFAULT_VEHICLES);
      localStorage.setItem('ztr_vehicles', JSON.stringify(DEFAULT_VEHICLES));
    }

    const localDrivers = localStorage.getItem('ztr_drivers');
    if (localDrivers) {
      try { setDrivers(JSON.parse(localDrivers)); } catch { setDrivers(DEFAULT_DRIVERS); }
    } else {
      setDrivers(DEFAULT_DRIVERS);
      localStorage.setItem('ztr_drivers', JSON.stringify(DEFAULT_DRIVERS));
    }
  }, []);

  // Form states
  const [transferCategory, setTransferCategory] = useState<'airport' | 'hotel' | 'ferry' | 'beach' | 'safari'>('airport');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [luggage, setLuggage] = useState(2);
  
  // Specific inputs
  const [flightNo, setFlightNo] = useState('');
  const [airportTerminal, setAirportTerminal] = useState('Terminal 3 - International');
  const [ferryVessel, setFerryVessel] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [transferType, setTransferType] = useState<'private' | 'shared'>('private');
  
  // Advanced variables
  const [childSeats, setChildSeats] = useState(0);
  const [waitingHours, setWaitingHours] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState<{ code: string; percent: number } | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'TZS' | 'GBP'>('USD');

  // Search/Recommendation states
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recommendedVehicles, setRecommendedVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  // Checkout states
  const [showCheckout, setShowCheckout] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'later'>('later');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Apply promo helper
  const handleApplyPromo = () => {
    const codeClean = promoCode.trim().toUpperCase();
    if (!codeClean) return;

    if (codeClean === 'KARIBU10') {
      setPromoApplied({ code: 'KARIBU10', percent: 10 });
      showToast('KARIBU10 Promo Code Applied! 10% Off', 'success');
    } else if (codeClean === 'ZANZIBAR20') {
      setPromoApplied({ code: 'ZANZIBAR20', percent: 20 });
      showToast('ZANZIBAR20 Promo Code Applied! 20% Off', 'success');
    } else if (codeClean === 'WELCOMETR') {
      setPromoApplied({ code: 'WELCOMETR', percent: 15 });
      showToast('WELCOMETR Promo Code Applied! 15% Off', 'success');
    } else {
      showToast('Invalid Coupon Code entered.', 'error');
    }
  };

  // Convert prices dynamically
  const formatPriceVal = (usdVal: number) => {
    const data = CURRENCY_CONVERTER[currency];
    const converted = Math.round(usdVal * data.rate);
    return `${data.symbol} ${converted.toLocaleString()}`;
  };

  // Pricing helper
  const calculatePrice = (route: RouteItem, vehicle: VehicleItem) => {
    let base = isRoundTrip ? route.priceRoundTrip : route.priceOneWay;
    
    // Private vs Shared
    if (transferType === 'shared') {
      const pax = adults + children;
      base = Math.max(12, Math.round((route.priceOneWay * 0.4) * pax));
    } else {
      base += vehicle.priceAdjustment;
    }

    // Night surcharge if between 22:00 (10 PM) and 06:00 (6 AM)
    let nightFee = 0;
    if (pickupTime) {
      const hour = parseInt(pickupTime.split(':')[0], 10);
      if (hour >= 22 || hour < 6) {
        nightFee = 15;
      }
    }

    // Extra luggage fee if luggage exceeds vehicle capacity
    let extraLuggageFee = 0;
    if (luggage > vehicle.luggageCapacity) {
      extraLuggageFee = (luggage - vehicle.luggageCapacity) * 5;
    }

    // Child seat charge
    const childSeatFee = childSeats * 5;

    // Waiting stops charge
    const waitingFee = waitingHours * 10;

    // Seasonality multipliers based on date month
    let seasonalLabel = 'Regular Season';
    let seasonalRate = 1.0;
    if (pickupDate) {
      try {
        const month = new Date(pickupDate).getMonth(); // 0-indexed
        if ([11, 0, 1, 6, 7, 8].includes(month)) {
          seasonalRate = 1.15; // Peak season
          seasonalLabel = 'Dry Peak Season (+15%)';
        } else if ([3, 4].includes(month)) {
          seasonalRate = 0.90; // Low green season
          seasonalLabel = 'Rainy Low Season (-10%)';
        }
      } catch (e) {}
    }

    let subtotal = (base + nightFee + extraLuggageFee + childSeatFee + waitingFee) * seasonalRate;

    // Promo code discount
    let discount = 0;
    if (promoApplied) {
      discount = subtotal * (promoApplied.percent / 100);
    }

    const postDiscountTotal = Math.max(0, subtotal - discount);
    const tax = postDiscountTotal * 0.18; // 18% Zanzibar VAT standard
    const finalTotal = Math.round(postDiscountTotal + tax);

    return {
      base: Math.round(base),
      nightFee,
      extraLuggageFee,
      childSeatFee,
      waitingFee,
      seasonalRate,
      seasonalLabel,
      discount: Math.round(discount),
      tax: Math.round(tax),
      total: finalTotal
    };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !destination) {
      showToast('Please select pickup and destination locations', 'error');
      return;
    }
    if (pickup === destination) {
      showToast('Pickup and destination cannot be identical', 'error');
      return;
    }
    if (!pickupDate || !pickupTime) {
      showToast('Please specify pickup date and time', 'error');
      return;
    }
    if (isRoundTrip && (!returnDate || !returnTime)) {
      showToast('Please specify return date and time', 'error');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      // Find matching route rate
      let matchedRoute = routes.find(r => 
        (r.pickup.toLowerCase().includes(pickup.toLowerCase()) && r.destination.toLowerCase().includes(destination.toLowerCase())) ||
        (r.pickup.toLowerCase().includes(destination.toLowerCase()) && r.destination.toLowerCase().includes(pickup.toLowerCase()))
      );

      // Default route fallback if zone matches are not explicitly stored
      if (!matchedRoute) {
        matchedRoute = {
          id: 'temp-r',
          pickup,
          destination,
          priceOneWay: 35,
          priceRoundTrip: 60,
          duration: '45 min',
          enabled: true
        };
      }

      // Filter and score vehicles based on capacity
      const totalPassengers = adults + children + infants;
      const recs = vehicles.map(veh => {
        const pricing = calculatePrice(matchedRoute!, veh);
        const matchesCapacity = veh.capacity >= totalPassengers;
        const matchesLuggage = veh.luggageCapacity >= luggage;

        let score = 100;
        if (!matchesCapacity) score -= 50;
        if (!matchesLuggage) score -= 20;
        if (veh.status !== 'Available') score -= 90;

        return {
          ...veh,
          pricing,
          matchedRoute,
          score,
          matchesCapacity,
          matchesLuggage,
          remainingSeats: transferType === 'shared' ? Math.max(0, veh.capacity - totalPassengers) : null
        };
      }).sort((a, b) => b.score - a.score);

      setRecommendedVehicles(recs);
      setIsSearching(false);
      setHasSearched(true);
      showToast('Smart recommendation algorithm processed successfully!', 'success');
    }, 800);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone) {
      showToast('Please fill in all contact details', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const bookingId = `ZTR-TR-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Auto assign available driver
      const availableDrivers = drivers.filter(d => d.status === 'Available');
      const assignedDriver = availableDrivers.length > 0 
        ? availableDrivers[Math.floor(Math.random() * availableDrivers.length)] 
        : drivers[0];

      const newBooking = {
        id: bookingId,
        reference_code: bookingId,
        full_name: `${firstName} ${lastName}`,
        customer_name: `${firstName} ${lastName}`,
        email,
        customer_email: email,
        whatsapp_number: phone,
        customer_phone: phone,
        number_of_guests: adults + children + infants,
        tour_name: `Airport Transfer: ${pickup} ➔ ${destination} (${transferType === 'private' ? 'Private' : 'Shared'})`,
        product_name: `Airport Transfer: ${pickup} ➔ ${destination}`,
        product_category: 'transfer',
        preferred_date: pickupDate,
        travel_date: pickupDate,
        pickup_location: hotelName || pickupAddress || pickup,
        message: specialRequests,
        status: 'Confirmed',
        created_at: new Date().toISOString(),
        is_transfer: true,
        pickup,
        destination,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        return_date: isRoundTrip ? returnDate : null,
        return_time: isRoundTrip ? returnTime : null,
        is_round_trip: isRoundTrip,
        transfer_type: transferType,
        adults,
        children,
        infants,
        luggage_count: luggage,
        flight_no: flightNo,
        hotel_name: hotelName,
        pickup_address: pickupAddress,
        vehicle_id: selectedVehicle.id,
        vehicle_name: selectedVehicle.model,
        vehicle_image: selectedVehicle.image,
        driver_id: assignedDriver?.id || null,
        driver_name: assignedDriver?.name || 'To Be Assigned',
        driver_phone: assignedDriver?.phone || '',
        driver_whatsapp: assignedDriver?.whatsapp || '',
        total_amount: selectedVehicle.pricing.total,
        total_price: selectedVehicle.pricing.total,
        payment_status: paymentMethod === 'later' ? 'pending' : 'fully_paid',
        payment_choice: paymentMethod === 'later' ? 'later' : 'full',
      };

      // Save to local listings
      const existingBookings = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
      const updatedBookings = [newBooking, ...existingBookings];
      localStorage.setItem('ztr_bookings', JSON.stringify(updatedBookings));

      // Synchronize back to backup state key
      const backup = JSON.parse(localStorage.getItem('ztr_local_bookings_backup') || '[]');
      localStorage.setItem('ztr_local_bookings_backup', JSON.stringify([newBooking, ...backup]));

      // Update vehicle availability if private
      if (transferType === 'private') {
        const updatedVehicles = vehicles.map(v => v.id === selectedVehicle.id ? { ...v, status: 'Reserved' as const } : v);
        localStorage.setItem('ztr_vehicles', JSON.stringify(updatedVehicles));
        setVehicles(updatedVehicles);
      }

      // Add activity log
      const logs = JSON.parse(localStorage.getItem('ztr_activity_logs') || '[]');
      const newLog = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: `${firstName} ${lastName}`,
        role: 'Guest',
        action: `Booked transfer ${bookingId} (${pickup} ➔ ${destination})`
      };
      localStorage.setItem('ztr_activity_logs', JSON.stringify([newLog, ...logs]));

      setBookingSuccess({
        booking: newBooking,
        driver: assignedDriver
      });
      setIsSubmitting(false);
      showToast('Transfer booking confirmed instantly!', 'success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Banner with Zanzibar style */}
      <section className="relative h-[32vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=1600')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B3B8C]/80 to-[#020C1F]/90" />
        <div className="relative z-10 text-center px-4 max-w-3xl space-y-2">
          <span className="text-[#D4A017] uppercase tracking-widest font-black text-[10px] bg-[#D4A017]/10 border border-[#D4A017]/25 px-3 py-1 rounded-full inline-block">
            ZANZIBAR TRIP & RELAX TRANSPORTATION HUB
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Zanzibar Premium Transfers & Shuttles
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto">
            Calculate instant rates, select professional local Swahili guides, and schedule luxury rides with door-to-door guarantees.
          </p>
        </div>
      </section>

      <Breadcrumbs items={[{ label: 'Transfer Booking Hub' }]} navigate={navigate} />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Toggle Nav Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border max-w-md mx-auto shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('book')}
            className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'book' ? 'bg-[#0B3B8C] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            🛫 Book a Transfer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === 'track' ? 'bg-[#0B3B8C] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            🔍 Manage & Track Rides
          </button>
        </div>

        {activeTab === 'track' ? (
          <TransferTracker onBackToBooking={() => setActiveTab('book')} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left/Middle Column: Search Form and Recommended Fleet */}
            <div className="lg:col-span-8 space-y-8">
              
              {bookingSuccess ? (
                /* Success Receipt screen */
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-6 md:p-8 space-y-6 animate-fade-in">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                      <CheckCircle size={36} />
                    </div>
                    <h2 className="text-2xl font-black text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>Karibu Zanzibar!</h2>
                    <p className="text-xs text-slate-500 font-semibold">Your premium transfer reservation has been locked into our dispatch calendar.</p>
                    <div className="inline-block bg-slate-100 font-mono text-xs text-[#0B3B8C] font-extrabold px-3 py-1 rounded-full border">
                      Booking Reference: {bookingSuccess.booking.id}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3 text-xs">
                      <Clock className="text-emerald-600 mt-0.5 shrink-0" size={16} />
                      <div>
                        <h4 className="font-bold text-emerald-800">Automated Email Dispatched</h4>
                        <p className="text-emerald-700 mt-1">Printable travel voucher, receipt ledger, and Terminal arrivals instructions have been sent to <strong>{bookingSuccess.booking.email}</strong>.</p>
                      </div>
                    </div>
                    <div className="bg-[#25D366]/10 border border-[#25D366]/20 p-4 rounded-2xl flex items-start gap-3 text-xs">
                      <Send className="text-[#25D366] mt-0.5 shrink-0" size={16} />
                      <div>
                        <h4 className="font-bold text-emerald-800 font-mono">WhatsApp Driver Alert Dispatched</h4>
                        <p className="text-emerald-700 mt-1">Live SMS vehicle coordinates and driver details have been broadcasted to WhatsApp phone <strong>{bookingSuccess.booking.whatsapp_number}</strong>.</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary card details */}
                  <div className="border rounded-2xl p-4 bg-slate-50 text-xs space-y-3">
                    <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] border-b pb-1.5 flex items-center gap-1">
                      <Compass size={12} className="text-[#D4A017]" />
                      <span>Excursion Ride Parameters</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-2 leading-relaxed">
                      <p><strong className="text-slate-500">From Pickup:</strong> {bookingSuccess.booking.pickup}</p>
                      <p><strong className="text-slate-500">To drop-off:</strong> {bookingSuccess.booking.destination}</p>
                      <p><strong className="text-slate-500">Date/Time:</strong> {bookingSuccess.booking.pickup_date} @ {bookingSuccess.booking.pickup_time}</p>
                      <p><strong className="text-slate-500">Passengers count:</strong> {bookingSuccess.booking.number_of_guests} travelers</p>
                      <p><strong className="text-slate-500">Assigned Cruiser:</strong> {selectedVehicle.model}</p>
                      <p><strong className="text-slate-500">Plate Code:</strong> <span className="font-mono bg-slate-200 px-1 py-0.5 rounded font-bold text-[10px]">{selectedVehicle.plate}</span></p>
                      <p><strong className="text-slate-500">Prepayment Option:</strong> {paymentMethod === 'later' ? 'Cash to Driver Later' : 'Paid in Full'}</p>
                      <p><strong className="text-slate-500">Grand Total Fee:</strong> <span className="text-[#D4A017] font-black">{formatPriceVal(bookingSuccess.booking.total_amount)}</span></p>
                    </div>
                  </div>

                  {/* Driver specs assignment */}
                  <div className="bg-[#0B3B8C]/5 border border-slate-200 p-4 rounded-2xl flex items-center gap-4 text-xs">
                    <img
                      src={bookingSuccess.driver?.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=compress&cs=tinysrgb&w=150"}
                      alt="Zanzibar driver portrait"
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div>
                      <span className="bg-[#0B3B8C] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block">Assigned Swahili Chauffeur</span>
                      <h4 className="font-extrabold text-slate-800 text-sm mt-1">{bookingSuccess.booking.driver_name}</h4>
                      <p className="text-slate-400 mt-0.5">Spoken: English, Swahili, Italian, German</p>
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => {
                        setBookingSuccess(null);
                        setHasSearched(false);
                        setSelectedVehicle(null);
                        setShowCheckout(false);
                      }}
                      className="bg-[#0B3B8C] hover:bg-blue-900 text-white font-bold px-8 py-3 rounded-full text-xs shadow-md transition-all uppercase tracking-wider"
                    >
                      Reschedule Another Ride
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  
                  {/* Category cards selector */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-3 shadow-sm">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Select Transfer Ride Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { id: 'airport', label: 'Airport Transfer', desc: 'Terminal 2 or 3', icon: '🛫' },
                        { id: 'hotel', label: 'Hotel Transfer', desc: 'Resort to Resort', icon: '🏨' },
                        { id: 'ferry', label: 'Ferry Transfer', desc: 'Malindi Harbour', icon: '⛴' },
                        { id: 'beach', label: 'Beach Shuttle', desc: 'Coast Connections', icon: '🏖' },
                        { id: 'safari', label: 'Safari Connect', desc: 'Airstrip Transit', icon: '🦁' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setTransferCategory(cat.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            transferCategory === cat.id 
                              ? 'bg-[#0B3B8C]/5 border-[#0B3B8C] text-[#0B3B8C] shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-lg mb-1">{cat.icon}</span>
                          <div>
                            <p className="text-[11px] font-extrabold truncate">{cat.label}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{cat.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Booking Form Card */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
                    <div className="border-b pb-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-[#0B3B8C] font-serif">Direct Ride Configurator</h3>
                        <p className="text-xs text-slate-400">Fixed, clear rates based on Zanzibar's authorized tourism zones.</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wide">
                        ● 100% Free Cancellations
                      </span>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-6">
                      
                      {/* One Way / Round Trip Switch */}
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setIsRoundTrip(false)}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                            !isRoundTrip 
                              ? 'bg-[#0B3B8C] text-white border-[#0B3B8C] shadow-sm' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          One Way Trip
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRoundTrip(true)}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                            isRoundTrip 
                              ? 'bg-[#0B3B8C] text-white border-[#0B3B8C] shadow-sm' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>Round Trip (Save 15%)</span>
                          <ArrowLeftRight size={12} className="text-[#D4A017]" />
                        </button>
                      </div>

                      {/* Locations Selectors */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                            <MapPin size={10} className="text-[#D4A017]" />
                            <span>Pickup Area *</span>
                          </label>
                          <select
                            required
                            value={pickup}
                            onChange={(e) => setPickup(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
                          >
                            <option value="">-- Choose Pickup Point --</option>
                            <option value="Zanzibar Airport (ZNZ)">Zanzibar Airport (ZNZ) Terminal 3</option>
                            <option value="Zanzibar Airport Domestic (ZNZ)">Zanzibar Airport Domestic Terminal 2</option>
                            <option value="Ferry Terminal Malindi">Zanzibar Ferry Port Terminal (Stone Town)</option>
                            <option value="Stone Town Hotels">Stone Town Resort Hotels</option>
                            <option value="Nungwi / Kendwa Resorts">Nungwi or Kendwa Beaches</option>
                            <option value="Paje / Jambiani / Bwejuu">Paje or Jambiani East Coast</option>
                            <option value="Matemwe / Kiwengwa">Matemwe or Kiwengwa Northeast</option>
                            <option value="Kizimkazi Coastal Area">Kizimkazi Dolphin Village South</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                            <MapPin size={10} className="text-[#D4A017]" />
                            <span>Drop-off Destination Area *</span>
                          </label>
                          <select
                            required
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
                          >
                            <option value="">-- Choose Destination --</option>
                            <option value="Zanzibar Airport (ZNZ)">Zanzibar Airport (ZNZ) Terminal 3</option>
                            <option value="Zanzibar Airport Domestic (ZNZ)">Zanzibar Airport Domestic Terminal 2</option>
                            <option value="Ferry Terminal Malindi">Zanzibar Ferry Port Terminal (Stone Town)</option>
                            <option value="Stone Town Hotels">Stone Town Resort Hotels</option>
                            <option value="Nungwi / Kendwa Resorts">Nungwi or Kendwa Beaches</option>
                            <option value="Paje / Jambiani / Bwejuu">Paje or Jambiani East Coast</option>
                            <option value="Matemwe / Kiwengwa">Matemwe or Kiwengwa Northeast</option>
                            <option value="Kizimkazi Coastal Area">Kizimkazi Dolphin Village South</option>
                          </select>
                        </div>
                      </div>

                      {/* Dates and Times selection */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase text-slate-500">Pickup Date *</label>
                          <input
                            type="date"
                            required
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white border rounded-lg text-xs font-semibold text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase text-slate-500">Pickup Time *</label>
                          <input
                            type="time"
                            required
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white border rounded-lg text-xs font-semibold text-slate-800"
                          />
                        </div>

                        {isRoundTrip && (
                          <>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-black uppercase text-slate-500">Return Date *</label>
                              <input
                                type="date"
                                required
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full px-3 py-2 bg-white border rounded-lg text-xs font-semibold text-slate-800"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-black uppercase text-slate-500">Return Time *</label>
                              <input
                                type="time"
                                required
                                value={returnTime}
                                onChange={(e) => setReturnTime(e.target.value)}
                                className="w-full px-3 py-2 bg-white border rounded-lg text-xs font-semibold text-slate-800"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Passenger parameters and details */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Adults</label>
                          <div className="flex items-center border rounded-xl bg-white overflow-hidden text-xs">
                            <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="px-3 py-1.5 text-slate-500 font-bold hover:bg-slate-50">-</button>
                            <span className="flex-grow text-center font-bold text-slate-800">{adults}</span>
                            <button type="button" onClick={() => setAdults(adults + 1)} className="px-3 py-1.5 text-slate-500 font-bold hover:bg-slate-50">+</button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Kids (2-11)</label>
                          <div className="flex items-center border rounded-xl bg-white overflow-hidden text-xs">
                            <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="px-3 py-1.5 text-slate-500 font-bold hover:bg-slate-50">-</button>
                            <span className="flex-grow text-center font-bold text-slate-800">{children}</span>
                            <button type="button" onClick={() => setChildren(children + 1)} className="px-3 py-1.5 text-slate-500 font-bold hover:bg-slate-50">+</button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Infants (&lt;2)</label>
                          <div className="flex items-center border rounded-xl bg-white overflow-hidden text-xs">
                            <button type="button" onClick={() => setInfants(Math.max(0, infants - 1))} className="px-3 py-1.5 text-slate-500 font-bold hover:bg-slate-50">-</button>
                            <span className="flex-grow text-center font-bold text-slate-800">{infants}</span>
                            <button type="button" onClick={() => setInfants(infants + 1)} className="px-3 py-1.5 text-slate-500 font-bold hover:bg-slate-50">+</button>
                          </div>
                        </div>
                      </div>

                      {/* Flight / Vessel / Luggage / Hotel details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                            <Luggage size={11} className="text-[#D4A017]" />
                            <span>Baggage Count *</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={luggage}
                            onChange={(e) => setLuggage(parseInt(e.target.value, 10) || 0)}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                          />
                        </div>

                        {transferCategory === 'airport' ? (
                          <>
                            <div>
                              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Flight Number</label>
                              <input
                                type="text"
                                placeholder="e.g. QR149"
                                value={flightNo}
                                onChange={(e) => setFlightNo(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Airport Terminal</label>
                              <select
                                value={airportTerminal}
                                onChange={(e) => setAirportTerminal(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                              >
                                <option value="Terminal 3 - International">Terminal 3 - International</option>
                                <option value="Terminal 2 - Domestic">Terminal 2 - Domestic</option>
                              </select>
                            </div>
                          </>
                        ) : transferCategory === 'ferry' ? (
                          <>
                            <div>
                              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Azam Boat Vessel / Time</label>
                              <input
                                type="text"
                                placeholder="e.g. Kilimanjaro VIII @ 12:30"
                                value={ferryVessel}
                                onChange={(e) => setFerryVessel(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                              />
                            </div>
                            <div className="opacity-40 pointer-events-none">
                              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">N/A</label>
                              <input type="text" disabled className="w-full px-4 py-2 bg-slate-100 border rounded-xl text-xs" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Hotel / Resort Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Royal Zanzibar Beach Resort"
                                value={hotelName}
                                onChange={(e) => setHotelName(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Specific Room/Villa No</label>
                              <input
                                type="text"
                                placeholder="e.g. Villa 401"
                                value={pickupAddress}
                                onChange={(e) => setPickupAddress(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Ride type selection and extra options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Rider Carriage Mode</label>
                          <select
                            value={transferType}
                            onChange={(e) => setTransferType(e.target.value as any)}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                          >
                            <option value="private">Private Transfer (Exclusive Luxury Cruiser)</option>
                            <option value="shared">Shared Shuttle (Cost-saving Shared Cabin)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">Waiting stopover request</label>
                          <select
                            value={waitingHours}
                            onChange={(e) => setWaitingHours(parseInt(e.target.value, 10) || 0)}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                          >
                            <option value="0">None - Direct Route Ride</option>
                            <option value="1">1 Hour Custom Stopover (+$10)</option>
                            <option value="2">2 Hours Custom Stopover (+$20)</option>
                            <option value="3">3 Hours Custom Stopover (+$30)</option>
                          </select>
                        </div>
                      </div>

                      {/* Child safety booster booster seats */}
                      <div className="flex justify-between items-center bg-[#0B3B8C]/5 border border-[#0B3B8C]/10 p-4 rounded-2xl">
                        <div className="flex gap-2 items-center">
                          <CheckCircle size={16} className="text-[#D4A017]" />
                          <div>
                            <p className="text-xs font-bold text-[#0B3B8C]">Complementary Child Safety Seats</p>
                            <p className="text-[10px] text-slate-400">Add secure ISO-certified baby booster seats to your ride.</p>
                          </div>
                        </div>
                        <div className="flex items-center border bg-white rounded-lg overflow-hidden text-xs">
                          <button type="button" onClick={() => setChildSeats(Math.max(0, childSeats - 1))} className="px-2.5 py-1 text-slate-500 font-bold">-</button>
                          <span className="w-8 text-center font-bold text-slate-800">{childSeats}</span>
                          <button type="button" onClick={() => setChildSeats(childSeats + 1)} className="px-2.5 py-1 text-slate-500 font-bold">+</button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Additional dispatch instructions</label>
                        <textarea
                          placeholder="Specify kite-surfing board luggage, airport gate details etc."
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#0B3B8C] outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSearching}
                        className="w-full bg-[#D4A017] hover:bg-[#c0910f] text-[#020C1F] font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                      >
                        <span>{isSearching ? 'PROCESSING FLEET LOGISTICS...' : 'CALCULATE RATES & MATCH FLEET'}</span>
                        <ArrowRight size={14} />
                      </button>

                    </form>
                  </div>

                  {/* Recommended Vehicles grid */}
                  {hasSearched && (
                    <div className="space-y-6 animate-fade-in" id="fleet-listing">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <Award size={18} className="text-[#D4A017]" />
                        <h3 className="text-lg font-bold text-[#0B3B8C] font-serif">
                          Select Your Scheduled Fleet Cruiser
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recommendedVehicles.map((veh, idx) => (
                          <div key={idx} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                            <div>
                              <div className="relative h-44 bg-slate-100">
                                <img src={veh.image} alt={veh.model} className="w-full h-full object-cover" />
                                {veh.status !== 'Available' && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-xs text-white uppercase font-mono tracking-wider">
                                    🔒 Fully Reserved
                                  </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full font-bold text-[9px] uppercase text-[#0B3B8C] tracking-wide shadow-sm border">
                                  Max: {veh.capacity} Pax
                                </div>
                              </div>

                              <div className="p-5 space-y-2">
                                <h4 className="font-extrabold text-slate-800 text-sm">{veh.model}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">{veh.description}</p>
                                
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                  {veh.features.map((feat: string, fIdx: number) => (
                                    <span key={fIdx} className="bg-slate-50 border text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                      {feat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Fare</span>
                                <span className="text-xl font-black text-[#D4A017]">{formatPriceVal(veh.pricing.total)}</span>
                              </div>

                              <button
                                type="button"
                                disabled={veh.status !== 'Available'}
                                onClick={() => {
                                  setSelectedVehicle(veh);
                                  setShowCheckout(true);
                                  setTimeout(() => {
                                    document.getElementById('checkout-target')?.scrollIntoView({ behavior: 'smooth' });
                                  }, 100);
                                }}
                                className="bg-[#0B3B8C] hover:bg-blue-900 disabled:bg-slate-300 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-all uppercase tracking-wider"
                              >
                                Book Cruiser
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Right Column: Interactive Map and checkout breakdown */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Checkout modal drawer */}
              {showCheckout && selectedVehicle && !bookingSuccess && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5 animate-fade-in" id="checkout-target">
                  <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="font-extrabold text-[#0B3B8C] text-sm flex items-center gap-1.5 font-serif">
                      <CreditCard size={14} className="text-[#D4A017]" />
                      <span>Excursion Checkout Ledger</span>
                    </h3>
                    <button onClick={() => setShowCheckout(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={16} />
                    </button>
                  </div>

                  {/* Multi-currency dropdown */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Quotation Currency:</span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      className="bg-slate-100 border p-1 rounded-lg font-bold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="TZS">TZS (TSh)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  {/* Pricing Breakdown Sheet */}
                  <div className="bg-slate-50 rounded-2xl p-4 border space-y-3 text-xs font-semibold text-slate-700">
                    <p className="font-black text-[#0B3B8C] uppercase text-[9px] tracking-wider border-b pb-1.5">Direct Rate Quotation</p>
                    <div className="flex justify-between">
                      <span>Base route fee ({transferType}):</span>
                      <span>{formatPriceVal(selectedVehicle.pricing.base)}</span>
                    </div>
                    {selectedVehicle.pricing.nightFee > 0 && (
                      <div className="flex justify-between text-amber-700">
                        <span>Night Surcharge (22:00-06:00):</span>
                        <span>{formatPriceVal(selectedVehicle.pricing.nightFee)}</span>
                      </div>
                    )}
                    {selectedVehicle.pricing.childSeatFee > 0 && (
                      <div className="flex justify-between">
                        <span>Baby safety seats booster fee:</span>
                        <span>{formatPriceVal(selectedVehicle.pricing.childSeatFee)}</span>
                      </div>
                    )}
                    {selectedVehicle.pricing.waitingFee > 0 && (
                      <div className="flex justify-between text-blue-700">
                        <span>Wait Time stops premium:</span>
                        <span>{formatPriceVal(selectedVehicle.pricing.waitingFee)}</span>
                      </div>
                    )}
                    {selectedVehicle.pricing.extraLuggageFee > 0 && (
                      <div className="flex justify-between text-rose-700">
                        <span>Excess Baggage charge:</span>
                        <span>{formatPriceVal(selectedVehicle.pricing.extraLuggageFee)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-[10px] text-slate-400 italic">
                      <span>Season adjustment:</span>
                      <span>{selectedVehicle.pricing.seasonalLabel}</span>
                    </div>

                    {promoApplied && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Promo Code ({promoApplied.code}):</span>
                        <span>-{formatPriceVal(selectedVehicle.pricing.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Zanzibar Government VAT (18%):</span>
                      <span>{formatPriceVal(selectedVehicle.pricing.tax)}</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-dashed text-sm font-black text-slate-900">
                      <span>Grand Total Amount:</span>
                      <span className="text-[#D4A017] text-base">{formatPriceVal(selectedVehicle.pricing.total)}</span>
                    </div>
                  </div>

                  {/* Coupon Field */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Coupon Code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-grow p-2 border rounded-xl text-xs font-semibold uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="bg-slate-800 text-white font-bold px-3 py-2 rounded-xl text-xs hover:bg-black"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Checkout Lead passenger form */}
                  <form onSubmit={handleConfirmBooking} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">WhatsApp Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+44 7911 123456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-slate-800 bg-white"
                      >
                        <option value="later">Hold Booking & Pay Driver in Cash Later</option>
                        <option value="card">Prepay with Card (Instant confirmation)</option>
                        <option value="mobile_money">Prepay via M-Pesa Mobile Money</option>
                      </select>
                    </div>

                    {paymentMethod !== 'later' && (
                      <div className="bg-slate-50 p-3 rounded-xl border space-y-2 text-[10px] animate-fade-in">
                        <p className="font-bold text-[#0B3B8C]">Direct Prepayment fields:</p>
                        <input type="text" placeholder="Card Number or Account Phone" className="w-full p-2 border bg-white rounded text-xs" required />
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="MM/YY" className="p-2 border bg-white rounded text-xs text-center" required />
                          <input type="password" placeholder="CVV" className="p-2 border bg-white rounded text-xs text-center" required />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#0B3B8C] hover:bg-blue-900 text-white font-extrabold py-3 rounded-xl text-xs shadow-md transition-all uppercase tracking-wider cursor-pointer"
                    >
                      {isSubmitting ? 'Securing Dispatch Schedule...' : 'Lock Dynamic Transfer Ride'}
                    </button>
                  </form>
                </div>
              )}

              {/* Interactive Route Map Visualizer */}
              <TransferMap pickup={pickup} destination={destination} />

              {/* Side index table of standard flat zones */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h4 className="font-bold text-[#0B3B8C] font-serif text-sm flex items-center gap-1.5">
                  <Compass size={14} className="text-[#D4A017]" />
                  <span>Authorized Fixed Zone Directory</span>
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">Official baseline prices regulated by the Zanzibar Commission for Tourism. No hidden airport toll surcharges.</p>
                <div className="space-y-2">
                  {routes.map((rt) => (
                    <div key={rt.id} className="flex justify-between items-center text-xs border-b pb-1.5">
                      <div>
                        <p className="font-bold text-slate-700 text-[11px] truncate max-w-[150px]">{rt.destination}</p>
                        <span className="text-[9px] text-slate-400 font-medium">Estimated: {rt.duration}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-[#D4A017]">{formatPriceVal(rt.priceOneWay)}</p>
                        <span className="text-[8px] text-slate-400 font-bold uppercase block">Oneway</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secure Trust safety flags */}
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl space-y-3.5">
                <h4 className="font-bold text-[#0B3B8C] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={14} className="text-[#D4A017]" />
                  <span>Direct Safety Warranties</span>
                </h4>
                <div className="space-y-2 text-[10px] leading-relaxed text-slate-600">
                  <p>✔ <strong>Full Tourist Insurance:</strong> Every fleet cruiser is fully commercially licensed and carrying extensive passenger group coverage.</p>
                  <p>✔ <strong>Delayed Flight Buffer:</strong> In case of flight or ferry changes, our dispatch operations team tracks radar timetables with zero additional wait charges.</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
