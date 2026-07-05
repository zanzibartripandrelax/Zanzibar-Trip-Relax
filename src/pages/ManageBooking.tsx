import React, { useState, useEffect } from 'react';
import { Search, Mail, FileText, CheckCircle2, MessageCircle, AlertCircle, RefreshCw, CreditCard, ShieldCheck, Clock } from 'lucide-react';
import { Page } from '../hooks/useHashRouter';
import { supabase } from '../lib/supabase';
import { addActivityLog } from '../lib/cmsStore';
import { useAnalytics } from '../context/AnalyticsContext';
import {
  generateBookingPDF,
  generateReceiptPDF,
  generateInvoicePDF,
  generateItineraryPDF,
  generatePackingListPDF
} from '../lib/pdfGenerator';

interface ManageBookingProps {
  navigate: (page: Page) => void;
}

export default function ManageBooking({ navigate }: ManageBookingProps) {
  const { trackWhatsAppClick } = useAnalytics();
  const [bookingId, setBookingId] = useState('');
  const [email, setEmail] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'success' | 'not_found' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [booking, setBooking] = useState<any | null>(null);

  // Remaining balance payment state
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [payMethod, setPayMethod] = useState<'card' | 'paypal'>('card');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Auto-search if credentials are provided in query string parameters
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const queryString = hash.split('?')[1];
      const params = new URLSearchParams(queryString);
      const refParam = params.get('id') || params.get('ref') || '';
      const emailParam = params.get('email') || '';
      
      if (refParam) {
        setBookingId(refParam);
      }
      if (emailParam) {
        setEmail(emailParam);
      }
      
      if (refParam && emailParam) {
        handleVerifyAndSearch(undefined, refParam, emailParam);
      }
    }
  }, []);

  // Handle retrieval of single booking by ID and Email
  const handleVerifyAndSearch = async (e?: React.FormEvent, overrideId?: string, overrideEmail?: string) => {
    e?.preventDefault();
    const finalId = (overrideId || bookingId).trim();
    const finalEmail = (overrideEmail || email).trim();

    if (!finalId || !finalEmail) {
      setSearchStatus('error');
      setErrorMsg('Please supply both your Booking Reference Code and Email address.');
      return;
    }

    setSearchStatus('loading');
    setErrorMsg('');
    setBooking(null);

    const checkId = finalId.toUpperCase();
    const checkEmail = finalEmail.toLowerCase();

    try {
      // 1. Search in Supabase first
      const { data, error } = await supabase
        .from('bookings')
        .select('*');

      let foundBooking: any = null;

      if (!error && data) {
        // Look for booking matching email and reference code or database ID
        foundBooking = data.find(b => {
          const dbEmail = (b.email || '').trim().toLowerCase();
          const matchMsg = (b.message || '').toUpperCase();
          const matchEmail = dbEmail === checkEmail;
          const matchId = b.id === checkId || (b.id && b.id.toString() === checkId);
          const matchRef = matchMsg.includes(checkId) || checkId.includes(b.id || 'N/A');
          return matchEmail && (matchId || matchRef);
        });
      }

      // 2. Local Fallback check if not found in Supabase (or offline mode)
      if (!foundBooking) {
        const local = localStorage.getItem('ztr_local_bookings_backup');
        if (local) {
          const list = JSON.parse(local);
          foundBooking = list.find((b: any) => {
            const bEmail = (b.email || '').trim().toLowerCase();
            const bRef = (b.reference || b.id || '').toUpperCase();
            return bEmail === checkEmail && bRef === checkId;
          });
        }
      }

      if (foundBooking) {
        // Construct detailed state
        const isPaid = foundBooking.message?.includes('100% Fully Prepaid') || foundBooking.status?.toLowerCase() === 'paid';
        const isDeposit = foundBooking.message?.includes('20% Security Deposit') || foundBooking.message?.toLowerCase().includes('deposit');

        // Parse prices from text or defaults safely
        const totalRaw = foundBooking.message?.match(/Total Price:? \$?(\d+)/i) || foundBooking.message?.match(/\$?(\d+)/) || [null, '150'];
        const totalVal = Math.max(80, parseInt(totalRaw[1] || '150'));
        const depositVal = isPaid ? totalVal : (isDeposit ? Math.round(totalVal * 0.2) : 0);
        const remainingVal = Math.max(0, totalVal - depositVal);

        const bookingDetails = {
          reference: foundBooking.reference || foundBooking.id || 'ZTR-CONFIRMED',
          id: foundBooking.id,
          full_name: foundBooking.full_name,
          email: foundBooking.email,
          whatsapp_number: foundBooking.whatsapp_number,
          tour_name: foundBooking.tour_name || 'Adventure Excursion Extraordinaire',
          preferred_date: foundBooking.preferred_date,
          pickup_location: foundBooking.pickup_location,
          status: foundBooking.status || 'pending',
          message: foundBooking.message,
          created_at: foundBooking.created_at,
          // Financial structures
          total_price: totalVal,
          deposit_paid: depositVal,
          remaining_balance: remainingVal,
          payment_status: remainingVal === 0 ? 'fully_paid' : (depositVal > 0 ? 'deposit_paid' : 'unpaid'),
        };

        setBooking(bookingDetails);
        setSearchStatus('success');
      } else {
        setSearchStatus('not_found');
      }
    } catch (err: any) {
      console.error(err);
      setSearchStatus('error');
      setErrorMsg(err.message || 'Verifying credentials failed. Please check your internet connection.');
    }
  };

  // Remaining balance payment handler
  const handlePayRemaining = () => {
    if (payMethod === 'card' && (!cardNo || !cardExpiry || !cardCvc)) {
      alert('Card verification failed: Please supplement correct placeholder credential values.');
      return;
    }

    setPaymentState('processing');

    setTimeout(async () => {
      try {
        const nextStatus = 'paid';
        const updatedMsg = `${booking.message}\n[Settle Action]: Outstanding balance fully settled on ${new Date().toLocaleDateString()}`;
        
        // Update in Supabase
        if (booking.id) {
          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              message: updatedMsg
            })
            .eq('id', booking.id);
        }

        // Update in Local Storage back-up too
        const local = localStorage.getItem('ztr_local_bookings_backup');
        if (local) {
          const list = JSON.parse(local);
          const idx = list.findIndex((b: any) => (b.reference || b.id || '') === booking.reference);
          if (idx !== -1) {
            list[idx].status = 'confirmed';
            list[idx].message = updatedMsg;
            localStorage.setItem('ztr_local_bookings_backup', JSON.stringify(list));
          }
        }

        // Add Activity Audit 로그
        addActivityLog(
          'Booking Settle Service',
          'Guest',
          `Outstanding balance of $${booking.remaining_balance} settled for booking: ${booking.reference}`,
          `Balance remaining: $${booking.remaining_balance}`,
          'Fully Settled 100%'
        );

        setBooking((prev: any) => ({
          ...prev,
          deposit_paid: prev.total_price,
          remaining_balance: 0,
          payment_status: 'fully_paid',
        }));

        setPaymentState('success');
      } catch (e) {
        console.error(e);
        setPaymentState('error');
      }
    }, 2000);
  };

  const hasRemainingBalance = booking && booking.remaining_balance > 0;
  const isFullyPaid = booking && booking.payment_status === 'fully_paid';

  // Specific PDF Triggers
  const triggerVoucher = () => {
    const pricingObj = {
      currencySymbol: '$',
      displayTotal: booking.total_price,
      displayDeposit: booking.deposit_paid,
      displayRemaining: booking.remaining_balance,
      hasHotel: booking.message?.includes('Hotel:')
    };
    generateBookingPDF(booking, pricingObj);
  };

  const triggerReceipt = () => {
    if (!isFullyPaid && booking.payment_status === 'unpaid') {
      alert('Official receipt is restricted before successful online payment authorization settles.');
      return;
    }
    const paymentObj = {
      transactionId: booking.id || 'TX-' + Math.floor(Math.random() * 100000),
      method: 'Online Card Verification Seal',
      gatewayId: booking.reference + '-ONLINE-REF',
      amount: booking.deposit_paid,
      currencySymbol: '$',
      date: new Date().toLocaleDateString(),
      balanceRemaining: booking.remaining_balance
    };
    generateReceiptPDF(booking, paymentObj);
  };

  const triggerInvoice = () => {
    const pricingObj = {
      currencySymbol: '$',
      displayTotal: booking.total_price,
      displayDeposit: booking.deposit_paid,
      displayRemaining: booking.remaining_balance,
    };
    generateInvoicePDF(booking, pricingObj);
  };

  const triggerItinerary = () => {
    const defaultTimeline = {
      title: booking.tour_name,
      duration: 'Safari / Tour Sequence',
      price: `$${booking.total_price}`,
      destinations: booking.pickup_location,
      summary: `Dedicated itinerary catalog provided to lead guest ${booking.full_name}`,
      itinerary: [
        { day: 1, title: 'Hotel Point Pickup & Welcome', desc: 'Secure transit picks you up from Zanzibar resort. Introduction package and briefing supplied.' },
        { day: 2, title: 'Expedition Tour Adventure', desc: `Venture directly for customized sightseeing options within: ${booking.tour_name}.` },
        { day: 3, title: 'Return Transfer Lounge', desc: 'Relaxing, final ocean highlights, beach dips before our chauffeur escorts you back safely.' }
      ],
      whatToBring: [
        'Sunhat, reef protective body lotions',
        'Swimming gears & cash tips for guides.'
      ]
    };
    generateItineraryPDF(defaultTimeline);
  };

  const triggerPacking = () => {
    generatePackingListPDF();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Banner */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1600')" }} 
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Manage My Booking
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Locate your luxury Swahili excursions, make payments, and download certified offline PDF documents.
          </p>
        </div>
      </section>

      {/* Main workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT PANEL: Login credentials lookup */}
          <div className="lg:col-span-5 bg-white p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6 self-start">
            <h2 className="text-2xl font-bold text-[#0B3B8C]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Locate Reservation
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Input your unique Booking Reference Code (e.g., <span className="font-semibold text-emerald-600">ZTR-2026-X819</span>) and guest email address to authenticate.
            </p>

            <form onSubmit={handleVerifyAndSearch} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Booking Reference Code</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. ZTR-2026-X819"
                    value={bookingId}
                    onChange={e => setBookingId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-[#0B3B8C] font-mono tracking-widest font-bold uppercase transition-all"
                  />
                  <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="guest@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-[#0B3B8C] transition-all"
                  />
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                </div>
              </div>

              {searchStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-start gap-2 text-xs">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {searchStatus === 'not_found' && (
                <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl flex items-start gap-2.5 text-xs inline-block">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-bold">Reservation Not Found</p>
                    <p className="text-[11px] text-amber-700 leading-normal mt-0.5">
                      Double check code/email credentials. If verified, check your network or contact Zanzibar staff to confirm your sync state.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={searchStatus === 'loading'}
                className="w-full bg-[#0B3B8C] hover:bg-[#072559] text-white py-3 px-6 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
              >
                {searchStatus === 'loading' && <RefreshCw className="animate-spin" size={14} />}
                <span>Retrieve Booking Summary</span>
              </button>
            </form>
          </div>

          {/* RIGHT PANEL: Info Workspace, PDF downloads, Settle remaining balance */}
          <div className="lg:col-span-7 space-y-6">
            {searchStatus === 'success' && booking ? (
              <div className="space-y-6">
                
                {/* 1. Header and State block */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 border-gray-100">
                    <div>
                      <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-widest font-mono">certified swahili trip summary</span>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight mt-0.5">{booking.tour_name}</h3>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">Reference ID: <span className="text-gray-700 font-bold">{booking.reference}</span></p>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${
                      booking.status === 'confirmed' || booking.status === 'approved' || booking.status === 'paid'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {booking.status === 'confirmed' || booking.status === 'approved' || booking.status === 'paid' ? 'Confirmed & Secured' : 'Awaiting Settlement'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-gray-600 pb-2">
                    <div className="space-y-2">
                      <p><span className="text-gray-400 font-medium">Lead Guest Name:</span> <strong className="text-gray-800">{booking.full_name}</strong></p>
                      <p><span className="text-gray-400 font-medium font-medium">Email Registered:</span> <strong className="text-gray-800">{booking.email || 'N/A'}</strong></p>
                      <p><span className="text-gray-400 font-medium font-medium font-medium">WhatsApp Number:</span> <strong className="font-mono text-gray-800">{booking.whatsapp_number}</strong></p>
                    </div>
                    <div className="space-y-2">
                      <p><span className="text-gray-400 font-medium">Expedition Date:</span> <strong className="text-gray-900">{booking.preferred_date}</strong></p>
                      <p><span className="text-gray-400 font-medium">Pickup Point:</span> <strong className="text-gray-800 truncate block max-w-[200px]">{booking.pickup_location}</strong></p>
                      <p><span className="text-gray-400 font-medium">Party Size:</span> <strong className="text-gray-800">{booking.number_of_guests} traveler(s)</strong></p>
                    </div>
                  </div>

                  {/* Financials overview bar */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-gray-400">total price</p>
                      <p className="text-lg font-bold text-[#0B3B8C]">${booking.total_price}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-gray-400">amount paid</p>
                      <p className="text-lg font-bold text-emerald-600">${booking.deposit_paid}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-gray-400">balance due</p>
                      <p className={`text-lg font-bold ${hasRemainingBalance ? 'text-amber-600 animate-pulse' : 'text-emerald-700'}`}>
                        ${booking.remaining_balance}
                      </p>
                    </div>
                  </div>

                  {/* Prominent Download PDF button */}
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      id="btn-download-reservation-pdf"
                      type="button"
                      onClick={triggerVoucher}
                      className="w-full bg-[#0B3B8C] hover:bg-[#072559] active:scale-98 text-white py-3 px-6 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-sans"
                    >
                      <FileText size={16} className="text-[#D4A017]" />
                      <span>Download PDF Reservation Details</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Status Timeline Tracker */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-5">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <Clock size={16} className="text-[#D4A017]" />
                      <span>Expedition Status Timeline Tracker</span>
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">Track your live holiday preparations and scheduling checkpoints in real-time.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2 select-none">
                    {[
                      { label: 'Booking Received', checked: true, desc: 'Logged on secure servers' },
                      { label: 'Deposit Paid', checked: booking.deposit_paid > 0 || booking.payment_status === 'fully_paid', desc: 'Secure escrow clearance' },
                      { label: 'Booking Confirmed', checked: booking.status === 'confirmed' || booking.status === 'approved' || booking.status === 'paid', desc: 'Resort spots locked' },
                      { label: 'Pickup Time Assigned', checked: booking.status === 'confirmed' || booking.status === 'approved' || booking.status === 'paid', desc: 'Route assigned' },
                      { label: 'Tour Ready', checked: booking.status === 'confirmed' || booking.status === 'approved' || booking.status === 'paid', desc: 'Guides & gear prepared' },
                      { label: 'Tour Completed', checked: (() => {
                          try {
                            const dateStr = booking.preferred_date.includes(' to ') ? booking.preferred_date.split(' to ')[0] : booking.preferred_date;
                            return new Date(dateStr).getTime() < Date.now();
                          } catch {
                            return false;
                          }
                        })(), desc: 'Memories created' }
                    ].map((step, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all text-center ${
                          step.checked 
                            ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-800 font-bold' 
                            : 'bg-gray-50/50 border-gray-150 text-gray-400 font-medium'
                        }`}
                      >
                        <div className="flex justify-center">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                            step.checked 
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' 
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            {step.checked ? '✓' : idx + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-black text-[10.5px] leading-tight tracking-tight">{step.label}</p>
                          <p className={`text-[9px] mt-0.5 leading-normal ${step.checked ? 'text-emerald-600/75' : 'text-gray-400'}`}>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Settle Remaining Balance Area */}
                {hasRemainingBalance && (
                  <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-[#D4A017]/30 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Settle Outstanding Balance</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Authorize card transfer to secure 100% full-paid status online</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        Pending: ${booking.remaining_balance}
                      </span>
                    </div>

                    {paymentState === 'processing' ? (
                      <div className="text-center py-6 space-y-2.5">
                        <RefreshCw className="animate-spin text-[#0B3B8C] mx-auto" size={24} />
                        <p className="text-xs font-bold text-gray-700">Authorizing secure SSL connection...</p>
                        <p className="text-[10px] text-gray-400">Merchant gateway links: routing sandbox authorization</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setPayMethod('card')}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${payMethod === 'card' ? 'border-[#0B3B8C] bg-blue-50/20 text-[#0B3B8C]' : 'border-gray-200 text-gray-400 bg-white'}`}
                          >
                            💳 Credit Card
                          </button>
                          <button
                            type="button"
                            onClick={() => setPayMethod('paypal')}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${payMethod === 'paypal' ? 'border-[#0B3B8C] bg-blue-50/20 text-[#0B3B8C]' : 'border-gray-200 text-gray-400 bg-white'}`}
                          >
                            🅿️ PayPal Sandbox
                          </button>
                        </div>

                        {payMethod === 'card' ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Card Number</label>
                              <input
                                type="text"
                                placeholder="4111 2222 3333 4444"
                                value={cardNo}
                                onChange={e => setCardNo(e.target.value.replace(/\D/g, '').substring(0, 16))}
                                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-[#0B3B8C] font-mono"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2">
                                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">Expiration</label>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={e => setCardExpiry(e.target.value.substring(0, 5))}
                                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-[#0B3B8C] font-mono text-center"
                                />
                              </div>
                              <div className="col-span-1">
                                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-0.5">CVC</label>
                                <input
                                  type="password"
                                  placeholder="***"
                                  value={cardCvc}
                                  onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-[#0B3B8C] font-mono text-center animate-none"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handlePayRemaining}
                              className="w-full bg-[#0B3B8C] hover:bg-[#072558] text-white font-bold py-3 rounded-xl text-xs transition-all shadow cursor-pointer uppercase tracking-wider animate-pulse mt-1"
                            >
                              Pay Remaining Balance (${booking.remaining_balance})
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-4 space-y-3 bg-gray-50/40 rounded-2xl border border-gray-150">
                            <p className="text-[11px] text-gray-500 font-semibold leading-normal">Authenticate secure paypal sandbox transaction to auto-pay balance.</p>
                            <button
                              type="button"
                              onClick={handlePayRemaining}
                              className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-6 py-2.5 rounded-full text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 shadow"
                            >
                              💛 Settle with PayPal Sandbox
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Document Downloads Section (Required by Rule 9) */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Download Verified PDF Documents</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Certified receipts, traveler vouchers, invoices, and itineraries.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={triggerVoucher}
                      className="p-3 bg-gray-50 hover:bg-[#0B3B8C] hover:text-white border border-gray-200 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <FileText size={16} className="text-gray-400 shrink-0 select-none hover:text-white" />
                        <div>
                          <p className="font-bold">Booking Confirmation</p>
                          <p className="text-[9px] text-gray-400">Dynamic voucher check</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded uppercase">Voucher</span>
                    </button>

                    <button
                      type="button"
                      onClick={triggerInvoice}
                      className="p-3 bg-gray-50 hover:bg-[#0B3B8C] hover:text-white border border-gray-200 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <FileText size={16} className="text-gray-400 shrink-0 select-none" />
                        <div>
                          <p className="font-bold">Official Invoice</p>
                          <p className="text-[9px] text-gray-400">Statement of Account</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded uppercase">Invoice</span>
                    </button>

                    <button
                      type="button"
                      disabled={booking.payment_status === 'unpaid'}
                      onClick={triggerReceipt}
                      className="p-3 bg-gray-50 hover:bg-[#0B3B8C] hover:text-white border border-gray-200 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs disabled:opacity-40 disabled:hover:bg-gray-50 disabled:hover:text-inherit"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <FileText size={16} className="text-gray-400 shrink-0 select-none" />
                        <div>
                          <p className="font-bold">Official Receipt</p>
                          <p className="text-[9px] text-gray-400">{booking.payment_status === 'unpaid' ? 'Locked (Requires payment)' : 'Settle transaction check'}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded uppercase">Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={triggerItinerary}
                      className="p-3 bg-gray-50 hover:bg-[#0B3B8C] hover:text-white border border-gray-200 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <FileText size={16} className="text-gray-400 shrink-0 select-none" />
                        <div>
                          <p className="font-bold">Tour Itinerary</p>
                          <p className="text-[9px] text-gray-400">Destination schedule</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded uppercase">Itinerary</span>
                    </button>

                    <button
                      type="button"
                      onClick={triggerPacking}
                      className="p-3 bg-gray-50 hover:bg-[#0B3B8C] hover:text-white border border-gray-200 rounded-xl flex items-center justify-between transition-all cursor-pointer text-xs sm:col-span-2"
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <FileText size={16} className="text-gray-400 shrink-0 select-none" />
                        <div>
                          <p className="font-bold">Equipment & Packing List</p>
                          <p className="text-[9px] text-gray-400">Prep specs for Safaris and Kilimanjaro climbing</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded uppercase">Packing</span>
                    </button>
                  </div>
                </div>

                {/* 4. Support Helpline and WhatsApp */}
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-800">Support Representative Liaison</p>
                    <p className="text-[11px] text-emerald-700/90 leading-normal max-w-md">
                      Required any customized alterations or help with airport transfers? Our Swahili coordinators are ready 24/7 on WhatsApp.
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/255629506063?text=${encodeURIComponent(
                      `Hello Zanzibar Trip & Relax. I am reviewing my Booking ID: ${booking.reference}. Please help confirm some aspects of my Swahili itinerary.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick('Manage Booking Detail', booking.reference)}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold px-4 py-2.5 rounded-full shadow-sm text-xs cursor-pointer select-none"
                  >
                    <MessageCircle size={15} fill="white" />
                    <span>WhatsApp Concierge</span>
                  </a>
                </div>

              </div>
            ) : (
              // Empty/waiting view
              <div className="h-full min-h-[400px] border border-dashed border-gray-250 rounded-3xl flex flex-col items-center justify-center p-8 bg-white text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 text-[#0B3B8C] rounded-full flex items-center justify-center">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Verify & Unlock My Workspace</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                    Once you provide your matching Booking ID and email credentials, this secure workspace reveals live tracking statuses, receipt gateways, and printable offline holiday documents.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
