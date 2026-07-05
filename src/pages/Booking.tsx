import React, { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { motion } from 'motion/react';
import DatePicker from '../components/DatePicker';
import MultiMonthCalendar from '../components/MultiMonthCalendar';
import PriceEstimator from '../components/PriceEstimator';
import { BookingSuccessRedirectTimer } from '../components/BookingSuccessRedirectTimer';
import { EmailTemplatesPreview } from '../components/EmailTemplatesPreview';
import { showToast } from '../components/ToastNotification';
import { ExitIntentModal } from '../components/ExitIntentModal';
import {
  Calendar, User, Phone, Mail, CheckCircle2, MessageCircle, AlertCircle, RefreshCw,
  MapPin, Users, Clock, Compass, Shield, HelpCircle, ArrowRight, Download, Printer,
  Check, Percent, CreditCard, ShieldCheck, Heart, Luggage, Award, Sparkles, Copy, Home
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { syncBookingToCRM } from '../lib/crm';
import { useAnalytics } from '../context/AnalyticsContext';
import { getCoupons, getDateBlockages, Coupon, DateBlockage, addActivityLog, getSeasonalityConfig, getTransportZones, getHotels, TransportZone, HotelOption, getSiteContent, getExtendedSeasonality } from '../lib/cmsStore';
import {
  generateBookingPDF,
  generateReceiptPDF,
  generateInvoicePDF,
  generateItineraryPDF,
  generatePackingListPDF
} from '../lib/pdfGenerator';

interface BookingProps {
  navigate: (page: Page, id?: string) => void;
  queryParams?: Record<string, string>;
}

// -----------------------------------------------------------------------------------------
// STATIC DATA LISTS
// -----------------------------------------------------------------------------------------
const bookingCategories = [
  { id: 'tour', label: 'Zanzibar Excursion', desc: 'Day tours & marine adventures' },
  { id: 'kilimanjaro', label: 'Kilimanjaro Trek', desc: "Africa's highest summit climbs" },
  { id: 'safari', label: 'Tanzania Safari', desc: 'Wildlife game drives' },
  { id: 'transfer', label: 'Airport Transfer', desc: 'Private resorts shuttles' },
];

const toursList = [
  { name: 'Safari Blue Ocean Cruise', basePrice: 45 },
  { name: 'Mnemba Island Snorkeling', basePrice: 35 },
  { name: 'Stone Town Cultural Walk', basePrice: 20 },
  { name: 'Prison Island & Giant Tortoises', basePrice: 25 },
  { name: 'Tangy Spice Farm Tour', basePrice: 15 },
  { name: 'Sunset Dhow Cruise', basePrice: 25 },
  { name: 'Jozani Forest National Park', basePrice: 25 },
];

const kilimanjaroList = [
  { name: 'Machame Route - 7 Days', basePrice: 1650 },
  { name: 'Lemosho Route - 8 Days', basePrice: 1950 },
  { name: 'Marangu Route - 6 Days', basePrice: 1400 },
  { name: 'Rongai Route - 7 Days', basePrice: 1750 },
  { name: 'Northern Circuit - 9 Days', basePrice: 2200 },
];

const safarisList = [
  { name: 'Serengeti Wildlife Safari - 3 Days', basePrice: 850 },
  { name: 'Ngorongoro Crater Classic - 2 Days', basePrice: 450 },
  { name: 'Northern Circuit Discovery - 5 Days', basePrice: 1200 },
  { name: 'Fly-in Luxury Serengeti - 3 Days', basePrice: 1600 },
];

const transfersList = [
  { name: 'Airport Transfer - One Way', basePrice: 40 },
  { name: 'Airport Transfer - Round Trip', basePrice: 70 },
  { name: 'Hotel to Hotel Transfer', basePrice: 50 },
  { name: 'Private Luxury Van Transfer', basePrice: 90 },
];

const locationList = [
  'Stone Town Offices',
  'Nungwi / Kendwa Resorts (North)',
  'Paje / Bwejuu (East)',
  'Jambiani / Kizimkazi (South)',
  'Matemwe / Kiwengwa (Northeast)',
  'Zanzibar Airport (ZNZ)',
  'Other (Specify in special requests)',
];

const HOTEL_PARTNERS = [
  { id: 'h1', name: 'Zanzibar Royal Beach Resort', zone: 'Nungwi / Kendwa (North)', room: 'Luxury Ocean View Lounge', priceUSD: 180, depositPct: 20 },
  { id: 'h2', name: 'Baraza Heritage Hotel', zone: 'Stone Town / Zanzibar Town', room: 'Sultan Palace Chambers', priceUSD: 95, depositPct: 15 },
  { id: 'h3', name: 'Paje Blue Surf Palms Resort', zone: 'Paje / Bwejuu (East)', room: 'Beachfront Boutique Bungalow', priceUSD: 140, depositPct: 10 },
];

const OPTIONS_ADDONS = [
  { id: 'ad-lunch', name: 'Premium Seafood Lobster Feast', price: 20, desc: 'Fresh local rock lobster & grilled tiger prawns' },
  { id: 'ad-reef', name: 'Premium snorkeling protective mask & fins kit', price: 10, desc: 'High quality customized equipment' },
  { id: 'ad-photos', name: 'DSLR Professional Photo shoot sessions', price: 30, desc: '50+ high megapixel memories sent over cloud' },
  { id: 'ad-toilet', name: 'Private Mountain Porters Toilet Tent', price: 50, desc: 'Private chemical toilet cubicle for high altitude climbs' }
];

const successStaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    }
  }
};

const successStaggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 }
  }
};

