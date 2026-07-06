import React, { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { motion, AnimatePresence } from 'motion/react';
import DatePicker from '../components/DatePicker';
import { showToast } from '../components/ToastNotification';
import { ExitIntentModal } from '../components/ExitIntentModal';
import {
  Calendar, User, Phone, Mail, CheckCircle2, MessageCircle, AlertCircle, RefreshCw,
  MapPin, Users, Clock, Compass, Shield, HelpCircle, ArrowRight, Download, Printer,
  Check, Percent, CreditCard, ShieldCheck, Heart, Luggage, Award, Sparkles, Copy, Home,
  ChevronRight, ArrowLeft, Star, ShoppingBag, Landmark
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { syncBookingToCRM } from '../lib/crm';
import { useAnalytics } from '../context/AnalyticsContext';
import { getCoupons, getDateBlockages, Coupon, DateBlockage, addActivityLog, getSeasonalityConfig, getTransportZones, getHotels, TransportZone, HotelOption, getSiteContent, getExtendedSeasonality } from '../lib/cmsStore';
import {
  generateBookingPDF,
  generateReceiptPDF,
  generateInvoicePDF,
  generateItineraryPDF
} from '../lib/pdfGenerator';
import { addEmailLog, generateEmailTemplate, getSmtpConfig } from '../lib/emailService';

interface BookingProps {
  navigate: (page: Page, id?: string) => void;
  queryParams?: Record<string, string>;
}

// -----------------------------------------------------------------------------------------
// STATIC EXPERIENCE REPOSITORIES
// -----------------------------------------------------------------------------------------
const bookingCategories = [
  { id: 'tour', label: 'Zanzibar Excursion', desc: 'Marine cruises & spice tours', icon: Compass },
  { id: 'kilimanjaro', label: 'Kilimanjaro Trek', desc: 'Summit climbs & private routes', icon: Award },
  { id: 'safari', label: 'Tanzania Safari', desc: 'Wildlife game drives', icon: Sparkles },
  { id: 'transfer', label: 'Airport Transfer', desc: 'Private resort transport', icon: MapPin },
] as const;

const toursList = [
  { name: 'Safari Blue Ocean Cruise', basePrice: 45, duration: 'Full Day' },
  { name: 'Mnemba Island Snorkeling', basePrice: 35, duration: 'Half Day' },
  { name: 'Stone Town Cultural Walk', basePrice: 20, duration: '3 Hours' },
  { name: 'Prison Island & Giant Tortoises', basePrice: 25, duration: 'Half Day' },
  { name: 'Tangy Spice Farm Tour', basePrice: 15, duration: '3 Hours' },
  { name: 'Sunset Dhow Cruise', basePrice: 25, duration: '3 Hours' },
  { name: 'Jozani Forest National Park', basePrice: 25, duration: 'Half Day' },
];

const kilimanjaroList = [
  { name: 'Machame Route - 7 Days', basePrice: 1650, duration: '7 Days' },
  { name: 'Lemosho Route - 8 Days', basePrice: 1950, duration: '8 Days' },
  { name: 'Marangu Route - 6 Days', basePrice: 1400, duration: '6 Days' },
  { name: 'Rongai Route - 7 Days', basePrice: 1750, duration: '7 Days' },
  { name: 'Northern Circuit - 9 Days', basePrice: 2200, duration: '9 Days' },
];

const safarisList = [
  { name: 'Serengeti Wildlife Safari - 3 Days', basePrice: 850, duration: '3 Days' },
  { name: 'Ngorongoro Crater Classic - 2 Days', basePrice: 450, duration: '2 Days' },
  { name: 'Northern Circuit Discovery - 5 Days', basePrice: 1200, duration: '5 Days' },
  { name: 'Fly-in Luxury Serengeti - 3 Days', basePrice: 1600, duration: '3 Days' },
];

const transfersList = [
  { name: 'Airport Transfer - One Way', basePrice: 40, duration: '1 Way' },
  { name: 'Airport Transfer - Round Trip', basePrice: 70, duration: 'Round Trip' },
  { name: 'Hotel to Hotel Transfer', basePrice: 50, duration: '1 Way' },
  { name: 'Private Luxury Van Transfer', basePrice: 90, duration: '1 Way' },
];

export default function Booking({ navigate, queryParams }: BookingProps) {
  const { trackBookingInitiate, trackWhatsAppClick } = useAnalytics();

  // Unified Checkout Steps: 1 = Experience, 2 = Guest Info, 3 = Confirmation, 4 = Done!
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [initialParamProcessed, setInitialParamProcessed] = useState(false);

  // Selector Settings
  const [selectedCategory, setSelectedCategory] = useState<'tour' | 'kilimanjaro' | 'safari' | 'transfer'>('tour');
  const [paymentOption, setPaymentOption] = useState<'arrival' | 'full'>('full');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [onlinePaymentMethod, setOnlinePaymentMethod] = useState<'card' | 'mobile_money' | 'gateway'>('card');
  const [mobileProvider, setMobileProvider] = useState<'mpesa' | 'tigo' | 'airtel' | 'halotel'>('mpesa');
  const [mobilePhone, setMobilePhone] = useState('');
  const [mobileName, setMobileName] = useState('');
  
  // Quantities & Selections
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'TZS'>('USD');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string>('');
  
  // Location States
  const [zonesList] = useState<TransportZone[]>(getTransportZones());
  const [hotelsList] = useState<HotelOption[]>(getHotels());
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [customHotelName, setCustomHotelName] = useState<string>('');
  const [notListedHotel, setNotListedHotel] = useState<boolean>(false);

  // Guest Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    pickupLocation: 'Stone Town Offices',
    message: '',
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Defaults to 2 days out
    selectedExperience: 'Safari Blue Ocean Cruise',
  });

  // Credit Card Sandbox States
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isPrepaying, setIsPrepaying] = useState(false);

  // Status Elements
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState('ZTR-2026-PENDING');
  const [copiedRef, setCopiedRef] = useState(false);
  const [emailSendingStatus, setEmailSendingStatus] = useState<'idle' | 'preparing' | 'connecting' | 'sent'>('idle');

  // Zanzibar Live Clock & Weather
  const [zanzibarTime, setZanzibarTime] = useState('');
  const [zanzibarDate, setZanzibarDate] = useState('');
  const [zanzibarWeather, setZanzibarWeather] = useState({ temp: 28, text: 'Tropical Breeze', icon: '☀️' });

  // Load returning user details
  useEffect(() => {
    const savedInfo = localStorage.getItem('ztr_returning_user_info');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setFormData(prev => ({
          ...prev,
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          nationality: parsed.nationality || '',
          pickupLocation: parsed.pickupLocation || prev.pickupLocation
        }));
      } catch (err) {
        console.warn('Failed to parse returning user information', err);
      }
    }
  }, []);

  // Sync Live Clock & Weather
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const eat = new Date(utc + (3600000 * 3)); // UTC+3
      
      setZanzibarTime(eat.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setZanzibarDate(eat.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };

    updateTime();
    const clockTimer = setInterval(updateTime, 1000);

    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=-6.1659&longitude=39.1918&current_weather=true`);
        if (res.ok) {
          const data = await res.json();
          const temp = Math.round(data.current_weather.temperature);
          setZanzibarWeather({ temp, text: 'Sunny Paradise', icon: '☀️' });
        }
      } catch (err) {
        console.warn('Weather fetch warning:', err);
      }
    };

    fetchWeather();
    return () => clearInterval(clockTimer);
  }, []);

  // Process query parameters (Lock in pre-selected packages)
  useEffect(() => {
    if (queryParams && !initialParamProcessed) {
      if (queryParams.date || queryParams.arrival) {
        const d = queryParams.date || queryParams.arrival;
        setFormData(prev => ({ ...prev, preferredDate: d }));
      }
      if (queryParams.adults) {
        const aCount = Number(queryParams.adults);
        if (!isNaN(aCount) && aCount > 0) {
          setAdultsCount(aCount);
        }
      }
      if (queryParams.children) {
        const cCount = Number(queryParams.children);
        if (!isNaN(cCount) && cCount >= 0) {
          setChildrenCount(cCount);
        }
      }

      const pkgParam = queryParams.package || queryParams.route || '';
      if (pkgParam) {
        const normParam = decodeURIComponent(pkgParam).toLowerCase().replace(/-/g, ' ').trim();

        // Find match in our lists
        let foundCat: 'tour' | 'kilimanjaro' | 'safari' | 'transfer' = 'tour';
        let foundName = '';

        const tMatch = toursList.find(t => t.name.toLowerCase().includes(normParam));
        const kMatch = kilimanjaroList.find(k => k.name.toLowerCase().includes(normParam));
        const sMatch = safarisList.find(s => s.name.toLowerCase().includes(normParam));
        const trMatch = transfersList.find(tr => tr.name.toLowerCase().includes(normParam));

        if (tMatch) { foundCat = 'tour'; foundName = tMatch.name; }
        else if (kMatch) { foundCat = 'kilimanjaro'; foundName = kMatch.name; }
        else if (sMatch) { foundCat = 'safari'; foundName = sMatch.name; }
        else if (trMatch) { foundCat = 'transfer'; foundName = trMatch.name; }
        else {
          // Look up in custom dynamic CMS tours
          try {
            const cmsContent = getSiteContent();
            const cmsMatch = (cmsContent.tours || []).find((t: any) => 
              t.title.toLowerCase().replace(/\s+/g, '-') === pkgParam.toLowerCase() ||
              t.title.toLowerCase().includes(normParam)
            );
            if (cmsMatch) {
              foundCat = (cmsMatch.category === 'safari' || cmsMatch.category === 'kilimanjaro' || cmsMatch.category === 'transfer') 
                ? cmsMatch.category 
                : 'tour';
              foundName = cmsMatch.title;
            }
          } catch (e) {
            console.warn("CMS lookup skipped", e);
          }
        }

        if (foundName) {
          setSelectedCategory(foundCat);
          setFormData(prev => ({ ...prev, selectedExperience: foundName }));
        } else {
          // Fallback custom text
          setFormData(prev => ({ ...prev, selectedExperience: decodeURIComponent(pkgParam).replace(/-/g, ' ') }));
        }
      }
      setInitialParamProcessed(true);
    }
  }, [queryParams, initialParamProcessed]);

  // Track Analytics
  useEffect(() => {
    trackBookingInitiate(selectedCategory, formData.selectedExperience);
  }, [selectedCategory, formData.selectedExperience, trackBookingInitiate]);

  // Adjust defaults when category switches
  useEffect(() => {
    if (queryParams && (queryParams.package || queryParams.route) && !initialParamProcessed) {
      return; 
    }
    const list = selectedCategory === 'tour' ? toursList :
                 selectedCategory === 'kilimanjaro' ? kilimanjaroList :
                 selectedCategory === 'safari' ? safarisList :
                 transfersList;
    setFormData(prev => ({ ...prev, selectedExperience: list[0].name }));
  }, [selectedCategory, queryParams, initialParamProcessed]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // -----------------------------------------------------------------------------------------
  // CORE PRICING CALCULATION ENGINE (Multi-currency USD / EUR / TZS support)
  // -----------------------------------------------------------------------------------------
  const calculatePricing = () => {
    const list = selectedCategory === 'tour' ? toursList :
                 selectedCategory === 'kilimanjaro' ? kilimanjaroList :
                 selectedCategory === 'safari' ? safarisList :
                 transfersList;

    const matched = list.find(x => x.name === formData.selectedExperience);
    const basePriceUSD = matched ? matched.basePrice : 45;

    // Headcount logic
    const adultsCostUSD = basePriceUSD * adultsCount;
    const childrenCostUSD = (basePriceUSD * 0.6) * childrenCount; // Children enjoy a 40% discount
    let totalSubUSD = adultsCostUSD + childrenCostUSD;

    // Seasonality adjustment
    let multiplier = 1.0;
    let seasonLabel = 'Regular Season';
    const selectedDate = formData.preferredDate;
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
              multiplier = s.isDiscount ? (1 - (s.adjustmentPct / 100)) : (1 + (s.adjustmentPct / 100));
              seasonLabel = s.isDiscount ? `Green Season (-${s.adjustmentPct}%)` : `Peak Season (+${s.adjustmentPct}%)`;
              break;
            }
          }
        }
      } catch (e) {
        console.warn("Season calculations fallback", e);
      }
    }

    totalSubUSD = totalSubUSD * multiplier;

    // Transport pickup zones surcharge
    let pickupSurchargeUSD = 0;
    let pickupZoneLabel = '';
    if (!notListedHotel && selectedHotelId) {
      const matchHotel = hotelsList.find(h => h.id === selectedHotelId);
      if (matchHotel) {
        const matchZone = zonesList.find(z => z.id === matchHotel.zoneId);
        if (matchZone) {
          pickupSurchargeUSD = matchZone.price;
          pickupZoneLabel = `${matchHotel.name} (${matchZone.name})`;
        }
      }
    } else if (notListedHotel && customHotelName) {
      const matchZone = zonesList.find(z => z.id === selectedZoneId);
      if (matchZone) {
        pickupSurchargeUSD = matchZone.price;
        pickupZoneLabel = `${customHotelName} (${matchZone.name})`;
      }
    } else if (selectedZoneId) {
      const matchZone = zonesList.find(z => z.id === selectedZoneId);
      if (matchZone) {
        pickupSurchargeUSD = matchZone.price;
        pickupZoneLabel = `${matchZone.name}`;
      }
    }
    totalSubUSD += pickupSurchargeUSD;

    // Promo code voucher deduction
    let discountUSD = 0;
    if (couponApplied && activeCoupon) {
      if (totalSubUSD >= activeCoupon.minBookingAmount) {
        if (activeCoupon.type === 'percentage') {
          discountUSD = totalSubUSD * (activeCoupon.value / 100);
        } else {
          discountUSD = activeCoupon.value;
        }
      }
    }

    // 18% Zanzibar Tourism & VAT tax
    const netBeforeTaxUSD = totalSubUSD - discountUSD;
    const vatAmountUSD = Math.round(netBeforeTaxUSD * 0.18);
    let finalTotalUSD = Math.round(netBeforeTaxUSD + vatAmountUSD);

    // Pay now online prepay discount (10% extra discount to encourage cashless booking)
    let onlinePrepayDiscountUSD = 0;
    if (paymentOption === 'full') {
      onlinePrepayDiscountUSD = Math.round(finalTotalUSD * 0.10);
      finalTotalUSD -= onlinePrepayDiscountUSD;
    }

    // Multi-currency conversion rates
    // 1 USD = 0.92 EUR
    // 1 USD = 2600 TZS
    const rates = {
      USD: 1,
      EUR: 0.92,
      TZS: 2600
    };

    const rate = rates[currency];
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'TSh ';

    const displayTotal = Math.round(finalTotalUSD * rate);
    const displayDiscount = Math.round(discountUSD * rate);
    const displayVat = Math.round(vatAmountUSD * rate);
    const displayPrepayDiscount = Math.round(onlinePrepayDiscountUSD * rate);
    const displaySurcharge = Math.round(pickupSurchargeUSD * rate);
    const displayBase = Math.round(basePriceUSD * rate);

    // Deposit represents 30% of total for bookings
    const depositUSD = Math.round(finalTotalUSD * 0.30);
    const displayDeposit = Math.round(depositUSD * rate);
    const displayRemaining = displayTotal - (paymentOption === 'full' ? displayTotal : displayDeposit);

    return {
      totalUSD: finalTotalUSD,
      calculatedDepositUSD: depositUSD,
      displayTotal,
      displayDeposit,
      displayRemaining,
      currencySymbol: symbol,
      pricePerAdult: displayBase,
      discountAmount: displayDiscount,
      prepayDiscountAmount: displayPrepayDiscount,
      vatAmount: displayVat,
      pickupSurcharge: displaySurcharge,
      pickupZoneLabel,
      seasonLabel,
      multiplier,
      rawBaseUSD: basePriceUSD,
      rawTotalUSD: finalTotalUSD
    };
  };

  const pricing = calculatePricing();

  // Validate coupon promotion codes
  const checkPromoCode = () => {
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Please enter a voucher code name.');
      return;
    }

    const code = couponCode.trim().toUpperCase();
    const activeList = getCoupons();
    const found = activeList.find(c => c.name === code);

    if (found) {
      const expDate = new Date(found.expirationDate);
      if (new Date() > expDate) {
        setCouponError('This voucher code has expired.');
        return;
      }
      if (found.usedCount >= found.maxUses) {
        setCouponError('This coupon capacity limit has been completely reached.');
        return;
      }
      setActiveCoupon(found);
      setCouponApplied(true);
      showToast('Promo discount applied successfully!', 'success');
    } else {
      // Offline fallback values
      if (code === 'WELCOME10' || code === 'SAVE50' || code === 'SWAHILI10') {
        const value = code === 'SAVE50' ? 50 : 10;
        const type = code === 'SAVE50' ? 'absolute' : 'percentage';
        setActiveCoupon({
          id: 'manual-' + code,
          name: code,
          type: type as any,
          value,
          minBookingAmount: 0,
          expirationDate: '2028-12-31',
          maxUses: 99999,
          usedCount: 0
        });
        setCouponApplied(true);
        showToast('Promo discount applied successfully!', 'success');
      } else {
        setCouponError('Invalid voucher code. Try WELCOME10 or SWAHILI10');
      }
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setActiveCoupon(null);
    setCouponCode('');
  };

  const handleApplyExitIntentDiscount = (code: string) => {
    setCouponCode(code);
    setActiveCoupon({
      id: 'exit-intent-gift',
      name: code.toUpperCase(),
      type: 'percentage',
      value: 10,
      minBookingAmount: 0,
      expirationDate: '2028-12-31',
      maxUses: 99999,
      usedCount: 0
    });
    setCouponApplied(true);
    showToast('Promo discount applied successfully!', 'success');
  };

  // -----------------------------------------------------------------------------------------
  // BOOKING TRANSITIONS & SUBMISSIONS
  // -----------------------------------------------------------------------------------------
  const validateStep1 = () => {
    if (!formData.selectedExperience) {
      showToast('Please select an experience to continue.', 'error');
      return;
    }
    if (!formData.preferredDate) {
      showToast('Please select your date of travel.', 'error');
      return;
    }
    setStep(2);
  };

  const validateStep2 = () => {
    if (!formData.name.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Please enter your primary phone or WhatsApp number.', 'error');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      showToast('Please provide a valid email address.', 'error');
      return;
    }
    
    // Save to local storage for returning guest convenience
    localStorage.setItem('ztr_returning_user_info', JSON.stringify({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      nationality: formData.nationality.trim(),
      pickupLocation: notListedHotel ? customHotelName : (selectedHotelId || formData.pickupLocation)
    }));

    setStep(3);
  };

  // Perform Final Secure Booking Commit
  const handleConfirmBooking = async () => {
    // Validate Payment details
    if (onlinePaymentMethod === 'card') {
      if (!cardNo.trim() || cardNo.replace(/\s/g, '').length < 13) {
        showToast('Please enter a valid credit card number.', 'error');
        return;
      }
      if (!cardExpiry.trim() || !cardExpiry.includes('/')) {
        showToast('Please enter a valid expiration date (MM / YY).', 'error');
        return;
      }
      if (!cardCvc.trim() || cardCvc.length < 3) {
        showToast('Please enter a valid CVV security code.', 'error');
        return;
      }
    } else if (onlinePaymentMethod === 'mobile_money') {
      if (!mobilePhone.trim() || mobilePhone.length < 8) {
        showToast('Please enter a valid Mobile Money phone number.', 'error');
        return;
      }
      if (!mobileName.trim()) {
        showToast('Please enter the name registered to the Mobile Money wallet.', 'error');
        return;
      }
    }

    setStatus('loading');
    setIsPrepaying(true);

    setTimeout(async () => {
      // Generate a sleek Booking Reference Code
      const generatedReference = `ZTR-${new Date().toISOString().substring(2,7).replace(/-/g,'').toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
      setReference(generatedReference);

      const categoryLabel = bookingCategories.find(c => c.id === selectedCategory)?.label || 'Swahili Tour';
      const actualGuests = adultsCount + childrenCount;
      const pickupHotel = notListedHotel ? customHotelName : (hotelsList.find(h => h.id === selectedHotelId)?.name || formData.pickupLocation);

      let paymentDetailsLog = '';
      if (onlinePaymentMethod === 'card') {
        paymentDetailsLog = `Paid via Credit/Debit Card (ending in ${cardNo.slice(-4)})`;
      } else if (onlinePaymentMethod === 'mobile_money') {
        const providerName = mobileProvider === 'mpesa' ? 'M-Pesa' : mobileProvider === 'tigo' ? 'Tigo Pesa' : mobileProvider === 'airtel' ? 'Airtel Money' : 'Halopesa';
        paymentDetailsLog = `Paid via Mobile Money (${providerName} wallet: ${mobilePhone})`;
      } else {
        paymentDetailsLog = `Paid via secure Online Gateway (Direct Pay Online Group)`;
      }

      const logMessage = `Redesigned Booking Checkout\nReference: ${generatedReference}\nCurrency: ${currency}\nPayment Plan: Online Prepayment Authorized & Fully Settled\nPayment Channel: ${paymentDetailsLog}\nNotes: ${formData.message.trim()}`;

      try {
        // Insert to Supabase DB table
        const { error } = await supabase.from('bookings').insert([
          {
            full_name: formData.name.trim(),
            email: formData.email.trim() || null,
            whatsapp_number: formData.phone.trim(),
            number_of_guests: actualGuests,
            tour_name: `${categoryLabel}: ${formData.selectedExperience}`,
            preferred_date: formData.preferredDate,
            pickup_location: pickupHotel,
            status: 'confirmed',
            message: logMessage,
          }
        ]);

        if (error) console.warn('Supabase backup trigger:', error.message);

        // Save local backup cache for "My Account" guest portal
        const localBackup = localStorage.getItem('ztr_local_bookings_backup');
        const backupList = localBackup ? JSON.parse(localBackup) : [];
        const newBackupItem = {
          reference: generatedReference,
          id: 'TX-' + generatedReference.substring(4),
          full_name: formData.name.trim(),
          email: formData.email.trim(),
          whatsapp_number: formData.phone.trim(),
          tour_name: `${categoryLabel}: ${formData.selectedExperience}`,
          preferred_date: formData.preferredDate,
          pickup_location: pickupHotel,
          status: 'confirmed',
          message: `${logMessage}\nTotal Price: ${pricing.currencySymbol}${pricing.displayTotal}`,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('ztr_local_bookings_backup', JSON.stringify([newBackupItem, ...backupList]));

        // Sync to lead/CRM pipeline
        syncBookingToCRM({
          reference: generatedReference,
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          whatsappNumber: formData.phone.trim(),
          tourName: `${categoryLabel}: ${formData.selectedExperience}`,
          preferredDate: formData.preferredDate,
          pickupLocation: pickupHotel,
          numberOfGuests: actualGuests,
          totalPrice: pricing.rawTotalUSD,
          depositAmount: pricing.calculatedDepositUSD,
          remainingBalance: pricing.rawTotalUSD - (paymentOption === 'full' ? pricing.rawTotalUSD : pricing.calculatedDepositUSD),
          paymentOption: paymentOption === 'full' ? 'full' : 'deposit',
          paymentStatus: paymentOption === 'full' ? 'fully_paid' : 'partially_paid',
          currency: 'USD'
        });

        // Add Activity Log
        addActivityLog(
          'Online Booking Checkout',
          'Guest',
          `Secured reservations for ${formData.selectedExperience} (${actualGuests} Guests). Reference ID: ${generatedReference}. Plan: ${paymentOption === 'full' ? 'Paid Online' : 'Pay on Arrival'}`,
          'No Active Reservation',
          `Booking: ${generatedReference}`
        );

        // Auto dispatch transactional SMTP email
        triggerAutomatedSMTP(generatedReference, pickupHotel, actualGuests);

      } catch (err) {
        console.error('Data logging warning:', err);
      }

      setIsPrepaying(false);
      setStatus('success');
      setStep(4);
      showToast('Booking successfully confirmed!', 'success');
    }, 1500);
  };

  // Dispatch Transactional SMTP Email
  const triggerAutomatedSMTP = (generatedReference: string, pickupHotel: string, actualGuests: number) => {
    setEmailSendingStatus('preparing');
    try {
      const smtp = getSmtpConfig();
      const payload = {
        tour_name: `${selectedCategory === 'tour' ? 'Excursion' : selectedCategory === 'safari' ? 'Tanzania Safari' : selectedCategory === 'kilimanjaro' ? 'Climbs' : 'Resort Shuttle'}: ${formData.selectedExperience}`,
        preferred_date: formData.preferredDate,
        number_of_guests: actualGuests,
        pickup_location: pickupHotel,
        status: 'Confirmed',
        total_price: `${pricing.currencySymbol}${pricing.displayTotal}`
      };

      const template = generateEmailTemplate('booking_confirm', formData.name.trim(), payload);

      addEmailLog({
        toEmail: formData.email.trim(),
        subject: `Zanzibar Reservation Confirmed: ${formData.selectedExperience} 🌴 (Ref: ${generatedReference})`,
        bodyHtml: template.bodyHtml,
        type: 'booking_confirm',
        status: 'Delivered',
        smtpUsed: `${smtp.host}:${smtp.port} (${smtp.provider})`
      });
      setEmailSendingStatus('sent');
    } catch (err) {
      console.warn('SMTP automatic email trigger failed', err);
      setEmailSendingStatus('idle');
    }
  };

  // -----------------------------------------------------------------------------------------
  // AFTER-BOOKING CUSTOM UTILITIES
  // -----------------------------------------------------------------------------------------
  const downloadVoucher = () => {
    const pickupHotel = notListedHotel ? customHotelName : (hotelsList.find(h => h.id === selectedHotelId)?.name || formData.pickupLocation);
    generateBookingPDF(
      {
        reference,
        full_name: formData.name,
        email: formData.email,
        whatsapp_number: formData.phone,
        tour_name: formData.selectedExperience,
        preferred_date: formData.preferredDate,
        number_of_guests: adultsCount + childrenCount,
        pickup_location: pickupHotel,
        total_price: pricing.displayTotal
      },
      pricing
    );
  };

  const downloadReceipt = () => {
    const pickupHotel = notListedHotel ? customHotelName : (hotelsList.find(h => h.id === selectedHotelId)?.name || formData.pickupLocation);
    generateInvoicePDF(
      {
        reference,
        full_name: formData.name,
        email: formData.email,
        whatsapp_number: formData.phone,
        tour_name: formData.selectedExperience,
        preferred_date: formData.preferredDate,
        number_of_guests: adultsCount + childrenCount,
        pickup_location: pickupHotel,
        total_price: pricing.displayTotal,
        deposit_paid: paymentOption === 'full' ? pricing.displayTotal : pricing.displayDeposit,
        remaining_balance: pricing.displayRemaining
      },
      pricing
    );
  };

  const handleDownloadCalendarInvite = () => {
    const cleanDate = formData.preferredDate.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Zanzibar Trip & Relax//NONSGML Booking Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:Zanzibar Tour: ${formData.selectedExperience}`,
      `UID:booking-${reference}@zanzibartripandrelax.com`,
      'SEQUENCE:0',
      'STATUS:CONFIRMED',
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `DTEND;VALUE=DATE:${cleanDate}`,
      `LOCATION:${formData.pickupLocation || 'Zanzibar Resort'}`,
      `DESCRIPTION:Your upcoming tropical excursion in Zanzibar!\\n\\nBooking Ref: ${reference}\\nLead Guest: ${formData.name}\\nTotal Cost: ${pricing.currencySymbol}${pricing.displayTotal}\\n\\nPrepare for an unforgettable trip!`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Zanzibar-Trip-${reference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerWhatsAppConfirmation = () => {
    trackWhatsAppClick('booking_success_done', reference);
    const message = `Jambo! I just completed a booking on Zanzibar Trip & Relax portal 🌴%0A%0A*Booking Reference:* ${reference}%0A*Tour Selected:* ${formData.selectedExperience}%0A*Lead Guest:* ${formData.name}%0A*Date of Travel:* ${formData.preferredDate}%0A*Travelers:* ${adultsCount + childrenCount} Guest(s)%0A%0AIs my pickup time confirmed? Asante!`;
    window.open(`https://wa.me/255629506063?text=${message}`, '_blank');
  };

  // Recommended related experiences helper
  const getRelatedTours = () => {
    const list = [...toursList, ...safarisList].filter(t => t.name !== formData.selectedExperience);
    return list.slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-800">
      <ExitIntentModal 
        onApplyDiscount={handleApplyExitIntentDiscount}
        isAlreadySubmitted={step === 4 || status === 'success'}
      />

      {/* TOP DESKTOP & MOBILE NAVIGATION HEADER */}
      <div className="bg-[#0A1224] text-white border-b border-white/10 select-none py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('home')} 
            className="flex items-center gap-2 text-slate-300 hover:text-[#D4A017] transition-all cursor-pointer font-bold text-xs"
          >
            <ArrowLeft size={16} />
            <span>Back to Explorer</span>
          </button>
          
          {/* Real-time Clock & Paradise Weather Tracker */}
          <div className="hidden sm:flex items-center gap-4 text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[#D4A017]" />
              <span>Zanzibar (EAT): {zanzibarTime || '09:00 AM'}</span>
            </span>
            <span className="flex items-center gap-1 border-l border-white/10 pl-4">
              <span>{zanzibarWeather.icon} Zanzibar Weather: {zanzibarWeather.temp}°C {zanzibarWeather.text}</span>
            </span>
          </div>

          {/* Currency Display Selector */}
          <div className="flex items-center gap-1.5 bg-[#121B30] border border-white/10 rounded-full p-1 text-xs">
            {(['USD', 'EUR', 'TZS'] as const).map(cur => (
              <button
                key={cur}
                onClick={() => setCurrency(cur)}
                className={`px-3 py-1 rounded-full font-bold transition-all ${
                  currency === cur ? 'bg-[#D4A017] text-[#020C1F] shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOOKING.COM PROGRESS STEPS BAR */}
      {step < 4 && (
        <div className="bg-white border-b shadow-sm py-4 px-4 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 md:gap-4 select-none">
            {[
              { id: 1, title: 'Experience', desc: 'Select adventure details' },
              { id: 2, title: 'Guest Details', desc: 'Who is traveling?' },
              { id: 3, title: 'Payment Plan', desc: 'Review & secure' },
            ].map(s => {
              const isActive = step === s.id;
              const isDone = step > s.id;

              return (
                <div 
                  key={s.id} 
                  onClick={() => s.id < step && setStep(s.id as any)}
                  className={`flex-1 flex items-center gap-2 md:gap-3 transition-all ${s.id < step ? 'cursor-pointer' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                    isActive 
                      ? 'bg-[#0B3B8C] border-[#0B3B8C] text-white shadow shadow-[#0B3B8C]/20' 
                      : isDone 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    {isDone ? <Check size={14} className="stroke-[3]" /> : s.id}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className={`text-xs font-bold leading-tight ${isActive ? 'text-[#0B3B8C]' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.desc}</p>
                  </div>
                  {s.id < 3 && <ChevronRight size={14} className="text-slate-300 ml-auto hidden sm:block" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CORE CHECKOUT FLOW LAYOUT GRID */}
      <div className="max-w-6xl mx-auto px-4 mt-6 md:mt-10">
        <AnimatePresence mode="wait">
          {step === 4 ? (
            /* ================================================================================= */
            /* STEP 4: SUCCESS CONFIRMATION WINDOW (DONE STATE)                                  */
            /* ================================================================================= */
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-lg text-center max-w-3xl mx-auto space-y-8"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 relative">
                  <CheckCircle2 size={36} className="text-emerald-500 animate-bounce" />
                </div>
                <div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase tracking-widest font-mono">
                    Booking Confirmed Successfully
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#0B3B8C] mt-3 font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Congratulations, {formData.name.split(' ')[0]}!
                  </h1>
                  <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
                    Your paradise reservation is officially logged. We have successfully locked in your specialty rates and assigned a private chauffeur.
                  </p>
                </div>
              </div>

              {/* Booking Reference Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-left">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">booking reference number</p>
                  <p className="text-lg font-black text-[#0B3B8C] font-mono tracking-wider mt-0.5">{reference}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(reference);
                      setCopiedRef(true);
                      setTimeout(() => setCopiedRef(false), 2000);
                      showToast('Reference copied to clipboard!', 'info');
                    }}
                    className="flex-1 md:flex-initial bg-white border hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedRef ? <span className="text-emerald-600 font-extrabold">Copied!</span> : (
                      <>
                        <Copy size={14} />
                        <span>Copy Ref</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={triggerWhatsAppConfirmation}
                    className="flex-1 md:flex-initial bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle size={14} fill="white" />
                    <span>WhatsApp desk</span>
                  </button>
                </div>
              </div>

              {/* Booking Ledger Highlights */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-left text-xs bg-slate-50/50">
                <div className="bg-slate-100 px-4 py-3 font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200">
                  Tropical Reservation Summary
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 font-semibold text-slate-600">
                  <div className="space-y-2">
                    <p>🗺️ <span className="text-slate-400 font-medium">Selected Experience:</span> <strong className="text-slate-800">{formData.selectedExperience}</strong></p>
                    <p>📅 <span className="text-slate-400 font-medium">Travel Date:</span> <strong className="text-slate-800">{formData.preferredDate}</strong></p>
                    <p>👥 <span className="text-slate-400 font-medium">Travelers Registered:</span> <strong className="text-slate-800">{adultsCount} Adults {childrenCount > 0 && `, ${childrenCount} Kids`}</strong></p>
                  </div>
                  <div className="space-y-2 md:border-l md:pl-6">
                    <p>📍 <span className="text-slate-400 font-medium">Pickup Location:</span> <strong className="text-slate-800">{notListedHotel ? customHotelName : (hotelsList.find(h => h.id === selectedHotelId)?.name || formData.pickupLocation)}</strong></p>
                    <p>💰 <span className="text-slate-400 font-medium">Total Price:</span> <strong className="text-[#0B3B8C] font-extrabold">{pricing.currencySymbol}{pricing.displayTotal}</strong></p>
                    <p>🏦 <span className="text-slate-400 font-medium">Payment status:</span> <strong className={paymentOption === 'full' ? 'text-emerald-600' : 'text-amber-600'}>
                      {paymentOption === 'full' ? '100% Paid Online' : 'Pay on Boarding'}
                    </strong></p>
                  </div>
                </div>
              </div>

              {/* Voucher Downloads & Tools Section */}
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">instantly download & print travel documents</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={downloadVoucher}
                    className="bg-white border-2 border-[#0B3B8C] text-[#0B3B8C] hover:bg-slate-50 p-4 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 justify-center transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    <Download size={18} />
                    <span>Download Voucher (PDF)</span>
                  </button>
                  <button 
                    onClick={downloadReceipt}
                    className="bg-white border-2 border-[#0B3B8C] text-[#0B3B8C] hover:bg-slate-50 p-4 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 justify-center transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    <Printer size={18} />
                    <span>Download Invoice PDF</span>
                  </button>
                  <button 
                    onClick={handleDownloadCalendarInvite}
                    className="bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 p-4 rounded-2xl font-bold text-xs flex flex-col items-center gap-2 justify-center transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    <Calendar size={18} className="text-[#D4A017]" />
                    <span>Add to Google Calendar</span>
                  </button>
                </div>
              </div>

              {/* Recommended tours to upsell */}
              <div className="border-t pt-8 space-y-4">
                <div className="text-left">
                  <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5 font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <Sparkles size={16} className="text-[#D4A017]" />
                    <span>Complimentary Paradise Recommendations</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">Explore popular excursions and safaris booked by other travelers taking {formData.selectedExperience}.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {getRelatedTours().map(rec => (
                    <div key={rec.name} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left flex flex-col justify-between hover:shadow transition-all">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase bg-[#0B3B8C]/10 text-[#0B3B8C] px-2 py-0.5 rounded-full inline-block">Popular Addon</span>
                        <h4 className="font-bold text-xs text-slate-800 mt-2 truncate">{rec.name}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-1">
                          <Star size={10} fill="currentColor" />
                          <span>4.9 (140 reviews)</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                        <span className="font-extrabold text-slate-700 text-xs">${rec.basePrice}</span>
                        <button 
                          onClick={() => {
                            setSelectedCategory('tour');
                            setFormData(prev => ({ ...prev, selectedExperience: rec.name }));
                            setStep(1);
                          }}
                          className="text-[#0B3B8C] font-extrabold text-[10px] uppercase hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Add to trip</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons to Home */}
              <div className="border-t pt-6 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate('home')}
                  className="bg-[#0B3B8C] text-white hover:bg-opacity-95 font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Home size={14} />
                  <span>Go back to home</span>
                </button>
                <button
                  onClick={() => navigate('my-account')}
                  className="bg-[#D4A017] text-[#020C1F] hover:bg-opacity-90 font-bold px-8 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <User size={14} />
                  <span>Manage my bookings</span>
                </button>
              </div>

            </motion.div>
          ) : (
            /* ================================================================================= */
            /* WIZARD COLUMN GRID SETUP                                                          */
            /* ================================================================================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT SECTION: STEP WIZARD CARD */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                
                {step === 1 && (
                  /* ============================================================================= */
                  /* STEP 1: CHOOSE TOUR AND HEADCOUNT                                             */
                  /* ============================================================================= */
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-[#0B3B8C] font-serif flex items-center gap-1.5" style={{ fontFamily: 'Playfair Display, serif' }}>
                        <Compass size={18} className="text-[#D4A017]" />
                        <span>Step 1: Choose Your Adventure</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Select from our certified excursions, private wildlife safaris or transfer services.</p>
                    </div>

                    {/* Styled Category Selector (Booking.com style icons) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {bookingCategories.map(cat => {
                        const IconComponent = cat.icon;
                        const isChosen = selectedCategory === cat.id;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                              isChosen 
                                ? 'bg-[#0B3B8C]/5 border-[#0B3B8C] text-[#0B3B8C] shadow-sm' 
                                : 'bg-white border-slate-200 hover:border-[#0B3B8C]/40 text-slate-500'
                            }`}
                          >
                            <span className={`p-1.5 rounded-lg inline-block ${isChosen ? 'bg-[#0B3B8C] text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <IconComponent size={14} />
                            </span>
                            <div>
                              <p className="text-[11px] font-bold tracking-tight">{cat.label}</p>
                              <p className="text-[8px] text-slate-400 truncate mt-0.5">{cat.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Specific Program Selector Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Selected Package / Tour Name</label>
                      <select
                        name="selectedExperience"
                        value={formData.selectedExperience}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#0B3B8C] focus:bg-white text-xs font-bold py-3.5 px-4 rounded-xl focus:outline-none transition-all cursor-pointer"
                      >
                        {selectedCategory === 'tour' && toursList.map(t => (
                          <option key={t.name} value={t.name}>{t.name} (Base Price: ${t.basePrice}/adult)</option>
                        ))}
                        {selectedCategory === 'kilimanjaro' && kilimanjaroList.map(k => (
                          <option key={k.name} value={k.name}>{k.name} (Base Price: ${k.basePrice}/climber)</option>
                        ))}
                        {selectedCategory === 'safari' && safarisList.map(s => (
                          <option key={s.name} value={s.name}>{s.name} (Base Price: ${s.basePrice}/adult)</option>
                        ))}
                        {selectedCategory === 'transfer' && transfersList.map(tr => (
                          <option key={tr.name} value={tr.name}>{tr.name} (Base Price: ${tr.basePrice}/way)</option>
                        ))}
                      </select>
                    </div>

                    {/* Travel Date selection using DatePicker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">preferred travel date</label>
                      <DatePicker
                        selectedDate={formData.preferredDate}
                        onChange={(date) => setFormData(prev => ({ ...prev, preferredDate: date }))}
                        minDate={new Date().toISOString().split('T')[0]}
                        placeholder="Select Travel Date"
                      />
                    </div>

                    {/* Tactile Adults & Children Count buttons (Booking.com style counters) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Adults Counter */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-700">Adult Travelers</p>
                          <p className="text-[10px] text-slate-400">Ages 12+ or full climbers</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setAdultsCount(prev => Math.max(1, prev - 1))}
                            disabled={adultsCount <= 1}
                            className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center font-bold text-xs disabled:opacity-50 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-extrabold text-sm w-4 text-center">{adultsCount}</span>
                          <button
                            type="button"
                            onClick={() => setAdultsCount(prev => prev + 1)}
                            className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Kids Counter */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-700">Children Count</p>
                          <p className="text-[10px] text-slate-400">Ages 2-11 (Enjoy 40% Off!)</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setChildrenCount(prev => Math.max(0, prev - 1))}
                            disabled={childrenCount <= 0}
                            className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center font-bold text-xs disabled:opacity-50 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-extrabold text-sm w-4 text-center">{childrenCount}</span>
                          <button
                            type="button"
                            onClick={() => setChildrenCount(prev => prev + 1)}
                            className="w-8 h-8 rounded-full border border-slate-300 bg-white hover:bg-slate-50 flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Step 1 CTA button */}
                    <button
                      type="button"
                      onClick={validateStep1}
                      className="w-full bg-[#0B3B8C] hover:bg-opacity-95 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      <span>Proceed to Guest Details</span>
                      <ArrowRight size={14} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  /* ============================================================================= */
                  /* STEP 2: GUEST DETAILS FORM                                                    */
                  /* ============================================================================= */
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest cursor-pointer" onClick={() => setStep(1)}>
                        <ArrowLeft size={10} />
                        <span>back to choices</span>
                      </div>
                      <h2 className="text-xl font-bold text-[#0B3B8C] font-serif flex items-center gap-1.5 mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        <User size={18} className="text-[#D4A017]" />
                        <span>Step 2: Enter Primary Guest Information</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Provide your primary contact and pickup hotel details. We support secure auto-fill for returning guests.</p>
                    </div>

                    <div className="space-y-4">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">full name *</label>
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#0B3B8C] focus:bg-white text-xs font-bold p-3 rounded-xl focus:outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">nationality / country (recommended)</label>
                          <input
                            type="text"
                            name="nationality"
                            placeholder="e.g. United Kingdom"
                            value={formData.nationality}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#0B3B8C] focus:bg-white text-xs font-bold p-3 rounded-xl focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">email address *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#0B3B8C] focus:bg-white text-xs font-bold p-3 rounded-xl focus:outline-none transition-all font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">primary phone / whatsapp *</label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="e.g. +44 7911 123456"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-[#0B3B8C] focus:bg-white text-xs font-bold p-3 rounded-xl focus:outline-none transition-all font-mono"
                          />
                        </div>
                      </div>

                      {/* Pickup Location & Hotel partners */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">pickup resort / hotel name *</label>
                          <label className="flex items-center gap-1.5 text-xs text-[#0B3B8C] font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notListedHotel}
                              onChange={(e) => setNotListedHotel(e.target.checked)}
                              className="accent-[#0B3B8C] rounded"
                            />
                            <span>My hotel is not listed</span>
                          </label>
                        </div>

                        {!notListedHotel ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-400">Travel Transport Zone</label>
                              <select
                                value={selectedZoneId}
                                onChange={(e) => {
                                  setSelectedZoneId(e.target.value);
                                  setSelectedHotelId('');
                                }}
                                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold p-3 rounded-xl focus:outline-none"
                              >
                                <option value="">-- Choose Transport Zone --</option>
                                {zonesList.map(z => (
                                  <option key={z.id} value={z.id}>{z.name} (+${z.price} pickup)</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-400">Resort Name</label>
                              <select
                                value={selectedHotelId}
                                onChange={(e) => setSelectedHotelId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold p-3 rounded-xl focus:outline-none"
                                disabled={!selectedZoneId}
                              >
                                <option value="">-- Choose Partner Resort --</option>
                                {hotelsList.filter(h => h.zoneId === selectedZoneId).map(h => (
                                  <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-400">Rough Geographical Zone</label>
                              <select
                                value={selectedZoneId}
                                onChange={(e) => setSelectedZoneId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold p-3 rounded-xl focus:outline-none"
                              >
                                <option value="">-- Choose zone for transport rates --</option>
                                {zonesList.map(z => (
                                  <option key={z.id} value={z.id}>{z.name} (+${z.price})</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-400">Custom Hotel/AirBnb Name *</label>
                              <input
                                type="text"
                                placeholder="Enter resort name or villa location"
                                value={customHotelName}
                                onChange={(e) => setCustomHotelName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white text-xs font-bold p-3 rounded-xl focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Special Request */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">special requests / diet / requests (optional)</label>
                        <textarea
                          name="message"
                          rows={3}
                          placeholder="e.g. Vegetarian diet, dietary allergies, double bed configurations, custom boat times..."
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0B3B8C] focus:bg-white text-xs font-bold p-3 rounded-xl focus:outline-none transition-all resize-none"
                        />
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={validateStep2}
                      className="w-full bg-[#0B3B8C] hover:bg-opacity-95 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Secure Payment</span>
                      <ArrowRight size={14} />
                    </button>
                  </motion.div>
                )}

                {step === 3 && (
                  /* ============================================================================= */
                  /* STEP 3: SECURE ONLINE PAYMENT CHANNEL SELECTION                               */
                  /* ============================================================================= */
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest cursor-pointer" onClick={() => setStep(2)}>
                        <ArrowLeft size={10} />
                        <span>back to guest details</span>
                      </div>
                      <h2 className="text-xl font-bold text-[#0B3B8C] font-serif flex items-center gap-1.5 mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                        <CreditCard size={18} className="text-[#D4A017]" />
                        <span>Step 3: Secure Online Payment</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Select your preferred payment channel to instantly confirm your Zanzibar reservation. Under our <strong>Mandatory Online Booking Policy</strong>, all slots are secured instantly on payment.
                      </p>
                    </div>

                    {/* PAYMENT CHANNELS TABS */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setOnlinePaymentMethod('card')}
                        className={`py-3 px-1 text-center rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          onlinePaymentMethod === 'card'
                            ? 'bg-white text-[#0B3B8C] shadow font-bold'
                            : 'text-slate-500 hover:text-slate-800 font-semibold'
                        }`}
                      >
                        <CreditCard size={16} />
                        <span className="text-[10px] md:text-xs">Credit/Debit Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOnlinePaymentMethod('mobile_money')}
                        className={`py-3 px-1 text-center rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          onlinePaymentMethod === 'mobile_money'
                            ? 'bg-white text-[#0B3B8C] shadow font-bold'
                            : 'text-slate-500 hover:text-slate-800 font-semibold'
                        }`}
                      >
                        <Phone size={16} />
                        <span className="text-[10px] md:text-xs">Mobile Money</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOnlinePaymentMethod('gateway')}
                        className={`py-3 px-1 text-center rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          onlinePaymentMethod === 'gateway'
                            ? 'bg-white text-[#0B3B8C] shadow font-bold'
                            : 'text-slate-500 hover:text-slate-800 font-semibold'
                        }`}
                      >
                        <Landmark size={16} />
                        <span className="text-[10px] md:text-xs">Secure Gateway (DPO)</span>
                      </button>
                    </div>

                    {/* CARD DETAILS CONTAINER */}
                    {onlinePaymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 text-left shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase text-[#0B3B8C] flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <span>128-bit secure credit card checkout gateway</span>
                          </p>
                          <div className="flex gap-1">
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">VISA</span>
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">MC</span>
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">AMEX</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-400">Credit Card Number</label>
                            <input
                              type="text"
                              required
                              placeholder="4111 2222 3333 4444"
                              value={cardNo}
                              onChange={(e) => setCardNo(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                              maxLength={19}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0B3B8C] focus:bg-white text-xs font-bold p-3 rounded-xl focus:outline-none transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-400">Expiry Date</label>
                              <input
                                type="text"
                                required
                                placeholder="MM / YY"
                                value={cardExpiry}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, '');
                                  if (val.length > 2) {
                                    val = val.substring(0, 2) + ' / ' + val.substring(2, 4);
                                  }
                                  setCardExpiry(val);
                                }}
                                maxLength={7}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-[#0B3B8C] focus:bg-white text-xs font-bold p-3 rounded-xl focus:outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase font-bold text-slate-400">Security Code (CVV)</label>
                              <input
                                type="password"
                                required
                                placeholder="123"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                                maxLength={3}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-[#0B3B8C] focus:bg-white text-xs font-bold p-3 rounded-xl focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold pt-1 border-t">
                          <Shield size={12} className="text-emerald-500" />
                          <span>Simulation Mode: Enter any testing visa credentials</span>
                        </div>
                      </motion.div>
                    )}

                    {/* MOBILE MONEY DETAILS CONTAINER */}
                    {onlinePaymentMethod === 'mobile_money' && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 text-left shadow-sm"
                      >
                        <p className="text-[10px] font-black uppercase text-[#0B3B8C] flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>East African Mobile Money Integrator (Instant Push-to-Pay)</span>
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'mpesa', label: 'Vodacom M-Pesa', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
                            { id: 'tigo', label: 'Tigo Pesa', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
                            { id: 'airtel', label: 'Airtel Money', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
                            { id: 'halotel', label: 'Halopesa', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
                          ].map(prov => (
                            <button
                              type="button"
                              key={prov.id}
                              onClick={() => setMobileProvider(prov.id as any)}
                              className={`p-3 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                mobileProvider === prov.id
                                  ? 'bg-[#0B3B8C] text-white border-[#0B3B8C]'
                                  : `${prov.color}`
                              }`}
                            >
                              {prov.label}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-400">Registered Name</label>
                            <input
                              type="text"
                              required
                              placeholder="Full Name (e.g. John Doe)"
                              value={mobileName}
                              onChange={(e) => setMobileName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0B3B8C] focus:bg-white text-xs font-bold p-3 rounded-xl focus:outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-slate-400">Mobile Phone Number</label>
                            <div className="flex">
                              <span className="bg-slate-100 border border-r-0 border-slate-200 text-slate-500 font-bold px-3 py-3 rounded-l-xl text-xs flex items-center">
                                +255
                              </span>
                              <input
                                type="text"
                                required
                                placeholder="629 506 063"
                                value={mobilePhone}
                                onChange={(e) => setMobilePhone(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-[#0B3B8C] focus:bg-white text-xs font-bold p-3 rounded-r-xl focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 leading-normal font-medium">
                          <strong>💡 Auto-Push Note:</strong> When you click complete, our partner gateway will automatically push a secure PIN prompt to your mobile device instantly. Enter your PIN to approve the reservation.
                        </div>
                      </motion.div>
                    )}

                    {/* GATEWAY DETAILS CONTAINER */}
                    {onlinePaymentMethod === 'gateway' && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 text-left shadow-sm"
                      >
                        <p className="text-[10px] font-black uppercase text-[#0B3B8C] flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-emerald-600" />
                          <span>Direct Pay Online (DPO Group) Gateway Secure Channel</span>
                        </p>

                        <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                          <div className="bg-slate-200 p-2.5 rounded-lg text-slate-500">
                            <Landmark size={20} />
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-slate-800">DPO Web Checkout Portal</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">The leading payment service provider in East Africa, accepted in Zanzibar, Tanzania, Kenya, and beyond.</p>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-[10px] text-blue-800 leading-normal font-medium">
                          <strong>ℹ️ External Gateway Notice:</strong> Upon confirmation, you will be temporarily redirected to the secure external DPO billing page to settle with cards or multi-wallets, then instantly returned back here for voucher retrieval.
                        </div>
                      </motion.div>
                    )}

                    {/* Secure TALA Policy Compliance Note */}
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-2.5 text-[11px] text-slate-600 leading-normal font-semibold">
                      <Shield size={18} className="text-[#0B3B8C] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-extrabold text-[#0B3B8C]">Verified Ethical Travel Provider</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">Licenced under Tanzania Tourism Registry (TALA No. 98112-ZRT). Rest assured that all payments are secured under ethical consumer compliance codes.</p>
                      </div>
                    </div>

                    {/* Confirm Checkout Button */}
                    <button
                      type="button"
                      disabled={status === 'loading'}
                      onClick={handleConfirmBooking}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/10"
                    >
                      {status === 'loading' ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>
                            {onlinePaymentMethod === 'card' ? 'Authorizing Credit Card Prepayment...' : 
                             onlinePaymentMethod === 'mobile_money' ? 'Awaiting Mobile Money PIN Entry...' : 
                             'Redirecting to secure DPO portal...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Check size={14} className="stroke-[3]" />
                          <span>Pay & Confirm Booking</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

              </div>

              {/* RIGHT SECTION: STICKY BOOKING SUMMARY CARD */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm sticky top-[180px] lg:top-[120px] space-y-4 p-5 md:p-6 text-left">
                
                {/* Tour Banner Preview header */}
                <div className="border-b pb-4">
                  <span className="text-[9px] uppercase font-extrabold px-2.5 py-1 bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/15 rounded-full inline-block font-mono tracking-widest leading-none">
                    live trip summary
                  </span>
                  <h3 className="text-base font-extrabold text-[#0B3B8C] font-serif mt-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {formData.selectedExperience}
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                    <span>Category: {bookingCategories.find(c => c.id === selectedCategory)?.label}</span>
                  </p>
                </div>

                {/* Travel Details highlights */}
                <div className="space-y-2.5 text-xs font-semibold text-slate-600 border-b pb-4">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border">
                    <span className="text-slate-400">📅 Travel Date:</span>
                    <strong className="text-slate-800">{formData.preferredDate || 'Not specified'}</strong>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border">
                    <span className="text-slate-400">👥 Travelers:</span>
                    <strong className="text-slate-800">{adultsCount} Adults {childrenCount > 0 && `, ${childrenCount} Kids`}</strong>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border">
                    <span className="text-slate-400">📍 Pick Point:</span>
                    <strong className="text-slate-800 max-w-[150px] truncate" title={notListedHotel ? customHotelName : (hotelsList.find(h => h.id === selectedHotelId)?.name || formData.pickupLocation)}>
                      {notListedHotel ? customHotelName : (hotelsList.find(h => h.id === selectedHotelId)?.name || formData.pickupLocation || 'Select in Step 2')}
                    </strong>
                  </div>
                </div>

                {/* Promo Coupon Module */}
                <div className="space-y-1.5 border-b pb-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Promotion / Coupon Code</label>
                    {couponApplied && (
                      <button onClick={removeCoupon} className="text-red-500 text-[10px] font-bold hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                  
                  {!couponApplied ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. WELCOME10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:bg-white uppercase"
                      />
                      <button
                        type="button"
                        onClick={checkPromoCode}
                        className="bg-[#0B3B8C] hover:bg-opacity-95 text-white font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-800 flex items-center justify-between text-xs">
                      <span className="font-extrabold flex items-center gap-1">
                        <Check size={14} className="stroke-[3]" />
                        <span>Voucher `{activeCoupon?.name}` Active</span>
                      </span>
                      <span className="font-bold">
                        {activeCoupon?.type === 'percentage' ? `-${activeCoupon.value}%` : `-$${activeCoupon?.value}`}
                      </span>
                    </div>
                  )}
                  {couponError && <p className="text-red-500 text-[10px] font-bold">{couponError}</p>}
                </div>

                {/* Transparent Financial breakdown board */}
                <div className="space-y-2 text-xs font-semibold">
                  
                  <div className="flex justify-between text-slate-500">
                    <span>Base Price per adult:</span>
                    <span>{pricing.currencySymbol}{pricing.pricePerAdult}</span>
                  </div>

                  {pricing.pickupSurcharge > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Regional pickup surcharge:</span>
                      <span>+{pricing.currencySymbol}{pricing.pickupSurcharge}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-500">
                    <span>Zanzibar Season Adjustment:</span>
                    <span className="text-emerald-600 font-bold">{pricing.seasonLabel}</span>
                  </div>

                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Voucher Code discount:</span>
                      <span>-{pricing.currencySymbol}{pricing.discountAmount}</span>
                    </div>
                  )}

                  {pricing.prepayDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>10% Prepayment Reward:</span>
                      <span>-{pricing.currencySymbol}{pricing.prepayDiscountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-500">
                    <span>Tanzanian VAT & levies (18%):</span>
                    <span>+{pricing.currencySymbol}{pricing.vatAmount}</span>
                  </div>

                  {/* Grand total price banner */}
                  <div className="flex justify-between items-end border-t pt-3 mt-3 text-slate-800">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">aggregate total</p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">(Taxes & transfers included)</p>
                    </div>
                    <span className="text-2xl font-black text-[#0B3B8C] font-mono leading-none">
                      {pricing.currencySymbol}{pricing.displayTotal}
                    </span>
                  </div>

                  {/* Prepayment Deposit vs Remaining Balance breakdown */}
                  {paymentOption === 'arrival' && (
                    <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 mt-2">
                      <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                        <span>Optional advanced deposit (30%):</span>
                        <span className="text-slate-800">{pricing.currencySymbol}{pricing.displayDeposit}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 font-bold border-t border-slate-200/50 pt-1.5">
                        <span>Remaining Balance on pickup:</span>
                        <span className="text-[#0B3B8C] font-extrabold">{pricing.currencySymbol}{pricing.displayRemaining}</span>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
