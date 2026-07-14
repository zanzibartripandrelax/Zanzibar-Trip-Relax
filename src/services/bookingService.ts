import { supabase } from '../lib/supabase';
import { eventBus, BookingEventPayload, PaymentEventPayload } from './eventBus';
import { addActivityLog } from '../lib/cmsStore';

/**
 * Interface representing the pricing breakdown structure
 */
export interface PricingBreakdown {
  baseTotal: number;
  pickupSurcharge: number;
  seasonMultiplier: number;
  seasonLabel: string;
  promoDiscount: number;
  prepayDiscount: number;
  taxAmount: number;
  finalTotal: number;
  rawDepositUSD: number;
  rawRemainingUSD: number;
  currencySymbol: string;
  basePricePerAdult: number;
  pickupZoneLabel: string;
}

/**
 * Auto-generates a unique booking reference code.
 * Follows the pattern: ZTR-2026-XXXX (four random digits).
 */
export function generateBookingReference(): string {
  const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
  return `ZTR-2026-${randomSuffix}`;
}

/**
 * Calculates complete, itemized pricing breakdown for any booking.
 * Mimics exact Zanzibar Trip & Relax financial rules:
 * - 60% rate for children on day tours, 0% on transfers.
 * - Surcharge for out-of-zone transfers or hotel pickups.
 * - Dry/Peak season multipliers (15% premium) and rainy green season discounts (10% off).
 * - Prepayment incentive (10% off for Full prepayment, 5% off for Deposit).
 * - 18% Zanzibar government VAT.
 * - 30% deposit requirement for partial payment options.
 */
export function calculateBookingTotals(params: {
  basePrice: number;
  category: string;
  adultsCount: number;
  childrenCount: number;
  pickupSurcharge?: number;
  pickupZoneLabel?: string;
  arrivalDate?: string;
  promoDiscountPercent?: number; // Coupon percentage (e.g., 10 for 10%)
  paymentOption: 'deposit' | 'full' | 'later';
  safariAccommodation?: 'budget' | 'comfort' | 'luxury';
}): PricingBreakdown {
  const {
    basePrice,
    category,
    adultsCount,
    childrenCount,
    pickupSurcharge = 0,
    pickupZoneLabel = 'Stone Town (Complimentary)',
    arrivalDate,
    promoDiscountPercent = 0,
    paymentOption,
    safariAccommodation = 'comfort',
  } = params;

  // 1. Calculate Base Price per Adult based on Category/Accommodation
  let basePricePerAdult = basePrice;
  if (category === 'safari') {
    if (safariAccommodation === 'luxury') basePricePerAdult = basePrice + 250;
    else if (safariAccommodation === 'budget') basePricePerAdult = basePrice - 100;
  }

  // 2. Compute Base Total (Transfers have a flat base price)
  let baseTotal = 0;
  if (category === 'transfer') {
    baseTotal = basePrice;
  } else {
    const childPrice = childPriceCoefficient(category) * basePricePerAdult;
    baseTotal = (basePricePerAdult * adultsCount) + (childPrice * childrenCount);
  }

  // 3. Seasonality Adjustments (Zanzibar travel seasons)
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
      console.warn('Date parsing for seasonality skipped in bookingService:', err);
    }
  }

  const seasonedBaseTotal = baseTotal * seasonMultiplier;

  // 4. Promo Coupon Deductions
  const promoDiscount = seasonedBaseTotal * (promoDiscountPercent / 100);

  // 5. Prepayment Incentives
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

  // 7. Final Rounding & Totals
  const finalTotal = Math.max(0, Math.round(taxableSubtotal + taxAmount));

  // 8. Deposit / Remaining Balance calculation
  let rawDepositUSD = 0;
  if (paymentOption === 'deposit') {
    rawDepositUSD = Math.round(finalTotal * 0.30); // 30% deposit requirement
  } else if (paymentOption === 'full') {
    rawDepositUSD = finalTotal;
  }

  const rawRemainingUSD = Math.max(0, finalTotal - rawDepositUSD);

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
    pickupZoneLabel,
  };
}

/**
 * Helper to determine children pricing coefficients by product category.
 */
function childPriceCoefficient(category: string): number {
  if (category === 'transfer') return 0;
  return 0.60; // 60% of adult price standard for day excursions & safaris
}

/**
 * Submits a new booking, saving to the database and invoking the EventBus trigger.
 */
