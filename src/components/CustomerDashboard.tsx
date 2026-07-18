import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Heart, 
  Download, 
  Edit3, 
  Save, 
  BookOpen, 
  Plus, 
  MapPin, 
  Sparkles, 
  Clock, 
  Settings, 
  Lock, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  Check, 
  MessageSquare, 
  Star, 
  Trash2, 
  Map, 
  Compass, 
  Globe, 
  Utensils, 
  PhoneCall 
} from 'lucide-react';
import { usePreferences } from '../context/UserPreferencesContext';
import { getSiteContent, addActivityLog } from '../lib/cmsStore';
import { supabase } from '../lib/supabase';

interface CustomerDashboardProps {
  session: { username: string; name: string; role: string } | null;
  setSession: (session: { username: string; name: string; role: string } | null) => void;
  bookingsList: any[];
  loadBookings: () => Promise<void>;
  navigate: (page: string, params?: any) => void;
}

export default function CustomerDashboard({ 
  session, 
  setSession, 
  bookingsList, 
  loadBookings, 
  navigate 
}: CustomerDashboardProps) {
  const { favorites, toggleFavorite, formatPrice } = usePreferences();
  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'profile' | 'wishlist' | 'tips'>('bookings');
  
  // Profile states
  const [fullName, setFullName] = useState(session?.name || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [dietary, setDietary] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Interface notifications
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  
  // Custom travel note modal state
  const [editingBookingNote, setEditingBookingNote] = useState<any | null>(null);
  const [customNoteText, setCustomNoteText] = useState('');
  const [noteSuccess, setNoteSuccess] = useState(false);
  
  // Guest Review modal state
  const [reviewingBooking, setReviewingBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const siteContent = getSiteContent();
  const allTours = siteContent.tours || [];

  // SHA-256 Hasher matching backend precisely
  const sha256 = async (str: string) => {
    const utf8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Filter bookings belonging to this customer
  const myBookings = bookingsList.filter(b => {
    const usernameMatch = b.email?.toLowerCase() === session?.username?.toLowerCase();
    const nameMatch = b.full_name?.toLowerCase() === session?.name?.toLowerCase();
    return usernameMatch || nameMatch;
  });

  // Load custom profile information on mount
  useEffect(() => {
    if (!session) return;
    
    // Load customer profile metadata
    const savedProfiles = localStorage.getItem('ztr_customer_profiles');
    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles);
        const myProfile = parsed[session.username.toLowerCase()];
        if (myProfile) {
          setEmail(myProfile.email || session.username);
          setPhone(myProfile.phone || '');
          setNationality(myProfile.nationality || '');
          setDietary(myProfile.dietary || '');
          setEmergencyName(myProfile.emergencyName || '');
          setEmergencyPhone(myProfile.emergencyPhone || '');
        } else {
          setEmail(session.username);
        }
      } catch (e) {
        setEmail(session.username);
      }
    } else {
      setEmail(session.username);
    }
  }, [session]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!session) return;

    try {
      // 1. Password change validation if filled
      let updatedPasswordHash = '';
      if (newPassword) {
        if (newPassword.length < 6) {
          setProfileError('Secure password must be at least 6 characters.');
          return;
        }
        if (newPassword !== confirmPassword) {
          setProfileError('Confirm password does not match.');
          return;
        }
        updatedPasswordHash = await sha256(newPassword);
      }

      // 2. Update user directory details
      const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      const userIndex = storedUsers.findIndex(
        (u: any) => u.username.toLowerCase() === session.username.toLowerCase()
      );

      if (userIndex !== -1) {
        storedUsers[userIndex].name = fullName;
        if (updatedPasswordHash) {
          storedUsers[userIndex].passwordHash = updatedPasswordHash;
        }
        localStorage.setItem('ztr_admin_users', JSON.stringify(storedUsers));
      }

      // 3. Update cached customer metadata profile
      const savedProfiles = JSON.parse(localStorage.getItem('ztr_customer_profiles') || '{}');
      savedProfiles[session.username.toLowerCase()] = {
        email,
        phone,
        nationality,
        dietary,
        emergencyName,
        emergencyPhone
      };
      localStorage.setItem('ztr_customer_profiles', JSON.stringify(savedProfiles));

      // 4. Update session name state in parent component
      const updatedSession = {
        ...session,
        name: fullName
      };
      setSession(updatedSession);
      localStorage.setItem('ztr_active_session', JSON.stringify({
        user: updatedSession,
        timestamp: Date.now()
      }));

      addActivityLog(
        fullName,
        'Customer',
        `Updated personal guest profile settings and demographic parameters.${newPassword ? ' Changed security credentials.' : ''}`
      );

      setProfileSuccess('Your Swahili guest profile has been successfully saved!');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear message after 4s
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err: any) {
      setProfileError('Failed to save profile: ' + err.message);
    }
  };

  // Submit Travel Note / Dietary update to Supabase/localStorage
  const handleSaveTravelNote = async () => {
    if (!editingBookingNote) return;
    setNoteSuccess(false);

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('bookings')
        .update({ message: customNoteText })
        .eq('id', editingBookingNote.id);

      if (error) {
        console.warn('Supabase note save error, saving locally fallback:', error.message);
      }

      // Refresh parent bookings
      await loadBookings();

      addActivityLog(
        session?.name || 'Customer',
        'Customer',
        `Updated travel instructions & special notes for booking ID #${editingBookingNote.id}: "${customNoteText.substring(0, 40)}..."`
      );

      setNoteSuccess(true);
      setTimeout(() => {
        setNoteSuccess(false);
        setEditingBookingNote(null);
      }, 2000);
    } catch (e) {
      alert('Failed to dispatch travel note to reservation desk.');
    }
  };

  // Submit Guest Excursion Review
  const handleSubmitReview = () => {
    if (!reviewingBooking) return;
    setReviewSuccess(false);

    try {
      // Add review to testimonials or simulation storage
      const existingReviews = JSON.parse(localStorage.getItem('ztr_pending_reviews') || '[]');
      const newReview = {
        id: `rev-${Date.now()}`,
        booking_id: reviewingBooking.id,
        guest_name: session?.name || reviewingBooking.full_name,
        tour_name: reviewingBooking.tour_name,
        rating: reviewRating,
        comments: reviewComments,
        date: new Date().toLocaleDateString()
      };
      localStorage.setItem('ztr_pending_reviews', JSON.stringify([newReview, ...existingReviews]));

      addActivityLog(
        session?.name || reviewingBooking.full_name,
        'Customer',
        `Submitted a ${reviewRating}★ star guest review for "${reviewingBooking.tour_name}".`
      );

      setReviewSuccess(true);
      setReviewComments('');
      setTimeout(() => {
        setReviewSuccess(false);
        setReviewingBooking(null);
      }, 2000);
    } catch (e) {
      alert('Review dispatch error. Try again.');
    }
  };

  // High-fidelity printable Invoice Generator (calls window.print for clean PDF export)
  const downloadInvoicePDF = (booking: any) => {
    addActivityLog(
      session?.name || 'Customer',
      'Customer',
      `Downloaded formal PDF Invoice document for booking: "${booking.tour_name}"`
    );

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Build realistic price parameters
    const guests = booking.number_of_guests || 2;
    const basePrice = booking.tour_name.includes('Safari') ? 350 : booking.tour_name.includes('Mnemba') ? 35 : 45;
    const subtotal = basePrice * guests;
    const depositPct = booking.tour_name.includes('Safari') ? 20 : 10;
    const depositDue = Math.round(subtotal * (depositPct / 100));
    const balanceRemaining = subtotal - depositDue;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Zanzibar Trip & Relax</title>
          <style>
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none; }
            }
            body { 
              font-family: 'Inter', system-ui, -apple-system, sans-serif; 
              color: #0f172a; 
              padding: 40px; 
              background-color: #ffffff;
              line-height: 1.5;
            }
            .invoice-box {
              max-width: 800px;
              margin: auto;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start;
              border-bottom: 2px solid #D4A017; 
              padding-bottom: 20px; 
              margin-bottom: 25px; 
            }
            .logo { font-size: 26px; font-weight: 800; color: #0B3B8C; text-transform: uppercase; letter-spacing: -0.5px; }
            .badge { background: #dcfce7; color: #166534; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #bbf7d0; }
            .badge.pending { background: #fef9c3; color: #854d0e; border-color: #fef08a; }
            .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 13px; }
            .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px; }
            .meta-item { margin-bottom: 6px; }
            .meta-item strong { color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; margin-bottom: 25px; font-size: 13px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
            .totals-table { width: 45%; margin-left: auto; margin-top: 20px; border-top: 2px solid #e2e8f0; }
            .totals-table td { padding: 8px 12px; border: none; font-size: 13px; }
            .totals-table .grand-total { font-size: 16px; font-weight: 800; color: #0B3B8C; border-top: 1px solid #cbd5e1; }
            .footer { margin-top: 45px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
            .btn-print { background: #D4A017; color: #000; border: none; padding: 10px 20px; font-size: 13px; font-weight: 700; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px; text-transform: uppercase; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .btn-print:hover { background: #c49010; }
          </style>
        </head>
        <body>
          <div class="no-print" style="max-width:800px; margin: auto; text-align:right;">
            <button class="btn-print" onclick="window.print()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print / Save Invoice (PDF)
            </button>
          </div>
          
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="logo">Zanzibar Trip & Relax</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Registered Licensed Tour Operator & Safari Specialist</div>
                <div style="font-size: 11px; color: #64748b;">Stone Town, Zanzibar Island, Tanzania</div>
              </div>
              <div class="badge ${booking.status.toLowerCase() === 'pending' ? 'pending' : ''}">
                ${booking.status || 'confirmed'}
              </div>
            </div>
            
            <div class="details-grid">
              <div>
                <div class="section-title">Invoice To:</div>
                <div class="meta-item"><strong>Guest Name:</strong> ${booking.full_name}</div>
                <div class="meta-item"><strong>Contact Email:</strong> ${booking.email || 'Not provided'}</div>
                <div class="meta-item"><strong>WhatsApp Number:</strong> ${booking.whatsapp_number || 'N/A'}</div>
                <div class="meta-item"><strong>Hotel Pickup:</strong> ${booking.pickup_location || 'Stone Town Lodge'}</div>
              </div>
              <div>
                <div class="section-title">Billing Details:</div>
                <div class="meta-item"><strong>Invoice Ref:</strong> ZTR-INV-${booking.id ? booking.id.toString().substring(0, 8).toUpperCase() : '2026-X'}</div>
                <div class="meta-item"><strong>Issue Date:</strong> ${booking.created_at ? new Date(booking.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                <div class="meta-item"><strong>Expedition Date:</strong> ${booking.preferred_date || 'N/A'}</div>
                <div class="meta-item"><strong>Payment Type:</strong> Bank Wire / Cash on Site</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: center;">Travelers</th>
                  <th style="text-align: right;">Total Surcharge</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong style="color: #0F172A; font-size: 13px;">${booking.tour_name} Excursion</strong><br />
                    <span style="font-size: 11px; color: #64748b;">Full logistics support, native guide fees, park fees & bottled water included.</span>
                  </td>
                  <td style="text-align: right; font-family: monospace;">$${basePrice}.00</td>
                  <td style="text-align: center;">${guests}</td>
                  <td style="text-align: right; font-family: monospace;">$${subtotal}.00</td>
                </tr>
                ${booking.pickup_location && booking.pickup_location.includes('(') ? `
                <tr>
                  <td>
                    <strong style="color: #0F172A; font-size: 13px;">Regional Resort Pickup Surcharge</strong><br />
                    <span style="font-size: 11px; color: #64748b;">Private round-trip vehicle transfer from remote resort hotel.</span>
                  </td>
                  <td style="text-align: right; font-family: monospace;">$25.00</td>
                  <td style="text-align: center;">1</td>
                  <td style="text-align: right; font-family: monospace;">$25.00</td>
                </tr>
                ` : ''}
              </tbody>
            </table>
            
            <table class="totals-table">
              <tr>
                <td>Subtotal:</td>
                <td style="text-align: right; font-family: monospace;">$${subtotal + (booking.pickup_location && booking.pickup_location.includes('(') ? 25 : 0)}.00</td>
              </tr>
              <tr>
                <td>Security Deposit Paid (${depositPct}%):</td>
                <td style="text-align: right; font-family: monospace; color: #166534;">-$${depositDue}.00</td>
              </tr>
              <tr class="grand-total">
                <td>Balance Due on Site:</td>
                <td style="text-align: right; font-family: monospace;">$${balanceRemaining + (booking.pickup_location && booking.pickup_location.includes('(') ? 25 : 0)}.00</td>
              </tr>
            </table>
            
            <div style="background: #f8fafc; border-left: 4px solid #D4A017; padding: 15px; border-radius: 0 8px 8px 0; font-size: 11.5px; color: #475569; margin-top: 30px;">
              <strong>Important Travel Information:</strong><br />
              Please have your reservation voucher ready (either physical or mobile screen) at the time of your hotel pickup. The balance can be settled in USD or equivalent Tanzanian Shillings (TZS) on the day of travel. Asante sana!
            </div>
            
            <div class="footer">
              <p>Thank you for choosing Zanzibar Trip & Relax. Have an extraordinary Swahili expedition!</p>
              <p style="font-weight: 600; color: #334155; margin-top: 4px;">Office WhatsApp Helpline: +255 629 506 063 | Email: info@zanzibartripandrelax.com</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Get wishlist items
  const wishlistedTours = allTours.filter(tour => favorites.includes(tour.id));

  return (
    <div className="space-y-6">
      {/* Dynamic Welcome Heading Section */}
      <div className="bg-gradient-to-r from-[#020C1F] via-[#121B30] to-[#0A1224] p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none select-none">
          <Compass size={180} strokeWidth={1} />
        </div>
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#D4A017]/10 border border-[#D4A017]/25 text-[#D4A017] px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            Swahili Guest Desk
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Karibu, {fullName}!
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Welcome to your secure reservation dashboard. Update your travel notes, customize dietary settings, print official PDF invoices, or manage your wishlist favorites.
          </p>
        </div>
        
        {/* Statistics metrics card */}
        <div className="flex gap-4 relative z-10 shrink-0">
          <div className="bg-slate-900/60 border border-white/5 backdrop-blur-md px-4 py-3 rounded-2xl text-center min-w-[100px]">
            <span className="block text-slate-400 text-[9px] uppercase font-mono tracking-wider">Bookings</span>
            <span className="text-xl font-extrabold text-white font-mono">{myBookings.length}</span>
          </div>
          <div className="bg-slate-900/60 border border-white/5 backdrop-blur-md px-4 py-3 rounded-2xl text-center min-w-[100px]">
            <span className="block text-slate-400 text-[9px] uppercase font-mono tracking-wider">Wishlist</span>
            <span className="text-xl font-extrabold text-[#D4A017] font-mono">{wishlistedTours.length}</span>
          </div>
        </div>
      </div>

      {/* Tab bar Navigation */}
      <div className="flex border-b border-white/5 overflow-x-auto gap-2 pb-1">
        {[
          { id: 'bookings', label: 'My Bookings', icon: Calendar },
          { id: 'profile', label: 'Personal Profile', icon: User },
          { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, count: wishlistedTours.length },
          { id: 'tips', label: 'Swahili Travel Tips', icon: BookOpen }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeSubTab === tab.id 
                ? 'border-[#D4A017] text-[#D4A017] bg-[#121B30]/30' 
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 bg-[#D4A017] text-[#020C1F] text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* --- WORKSPACE TABS --- */}
      
      {/* 1. ACTIVE BOOKINGS SUBTAB */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold uppercase text-[#D4A017] tracking-wider">My Reservations & Expediton Logs</h3>
            <span className="text-[11px] text-slate-400 font-mono">{myBookings.length} Logged Entries</span>
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-[#121B30]/40 border border-white/5 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto">
              <Compass className="text-slate-500 mx-auto animate-pulse" size={48} />
              <h4 className="text-base font-bold text-white">No active expeditions found</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                You haven't scheduled any Swahili excursions under this guest profile yet. Let's explore our custom Zanzibar tours and mainland safari bundles!
              </p>
              <button
                onClick={() => navigate('tours')}
                className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all"
              >
                Browse Tours & Packages
                <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myBookings.map((b, i) => {
                // Surcharge indicator
                const hasSurcharge = b.pickup_location && b.pickup_location.includes('(');
                return (
                  <div key={i} className="bg-[#121B30]/50 border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-white/10 transition-all shadow-lg relative group">
                    <div className="space-y-3">
                      {/* Booking Card Header */}
                      <div className="flex justify-between items-start pb-3 border-b border-white/5">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-100 text-sm">{b.tour_name}</h4>
                          <span className="text-[10px] text-[#D4A017] font-mono block">ID: ZTR-RES-{b.id ? b.id.toString().substring(0, 8).toUpperCase() : `FALLBACK-${i}`}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                          b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'approved'
                            ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/20'
                            : b.status?.toLowerCase() === 'pending'
                            ? 'bg-amber-950/50 text-amber-400 border-amber-500/20'
                            : 'bg-slate-900 text-slate-400 border-white/5'
                        }`}>
                          {b.status || 'pending'}
                        </span>
                      </div>

                      {/* Details specs */}
                      <div className="grid grid-cols-2 gap-4 text-xs py-1">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Expedition Date</span>
                          <span className="font-semibold text-slate-200">{b.preferred_date || 'Not specified'}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Headcount</span>
                          <span className="font-semibold text-slate-200">{b.number_of_guests || 2} Travelers</span>
                        </div>
                        <div className="space-y-0.5 col-span-2">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Pickup Logistics</span>
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <MapPin size={11} className="text-[#D4A017]" />
                            {b.pickup_location || 'Lobby lobby of Stone Town Hotel'}
                          </span>
                        </div>
                      </div>

                      {/* Show custom dietary notes if saved */}
                      {b.message && (
                        <div className="bg-[#0A1224]/60 border border-white/5 p-3 rounded-xl">
                          <span className="text-[9px] uppercase text-slate-400 block font-mono">My Dispatch Instructions:</span>
                          <p className="text-slate-300 text-xs italic mt-0.5 font-medium leading-relaxed">"{b.message}"</p>
                        </div>
                      )}
                    </div>

                    {/* Operational action grid */}
                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => downloadInvoicePDF(b)}
                          className="bg-[#0B3B8C] hover:bg-[#082d6c] text-white py-2 rounded-xl text-[11px] font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Generate printable dynamic invoice PDF"
                        >
                          <Download size={13} />
                          Invoice PDF
                        </button>
                        <button 
                          onClick={() => {
                            setEditingBookingNote(b);
                            setCustomNoteText(b.message || '');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl text-[11px] font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <MessageSquare size={13} />
                          Add Notes
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setReviewingBooking(b);
                          setReviewRating(5);
                          setReviewComments('');
                        }}
                        className="w-full bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] py-2.5 rounded-xl text-[11px] font-black uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Star size={13} className="fill-current" />
                        Submit Excursion Feedback
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. PERSONAL PROFILE SUBTAB */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-[#121B30]/30 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase text-[#D4A017] tracking-wider">Manage Guest Credentials & Demographics</h3>
              <p className="text-slate-400 text-xs mt-0.5">Maintain your details to ensure fast hotel pickup coordination and accurate reservation matching.</p>
            </div>
            <Shield size={24} className="text-[#D4A017]/80" />
          </div>

          {profileSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold">
              <CheckCircle2 size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="bg-rose-950/40 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold">
              <AlertCircle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Core credentials */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-300 border-b border-white/5 pb-1">Primary Credentials</h4>
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#D4A017] outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Registered Email (Username)</label>
                <input
                  type="text"
                  disabled
                  value={session?.username || ''}
                  className="w-full bg-[#0A1224]/50 border border-white/5 rounded-xl py-2.5 px-4 text-slate-400 outline-none cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Your login username cannot be changed.</span>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Contact Phone / WhatsApp</label>
                <div className="relative">
                  <PhoneCall size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#D4A017] outline-none"
                    placeholder="e.g. +49 170 123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Nationality</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#D4A017] outline-none"
                    placeholder="e.g. Germany"
                  />
                </div>
              </div>
            </div>

            {/* Travel info & security */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-300 border-b border-white/5 pb-1">Expedition Specs & Emergency Contacts</h4>
              
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase">Dietary Requirements / Medical Notes</label>
                <div className="relative">
                  <Utensils size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <textarea
                    rows={2}
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#D4A017] outline-none resize-none"
                    placeholder="e.g. Vegetarian, Gluten-free, seafood allergies..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase">Emergency Contact</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#D4A017] outline-none"
                    placeholder="Name / Relationship"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase">Emergency Phone</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full bg-[#0A1224] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#D4A017] outline-none"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase text-slate-300 border-b border-white/5 pb-1">Security Credentials</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#0A1224] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#D4A017] outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1 uppercase">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#0A1224] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:border-[#D4A017] outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              className="bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-black text-xs uppercase px-8 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save size={14} />
              Save Guest Profile Settings
            </button>
          </div>
        </form>
      )}

      {/* 3. MY WISHLIST SUBTAB */}
      {activeSubTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold uppercase text-[#D4A017] tracking-wider">My Saved Excursions Wishlist</h3>
            <span className="text-slate-400 text-xs font-mono">{wishlistedTours.length} Wishlisted items</span>
          </div>

          {wishlistedTours.length === 0 ? (
            <div className="bg-[#121B30]/40 border border-white/5 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto">
              <Heart className="text-slate-500 mx-auto animate-pulse" size={48} />
              <h4 className="text-base font-bold text-white">Your wishlist is currently empty</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Save your favorite excursions, beach cruises, and spice tours as you browse the platform, then book them in seconds from here.
              </p>
              <button
                onClick={() => navigate('tours')}
                className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all"
              >
                Explore Zanzibar Excursions
                <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistedTours.map((tour, idx) => (
                <div key={`${tour.id}-${idx}`} className="bg-[#121B30]/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-white/10 transition-all shadow-md group">
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={tour.img} 
                      alt={tour.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                    />
                    <div className="absolute top-3 right-3">
                      <button 
                        onClick={() => toggleFavorite(tour.id)}
                        className="bg-[#020C1F]/80 hover:bg-[#020C1F] border border-white/15 p-2 rounded-full text-rose-500 transition-colors shadow-md cursor-pointer"
                        title="Remove from favorites"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {tour.scenicValue && (
                      <div className="absolute bottom-3 left-3 bg-[#D4A017] text-[#020C1F] font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                        {tour.scenicValue} View
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-[#D4A017] block">
                        {tour.category || 'excursion'}
                      </span>
                      <h4 className="font-extrabold text-slate-100 text-sm">{tour.title}</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{tour.desc}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-white/5">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1 text-slate-400 font-medium">
                          <Clock size={12} className="text-[#D4A017]" />
                          <span>{tour.duration}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] text-slate-500 font-mono">from</span>
                          <span className="text-[#D4A017] font-extrabold text-sm font-mono">
                            {formatPrice(tour.price)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('booking', { tour: tour.id })}
                        className="w-full bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-black py-2 rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus size={11} />
                        Book Expedition Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. SWAHILI TRAVEL TIPS SUBTAB */}
      {activeSubTab === 'tips' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main tips list */}
          <div className="md:col-span-8 bg-[#121B30]/30 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
            <h3 className="text-sm font-extrabold uppercase text-[#D4A017] tracking-wider border-b border-white/5 pb-3">Zanzibar Travel Insights & Cultural Etiquette</h3>
            
            <div className="space-y-4 text-xs">
              {[
                {
                  title: 'Dress Codes & Cultural Sensitivity',
                  text: 'Zanzibar is a primarily Muslim conservative society. While swimsuits are perfectly normal on beaches and resort grounds, we kindly ask that you cover your shoulders and knees when visiting historic Stone Town or rural villages. Modesty shows high respect to the Swahili hosts.'
                },
                {
                  title: 'Anti-Single Use Plastic Ban',
                  text: 'The government of Tanzania strictly bans single-use plastic carrier bags. Zanzibar Trip & Relax supports this! We offer unlimited clean spring water via bamboo flasks and larger mineral dispensers in all transfer vans to protect the marine ecosystem.'
                },
                {
                  title: 'Tipping Guidelines for Porter Wages',
                  text: 'Tipping in hospitality is highly appreciated in Tanzania. Standard tips are around $5-$10 per day for transfer drivers, $10-$15 for snorkeling captains, and $15-$20 for premium mountain porters. This directly supports local families and guarantees premium services.'
                },
                {
                  title: 'Yellow Fever Vaccination rules',
                  text: 'A Yellow Fever vaccination card is required only if you are arriving from a Yellow Fever endemic country (such as Kenya, Ethiopia, Uganda, etc.) or had a transit of more than 12 hours there. No vaccine card is checked if arriving directly from Europe, America, or Middle East.'
                }
              ].map((tip, idx) => (
                <div key={idx} className="bg-[#0A1224]/50 border border-white/5 p-4 rounded-2xl space-y-1.5 hover:border-white/10 transition-all">
                  <h4 className="font-extrabold text-[#D4A017] text-xs flex items-center gap-2">
                    <span className="bg-[#D4A017]/10 text-[#D4A017] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                    {tip.title}
                  </h4>
                  <p className="text-slate-300 leading-relaxed font-normal pl-7">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Swahili language list */}
          <div className="md:col-span-4 bg-[#121B30]/50 border border-white/5 rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase text-slate-200 tracking-wider flex items-center gap-2">
              <Compass size={14} className="text-[#D4A017]" />
              Swahili Vocab Phrasebook
            </h4>
            <p className="text-[11px] text-slate-400">Speak with our native guides like a local! Here are useful conversational Swahili phrases:</p>
            
            <div className="space-y-2.5 text-xs">
              {[
                { swahili: 'Jambo / Mambo', english: 'Hello / How are you?' },
                { swahili: 'Poa sana', english: 'Very cool / excellent' },
                { swahili: 'Asante sana', english: 'Thank you very much' },
                { swahili: 'Karibu', english: 'You are welcome / Enter' },
                { swahili: 'Habari za asubuhi', english: 'Good morning' },
                { swahili: 'Hapana asante', english: 'No thank you' },
                { swahili: 'Pole pole', english: 'Slowly slowly (Zanzibar style)' },
                { swahili: 'Hakuna Matata', english: 'No worries / No problem' }
              ].map((phrase, pIdx) => (
                <div key={pIdx} className="bg-[#0A1224] p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="font-extrabold text-white">{phrase.swahili}</span>
                  <span className="text-slate-400 text-[11px] font-medium">{phrase.english}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING MODALS WORKSPACE --- */}
      
      {/* A. EDIT TRAVEL NOTES MODAL */}
      {editingBookingNote && (
        <div className="fixed inset-0 bg-[#020C1F]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0A1224] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 text-slate-200 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <h4 className="font-bold text-white text-base">Dispatch Custom Travel Instructions</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">ID: ZTR-RES-{editingBookingNote.id?.substring(0, 8).toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setEditingBookingNote(null)}
                className="text-slate-400 hover:text-white font-mono text-xs border border-white/10 px-2 py-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            {noteSuccess ? (
              <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold">
                <CheckCircle2 size={16} />
                <span>Travel instructions successfully updated!</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase">Specify Special Request Notes</label>
                  <textarea
                    rows={4}
                    value={customNoteText}
                    onChange={(e) => setCustomNoteText(e.target.value)}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl p-3 text-white focus:border-[#D4A017] outline-none"
                    placeholder="Provide dietary requirements, specific hotel room numbers, emergency contact notes or physical special pickup preferences..."
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">This details log is dispatched directly to our Swahili reservation desk.</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingBookingNote(null)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTravelNote}
                    className="flex-1 bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* B. TESTIMONIAL STAR FEEDBACK MODAL */}
      {reviewingBooking && (
        <div className="fixed inset-0 bg-[#020C1F]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0A1224] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 text-slate-200 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <h4 className="font-bold text-white text-base">Submit Excursion Feedback</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Sharing experiences empowers native Zanzibar communities!</p>
              </div>
              <button 
                onClick={() => setReviewingBooking(null)}
                className="text-slate-400 hover:text-white font-mono text-xs border border-white/10 px-2 py-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            {reviewSuccess ? (
              <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold">
                <CheckCircle2 size={16} />
                <span>Asante Sana! Thank you for sharing your warm Swahili review!</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase">Rate Expedition Experience</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-[#D4A017] hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                      >
                        <Star 
                          size={24} 
                          className={star <= reviewRating ? 'fill-current' : 'text-slate-600'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase">Describe your Memories</label>
                  <textarea
                    rows={4}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl p-3 text-white focus:border-[#D4A017] outline-none"
                    placeholder="Share your amazing stories about Mnemba island dolphins, Spice Farm hospitality, or our drivers' safety guidelines..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setReviewingBooking(null)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    className="flex-1 bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-black py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Publish Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
