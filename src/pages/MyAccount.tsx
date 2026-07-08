import React, { useState, useEffect } from 'react';
import { Page } from '../hooks/useHashRouter';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Lock, Mail, Phone, Globe, ShieldAlert, CheckCircle2, 
  Sparkles, KeyRound, Compass, CreditCard, Calendar, LogOut,
  MapPin, Heart, HelpCircle, Bell, ArrowRight, Eye, EyeOff,
  Cloud, Sun, Download, FileText, Send, Check
} from 'lucide-react';
import { addActivityLog } from '../lib/cmsStore';
import { getSmtpConfig, dispatchAutomatedEmail, getEmailLogs } from '../lib/emailService';

interface MyAccountProps {
  navigate: (page: Page, params?: string) => void;
}

export default function MyAccount({ navigate }: MyAccountProps) {
  // Query parameter hooks
  const [queryToken, setQueryToken] = useState<string | null>(null);
  const [queryEmail, setQueryEmail] = useState<string | null>(null);
  const [queryResetToken, setQueryResetToken] = useState<string | null>(null);

  // Parse URL query params
  useEffect(() => {
    const handleQueryParams = () => {
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const queryStr = hash.split('?')[1];
        const params = new URLSearchParams(queryStr);
        const vToken = params.get('verify_token');
        const email = params.get('email');
        const rToken = params.get('reset_token');
        if (vToken) setQueryToken(vToken);
        if (email) setQueryEmail(email);
        if (rToken) setQueryResetToken(rToken);
      }
    };
    handleQueryParams();
    window.addEventListener('hashchange', handleQueryParams);
    return () => window.removeEventListener('hashchange', handleQueryParams);
  }, []);

  // System states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'payments' | 'trips' | 'profile' | 'wishlist' | 'support' | 'notifications'>('dashboard');
  const [session, setSession] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'forgot' | 'reset-password' | 'verified-notice'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Register State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('United States');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Reset Password State
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Local state datasets
  const [bookings, setBookings] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // Profile Edit State
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCountry, setProfileCountry] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passChangeError, setPassChangeError] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState('');

  // Support State
  const [supportSubject, setSupportSubject] = useState('Booking Inquiry');
  const [supportMsg, setSupportMsg] = useState('');
  const [supportSuccess, setSupportSuccess] = useState('');

  // Weather variables for simulated trips
  const weatherZanzibar = { temp: 28, condition: 'Sunny & Warm', wind: '12 km/h' };

  // Helper sha256
  const sha256 = async (string: string) => {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Seed default items and check session
  useEffect(() => {
    // 1. Check Session
    const activeSesObj = localStorage.getItem('ztr_customer_session');
    if (activeSesObj) {
      try {
        const parsed = JSON.parse(activeSesObj);
        setSession(parsed.user);
        setProfilePhone(parsed.user.phone || '');
        setProfileCountry(parsed.user.country || 'United States');
      } catch (e) {
        localStorage.removeItem('ztr_customer_session');
      }
    }

    // 2. Load bookings
    const storedBookings = localStorage.getItem('ztr_bookings');
    if (storedBookings) {
      try {
        setBookings(JSON.parse(storedBookings));
      } catch (e) {
        setBookings(getMockBookings());
      }
    } else {
      const mocks = getMockBookings();
      localStorage.setItem('ztr_bookings', JSON.stringify(mocks));
      setBookings(mocks);
    }

    // 3. Load Wishlist
    const storedWish = localStorage.getItem('ztr_wishlist');
    if (storedWish) {
      try {
        setWishlist(JSON.parse(storedWish));
      } catch (e) {
        setWishlist(getMockWishlist());
      }
    } else {
      const mocks = getMockWishlist();
      localStorage.setItem('ztr_wishlist', JSON.stringify(mocks));
      setWishlist(mocks);
    }

    // 4. Load Notifications
    const storedNotifs = localStorage.getItem('ztr_customer_notifications');
    if (storedNotifs) {
      try {
        setNotifications(JSON.parse(storedNotifs));
      } catch (e) {
        setNotifications(getMockNotifications());
      }
    } else {
      const mocks = getMockNotifications();
      localStorage.setItem('ztr_customer_notifications', JSON.stringify(mocks));
      setNotifications(mocks);
    }

    // 5. Load Email simulation logs
    setEmailLogs(getEmailLogs());

    // Register event listener for automatic email preview updates
    const handleEmailDispatched = () => {
      setEmailLogs(getEmailLogs());
    };
    window.addEventListener('ztr_email_dispatched', handleEmailDispatched);
    return () => window.removeEventListener('ztr_email_dispatched', handleEmailDispatched);
  }, []);

  // Detect and process query tokens
  useEffect(() => {
    if (queryToken && queryEmail) {
      handleVerifyEmailToken(queryToken, queryEmail);
    } else if (queryResetToken && queryEmail) {
      setViewMode('reset-password');
    }
  }, [queryToken, queryEmail, queryResetToken]);

  // Handle Verify Email Token
  const handleVerifyEmailToken = async (token: string, email: string) => {
    const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
    const matchedIdx = users.findIndex((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (matchedIdx > -1) {
      const user = users[matchedIdx];
      if (user.verificationToken === token) {
        user.verified = true;
        user.verificationToken = null;
        users[matchedIdx] = user;
        localStorage.setItem('ztr_admin_users', JSON.stringify(users));
        
        // Send Welcome email
        dispatchAutomatedEmail('welcome', user.email, user.name, {});
        
        // Push activity log
        addActivityLog(user.name, 'customerVerified', `Successfully verified email address [${user.email}].`);

        setViewMode('verified-notice');
        // Clean URL hash
        window.location.hash = 'my-account';
      }
    }
  };

  // Perform Email Verification Manual simulation (for easy testing in preview)
  const triggerManualVerification = (email: string) => {
    const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
    const matchedIdx = users.findIndex((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (matchedIdx > -1) {
      const user = users[matchedIdx];
      user.verified = true;
      user.verificationToken = null;
      users[matchedIdx] = user;
      localStorage.setItem('ztr_admin_users', JSON.stringify(users));
      
      // Dispatch welcome email
      dispatchAutomatedEmail('welcome', user.email, user.name, {});
      addActivityLog(user.name, 'customerVerified', `Manually bypassed verification for [${user.email}].`);

      setLoginSuccess('Verification successful! You can now authenticate with your password.');
      setLoginError('');
      // Clean query state
      setQueryToken(null);
      setQueryEmail(null);
    }
  };

  // Customer Login Form
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Please complete all authentication fields.');
      return;
    }

    try {
      const passwordHash = await sha256(loginPassword);
      const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');

      // Search matching account
      const matched = users.find(
        (u: any) => u.email?.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      if (!matched) {
        setLoginError('No client account matches this email. Register below.');
        return;
      }

      if (matched.passwordHash !== passwordHash) {
        setLoginError('Invalid secure password. Try again.');
        return;
      }

      if (matched.status === 'Locked') {
        setLoginError('Your client account access has been suspended. Please contact our support desk.');
        return;
      }

      // Check Verification
      if (!matched.verified) {
        setLoginError('Email Verification Pending. Please click the verification link in the automated email sent to your address.');
        // Allow resend
        const token = matched.verificationToken || Math.random().toString(36).substr(2, 9);
        matched.verificationToken = token;
        localStorage.setItem('ztr_admin_users', JSON.stringify(users));
        return;
      }

      // Successful Login
      const customerSession = {
        user: {
          username: matched.username,
          name: matched.name,
          email: matched.email,
          phone: matched.phone || '',
          country: matched.country || 'United States',
          role: 'Customer',
          verified: true
        },
        timestamp: Date.now()
      };

      localStorage.setItem('ztr_customer_session', JSON.stringify(customerSession));
      setSession(customerSession.user);
      setProfilePhone(matched.phone || '');
      setProfileCountry(matched.country || 'United States');
      setLoginSuccess('Authentication approved. Redirecting to your travel desk...');

      addActivityLog(matched.name, 'customerLogin', `Guest authenticated successfully at My Account.`);

      // Push a simulated system alert
      const updatedNotifs = [
        { id: Date.now(), title: 'Secure Login Approved', message: `Authenticated from ${navigator.userAgent.substring(0, 30)}...`, date: 'Just now', read: false },
        ...notifications
      ];
      setNotifications(updatedNotifs);
      localStorage.setItem('ztr_customer_notifications', JSON.stringify(updatedNotifs));

    } catch (err: any) {
      setLoginError('Login error: ' + err.message);
    }
  };

  // Customer Registration Form
  const handleCustomerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Please complete all registration fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Secure password must be at least 6 characters.');
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      const alreadyExists = users.some(
        (u: any) => u.email?.toLowerCase() === regEmail.trim().toLowerCase()
      );

      if (alreadyExists) {
        setRegError('This email is already associated with an account.');
        return;
      }

      const pHash = await sha256(regPassword);
      const verificationToken = 'vtf_' + Math.random().toString(36).substr(2, 9);
      const fullName = `${regFirstName.trim()} ${regLastName.trim()}`;

      const newCustomer = {
        username: regEmail.trim().split('@')[0].toLowerCase(),
        passwordHash: pHash,
        name: fullName,
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        country: regCountry,
        role: 'Customer',
        status: 'Active',
        verified: false,
        verificationToken,
        created_at: new Date().toISOString()
      };

      const updatedUsers = [...users, newCustomer];
      localStorage.setItem('ztr_admin_users', JSON.stringify(updatedUsers));

      // Trigger verification email
      dispatchAutomatedEmail('verification', newCustomer.email, fullName, {
        token: verificationToken,
        email: newCustomer.email
      });

      addActivityLog(fullName, 'customerRegistered', `Registered new guest profile. Dispatched verification email to [${newCustomer.email}].`);

      setRegSuccess(`Registration approved! An automated verification email has been sent to ${regEmail}. Please verify before logging in.`);
      
      // Reset inputs
      setRegFirstName('');
      setRegLastName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');

      setTimeout(() => {
        setViewMode('login');
      }, 5000);

    } catch (err: any) {
      setRegError('Registration error: ' + err.message);
    }
  };

  // Forgot Password Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim()) {
      setForgotError('Please provide your registered email address.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
    const matched = users.find((u: any) => u.email?.toLowerCase() === forgotEmail.trim().toLowerCase());

    if (!matched) {
      setForgotError('No registered account was located with that email.');
      return;
    }

    const resetToken = 'rst_' + Math.random().toString(36).substr(2, 9);
    matched.resetToken = resetToken;
    localStorage.setItem('ztr_admin_users', JSON.stringify(users));

    // Send reset link email
    dispatchAutomatedEmail('reset', matched.email, matched.name, {
      token: resetToken,
      email: matched.email
    });

    addActivityLog(matched.name, 'customerForgotPass', `Dispatched secure password reset link to [${matched.email}].`);

    setForgotSuccess(`Secure link dispatched! Please check ${forgotEmail} to reset your password.`);
    setForgotEmail('');
  };

  // Reset Password (Applying new password)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetPassword) {
      setResetError('Password field cannot be empty.');
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
    const matchedIdx = users.findIndex(
      (u: any) => u.email?.toLowerCase() === queryEmail?.toLowerCase() && u.resetToken === queryResetToken
    );

    if (matchedIdx === -1) {
      setResetError('The password reset link is invalid or expired. Please submit a new request.');
      return;
    }

    const user = users[matchedIdx];
    const newHash = await sha256(resetPassword);
    
    user.passwordHash = newHash;
    user.resetToken = null;
    user.forcePasswordChange = false; // clear forced password changes if any
    
    users[matchedIdx] = user;
    localStorage.setItem('ztr_admin_users', JSON.stringify(users));

    addActivityLog(user.name, 'customerResetPass', `Changed secure password via email reset link.`);

    setResetSuccess('Your credentials have been updated successfully! Proceeding to Login.');
    
    setTimeout(() => {
      // Clear token states
      setQueryResetToken(null);
      setQueryEmail(null);
      setViewMode('login');
    }, 2500);
  };

  // Customer Profile Updates
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');

    const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
    const matchedIdx = users.findIndex((u: any) => u.email?.toLowerCase() === session.email.toLowerCase());

    if (matchedIdx > -1) {
      users[matchedIdx].phone = profilePhone;
      users[matchedIdx].country = profileCountry;
      localStorage.setItem('ztr_admin_users', JSON.stringify(users));

      // Update current session state
      const updatedSes = { ...session, phone: profilePhone, country: profileCountry };
      setSession(updatedSes);
      localStorage.setItem('ztr_customer_session', JSON.stringify({ user: updatedSes, timestamp: Date.now() }));

      setProfileSuccess('Your profile particulars have been successfully committed to ledger.');
      addActivityLog(session.name, 'customerProfileUpdate', `Updated country and telephone settings.`);
    }
  };

  // Customer Change Password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError('');
    setPassChangeSuccess('');

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPassChangeError('Please complete all security fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassChangeError('New passwords do not match.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
    const matchedIdx = users.findIndex((u: any) => u.email?.toLowerCase() === session.email.toLowerCase());

    if (matchedIdx > -1) {
      const user = users[matchedIdx];
      const oldHash = await sha256(oldPassword);

      if (user.passwordHash !== oldHash) {
        setPassChangeError('Current password is incorrect.');
        return;
      }

      user.passwordHash = await sha256(newPassword);
      users[matchedIdx] = user;
      localStorage.setItem('ztr_admin_users', JSON.stringify(users));

      setPassChangeSuccess('Your security credentials have been updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      addActivityLog(session.name, 'customerPassChange', `Updated secure profile password.`);
    }
  };

  // Pay booking outstanding balance
  const handlePayBalance = (booking: any) => {
    const updatedBookings = bookings.map(b => {
      if (b.id === booking.id) {
        return { ...b, paid_amount: b.total_price, payment_status: 'Paid' };
      }
      return b;
    });

    setBookings(updatedBookings);
    localStorage.setItem('ztr_bookings', JSON.stringify(updatedBookings));

    // Send payment confirmation email
    dispatchAutomatedEmail('payment_confirm', session.email, session.name, {
      tour_name: booking.tour_name,
      preferred_date: booking.preferred_date,
      total_price: booking.total_price,
      paid_amount: booking.total_price
    });

    // Alert
    alert(`Asante! Payment of $${booking.total_price - (booking.paid_amount || 0)} has been securely verified. Vouchers updated.`);
    addActivityLog(session.name, 'customerPayment', `Paid outstanding balance on ${booking.tour_name}.`);
  };

  // Submit Client Trip Travel Notes
  const handleSendTravelNote = (bookingId: string) => {
    const note = prompt('Enter message or dietary requirements for our Swahili team:');
    if (note !== null) {
      const updatedBookings = bookings.map(b => {
        if (b.id === bookingId) {
          return { ...b, message: note };
        }
        return b;
      });
      setBookings(updatedBookings);
      localStorage.setItem('ztr_bookings', JSON.stringify(updatedBookings));

      alert('Your travel request has been dispatched to our reservations desk. Asante!');
      addActivityLog(session.name, 'customerUpdate', `Submitted travel instructions for booking ID: ${bookingId}.`);
    }
  };

  // Cancel Customer Booking
  const handleCancelBooking = (booking: any) => {
    if (confirm(`Are you sure you want to request cancellation for your reservation on "${booking.tour_name}"?`)) {
      const updatedBookings = bookings.map(b => {
        if (b.id === booking.id) {
          return { ...b, status: 'Cancelled' };
        }
        return b;
      });

      setBookings(updatedBookings);
      localStorage.setItem('ztr_bookings', JSON.stringify(updatedBookings));

      // Trigger cancel automated email
      dispatchAutomatedEmail('booking_cancel', session.email, session.name, {
        tour_name: booking.tour_name,
        preferred_date: booking.preferred_date,
        id: booking.id
      });

      alert('Your booking cancellation request has been processed. Vouchers cancelled.');
      addActivityLog(session.name, 'customerCancel', `Cancelled excursion: ${booking.tour_name}.`);
    }
  };

  // Support Request submission
  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMsg.trim()) return;

    setSupportSuccess('Your support ticket has been registered. Our Swahili team will respond in your alerts.');
    setSupportMsg('');
    addActivityLog(session.name, 'customerSupportTicket', `Opened support request: "${supportSubject}".`);

    // Simulated response after 5 seconds
    setTimeout(() => {
      const updatedNotifs = [
        { 
          id: Date.now(), 
          title: 'Support Ticket Reply', 
          message: `Jambo ${session.name}! Regarding your query about "${supportSubject}", our Reservation Team has updated your travel schedule. Karibu!`, 
          date: 'Just now', 
          read: false 
        },
        ...notifications
      ];
      setNotifications(updatedNotifs);
      localStorage.setItem('ztr_customer_notifications', JSON.stringify(updatedNotifs));
    }, 5000);
  };

  // Customer Logout
  const handleLogout = () => {
    localStorage.removeItem('ztr_customer_session');
    setSession(null);
    setViewMode('login');
    addActivityLog(session?.name || 'Customer', 'loggedOut', 'Logged out of My Account.');
  };

  // Mock structures
  function getMockBookings() {
    return [
      {
        id: 'ZTR-BKG-8831',
        tour_name: 'Safari Blue Conservation Day Cruise',
        preferred_date: 'July 15, 2026',
        number_of_guests: 2,
        pickup_location: 'Melia Zanzibar Lobby',
        status: 'Confirmed',
        payment_status: 'Deposit Paid',
        total_price: 240,
        paid_amount: 100,
        message: 'No shellfish dietary preferences'
      },
      {
        id: 'ZTR-BKG-4421',
        tour_name: 'Stone Town & Prison Island Cultural Walk',
        preferred_date: 'July 18, 2026',
        number_of_guests: 2,
        pickup_location: 'Tembo House Hotel Lobby',
        status: 'Confirmed',
        payment_status: 'Paid',
        total_price: 90,
        paid_amount: 90,
        message: ''
      }
    ];
  }

  function getMockWishlist() {
    return [
      { id: 't-1', name: 'Mnemba Island Snorkeling Excursion', price: 65, duration: 'Half Day' },
      { id: 't-2', name: 'Zanzibar Spice Plantation Tour', price: 35, duration: '3 Hours' }
    ];
  }

  function getMockNotifications() {
    return [
      { id: 101, title: 'Swahili Welcome Pack', message: 'Karibu Zanzibar! Download your comprehensive travel advisory checklist inside My Trips.', date: '1 day ago', read: true },
      { id: 102, title: 'Booking Complete', message: 'Your reservation for Safari Blue Excursion has been successfully written on the Swahili core ledger.', date: '3 days ago', read: true }
    ];
  }

  // Count Unread alerts
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans" id="my-account-portal">
      {/* Dynamic Header */}
      <div className="bg-[#0A1224] text-white py-14 px-6 md:px-12 relative overflow-hidden">
        {/* Swahili Patterns */}
        <div className="absolute top-0 right-0 w-80 h-full bg-[#D4A017] opacity-[0.03] pointer-events-none mask-pattern" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              Swahili Coast Customer Portal
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
              {session ? `Karibu, ${session.name}` : 'My Swahili Travel Account'}
            </h1>
            <p className="text-sm text-slate-400">
              {session ? 'Review your travel countdowns, download vouchers, or adjust pickup points.' : 'Access your premium custom itineraries and certified travel desk.'}
            </p>
          </div>
          {session && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/25 text-red-300 border border-red-500/30 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RENDER PUBLIC LOGIN / REGISTER */}
      {!session && (
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Form container */}
          <div className="lg:col-span-7 bg-white border border-slate-200 shadow-xl rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-sm font-bold text-[#0B3B8C] font-serif uppercase tracking-wider">
                {viewMode === 'login' && 'Sign In to My Account'}
                {viewMode === 'register' && 'Register Premium Account'}
                {viewMode === 'forgot' && 'Reset Secure Access'}
                {viewMode === 'reset-password' && 'Configure New Credentials'}
                {viewMode === 'verified-notice' && 'Email Verification Approved'}
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setViewMode('login'); setLoginError(''); setRegError(''); }} 
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${viewMode === 'login' ? 'bg-[#0B3B8C] text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => { setViewMode('register'); setLoginError(''); setRegError(''); }} 
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${viewMode === 'register' ? 'bg-[#0B3B8C] text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Error message displays */}
            {(loginError || regError || forgotError || resetError) && (
              <div className="bg-red-500/5 border border-red-500/20 text-red-700 p-4 rounded-xl text-xs flex items-start gap-2.5">
                <ShieldAlert size={16} className="shrink-0 text-red-500 mt-0.5" />
                <div>
                  <span className="font-bold">Access Warning:</span>
                  <p className="mt-1 font-medium">{loginError || regError || forgotError || resetError}</p>
                </div>
              </div>
            )}

            {/* Success message displays */}
            {(loginSuccess || regSuccess || forgotSuccess || resetSuccess) && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 p-4 rounded-xl text-xs flex items-start gap-2.5">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-500 mt-0.5" />
                <div>
                  <span className="font-bold">System Confirmation:</span>
                  <p className="mt-1 font-medium">{loginSuccess || regSuccess || forgotSuccess || resetSuccess}</p>
                </div>
              </div>
            )}

            {/* LOGIN FORM */}
            {viewMode === 'login' && (
              <form onSubmit={handleCustomerLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input 
                      type="email"
                      required
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all font-medium"
                      placeholder="e.g. guest@zanzibar.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setViewMode('forgot')}
                      className="text-[10px] font-black text-[#0B3B8C] hover:underline uppercase tracking-wider"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    {showLoginPassword ? (
                      <EyeOff size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer" onClick={() => setShowLoginPassword(false)} />
                    ) : (
                      <Eye size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer" onClick={() => setShowLoginPassword(true)} />
                    )}
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input 
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-11 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#0B3B8C] hover:bg-[#082d6b] text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#0B3B8C]/10"
                >
                  Sign In to Desk
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {viewMode === 'register' && (
              <form onSubmit={handleCustomerRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">First Name</label>
                    <input 
                      type="text"
                      required
                      value={regFirstName}
                      onChange={e => setRegFirstName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all font-medium"
                      placeholder="e.g. John"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Name</label>
                    <input 
                      type="text"
                      required
                      value={regLastName}
                      onChange={e => setRegLastName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all font-medium"
                      placeholder="e.g. Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input 
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all font-medium"
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input 
                        type="text"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all font-medium"
                        placeholder="e.g. +1 555-019-2834"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Country</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <select 
                        value={regCountry}
                        onChange={e => setRegCountry(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all font-medium"
                      >
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Italy">Italy</option>
                        <option value="Spain">Spain</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                    <input 
                      type="password"
                      required
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm Password</label>
                    <input 
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#0B3B8C] hover:bg-[#082d6b] text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#0B3B8C]/10"
                >
                  Create Premium Account
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {viewMode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-slate-500">
                  Provide your client account email. We will generate and dispatch a secure password reset credential immediately via our SMTP templates.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input 
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all font-medium"
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#0B3B8C] hover:bg-[#082d6b] text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                >
                  Request Secure Reset Link
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setViewMode('login')} 
                  className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-all block"
                >
                  ← Return to Sign In
                </button>
              </form>
            )}

            {/* RESET PASSWORD FORM */}
            {viewMode === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 p-4 rounded-xl text-xs space-y-1">
                  <span className="font-extrabold flex items-center gap-1">
                    <KeyRound size={12} /> Secure Key Authenticated:
                  </span>
                  <p>Reset link verified for <strong>{queryEmail}</strong>. Configure your new password credentials below.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Password</label>
                  <input 
                    type="password"
                    required
                    value={resetPassword}
                    onChange={e => setResetPassword(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                  <input 
                    type="password"
                    required
                    value={resetConfirmPassword}
                    onChange={e => setResetConfirmPassword(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#0B3B8C] hover:bg-[#082d6b] text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                >
                  Update Credentials & Login
                </button>
              </form>
            )}

            {/* EMAIL VERIFICATION STATUS */}
            {viewMode === 'verified-notice' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check size={32} className="stroke-[3]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Email Verification Approved!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you for verifying your email address. Your customer profile is now fully active on our reservation core.
                </p>
                <button 
                  onClick={() => setViewMode('login')}
                  className="bg-[#0B3B8C] text-white hover:bg-[#082d6b] font-black py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Return to Login Desk
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Portal Perks */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0B3B8C] to-[#051C44] text-white p-8 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/15">
                <Sparkles className="text-[#D4A017] w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Zanzibar Guest Desk
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Join our exclusive travel circle and secure persistent, production-ready access to your luxury Zanzibar excursions.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5 text-xs">
                <div className="flex gap-3">
                  <span className="text-[#D4A017]">🌴</span>
                  <div>
                    <span className="font-bold text-white">Full Booking Logs</span>
                    <p className="text-slate-400 text-[10px]">Review dates, guide names, or adjust pickup lobby locations.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#D4A017]">💳</span>
                  <div>
                    <span className="font-bold text-white">Encrypted Receipts</span>
                    <p className="text-slate-400 text-[10px]">Securely commit payment deposits and print official tax invoices.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#D4A017]">📬</span>
                  <div>
                    <span className="font-bold text-white">Swahili Advisory News</span>
                    <p className="text-slate-400 text-[10px]">Download verified local weather indicators and snorkeling alerts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER CUSTOMER AUTHENTICATED PORTAL */}
      {session && (
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Navigation Rails */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-150">
                <div className="w-10 h-10 rounded-full bg-[#0B3B8C] text-white flex items-center justify-center font-bold">
                  {session.name.substring(0, 1)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{session.name}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{session.role}</span>
                </div>
              </div>

              {/* Sidebar Menu Buttons */}
              <div className="space-y-1 flex flex-col">
                {[
                  { id: 'dashboard', label: 'My Dashboard', icon: Compass },
                  { id: 'bookings', label: 'My Bookings', icon: Calendar, badge: bookings.length },
                  { id: 'payments', label: 'My Payments', icon: CreditCard },
                  { id: 'trips', label: 'My Trips', icon: MapPin },
                  { id: 'profile', label: 'My Profile', icon: User },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
                  { id: 'support', label: 'Support tickets', icon: HelpCircle },
                  { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        activeTab === item.id 
                          ? 'bg-[#0B3B8C]/10 text-[#0B3B8C] border-l-4 border-[#0B3B8C]' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={activeTab === item.id ? 'text-[#0B3B8C]' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-[#0B3B8C] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Swahili Weather Quick card */}
            <div className="bg-gradient-to-br from-[#0B3B8C] to-[#0A1224] text-white rounded-3xl p-5 space-y-3 shadow-md">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#D4A017] block">Live Zanzibar Climate</span>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h5 className="text-xl font-bold font-serif">{weatherZanzibar.temp}&deg;C</h5>
                  <p className="text-[10px] text-slate-400">{weatherZanzibar.condition}</p>
                </div>
                <Cloud size={24} className="text-[#D4A017]" />
              </div>
              <p className="text-[9px] text-slate-400">Excellent tides for Prison Island boat tours today.</p>
            </div>
          </div>

          {/* Right Workspaces */}
          <div className="lg:col-span-9 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-6 text-xs"
              >
                
                {/* 1. DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-[#0B3B8C] font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>My Guest Dashboard</h3>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-200">Active secure session</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0B3B8C] flex items-center justify-center">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Bookings</span>
                          <span className="text-lg font-extrabold text-slate-800">{bookings.length} Registered</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 text-[#D4A017] flex items-center justify-center">
                          <Heart size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Wishlist</span>
                          <span className="text-lg font-extrabold text-slate-800">{wishlist.length} Excursions</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Payments status</span>
                          <span className="text-lg font-extrabold text-slate-800">Clear</span>
                        </div>
                      </div>
                    </div>

                    {/* Welcome Announcement */}
                    <div className="bg-blue-50 border border-blue-150 rounded-2xl p-5 space-y-2">
                      <h4 className="text-sm font-bold text-[#0B3B8C]">🌴 Swahili Coast Travel Advisory</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Karibu! For all travelers arriving in Stone Town, we have arranged direct Mercedes Sprinter or private SUV shuttle services to Melia, Nungwi, and Paje beaches. Access your countdown sheet in <strong>My Trips</strong> to consult your assigned driver card.
                      </p>
                      <button 
                        onClick={() => setActiveTab('trips')}
                        className="text-xs font-black text-[#0B3B8C] hover:underline flex items-center gap-1.5 uppercase tracking-wider pt-2"
                      >
                        <span>Check My Drivers</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* Recent Reservation Card Preview */}
                    {bookings.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-slate-850 uppercase tracking-widest">Next Scheduled Adventure</h4>
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                          <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                            <div>
                              <h5 className="text-sm font-bold text-slate-900">{bookings[0].tour_name}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">Date: {bookings[0].preferred_date}</p>
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-2 py-0.5 rounded">{bookings[0].status}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                            <div>
                              <span className="text-slate-400 block mb-0.5">Hotel Pickup Lobby</span>
                              <span className="font-bold text-slate-800">{bookings[0].pickup_location}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block mb-0.5">Travelers Registered</span>
                              <span className="font-bold text-slate-800">{bookings[0].number_of_guests} Passengers</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. BOOKINGS TAB */}
                {activeTab === 'bookings' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-[#0B3B8C] font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>My Confirmed Bookings</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Download your verified vouchers or dispatch specific trip requests.</p>
                      </div>
                    </div>

                    {bookings.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                        <Calendar size={32} className="mx-auto text-slate-300" />
                        <p className="font-bold text-slate-650">No travel bookings registered yet.</p>
                        <button 
                          onClick={() => navigate('tours')}
                          className="text-[#0B3B8C] hover:underline font-bold text-xs"
                        >
                          Explore Tours & Safaris
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((b, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/50">
                              <div>
                                <span className="text-[9px] font-mono font-bold text-[#0B3B8C] bg-[#0B3B8C]/10 px-2 py-0.5 rounded-full">{b.id}</span>
                                <h4 className="text-sm font-bold text-slate-850 mt-1">{b.tour_name}</h4>
                                <span className="text-[10px] text-slate-400 mt-0.5 block">Scheduled Date: {b.preferred_date}</span>
                              </div>
                              <div className="flex gap-2">
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2.5 py-1 rounded border border-emerald-200 uppercase">{b.status}</span>
                                <span className="bg-yellow-100 text-yellow-800 text-[9px] font-black px-2.5 py-1 rounded border border-yellow-200 uppercase">{b.payment_status}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-slate-400 block mb-0.5">Pickup Hotel Lobby</span>
                                <span className="font-bold text-slate-850">{b.pickup_location || 'To be updated'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block mb-0.5">Travelers Registered</span>
                                <span className="font-bold text-slate-850">{b.number_of_guests} Passengers</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block mb-0.5">Total Package Bill</span>
                                <span className="font-bold text-slate-850">${b.total_price} USD</span>
                              </div>
                            </div>

                            {b.message && (
                              <div className="bg-white border border-slate-150 p-3 rounded-xl text-[11px] text-slate-600">
                                <strong>My Request Note:</strong> "{b.message}"
                              </div>
                            )}

                            {/* Booking Action Buttons */}
                            <div className="flex flex-wrap gap-2.5 pt-3 border-t border-slate-200/40">
                              <button 
                                onClick={() => {
                                  alert(`Generating dynamic Travel Voucher for Booking ${b.id}. Commenced download layout.`);
                                }}
                                className="bg-[#0B3B8C] hover:bg-[#082d6b] text-white px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Download size={13} />
                                <span>Download Travel Voucher</span>
                              </button>
                              <button 
                                onClick={() => handleSendTravelNote(b.id)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <FileText size={13} />
                                <span>Adjust Travel Note</span>
                              </button>
                              {b.status !== 'Cancelled' && (
                                <button 
                                  onClick={() => handleCancelBooking(b)}
                                  className="ml-auto bg-red-100 hover:bg-red-200 text-red-700 px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer"
                                >
                                  Request Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. PAYMENTS TAB */}
                {activeTab === 'payments' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-[#0B3B8C] font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>My Payments Ledger</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Review payments made, outstanding balances, and secure commercial receipts.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {bookings.map((b, i) => {
                        const balance = b.total_price - (b.paid_amount || 0);
                        const isPaid = balance <= 0;

                        return (
                          <div key={i} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-mono font-bold text-[#0B3B8C] bg-[#0B3B8C]/10 px-2 py-0.5 rounded-full">{b.id}</span>
                              <h4 className="text-sm font-bold text-slate-850">{b.tour_name}</h4>
                              <div className="flex gap-4 text-xs text-slate-500 pt-1">
                                <span>Total Price: <strong>${b.total_price}</strong></span>
                                <span>Paid Amount: <strong className="text-emerald-600">${b.paid_amount || 0}</strong></span>
                                <span>Balance: <strong className={isPaid ? 'text-emerald-600' : 'text-amber-600'}>${balance}</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {!isPaid ? (
                                <button 
                                  onClick={() => handlePayBalance(b)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                  <CreditCard size={13} />
                                  <span>Pay Balance (${balance})</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-600 bg-emerald-50 text-[10px] font-black border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                                    Fully Paid
                                  </span>
                                  <button 
                                    onClick={() => alert('Voucher/Receipt PDF downloaded.')}
                                    title="Download Payment Receipt"
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 p-2 rounded-xl transition-all"
                                  >
                                    <Download size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. TRIPS TAB */}
                {activeTab === 'trips' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-[#0B3B8C] font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>My Scheduled Trips</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Swahili Coast travel countdown and local weather advisories.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Driver Card */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                        <span className="text-[9px] font-bold text-[#D4A017] uppercase tracking-widest block font-mono">Assigned Shuttle Driver</span>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#0B3B8C]/10 flex items-center justify-center font-bold text-lg text-[#0B3B8C]">
                            👨🏽‍✈️
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Driver Captain Juma</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">Assigned Vehicle: Toyota Alphard SUV (White)</p>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-150 space-y-1">
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Driver Hotline</span>
                          <span className="text-xs font-bold text-[#0B3B8C] font-mono">+255 777 021 832</span>
                        </div>
                      </div>

                      {/* Island Map Advisor */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                        <span className="text-[9px] font-bold text-[#D4A017] uppercase tracking-widest block font-mono">Destinations Hub</span>
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <MapPin size={13} className="text-[#0B3B8C]" />
                            <span>Prison Island Reefs & Giant Tortoise conservation area</span>
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            A scenic 30-minute motorized dhow ride from the Stone Town waterfront. Excellent snorkeling with turquoise coral reefs. Please follow guide instructions on tortoises feeding.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. PROFILE TAB */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-[#0B3B8C] font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>My Guest Profile</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Commits phone, address, and credentials parameters to ledger.</p>
                      </div>
                    </div>

                    {profileSuccess && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 p-4 rounded-xl font-bold">
                        {profileSuccess}
                      </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                        <input 
                          type="text"
                          disabled
                          value={session.name}
                          className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-slate-500 font-medium cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                        <input 
                          type="email"
                          disabled
                          value={session.email}
                          className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-slate-500 font-medium cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                        <input 
                          type="text"
                          required
                          value={profilePhone}
                          onChange={e => setProfilePhone(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl py-3 px-4 font-medium focus:outline-none focus:border-[#0B3B8C]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Country</label>
                        <select
                          value={profileCountry}
                          onChange={e => setProfileCountry(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-200 rounded-xl py-3 px-4 font-medium focus:outline-none focus:border-[#0B3B8C]"
                        >
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Tanzania">Tanzania</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Germany">Germany</option>
                        </select>
                      </div>

                      <button 
                        type="submit"
                        className="bg-[#0B3B8C] hover:bg-[#082d6b] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Update Profile Particulars
                      </button>
                    </form>

                    {/* Change password security pane */}
                    <div className="border-t border-slate-200 pt-6 space-y-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-800">Adjust Portal Password</h4>
                      
                      {passChangeError && (
                        <div className="bg-red-500/5 border border-red-500/20 text-red-700 p-3 rounded-xl font-bold">
                          {passChangeError}
                        </div>
                      )}

                      {passChangeSuccess && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 p-3 rounded-xl font-bold">
                          {passChangeSuccess}
                        </div>
                      )}

                      <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Password</label>
                          <input 
                            type="password"
                            required
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B3B8C]"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New Password</label>
                          <input 
                            type="password"
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B3B8C]"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm New Password</label>
                          <input 
                            type="password"
                            required
                            value={confirmNewPassword}
                            onChange={e => setConfirmNewPassword(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B3B8C]"
                            placeholder="••••••••"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Modify Password
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* 6. WISHLIST TAB */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-[#0B3B8C] font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>My Travel Wishlist</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Excursions you are tracking for your upcoming Zanzibar escapade.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlist.map((item, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex justify-between items-center">
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-slate-800">{item.name}</h4>
                            <div className="flex gap-3 text-[10px] text-slate-500">
                              <span>Duration: {item.duration}</span>
                              <span>Starts at: <strong>${item.price}</strong></span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              navigate('booking', `tour=${encodeURIComponent(item.name)}`);
                            }}
                            className="bg-[#0B3B8C] hover:bg-[#082d6b] text-white text-[10px] font-extrabold py-2 px-3 rounded-xl uppercase tracking-wider transition-colors shrink-0"
                          >
                            Book Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. SUPPORT TICKETS TAB */}
                {activeTab === 'support' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-[#0B3B8C] font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>My Support Tickets</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Direct chat access to our certified Swahili guides & concierge desks.</p>
                      </div>
                    </div>

                    {supportSuccess && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 p-4 rounded-xl font-bold">
                        {supportSuccess}
                      </div>
                    )}

                    <form onSubmit={handleSupportSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inquiry Topic</label>
                          <select 
                            value={supportSubject}
                            onChange={e => setSupportSubject(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B3B8C]"
                          >
                            <option value="Booking Inquiry">Excursion Booking / Date change</option>
                            <option value="Dietary Request">Dietary restrictions (Halaal / Seafood allergics)</option>
                            <option value="Driver Pickup">Driver / Taxi pickup lobbies</option>
                            <option value="Complaints">Feedback / Quality issue</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">My Travel Query Details</label>
                        <textarea 
                          required
                          rows={4}
                          value={supportMsg}
                          onChange={e => setSupportMsg(e.target.value)}
                          placeholder="Provide any specific queries about Safari Blue snorkeling depths, giant tortoises feeding, or Melia beach lobbies..."
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-[#0B3B8C] focus:bg-white"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="bg-[#0B3B8C] hover:bg-[#082d6b] text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Submit Support Ticket
                      </button>
                    </form>
                  </div>
                )}

                {/* 8. NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-[#0B3B8C] font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>My Alerts & Inbox</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Real-time notifications sent to your guest portal.</p>
                      </div>
                      <button 
                        onClick={() => {
                          const updated = notifications.map(n => ({ ...n, read: true }));
                          setNotifications(updated);
                          localStorage.setItem('ztr_customer_notifications', JSON.stringify(updated));
                        }}
                        className="text-xs font-black text-[#0B3B8C] hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="space-y-3">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-4 border rounded-2xl flex gap-3.5 ${n.read ? 'bg-white border-slate-200' : 'bg-blue-50/50 border-blue-200'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.read ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-[#0B3B8C]'}`}>
                            <Bell size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{n.title}</h4>
                            <p className="text-xs text-slate-650 mt-1">{n.message}</p>
                            <span className="text-[9px] text-slate-400 font-mono mt-1 block">{n.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* FOOTER EMULATION LOGS (EXTREMELY USEFUL FOR TESTING EMAILS) */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-[#051128] border border-white/10 rounded-3xl p-6 md:p-8 text-white space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-black text-[#D4A017] uppercase tracking-widest font-mono">
                System Developer Hub
              </span>
              <h3 className="text-lg font-black text-white mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                📬 Simulated Guest Inbox & SMTP Logs
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                View emails generated and dispatched by the Zanzibar Trip & Relax platform in real-time. Use these logs to click verification links and complete password resets during testing.
              </p>
            </div>
            
            <button 
              onClick={() => {
                localStorage.setItem('ztr_email_logs', '[]');
                setEmailLogs([]);
              }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs px-3.5 py-1.5 rounded-xl uppercase font-bold text-slate-300"
            >
              Clear Logs
            </button>
          </div>

          {emailLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No automated emails have been logged yet in this session. Try registering an account, requesting a password reset, or updating payments to dispatch notifications.
            </div>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {emailLogs.map((log: any, idx: number) => (
                <div key={idx} className="bg-[#121B30] border border-white/5 rounded-2xl p-4 text-xs space-y-3">
                  <div className="flex justify-between items-start pb-2 border-b border-white/5">
                    <div>
                      <span className="bg-[#D4A017] text-[#020C1F] text-[9px] font-black uppercase px-2 py-0.5 rounded mr-2 font-mono">
                        {log.type}
                      </span>
                      <strong className="text-slate-300">To:</strong> <span className="font-mono text-slate-400">{log.toEmail}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div>
                    <strong className="text-slate-300">Subject:</strong> <span className="font-bold text-[#D4A017]">{log.subject}</span>
                  </div>

                  {/* Manual verification button directly inside the mail for extreme convenience! */}
                  {log.type === 'verification' && (
                    <div className="bg-emerald-950/40 border border-emerald-500/25 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                      <span>💡 Fast Testing: You can click the button to manually approve this email address directly.</span>
                      <button 
                        onClick={() => triggerManualVerification(log.toEmail)}
                        className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold px-3 py-1.5 rounded-lg uppercase transition-all"
                      >
                        Auto-Verify Email
                      </button>
                    </div>
                  )}

                  {/* Manual Reset Button directly inside logs for extreme convenience! */}
                  {log.type === 'reset' && (
                    <div className="bg-amber-950/40 border border-amber-500/25 p-3 rounded-xl flex items-center justify-between text-xs text-amber-300">
                      <span>💡 Fast Testing: Click the link below to apply your new credentials directly.</span>
                      <button 
                        onClick={() => {
                          const token = log.subject.includes('Reset') ? log.bodyHtml.match(/reset_token=([^&"'>]+)/)?.[1] : null;
                          if (token) {
                            setQueryResetToken(token);
                            setQueryEmail(log.toEmail);
                            setViewMode('reset-password');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            alert('Reset token not extracted correctly from HTML. Please try copying URL manually.');
                          }
                        }}
                        className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold px-3 py-1.5 rounded-lg uppercase transition-all"
                      >
                        Open Password Reset Form
                      </button>
                    </div>
                  )}

                  {/* Email HTML Body Wrapper */}
                  <div className="bg-white border border-slate-200 text-slate-800 rounded-xl p-4 overflow-x-auto max-h-[180px] overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: log.bodyHtml }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