export async function createBooking(params: {
  fullName: string;
  email: string;
  whatsappNumber: string;
  packageName: string;
  packageCategory: string;
  packageId?: string;
  travelDate: string;
  adultsCount: number;
  childrenCount: number;
  pickupLocation: string;
  paymentOption: 'deposit' | 'full' | 'later';
  pricingBreakdown: PricingBreakdown;
  specialRequests?: string;
}): Promise<{ success: boolean; reference: string; error?: string }> {
  const reference = generateBookingReference();
  const {
    fullName,
    email,
    whatsappNumber,
    packageName,
    packageCategory,
    packageId,
    travelDate,
    adultsCount,
    childrenCount,
    pickupLocation,
    paymentOption,
    pricingBreakdown,
    specialRequests = '',
  } = params;

  // Assemble full structured booking payload
  const bookingPayload = {
    reference,
    created_at: new Date().toISOString(),
    lead_traveler_name: fullName,
    lead_traveler_email: email.trim(),
    lead_traveler_phone: whatsappNumber.trim(),
    product_id: packageId,
    product_name: packageName,
    product_category: packageCategory,
    travel_date: travelDate,
    adults_count: adultsCount,
    children_count: childrenCount,
    pickup_hotel: pickupLocation,
    payment_choice: paymentOption,
    total_price: pricingBreakdown.finalTotal,
    deposit_amount: pricingBreakdown.rawDepositUSD,
    balance_remaining: pricingBreakdown.rawRemainingUSD,
    special_requests: specialRequests,
    status: paymentOption === 'later' ? 'On Hold' : 'Secured',
  };

  try {
    // 1. Write directly to Supabase Bookings ledger table
    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          reference_code: reference,
          customer_name: fullName,
          customer_email: email.trim(),
          customer_phone: whatsappNumber.trim(),
          product_name: packageName,
          product_category: packageCategory,
          travel_date: travelDate,
          guest_count: adultsCount + childrenCount,
          pickup_location: pickupLocation,
          total_price: pricingBreakdown.finalTotal,
          payment_status: paymentOption === 'later' ? 'pending' : (paymentOption === 'full' ? 'fully_paid' : 'deposit_paid'),
          status: paymentOption === 'later' ? 'pending' : 'confirmed',
          details: bookingPayload,
        },
      ]);

    if (error) {
      console.warn('[BookingService] Supabase insert warning:', error.message);
    }
  } catch (err) {
    console.warn('[BookingService] Database save skipped (non-blocking fallback active):', err);
  }

  // 2. Safe local storage state updates for immediate UI synchronizations
  try {
    const existingBackup = JSON.parse(localStorage.getItem('ztr_local_bookings_backup') || '[]');
    localStorage.setItem('ztr_local_bookings_backup', JSON.stringify([bookingPayload, ...existingBackup]));

    // Also synchronize primary ztr_bookings state used in admin panels
    const currentList = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
    const adminFormatObj = {
      id: `ztr-${Date.now()}`,
      reference_code: reference,
      full_name: fullName,
      email: email.trim(),
      whatsapp_number: whatsappNumber.trim(),
      tour_name: packageName,
      preferred_date: travelDate,
      number_of_guests: adultsCount + childrenCount,
      pickup_location: pickupLocation,
      message: specialRequests,
      status: paymentOption === 'later' ? 'pending' : 'confirmed',
      created_at: new Date().toISOString(),
      details: bookingPayload,
    };
    localStorage.setItem('ztr_bookings', JSON.stringify([adminFormatObj, ...currentList]));

    // Update returning customer preferences cache
    localStorage.setItem('ztr_returning_user_info', JSON.stringify({
      name: fullName,
      email: email.trim(),
      phone: whatsappNumber.trim(),
      hotel: pickupLocation,
    }));
  } catch (err) {
    console.error('[BookingService] Local state storage save failure:', err);
  }

  // 3. Emit asynchronous event notification payload through EventBus
  try {
    const eventPayload: BookingEventPayload = {
      reference,
      fullName,
      email: email.trim(),
      whatsappNumber: whatsappNumber.trim(),
      tourName: packageName,
      preferredDate: travelDate,
      pickupLocation,
      numberOfGuests: adultsCount + childrenCount,
      totalPrice: pricingBreakdown.finalTotal,
      depositAmount: pricingBreakdown.rawDepositUSD,
      remainingBalance: pricingBreakdown.rawRemainingUSD,
      paymentOption,
      paymentStatus: paymentOption === 'later' ? 'pending' : (paymentOption === 'full' ? 'fully_paid' : 'partially_paid'),
      currency: '$',
      specialRequests,
      timestamp: new Date().toISOString(),
    };

    // Emit created event
    await eventBus.emit('booking.created', eventPayload);

    // If confirmed instantly, emit confirmed event too
    if (paymentOption !== 'later') {
      await eventBus.emit('booking.confirmed', eventPayload);
    }

    // Append systemic operation log to CMS activity log
    addActivityLog(
      fullName,
      'Guest',
      `Placed automatic checkout booking order [Ref: ${reference}] for ${packageName}.`
    );
  } catch (err) {
    console.error('[BookingService] EventBus broadcast failed:', err);
  }

  return { success: true, reference };
}

