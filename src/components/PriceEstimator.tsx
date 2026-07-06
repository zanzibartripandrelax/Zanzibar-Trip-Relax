import React, { useMemo } from 'react';
import { 
  DollarSign, Users, Calendar, Award, Gift, Plane, ShieldCheck, Info, Sparkles 
} from 'lucide-react';
import { getExtendedSeasonality } from '../lib/cmsStore';

export interface PriceEstimatorProps {
  selectedCategory: string;
  selectedExperience: string;
  adultsCount: number;
  childrenCount: number;
  arrivalDate: string;
  departureDate: string;
  preferredDate: string;
  selectedAddons: string[];
  hotelNights: number;
  selectedHotelId: string;
  selectedZoneId: string;
  notListedHotel: boolean;
  customHotelName: string;
  currency: 'USD' | 'EUR';
  travelSeason: 'high' | 'green';
  pricing: {
    totalUSD: number;
    calculatedDepositUSD: number;
    displayTotal: number;
    displayDeposit: number;
    displayRemaining: number;
    currencySymbol: string;
    pricePerAdult: number;
    hasHotel: boolean;
    selectedHotel: any;
    addonsCost: number;
    discountAmount: number;
    seasonalitySettings: any;
    pickupZoneLabel: string;
    pickupSurcharge: number;
    // New fields
    adultsCount?: number;
    childrenCount?: number;
    infantsCount?: number;
    tourType?: 'shared' | 'private';
    adultsCost?: number;
    childrenCost?: number;
    infantsCost?: number;
    privateSurcharge?: number;
    vatAmount?: number;
    baseWithPrivate?: number;
    seasonAdjustmentAmount?: number;
  };
}

