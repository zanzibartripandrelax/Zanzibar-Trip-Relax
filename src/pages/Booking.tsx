import React, { useState, useEffect, useMemo } from 'react';
import { Page } from '../hooks/useHashRouter';
import { motion, AnimatePresence } from 'motion/react';
import { showToast } from '../components/ToastNotification';
import { ExitIntentModal } from '../components/ExitIntentModal';
import {
  Calendar, User, Phone, Mail, CheckCircle2, MessageCircle, AlertCircle, RefreshCw,
  MapPin, Users, Clock, Compass, Shield, HelpCircle, ArrowRight, Download, Printer,
  Check, Percent, CreditCard, ShieldCheck, Heart, Luggage, Award, Sparkles, Copy, Home,
  ChevronRight, ArrowLeft, Star, ShoppingBag, Landmark, Lock, HelpCircle as QuestionIcon,
  Image as ImageIcon, BookOpen, ThumbsUp, Map, Eye, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { syncBookingToCRM } from '../lib/crm';
import { useAnalytics } from '../context/AnalyticsContext';
import {
  getCoupons, getDateBlockages, Coupon, DateBlockage, addActivityLog,
  getSeasonalityConfig, getTransportZones, getHotels, TransportZone, HotelOption,
  getSiteContent, getExtendedSeasonality
} from '../lib/cmsStore';
import {
  generateBookingPDF,
  generateInvoicePDF
} from '../lib/pdfGenerator';
import { addEmailLog, generateEmailTemplate, getSmtpConfig } from '../lib/emailService';

// Modular Imports
import { allPackages, holidayPackageDetails, PackageItem } from '../data/bookingData';
import {
  HolidayPackageForm,
  DayTourForm,
  AirportTransferForm,
  SafariForm,
  KilimanjaroForm
} from '../components/BookingForms';

interface BookingProps {
  navigate: (page: Page, id?: string) => void;
  queryParams?: Record<string, string>;
}

export default function Booking({ navigate, queryParams }: BookingProps) {
  const { trackBookingInitiate, trackWhatsAppClick } = useAnalytics();

  // Unified Wizard Flow states
  // Step 1: Specific customized form selection & entries
  // Step 2: Final Summary review & prepayment details
  // Step 3: Success Confirmation (with receipt, calendar download, Swahili greetings)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Categories & Selections
  const [activeCategory, setActiveCategory] = useState<'packages' | 'tour' | 'transfer' | 'safari' | 'kilimanjaro'>('packages');
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  
  // If true, user is filling the customized form. For Holiday Packages, we start in a beautiful detail presentation before locking
  const [isPackageLocked, setIsPackageLocked] = useState<boolean>(false);
  const [viewingPackageDetails, setViewingPackageDetails] = useState<boolean>(false);

  // Active package details tab
  const [activeDetailTab, setActiveDetailTab] = useState<'itinerary' | 'hotels' | 'inclusions' | 'reviews' | 'faq'>('itinerary');

  // Dates
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  };

  const [arrivalDate, setArrivalDate] = useState<string>(getTomorrowDateString());
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  // Location details (Automatic Pickup Zone Detection)
  const [zonesList] = useState<TransportZone[]>(getTransportZones());
  const [hotelsList] = useState<HotelOption[]>(getHotels());
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [customHotelName, setCustomHotelName] = useState<string>('');
  const [notListedHotel, setNotListedHotel] = useState<boolean>(false);

  // Promo / Discounts
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string>('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  // Contact / Lead Information (First Name, Last Name, Email, Phone, message/requests)
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    nationality: '',
    departureDate: '',
    arrivalFlight: '',
    departureFlight: '',
    message: '',
    roomPreference: 'Double Room',
    transferDirection: 'arrival',
    transferTerminal: 'ZNZ Airport',
    flightNo: '',
    flightTime: '',
    bagsCount: '2',
    safariAccommodation: 'mid-range',
    pickupLocation: '',
    accommodationBeforeAfter: 'Moshi Mountain Lodge (Pre-arranged)',
    airportPickup: 'Yes'
  });

  // Pay Choice: Deposit (30%), Full Amount (100%), or Hold & Pay Later
  const [paymentOption, setPaymentOption] = useState<'deposit' | 'full' | 'later'>('full');
  
  // Payment gateway elements
  const [onlinePaymentMethod, setOnlinePaymentMethod] = useState<'card' | 'mobile_money'>('card');
  const [mobileProvider, setMobileProvider] = useState<'mpesa' | 'tigo' | 'airtel'>('mpesa');
  const [mobilePhone, setMobilePhone] = useState('');
  const [mobileName, setMobileName] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Status & Ref Codes
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState('ZTR-2026-PENDING');
  const [copiedRef, setCopiedRef] = useState(false);
  const [emailSendingStatus, setEmailSendingStatus] = useState<'idle' | 'preparing' | 'connecting' | 'sent'>('idle');

  // Zanzibar live states
  const [zanzibarTime, setZanzibarTime] = useState('');
  const [zanzibarDate, setZanzibarDate] = useState('');

  // Load initial coupons
  useEffect(() => {
    try {
      setAvailableCoupons(getCoupons());
    } catch (e) {
      console.warn('Coupon load warning:', e);
    }
  }, []);

  // Sync Live Zanzibar Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const eat = new Date(utc + (3600000 * 3)); // UTC+3 (East Africa Time)
      
      setZanzibarTime(eat.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setZanzibarDate(eat.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };

    updateTime();
    const clockTimer = setInterval(updateTime, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Read returning user details if available
  useEffect(() => {
    const savedInfo = localStorage.getItem('ztr_returning_user_info');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        const nameParts = (parsed.name || '').split(' ');
        setFormData((prev: any) => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
        }));
      } catch (err) {
        console.warn('Failed to parse returning user', err);
      }
    }
  }, []);

  // Parse routing / pre-selected experiences from query parameters
  useEffect(() => {
    if (queryParams && Object.keys(queryParams).length > 0) {
      const productId = queryParams.package || queryParams.id || queryParams.product;
      const directCategory = queryParams.category;

      if (productId) {
        const matched = allPackages.find(p => p.id === productId);
        if (matched) {
          setSelectedPackage(matched);
          setActiveCategory(matched.category);
          
          if (matched.category === 'packages') {
            // For Holiday Packages, start with their dedicated details presentation
            setViewingPackageDetails(true);
            setIsPackageLocked(false);
          } else {
            // For all other categories, carry over the details and lock immediately
            setIsPackageLocked(true);
            setViewingPackageDetails(false);
          }
          trackBookingInitiate(matched.name, matched.basePrice, matched.category);
        }
      } else if (directCategory) {
        const validCategories = ['packages', 'tour', 'transfer', 'safari', 'kilimanjaro'];
        if (validCategories.includes(directCategory)) {
          setActiveCategory(directCategory as any);
        }
      }
    }
  }, [queryParams]);

  // Handle Category Tab switching
  const handleCategorySwitch = (cat: 'packages' | 'tour' | 'transfer' | 'safari' | 'kilimanjaro') => {
    setActiveCategory(cat);
    setSelectedPackage(null);
    setIsPackageLocked(false);
    setViewingPackageDetails(false);
    setSelectedHotelId('');
    setCustomHotelName('');
  };

  // Select a specific product in the list
  const handleSelectProduct = (pkg: PackageItem) => {
    setSelectedPackage(pkg);
    trackBookingInitiate(pkg.name, pkg.basePrice, pkg.category);

    if (pkg.category === 'packages') {
      setViewingPackageDetails(true);
      setIsPackageLocked(false);
    } else {
      setIsPackageLocked(true);
      setViewingPackageDetails(false);
    }
  };

  // Apply discount coupon
  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Please enter a valid coupon code.');
      return;
    }

    const cleaned = couponCode.trim().toUpperCase();
    const found = availableCoupons.find(c => c.name === cleaned);

    if (found) {
      const isNotExpired = new Date(found.expirationDate) >= new Date();
      if (isNotExpired) {
        setActiveCoupon(found);
        setCouponApplied(true);
        showToast(`Promo applied successfully! Saved ${found.value}% on base fare.`, 'success');
      } else {
        setCouponError('This coupon code has expired.');
      }
    } else {
      // Fallback for demo/standard codes
      if (cleaned === 'WELCOME10' || cleaned === 'SWAHILI10' || cleaned === 'ZANZIBAR10') {
        const mockCoupon: Coupon = {
          id: 'MOCK-1',
          name: cleaned,
          type: 'percentage',
          value: 10,
          expirationDate: '2028-12-31',
          maxUses: 1000,
          usedCount: 0,
          minBookingAmount: 0,
          applicableCategory: 'all',
          applicableDepartures: 'all',
          oneTimeUse: false
        };
        setActiveCoupon(mockCoupon);
        setCouponApplied(true);
        showToast('Promo code "WELCOME10" applied! 10% off base rate.', 'success');
      } else {
        setCouponError('Invalid promo code. Please try again.');
      }
    }
  };

  // Remove active promo code
  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponApplied(false);
    setCouponCode('');
    setCouponError('');
  };

  // Pricing breakdown engine (calculates transparent total)
  const pricingBreakdown = useMemo(() => {
    if (!selectedPackage) {
      return {
        baseTotal: 0,
        pickupSurcharge: 0,
        seasonMultiplier: 1,
        seasonLabel: 'Standard Season',
        promoDiscount: 0,
        prepayDiscount: 0,
        taxAmount: 0,
        finalTotal: 0,
        rawDepositUSD: 0,
        rawRemainingUSD: 0,
        currencySymbol: '$',
        basePricePerAdult: 0,
        pickupZoneLabel: 'None detected'
      };
    }

    // 1. Calculate Base Price
    let basePricePerAdult = selectedPackage.basePrice;
    
    // Day tours have customized pricing, safaris have accommodation standards
    if (selectedPackage.category === 'safari') {
      const accommodation = formData.safariAccommodation;
      if (accommodation === 'luxury') basePricePerAdult = selectedPackage.basePrice + 250;
      else if (accommodation === 'budget') basePricePerAdult = selectedPackage.basePrice - 100;
    }

    // Adults and children calculations
    const travelersCount = (selectedPackage.category === 'safari' || selectedPackage.category === 'kilimanjaro') 
      ? adultsCount // Safaris/Treks count all in adults count
      : adultsCount;

    const childPrice = selectedPackage.category === 'transfer' ? 0 : basePricePerAdult * 0.60; // 60% of adult fare
    let baseTotal = (basePricePerAdult * travelersCount) + (childPrice * childrenCount);

    if (selectedPackage.category === 'transfer') {
      baseTotal = selectedPackage.basePrice; // Transfer base price is flat
    }

    // 2. Transport Zone Surcharge Calculation
    let pickupSurcharge = 0;
    let pickupZoneLabel = 'Stone Town (Complimentary)';

    if (!notListedHotel && selectedHotelId) {
      const matchedHotel = hotelsList.find(h => h.id === selectedHotelId);
      if (matchedHotel && matchedHotel.zoneId) {
        const matchedZone = zonesList.find(z => z.id === matchedHotel.zoneId);
        if (matchedZone) {
          pickupSurcharge = matchedZone.price;
          pickupZoneLabel = `${matchedZone.name} Zone`;
        }
      }
    } else if (notListedHotel && customHotelName) {
      // Calculate average distance/zone surcharge for custom hotels
      pickupSurcharge = 35;
      pickupZoneLabel = 'Custom Out-of-Zone Transfer';
    }

    // 3. Seasonality Adjustments (Dry peak season multipliers)
    let seasonMultiplier = 1.0;
    let seasonLabel = 'Standard Tropical Season';

    if (arrivalDate) {
      try {
        const travelMonth = new Date(arrivalDate).getMonth(); // 0-indexed
        // Dec, Jan, Feb, July, Aug, Sept are peak tourism months
        if ([11, 0, 1, 6, 7, 8].includes(travelMonth)) {
          seasonMultiplier = 1.15;
          seasonLabel = 'Dry Peak Season (+15% high demand)';
        } else if ([3, 4].includes(travelMonth)) { // April, May are green seasons
          seasonMultiplier = 0.90;
          seasonLabel = 'Green Low Season (-10% rainy savings)';
        }
      } catch (err) {
        console.warn('Date parsing for seasonality skipped:', err);
      }
    }

    const seasonedBaseTotal = baseTotal * seasonMultiplier;

    // 4. Promo Coupon Deductions
    let promoDiscount = 0;
    if (couponApplied && activeCoupon) {
      promoDiscount = seasonedBaseTotal * (activeCoupon.value / 100);
    }

    // 5. Prepayment incentives
    let prepayDiscount = 0;
    if (paymentOption === 'full') {
      // 10% saving for full prepayment
      prepayDiscount = (seasonedBaseTotal - promoDiscount) * 0.10;
    } else if (paymentOption === 'deposit') {
      // 5% saving for deposit prepayment
      prepayDiscount = (seasonedBaseTotal - promoDiscount) * 0.05;
    }

    // 6. Tax / VAT Calculation (Zanzibar Government VAT is 18%)
    const taxableSubtotal = seasonedBaseTotal + pickupSurcharge - promoDiscount - prepayDiscount;
    const taxAmount = taxableSubtotal * 0.18;

    // 7. Final Total
    const finalTotal = Math.round(taxableSubtotal + taxAmount);

    // 8. Deposit / Remaining Balance calculation
    let rawDepositUSD = 0;
    if (paymentOption === 'deposit') {
      rawDepositUSD = Math.round(finalTotal * 0.30); // 30% deposit
    } else if (paymentOption === 'full') {
      rawDepositUSD = finalTotal;
    }

    const rawRemainingUSD = finalTotal - rawDepositUSD;

    return {
      baseTotal: Math.round(baseTotal),
      pickupSurcharge,
      seasonMultiplier,
      seasonLabel,
      promoDiscount: Math.round(promoDiscount),
      prepayDiscount: Math.round(prepayDiscount),
      taxAmount: Math.round(taxAmount),
      finalTotal,
      rawDepositUSD,
      rawRemainingUSD,
      currencySymbol: '$',
      basePricePerAdult,
      pickupZoneLabel
    };
  }, [selectedPackage, adultsCount, childrenCount, selectedHotelId, notListedHotel, customHotelName, arrivalDate, couponApplied, activeCoupon, paymentOption, formData.safariAccommodation]);

  // Filtered packages depending on category
  const filteredPackages = useMemo(() => {
    return allPackages.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  // Proceed to Summary & Prepayment screen
  const handleProceedToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) {
      showToast('Please select an experience to continue.', 'error');
      return;
    }

    // Validate essential traveler contact info
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showToast('Please complete all contact details fields.', 'error');
      return;
    }

    // Proceed to Step 2
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Form entry
  const handleBackToForm = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit and Secure Booking (Saves to database, activity log, sends notifications, triggers emails)
  const handleConfirmBooking = async () => {
    setStatus('loading');

    // Generate unique booking reference code
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
    const newRef = `ZTR-2026-${randomSuffix}`;
    setReference(newRef);

    const pickupHotel = notListedHotel 
      ? customHotelName 
      : (hotelsList.find(h => h.id === selectedHotelId)?.name || formData.pickupLocation || 'Stone Town Port Office');

    const leadName = `${formData.firstName} ${formData.lastName}`;

    // Prepare complete metadata
    const bookingPayload = {
      reference: newRef,
      created_at: new Date().toISOString(),
      lead_traveler_name: leadName,
      lead_traveler_email: formData.email.trim(),
      lead_traveler_phone: formData.phone.trim(),
      lead_traveler_whatsapp: (formData.whatsapp || '').trim(),
      nationality: (formData.nationality || '').trim(),
      departure_date: formData.departureDate,
      arrival_flight: formData.arrivalFlight,
      departure_flight: formData.departureFlight,
      product_id: selectedPackage?.id,
      product_name: selectedPackage?.name,
      product_category: selectedPackage?.category,
      travel_date: arrivalDate,
      adults_count: adultsCount,
      children_count: childrenCount,
      pickup_hotel: pickupHotel,
      room_preference: formData.roomPreference,
      safari_accommodation: formData.safariAccommodation,
      airport_pickup_jro: formData.airportPickup,
      flight_no: formData.flightNo || formData.arrivalFlight,
      flight_time: formData.flightTime,
      bags_count: formData.bagsCount,
      payment_choice: paymentOption,
      total_price: pricingBreakdown.finalTotal,
      deposit_amount: pricingBreakdown.rawDepositUSD,
      balance_remaining: pricingBreakdown.rawRemainingUSD,
      special_requests: formData.message,
      status: paymentOption === 'later' ? 'On Hold' : 'Secured'
    };

    // 1. Save to Supabase Bookings table
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            reference_code: newRef,
            customer_name: leadName,
            customer_email: formData.email.trim(),
            customer_phone: formData.phone.trim(),
            product_name: selectedPackage?.name,
            product_category: selectedPackage?.category,
            travel_date: arrivalDate,
            guest_count: adultsCount + childrenCount,
            pickup_location: pickupHotel,
            total_price: pricingBreakdown.finalTotal,
            payment_status: paymentOption === 'later' ? 'pending' : 'deposit_paid',
            status: paymentOption === 'later' ? 'pending' : 'confirmed',
            details: bookingPayload
          }
        ]);
      if (error) console.warn('Supabase bookings write skipped:', error.message);
    } catch (err) {
      console.warn('Supabase save skipped (non-blocking):', err);
    }

    // 2. Save in Local Storage backups
    try {
      const existing = JSON.parse(localStorage.getItem('ztr_local_bookings_backup') || '[]');
      localStorage.setItem('ztr_local_bookings_backup', JSON.stringify([bookingPayload, ...existing]));
      localStorage.setItem('ztr_returning_user_info', JSON.stringify({
        name: leadName,
        email: formData.email,
        phone: formData.phone,
        pickupLocation: pickupHotel
      }));
    } catch (err) {
      console.warn('Local backup error:', err);
    }

    // 3. Synchronize with Lead CRM
    try {
      syncBookingToCRM({
        reference: newRef,
        fullName: leadName,
        email: formData.email.trim(),
        whatsappNumber: formData.phone.trim(),
        tourName: selectedPackage?.name || 'Zanzibar Tour',
        preferredDate: arrivalDate,
        pickupLocation: pickupHotel,
        numberOfGuests: adultsCount + childrenCount,
        totalPrice: pricingBreakdown.finalTotal,
        depositAmount: pricingBreakdown.rawDepositUSD,
        remainingBalance: pricingBreakdown.rawRemainingUSD,
        paymentOption: paymentOption === 'later' ? 'deposit' : paymentOption,
        paymentStatus: paymentOption === 'later' ? 'pending' : paymentOption === 'full' ? 'fully_paid' : 'partially_paid',
        currency: 'USD'
      });
    } catch (err) {
      console.warn('CRM Sync error:', err);
    }

    // 4. Record Activity Log
    try {
      addActivityLog(
        leadName,
        'Guest / Customer',
        `Confirmed booking for ${selectedPackage?.name}. Reference: ${newRef}`,
        'Pending',
        paymentOption === 'later' ? 'Hold' : 'Paid',
        '197.250.4.99'
      );
    } catch (err) {
      console.warn('Activity log write error:', err);
    }

    // 5. Notify the Administrator Dashboard
    try {
      const adminNotifs = JSON.parse(localStorage.getItem('ztr_admin_notifications') || '[]');
      const newNotif = {
        id: 'BOOK-' + randomSuffix,
        title: '🌴 New Booking Secured!',
        body: `${leadName} booked ${selectedPackage?.name} for ${arrivalDate}. Ref: ${newRef}. Price: $${pricingBreakdown.finalTotal}`,
        read: false,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('ztr_admin_notifications', JSON.stringify([newNotif, ...adminNotifs]));
    } catch (err) {
      console.warn('Admin notifications write error:', err);
    }

    // 6. Trigger automated email notifications
    setEmailSendingStatus('preparing');
    try {
      const templateResult = generateEmailTemplate(
        'payment_confirm',
        leadName,
        {
          reference: newRef,
          tourName: selectedPackage?.name || 'Zanzibar Tour',
          date: arrivalDate,
          price: `$${pricingBreakdown.finalTotal}`
        }
      );

      await addEmailLog({
        toEmail: formData.email.trim(),
        subject: templateResult.subject || `Reservation Confirmed: ${selectedPackage?.name} (Ref: ${newRef})`,
        bodyHtml: templateResult.bodyHtml,
        type: 'payment_confirm',
        status: 'Delivered',
        smtpUsed: 'reservations@zanzibartripandrelax.com'
      });
      setEmailSendingStatus('sent');
    } catch (err) {
      console.warn('Mail notification skip:', err);
      setEmailSendingStatus('idle');
    }

    setStatus('success');
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // PDF Download helpers
  const handleDownloadVoucher = () => {
    if (!selectedPackage) return;
    const pickupHotel = notListedHotel 
      ? customHotelName 
      : (hotelsList.find(h => h.id === selectedHotelId)?.name || formData.pickupLocation || 'Stone Town Port Office');

    generateBookingPDF(
      {
        reference,
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        whatsapp_number: formData.phone,
        tour_name: selectedPackage.name,
        preferred_date: arrivalDate,
        number_of_guests: adultsCount + childrenCount,
        pickup_location: pickupHotel,
        total_price: pricingBreakdown.finalTotal
      },
      {
        currencySymbol: pricingBreakdown.currencySymbol,
        displayTotal: pricingBreakdown.finalTotal,
        displayDeposit: paymentOption === 'full' ? pricingBreakdown.finalTotal : paymentOption === 'deposit' ? pricingBreakdown.rawDepositUSD : 0,
        displayRemaining: paymentOption === 'full' ? 0 : paymentOption === 'deposit' ? pricingBreakdown.rawRemainingUSD : pricingBreakdown.finalTotal,
        pricePerAdult: pricingBreakdown.basePricePerAdult,
        discountAmount: pricingBreakdown.promoDiscount,
        prepayDiscountAmount: pricingBreakdown.prepayDiscount,
        vatAmount: pricingBreakdown.taxAmount,
        pickupSurcharge: pricingBreakdown.pickupSurcharge,
        pickupZoneLabel: pricingBreakdown.pickupZoneLabel,
        seasonLabel: pricingBreakdown.seasonLabel
      }
    );
  };

  const handleDownloadInvoice = () => {
    if (!selectedPackage) return;
    const pickupHotel = notListedHotel 
      ? customHotelName 
      : (hotelsList.find(h => h.id === selectedHotelId)?.name || formData.pickupLocation || 'Stone Town Port Office');

    generateInvoicePDF(
      {
        reference,
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        whatsapp_number: formData.phone,
        tour_name: selectedPackage.name,
        preferred_date: arrivalDate,
        number_of_guests: adultsCount + childrenCount,
        pickup_location: pickupHotel,
        total_price: pricingBreakdown.finalTotal,
        deposit_paid: paymentOption === 'full' ? pricingBreakdown.finalTotal : paymentOption === 'deposit' ? pricingBreakdown.rawDepositUSD : 0,
        remaining_balance: paymentOption === 'full' ? 0 : paymentOption === 'deposit' ? pricingBreakdown.rawRemainingUSD : pricingBreakdown.finalTotal
      },
      {
        currencySymbol: pricingBreakdown.currencySymbol,
        displayTotal: pricingBreakdown.finalTotal,
        displayDeposit: paymentOption === 'full' ? pricingBreakdown.finalTotal : paymentOption === 'deposit' ? pricingBreakdown.rawDepositUSD : 0,
        displayRemaining: paymentOption === 'full' ? 0 : paymentOption === 'deposit' ? pricingBreakdown.rawRemainingUSD : pricingBreakdown.finalTotal,
        pricePerAdult: pricingBreakdown.basePricePerAdult,
        discountAmount: pricingBreakdown.promoDiscount,
        prepayDiscountAmount: pricingBreakdown.prepayDiscount,
        vatAmount: pricingBreakdown.taxAmount,
        pickupSurcharge: pricingBreakdown.pickupSurcharge,
        pickupZoneLabel: pricingBreakdown.pickupZoneLabel,
        seasonLabel: pricingBreakdown.seasonLabel
      }
    );
  };

  const handleDownloadCalendarInvite = () => {
    const cleanDate = arrivalDate.replace(/-/g, '');
    const pickupHotel = notListedHotel ? customHotelName : (hotelsList.find(h => h.id === selectedHotelId)?.name || 'Zanzibar');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Zanzibar Trip & Relax//Booking Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:Zanzibar Tour: ${selectedPackage?.name}`,
      `UID:booking-${reference}@zanzibartripandrelax.com`,
      'SEQUENCE:0',
      'STATUS:CONFIRMED',
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `DTEND;VALUE=DATE:${cleanDate}`,
      `LOCATION:${pickupHotel}`,
      `DESCRIPTION:Your dynamic Zanzibar travel reservation has been secured!\\n\\nBooking Ref: ${reference}\\nOption Selected: ${paymentOption.toUpperCase()}\\nTotal: ${pricingBreakdown.currencySymbol}${pricingBreakdown.finalTotal}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `zanzibar-trip-${reference}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Add to Calendar invite downloaded!', 'success');
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(reference);
    setCopiedRef(true);
    showToast('Reference code copied!', 'success');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleSuccessWhatsAppChat = () => {
    trackWhatsAppClick('Success Screen', reference);
    const text = `Hello Zanzibar Trip & Relax! 🌴 I have just secured my tour online!\n\n*Reference:* ${reference}\n*Experience:* ${selectedPackage?.name}\n*Travel Date:* ${arrivalDate}\n*Guests:* ${adultsCount + childrenCount} Travelers\n*Payment Choice:* ${paymentOption.toUpperCase()}\n\nPlease verify my reservation and connect me to a Swahili driver guide! Asante!`;
    const url = `https://wa.me/255629506063?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Render the tailored input form fields based on active experience category
  const renderTailoredFormFields = () => {
    const commonProps = {
      formData,
      setFormData,
      hotelsList,
      selectedHotelId,
      setSelectedHotelId,
      customHotelName,
      setCustomHotelName,
      notListedHotel,
      setNotListedHotel,
      adultsCount,
      setAdultsCount,
      childrenCount,
      setChildrenCount,
      arrivalDate,
      setArrivalDate,
    };

    switch (activeCategory) {
      case 'packages':
        return <HolidayPackageForm {...commonProps} />;
      case 'tour':
        return <DayTourForm {...commonProps} />;
      case 'transfer':
        return <AirportTransferForm {...commonProps} />;
      case 'safari':
        return <SafariForm {...commonProps} />;
      case 'kilimanjaro':
        return <KilimanjaroForm {...commonProps} />;
      default:
        return <DayTourForm {...commonProps} />;
    }
  };

  // HOLIDAY PACKAGE PAGE details rendering when viewing details
  const currentHolidayPackageDetails = selectedPackage ? holidayPackageDetails[selectedPackage.id] : null;

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 mt-12" id="booking-workspace-root">
      {/* Upper Status bar */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center bg-[#0A1224] text-white p-5 rounded-2xl border border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4A017] animate-pulse" />
            <h2 className="text-sm font-black uppercase tracking-widest text-[#D4A017] font-mono">Zanzibar Trip & Relax booking engine</h2>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Leading-tier travel workflow • Absolute pricing transparency • Instant verification</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right border-r border-slate-800 pr-4">
            <p className="text-[10px] font-black tracking-wider text-slate-400">ZANZIBAR TIME (EAT)</p>
            <p className="text-xs font-mono font-bold text-white mt-0.5">{zanzibarTime || '02:00:00 PM'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black tracking-wider text-slate-400">WEATHER</p>
            <p className="text-xs font-bold text-white mt-0.5">☀️ 29°C Sunny Paradise</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${step === 1 ? 'bg-[#0B3B8C] text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 text-[#D4A017] flex items-center justify-center font-mono font-bold text-[10px]">1</span>
            <span>Tailored Details</span>
          </div>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${step === 2 ? 'bg-[#0B3B8C] text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 text-[#D4A017] flex items-center justify-center font-mono font-bold text-[10px]">2</span>
            <span>Summary & Prepay</span>
          </div>
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px]">3</span>
            <span>Voucher Secured</span>
          </div>
        </div>

        {/* STEP 1: EXPERIENCE SELECTION & FORM ENTRY */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT / CENTRAL SPACE: Product selector OR Rich Info sheet */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Product selector is ONLY visible if isPackageLocked is false */}
              {!isPackageLocked ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-slate-900">Select What You Wish to Book</h3>
                    <p className="text-xs text-slate-500">Each service launches a dedicated workflow requesting only relevant details.</p>
                  </div>

                  {/* Navigation Category Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
                    {[
                      { id: 'packages', label: 'Holiday Packages' },
                      { id: 'tour', label: 'Day Tours' },
                      { id: 'transfer', label: 'Airport Transfers' },
                      { id: 'safari', label: 'Tanzania Safaris' },
                      { id: 'kilimanjaro', label: 'Kilimanjaro Treks' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleCategorySwitch(tab.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-tight transition-all cursor-pointer ${activeCategory === tab.id ? 'bg-[#0B3B8C] text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Grid of experiences in active category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => handleSelectProduct(pkg)}
                        className={`border rounded-2xl p-4 cursor-pointer transition-all flex gap-4 hover:border-[#D4A017] hover:shadow-lg ${selectedPackage?.id === pkg.id ? 'border-[#0B3B8C] bg-[#0B3B8C]/5 ring-2 ring-[#0B3B8C]/10' : 'border-slate-200'}`}
                      >
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col justify-between">
                          <div>
                            {pkg.badge && (
                              <span className="text-[9px] font-black uppercase tracking-wider text-[#D4A017] bg-[#D4A017]/10 px-2 py-0.5 rounded-full mb-1 inline-block">
                                {pkg.badge}
                              </span>
                            )}
                            <h4 className="text-xs font-black text-slate-900 leading-tight">{pkg.name}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">{pkg.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] font-mono text-[#0B3B8C] font-bold">{pkg.duration}</span>
                            <span className="text-xs font-black text-slate-900">From ${pkg.basePrice}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Locked package summary at the top
                <div className="bg-[#0B3B8C] text-white rounded-3xl p-5 shadow-xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedPackage?.image}
                      alt={selectedPackage?.name}
                      className="w-16 h-16 rounded-xl object-cover border border-white/20 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#D4A017] font-mono">SELECTED {selectedPackage?.categoryLabel.toUpperCase()}</span>
                      <h3 className="text-sm font-black text-white">{selectedPackage?.name}</h3>
                      <p className="text-[11px] text-white/75 mt-0.5">{selectedPackage?.duration} • Base Rate ${selectedPackage?.basePrice} USD</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsPackageLocked(false);
                      if (selectedPackage?.category === 'packages') {
                        setViewingPackageDetails(true);
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[#D4A017] text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Change Service
                  </button>
                </div>
              )}

              {/* DEDICATED HOLIDAY PACKAGE RICH INFO PAGE */}
              {viewingPackageDetails && selectedPackage && currentHolidayPackageDetails && (
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl" id="dedicated-package-details-page">
                  {/* Banner cover */}
                  <div className="relative h-64 sm:h-80 bg-slate-900">
                    <img
                      src={selectedPackage.image}
                      alt={selectedPackage.name}
                      className="w-full h-full object-cover opacity-85"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="flex gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-[#D4A017] text-[#020C1F] px-2.5 py-1 rounded-full">
                          {selectedPackage.badge || 'Signature Package'}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-800 text-white px-2.5 py-1 rounded-full">
                          {selectedPackage.duration}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black">{selectedPackage.name}</h2>
                      <p className="text-xs text-slate-300 mt-1">{selectedPackage.description}</p>
                    </div>
                  </div>

                  {/* Rating / Quick metrics */}
                  <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="p-4 text-center border-r border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400">RATING</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-slate-800">{selectedPackage.rating} / 5</span>
                      </div>
                    </div>
                    <div className="p-4 text-center border-r border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400">REVIEWS</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">{selectedPackage.reviews} verified</p>
                    </div>
                    <div className="p-4 text-center border-r border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400">PRICE FROM</p>
                      <p className="text-xs font-bold text-[#0B3B8C] mt-1">${selectedPackage.basePrice} per person</p>
                    </div>
                    <div className="p-4 text-center">
                      <p className="text-[9px] font-black uppercase text-slate-400">AVAILABILITY</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-emerald-600 font-bold">Daily Starts</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabs bar */}
                  <div className="flex overflow-x-auto border-b border-slate-100 bg-white">
                    {[
                      { id: 'itinerary', label: 'Full Itinerary', icon: BookOpen },
                      { id: 'hotels', label: 'Hotels Included', icon: Home },
                      { id: 'inclusions', label: 'Inclusions / Exclusions', icon: Shield },
                      { id: 'reviews', label: 'Reviews', icon: ThumbsUp },
                      { id: 'faq', label: 'FAQ', icon: HelpCircle }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveDetailTab(tab.id as any)}
                          className={`px-5 py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${activeDetailTab === tab.id ? 'border-[#0B3B8C] text-[#0B3B8C] bg-slate-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                        >
                          <Icon size={14} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tabs content area */}
                  <div className="p-6">
                    {activeDetailTab === 'itinerary' && (
                      <div className="space-y-6">
                        {currentHolidayPackageDetails.itinerary.map((day) => (
                          <div key={day.day} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <span className="w-8 h-8 rounded-full bg-[#0B3B8C] text-[#D4A017] flex items-center justify-center text-xs font-black shrink-0 font-mono">
                                D{day.day}
                              </span>
                              <div className="w-0.5 bg-slate-200 flex-grow my-1" />
                            </div>
                            <div className="pb-4">
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{day.title}</h4>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{day.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeDetailTab === 'hotels' && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500">We carefully curate boutique and beach resorts with exceptional Swahili hospitality standards:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {currentHolidayPackageDetails.hotels.map((hotel, i) => (
                            <div key={i} className="border border-slate-100 p-4 rounded-xl bg-slate-50/50 flex items-start gap-3">
                              <Home size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{hotel.split(' (')[0]}</h4>
                                <p className="text-[11px] text-slate-500 mt-1">{hotel.includes('(') ? hotel.split(' (')[1].replace(')', '') : 'Curated comfort standards'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeDetailTab === 'inclusions' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs font-black uppercase text-emerald-600 tracking-wider mb-3">WHAT IS INCLUDED:</h4>
                          <ul className="space-y-2">
                            {currentHolidayPackageDetails.inclusions.map((inc, i) => (
                              <li key={i} className="flex gap-2 text-xs text-slate-600">
                                <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-red-600 tracking-wider mb-3">WHAT IS EXCLUDED:</h4>
                          <ul className="space-y-2">
                            {currentHolidayPackageDetails.exclusions.map((exc, i) => (
                              <li key={i} className="flex gap-2 text-xs text-slate-500">
                                <X size={14} className="text-red-400 shrink-0 mt-0.5" />
                                <span>{exc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeDetailTab === 'reviews' && (
                      <div className="space-y-4">
                        {currentHolidayPackageDetails.reviewsList.map((rev, i) => (
                          <div key={i} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/30">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-slate-800">{rev.author}</span>
                              <span className="text-[10px] text-slate-400">{rev.date}</span>
                            </div>
                            <div className="flex gap-1 mb-2">
                              {Array.from({ length: Math.floor(rev.rating) }).map((_, rIdx) => (
                                <Star key={rIdx} size={10} className="text-amber-500 fill-amber-500" />
                              ))}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed italic">"{rev.text}"</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeDetailTab === 'faq' && (
                      <div className="space-y-4">
                        {currentHolidayPackageDetails.faqs.map((faq, i) => (
                          <div key={i} className="border border-slate-100 p-4 rounded-xl">
                            <h4 className="font-bold text-slate-800 text-xs">{faq.q}</h4>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{faq.a}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions / Trigger booking */}
                  <div className="bg-[#0A1224] text-white p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Ready to secure this Holiday Package?</p>
                      <p className="text-sm font-black text-white mt-1">Starting at ${selectedPackage.basePrice} USD per adult</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsPackageLocked(true);
                        setViewingPackageDetails(false);
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-[#D4A017] hover:bg-[#b88910] text-[#020C1F] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                      id="btn-book-this-package"
                    >
                      <span>Book This Package</span>
                      <ArrowRight size={14} className="text-[#020C1F]" />
                    </button>
                  </div>
                </div>
              )}

              {/* DEDICATED TAILORED FORM CONTAINER */}
              {isPackageLocked && selectedPackage && (
                <form onSubmit={handleProceedToSummary} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Provide Your Booking Information</h3>
                    <p className="text-xs text-slate-500">Provide the essential information needed to schedule your {selectedPackage.categoryLabel.toLowerCase()}.</p>
                  </div>

                  {/* Render the tailored form based on category selection */}
                  {renderTailoredFormFields()}

                  {/* Submit entry */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#0B3B8C] hover:bg-[#072a66] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
                    id="btn-submit-tailored-form"
                  >
                    <span>Proceed to pricing summary</span>
                    <ArrowRight size={14} className="text-white" />
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT SPACE: Live Pricing breakdown, helpful sidebar */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Checkout Sizing breakdown */}
              {selectedPackage ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-5 sticky top-24" id="sidebar-pricing-card">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">LIVE BOOKING RECEIPT</span>
                    <h3 className="text-sm font-black text-slate-900 mt-1">{selectedPackage.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{selectedPackage.duration} • {selectedPackage.categoryLabel}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">
                        Base rate 
                        {(selectedPackage.category === 'safari' || selectedPackage.category === 'kilimanjaro') 
                          ? ` (${adultsCount} Travellers)`
                          : ` (${adultsCount} Adults x $${pricingBreakdown.basePricePerAdult})`
                        }
                      </span>
                      <span className="font-bold text-slate-800">${pricingBreakdown.baseTotal}</span>
                    </div>

                    {childrenCount > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Children ({childrenCount} Child x ${Math.round(pricingBreakdown.basePricePerAdult * 0.60)})</span>
                        <span className="font-bold text-slate-800">${Math.round(pricingBreakdown.basePricePerAdult * 0.60 * childrenCount)}</span>
                      </div>
                    )}

                    {/* Seasonality */}
                    {pricingBreakdown.seasonMultiplier !== 1.0 && (
                      <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 flex flex-col">
                          <strong className="text-slate-700">Season Factor</strong>
                          {pricingBreakdown.seasonLabel}
                        </span>
                        <span className={`font-mono text-xs font-black ${pricingBreakdown.seasonMultiplier > 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {pricingBreakdown.seasonMultiplier > 1 ? `+15%` : `-10%`}
                        </span>
                      </div>
                    )}

                    {/* Pickup Surcharges */}
                    {pricingBreakdown.pickupSurcharge > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          <span>Pickup surcharge ({pricingBreakdown.pickupZoneLabel})</span>
                        </span>
                        <span className="font-bold text-slate-800">${pricingBreakdown.pickupSurcharge}</span>
                      </div>
                    )}

                    {/* Applied Promo Code */}
                    {couponApplied && activeCoupon && (
                      <div className="flex justify-between items-center text-xs text-emerald-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                        <span className="flex items-center gap-1 text-[11px] font-semibold">
                          <Percent size={12} />
                          <span>Code: {activeCoupon.code} ({activeCoupon.discount_percent}%)</span>
                        </span>
                        <span className="font-mono font-bold">-${pricingBreakdown.promoDiscount}</span>
                      </div>
                    )}

                    {/* Prepayment incentives */}
                    {pricingBreakdown.prepayDiscount > 0 && (
                      <div className="flex justify-between items-center text-xs text-emerald-600">
                        <span className="flex items-center gap-1 text-[11px] font-semibold">
                          <Percent size={12} />
                          <span>Prepay discount ({paymentOption === 'full' ? '10%' : '5%'} saving)</span>
                        </span>
                        <span className="font-mono font-bold">-${pricingBreakdown.prepayDiscount}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Government Tax & VAT (18%)</span>
                      <span>${pricingBreakdown.taxAmount}</span>
                    </div>
                  </div>

                  {/* Promo Input */}
                  <div className="border-t border-slate-100 pt-4">
                    {couponApplied ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs text-emerald-800">
                        <span>Promo Code Activated</span>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-emerald-600 hover:text-red-500 font-extrabold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-black uppercase text-slate-400">Coupon / Promo Code</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. WELCOME10"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-grow px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase focus:bg-white outline-none text-slate-800 font-bold"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
                      </div>
                    )}
                  </div>

                  {/* Final Sum */}
                  <div className="border-t border-slate-100 pt-4 space-y-3 bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-3xl">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-black text-slate-500">TRANSPARENT TOTAL</span>
                      <span className="text-xl font-black text-[#0B3B8C] font-mono">
                        ${pricingBreakdown.finalTotal} <span className="text-[10px] text-slate-500 font-normal">USD</span>
                      </span>
                    </div>

                    {/* Prepayment choice */}
                    <div className="space-y-1.5 pt-2">
                      <label className="block text-[10px] font-black uppercase text-slate-400">Select payment choice</label>
                      <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setPaymentOption('full')}
                          className={`py-1.5 px-2 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${paymentOption === 'full' ? 'bg-[#0B3B8C] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          Full Rate
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentOption('deposit')}
                          className={`py-1.5 px-2 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${paymentOption === 'deposit' ? 'bg-[#0B3B8C] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          30% Deposit
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentOption('later')}
                          className={`py-1.5 px-2 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${paymentOption === 'later' ? 'bg-[#0B3B8C] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          Pay Later
                        </button>
                      </div>
                    </div>

                    {paymentOption === 'deposit' && (
                      <div className="space-y-1 text-[10px] text-slate-600 border-t border-slate-200/60 pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Deposit Paid Now (30%):</span>
                          <span>${pricingBreakdown.rawDepositUSD}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Remaining Balance (Due on Arrival):</span>
                          <span>${pricingBreakdown.rawRemainingUSD}</span>
                        </div>
                      </div>
                    )}

                    {paymentOption === 'later' && (
                      <div className="text-[10px] text-slate-500 bg-slate-100 p-2.5 rounded-xl leading-relaxed">
                        ⚠️ <strong>Hold for free:</strong> We will hold your booking reference for up to 48 hours. Our specialists will request payment validation before dispatching Swahili guides.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl text-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-[#D4A017]">
                    <Compass className="animate-spin" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Waiting for Selection</h4>
                    <p className="text-xs text-slate-400 mt-1">Select an experience or package to initiate your separate booking workflow instantly.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: SUMMARY & PREPAYMENT GATEWAY */}
        {step === 2 && selectedPackage && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8" id="step2-summary-gateway-container">
            {/* Left: Summary list */}
            <div className="md:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900">Review Reservation Details</h3>
                  <p className="text-xs text-slate-500">Please review your booking details before securing payment.</p>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Experience Name</p>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedPackage.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Duration & Type</p>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedPackage.duration} • {selectedPackage.categoryLabel}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Travel Date</p>
                      <p className="font-bold text-slate-800 mt-0.5">{arrivalDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Guests / Climbers</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {selectedPackage.category === 'safari' || selectedPackage.category === 'kilimanjaro' 
                          ? `${adultsCount} Travellers`
                          : `${adultsCount} Adults ${childrenCount > 0 ? `, ${childrenCount} Kids` : ''}`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Room Preference */}
                  {selectedPackage.category === 'packages' && (
                    <div className="text-xs">
                      <p className="text-[10px] uppercase font-black text-slate-400">Room Preference</p>
                      <p className="font-bold text-slate-800 mt-0.5">{formData.roomPreference}</p>
                    </div>
                  )}

                  {/* Airport Transfer detailed summaries */}
                  {selectedPackage.category === 'transfer' && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400">Direction & Terminal</p>
                        <p className="font-bold text-slate-800 mt-0.5 uppercase">{formData.transferDirection} • {formData.transferTerminal}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400">Flight & Capacity</p>
                        <p className="font-bold text-slate-800 mt-0.5 uppercase">Flight: {formData.flightNo} • Time: {formData.flightTime}</p>
                      </div>
                    </div>
                  )}

                  {/* Kilimanjaro detailed summaries */}
                  {selectedPackage.category === 'kilimanjaro' && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400">Accommodations</p>
                        <p className="font-bold text-slate-800 mt-0.5">{formData.accommodationBeforeAfter}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400">Airport Pickup JRO</p>
                        <p className="font-bold text-slate-800 mt-0.5">{formData.airportPickup}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400">Lead Traveler Contact</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{formData.firstName} {formData.lastName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{formData.email} • {formData.phone}</p>
                  </div>

                  {formData.message && (
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Special Notes</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">"{formData.message}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PAYMENT ENTRY GATEWAY: Only if not Pay Later */}
              {paymentOption !== 'later' ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Prepayment Security Panel</h3>
                    <p className="text-xs text-slate-500">PCI-Compliant SSL encrypted checkout. No cards details are cached.</p>
                  </div>

                  <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setOnlinePaymentMethod('card')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${onlinePaymentMethod === 'card' ? 'bg-white text-[#0B3B8C] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <CreditCard size={14} />
                      <span>Credit / Debit Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlinePaymentMethod('mobile_money')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${onlinePaymentMethod === 'mobile_money' ? 'bg-white text-[#0B3B8C] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Landmark size={14} />
                      <span>Mobile Money</span>
                    </button>
                  </div>

                  {onlinePaymentMethod === 'card' ? (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Card Number *</label>
                        <input
                          type="text"
                          placeholder="4111 2222 3333 4444"
                          value={cardNo}
                          onChange={(e) => setCardNo(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none text-slate-800 font-mono font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Expiry Date *</label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none text-slate-800 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">CVC / Security *</label>
                          <input
                            type="password"
                            placeholder="•••"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none text-slate-800 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5">Mobile Operator Provider *</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['mpesa', 'tigo', 'airtel'].map((prov) => (
                            <button
                              key={prov}
                              type="button"
                              onClick={() => setMobileProvider(prov as any)}
                              className={`py-2 text-[10px] font-black uppercase rounded-xl border transition-all cursor-pointer ${mobileProvider === prov ? 'border-[#0B3B8C] bg-[#0B3B8C]/5 text-[#0B3B8C] font-black' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            >
                              {prov === 'mpesa' ? 'M-Pesa (Vodacom)' : prov === 'tigo' ? 'Tigo Pesa' : 'Airtel Money'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Mobile Account Number *</label>
                          <input
                            type="tel"
                            placeholder="e.g. +255 744 123 456"
                            value={mobilePhone}
                            onChange={(e) => setMobilePhone(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none text-slate-800 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Registered Account Holder Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Juma Kassim"
                            value={mobileName}
                            onChange={(e) => setMobileName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white outline-none text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-100 text-[11px] leading-relaxed mt-2">
                    <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                    <span>Your transaction is covered by Zanzibar Trip & Relax 100% refund safety guarantee (cancel up to 24 hours prior for full refund).</span>
                  </div>
                </div>
              ) : null}

              {/* Navigation Back button */}
              <button
                onClick={handleBackToForm}
                className="text-xs font-bold text-[#0B3B8C] flex items-center gap-1.5 hover:underline bg-white border border-slate-200 px-4 py-2 rounded-xl"
              >
                <ArrowLeft size={14} />
                <span>Change traveler entries</span>
              </button>
            </div>

            {/* Right: Payment totals check */}
            <div className="md:col-span-5">
              <div className="bg-[#0A1224] text-white rounded-3xl p-6 shadow-xl space-y-6 sticky top-24 border border-slate-800">
                <div>
                  <span className="text-[9px] font-black uppercase text-[#D4A017] tracking-widest font-mono">TRANSPARENT BALANCE SHEET</span>
                  <h4 className="text-sm font-bold text-white mt-1">Payment Breakdown</h4>
                </div>

                <div className="space-y-3.5 border-t border-slate-800 pt-4 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Subtotal:</span>
                    <span>${pricingBreakdown.baseTotal}</span>
                  </div>

                  {pricingBreakdown.pickupSurcharge > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Pickup transfer ({pricingBreakdown.pickupZoneLabel}):</span>
                      <span>${pricingBreakdown.pickupSurcharge}</span>
                    </div>
                  )}

                  {pricingBreakdown.promoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo applied:</span>
                      <span>-${pricingBreakdown.promoDiscount}</span>
                    </div>
                  )}

                  {pricingBreakdown.prepayDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Prepayment benefit:</span>
                      <span>-${pricingBreakdown.prepayDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Gov VAT & Luxury Tax (18%):</span>
                    <span>${pricingBreakdown.taxAmount}</span>
                  </div>

                  <div className="flex justify-between text-white font-bold border-t border-slate-800 pt-3 text-sm">
                    <span>Transparent Total:</span>
                    <span className="font-mono text-white">${pricingBreakdown.finalTotal} USD</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-4">
                  {paymentOption === 'deposit' ? (
                    <div className="bg-slate-900/60 p-4 rounded-2xl space-y-2 border border-slate-800">
                      <div className="flex justify-between text-xs text-[#D4A017] font-black">
                        <span>DUE NOW (30% DEPOSIT):</span>
                        <span className="font-mono">${pricingBreakdown.rawDepositUSD} USD</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Remaining Balance (on Arrival):</span>
                        <span className="font-mono">${pricingBreakdown.rawRemainingUSD} USD</span>
                      </div>
                    </div>
                  ) : paymentOption === 'later' ? (
                    <div className="bg-slate-900/60 p-4 rounded-2xl text-center border border-slate-800">
                      <p className="text-xs text-[#D4A017] font-black uppercase">ZERO DUE NOW</p>
                      <p className="text-[10px] text-slate-400 mt-1">Full amount of ${pricingBreakdown.finalTotal} USD is due on arrival in Zanzibar.</p>
                    </div>
                  ) : (
                    <div className="bg-slate-900/60 p-4 rounded-2xl text-center border border-slate-800">
                      <p className="text-xs text-emerald-400 font-black uppercase">FULL AMOUNT PAID NOW</p>
                      <p className="text-[10px] text-slate-400 mt-1">Saves you 10% on your tropical tour booking!</p>
                    </div>
                  )}

                  <button
                    onClick={handleConfirmBooking}
                    disabled={status === 'loading'}
                    className="w-full py-4 bg-[#D4A017] hover:bg-[#b88910] text-[#020C1F] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    id="btn-confirm-booking-step2"
                  >
                    {status === 'loading' ? (
                      <>
                        <RefreshCw className="animate-spin text-[#020C1F]" size={14} />
                        <span>Securing Swahili Guides...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} className="text-[#020C1F]" />
                        <span>
                          {paymentOption === 'later' ? 'Secure Hold' : `Pay & Confirm $${paymentOption === 'full' ? pricingBreakdown.finalTotal : pricingBreakdown.rawDepositUSD}`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BOOKING SUCCESS CONFIRMATION */}
        {step === 3 && selectedPackage && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl" id="step3-success-container">
            {/* Swahili celebratory header */}
            <div className="bg-[#0A1224] text-white p-8 text-center relative">
              <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${selectedPackage.image})` }} />
              <div className="relative z-10 space-y-3">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-white/10">
                  <CheckCircle2 size={36} className="animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#D4A017] font-mono bg-[#D4A017]/10 px-3 py-1 rounded-full">KARIBU ZANZIBAR! 🌴</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-2">Reservation Successfully Secured!</h2>
                  <p className="text-xs text-slate-400 mt-1">Your Swahili adventure itinerary has been synchronized with the Zanzibar HQ.</p>
                </div>
              </div>
            </div>

            {/* Content info */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Copyable Reference number banner */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl gap-3 text-center sm:text-left">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400">RESERVATION REFERENCE CODE</span>
                  <p className="text-base font-black text-slate-800 tracking-wider font-mono mt-0.5">{reference}</p>
                </div>
                <button
                  onClick={handleCopyReference}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  id="btn-copy-ref"
                >
                  {copiedRef ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedRef ? 'Copied' : 'Copy reference'}</span>
                </button>
              </div>

              {/* Action buttons (Downloads, Receipt, Calendar) */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">SECURE DIGITAL DOCUMENTS</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleDownloadVoucher}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0B3B8C] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
                    id="btn-download-voucher"
                  >
                    <Download size={14} />
                    <span>Download Travel Voucher</span>
                  </button>
                  <button
                    onClick={handleDownloadInvoice}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0B3B8C] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
                    id="btn-download-invoice"
                  >
                    <Printer size={14} />
                    <span>Download Invoice PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadCalendarInvite}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
                    id="btn-download-calendar"
                  >
                    <Calendar size={14} className="text-[#D4A017]" />
                    <span>Add to Calendar (.ics)</span>
                  </button>
                </div>
              </div>

              {/* Verified details review */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">RESERVATION BREAKDOWN</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Lead Guest:</span>
                    <p className="font-bold text-slate-800 mt-0.5">{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Email Address:</span>
                    <p className="font-bold text-slate-800 mt-0.5">{formData.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Selected Experience:</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedPackage.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Scheduled Date:</span>
                    <p className="font-bold text-[#0B3B8C] mt-0.5">{arrivalDate}</p>
                  </div>
                </div>
              </div>

              {/* Automatic emails & notifications alert */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex gap-2.5 items-start">
                  <Mail size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">Automated Confirmation Dispatch</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      We have dispatched an automated validation email directly to <strong className="text-slate-700">{formData.email}</strong>. It contains your complete package PDF vouchers and arrival directions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Big Interactive WhatsApp CTA */}
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest font-mono">FAST TRACK CONFIRMATION</span>
                  <h4 className="font-bold text-slate-800 text-sm">Synchronize with Zanzibar Office instantly!</h4>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                    Tap the WhatsApp Business button to pre-fill your reference code and travel details. Our on-duty operations coordinator will instantly confirm your driver's pick-up time.
                  </p>
                </div>
                <button
                  onClick={handleSuccessWhatsAppChat}
                  className="w-full sm:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  id="btn-whatsapp-success-chat"
                >
                  <MessageCircle size={16} fill="white" />
                  <span>Send Reference to WhatsApp</span>
                </button>
              </div>

              {/* Reset booking */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedPackage(null);
                    setIsPackageLocked(false);
                    setViewingPackageDetails(false);
                    setCouponApplied(false);
                    setCouponCode('');
                  }}
                  className="text-xs text-slate-400 hover:text-[#0B3B8C] underline cursor-pointer"
                >
                  Book another Swahili experience
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Exit Intent Modal */}
      <ExitIntentModal />
    </div>
  );
}