/**
 * Updates an existing booking status, updates databases, and emits EventBus alerts.
 */
export async function updateBookingStatus(
  bookingId: string | number,
  referenceCode: string,
  newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'driver_assigned',
  paymentStatus?: 'pending' | 'partially_paid' | 'fully_paid',
  extraData: Record<string, any> = {}
): Promise<boolean> {
  try {
    // 1. Update Supabase if possible
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          payment_status: paymentStatus || undefined,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${bookingId},reference_code.eq.${referenceCode}`);

      if (error) {
        console.warn('[BookingService] Supabase update skipped:', error.message);
      }
    } catch (dbErr) {
      console.warn('[BookingService] Supabase update failed:', dbErr);
    }

    // 2. Synchronize LocalStorage lists
    let matchingBooking: any = null;
    const currentList = JSON.parse(localStorage.getItem('ztr_bookings') || '[]');
    const updatedList = currentList.map((bk: any) => {
      if (String(bk.id) === String(bookingId) || bk.reference_code === referenceCode) {
        matchingBooking = {
          ...bk,
          status: newStatus === 'pending' ? 'pending' : 'confirmed', // map to simple UI statuses
          details: {
            ...(bk.details || {}),
            status: newStatus,
            payment_status: paymentStatus || bk.details?.payment_status,
            ...extraData,
          },
        };
        return matchingBooking;
      }
      return bk;
    });

    localStorage.setItem('ztr_bookings', JSON.stringify(updatedList));

    // Update backup store
    const backupList = JSON.parse(localStorage.getItem('ztr_local_bookings_backup') || '[]');
    const updatedBackup = backupList.map((bk: any) => {
      if (bk.reference === referenceCode) {
        return {
          ...bk,
          status: newStatus,
          payment_status: paymentStatus || bk.payment_status,
          ...extraData,
        };
      }
      return bk;
    });
    localStorage.setItem('ztr_local_bookings_backup', JSON.stringify(updatedBackup));

    // 3. Emit status change events on the EventBus
    if (matchingBooking) {
      const payload: BookingEventPayload = {
        reference: referenceCode,
        fullName: matchingBooking.full_name || matchingBooking.details?.lead_traveler_name || 'Guest',
        email: matchingBooking.email || matchingBooking.details?.lead_traveler_email || '',
        whatsappNumber: matchingBooking.whatsapp_number || matchingBooking.details?.lead_traveler_phone || '',
        tourName: matchingBooking.tour_name || matchingBooking.details?.product_name || 'Zanzibar Tour',
        preferredDate: matchingBooking.preferred_date || matchingBooking.details?.travel_date || '',
        pickupLocation: matchingBooking.pickup_location || matchingBooking.details?.pickup_hotel || '',
        numberOfGuests: matchingBooking.number_of_guests || 1,
        totalPrice: matchingBooking.details?.total_price || 0,
        depositAmount: matchingBooking.details?.deposit_amount || 0,
        remainingBalance: matchingBooking.details?.balance_remaining || 0,
        paymentOption: matchingBooking.details?.payment_choice || 'later',
        paymentStatus: paymentStatus || matchingBooking.details?.payment_status || 'pending',
        currency: '$',
        timestamp: new Date().toISOString(),
      };

      if (newStatus === 'confirmed') {
        await eventBus.emit('booking.confirmed', payload);
      } else if (newStatus === 'cancelled') {
        await eventBus.emit('booking.cancelled', {
          reference: referenceCode,
          reason: extraData.reason || 'Requested by customer or coordinator',
          timestamp: new Date().toISOString(),
        });
      }

      if (paymentStatus === 'fully_paid' || paymentStatus === 'partially_paid') {
        const paymentPayload: PaymentEventPayload = {
          reference: referenceCode,
          fullName: payload.fullName,
          email: payload.email,
          amountPaid: extraData.amountPaid || payload.depositAmount,
          remainingBalance: extraData.remainingBalance || payload.remainingBalance,
          paymentStatus: paymentStatus,
          transactionId: extraData.transactionId || `TXN-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        await eventBus.emit('booking.paid', paymentPayload);
      }
    }

    return true;
  } catch (err) {
    console.error('[BookingService] Update booking status failure:', err);
    return false;
  }
}