export default function PriceEstimator({
  selectedCategory,
  selectedExperience,
  adultsCount,
  childrenCount,
  arrivalDate,
  departureDate,
  preferredDate,
  selectedAddons,
  hotelNights,
  selectedHotelId,
  selectedZoneId,
  notListedHotel,
  customHotelName,
  currency,
  travelSeason,
  pricing
}: PriceEstimatorProps) {
  
  // Calculate duration in nights from DatePicker states
  const travelDurationNights = useMemo(() => {
    const startStr = arrivalDate || preferredDate;
    if (!startStr || !departureDate) return 0;
    
    const start = new Date(startStr);
    const end = new Date(departureDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [arrivalDate, preferredDate, departureDate]);

  // Determine season and percentage automatically based on date
  const seasonAdj = useMemo(() => {
    const selectedDate = arrivalDate || preferredDate;
    if (!selectedDate) {
      return { name: 'High Season', pct: 10, isDiscount: false };
    }
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
            return {
              name: s.name,
              pct: s.adjustmentPct,
              isDiscount: s.isDiscount
            };
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return { name: 'High Season', pct: 10, isDiscount: false };
  }, [arrivalDate, preferredDate]);

  // Fallback calculations for the UI in case values are absent
  const currencySymbol = pricing.currencySymbol || '$';
  const infantsVal = pricing.infantsCount ?? 0;
  const tType = pricing.tourType ?? 'private';
  const privSurcharge = pricing.privateSurcharge ?? 0;
  const vatValue = pricing.vatAmount ?? 0;
  const basePricePerAdult = pricing.pricePerAdult ?? 50;

  const resolvedAdultsCost = pricing.adultsCost ?? (basePricePerAdult * (selectedCategory === 'kilimanjaro' ? 1 : adultsCount));
  const resolvedChildrenCost = pricing.childrenCost ?? (Math.round(basePricePerAdult * 0.6) * childrenCount);

  return (
    <div className="bg-[#030d22] border border-white/10 rounded-3xl p-6 text-white space-y-6 shadow-2xl relative overflow-hidden">
      {/* Absolute top glowing background decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-full blur-3xl" />
      
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4A017] font-black flex items-center gap-1">
            <Sparkles size={11} className="animate-pulse" />
            LIVE COST ESTIMATOR
          </span>
          <h4 className="text-base font-black tracking-tight mt-0.5" style={{ fontFamily: 'Playfair Display, serif' }}>
            Interactive Price Statement
          </h4>
        </div>
        <div className="bg-white/5 border border-white/10 text-[10px] uppercase font-mono px-2.5 py-1 rounded-full font-bold text-slate-300">
          Real-time
        </div>
      </div>

      {/* Booking Summary display */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2 text-xs">
        <p className="font-extrabold text-[#D4A017] uppercase tracking-wider text-[10px]">Booking Summary</p>
        <div className="space-y-1.5 font-semibold text-slate-300">
          <div className="flex justify-between">
            <span>Selected Service:</span>
            <span className="text-white font-extrabold max-w-[180px] truncate text-right" title={selectedExperience}>{selectedExperience}</span>
          </div>
          <div className="flex justify-between">
            <span>Travel Date:</span>
            <span className="text-white font-extrabold">
              {preferredDate ? preferredDate : (arrivalDate && departureDate) ? `${arrivalDate} to ${departureDate}` : arrivalDate ? arrivalDate : 'Not selected yet'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Headcount:</span>
            <span className="text-white font-extrabold">
              {adultsCount} Adults
              {childrenCount > 0 && `, ${childrenCount} Kids`}
              {infantsVal > 0 && `, ${infantsVal} Infants`}
            </span>
          </div>
          {(selectedCategory === 'tour' || selectedCategory === 'safari') && (
            <div className="flex justify-between">
              <span>Service Type:</span>
              <span className="text-white font-extrabold uppercase text-[10px]">
                {tType === 'private' ? '💎 Private Tour' : '👥 Shared Tour'}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Pickup Location:</span>
            <span className="text-white font-extrabold text-right truncate max-w-[180px]">
              {pricing.pickupZoneLabel || 'Not selected yet'}
            </span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-white/10 font-bold text-sm">
            <span>Grand Booking Total:</span>
            <span className="text-[#D4A017] font-mono font-black">{pricing.currencySymbol}{pricing.displayTotal}</span>
          </div>
        </div>
      </div>

      {/* Primary summary panel */}
      <div className="grid grid-cols-1 gap-4">
        {/* Cost breakdown progress visualization */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4.5 space-y-3">
          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
            <Users size={12} className="text-[#D4A017]" />
            Itemized Pricing Breakdown (Transparent)
          </p>
          <div className="space-y-2 text-xs font-semibold">
            {/* Adults Cost */}
            <div className="flex justify-between items-center text-slate-300">
              <span>Adults Fare ({adultsCount}x)</span>
              <span className="font-mono text-white">
                {currencySymbol}{resolvedAdultsCost}
              </span>
            </div>

            {/* Kids Cost */}
            {childrenCount > 0 && (
              <div className="flex justify-between items-center text-slate-300">
                <span>Children Fare ({childrenCount}x at 40% Off)</span>
                <span className="font-mono text-white">
                  +{currencySymbol}{resolvedChildrenCost}
                </span>
              </div>
            )}

            {/* Infants Cost */}
            {infantsVal > 0 && (
              <div className="flex justify-between items-center text-slate-300">
                <span>Infants Fare ({infantsVal}x - Under 2)</span>
                <span className="font-mono text-emerald-400">
                  {currencySymbol}0 (Free!)
                </span>
              </div>
            )}

            {/* Private Tour Option */}
            {(selectedCategory === 'tour' || selectedCategory === 'safari') && tType === 'private' && (
              <div className="flex justify-between items-center text-slate-300">
                <span>Private Guide & Chauffeur Surcharge (+20%)</span>
                <span className="font-mono text-[#D4A017]">
                  +{currencySymbol}{privSurcharge}
                </span>
              </div>
            )}

            {/* Seasonal Adjustments */}
            {pricing.seasonAdjustmentAmount !== undefined && pricing.seasonAdjustmentAmount !== 0 && (
              <div className="flex justify-between items-center text-slate-300">
                <span>Seasonality ({seasonAdj.name} adjustment)</span>
                <span className={`font-mono ${pricing.seasonAdjustmentAmount < 0 ? 'text-emerald-400' : 'text-[#D4A017]'}`}>
                  {pricing.seasonAdjustmentAmount < 0 ? '-' : '+'}{currencySymbol}{Math.abs(pricing.seasonAdjustmentAmount)}
                </span>
              </div>
            )}

            {/* Bespoke Add-ons */}
            {pricing.addonsCost > 0 && (
              <div className="flex justify-between items-center text-slate-300">
                <span>Bespoke Add-on Options</span>
                <span className="font-mono text-white">
                  +{currencySymbol}{pricing.addonsCost}
                </span>
              </div>
            )}

            {/* Resort Transport breakdown in real-time */}
            {pricing.pickupSurcharge > 0 ? (
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex flex-col">
                  <span>Resort Transport Surcharge</span>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[190px]">
                    {pricing.pickupZoneLabel}
                  </span>
                </span>
                <span className="font-mono text-white">
                  +{currencySymbol}{pricing.pickupSurcharge}
                </span>
              </div>
            ) : pricing.pickupZoneLabel ? (
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex flex-col">
                  <span>Resort Transport</span>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[190px]">
                    {pricing.pickupZoneLabel}
                  </span>
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  Free
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-slate-400">
                <span>Resort Transport</span>
                <span className="italic text-[10px]">Select pickup in Step 2</span>
              </div>
            )}

            {/* Partner Hotel nights */}
            {pricing.hasHotel && travelDurationNights > 0 && (
              <div className="flex justify-between items-center text-slate-300">
                <span>{pricing.selectedHotel?.name} ({travelDurationNights} nights)</span>
                <span className="font-mono text-white">
                  +{currencySymbol}{(currency === 'USD' ? pricing.selectedHotel?.priceUSD : Math.round(pricing.selectedHotel?.priceUSD * 0.92)) * travelDurationNights}
                </span>
              </div>
            )}

            {/* Coupon Promo code discount */}
            {pricing.discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-400">
                <span>Promotion Code Discount</span>
                <span className="font-mono">
                  -{currencySymbol}{pricing.discountAmount}
                </span>
              </div>
            )}

            {/* Taxes / 18% VAT */}
            <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-white/5">
              <span>Tanzanian VAT & Tourism Taxes (18% Additive)</span>
              <span className="font-mono text-white">
                +{currencySymbol}{vatValue}
              </span>
            </div>

            {/* Subtotal after tax confirmation */}
            <div className="pt-2 border-t border-white/10 flex justify-between items-center font-bold text-slate-100 text-sm">
              <span>Total Chargeable Amount</span>
              <span className="font-mono text-[#D4A017]">
                {pricing.currencySymbol}{pricing.displayTotal}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Estimator Slider tool */}
      <div className="p-4.5 bg-[#D4A017]/5 border border-[#D4A017]/25 rounded-2xl space-y-3">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-[#D4A017] shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-black text-slate-200 uppercase tracking-wide">Dynamic Deposit Shield</h5>
            <p className="text-[10px] text-slate-400 leading-normal">
              Secure your Swahili reservation today by prepaying only a small corporate deposit. Pay the rest in cash or card on-arrival.
            </p>
          </div>
        </div>

        {/* Pricing split graphics */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
          <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
            <p className="text-[9px] uppercase font-bold text-slate-400">Total Price</p>
            <p className="text-sm font-black text-white font-mono mt-0.5">
              {pricing.currencySymbol}{pricing.displayTotal}
            </p>
          </div>
          <div className="bg-[#D4A017]/10 p-2 rounded-xl border border-[#D4A017]/20 text-center">
            <p className="text-[9px] uppercase font-bold text-[#D4A017]">Deposit Now</p>
            <p className="text-sm font-black text-[#D4A017] font-mono mt-0.5">
              {pricing.currencySymbol}{pricing.displayDeposit}
            </p>
          </div>
          <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
            <p className="text-[9px] uppercase font-bold text-slate-400">Due Later</p>
            <p className="text-sm font-black text-slate-300 font-mono mt-0.5">
              {pricing.currencySymbol}{pricing.displayRemaining}
            </p>
          </div>
        </div>
      </div>

      {/* Quality Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-white/5 pt-4">
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck size={12} className="text-emerald-500" /> Standardized Tariff Guard
        </span>
        <span>•</span>
        <span>TALA Licensed No. 98112-ZRT</span>
      </div>
    </div>
  );
}
