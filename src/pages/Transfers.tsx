import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../hooks/useHashRouter';
import { 
  Shield, Clock, Users, MapPin, CheckCircle, Navigation, Info, ArrowRight, 
  Calendar, Luggage, Plane, CreditCard, Check, Sparkles, Send, Phone, Eye, X, Award,
  Compass, RefreshCw, HelpCircle, ArrowLeftRight, Star, ThumbsUp, ChevronDown, ChevronUp, MessageSquare
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
  key: string;
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
    key: 'economy_sedan',
    model: 'Economy Sedan (Toyota Camry / Saloon)', 
    capacity: 3, 
    luggageCapacity: 2, 
    features: ['Fully Air-Conditioned', 'Free On-board Wi-Fi', 'Complimentary Bottled Water', 'Professional Chauffeur', 'Phone Charger Ports'], 
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=compress&cs=tinysrgb&w=800', 
    description: 'Sleek and highly efficient private sedan. Perfect for solo travelers, couples, or corporate visits.', 
    status: 'Available',
    priceAdjustment: -5
  },
  { 
    id: 'v-2', 
    key: 'suv_cruiser',
    model: 'Rugged SUV Cruiser (Toyota Land Cruiser 4x4)', 
    capacity: 4, 
    luggageCapacity: 3, 
    features: ['Heavy Duty AWD 4x4', 'Climate Control A/C', 'English Speaking Guide', 'Elevated Panoramic Windows', 'Complimentary Cold Water', 'USB Chargers'], 
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=compress&cs=tinysrgb&w=800', 
    description: 'Tough, spacious, and luxurious 4x4 cruiser built to glide over any terrain on the island in absolute style.', 
    status: 'Available',
    priceAdjustment: 20
  },
  { 
    id: 'v-3', 
    key: 'luxury_alphard',
    model: 'Luxury Alphard Executive VIP', 
    capacity: 5, 
    luggageCapacity: 4, 
    features: ['First-Class Reclining VIP Seats', 'Triple-Zone Climate Control', 'Ultra-Quiet Ride Cabin', 'Ambient LED lighting', 'Snacks & Soft Drinks', 'Child Seat Support'], 
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=compress&cs=tinysrgb&w=800', 
    description: 'The pinnacle of road luxury in Zanzibar. Spoil yourself or business guests with premium business class comfort.', 
    status: 'Available',
    priceAdjustment: 15
  },
  { 
    id: 'v-4', 
    key: 'standard_minivan',
    model: 'Toyota Noah / Alphard Standard Minibus', 
    capacity: 6, 
    luggageCapacity: 5, 
    features: ['Spacious Cabin Layout', 'Excellent Air Conditioning', 'Large Luggage Compartment', 'Complimentary Baggage Assist', 'Local Swahili Guide'], 
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=compress&cs=tinysrgb&w=800', 
    description: 'Our most dependable and popular beach resort shuttle. Incredible price-to-comfort ratio for families.', 
    status: 'Available',
    priceAdjustment: 0
  },
  { 
    id: 'v-5', 
    key: 'coaster_bus',
    model: 'Toyota Coaster Premium Group Coach', 
    capacity: 20, 
    luggageCapacity: 15, 
    features: ['High-Capacity Seating', 'Dual Heavy A/C blowers', 'Microphone PA System', 'Separate Custom Luggage Trailer', 'Bottled Mineral Water', 'Emergency First-Aid Kit'], 
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=compress&cs=tinysrgb&w=800', 
    description: 'Spacious and safe multi-passenger coach. Crafted specifically for tour groups, wedding parties, or team retreats.', 
    status: 'Available',
    priceAdjustment: 50
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

  // Step wizard for booking (Step 1: Type, Step 2: Logistics, Step 3: Vehicle & Contact)
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);

  // Advanced options panel expand toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // FAQ accordion active state
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const bookingWidgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject structured SEO data & Title
    document.title = "Zanzibar Private Transfers - Airport & Hotel Shuttles | Zanzibar Trip & Relax";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Book licensed private airport transfers and hotel shuttles across Zanzibar. Fixed upfront pricing, real-time tracking, professional bilingual chauffeurs, and luxury vehicles.');
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

    // Load LocalStorage parameters or set defaults
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
  
  // Specific inputs (Advanced options)
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

  // Recommendation states
  const [recommendedVehicles, setRecommendedVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  // Checkout states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money' | 'later'>('later');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Handle promo code
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
    
    // Adjust based on private vs shared and vehicle offset
    if (transferType === 'shared') {
      const totalPax = adults + children;
      base = Math.max(12, Math.round((route.priceOneWay * 0.4) * totalPax));
    } else {
      base += vehicle.priceAdjustment;
    }

    // Night surcharge (22:00 / 10 PM to 06:00 / 6 AM)
    let nightFee = 0;
    if (pickupTime) {
      const hour = parseInt(pickupTime.split(':')[0], 10);
      if (hour >= 22 || hour < 6) {
        nightFee = 15;
      }
    }

    // Extra luggage fee if luggage exceeds capacity
    let extraLuggageFee = 0;
    if (luggage > vehicle.luggageCapacity) {
      extraLuggageFee = (luggage - vehicle.luggageCapacity) * 5;
    }

    // Child seat charge
    const childSeatFee = childSeats * 5;

    // Waiting stops charge
    const waitingFee = waitingHours * 10;

    // Seasonality adjustment
    let seasonalLabel = 'Regular Season';
    let seasonalRate = 1.0;
    if (pickupDate) {
      try {
        const month = new Date(pickupDate).getMonth();
        if ([11, 0, 1, 6, 7, 8].includes(month)) {
          seasonalRate = 1.15; // Peak dry season
          seasonalLabel = 'Dry Peak Season (+15%)';
        } else if ([3, 4].includes(month)) {
          seasonalRate = 0.90; // Low rainy season
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

  const handleStep1Select = (catId: 'airport' | 'hotel' | 'ferry' | 'beach' | 'safari') => {
    setTransferCategory(catId);
    setBookingStep(2);
    showToast(`Category set to ${catId.toUpperCase()}. Let's customize your route details.`, 'info');
  };

  const handleStep2Submit = (e: React.FormEvent) => {
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

    // Match route and generate vehicle details
    let matchedRoute = routes.find(r => 
      (r.pickup.toLowerCase().includes(pickup.toLowerCase()) && r.destination.toLowerCase().includes(destination.toLowerCase())) ||
      (r.pickup.toLowerCase().includes(destination.toLowerCase()) && r.destination.toLowerCase().includes(pickup.toLowerCase()))
    );

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

    // Recommended vehicles based on passenger and luggage limits
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
    
    // Auto-select the top scored vehicle
    if (recs.length > 0) {
      setSelectedVehicle(recs[0]);
    }

    setBookingStep(3);
    showToast('Dynamic route parsed! Fleet matched successfully.', 'success');
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone) {
      showToast('Please fill in all contact details', 'error');
      return;
    }
    if (!selectedVehicle) {
      showToast('Please select a vehicle to complete booking', 'error');
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
        action: `Booked private transfer ${bookingId} (${pickup} ➔ ${destination})`
      };
      localStorage.setItem('ztr_activity_logs', JSON.stringify([newLog, ...logs]));

      setBookingSuccess({
        booking: newBooking,
        driver: assignedDriver
      });
      setIsSubmitting(false);
      showToast('Zanzibar private transfer booking confirmed instantly!', 'success');
    }, 1200);
  };

  const handlePopularRouteClick = (from: string, to: string, catId: 'airport' | 'hotel' | 'ferry' | 'beach' | 'safari') => {
    setPickup(from);
    setDestination(to);
    setTransferCategory(catId);
    setBookingStep(2);
    showToast(`Pre-selected route: ${from} to ${to}`, 'info');
    
    // Smooth scroll up to booking widget
    bookingWidgetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  const scrollToBookingForm = () => {
    bookingWidgetRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 pb-16 relative">
      
      {/* 1. Full-Width Hero Banner */}
      <section className="relative min-h-[450px] md:min-h-[550px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform hover:scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=compress&cs=tinysrgb&w=1600')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent" />
        
        {/* Subtle decorative overlay */}
        <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-[#FAFAFA] to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-[#D4A017]/15 border border-[#D4A017]/30 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <Sparkles className="text-[#D4A017] w-3.5 h-3.5 animate-pulse" />
              <span className="text-[#D4A017] uppercase tracking-widest font-extrabold text-[10px]">
                Zanzibar Trip & Relax Premium Transfers
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight font-serif tracking-tight">
              Private Zanzibar <br/>
              <span className="text-[#D4A017]">Airport & Hotel</span> Transfers
            </h1>
            
            <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed font-medium">
              Arrive in style. Enjoy an exclusive, stress-free luxury transportation experience across Zanzibar. No waiting lines, no dynamic surge rates, and 100% certified bilingual chauffeurs.
            </p>

            {/* Premium Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4">
              {[
                { label: 'Licensed Operator', desc: 'Full Tourist Insurance', icon: <Shield className="w-5 h-5 text-[#D4A017]" /> },
                { label: 'Flight Tracking', desc: 'No Delay Charges', icon: <Clock className="w-5 h-5 text-[#D4A017]" /> },
                { label: 'Fixed Prices', desc: 'All Taxes & Tolls Included', icon: <CreditCard className="w-5 h-5 text-[#D4A017]" /> },
                { label: '24/7 Service', desc: 'WhatsApp & Chauffeur Dispatch', icon: <Phone className="w-5 h-5 text-[#D4A017]" /> },
                { label: 'No Hidden Fees', desc: 'Pay Cash or Prepay Securely', icon: <CheckCircle className="w-5 h-5 text-[#D4A017]" /> }
              ].map((badge, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 flex flex-col items-start gap-1">
                  <div className="p-1.5 bg-white/10 rounded-xl mb-1">{badge.icon}</div>
                  <span className="text-white text-xs font-bold leading-tight">{badge.label}</span>
                  <span className="text-[9px] text-slate-400 font-medium">{badge.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ label: 'Zanzibar Transfers & Shuttles' }]} navigate={navigate} />

      {/* Main Grid Wrapper */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Configurator Terminal */}
        <div className="lg:col-span-8 space-y-8" ref={bookingWidgetRef} id="booking-widget">
          
          {/* Toggle Tab Navigation */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 max-w-md mx-auto shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'book' ? 'bg-[#0B3B8C] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              🛫 Book Private Transfer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'track' ? 'bg-[#0B3B8C] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              🔍 Manage & Edit Rides
            </button>
          </div>

          {activeTab === 'track' ? (
            <TransferTracker onBackToBooking={() => setActiveTab('book')} />
          ) : (
            <div className="space-y-8">
              
              {bookingSuccess ? (
                /* Success screen */
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-6 md:p-8 space-y-6 animate-fade-in">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                      <CheckCircle size={36} />
                    </div>
                    <h2 className="text-2xl font-black text-[#0B3B8C] font-serif">Your Ride is Confirmed!</h2>
                    <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
                      Karibu Zanzibar! Your premium vehicle allocation and chauffeur schedules are locked in.
                    </p>
                    <div className="inline-block bg-slate-100 font-mono text-xs text-[#0B3B8C] font-extrabold px-3 py-1.5 rounded-full border">
                      Booking Code: {bookingSuccess.booking.id}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3 text-xs">
                      <Clock className="text-emerald-600 mt-0.5 shrink-0" size={16} />
                      <div>
                        <h4 className="font-bold text-emerald-950">Voucher Sent by Email</h4>
                        <p className="text-emerald-700 mt-1">A printable travel voucher and arrivals layout has been sent to <strong>{bookingSuccess.booking.email}</strong>.</p>
                      </div>
                    </div>
                    <div className="bg-[#25D366]/10 border border-[#25D366]/20 p-4 rounded-2xl flex items-start gap-3 text-xs">
                      <Send className="text-[#25D366] mt-0.5 shrink-0" size={16} />
                      <div>
                        <h4 className="font-bold text-emerald-950 font-mono">WhatsApp Dispatch Alert</h4>
                        <p className="text-emerald-700 mt-1">Live SMS updates and driver status details have been sent to <strong>{bookingSuccess.booking.whatsapp_number}</strong>.</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary voucher cards */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 text-xs space-y-3.5">
                    <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] border-b pb-1.5 flex items-center gap-1.5">
                      <Compass size={12} className="text-[#D4A017]" />
                      <span>Ride Manifest Details</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                      <p><strong className="text-slate-500">Pickup Zone:</strong> {bookingSuccess.booking.pickup}</p>
                      <p><strong className="text-slate-500">Destination:</strong> {bookingSuccess.booking.destination}</p>
                      <p><strong className="text-slate-500">Boarding Time:</strong> {bookingSuccess.booking.pickup_date} @ {bookingSuccess.booking.pickup_time}</p>
                      <p><strong className="text-slate-500">Passengers:</strong> {bookingSuccess.booking.number_of_guests} travelers</p>
                      <p><strong className="text-slate-500">Vehicle Type:</strong> {selectedVehicle?.model}</p>
                      <p><strong className="text-slate-500">Status:</strong> <span className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-[10px] text-slate-800">Confirmed</span></p>
                      <p><strong className="text-slate-500">Payment:</strong> {paymentMethod === 'later' ? 'Cash to Driver Later' : 'Paid in Full'}</p>
                      <p><strong className="text-slate-500">Grand Total:</strong> <span className="text-[#D4A017] font-black">{formatPriceVal(bookingSuccess.booking.total_amount)}</span></p>
                    </div>
                  </div>

                  {/* Driver details assignment */}
                  {bookingSuccess.driver && (
                    <div className="bg-[#0B3B8C]/5 border border-[#0B3B8C]/15 p-4 rounded-2xl flex items-center gap-4 text-xs">
                      <img
                        src={bookingSuccess.driver.photo}
                        alt="Zanzibar driver portrait"
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div>
                        <span className="bg-[#0B3B8C] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block">Assigned Chauffeur</span>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-1">{bookingSuccess.driver.name}</h4>
                        <p className="text-slate-400 mt-0.5">Languages: {bookingSuccess.driver.languages.join(', ')}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => {
                        setBookingSuccess(null);
                        setSelectedVehicle(null);
                        setBookingStep(1);
                        setPickup('');
                        setDestination('');
                      }}
                      className="bg-[#0B3B8C] hover:bg-blue-900 text-white font-bold px-8 py-3 rounded-full text-xs shadow-md transition-all uppercase tracking-wider"
                    >
                      Book Another Private Transfer
                    </button>
                  </div>
                </div>
              ) : (
                /* Step Wizard Form */
                <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                  
                  {/* Progress steps indicators */}
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${bookingStep === 1 ? 'bg-[#0B3B8C] text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>1</span>
                      <span className={`font-bold transition-all ${bookingStep === 1 ? 'text-[#0B3B8C]' : 'text-slate-500'}`}>Transfer Type</span>
                    </div>
                    <div className="h-0.5 w-12 bg-slate-200" />
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${bookingStep === 2 ? 'bg-[#0B3B8C] text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>2</span>
                      <span className={`font-bold transition-all ${bookingStep === 2 ? 'text-[#0B3B8C]' : 'text-slate-500'}`}>Ride Logistics</span>
                    </div>
                    <div className="h-0.5 w-12 bg-slate-200" />
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${bookingStep === 3 ? 'bg-[#0B3B8C] text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>3</span>
                      <span className={`font-bold transition-all ${bookingStep === 3 ? 'text-[#0B3B8C]' : 'text-slate-500'}`}>Vehicle & Checkout</span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-6">
                    
                    {/* STEP 1: CHOOSE EXPERIENCE CATEGORY */}
                    {bookingStep === 1 && (
                      <div className="space-y-6 animate-fade-in">
                        <div className="text-center space-y-2">
                          <h2 className="text-2xl font-bold text-[#0B3B8C] font-serif">Step 1: Choose Your Experience Category</h2>
                          <p className="text-xs text-slate-400">Select where your ride begins or ends to proceed to route logistics.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-4">
                          {[
                            { id: 'airport', label: 'Airport Transfer', desc: 'Terminal 2 & 3 custom meet & greets', icon: '🛫' },
                            { id: 'hotel', label: 'Hotel Transfer', desc: 'Comfortable resort-to-resort shuttles', icon: '🏨' },
                            { id: 'ferry', label: 'Ferry Transfer', desc: 'Malindi Marine Harbour transits', icon: '⛴' },
                            { id: 'beach', label: 'Beach Shuttle', desc: 'Coast-to-coast day excursions', icon: '🏖' },
                            { id: 'safari', label: 'Safari Connect', desc: 'Airstrip/National Park express transport', icon: '🦁' },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleStep1Select(cat.id as any)}
                              className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between hover:border-[#0B3B8C] hover:shadow-md ${
                                transferCategory === cat.id 
                                  ? 'border-[#0B3B8C] bg-[#0B3B8C]/5 text-[#0B3B8C]' 
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              <span className="text-3xl mb-4">{cat.icon}</span>
                              <div>
                                <p className="text-xs font-black truncate">{cat.label}</p>
                                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{cat.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 2: LOGISTICS, DATES, ROUTE MAP */}
                    {bookingStep === 2 && (
                      <form onSubmit={handleStep2Submit} className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between border-b pb-4">
                          <div>
                            <h2 className="text-2xl font-bold text-[#0B3B8C] font-serif">Step 2: Customize Logistics & Route</h2>
                            <p className="text-xs text-slate-400">Select your zones, dates, passengers, and extra features.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBookingStep(1)}
                            className="text-xs text-[#0B3B8C] font-extrabold flex items-center gap-1 hover:underline"
                          >
                            <ArrowLeftRight className="w-3 h-3" /> Change Category
                          </button>
                        </div>

                        {/* One Way / Round Trip toggle */}
                        <div className="flex gap-4 p-1 bg-slate-100 rounded-xl max-w-sm">
                          <button
                            type="button"
                            onClick={() => setIsRoundTrip(false)}
                            className={`flex-1 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all ${
                              !isRoundTrip ? 'bg-white text-[#0B3B8C] shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            One Way
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsRoundTrip(true)}
                            className={`flex-1 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                              isRoundTrip ? 'bg-white text-[#0B3B8C] shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <span>Round Trip</span>
                            <span className="bg-[#D4A017] text-[#020C1F] text-[8px] font-black px-1.5 py-0.5 rounded-full">Save 15%</span>
                          </button>
                        </div>

                        {/* Route Selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                              <MapPin size={10} className="text-[#D4A017]" />
                              <span>Pickup Location *</span>
                            </label>
                            <select
                              required
                              value={pickup}
                              onChange={(e) => setPickup(e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
                            >
                              <option value="">-- Choose Pickup Area --</option>
                              <option value="Zanzibar Airport (ZNZ)">Zanzibar Airport (ZNZ) - International (T3)</option>
                              <option value="Zanzibar Airport Domestic (ZNZ)">Zanzibar Airport (ZNZ) - Domestic (T2)</option>
                              <option value="Ferry Terminal Malindi">Zanzibar Ferry Port Terminal (Stone Town)</option>
                              <option value="Stone Town Hotels">Stone Town Hotels & Resorts</option>
                              <option value="Nungwi / Kendwa Resorts">Nungwi or Kendwa Beaches</option>
                              <option value="Paje / Jambiani / Bwejuu">Paje or Jambiani East Coast</option>
                              <option value="Matemwe / Kiwengwa">Matemwe or Kiwengwa Northeast</option>
                              <option value="Kizimkazi Coastal Area">Kizimkazi Dolphin Village South</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5 flex items-center gap-1">
                              <MapPin size={10} className="text-[#D4A017]" />
                              <span>Destination Location *</span>
                            </label>
                            <select
                              required
                              value={destination}
                              onChange={(e) => setDestination(e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] outline-none text-slate-800"
                            >
                              <option value="">-- Choose Drop-off Area --</option>
                              <option value="Zanzibar Airport (ZNZ)">Zanzibar Airport (ZNZ) - International (T3)</option>
                              <option value="Zanzibar Airport Domestic (ZNZ)">Zanzibar Airport (ZNZ) - Domestic (T2)</option>
                              <option value="Ferry Terminal Malindi">Zanzibar Ferry Port Terminal (Stone Town)</option>
                              <option value="Stone Town Hotels">Stone Town Hotels & Resorts</option>
                              <option value="Nungwi / Kendwa Resorts">Nungwi or Kendwa Beaches</option>
                              <option value="Paje / Jambiani / Bwejuu">Paje or Jambiani East Coast</option>
                              <option value="Matemwe / Kiwengwa">Matemwe or Kiwengwa Northeast</option>
                              <option value="Kizimkazi Coastal Area">Kizimkazi Dolphin Village South</option>
                            </select>
                          </div>
                        </div>

                        {/* Dates and Times Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
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

                        {/* Travelers & Luggage */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Adults (12+ yrs)</label>
                            <div className="flex items-center border rounded-xl bg-white overflow-hidden text-xs">
                              <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="px-3 py-2 text-slate-500 font-bold hover:bg-slate-50">-</button>
                              <span className="flex-grow text-center font-bold text-slate-800">{adults}</span>
                              <button type="button" onClick={() => setAdults(adults + 1)} className="px-3 py-2 text-slate-500 font-bold hover:bg-slate-50">+</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Kids (2-11 yrs)</label>
                            <div className="flex items-center border rounded-xl bg-white overflow-hidden text-xs">
                              <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="px-3 py-2 text-slate-500 font-bold hover:bg-slate-50">-</button>
                              <span className="flex-grow text-center font-bold text-slate-800">{children}</span>
                              <button type="button" onClick={() => setChildren(children + 1)} className="px-3 py-2 text-slate-500 font-bold hover:bg-slate-50">+</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Infants (&lt;2 yrs)</label>
                            <div className="flex items-center border rounded-xl bg-white overflow-hidden text-xs">
                              <button type="button" onClick={() => setInfants(Math.max(0, infants - 1))} className="px-3 py-2 text-slate-500 font-bold hover:bg-slate-50">-</button>
                              <span className="flex-grow text-center font-bold text-slate-800">{infants}</span>
                              <button type="button" onClick={() => setInfants(infants + 1)} className="px-3 py-2 text-slate-500 font-bold hover:bg-slate-50">+</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 flex items-center gap-1">
                              <Luggage className="w-3 h-3 text-[#D4A017]" />
                              <span>Bags Count *</span>
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={luggage}
                              onChange={(e) => setLuggage(parseInt(e.target.value, 10) || 0)}
                              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#0B3B8C]"
                            />
                          </div>
                        </div>

                        {/* Expandable Advanced Options Section */}
                        <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                          <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full px-4 py-3.5 flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-100/50 border-b border-slate-200 hover:bg-slate-100 transition-all text-left"
                          >
                            <span className="flex items-center gap-1.5 text-[#0B3B8C]">
                              <Info className="w-3.5 h-3.5 text-[#D4A017]" />
                              Configure Advanced Options (Child Seats, Flight Schedulers, Custom Dispatch)
                            </span>
                            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          {showAdvanced && (
                            <div className="p-4 space-y-4 animate-fade-in text-xs">
                              
                              {/* Flight & Terminal details for Airport Category */}
                              {transferCategory === 'airport' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Flight Number</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. QR149"
                                      value={flightNo}
                                      onChange={(e) => setFlightNo(e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Airport Terminal</label>
                                    <select
                                      value={airportTerminal}
                                      onChange={(e) => setAirportTerminal(e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
                                    >
                                      <option value="Terminal 3 - International">Terminal 3 - International Arrivals</option>
                                      <option value="Terminal 2 - Domestic">Terminal 2 - Domestic Arrivals</option>
                                    </select>
                                  </div>
                                </div>
                              )}

                              {/* Ferry Specifics */}
                              {transferCategory === 'ferry' && (
                                <div>
                                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Azam Marine Boat Vessel / Voyage Time</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Kilimanjaro VIII @ 12:30"
                                    value={ferryVessel}
                                    onChange={(e) => setFerryVessel(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
                                  />
                                </div>
                              )}

                              {/* Hotel specifics */}
                              {['hotel', 'beach', 'safari'].includes(transferCategory) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Hotel or Resort Name</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Royal Zanzibar Beach Resort"
                                      value={hotelName}
                                      onChange={(e) => setHotelName(e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Specific Room / Villa No (Optional)</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Ocean Villa 105"
                                      value={pickupAddress}
                                      onChange={(e) => setPickupAddress(e.target.value)}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Carriage mode and Custom waiting stopovers */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Rider Carriage Mode</label>
                                  <select
                                    value={transferType}
                                    onChange={(e) => setTransferType(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
                                  >
                                    <option value="private">Private Transfer (Exclusive Luxury Cruiser)</option>
                                    <option value="shared">Shared Shuttle (Cost-saving Shared Cabin)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Waiting stopover request</label>
                                  <select
                                    value={waitingHours}
                                    onChange={(e) => setWaitingHours(parseInt(e.target.value, 10) || 0)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none"
                                  >
                                    <option value="0">None - Direct Route Ride</option>
                                    <option value="1">1 Hour Custom Stopover (+$10)</option>
                                    <option value="2">2 Hours Custom Stopover (+$20)</option>
                                    <option value="3">3 Hours Custom Stopover (+$30)</option>
                                  </select>
                                </div>
                              </div>

                              {/* Complementary Child Booster Safety Seats */}
                              <div className="flex justify-between items-center bg-[#0B3B8C]/5 border border-[#0B3B8C]/10 p-3.5 rounded-xl">
                                <div>
                                  <p className="text-xs font-bold text-[#0B3B8C] flex items-center gap-1">
                                    <CheckCircle size={13} className="text-[#D4A017]" />
                                    <span>Baby Booster Safety Seats</span>
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Complimentary ISO-certified toddler seats for secure travel.</p>
                                </div>
                                <div className="flex items-center border bg-white rounded-lg overflow-hidden">
                                  <button type="button" onClick={() => setChildSeats(Math.max(0, childSeats - 1))} className="px-2.5 py-1 text-slate-500 font-bold hover:bg-slate-50">-</button>
                                  <span className="w-8 text-center font-bold text-slate-800">{childSeats}</span>
                                  <button type="button" onClick={() => setChildSeats(childSeats + 1)} className="px-2.5 py-1 text-slate-500 font-bold hover:bg-slate-50">+</button>
                                </div>
                              </div>

                              {/* Special Dispatch Instructions */}
                              <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Additional dispatch instructions</label>
                                <textarea
                                  placeholder="Specify extra baggage notes, sport board logistics, or other instructions..."
                                  value={specialRequests}
                                  onChange={(e) => setSpecialRequests(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 outline-none focus:border-[#0B3B8C]"
                                />
                              </div>

                            </div>
                          )}
                        </div>

                        {/* Calculate button */}
                        <button
                          type="submit"
                          className="w-full bg-[#0B3B8C] hover:bg-blue-900 text-white font-extrabold py-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                        >
                          <span>CALCULATE RATES & MATCH FLEET</span>
                          <ArrowRight size={14} className="text-[#D4A017]" />
                        </button>
                      </form>
                    )}

                    {/* STEP 3: SELECT FLEET CRUISER & PASSENGER CHECKOUT */}
                    {bookingStep === 3 && selectedVehicle && (
                      <div className="space-y-6 animate-fade-in text-left">
                        <div className="flex items-center justify-between border-b pb-4">
                          <div>
                            <h2 className="text-2xl font-bold text-[#0B3B8C] font-serif">Step 3: Select Vehicle & Checkout</h2>
                            <p className="text-xs text-slate-400">Match the ultimate cruiser and register passenger logistics.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setBookingStep(2);
                              setSelectedVehicle(null);
                            }}
                            className="text-xs text-[#0B3B8C] font-extrabold flex items-center gap-1 hover:underline"
                          >
                            <ArrowLeftRight className="w-3 h-3" /> Adjust Logistics
                          </button>
                        </div>

                        {/* FLEET MULTI-VEHICLE GRID */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                            <Award className="text-[#D4A017] w-4 h-4" />
                            <span>Recommended Fleet Cruisers</span>
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendedVehicles.map((veh) => {
                              const isSelected = selectedVehicle.id === veh.id;
                              return (
                                <div 
                                  key={veh.id}
                                  onClick={() => setSelectedVehicle(veh)}
                                  className={`rounded-2xl border-2 p-4 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                                    isSelected 
                                      ? 'border-[#0B3B8C] bg-[#0B3B8C]/5' 
                                      : 'border-slate-200 bg-white hover:border-slate-400'
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="absolute top-0 right-0 bg-[#0B3B8C] text-white px-3 py-1 rounded-bl-xl font-bold text-[8px] uppercase tracking-wide">
                                      ✓ Selected
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-4">
                                    <img 
                                      src={veh.image} 
                                      alt={veh.model} 
                                      className="w-20 h-20 rounded-xl object-cover shrink-0 border"
                                    />
                                    <div className="space-y-1">
                                      <h4 className="font-extrabold text-[#0B3B8C] text-xs">{veh.model}</h4>
                                      <p className="text-[10px] text-slate-500 font-medium line-clamp-2">{veh.description}</p>
                                      <div className="flex gap-2 text-[9px] text-slate-400 font-semibold pt-1">
                                        <span>👥 Max: {veh.capacity} Guests</span>
                                        <span>•</span>
                                        <span>💼 Luggage: {veh.luggageCapacity} Bags</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-3 text-xs">
                                    <span className="text-slate-400 font-bold uppercase text-[9px]">Calculated Price</span>
                                    <span className="text-[#D4A017] font-black text-sm">{formatPriceVal(veh.pricing.total)}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* PASSENGER DETAILS FORM & LEDGER BREAKDOWN */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                          
                          {/* Left: Contact Info */}
                          <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Users className="text-[#D4A017] w-4 h-4" />
                              <span>Lead Passenger Information</span>
                            </h3>

                            <form onSubmit={handleConfirmBooking} className="space-y-3.5 text-xs">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">First Name *</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. Jane"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full px-3 py-2.5 border rounded-xl text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B3B8C]/15 outline-none font-semibold transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Last Name *</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. Smith"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full px-3 py-2.5 border rounded-xl text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B3B8C]/15 outline-none font-semibold transition-all"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Email Address *</label>
                                <input
                                  type="email"
                                  required
                                  placeholder="e.g. janesmith@example.com"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="w-full px-3 py-2.5 border rounded-xl text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B3B8C]/15 outline-none font-semibold transition-all"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">WhatsApp Mobile * (With Country Code)</label>
                                <input
                                  type="tel"
                                  required
                                  placeholder="e.g. +44 7911 123456"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  className="w-full px-3 py-2.5 border rounded-xl text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#0B3B8C]/15 outline-none font-semibold transition-all"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Payment Policy Choice</label>
                                <select
                                  value={paymentMethod}
                                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                                  className="w-full px-3 py-2.5 border rounded-xl text-xs text-slate-800 bg-white focus:ring-2 focus:ring-[#0B3B8C]/15 outline-none font-semibold"
                                >
                                  <option value="later">Secure Reservation & Pay Driver Cash Later</option>
                                  <option value="card">Prepay with Card (Instant Ticket Allocation)</option>
                                  <option value="mobile_money">Prepay with M-Pesa Mobile Money</option>
                                </select>
                              </div>

                              {paymentMethod !== 'later' && (
                                <div className="bg-slate-50 p-3 rounded-xl border space-y-2 text-[10px] animate-fade-in">
                                  <p className="font-bold text-[#0B3B8C]">Simulated Prepayment Credentials:</p>
                                  <input type="text" placeholder="Card Number / Wallet Identifier" className="w-full p-2 border bg-white rounded text-xs" required />
                                  <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="MM/YY" className="p-2 border bg-white rounded text-xs text-center" required />
                                    <input type="password" placeholder="CVV" className="p-2 border bg-white rounded text-xs text-center" required />
                                  </div>
                                </div>
                              )}

                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#D4A017] hover:bg-[#b5880c] text-[#020C1F] font-black py-4 rounded-xl shadow-md transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                {isSubmitting ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin text-[#020C1F]" />
                                    <span>Allocating Dispatch Schedule...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 text-[#020C1F]" />
                                    <span>Confirm Premium Private Ride</span>
                                  </>
                                )}
                              </button>
                            </form>
                          </div>

                          {/* Right: Pricing Ledger */}
                          <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center">
                              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <CreditCard className="text-[#D4A017] w-4 h-4" />
                                <span>Checkout Ledger</span>
                              </h3>

                              <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as any)}
                                className="bg-white border text-[10px] p-1 rounded font-bold outline-none"
                              >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="TZS">TZS (TSh)</option>
                                <option value="GBP">GBP (£)</option>
                              </select>
                            </div>

                            <div className="space-y-2.5 text-xs font-semibold text-slate-600">
                              <div className="flex justify-between">
                                <span>Base Route Rate ({transferType}):</span>
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
                                  <span>Complementary booster seats fee:</span>
                                  <span>{formatPriceVal(selectedVehicle.pricing.childSeatFee)}</span>
                                </div>
                              )}
                              {selectedVehicle.pricing.waitingFee > 0 && (
                                <div className="flex justify-between text-blue-700">
                                  <span>Wait Stopover Surcharge:</span>
                                  <span>{formatPriceVal(selectedVehicle.pricing.waitingFee)}</span>
                                </div>
                              )}
                              {selectedVehicle.pricing.extraLuggageFee > 0 && (
                                <div className="flex justify-between text-rose-700">
                                  <span>Excess Luggage Surcharge:</span>
                                  <span>{formatPriceVal(selectedVehicle.pricing.extraLuggageFee)}</span>
                                </div>
                              )}
                              
                              <div className="flex justify-between text-[10px] text-slate-400 italic">
                                <span>Seasonal adjustment:</span>
                                <span>{selectedVehicle.pricing.seasonalLabel}</span>
                              </div>

                              {promoApplied && (
                                <div className="flex justify-between text-emerald-600 font-bold">
                                  <span>Promo Discount ({promoApplied.code}):</span>
                                  <span>-{formatPriceVal(selectedVehicle.pricing.discount)}</span>
                                </div>
                              )}

                              <div className="flex justify-between text-slate-400 text-[10px]">
                                <span>Zanzibar Govt VAT (18%):</span>
                                <span>{formatPriceVal(selectedVehicle.pricing.tax)}</span>
                              </div>

                              <div className="flex justify-between pt-3 border-t border-dashed text-sm font-black text-slate-900">
                                <span>Grand Total Amount Due:</span>
                                <span className="text-[#D4A017] text-lg font-black">{formatPriceVal(selectedVehicle.pricing.total)}</span>
                              </div>
                            </div>

                            {/* Coupon Promo Field */}
                            <div className="flex gap-2 pt-2 border-t">
                              <input
                                type="text"
                                placeholder="PROMO CODE"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                className="flex-grow p-2 bg-white border rounded-xl text-xs font-semibold uppercase outline-none focus:border-[#0B3B8C]"
                              />
                              <button
                                type="button"
                                onClick={handleApplyPromo}
                                className="bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-black transition-all cursor-pointer"
                              >
                                Apply
                              </button>
                            </div>

                            <div className="bg-[#0B3B8C]/5 border border-[#0B3B8C]/10 p-3.5 rounded-xl text-[10px] text-slate-500 leading-relaxed">
                              🔒 <strong>Payment Security:</strong> Direct booking held and protected under Zanzibar Trip & Relax passenger warranty policies. Cancel anytime up to 24 hours prior to departure with no penalty fees.
                            </div>
                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Column: Live Vector Maps, Schedulers */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Interactive Map Widget */}
          <TransferMap pickup={pickup} destination={destination} />

          {/* Direct Safety Warranties */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-sm text-left">
            <h4 className="font-extrabold text-[#0B3B8C] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Shield size={14} className="text-[#D4A017]" />
              <span>Safety & Peace of Mind Warranty</span>
            </h4>
            <div className="space-y-3 text-[11px] leading-relaxed text-slate-600">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p><strong>Comprehensive Tourist Insurance:</strong> Every tour vehicle is registered with AMTSL, carrying passenger liability cover.</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p><strong>Delayed Flight Buffer:</strong> In case of flight delays or custom procedures, our dispatch team tracks flight radar with zero additional wait costs.</p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p><strong>Baby Booster Seats:</strong> Certified safety child seats are loaded into vehicles on request under our Advanced settings tab.</p>
              </div>
            </div>
          </div>

          {/* Secure Booking Notice */}
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl space-y-2 text-left">
            <span className="bg-[#0B3B8C] text-white text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block">Dispatch Guarantee</span>
            <h4 className="font-bold text-[#0B3B8C] text-xs">Need an Urgent Booking?</h4>
            <p className="text-[11px] leading-relaxed text-slate-600">
              If your transfer is scheduled in less than 4 hours, bypass the configurator and contact our rapid-dispatch supervisor on WhatsApp at <strong className="text-emerald-600 font-bold">+255 777 101 202</strong> for instant chauffeur allocation.
            </p>
          </div>

        </div>

      </div>

      {/* 4. Attractive Route Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16 space-y-6 text-left">
        <div className="space-y-2">
          <span className="text-[#D4A017] uppercase tracking-widest font-black text-[10px] bg-[#D4A017]/10 border border-[#D4A017]/25 px-3 py-1 rounded-full inline-block">
            ZANZIBAR AIRPORT POPULAR TRANSFERS
          </span>
          <h2 className="text-3xl font-bold text-[#0B3B8C] font-serif">Popular Zanzibar Transfer Routes</h2>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Baseline flat rates regulated by the Zanzibar Commission for Tourism. Book these routes instantly below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[
            { from: 'Zanzibar Airport (ZNZ)', to: 'Stone Town Hotels', price: 15, duration: '15-20 min', cat: 'airport', image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=compress&cs=tinysrgb&w=400' },
            { from: 'Zanzibar Airport (ZNZ)', to: 'Nungwi / Kendwa Resorts', price: 40, duration: '60-70 min', cat: 'airport', image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=compress&cs=tinysrgb&w=400' },
            { from: 'Zanzibar Airport (ZNZ)', to: 'Paje / Jambiani / Bwejuu', price: 40, duration: '55-65 min', cat: 'airport', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=compress&cs=tinysrgb&w=400' },
            { from: 'Zanzibar Airport (ZNZ)', to: 'Matemwe / Kiwengwa', price: 35, duration: '45-55 min', cat: 'airport', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=compress&cs=tinysrgb&w=400' },
            { from: 'Zanzibar Airport (ZNZ)', to: 'Kizimkazi Coastal Area', price: 45, duration: '60-75 min', cat: 'airport', image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=compress&cs=tinysrgb&w=400' },
          ].map((rt, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
              <div className="relative h-32 bg-slate-100">
                <img src={rt.image} alt={rt.to} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-[#0B3B8C] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                  Verified Route
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#0B3B8C] text-xs truncate">ZNZ Airport ➔ {rt.to}</h4>
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-1">
                    <span>⏱ {rt.duration}</span>
                    <span className="text-[#D4A017]">Starting: ${rt.price}</span>
                  </div>
                </div>
                <button
                  onClick={() => handlePopularRouteClick(rt.from, rt.to, rt.cat as any)}
                  className="w-full bg-[#0B3B8C] hover:bg-blue-900 text-white font-extrabold py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all"
                >
                  Book Route Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Gorgeous Vehicle Fleet Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-20 space-y-8 text-left">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[#D4A017] uppercase tracking-widest font-black text-[10px] bg-[#D4A017]/10 border border-[#D4A017]/25 px-3 py-1 rounded-full inline-block">
            ZANZIBAR TRIP & RELAX LUXURY VEHICLES
          </span>
          <h2 className="text-3xl font-bold text-[#0B3B8C] font-serif">Explore Our Zanzibar Transport Fleet</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our premium private vehicles are immaculately maintained, fully air-conditioned, and stocked with luxury amenities to provide an absolute oasis of transport comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {DEFAULT_VEHICLES.map((fleet, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="relative h-44 bg-slate-100">
                  <img src={fleet.image} alt={fleet.model} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full font-bold text-[9px] uppercase text-[#0B3B8C] tracking-wide shadow-sm border border-slate-100">
                    Max: {fleet.capacity} Guests
                  </div>
                </div>

                <div className="p-5 space-y-3 text-xs">
                  <h4 className="font-extrabold text-[#0B3B8C] text-sm leading-tight">{fleet.model}</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed font-semibold">{fleet.description}</p>
                  
                  <div className="space-y-1.5 pt-2">
                    <p className="font-black text-slate-400 text-[9px] uppercase tracking-wider">Features Included:</p>
                    <ul className="space-y-1 text-slate-600 text-[10px]">
                      {fleet.features.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-1.5 font-semibold">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="text-left">
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Baggage Limit</span>
                  <span className="text-slate-700 text-xs font-bold">{fleet.luggageCapacity} Bags Max</span>
                </div>
                <button
                  onClick={scrollToBookingForm}
                  className="bg-[#0B3B8C] hover:bg-blue-900 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm transition-all"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Why Book with Zanzibar Trip & Relax Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-24 space-y-10 text-left">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[#D4A017] uppercase tracking-widest font-black text-[10px] bg-[#D4A017]/10 border border-[#D4A017]/25 px-3 py-1 rounded-full inline-block">
            AUTHENTIC LUXURY CHAUFFEURING
          </span>
          <h2 className="text-3xl font-bold text-[#0B3B8C] font-serif">Why Book Transfers With Zanzibar Trip & Relax?</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            We operate Zanzibar's highest-voted direct-to-resort luxury transfer network. Your satisfaction and safety are our absolute standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Meet & Greet Signboards', text: 'Skip airport confusion. Your professional driver waits right outside the arrivals lounge holding a custom name placard.', icon: <Users className="w-6 h-6 text-[#D4A017]" /> },
            { title: 'Flight Radar Monitoring', text: 'Flights fluctuate, but we stay synced. We track arrivals using live flight radar to guarantee delayed flights are welcomed without fees.', icon: <Clock className="w-6 h-6 text-[#D4A017]" /> },
            { title: 'Certified Swahili Chauffeurs', text: 'Travel safely. Every driver is a certified tourism specialist carrying legal transit credentials and speaking flawless English.', icon: <Award className="w-6 h-6 text-[#D4A017]" /> },
            { title: 'Pristine Clean Vehicles', text: 'Sink into comfort. Our entire private fleet is air-conditioned, licensed, fully insured, and stocked with cool bottled water & Wi-Fi.', icon: <Shield className="w-6 h-6 text-[#D4A017]" /> },
            { title: 'Always-On 24/7 Support', text: 'Adjust coordinates instantly. Access our prompt WhatsApp dispatch team at any hour of the day to make booking changes.', icon: <Phone className="w-6 h-6 text-[#D4A017]" /> },
            { title: 'No Hidden Fees Guarantee', text: 'What we quote is what you pay. Baseline rates include Zanzibar state tolls, airport gate clearances, tax, and fuel.', icon: <CreditCard className="w-6 h-6 text-[#D4A017]" /> },
            { title: 'Instant Vouchers', text: 'Secure booking in under 2 minutes. Receive a downloadable travel ticket on-screen and a duplicate ledger directly in your email.', icon: <Send className="w-6 h-6 text-[#D4A017]" /> },
            { title: 'Generous Free Waiting Time', text: 'We include up to 60 minutes of free waiting time at the airport and 15 minutes of free wait time at all coastal beach resorts.', icon: <Compass className="w-6 h-6 text-[#D4A017]" /> },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="p-3 bg-slate-50 rounded-2xl w-fit">{item.icon}</div>
              <div className="space-y-1.5 text-left text-xs">
                <h4 className="font-extrabold text-[#0B3B8C] text-sm leading-snug">{item.title}</h4>
                <p className="text-slate-500 font-semibold leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Collapsible Frequently Asked Questions & Reviews */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-24 grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        
        {/* FAQs list */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <span className="text-[#D4A017] uppercase tracking-widest font-black text-[9px] block">FAQ DISPATCH DESK</span>
            <h3 className="text-2xl font-bold text-[#0B3B8C] font-serif">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { q: "What happens if my flight to Zanzibar is delayed?", a: "Do not worry at all! We monitor your flight schedule in real-time using airport radar systems. Your assigned driver will adjust their arrival time to match when your flight actually lands, completely free of charge." },
              { q: "How do I find my driver at Zanzibar Airport (ZNZ)?", a: "Your private chauffeur will be waiting directly outside the arrivals exit doors (immediately after the baggage claim area). They will be holding a custom Zanzibar Trip & Relax signboard displaying your name. We will also share the driver's phone number and photo via WhatsApp 4 hours prior." },
              { q: "Are there extra costs for luggage or airport tolls?", a: "No! Our private transfers are fully transparent. The quoted checkout price is inclusive of all standard tourist luggage, Zanzibar airport gate entry tolls, local VAT, and fuel. There are zero hidden surprises." },
              { q: "Can I cancel or reschedule my transfer booking?", a: "Yes, we offer completely free cancellations and rescheduling up to 24 hours before your ride. You can manage your booking directly using the 'Manage & Edit Rides' tab with your Booking Code and registered email, or contact our WhatsApp support." },
              { q: "Do you support transfer routes outside the main airport?", a: "Absolutely. Although airport transfers are the most popular, we offer resort-to-resort shuttles, Malindi Ferry Port transits, coastal beach excursions, and custom national park safaris airstrip transfers across all tourism zones." }
            ].map((faq, idx) => {
              const isOpen = activeFaqIndex === idx;
              return (
                <div key={idx} className="border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left font-extrabold text-slate-800 flex justify-between items-center hover:bg-slate-50 transition-all gap-4"
                  >
                    <span className="text-[#0B3B8C] font-serif">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  
                  {isOpen && (
                    <div className="px-4 pb-4 text-slate-500 leading-relaxed font-semibold animate-fade-in border-t border-slate-100 pt-3 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1">
            <span className="text-[#D4A017] uppercase tracking-widest font-black text-[9px] block">TESTIMONIAL REVIEWS</span>
            <h3 className="text-2xl font-bold text-[#0B3B8C] font-serif">Verified Transfer Testimonials</h3>
          </div>

          <div className="space-y-4 text-xs">
            {[
              { name: "Sarah & David Jenkins", date: "June 2026", text: "Our driver Idi was exceptional! He was waiting at the terminal holding a beautiful signboard with our name. The Land Cruiser was immaculate, air-conditioned, and Idi even shared some fantastic local history as we drove to Nungwi. Highly recommended!", rating: 5, route: "ZNZ Airport ➔ Nungwi Resorts" },
              { name: "Marcus Thorne", date: "May 2026", text: "Booked an executive Alphard from the ferry port to Paje. First-class luxury with reclining seats, cold water, and fast Wi-Fi on board. Skip the local street cabs and book these guys for absolute peace of mind.", rating: 5, route: "Malindi Ferry ➔ Paje Beach" },
              { name: "Emily de Jong", date: "April 2026", text: "Our flight was delayed by 3 hours, but Zanzibar Trip & Relax tracked our flight and met us right at midnight without charging any extra fees. Extremely professional, safe, and highly dependable agency.", rating: 5, route: "ZNZ Airport ➔ Stone Town Hotels" }
            ].map((rev, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-[#0B3B8C] text-xs">{rev.name}</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">{rev.date} • Verified Guest</span>
                  </div>
                  <div className="flex text-[#D4A017] gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, rIdx) => (
                      <Star key={rIdx} size={11} className="fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-500 font-semibold leading-relaxed italic">"{rev.text}"</p>
                <div className="pt-2 border-t text-[10px] text-slate-400 font-bold uppercase flex justify-between">
                  <span>Route: {rev.route}</span>
                  <span className="text-emerald-600">✓ Verified Ride</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 9. Sticky Floating "Book Now" Button */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        <button
          type="button"
          onClick={scrollToBookingForm}
          className="bg-[#D4A017] hover:bg-[#b5880c] text-[#020C1F] font-extrabold px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border-2 border-white/40"
        >
          <Calendar size={15} className="text-[#020C1F]" />
          <span className="text-xs uppercase tracking-wider font-black">Book Private Transfer</span>
        </button>
      </div>

    </div>
  );
}