export default function Booking({ navigate, queryParams }: BookingProps) {
  const { trackBookingInitiate, trackWhatsAppClick } = useAnalytics();
  // Booking progress step
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [initialParamProcessed, setInitialParamProcessed] = useState(false);

  // Core selector states
  const [selectedCategory, setSelectedCategory] = useState<'tour' | 'kilimanjaro' | 'safari' | 'transfer'>('tour');
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full'>('deposit');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  
  // Travelers metadata
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infantsCount, setInfantsCount] = useState<number>(0);
  const [tourType, setTourType] = useState<'shared' | 'private'>('private');
  const [travelSeason, setTravelSeason] = useState<'high' | 'low'>('high');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string>('');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [hotelsList, setHotelsList] = useState<HotelOption[]>(getHotels());
  const [zonesList, setZonesList] = useState<TransportZone[]>(getTransportZones());
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [customHotelName, setCustomHotelName] = useState<string>('');
  const [notListedHotel, setNotListedHotel] = useState<boolean>(false);
  const [hotelQuery, setHotelQuery] = useState<string>('');
  const [hotelNights, setHotelNights] = useState<number>(3);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);

  // Security elements
  const [spamProtectHoneypot, setSpamProtectHoneypot] = useState<string>('');
  const [captchaTick, setCaptchaTick] = useState<boolean>(false);

  // Payment inputs sandbox
  const [successPaidState, setSuccessPaidState] = useState<'unpaid' | 'processing' | 'paid'>('unpaid');
  const [successPayMethod, setSuccessPayMethod] = useState<'card' | 'paypal' | 'bank'>('card');
  const [successCardNo, setSuccessCardNo] = useState('');
  const [successCardExpiry, setSuccessCardExpiry] = useState('');
  const [successCardCvc, setSuccessCardCvc] = useState('');

  // Main input properties (Unified Form Schema with flexible components)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    phone: '',
    preferredDate: '',
    selectedExperience: '',
    pickupLocation: 'Stone Town Offices',
    hotelName: '',
    country: '',
    guestNamesList: '',
    message: '',
    languagePreference: 'English',
    budget: '',
    paymentPreference: 'Deposit (Pesapal)',
    
    // Dynamic routing date inputs
    arrivalDate: '',
    departureDate: '',
    tourDate: '',
    pickupTime: '',
    transferType: 'arrival', // 'arrival' | 'departure'

    // Kilimanjaro climbs questions
    kiliRoute: 'Machame Route - 7 Days',
    kiliClimbersCount: 2,
    kiliNationality: '',
    kiliPassportNo: '',
    kiliGender: 'Male',
    kiliDob: '',
    kiliRentalGears: [] as string[],
    kiliEmergencyContact: '',
    kiliDietaryReqs: 'Standard (Omnivore)',
    kiliInsuranceInfo: '',
    kiliHotelBefore: '',
    kiliHotelAfter: '',
    kiliAirportPickup: 'Yes',

    // Safari additions
    safariPackage: 'Serengeti Wildlife Safari - 3 Days',
    safariAccommodation: 'midrange', // budget, midrange, luxury
    safariWithFlights: 'No',
    safariOptionalActivities: [] as string[],

    // Transfers questions
    transFlightNo: '',
    transAirline: '',
    transArrivalTime: '',
    transDepartureTime: '',
    transHotelDest: '',
    transBagsCount: '2',
    transChildSeats: 'None',
  });

  useEffect(() => {
    trackBookingInitiate(selectedCategory, formData.selectedExperience || 'None');
  }, [selectedCategory, formData.selectedExperience]);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [reference, setReference] = useState('ZTR-2026-PENDING');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [emailSendingStatus, setEmailSendingStatus] = useState<'idle' | 'preparing' | 'connecting' | 'sent'>('idle');
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Redirect and feedback states (Requirement 2 & 10)
  const [countdown, setCountdown] = useState<number>(20);
  const [redirectCancelled, setRedirectCancelled] = useState<boolean>(false);
  const [resendingEmail, setResendingEmail] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  // Load configured payment parameters from Dashboard
  const [dbPolicies, setDbPolicies] = useState<any>({
    tours: { depositPct: 30, paymentOption: 'both', cutoffHours: 24 },
    kilimanjaro: { depositPct: 20, paymentOption: 'both', cutoffHours: 336 }, // 14 days
    safari_multi: { depositPct: 50, paymentOption: 'both', cutoffHours: 168 }, // 7 days
    safari_fly_in: { depositPct: 100, paymentOption: 'full', cutoffHours: 72 }, // Fly-in full prepaid
    transfers: { depositPct: 20, paymentOption: 'both', cutoffHours: 24 }
  });

  // Live Date, Time & Weather states (Requirement 3)
  const [zanzibarTime, setZanzibarTime] = useState('');
  const [zanzibarDate, setZanzibarDate] = useState('');
  const [zanzibarWeather, setZanzibarWeather] = useState<{ temp: number; text: string; icon: string } | null>({ temp: 29, text: 'Sunny Paradise', icon: '☀️' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Calculate East Africa Time (EAT - UTC+3)
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const eat = new Date(utc + (3600000 * 3));
      
      setZanzibarTime(eat.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setZanzibarDate(eat.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };

    updateTime();
    const clockTimer = setInterval(updateTime, 1000);

    const fetchWeather = async () => {
      try {
        const lat = selectedCategory === 'kilimanjaro' ? -3.0674 : -6.1659;
        const lon = selectedCategory === 'kilimanjaro' ? 37.3556 : 39.1918;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (res.ok) {
          const data = await res.json();
          const code = data.current_weather.weathercode;
          const temp = Math.round(data.current_weather.temperature);
          
          let text = 'Sunny';
          let icon = '☀️';
          if (code >= 1 && code <= 3) { text = 'Partly Cloudy'; icon = '⛅'; }
          else if (code >= 45 && code <= 48) { text = 'Foggy'; icon = '🌫️'; }
          else if (code >= 51 && code <= 67) { text = 'Showers'; icon = '🌦️'; }
          else if (code >= 71 && code <= 77) { text = 'Snowy'; icon = '❄️'; }
          else if (code >= 80 && code <= 82) { text = 'Heavy Rain'; icon = '🌧️'; }
          else if (code >= 95 && code <= 99) { text = 'Thunderstorm'; icon = '⛈️'; }
          
          setZanzibarWeather({ temp, text, icon });
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
      }
    };

    fetchWeather();
    return () => clearInterval(clockTimer);
  }, [selectedCategory]);

  useEffect(() => {
    const saved = localStorage.getItem('ztr_payment_policies');
    if (saved) {
      try {
        setDbPolicies(JSON.parse(saved));
      } catch {
        // use standard defaults
      }
    }
  }, []);

  // Automatic Redirection countdown when Booking Successful (Requirement 2 & 10)
  useEffect(() => {
    if (step !== 5 || redirectCancelled) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, redirectCancelled, navigate]);

  // Determine current active policy context
  const getActivePolicy = () => {
    if (selectedCategory === 'tour') return dbPolicies.tours;
    if (selectedCategory === 'kilimanjaro') return dbPolicies.kilimanjaro;
    if (selectedCategory === 'transfer') return dbPolicies.transfers;
    if (selectedCategory === 'safari') {
      const isFlyIn = (formData.selectedExperience || '').toLowerCase().includes('fly-in');
      return isFlyIn ? dbPolicies.safari_fly_in : dbPolicies.safari_multi;
    }
    return dbPolicies.tours;
  };

  const activePolicy = getActivePolicy();
  const configuredPct = activePolicy.depositPct || 30;

  // Reset selected option when changing categories
  const findPackageMatch = (pkgParam: string) => {
    const normParam = decodeURIComponent(pkgParam).toLowerCase().replace(/-/g, ' ').trim();
    
    // 1. Check Kilimanjaro list
    const kiliMatch = kilimanjaroList.find(k => 
      k.name.toLowerCase().includes(normParam) || 
      normParam.includes(k.name.toLowerCase().replace(/ - \d+ days/g, ''))
    );
    if (kiliMatch) return { category: 'kilimanjaro' as const, name: kiliMatch.name };

    // 2. Check Safaris list
    const safariMatch = safarisList.find(s => 
      s.name.toLowerCase().includes(normParam) || 
      normParam.includes(s.name.toLowerCase().replace(/ - \d+ days/g, ''))
    );
    if (safariMatch) return { category: 'safari' as const, name: safariMatch.name };

    // 3. Check Tours list
    const tourMatch = toursList.find(t => 
      t.name.toLowerCase().includes(normParam) || 
      normParam.includes(t.name.toLowerCase())
    );
    if (tourMatch) return { category: 'tour' as const, name: tourMatch.name };

    // 4. Check Transfers list
    const transMatch = transfersList.find(t => 
      t.name.toLowerCase().includes(normParam) || 
      normParam.includes(t.name.toLowerCase())
    );
    if (transMatch) return { category: 'transfer' as const, name: transMatch.name };

    return null;
  };

  // Process initial URL query parameters
  useEffect(() => {
    if (queryParams && (queryParams.package || queryParams.route) && !initialParamProcessed) {
      const pkgName = queryParams.package || queryParams.route;
      const match = findPackageMatch(pkgName);
      if (match) {
        setSelectedCategory(match.category);
        setFormData(prev => ({
          ...prev,
          selectedExperience: match.name,
          kiliRoute: match.category === 'kilimanjaro' ? match.name : prev.kiliRoute,
          safariPackage: match.category === 'safari' ? match.name : prev.safariPackage
        }));
        setInitialParamProcessed(true);
      } else {
        // Check dynamic CMS tours
        const cmsContent = getSiteContent();
        const cmsMatch = (cmsContent.tours || []).find((t: any) => 
          t.title.toLowerCase().replace(/\s+/g, '-') === pkgName.toLowerCase() ||
          t.title.toLowerCase().includes(pkgName.toLowerCase()) ||
          t.id === pkgName
        );
        if (cmsMatch) {
          const cat = (cmsMatch.category === 'safari' || cmsMatch.category === 'kilimanjaro' || cmsMatch.category === 'transfer') 
            ? cmsMatch.category 
            : 'tour';
          setSelectedCategory(cat);
          setFormData(prev => ({
            ...prev,
            selectedExperience: cmsMatch.title,
            kiliRoute: cat === 'kilimanjaro' ? cmsMatch.title : prev.kiliRoute,
            safariPackage: cat === 'safari' ? cmsMatch.title : prev.safariPackage
          }));
          setInitialParamProcessed(true);
        } else {
          // Fallback to custom title
          setSelectedCategory('tour');
          const decoded = decodeURIComponent(pkgName).replace(/-/g, ' ');
          const formattedTitle = decoded.charAt(0).toUpperCase() + decoded.slice(1);
          setFormData(prev => ({
            ...prev,
            selectedExperience: formattedTitle
          }));
          setInitialParamProcessed(true);
        }
      }
    }
  }, [queryParams, initialParamProcessed]);

  useEffect(() => {
    if (queryParams && (queryParams.package || queryParams.route) && !initialParamProcessed) {
      return; 
    }

    const defaultOption = selectedCategory === 'tour' ? toursList[0].name :
                          selectedCategory === 'kilimanjaro' ? kilimanjaroList[0].name :
                          selectedCategory === 'safari' ? safarisList[0].name :
                          transfersList[0].name;

    setFormData(prev => ({
      ...prev,
      selectedExperience: defaultOption
    }));

    // Reset payment option depending on policy constraint
    if (activePolicy.paymentOption === 'full') {
      setPaymentOption('full');
    } else {
      setPaymentOption('deposit');
    }
  }, [selectedCategory, dbPolicies, queryParams, initialParamProcessed]);

  // Real-time synchronization of hotel stay duration with DatePicker state
  useEffect(() => {
    const startStr = formData.arrivalDate || formData.preferredDate;
    if (startStr && formData.departureDate) {
      const start = new Date(startStr);
      const end = new Date(formData.departureDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setHotelNights(diffDays);
      } else {
        setHotelNights(1);
      }
    }
  }, [formData.arrivalDate, formData.preferredDate, formData.departureDate]);

  // Determine season and percentage automatically based on date
  const getSeasonalAdjustment = (dateStr: string): { type: 'high' | 'low'; pct: number; label: string } => {
    const config = getSeasonalityConfig(); // loads editable seasonality
    if (!dateStr) {
      return { type: 'high', pct: config.peakPct, label: `Peak Season (+${config.peakPct}%)` };
    }
    
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        
        let isPeak = false;
        
        // Window 1 comparison
        const start1 = config.peakStartMonth * 100 + config.peakStartDay;
        const end1 = config.peakEndMonth * 100 + config.peakEndDay;
        const currentVal = m * 100 + d;
        
        if (start1 <= end1) {
          if (currentVal >= start1 && currentVal <= end1) isPeak = true;
        } else {
          // Cross-year
          if (currentVal >= start1 || currentVal <= end1) isPeak = true;
        }
        
        // Window 2 comparison
        const start2 = config.peakStartMonth2 * 100 + config.peakStartDay2;
        const end2 = config.peakEndMonth2 * 100 + config.peakEndDay2;
        if (start2 <= end2) {
          if (currentVal >= start2 && currentVal <= end2) isPeak = true;
        } else {
          if (currentVal >= start2 || currentVal <= end2) isPeak = true;
        }
        
        if (isPeak) {
          return { type: 'high', pct: config.peakPct, label: `Peak Season (+${config.peakPct}%)` };
        } else {
          return { type: 'low', pct: config.greenPct, label: `Green Season (${config.greenPct}%)` };
        }
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
    
    return { type: 'high', pct: config.peakPct, label: `Peak Season (+${config.peakPct}%)` };
  };

  // Handle generic inputs change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'preferredDate') {
      const seasonal = getSeasonalAdjustment(value);
      setTravelSeason(seasonal.type);
    }
  };

  // Multi-select helpers
  const toggleKiliGear = (gear: string) => {
    setFormData(prev => {
      const gears = prev.kiliRentalGears.includes(gear)
        ? prev.kiliRentalGears.filter(g => g !== gear)
        : [...prev.kiliRentalGears, gear];
      return { ...prev, kiliRentalGears: gears };
    });
  };

  const toggleSafariAddon = (activity: string) => {
    setFormData(prev => {
      const acts = prev.safariOptionalActivities.includes(activity)
        ? prev.safariOptionalActivities.filter(a => a !== activity)
        : [...prev.safariOptionalActivities, activity];
      return { ...prev, safariOptionalActivities: acts };
    });
  };

  // -----------------------------------------------------------------------------------------
  // THE PRICING CALCULATION ENGINE
  // -----------------------------------------------------------------------------------------
  const calculatePricing = () => {
    // Get appropriate list baseline price
    const activeList = selectedCategory === 'tour' ? toursList :
                       selectedCategory === 'kilimanjaro' ? kilimanjaroList :
                       selectedCategory === 'safari' ? safarisList :
                       transfersList;

    const matchedItem = activeList.find(x => x.name === formData.selectedExperience);
    const basePricePerPerson = matchedItem ? matchedItem.basePrice : 50;

    const guestCount = selectedCategory === 'kilimanjaro' ? (formData.kiliClimbersCount || 2) : adultsCount;

    // Headcount math
    const adultsCost = basePricePerPerson * guestCount;
    const childrenCost = (basePricePerPerson * 0.6) * childrenCount; // Kids get 40% discount
    const infantsCost = 0; // Infants travel free under our policy
    
    // Private Tour option surcharge: apply 20% surcharge for tour and safari categories when private is selected
    const isPrivateApplicable = selectedCategory === 'tour' || selectedCategory === 'safari';
    const privateSurcharge = (isPrivateApplicable && tourType === 'private') ? Math.round((adultsCost + childrenCost) * 0.2) : 0;

    let totalSub = adultsCost + childrenCost + privateSurcharge;

    // Optional Add-ons cost
    const selectedOptionsCost = selectedAddons.map(id => OPTIONS_ADDONS.find(a => a.id === id)?.price || 0).reduce((a, b) => a + b, 0) * (guestCount + childrenCount);
    totalSub += selectedOptionsCost;

    // Hotel additive costs
    let hotelCost = 0;
    let hotelDeposit = 0;
    const selectedHotel = HOTEL_PARTNERS.find(h => h.id === selectedHotelId);
    if (selectedHotel) {
      hotelCost = selectedHotel.priceUSD * hotelNights;
      hotelDeposit = (hotelCost * selectedHotel.depositPct) / 100;
    }

    // Season factor: Dynamic peak / green percentages from Seasonality config
    const selectedDate = formData.arrivalDate || formData.preferredDate;
    let appliedSeasonalPct = 0;
    let isDiscount = false;
    
    if (selectedDate) {
      try {
        const parts = selectedDate.split('-');
        if (parts.length === 3) {
          const m = parseInt(parts[1], 10);
          const d = parseInt(parts[2], 10);
          const currentVal = m * 100 + d;

          const seasons = getExtendedSeasonality();
          for (const s of seasons) {
            const startVal = s.startMonth * 100 + s.startDay;
            const endVal = s.endMonth * 100 + s.endDay;
            let matches = false;
            if (startVal <= endVal) {
              matches = currentVal >= startVal && currentVal <= endVal;
            } else {
              matches = currentVal >= startVal || currentVal <= endVal;
            }
            if (matches) {
              appliedSeasonalPct = s.adjustmentPct;
              isDiscount = s.isDiscount;
              break;
            }
          }
        }
      } catch (e) {
        console.error("Season calculation error", e);
      }
    }

    const seasonalitySettings = getSeasonalityConfig();
    if (appliedSeasonalPct === 0) {
      if (travelSeason === 'high') {
        appliedSeasonalPct = seasonalitySettings.peakPct;
        isDiscount = false;
      } else {
        appliedSeasonalPct = Math.abs(seasonalitySettings.greenPct);
        isDiscount = seasonalitySettings.greenPct < 0;
      }
    }

    const multiplier = isDiscount ? (1 - (appliedSeasonalPct / 100)) : (1 + (appliedSeasonalPct / 100));
    // Apply seasonal adjustment to the base subtotal (inclusive of private surcharge)
    const baseWithPrivate = adultsCost + childrenCost + privateSurcharge;
    const seasonallyAdjustedBase = baseWithPrivate * multiplier;
    
    // Add additive costs
    totalSub = seasonallyAdjustedBase + selectedOptionsCost;

    // Dynamic Regional Pickup Surcharge (from transport zones & hotels)
    let pickupSurcharge = 0;
    let pickupZoneLabel = '';
    if (!notListedHotel && selectedHotelId) {
      const matchHotel = hotelsList.find(h => h.id === selectedHotelId);
      if (matchHotel) {
        const matchZone = zonesList.find(z => z.id === matchHotel.zoneId);
        if (matchZone) {
          pickupSurcharge = matchZone.price;
          pickupZoneLabel = `${matchHotel.name} (${matchZone.name})`;
        }
      }
    } else if (notListedHotel && customHotelName) {
       const matchZone = zonesList.find(z => z.id === selectedZoneId);
       if (matchZone) {
         pickupSurcharge = matchZone.price;
         pickupZoneLabel = `${customHotelName} (${matchZone.name})`;
       }
    } else if (selectedZoneId) {
      const matchZone = zonesList.find(z => z.id === selectedZoneId);
      if (matchZone) {
        pickupSurcharge = matchZone.price;
        pickupZoneLabel = `${matchZone.name}`;
      }
    }
    totalSub += pickupSurcharge;

    const aggregateBeforeCoupon = totalSub + hotelCost;

    // Promo Code deductions
    let discountAmount = 0;
    if (couponApplied && activeCoupon) {
      if (aggregateBeforeCoupon >= activeCoupon.minBookingAmount) {
        if (activeCoupon.type === 'percentage') {
          discountAmount = aggregateBeforeCoupon * (activeCoupon.value / 100);
        } else {
          discountAmount = activeCoupon.value;
        }
      }
    }

    // Taxes/VAT math: Add 18% Tanzanian VAT and tourism levy
    const netBeforeTax = aggregateBeforeCoupon - discountAmount;
    const vatRate = 0.18;
    const vatAmount = Math.round(netBeforeTax * vatRate);
    const netUSD = Math.round(netBeforeTax + vatAmount);

    // Apply rule-based dynamic deposit percentages (applied on total including VAT)
    const segmentDepositUSD = Math.round((totalSub + vatAmount) * (configuredPct / 100)) + Math.round(hotelDeposit);

    const conversionRate = 0.92; // 1 USD = 0.92 EUR
    const displayTotal = currency === 'USD' ? netUSD : Math.round(netUSD * conversionRate);
    const displayDeposit = currency === 'USD' ? segmentDepositUSD : Math.round(segmentDepositUSD * conversionRate);
    const displayRemaining = displayTotal - (paymentOption === 'full' ? displayTotal : displayDeposit);

    return {
      totalUSD: netUSD,
      calculatedDepositUSD: segmentDepositUSD,
      displayTotal,
      displayDeposit,
      displayRemaining,
      currencySymbol: currency === 'USD' ? '$' : '€',
      pricePerAdult: currency === 'USD' ? basePricePerPerson : Math.round(basePricePerPerson * conversionRate),
      hasHotel: !!selectedHotel,
      selectedHotel,
      addonsCost: currency === 'USD' ? selectedOptionsCost : Math.round(selectedOptionsCost * conversionRate),
      discountAmount: currency === 'USD' ? Math.round(discountAmount) : Math.round(discountAmount * conversionRate),
      seasonalitySettings,
      pickupZoneLabel,
      pickupSurcharge,
      // Extended properties for full breakdown transparency
      adultsCount,
      childrenCount,
      infantsCount,
      tourType,
      adultsCost: currency === 'USD' ? (adultsCost + pickupSurcharge) : Math.round((adultsCost + pickupSurcharge) * conversionRate),
      childrenCost: currency === 'USD' ? childrenCost : Math.round(childrenCost * conversionRate),
      infantsCost: 0,
      privateSurcharge: currency === 'USD' ? privateSurcharge : Math.round(privateSurcharge * conversionRate),
      vatAmount: currency === 'USD' ? vatAmount : Math.round(vatAmount * conversionRate),
      baseWithPrivate: currency === 'USD' ? baseWithPrivate : Math.round(baseWithPrivate * conversionRate),
      seasonAdjustmentAmount: currency === 'USD' ? Math.round(baseWithPrivate * (multiplier - 1)) : Math.round(baseWithPrivate * (multiplier - 1) * conversionRate)
    };
  };

  const pricing = calculatePricing();

  // -----------------------------------------------------------------------------------------
  // LAST-MINUTE BOOKING CUTOFF CHECKS (Requirement 3)
  // -----------------------------------------------------------------------------------------
  const isBookingDeadlinePassed = () => {
    if (!formData.preferredDate) return false;
    const travelDate = new Date(`${formData.preferredDate}T23:59:59`); // assume end of travel day
    const now = new Date();
    const timeDiff = travelDate.getTime() - now.getTime();
    const hoursRemaining = timeDiff / (1000 * 60 * 60);

    const cutoffHrs = activePolicy.cutoffHours || 24;
    return hoursRemaining < cutoffHrs;
  };

  const deadlinePassed = isBookingDeadlinePassed();

  // -----------------------------------------------------------------------------------------
  // VALIDATE COUPON PROMOTION CODE
  // -----------------------------------------------------------------------------------------
  const checkPromoCode = () => {
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Please enter a voucher code name.');
      return;
    }

    const matchCode = couponCode.trim().toUpperCase();
    const activeList = getCoupons();
    const found = activeList.find(c => c.name === matchCode);

    if (found) {
      // Validate expiration
      const expDate = new Date(found.expirationDate);
      const now = new Date();
      if (now > expDate) {
        setCouponError('This voucher code has expired.');
        return;
      }
      if (found.usedCount >= found.maxUses) {
        setCouponError('This coupon capacity limit has been completely reached.');
        return;
      }
      
      setActiveCoupon(found);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid promotion voucher code. Try WELCOME10 or SAVE50.');
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setActiveCoupon(null);
    setCouponCode('');
  };

  const handleApplyDiscountCode = (code: string) => {
    setCouponCode(code);
    setActiveCoupon({
      id: 'exit-intent-swahili10',
      name: code.toUpperCase(),
      type: 'percentage',
      value: 10,
      minBookingAmount: 0,
      expirationDate: '2028-12-31',
      maxUses: 99999,
      usedCount: 0
    });
    setCouponApplied(true);
  };

  // -----------------------------------------------------------------------------------------
  // SANDBOX PAYMENT AUTHORIZATION TRIGGERS
  // -----------------------------------------------------------------------------------------
  const handleSimulatedPayment = () => {
    if (successPayMethod === 'card' && (!successCardNo || !successCardExpiry || !successCardCvc)) {
      alert('Card verification failed: Please supplement correct placeholder credential values.');
      return;
    }

    setSuccessPaidState('processing');

    setTimeout(async () => {
      // Success paid trigger
      setSuccessPaidState('paid');
      
      // Auto-increase step to confirmation immediately!
      setStep(5);
      setStatus('success');

      // Unique reference code
      const randRef = `ZTR-${Date.now().toString().substring(7)}-${Math.floor(Math.random() * 900 + 100)}`;
      setReference(randRef);

      // Trigger client-side success modal & email confirmation simulation
      setShowSuccessModal(true);
      showToast('Reservation processed successfully!', 'success');
      setEmailSendingStatus('preparing');
      setTimeout(() => {
        setEmailSendingStatus('connecting');
        setTimeout(() => {
          setEmailSendingStatus('sent');
          showToast(`Official invoice & voucher emailed to ${formData.email || 'guest'}`, 'info', 5000);
        }, 1200);
      }, 1000);

      // Save complete booking into database
      const categoryLabel = bookingCategories.find(c => c.id === selectedCategory)?.label || 'Swahili Tour';
      const actualGuests = selectedCategory === 'kilimanjaro' ? (formData.kiliClimbersCount || 2) : (adultsCount + childrenCount);
      const resolvedDate = (formData.arrivalDate && formData.departureDate) 
        ? `${formData.arrivalDate} to ${formData.departureDate}` 
        : formData.preferredDate;
      
      const logMessage = `Reference: ${randRef}\nSeason: ${travelSeason}\nPayment Tier: ${paymentOption === 'full' ? '100% Fully Prepaid Online' : 'Dynamic Security Deposit Prepayment Approved'}\nNotes: ${formData.message.trim()}`;

      try {
        const { error } = await supabase.from('bookings').insert([
          {
            full_name: formData.name.trim(),
            email: formData.email.trim() || null,
            whatsapp_number: formData.whatsapp.trim(),
            number_of_guests: actualGuests,
            tour_name: `${categoryLabel}: ${formData.selectedExperience}`,
            preferred_date: resolvedDate,
            pickup_location: formData.pickupLocation || 'Hotel lobby pickup',
            status: 'confirmed',
            message: logMessage,
          }
        ]);

        if (error) console.warn('Supabase logging info:', error.message);

        // Backup locally so Guest Workspace (Manage Booking) registers it immediately!
        const localBackup = localStorage.getItem('ztr_local_bookings_backup');
        const backupList = localBackup ? JSON.parse(localBackup) : [];
        const newBackupItem = {
          reference: randRef,
          id: 'TX-' + randRef.substring(4),
          full_name: formData.name.trim(),
          email: formData.email.trim(),
          whatsapp_number: formData.whatsapp.trim(),
          tour_name: `${categoryLabel}: ${formData.selectedExperience}`,
          preferred_date: resolvedDate,
          pickup_location: formData.pickupLocation,
          status: 'confirmed',
          message: `${logMessage}\nTotal Price: $${pricing.totalUSD}`,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('ztr_local_bookings_backup', JSON.stringify([newBackupItem, ...backupList]));

        // Dispatch standardized CRM lead and conversion data
        syncBookingToCRM({
          reference: randRef,
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          whatsappNumber: formData.whatsapp.trim(),
          tourName: `${categoryLabel}: ${formData.selectedExperience}`,
          preferredDate: resolvedDate,
          pickupLocation: formData.pickupLocation || 'Hotel lobby pickup',
          numberOfGuests: actualGuests,
          totalPrice: pricing.totalUSD,
          depositAmount: pricing.calculatedDepositUSD,
          remainingBalance: pricing.totalUSD - (paymentOption === 'full' ? pricing.totalUSD : pricing.calculatedDepositUSD),
          paymentOption: paymentOption as 'deposit' | 'full',
          paymentStatus: paymentOption === 'full' ? 'fully_paid' : 'partially_paid',
          currency: 'USD'
        });

        // Decrement coupon limit
        if (couponApplied && activeCoupon) {
          const updatedCoupons = getCoupons().map(c => c.id === activeCoupon.id ? { ...c, usedCount: c.usedCount + 1 } : c);
          localStorage.setItem('ztr_coupons', JSON.stringify(updatedCoupons));
        }

        // Save Owner Activity Log
        addActivityLog(
          'Online Booking Portal',
          'Guest',
          `Authorized payment of ${pricing.currencySymbol}${paymentOption === 'deposit' ? pricing.displayDeposit : pricing.displayTotal} for booking reference ${randRef}`,
          'No Active Reservation',
          `Confirmed Booking ${randRef}: ${categoryLabel} - ${formData.selectedExperience} (Total: $${pricing.totalUSD})`
        );

      } catch (err) {
        console.error('Data lodging error:', err);
      }
    }, 2000);
  };

  // -----------------------------------------------------------------------------------------
  // PREPARING REQUISITE PDF DOWNLOADS (Requirement 9)
  // -----------------------------------------------------------------------------------------
  const triggerBookingVoucher = () => {
    generateBookingPDF(
      {
        reference,
        full_name: formData.name,
        email: formData.email,
        whatsapp_number: formData.whatsapp,
        tour_name: `${selectedCategory === 'tour' ? 'Excursion' : selectedCategory === 'safari' ? 'Tanzania Safari' : selectedCategory === 'kilimanjaro' ? 'Climbs' : 'Resort Shuttle'}: ${formData.selectedExperience}`,
        preferred_date: formData.preferredDate,
        number_of_guests: selectedCategory === 'kilimanjaro' ? (formData.kiliClimbersCount || 2) : (adultsCount + childrenCount),
        pickup_location: formData.pickupLocation,
        total_price: pricing.displayTotal
      },
      pricing
    );
  };

  const triggerInvoiceReceipt = () => {
    generateInvoicePDF(
      {
        reference,
        full_name: formData.name,
        email: formData.email,
        whatsapp_number: formData.whatsapp,
        tour_name: formData.selectedExperience,
        preferred_date: formData.preferredDate,
        number_of_guests: selectedCategory === 'kilimanjaro' ? (formData.kiliClimbersCount || 2) : (adultsCount + childrenCount),
        pickup_location: formData.pickupLocation,
        total_price: pricing.displayTotal,
        deposit_paid: paymentOption === 'deposit' ? pricing.displayDeposit : pricing.displayTotal,
        remaining_balance: pricing.displayRemaining
      },
      pricing
    );
  };

  const triggerOfficialReceipt = () => {
    if (successPaidState !== 'paid') {
      alert('Official receipt is locked until checkout prepayment settles.');
      return;
    }
    generateReceiptPDF(
      {
        reference,
        full_name: formData.name,
      },
      {
        transactionId: Math.floor(Math.random() * 1000000).toString(),
        method: successPayMethod === 'card' ? 'Online Card Authorization' : 'PayPal Sandbox',
        gatewayId: reference + '-ONLINE-SECURE',
        amount: paymentOption === 'deposit' ? pricing.displayDeposit : pricing.displayTotal,
        currencySymbol: pricing.currencySymbol,
        date: new Date().toLocaleDateString(),
        balanceRemaining: pricing.displayRemaining
      }
    );
  };

  const triggerItineraryBrochure = () => {
    const itineraryDetails = {
      title: formData.selectedExperience,
      duration: selectedCategory === 'safari' ? '4 Days' : '1 Day',
      price: `${pricing.currencySymbol}${pricing.displayTotal}`,
      destinations: formData.pickupLocation,
      summary: `Luxury personalized Swahili brochure compiled for lead guest ${formData.name}`,
      itinerary: [
        { day: 1, title: 'Arrival & Tropical Greeting', desc: 'Our private chauffeur collects you from Zanzibar International Airport (ZNZ) or ferry terminal and provides private transit directly to your partner resort.' },
        { day: 2, title: 'Main Excursion Adventure', desc: `Private tour of ${formData.selectedExperience || 'Zanzibar wonders'} - enjoying pure blue waters, historic coral preservation areas, and tropical grilled seafood picnics.` },
        { day: 3, title: 'Sultan Treasures & Departure', desc: 'Relaxing in beach lagoons, exploring unique spice regions or cultural stone streets before private transport back to the airport.' }
      ],
      whatToBring: [
        "Shoulders & knees covered clothing for Stone Town cultural respect walks",
        "High SPF reef-safe sunscreen lotions to safeguard local corals",
        "Waterproof camera (eg GoPro) with floating handle straps"
      ]
    };
    generateItineraryPDF(itineraryDetails);
  };

  const handleResendConfirmationEmail = () => {
    setResendingEmail(true);
    setResendSuccess(false);
    setTimeout(() => {
      setResendingEmail(false);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    }, 1200);
  };

  const handleDownloadCalendarInvite = () => {
    const startDateStr = formData.preferredDate || formData.arrivalDate || new Date().toISOString().split('T')[0];
    const endDateStr = formData.preferredDate || formData.departureDate || new Date().toISOString().split('T')[0];

    // clean them up to match YYYYMMDD
    const cleanStart = startDateStr.replace(/-/g, '');
    const cleanEnd = endDateStr.replace(/-/g, '');

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Zanzibar Trip & Relax//NONSGML Booking Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:Zanzibar Trip: ${formData.selectedExperience}`,
      `UID:booking-${reference}@zanzibartripandrelax.com`,
      'SEQUENCE:0',
      'STATUS:CONFIRMED',
      `DTSTART;VALUE=DATE:${cleanStart}`,
      `DTEND;VALUE=DATE:${cleanEnd}`,
      `LOCATION:${formData.pickupLocation || 'Zanzibar Island'}`,
      `DESCRIPTION:Your confirmed tropical adventure with Zanzibar Trip & Relax.\\n\\nBooking Ref: ${reference}\\nLead Guest: ${formData.name}\\nTotal Cost: ${pricing.currencySymbol}${pricing.displayTotal}\\n\\nPrepare for a magical journey!`,
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    const icsContent = icsLines.join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Zanzibar-Trip-${reference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <ExitIntentModal 
        onApplyDiscount={handleApplyDiscountCode}
        isAlreadySubmitted={status === 'success' || showSuccessModal}
      />
      
      {/* 1. Page full-width high quality hero */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden shrink-0 select-none">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg?auto=compress&cs=tinysrgb&w=1600')" }} 
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center px-4">
          <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-[0.3em] font-mono leading-none block mb-2">reserve swahili paradise</span>
          <h1 className="text-4xl md:text-5xl font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            {selectedCategory === 'tour' ? 'Book Zanzibar Excursions' :
             selectedCategory === 'kilimanjaro' ? 'Book Kilimanjaro Trek' :
             selectedCategory === 'safari' ? 'Book Tanzania Safari' :
             'Secure Resort Transfers'}
          </h1>
          <p className="text-sm text-white/80 max-w-xl mx-auto mt-2 leading-relaxed">
            Configure dynamic bespoke itineraries, secure your dates offline, and download official receipts instantly.
          </p>
        </div>
      </section>

      {/* 2. Horizontal Selection Ribbon */}
      <section className="bg-white border-b sticky top-[108px] max-lg:top-[72px] z-40 py-4 px-4 shadow-sm select-none">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected Specialty:</p>
          <div className="flex flex-wrap gap-2">
            {bookingCategories.map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as any);
                  setStep(1); // restart flow to select correct tour parameters
                }}
                className={`px-4.5 py-2 rounded-full text-xs font-extrabold transition-all outline-none border cursor-pointer ${
                  selectedCategory === cat.id 
                    ? 'bg-[#0B3B8C] text-white border-[#0B3B8C] shadow-sm' 
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-[#0B3B8C] hover:text-[#0B3B8C]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Global 3-Step Process Indicator */}
      <div className="max-w-5xl mx-auto px-4 mt-8 select-none">
        <div className="relative py-4">
          {/* Progress Connector Line behind the steps */}
          <div className="absolute top-[32px] left-[10%] right-[10%] h-1 bg-slate-200 -translate-y-1/2 rounded-full overflow-hidden z-0">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#0B3B8C] to-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>

          <div className="flex items-center justify-between text-center relative z-10">
            {[
              { tag: 1, label: 'Choose Tour' },
              { tag: 2, label: 'Guest Details' },
              { tag: 3, label: 'Secure Checkout' },
              { tag: 4, label: 'Confirmation' },
            ].map(_st => {
              const isActive = step === _st.tag;
              const isCompleted = step > _st.tag;
              
              return (
                <div key={_st.tag} className="flex-1 flex flex-col items-center">
                  <motion.div 
                    initial={false}
                    animate={{
                      scale: isActive ? 1.25 : 1,
                      backgroundColor: isActive ? '#0B3B8C' : isCompleted ? '#10B981' : '#FFFFFF',
                      borderColor: isActive ? '#0B3B8C' : isCompleted ? '#10B981' : '#CBD5E1',
                      color: isActive || isCompleted ? '#FFFFFF' : '#64748B',
                      boxShadow: isActive ? '0 10px 15px -3px rgba(11, 59, 140, 0.3), 0 4px 6px -2px rgba(11, 59, 140, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all relative cursor-pointer"
                    onClick={() => {
                      // Allow users to click back to previously completed steps to track/verify details
                      if (_st.tag < step) {
                        setStep(_st.tag as any);
                      }
                    }}
                  >
                    {isCompleted ? (
                      <Check size={16} className="stroke-[3]" />
                    ) : (
                      <span>{_st.tag}</span>
                    )}

                    {/* Subtle outer glowing border for active step */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeGlow"
                        className="absolute inset-[-4px] rounded-full border-2 border-[#0B3B8C]/40 animate-ping"
                        style={{ pointerEvents: 'none' }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  <span className={`text-[10px] md:text-xs uppercase font-extrabold mt-3.5 tracking-wider transition-all duration-300 ${
                    isActive 
                      ? 'text-[#0B3B8C] font-black' 
                      : isCompleted 
                        ? 'text-emerald-600 font-semibold cursor-pointer hover:text-[#0B3B8C]' 
                        : 'text-slate-400 font-medium'
                  }`}
                  onClick={() => {
                    if (_st.tag < step) {
                      setStep(_st.tag as any);
                    }
                  }}
                  >
                    {_st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Page layout containing Core Form (LEFT) and Pricing Card (RIGHT) */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Urgent deadline warning panel hide actions */}
        {deadlinePassed && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-3xl mb-8 flex items-start gap-3.5 shadow-sm text-xs leading-relaxed text-red-900">
            <AlertCircle size={22} className="text-red-600 shrink-0 select-none mt-1" />
            <div>
              <p className="font-extrabold text-sm text-red-950 uppercase tracking-wide">Online Reservation Closed</p>
              <p className="mt-1 font-semibold text-red-800">
                Online booking for this departure has closed. Please contact Zanzibar Trip & Relax via WhatsApp or email to check availability.
              </p>
              <div className="mt-4 flex gap-2.5">
                <a
                  href="https://wa.me/255629506063"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('Booking closed deadline fallback', 'Inquire Availability')}
                  className="bg-[#25D366] text-white font-bold px-4 py-2 rounded-full inline-flex items-center gap-1.5"
                >
                  <MessageCircle size={14} fill="white" />
                  <span>Inquire Availability</span>
                </a>
                <a href="mailto:info@zanzibartripandrelax.com" className="bg-slate-800 text-white font-bold px-4 py-2 rounded-full">
                  Email Desk
                </a>
              </div>
            </div>
          </div>
        )}

        {step === 4 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={successStaggerContainer}
            className="bg-white rounded-3xl border border-gray-150 p-6 md:p-10 shadow-lg max-w-4xl mx-auto w-full space-y-8 text-center"
            id="booking-success-container"
          >
            {/* 1. TOP STATUS HEADER SECTION */}
            <motion.div variants={successStaggerItem} className="space-y-4 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md border border-emerald-150 relative">
                <CheckCircle2 size={44} className="animate-pulse text-emerald-600" />
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-xs">✓</span>
              </div>
              <div>
                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest font-mono bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  deposit verified • transaction secured
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-[#0B3B8C] mt-3 tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Thank You for Your Booking!
                </h2>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  Your reservation has been successfully received and your deposit has been confirmed.
                </p>
              </div>
            </motion.div>

            {/* 2. DIGITAL LEDGER BOARD (THE GRID OF BOOKING PARTICULARS) */}
            <motion.div variants={successStaggerItem} className="bg-gray-50/50 border border-gray-200/60 rounded-3xl p-6 text-left space-y-6">
              <div className="flex justify-between items-center border-b border-gray-200/80 pb-4">
                <div>
                  <h4 className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wider font-mono">digital checkout details</h4>
                  <p className="text-base font-black text-[#0B3B8C] font-sans">Official Booking Receipt Record</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 font-mono">ID:</span>
                  <div className="bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-xl flex items-center gap-2">
                    <strong className="text-emerald-700 font-mono tracking-wider select-all text-xs">{reference}</strong>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(reference);
                        setCopiedRef(true);
                        setTimeout(() => setCopiedRef(false), 2000);
                      }}
                      className="text-gray-400 hover:text-gray-600 text-[10px] transition-colors"
                      title="Copy Reference"
                    >
                      {copiedRef ? <span className="text-emerald-600 font-bold font-sans">Copied!</span> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                {/* COLUMN 1: TRAVEL PARTICULARS */}
                <div className="space-y-3.5">
                  <span className="block font-black text-[9px] uppercase tracking-widest text-[#D4A017] font-mono">01 • Travel Summary</span>
                  
                  <div className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-2xl shadow-sm">
                    <span className="text-gray-500 font-bold">Guest Name</span>
                    <span className="text-gray-950 font-extrabold text-right">{formData.name}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-2xl shadow-sm">
                    <span className="text-gray-500 font-bold">Tour / Package</span>
                    <span className="text-[#0B3B8C] font-black text-right max-w-[180px] truncate" title={formData.selectedExperience}>
                      {formData.selectedExperience}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-2xl shadow-sm">
                    <span className="text-gray-500 font-bold">Travel Date</span>
                    <span className="text-gray-950 font-extrabold text-right">{formData.preferredDate || formData.arrivalDate}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-2xl shadow-sm">
                    <span className="text-gray-500 font-bold">Number of Guests</span>
                    <span className="text-gray-950 font-extrabold text-right">
                      {(selectedCategory === 'kilimanjaro' ? (formData.kiliClimbersCount || 2) : (adultsCount + childrenCount))} Guests
                    </span>
                  </div>
                </div>

                {/* COLUMN 2: FINANCIAL ACCOUNTING */}
                <div className="space-y-3.5">
                  <span className="block font-black text-[9px] uppercase tracking-widest text-[#D4A017] font-mono">02 • Financial Summary</span>

                  <div className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-2xl shadow-sm">
                    <span className="text-gray-500 font-bold">Paid Advanced Deposit</span>
                    <span className="text-emerald-600 font-black text-right">
                      {pricing.currencySymbol}{paymentOption === 'deposit' ? pricing.displayDeposit : pricing.displayTotal}.00
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-2xl shadow-sm">
                    <span className="text-gray-500 font-bold">Remaining Balance</span>
                    <span className="text-gray-950 font-black text-right">
                      {pricing.currencySymbol}{pricing.displayRemaining}.00
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-2xl shadow-sm">
                    <span className="text-gray-500 font-bold">Estimated Pickup Window</span>
                    <span className="text-[#0B3B8C] font-extrabold text-right">07:00 AM - 08:30 AM (Zone Dependent)</span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 border border-gray-100 rounded-2xl shadow-sm">
                    <span className="text-gray-500 font-bold">Booking Status</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] tracking-wider flex items-center gap-1 justify-end">
                      <ShieldCheck size={11} /> Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 3. VISUAL TIMELINE TRACKER */}
            <motion.div variants={successStaggerItem} className="space-y-4 pt-2">
              <span className="block font-black text-[10px] uppercase tracking-widest text-gray-400 font-mono">booking status timeline tracker</span>
              <div className="relative max-w-3xl mx-auto px-4 md:px-10">
                {/* Horizontal Connector Line for desktop */}
                <div className="hidden md:block absolute top-[15px] left-20 right-20 h-0.5 bg-gray-200 z-0">
                  <div className="absolute top-0 left-0 h-full bg-emerald-500 w-[60%] transition-all duration-1000"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10 text-xs">
                  {/* Step 1: Received */}
                  <div className="flex md:flex-col items-center gap-3 md:gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-md border border-emerald-200 shrink-0">
                      ✓
                    </div>
                    <div className="text-left md:text-center">
                      <p className="font-extrabold text-emerald-800 text-xs">Booking Received</p>
                      <p className="text-[10px] text-gray-400">Captured on servers</p>
                    </div>
                  </div>

                  {/* Step 2: Deposit Confirmed */}
                  <div className="flex md:flex-col items-center gap-3 md:gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-md border border-emerald-200 shrink-0 animate-pulse">
                      ✓
                    </div>
                    <div className="text-left md:text-center">
                      <p className="font-extrabold text-emerald-800 text-xs">Deposit Confirmed</p>
                      <p className="text-[10px] text-gray-400">Secure payment authorized</p>
                    </div>
                  </div>

                  {/* Step 3: Booking Confirmed */}
                  <div className="flex md:flex-col items-center gap-3 md:gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-md border border-emerald-200 shrink-0">
                      ✓
                    </div>
                    <div className="text-left md:text-center">
                      <p className="font-extrabold text-emerald-800 text-xs">Booking Confirmed</p>
                      <p className="text-[10px] text-gray-400">Guaranteed slots secured</p>
                    </div>
                  </div>

                  {/* Step 4: Pickup Window Pending */}
                  <div className="flex md:flex-col items-center gap-3 md:gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200 shrink-0">
                      ⏳
                    </div>
                    <div className="text-left md:text-center">
                      <p className="font-extrabold text-amber-800 text-xs">Pickup Time Pending</p>
                      <p className="text-[10px] text-gray-400">Assigned by dispatch team</p>
                    </div>
                  </div>

                  {/* Step 5: Tour Day */}
                  <div className="flex md:flex-col items-center gap-3 md:gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center font-bold border border-gray-200 shrink-0">
                      ⏳
                    </div>
                    <div className="text-left md:text-center">
                      <p className="font-extrabold text-gray-400 text-xs">Tour Day</p>
                      <p className="text-[10px] text-gray-400">Ready to board vehicle</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 4. DISPATCH MESSAGE BANNER */}
            <motion.div variants={successStaggerItem} className="bg-[#0B3B8C]/5 border border-[#0B3B8C]/10 p-5 rounded-2xl text-xs flex gap-3 text-left max-w-2xl mx-auto leading-relaxed">
              <span className="text-lg">📢</span>
              <div>
                <strong className="text-[#0B3B8C] uppercase block tracking-wider font-extrabold mb-1">Swahili Operations Desk Dispatch</strong>
                Our operations team will contact you by email and/or WhatsApp with your confirmed pickup time and any final tour information.
              </div>
            </motion.div>

            {/* 5. REDIRECTION METERS */}
            <motion.div variants={successStaggerItem}>
              <BookingSuccessRedirectTimer
                countdown={countdown}
                totalDuration={20}
                redirectCancelled={redirectCancelled}
                onCancel={() => setRedirectCancelled(true)}
                onManualRedirect={() => navigate('home')}
              />
            </motion.div>

            {/* EMAIL TEMPLATES INTERACTIVE PREVIEW HUB */}
            <motion.div variants={successStaggerItem} className="text-left max-w-3xl mx-auto">
              <EmailTemplatesPreview
                bookingData={{
                  reference,
                  fullName: formData.name || 'Swahili Adventurer',
                  email: formData.email || 'guest@example.com',
                  whatsapp: formData.whatsapp || '+255',
                  tourName: `${bookingCategories.find(c => c.id === selectedCategory)?.label || 'Swahili Tour'}: ${formData.selectedExperience || 'Zanzibar Day Excursion'}`,
                  preferredDate: (formData.arrivalDate && formData.departureDate) 
                    ? `${formData.arrivalDate} to ${formData.departureDate}` 
                    : (formData.preferredDate || 'Upcoming Departure'),
                  pickupLocation: formData.pickupLocation || 'Hotel Lobby Pickup',
                  numberOfGuests: selectedCategory === 'kilimanjaro' ? (formData.kiliClimbersCount || 2) : (adultsCount + childrenCount),
                  totalPrice: pricing.displayTotal,
                  depositAmount: pricing.displayDeposit,
                  remainingBalance: pricing.displayRemaining,
                  paymentOption,
                  currencySymbol: pricing.currencySymbol,
                  transactionId: `ZTR-TX-${reference.replace('ZTR-', '')}`,
                  paymentMethod: 'Online Visa / MasterCard Gateway',
                  paymentDate: new Date().toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })
                }}
              />
            </motion.div>

            {/* 6. MODERN ACTION BUTTONS BOARD */}
            <motion.div variants={successStaggerItem} className="space-y-4 pt-4 border-t border-gray-100">
              <span className="block font-black text-[10px] uppercase tracking-widest text-gray-400 font-mono">digital interaction desk</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto text-xs font-bold text-left">
                {/* Home */}
                <button
                  onClick={() => navigate('home')}
                  className="p-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl flex items-center gap-3 shadow transition-colors cursor-pointer"
                >
                  <Home size={16} className="text-[#D4A017]" />
                  <div>
                    <p className="font-extrabold">Return to Homepage</p>
                    <p className="text-[9px] text-white/60">Swahili main portal</p>
                  </div>
                </button>

                {/* Explore More Tours */}
                <button
                  onClick={() => navigate('tours')}
                  className="p-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl flex items-center gap-3 shadow-sm transition-colors cursor-pointer"
                >
                  <Compass size={16} className="text-[#0B3B8C]" />
                  <div>
                    <p className="font-extrabold">Explore More Tours</p>
                    <p className="text-[9px] text-gray-400">Review all safaris & shuttle services</p>
                  </div>
                </button>

                {/* View My Booking */}
                <button
                  onClick={() => navigate('manage-booking', `id=${reference}&email=${encodeURIComponent(formData.email)}`)}
                  className="p-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl flex items-center gap-3 shadow-sm transition-colors cursor-pointer"
                >
                  <Calendar size={16} className="text-[#D4A017]" />
                  <div>
                    <p className="font-extrabold">View My Booking</p>
                    <p className="text-[9px] text-gray-400">Live dynamic status hub</p>
                  </div>
                </button>

                {/* Download Voucher */}
                <button
                  onClick={triggerBookingVoucher}
                  className="p-3.5 bg-[#0B3B8C]/5 hover:bg-[#0B3B8C]/10 border border-[#0B3B8C]/15 text-[#0B3B8C] rounded-xl flex items-center justify-between shadow-sm transition-colors cursor-pointer animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <Download size={16} />
                    <div>
                      <p className="font-extrabold">Download Confirmation</p>
                      <p className="text-[9px] text-[#0B3B8C]/60">Voucher PDF file certificate</p>
                    </div>
                  </div>
                </button>

                {/* Download Receipt */}
                <button
                  onClick={triggerOfficialReceipt}
                  className="p-3.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 text-emerald-800 rounded-xl flex items-center justify-between shadow-sm transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Download size={16} />
                    <div>
                      <p className="font-extrabold">Download Payment Receipt</p>
                      <p className="text-[9px] text-emerald-700/60">Official statement PDF</p>
                    </div>
                  </div>
                </button>

                {/* Email Again */}
                <button
                  onClick={handleResendConfirmationEmail}
                  disabled={resendingEmail}
                  className="p-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl flex items-center gap-3 shadow-sm transition-all cursor-pointer disabled:opacity-70"
                >
                  {resendingEmail ? <RefreshCw size={16} className="animate-spin text-gray-400" /> : <Mail size={16} className="text-[#0B3B8C]" />}
                  <div>
                    <p className="font-extrabold">
                      {resendingEmail ? 'Sending...' : resendSuccess ? 'Emailed Successfully! ✓' : 'Email My Booking Again'}
                    </p>
                    <p className="text-[9px] text-gray-400">
                      {resendSuccess ? `Sent to ${formData.email}` : 'Dispatch confirmation again'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Extra WhatsApp Contact block */}
              <div className="pt-2 max-w-sm mx-auto">
                <a
                  href={`https://wa.me/255629506063?text=${encodeURIComponent(
                    `Hi Zanzibar Trip & Relax reservations desk, I have completed my secure payment of ${pricing.currencySymbol}${paymentOption === 'deposit' ? pricing.displayDeposit : pricing.displayTotal} for Booking ID: ${reference}. Please verify and send over official vouchers!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('Booking payment confirmation', reference)}
                  className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-extrabold py-3.5 px-6 rounded-full text-xs shadow-md inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <MessageCircle size={15} fill="white" />
                  <span>Contact Us on WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT AREA: Step forms container */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-150 p-6 md:p-8 shadow-sm">
            
            {/* STEP 1: CHOOSE TOUR OR EXCURSION SPECIFIC */}
            {step === 1 && (
              <div className="space-y-6">
                {queryParams && (queryParams.package || queryParams.route) && (
                  <div className="bg-[#0B3B8C]/5 border border-[#0B3B8C]/20 p-5 rounded-3xl flex items-start gap-4">
                    <div className="p-3 bg-[#0B3B8C]/10 text-[#0B3B8C] rounded-2xl shrink-0">
                      <Sparkles className="text-[#D4A017] animate-pulse" size={20} />
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#D4A017] block mb-0.5">Booking Request</span>
                      <h4 className="text-sm font-black text-[#0B3B8C]">
                        {formData.selectedExperience}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-semibold mt-1">
                        Package: <span className="font-extrabold text-gray-800">{formData.selectedExperience}</span> <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ml-1">Read Only</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                        This tour package has been pre-selected for you. We've locked in the specialty rates and custom checklists for your itinerary.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-black text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <Compass size={18} />
                    <span>Step 1: Choose Expedition</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Please identify which program option, seasonality and target dates align with your dream trip.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Select Specific Package Option *</label>
                    <select
                      name="selectedExperience"
                      disabled={!!(queryParams && (queryParams.package || queryParams.route))}
                      value={formData.selectedExperience}
                      onChange={handleChange}
                      className="w-full px-4.5 py-3.5 rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none bg-white font-bold text-gray-800 text-xs disabled:opacity-85 disabled:bg-slate-50 transition-all duration-200"
                      required
                    >
                      {selectedCategory === 'tour' && (
                        <>
                          {toursList.map(t => (
                            <option key={t.name} value={t.name}>{t.name} (From ${t.basePrice})</option>
                          ))}
                          {!toursList.some(t => t.name === formData.selectedExperience) && formData.selectedExperience && (
                            <option value={formData.selectedExperience}>{formData.selectedExperience}</option>
                          )}
                        </>
                      )}
                      {selectedCategory === 'kilimanjaro' && (
                        <>
                          {kilimanjaroList.map(t => (
                            <option key={t.name} value={t.name}>{t.name} (From ${t.basePrice})</option>
                          ))}
                          {!kilimanjaroList.some(t => t.name === formData.selectedExperience) && formData.selectedExperience && (
                            <option value={formData.selectedExperience}>{formData.selectedExperience}</option>
                          )}
                        </>
                      )}
                      {selectedCategory === 'safari' && (
                        <>
                          {safarisList.map(t => (
                            <option key={t.name} value={t.name}>{t.name} (From ${t.basePrice})</option>
                          ))}
                          {!safarisList.some(t => t.name === formData.selectedExperience) && formData.selectedExperience && (
                            <option value={formData.selectedExperience}>{formData.selectedExperience}</option>
                          )}
                        </>
                      )}
                      {selectedCategory === 'transfer' && (
                        <>
                          {transfersList.map(t => (
                            <option key={t.name} value={t.name}>{t.name} (From ${t.basePrice})</option>
                          ))}
                          {!transfersList.some(t => t.name === formData.selectedExperience) && formData.selectedExperience && (
                            <option value={formData.selectedExperience}>{formData.selectedExperience}</option>
                          )}
                        </>
                      )}
                    </select>
                  </div>

                  {/* Dynamic Date Controls depending on category */}
                  {(selectedCategory === 'kilimanjaro' || selectedCategory === 'safari' || (selectedCategory === 'tour' && (formData.selectedExperience.toLowerCase().includes('day') || formData.selectedExperience.toLowerCase().includes('escape')))) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <DatePicker
                          label="Arrival Date"
                          required
                          selectedDate={formData.arrivalDate || formData.preferredDate}
                          onChange={(date) => {
                            setFormData(prev => ({ ...prev, arrivalDate: date, preferredDate: date }));
                          }}
                          minDate={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <DatePicker
                          label="Departure Date"
                          required
                          selectedDate={formData.departureDate}
                          onChange={(date) => {
                            setFormData(prev => ({ ...prev, departureDate: date }));
                          }}
                          minDate={formData.arrivalDate || formData.preferredDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  ) : selectedCategory === 'transfer' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Transfer Category *</label>
                          <select
                            name="transferType"
                            value={formData.transferType || 'arrival'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => ({ ...prev, transferType: val }));
                            }}
                            className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 focus:outline-[#0B3B8C] bg-white font-semibold"
                          >
                            <option value="arrival">Arrival Flight (Airport to Resort)</option>
                            <option value="departure">Departure Flight (Resort to Airport)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Flight Number ID *</label>
                          <input
                            type="text"
                            name="transFlightNo"
                            value={formData.transFlightNo}
                            onChange={handleChange}
                            placeholder="e.g. QR-1481"
                            className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 focus:outline-[#0B3B8C] font-semibold uppercase font-mono"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <DatePicker
                            label="Flight Date"
                            required
                            selectedDate={formData.preferredDate}
                            onChange={(date) => {
                              setFormData(prev => ({ ...prev, preferredDate: date }));
                            }}
                            minDate={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Pickup / Meet Time *</label>
                          <input
                            type="time"
                            name="pickupTime"
                            value={formData.pickupTime}
                            onChange={handleChange}
                            className="w-full px-4 py-3 text-xs rounded-xl border border-gray-200 focus:outline-[#0B3B8C] font-semibold text-center"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <DatePicker
                          label="Planned Tour Date"
                          required
                          selectedDate={formData.preferredDate}
                          onChange={(date) => {
                            setFormData(prev => ({ ...prev, preferredDate: date }));
                          }}
                          minDate={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="bg-[#0B3B8C]/5 border border-[#0B3B8C]/15 rounded-2xl p-4.5 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-[#0B3B8C] font-black uppercase tracking-wider">
                          <Clock size={15} className="text-[#D4A017] animate-pulse" />
                          <span>Hotel Pickup Information</span>
                        </div>
                        <p className="text-gray-600 font-semibold leading-relaxed">
                          Exact pickup times depend on resort route logistics and will be confirmed 24 hours prior to departure via your provided WhatsApp contact.
                        </p>
                        <div className="flex items-center gap-1.5 text-amber-800 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl mt-1 font-bold">
                          <span>⏱️ Estimated Pickup Window:</span>
                          <span className="font-extrabold text-[#0B3B8C] font-mono">07:00 AM - 08:30 AM (Zone Dependent)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactive Multi-Month Availability Calendar */}
                  <div className="mt-4 pt-2">
                    <MultiMonthCalendar
                      isMultiSelect={
                        selectedCategory === 'kilimanjaro' || 
                        selectedCategory === 'safari' || 
                        (selectedCategory === 'tour' && (
                          formData.selectedExperience.toLowerCase().includes('day') || 
                          formData.selectedExperience.toLowerCase().includes('escape')
                        ))
                      }
                      selectedDate={formData.preferredDate}
                      onDateSelect={(date) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          preferredDate: date, 
                          arrivalDate: date, 
                          tourDate: date 
                        }));
                      }}
                      selectedRange={{
                        start: formData.arrivalDate || formData.preferredDate,
                        end: formData.departureDate
                      }}
                      onRangeSelect={(range) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          arrivalDate: range.start, 
                          preferredDate: range.start, 
                          tourDate: range.start,
                          departureDate: range.end 
                        }));
                      }}
                      category={selectedCategory}
                    />
                  </div>

                  {formData.preferredDate && (
                    <p className="text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl mt-2 border border-amber-100 flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      <span>Deadline: Booking closes {activePolicy.cutoffHours} hours before start time per company rules.</span>
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Preferred Currency</label>
                      <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white font-semibold text-gray-800"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Weather Seasonality</label>
                      <select
                        value={travelSeason}
                        onChange={e => setTravelSeason(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white font-semibold text-gray-800"
                      >
                        <option value="high">Dry Season Peak (+15%)</option>
                        <option value="low">Green Rain Season (-10%)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const isMulti = selectedCategory === 'kilimanjaro' || selectedCategory === 'safari' || (selectedCategory === 'tour' && (formData.selectedExperience.toLowerCase().includes('day') || formData.selectedExperience.toLowerCase().includes('escape')));
                      if (isMulti) {
                        if (!formData.arrivalDate && !formData.preferredDate) {
                          alert('Please select your arrival date.');
                          return;
                        }
                        if (!formData.departureDate) {
                          alert('Please select your departure date.');
                          return;
                        }
                      } else {
                        if (!formData.preferredDate) {
                          alert('Please choose a preferred date for your excursion.');
                          return;
                        }
                      }
                      setStep(2);
                    }}
                    className="bg-[#0B3B8C] hover:bg-[#072558] text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-1 cursor-pointer select-none"
                  >
                    <span>Proceed to Guest Details</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PRODUCT-SPECIFIC QUESTIONS */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <User size={18} />
                    <span>Step 2: Guest Details</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Please fill out fields customized exclusively for {selectedCategory.toUpperCase()} checklists.</p>
                </div>

                {/* SHARED GENERAL QUESTIONS (EMAIL/PHONE ALWAYS CRITICAL) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Lead Traveler Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full px-4.5 py-3.5 text-xs rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none transition-all duration-200 placeholder-slate-400 bg-white hover:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">WhatsApp Contact Number *</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      required
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="e.g. +255 629 506 063"
                      className="w-full px-4.5 py-3.5 text-xs rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none transition-all duration-200 placeholder-slate-400 bg-white hover:border-slate-300 font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@domain.com"
                      className="w-full px-4.5 py-3.5 text-xs rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none transition-all duration-200 placeholder-slate-400 bg-white hover:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Preferred Guide Language *</label>
                    <select
                      name="languagePreference"
                      value={formData.languagePreference || 'English'}
                      onChange={handleChange}
                      className="w-full px-4.5 py-3.5 text-xs rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none transition-all duration-200 bg-white hover:border-slate-300 text-gray-700 font-semibold"
                    >
                      <option value="English">English Chaperone</option>
                      <option value="French">French / Français Chaperone</option>
                      <option value="German">German / Deutsch Chaperone</option>
                      <option value="Spanish">Spanish / Español Chaperone</option>
                      <option value="Italian">Italian / Italiano Chaperone</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Estimated Budget (Optional)</label>
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget || ''}
                      onChange={handleChange}
                      placeholder="e.g. $1,500 USD per traveler"
                      className="w-full px-4.5 py-3.5 text-xs rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none transition-all duration-200 placeholder-slate-400 bg-white hover:border-slate-300"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Payment Preference *</label>
                    <select
                      name="paymentPreference"
                      value={formData.paymentPreference || 'Deposit (Pesapal)'}
                      onChange={handleChange}
                      className="w-full px-4.5 py-3.5 text-xs rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none transition-all duration-200 bg-white hover:border-slate-300 text-gray-700 font-semibold"
                    >
                      <option value="Deposit (Pesapal)">💳 Secure Credit Card Deposit Prepayment (Pesapal)</option>
                      <option value="Full Prepayment (Pesapal)">🌟 100% Full Prepayment Online (Pesapal)</option>
                      <option value="PayPal Sandbox">🅿️ Instant PayPal Sandbox Checkout</option>
                      <option value="Bank Wire Transfer">🏦 International Bank SWIFT Wire Transfer</option>
                    </select>
                  </div>
                </div>

                {/* PRODUCTS TYPE FORM VARIATIONS (Requirement 1) */}
                {selectedCategory === 'tour' && (
                  <div className="space-y-4 pt-5 border-t border-gray-100">
                    <h4 className="font-extrabold text-[#D4A017] text-xs uppercase tracking-wider">Zanzibar Excursion Questionnaire</h4>
                    
                    {/* Headcounts Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Adults *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={adultsCount}
                          onChange={e => setAdultsCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none transition-all duration-200 bg-white hover:border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Children (60%)</label>
                        <input
                          type="number"
                          min={0}
                          value={childrenCount}
                          onChange={e => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none transition-all duration-200 bg-white hover:border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Infants (Free)</label>
                        <input
                          type="number"
                          min={0}
                          value={infantsCount}
                          onChange={e => setInfantsCount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-4 py-3 text-xs rounded-xl border border-slate-200 focus:border-[#0B3B8C] focus:ring-4 focus:ring-[#0B3B8C]/10 focus:outline-none transition-all duration-200 bg-white hover:border-slate-300"
                        />
                      </div>
                    </div>

                    {/* Private vs Shared Selector */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                      <label className="block text-xs font-black text-[#0B3B8C] uppercase tracking-wider">Tour Service Option *</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTourType('shared')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            tourType === 'shared'
                              ? 'border-[#0B3B8C] bg-blue-50/50 text-[#0B3B8C]'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="text-xs font-bold">Standard Shared Tour</div>
                          <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Standard Group rates</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTourType('private')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            tourType === 'private'
                              ? 'border-[#0B3B8C] bg-blue-50/50 text-[#0B3B8C]'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center gap-1">
                            <span>Bespoke Private Tour</span>
                            <span className="bg-[#D4A017] text-white font-mono text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none">+20%</span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Private guide & vehicle</div>
                        </button>
                      </div>
                    </div>
                    {/* Dynamic Searchable Hotel Pickup & Surcharge Directory */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5 col-span-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#0B3B8C] uppercase tracking-wider">
                        <MapPin size={14} className="text-[#D4A017]" />
                        <span>Resort Pickup Location & Logistics Surcharge</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-xs font-semibold select-none border-b border-gray-100 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                          <input 
                            type="radio" 
                            name="hotelSelectType"
                            checked={!notListedHotel} 
                            onChange={() => {
                              setNotListedHotel(false);
                              setSelectedZoneId('');
                            }}
                            className="text-[#0B3B8C] focus:ring-0"
                          />
                          <span>Zanzibar Partner Resorts Directory</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                          <input 
                            type="radio" 
                            name="hotelSelectType"
                            checked={notListedHotel} 
                            onChange={() => {
                              setNotListedHotel(true);
                              setSelectedHotelId('');
                            }}
                            className="text-[#0B3B8C] focus:ring-0"
                          />
                          <span>My Hotel is Not Listed (Custom Location)</span>
                        </label>
                      </div>

                      {!notListedHotel ? (
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-gray-600 uppercase">Search active hotel directory</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={hotelQuery}
                              onChange={(e) => setHotelQuery(e.target.value)}
                              placeholder="Type resort name... e.g. Royal Zanzibar"
                              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                            />
                            {hotelQuery && (
                              <button 
                                type="button" 
                                onClick={() => setHotelQuery('')}
                                className="absolute right-3 top-2 text-[10px] uppercase tracking-wider font-extrabold text-blue-800 hover:text-blue-900"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="max-h-36 overflow-y-auto border border-gray-100 rounded-xl bg-white divide-y divide-gray-50">
                            {hotelsList
                              .filter(h => h.name.toLowerCase().includes(hotelQuery.toLowerCase()))
                              .map(hotel => {
                                const zone = zonesList.find(z => z.id === hotel.zoneId);
                                const isSelected = selectedHotelId === hotel.id;
                                return (
                                  <button
                                    key={hotel.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedHotelId(hotel.id);
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        hotelName: hotel.name,
                                        pickupLocation: `${hotel.name} (${zone?.name || 'Region'})` 
                                      }));
                                    }}
                                    className={`w-full px-3.5 py-2.5 text-left text-xs transition-colors flex items-center justify-between ${
                                      isSelected ? 'bg-slate-50 text-[#0B3B8C] font-extrabold border-l-2 border-[#D4A017]' : 'hover:bg-slate-50 text-gray-700'
                                    }`}
                                  >
                                    <div>
                                      <p className="font-semibold">{hotel.name}</p>
                                      <p className="text-[9px] text-[#D4A017] lowercase font-semibold">{zone?.name || 'General Zone'}</p>
                                    </div>
                                    <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                      +${zone?.price || 0} pickup surcharge
                                    </span>
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Lead Guest's Custom Hotel Name</label>
                            <input
                              type="text"
                              value={customHotelName}
                              onChange={(e) => {
                                setCustomHotelName(e.target.value);
                                setFormData(prev => ({ ...prev, hotelName: e.target.value }));
                              }}
                              placeholder="e.g. Kendwa Sunset Resort"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Region / Transport Zone</label>
                            <select
                              value={selectedZoneId}
                              onChange={(e) => {
                                setSelectedZoneId(e.target.value);
                                const zone = zonesList.find(z => z.id === e.target.value);
                                setFormData(prev => ({ 
                                  ...prev, 
                                  pickupLocation: `${customHotelName || 'Custom Lodge'} (${zone?.name || 'Region'})` 
                                }));
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-600"
                            >
                              <option value="">-- Choose Town Transport Zone --</option>
                              {zonesList.map(zone => (
                                <option key={zone.id} value={zone.id}>
                                  {zone.name} (+${zone.price} Surcharge)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Origin Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="e.g. Germany"
                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">All Guest Names (Optional)</label>
                      <textarea
                        name="guestNamesList"
                        rows={2}
                        value={formData.guestNamesList}
                        onChange={handleChange}
                        placeholder="e.g. John Doe, Sarah Doe, Junior Doe"
                        className="w-full p-3 text-xs rounded-xl border border-gray-200"
                      />
                    </div>
                  </div>
                )}

                {selectedCategory === 'kilimanjaro' && (
                  <div className="space-y-4 pt-4 border-t border-[#D4A017]/30">
                    <h4 className="font-extrabold text-[#D4A017] text-xs uppercase tracking-wider">Mount Kilimanjaro Expeditions Form</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Total Climbers headcount *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={formData.kiliClimbersCount}
                          onChange={e => setFormData(prev => ({ ...prev, kiliClimbersCount: Math.max(1, parseInt(e.target.value) || 1) }))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Dietary Requirements</label>
                        <select
                          name="kiliDietaryReqs"
                          value={formData.kiliDietaryReqs}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                        >
                          <option value="Omnivore">Standard Omnivore</option>
                          <option value="Vegetarian">Strict Vegetarian</option>
                          <option value="Vegan">Gluten-Free Vegan</option>
                          <option value="Halal">Certified Halal Only</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nationality</label>
                        <input
                          type="text"
                          name="kiliNationality"
                          value={formData.kiliNationality}
                          onChange={handleChange}
                          placeholder="USA"
                          className="w-full px-3 py-2 rounded-xl border text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Passport No.</label>
                        <input
                          type="text"
                          name="kiliPassportNo"
                          value={formData.kiliPassportNo}
                          onChange={handleChange}
                          placeholder="A1234567"
                          className="w-full px-3 py-2 rounded-xl border text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Birth Date</label>
                        <input
                          type="date"
                          name="kiliDob"
                          value={formData.kiliDob}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-xl border text-xs text-center"
                        />
                      </div>
                    </div>

                    {/* Rental Gears checks */}
                    <div>
                      <span className="block text-xs font-bold text-gray-700 uppercase mb-2">Check Required Mount Rental Gears (Secure on-site)</span>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          'Heavy Sub-Zero Down Jacket ($30)',
                          'Therm-a-Rest Sleeping Mattress ($15)',
                          'Ergonomic Trekking Poles pair ($10)',
                          'Broken-In Supportive Boots ($20)',
                        ].map(gear => (
                          <label key={gear} className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={formData.kiliRentalGears.includes(gear)}
                              onChange={() => toggleKiliGear(gear)}
                              className="rounded text-[#0B3B8C] focus:ring-[#0B3B8C]"
                            />
                            <span>{gear}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hotel Before Climb</label>
                        <input
                          type="text"
                          name="kiliHotelBefore"
                          value={formData.kiliHotelBefore}
                          onChange={handleChange}
                          placeholder="Moshi Base Hotel"
                          className="w-full px-3 py-2 rounded-xl border text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Emergency Contact Info</label>
                        <input
                          type="text"
                          name="kiliEmergencyContact"
                          value={formData.kiliEmergencyContact}
                          onChange={handleChange}
                          placeholder="Name & Phone Number"
                          className="w-full px-3 py-2 rounded-xl border text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedCategory === 'safari' && (
                  <div className="space-y-4 pt-4 border-t border-[#D4A017]/30">
                    <h4 className="font-extrabold text-[#D4A017] text-xs uppercase tracking-wider">Tanzania Wildlife Safari Questionnaires</h4>
                    
                    {/* Headcounts Grid */}
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Adults Count *</label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={adultsCount}
                          onChange={e => setAdultsCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-2 rounded-xl border"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Children Count</label>
                        <input
                          type="number"
                          min={0}
                          value={childrenCount}
                          onChange={e => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-2 rounded-xl border"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Infants Count</label>
                        <input
                          type="number"
                          min={0}
                          value={infantsCount}
                          onChange={e => setInfantsCount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-2 rounded-xl border"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Lodging standard</label>
                        <select
                          name="safariAccommodation"
                          value={formData.safariAccommodation}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-xl border bg-white"
                        >
                          <option value="budget">Camping/Budget ($)</option>
                          <option value="midrange">Swahili Lodge Midrange ($$)</option>
                          <option value="luxury">Sultan Elite Resorts ($$$)</option>
                        </select>
                      </div>
                    </div>

                    {/* Private vs Shared Selector */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 col-span-4">
                      <label className="block text-xs font-black text-[#0B3B8C] uppercase tracking-wider">Safari Service Option *</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTourType('shared')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            tourType === 'shared'
                              ? 'border-[#0B3B8C] bg-blue-50/50 text-[#0B3B8C]'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="text-xs font-bold">Standard Shared Safari</div>
                          <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Shared 4x4 landcruiser game drive</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTourType('private')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            tourType === 'private'
                              ? 'border-[#0B3B8C] bg-blue-50/50 text-[#0B3B8C]'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center gap-1">
                            <span>Private Custom Safari</span>
                            <span className="bg-[#D4A017] text-white font-mono text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none">+20%</span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-semibold mt-0.5">Private vehicle, custom departure schedule</div>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Do you require flight assistance?</label>
                        <select
                          name="safariWithFlights"
                          value={formData.safariWithFlights}
                          onChange={handleChange}
                          className="w-full p-2.5 rounded-xl border bg-white text-xs text-xs"
                        >
                          <option value="No">No, I will secure my own airline tickets</option>
                          <option value="Yes">Yes, include fly-in light aircraft shuttle tickets</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Lead Nationality</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="e.g. British"
                          className="w-full p-2.5 rounded-xl border text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-gray-700 uppercase mb-2">Check Optional Safari Addons</span>
                      <div className="flex flex-wrap gap-3">
                        {['Masaai Village Visit ($30)', 'Serengeti Balloon Safari ($550)', 'Olduvai Gorge Historic Museum ($35)'].map(act => (
                          <label key={act} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={formData.safariOptionalActivities.includes(act)}
                              onChange={() => toggleSafariAddon(act)}
                              className="rounded text-[#0B3B8C]"
                            />
                            <span>{act}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedCategory === 'transfer' && (
                  <div className="space-y-4 pt-4 border-t border-gray-150">
                    <h4 className="font-extrabold text-[#D4A017] text-xs uppercase tracking-wider font-semibold">Resorts Shuttles Airline Checklists</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Airline Carrier Name *</label>
                        <input
                          type="text"
                          name="transAirline"
                          required
                          value={formData.transAirline}
                          onChange={handleChange}
                          placeholder="Qatar Airways / Emirates"
                          className="w-full p-2.5 rounded-xl border text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Flight Number ID *</label>
                        <input
                          type="text"
                          name="transFlightNo"
                          required
                          value={formData.transFlightNo}
                          onChange={handleChange}
                          placeholder="e.g. QR-1481"
                          className="w-full p-2.5 rounded-xl border text-xs uppercase font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Arrival Time *</label>
                        <input
                          type="time"
                          name="transArrivalTime"
                          required
                          value={formData.transArrivalTime}
                          onChange={handleChange}
                          className="w-full p-2.5 rounded-xl border text-xs text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Total Travel Bags Count</label>
                        <select
                          name="transBagsCount"
                          value={formData.transBagsCount}
                          onChange={handleChange}
                          className="w-full p-2 text-xs rounded-xl border bg-white text-center"
                        >
                          <option value="1">1 Luggage Bag</option>
                          <option value="2">2 Standard Hold Bags</option>
                          <option value="3">3 Large Suitcases</option>
                          <option value="4+">4 or More Pieces</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Child Seats Required?</label>
                        <select
                          name="transChildSeats"
                          value={formData.transChildSeats}
                          onChange={handleChange}
                          className="w-full p-2.5 rounded-xl border bg-white text-xs"
                        >
                          <option value="None">No seats needed</option>
                          <option value="1">Yes, 1 Toddler Seat</option>
                          <option value="2">2 Toddler Seats required</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Hotel / Location</label>
                        <input
                          type="text"
                          name="transHotelDest"
                          value={formData.transHotelDest}
                          onChange={handleChange}
                          placeholder="Royal Orchid Nungwi"
                          className="w-full p-2.5 rounded-xl border text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Special Requests & Customizations</label>
                  <textarea
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Provide any custom requests, food codes, transfer checkpoints..."
                    className="w-full p-3 text-xs rounded-xl border border-gray-200 focus:outline-[#0B3B8C]"
                  />
                </div>

                <div className="pt-4 border-t flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-500 hover:text-gray-700 font-bold text-xs"
                  >
                    Back to Step 1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      const phoneRegex = /^\+?[0-9\s\-()]{7,18}$/;

                      if (!formData.name.trim()) {
                        showToast('Please specify your Full Name to proceed.', 'error');
                        return;
                      }
                      if (!formData.email.trim()) {
                        showToast('Please specify your Email Address to proceed.', 'error');
                        return;
                      }
                      if (!emailRegex.test(formData.email.trim())) {
                        showToast('Please enter a valid email address (e.g. name@domain.com).', 'error');
                        return;
                      }
                      if (!formData.whatsapp.trim()) {
                        showToast('Please specify your WhatsApp contact number.', 'error');
                        return;
                      }
                      if (!phoneRegex.test(formData.whatsapp.trim())) {
                        showToast('Please enter a valid WhatsApp contact number (7-18 digits).', 'error');
                        return;
                      }
                      if (!formData.country.trim()) {
                        showToast('Please specify your Origin Country.', 'error');
                        return;
                      }

                      // Specific validations for Transfers
                      if (selectedCategory === 'transfer') {
                        if (!formData.transAirline.trim()) {
                          showToast('Please enter your Airline Carrier Name.', 'error');
                          return;
                        }
                        if (!formData.transFlightNo.trim()) {
                          showToast('Please enter your Flight Number.', 'error');
                          return;
                        }
                        if (!formData.transArrivalTime.trim()) {
                          showToast('Please enter your flight Arrival Time.', 'error');
                          return;
                        }
                      }

                      setStep(3);
                    }}
                    className="bg-[#0B3B8C] hover:bg-[#072558] text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-1 cursor-pointer select-none"
                  >
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW RESERVATION & SECURE CHECKOUT */}
            {step === 3 && (
              <div className="space-y-6 select-none animate-fadeIn">
                <div>
                  <h3 className="text-lg font-black text-[#0B3B8C] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <ShieldCheck size={18} className="text-[#D4A017]" />
                    <span>Step 3: Review Reservation & Secure Checkout</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Please review your tropical itinerary, verify standard cancellation terms, and complete secure payment authorization below.</p>
                </div>

                {/* Grid checklist specifications */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-150 space-y-3.5 text-xs text-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Reserved Expedition</p>
                      <p className="font-extrabold text-gray-900 text-sm mt-0.5">{formData.selectedExperience}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Target Launch Date</p>
                      <p className="font-extrabold text-emerald-700 text-sm mt-0.5">
                        {(formData.arrivalDate && formData.departureDate) 
                          ? `${formData.arrivalDate} to ${formData.departureDate}` 
                          : formData.preferredDate}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-3 border-gray-200">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Primary Contact Liaison</p>
                      <p className="font-bold text-gray-800">{formData.name} ({formData.whatsapp})</p>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Registered Party count</p>
                      <p className="font-bold text-gray-800">
                        {selectedCategory === 'kilimanjaro' ? `${formData.kiliClimbersCount} climbers` : `${adultsCount} Adults, ${childrenCount} Kids`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-3 border-gray-200 text-[11px]">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Guide Language Choice</p>
                      <p className="font-bold text-gray-800">{formData.languagePreference || 'English'}</p>
                    </div>
                    {formData.budget && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400">Estimated Budget</p>
                        <p className="font-bold text-gray-800">{formData.budget}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3 border-gray-200 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Flexible Cancellation Policy</p>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                      🌴 Cancel up to <span className="font-bold text-gray-800">48 hours</span> before departure time for a 100% full reimbursement.
                      Secure your package peacefully knowing Swahili tides and guides accommodate client flight shifts easily.
                    </p>
                  </div>
                </div>

                {/* Verification Steps */}
                <div className="space-y-3 bg-slate-50 p-4.5 rounded-2xl border border-gray-150">
                  <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Required Safety Checks:</p>
                  
                  <label className="flex items-start gap-2.5 text-xs font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={e => setAgreeToTerms(e.target.checked)}
                      className="rounded text-[#0B3B8C] mt-0.5 font-bold"
                    />
                    <span className="text-gray-600 leading-normal">
                      Yes, I agree to the fully verified <span className="text-[#0B3B8C] underline">Standard Terms of Zanzibar Trip & Relax</span> and the 48-hour cancellation policy.
                    </span>
                  </label>

                  <div className="p-3 bg-white rounded-xl border border-gray-200 flex items-start gap-2.5 text-xs">
                    <input
                      type="checkbox"
                      checked={captchaTick}
                      onChange={e => setCaptchaTick(e.target.checked)}
                      className="rounded text-[#0B3B8C] mt-0.5"
                    />
                    <div className="text-gray-600">
                      <span className="font-extrabold text-gray-800">reCAPTCHA verification check:</span> Yes, I verify that I am a human booking this custom Zanzibar excursion.
                    </div>
                  </div>
                </div>

                {/* 🔒 PAYMENTS PANEL CONTAINER */}
                <div className={`transition-all duration-300 ${(!agreeToTerms || !captchaTick) ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  
                  <div className="space-y-4 border-t pt-5">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard size={16} className="text-[#0B3B8C]" />
                      <h4 className="font-extrabold text-xs text-[#0B3B8C] uppercase tracking-wider">Authorize Secure Prepayment</h4>
                    </div>

                    {(!agreeToTerms || !captchaTick) && (
                      <p className="text-[10px] bg-amber-500/10 text-amber-800 border border-amber-500/15 rounded-xl p-3.5 font-bold leading-normal mb-3 flex items-center gap-2">
                        ⚠️ Please tick both standard terms and human verification check boxes above to unlock the secure checkout payment gateways.
                      </p>
                    )}

                    {/* Configured payment warning checks */}
                    <div className="bg-emerald-500/10 p-4 border border-emerald-500/20 rounded-2xl text-xs flex gap-2.5">
                      <ShieldCheck size={16} className="text-emerald-700 shrink-0 select-none mt-0.5 animate-pulse" />
                      <div>
                        <span className="text-emerald-800 font-bold uppercase block text-[10px]">Security Prepayment Policy</span>
                        Your selection requires a <span className="font-black underline">{pricing.currencySymbol}{paymentOption === 'deposit' ? pricing.displayDeposit : pricing.displayTotal}</span> prepayment to automatically capture and confirm slots instantly on company servers.
                      </div>
                    </div>

                    {/* Settle Select Toggle */}
                    {activePolicy.paymentOption !== 'full' && (
                      <div className="grid grid-cols-2 gap-3 text-xs font-bold text-center select-none">
                        <button
                          type="button"
                          onClick={() => setPaymentOption('deposit')}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            paymentOption === 'deposit' 
                              ? 'bg-blue-50/30 border-[#0B3B8C] text-[#0B3B8C]' 
                              : 'border-gray-200 text-gray-450 bg-white hover:border-gray-300'
                          }`}
                        >
                          💳 Secure {configuredPct || 30}% Deposit Payment
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentOption('full')}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            paymentOption === 'full' 
                              ? 'bg-blue-50/30 border-[#0B3B8C] text-[#0B3B8C]' 
                              : 'border-gray-200 text-gray-450 bg-white hover:border-gray-300'
                          }`}
                        >
                          🌟 Pay 100% Full Prepayment Online
                        </button>
                      </div>
                    )}

                    {/* Secure Gateway Options */}
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setSuccessPayMethod('card')}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                            successPayMethod === 'card' 
                              ? 'border-[#0B3B8C] bg-blue-50/10 text-[#0B3B8C] ring-2 ring-[#0B3B8C]/15' 
                              : 'border-gray-200 text-gray-750 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-lg">💳</span>
                            <span className="text-[8px] bg-[#0B3B8C]/10 text-[#0B3B8C] px-1.5 py-0.5 rounded-full font-black uppercase">Primary</span>
                          </div>
                          <div>
                            <p className="font-extrabold text-xs">Pesapal Gateway</p>
                            <p className="text-[9px] text-gray-400 font-medium">Visa & Mastercard Secure</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSuccessPayMethod('paypal')}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                            successPayMethod === 'paypal' 
                              ? 'border-[#0B3B8C] bg-blue-50/10 text-[#0B3B8C] ring-2 ring-[#0B3B8C]/15' 
                              : 'border-gray-200 text-gray-750 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-lg">🅿️</span>
                          <div>
                            <p className="font-extrabold text-xs">PayPal Secure</p>
                            <p className="text-[9px] text-gray-400 font-medium">Instant PayPal Sandbox</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSuccessPayMethod('bank')}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                            successPayMethod === 'bank' 
                              ? 'border-[#0B3B8C] bg-blue-50/10 text-[#0B3B8C] ring-2 ring-[#0B3B8C]/15' 
                              : 'border-gray-200 text-gray-750 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-lg">🏦</span>
                          <div>
                            <p className="font-extrabold text-xs">Bank Transfer</p>
                            <p className="text-[9px] text-gray-400 font-medium">International SWIFT Wire</p>
                          </div>
                        </button>
                      </div>

                      {successPaidState === 'processing' ? (
                        <div className="text-center py-6 space-y-3">
                          <RefreshCw size={24} className="animate-spin text-[#0B3B8C] mx-auto" />
                          <p className="text-xs font-bold text-gray-700">Verifying merchant credit logs...</p>
                          <p className="text-[10px] text-gray-400 font-semibold">SSL Handshake with central Tanzanian financial vaults.</p>
                        </div>
                      ) : successPayMethod === 'card' ? (
                        <div className="space-y-4 bg-gray-50/40 p-5 rounded-2xl border border-gray-150">
                          <div className="bg-[#0B3B8C]/5 border border-[#0B3B8C]/15 rounded-xl p-3 text-[11px] text-[#0B3B8C] font-semibold flex items-start gap-2">
                            <ShieldCheck size={16} className="text-[#D4A017] shrink-0" />
                            <span>
                              <strong>Secured by Pesapal:</strong> Visa and Mastercard payments are processed securely via our primary Pesapal merchant gateway with 256-Bit SSL encryption.
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Cardholder Card Number</label>
                              <input
                                type="text"
                                placeholder="4111 2222 3333 4444"
                                value={successCardNo}
                                onChange={e => setSuccessCardNo(e.target.value.replace(/\D/g, '').substring(0, 16))}
                                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-[#0B3B8C] font-mono bg-white"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2">
                                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Card Expiration</label>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  value={successCardExpiry}
                                  onChange={e => setSuccessCardExpiry(e.target.value.substring(0, 5))}
                                  className="w-full px-2 py-2 text-xs rounded-lg border border-gray-200 text-center focus:outline-[#0B3B8C] font-mono bg-white"
                                />
                              </div>
                              <div className="col-span-1">
                                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">CVC</label>
                                <input
                                  type="password"
                                  placeholder="***"
                                  value={successCardCvc}
                                  onChange={e => setSuccessCardCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                  className="w-full px-2 py-2 text-xs rounded-lg border border-gray-200 text-center focus:outline-[#0B3B8C] font-mono bg-white"
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleSimulatedPayment}
                            className="w-full bg-[#0B3B8C] hover:bg-[#072558] text-white font-extrabold py-3.5 rounded-xl text-xs transition-all shadow cursor-pointer uppercase tracking-wider animate-pulse font-mono mt-2 flex items-center justify-center gap-1.5"
                          >
                            <span>Authorize & Pay {pricing.currencySymbol}{paymentOption === 'deposit' ? pricing.displayDeposit : pricing.displayTotal}</span>
                          </button>
                        </div>
                      ) : successPayMethod === 'paypal' ? (
                        <div className="text-center bg-gray-50/40 p-6 rounded-2xl border border-gray-150 space-y-3">
                          <p className="text-xs text-slate-500 font-semibold leading-normal">Authenticate secure PayPal transactions safely in our gateway sandbox.</p>
                          <button
                            type="button"
                            onClick={handleSimulatedPayment}
                            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-6 py-2.5 rounded-full text-xs transition-all cursor-pointer shadow inline-flex items-center gap-2 select-none font-mono"
                          >
                            💛 Authorize via PayPal Sandbox
                          </button>
                        </div>
                      ) : (
                        <div className="bg-gray-50/40 p-5 rounded-2xl border border-gray-150 space-y-4 text-xs">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-[#0B3B8C] uppercase tracking-wider text-[10px]">SWIFT Wire Transfer Instructions</h4>
                            <p className="text-gray-500 leading-normal">
                              Please transfer the prepayment amount directly to our corporate bank account in Zanzibar. Your booking status will remain <strong>Pending Receipt Verification</strong> until our finance desk verifies the funds.
                            </p>
                          </div>

                          <div className="bg-white border border-gray-250 rounded-xl p-4 space-y-2.5 font-semibold text-gray-700">
                            <div className="flex justify-between border-b border-gray-100 pb-1.5">
                              <span className="text-gray-400">Bank Name:</span>
                              <span className="text-gray-900 font-extrabold">The People's Bank of Zanzibar (PBZ)</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1.5">
                              <span className="text-gray-400">Account Name:</span>
                              <span className="text-gray-900 font-extrabold">Zanzibar Trip & Relax Ltd.</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1.5">
                              <span className="text-gray-400">Account Number:</span>
                              <span className="text-gray-900 font-mono font-extrabold">0400032901</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1.5">
                              <span className="text-gray-400">SWIFT / BIC:</span>
                              <span className="text-gray-900 font-mono font-extrabold">PBZATZTZ</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Amount Due:</span>
                              <span className="text-emerald-600 font-extrabold">
                                {pricing.currencySymbol}{paymentOption === 'deposit' ? pricing.displayDeposit : pricing.displayTotal}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleSimulatedPayment}
                            className="w-full bg-[#D4A017] hover:bg-[#bfa315] text-[#020C1F] font-black py-3 rounded-xl text-xs transition-all shadow cursor-pointer uppercase tracking-wider font-mono"
                          >
                            Submit Bank Wire Booking Request
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-gray-500 hover:text-gray-700 font-bold text-xs"
                  >
                    Back to Guest Details
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT AREA: Core Dynamic pricing engine invoice card (Always prominent except Step 5 success) */}
          <div className="lg:col-span-5 flex flex-col gap-6 self-start shrink-0">
            
            {/* Real-time destination clock & weather box */}
            <div className="bg-gradient-to-br from-[#091020] to-[#0D182E] text-white p-5 rounded-3xl border border-white/10 shadow-md">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3.5 select-none">
                <div>
                  <span className="block text-[8px] uppercase font-bold tracking-widest text-[#D4A017]">live regional indicators</span>
                  <h4 className="text-sm font-black tracking-tight font-sans">
                    {selectedCategory === 'kilimanjaro' ? 'Mount Kilimanjaro Region' : 'Zanzibar Archipelago'}
                  </h4>
                </div>
                <span className="text-xl bg-white/5 hover:bg-white/10 transition-colors p-2 rounded-xl border border-white/5 leading-none">
                  🌴
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-bold text-white/40">Local Date</p>
                  <p className="font-bold text-white text-xs whitespace-nowrap">{zanzibarDate}</p>
                  <p className="text-[9px] uppercase font-bold text-white/40 pt-1">Local Time (EAT)</p>
                  <p className="font-bold text-[#D4A017] text-sm tracking-wide font-mono animate-pulse">{zanzibarTime}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-center items-center text-center">
                  <span className="text-3xl leading-none filter drop-shadow animate-bounce">
                    {zanzibarWeather?.icon || '☀️'}
                  </span>
                  <span className="font-extrabold text-lg text-white mt-1 border-b border-white/10 pb-0.5 font-mono">
                    {zanzibarWeather ? `${zanzibarWeather.temp}°C` : '29°C'}
                  </span>
                  <span className="text-[8px] uppercase font-bold text-white/50 tracking-wider mt-1 truncate max-w-full">
                    {zanzibarWeather?.text || 'Sunny Paradise'}
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time price estimation component (using DatePicker states) */}
            <PriceEstimator
              selectedCategory={selectedCategory}
              selectedExperience={formData.selectedExperience}
              adultsCount={adultsCount}
              childrenCount={childrenCount}
              arrivalDate={formData.arrivalDate}
              departureDate={formData.departureDate}
              preferredDate={formData.preferredDate}
              selectedAddons={selectedAddons}
              hotelNights={hotelNights}
              selectedHotelId={selectedHotelId}
              selectedZoneId={selectedZoneId}
              notListedHotel={notListedHotel}
              customHotelName={customHotelName}
              currency={currency}
              travelSeason={travelSeason}
              pricing={pricing}
            />

            {/* Core Billing summary wrapper for input tools */}
            <div className="bg-gradient-to-br from-[#0A1224] to-[#121E36] text-white p-7 rounded-3xl border border-white/5 space-y-6">


            {/* Promo Code Input panel */}
            {step < 5 && (
              <div className="space-y-2 border-t border-white/5 pt-4">
                <p className="text-[10px] font-bold text-white/70 uppercase">Do you have a Promotion Code?</p>
                {couponApplied ? (
                  <div className="p-2.5 bg-emerald-900/20 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                      <CheckCircle2 size={13} />
                      <span>Code Verified & Applied!</span>
                    </div>
                    <button onClick={removeCoupon} className="text-white/40 hover:text-white text-[10px] underline cursor-pointer">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="WELCOME10 / SAVE50"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      className="flex-grow bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-[#D4A017] uppercase tracking-wider font-bold"
                    />
                    <button
                      type="button"
                      onClick={checkPromoCode}
                      className="bg-[#D4A017] hover:bg-[#c49010] text-white text-xs font-bold px-3 py-1.5 rounded-lg select-none cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[10px] text-red-400 font-semibold">{couponError}</p>}
              </div>
            )}

            {/* Price tag results totals */}
            <div className="border-t border-white/10 pt-4 space-y-3 font-mono">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[10px] text-white/60">AGGREGATE TOUR TOTAL PRICE</span>
                <span className="text-xl font-black text-[#D4A017]">{pricing.currencySymbol}{pricing.displayTotal}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">DUE SECURE PREPAYMENT (Now)</span>
                <span className="text-white font-extrabold">
                  {pricing.currencySymbol}
                  {paymentOption === 'full' ? pricing.displayTotal : pricing.displayDeposit}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-white/40">
                <span>REMAINING DUE ON DEPARTURE</span>
                <span>{pricing.currencySymbol}{pricing.displayRemaining}</span>
              </div>
            </div>

            {/* Quality Seals */}
            <div className="border-t border-white/5 pt-4 text-center text-[10px] text-white/30 space-y-1">
              <p>🔒 SSL Encrypted Checkout Guard</p>
              <p>Registered Zanzibar Tour Operator Lic: TALA No. 98112-ZRT</p>
            </div>
          </div> {/* Closes bg-gradient-to-br */}
        </div> {/* Closes lg:col-span-5 */}

        </div>
        )}
      </div>

      {/* Success Summary Modal (Requirement) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 15 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
          >
            {/* Header branding */}
            <div className="bg-[#0B3B8C] text-white p-6 relative flex-shrink-0">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 right-4 text-white/75 hover:text-white text-xl font-bold p-1 bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
                title="Close"
              >
                ✕
              </button>
              <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-[0.2em] font-mono block mb-1">
                reservation summary dispatch
              </span>
              <h3 className="text-xl font-black font-sans flex items-center gap-2">
                <Sparkles size={20} className="text-[#D4A017] animate-pulse" />
                <span>Your Swahili Adventure is Secured!</span>
              </h3>
            </div>

            {/* Content body */}
            <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Simulated Email Confirmation Dispatch tracker */}
              <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-[#0B3B8C] font-extrabold text-xs">
                    <Mail size={16} />
                    <span>Client-Side Email Confirmation Dispatcher</span>
                  </div>
                  <span className={`text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full ${
                    emailSendingStatus === 'sent' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                  }`}>
                    {emailSendingStatus === 'preparing' && 'Preparing Draft...'}
                    {emailSendingStatus === 'connecting' && 'Connecting SMTP...'}
                    {emailSendingStatus === 'sent' && 'Email Dispatched!'}
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Simulated Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                      initial={{ width: '0%' }}
                      animate={{
                        width: emailSendingStatus === 'preparing' ? '33%' :
                               emailSendingStatus === 'connecting' ? '66%' :
                               emailSendingStatus === 'sent' ? '100%' : '0%'
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                    {emailSendingStatus === 'preparing' && 'Drafting official confirmation document with reference seal...'}
                    {emailSendingStatus === 'connecting' && `Connecting with mail server to dispatch copy to ${formData.email || 'guest@example.com'}...`}
                    {emailSendingStatus === 'sent' && (
                      <span>
                        SUCCESS! Confirmation email with certified itinerary and proforma receipt has been sent to <strong className="text-gray-800">{formData.email || 'your registered email'}</strong> and carbon-copied to <strong className="text-gray-800">info@zanzibartripandrelax.com</strong>.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Booking Specifications table */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Bespoke Expedition Specifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs text-gray-600">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Booking Reference</p>
                    <div className="flex items-center gap-1.5 font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg w-fit">
                      <span>{reference}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(reference);
                          setCopiedRef(true);
                          setTimeout(() => setCopiedRef(false), 2000);
                        }}
                        className="text-emerald-600 hover:text-emerald-800 cursor-pointer p-0.5 hover:bg-emerald-100 rounded"
                        title="Copy to clipboard"
                      >
                        {copiedRef ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Lead Adventure Enthusiast</p>
                    <p className="font-extrabold text-gray-800">{formData.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{formData.whatsapp}</p>
                  </div>

                  <div className="space-y-1 md:col-span-2 border-t pt-3 border-gray-200/60">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Selected Expedition</p>
                    <p className="font-extrabold text-[#0B3B8C] text-sm">{formData.selectedExperience}</p>
                  </div>

                  <div className="space-y-1 border-t pt-3 border-gray-200/60">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Departure Date</p>
                    <p className="font-bold text-gray-800">
                      {formData.preferredDate || formData.arrivalDate || 'Not specified'}
                    </p>
                  </div>

                  <div className="space-y-1 border-t pt-3 border-gray-200/60">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Registered Party Size</p>
                    <p className="font-bold text-gray-800">
                      {selectedCategory === 'kilimanjaro' 
                        ? `${formData.kiliClimbersCount} climbers` 
                        : `${adultsCount} Adults, ${childrenCount} Children`}
                    </p>
                  </div>

                  <div className="space-y-1 md:col-span-2 border-t pt-3 border-gray-250 flex justify-between items-center bg-blue-50/20 -mx-4 -mb-4 p-4 rounded-b-2xl">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Financial Settlement (Paid Now)</p>
                      <p className="text-[9px] text-gray-400">
                        {paymentOption === 'full' ? '100% full prepayment settled' : 'Dynamic security deposit prepayment approved'}
                      </p>
                    </div>
                    <span className="font-mono text-lg font-black text-[#D4A017]">
                      {pricing.currencySymbol}{paymentOption === 'full' ? pricing.displayTotal : pricing.displayDeposit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calendar Invite Generator */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl border border-gray-200 p-5 space-y-3">
                <div className="flex items-center gap-2 text-slate-700 font-extrabold text-xs">
                  <Calendar size={16} className="text-[#0B3B8C]" />
                  <span>Calendar Invite Integrator (.ics)</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Download a certified standard <strong className="text-gray-700">iCalendar file (.ics)</strong> to seamlessly log this adventure into your Google Calendar, Apple Calendar, or Microsoft Outlook program. Keep dates synchronized across time zones easily!
                </p>
                <button
                  type="button"
                  onClick={handleDownloadCalendarInvite}
                  className="bg-[#0B3B8C] hover:bg-[#072558] text-white font-extrabold text-xs px-5 py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer w-full shadow-md hover:shadow-lg transition-all font-mono"
                >
                  <Download size={14} />
                  <span>Download Calendar Invite (.ics)</span>
                </button>
              </div>
            </div>

            {/* Footer action */}
            <div className="bg-gray-50 border-t border-gray-150 p-4.5 flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer select-none"
              >
                Close Summary
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export { bookingCategories };
