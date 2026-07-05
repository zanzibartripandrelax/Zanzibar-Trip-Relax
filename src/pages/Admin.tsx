import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../hooks/useHashRouter';
import { 
  Lock, User, LogOut, CheckCircle, XCircle, Search, Filter, 
  Settings, ShieldAlert, Edit, Trash2, Plus, ArrowRight, 
  FileText, Copy, Mail, Calendar, Eye, Image, Sparkles,
  CheckCircle2, DollarSign, Upload, Users, Activity, HelpCircle,
  TrendingUp, Download, EyeOff, Layout, Phone, MapPin, Clock, List,
  Shield, Check, Briefcase, Leaf, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getSiteContent, saveSiteContent, addActivityLog as cmsAddActivityLog, getActivities, SiteContent, DEFAULT_MEDIA, MediaFile, getExtendedSeasonality, saveExtendedSeasonality, ExtendedSeason, getJobs, saveJobs, getSustainability, saveSustainability, getTransportZones, saveTransportZones, getHotels, saveHotels, TransportZone, HotelOption } from '../lib/cmsStore';
import { blogPosts, saveBlogPosts } from './BlogDetail';
import { generateBookingsSummaryPDF, generateVisitorLogsPDF } from '../lib/pdfGenerator';
import { ReusableTable, ColumnConfig } from '../components/ReusableTable';
import { AdminDataTable } from '../components/AdminDataTable';
import AdminSidebar from '../components/AdminSidebar';
import AuthGuard from '../components/AuthGuard';
import SeoAnalytics from '../components/SeoAnalytics';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

interface AdminProps {
  navigate: (page: Page) => void;
}

// Inactive warning timeout (automatic logout after 30 minutes of absolute inactivity)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

export default function Admin({ navigate }: AdminProps) {
  // Session tracking
  const [session, setSession] = useState<{ username: string; name: string; role: string } | null>(null);

  // Dynamic Role-Based Access Permissions
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem('ztr_role_permissions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use fallback
      }
    }
    return {
      'Administrator': { cms: 'write', media: 'write', bookings: 'write', finances: 'write', staff: 'write', vehicles: 'write', suppliers: 'write' },
      'Manager': { cms: 'read', media: 'read', bookings: 'write', finances: 'read', staff: 'none', vehicles: 'write', suppliers: 'write' },
      'Sales': { cms: 'none', media: 'none', bookings: 'write', finances: 'none', staff: 'none', vehicles: 'none', suppliers: 'none' },
      'Guide': { cms: 'none', media: 'none', bookings: 'read', finances: 'none', staff: 'none', vehicles: 'none', suppliers: 'none' },
      'Content Editor': { cms: 'write', media: 'write', bookings: 'none', finances: 'none', staff: 'none', vehicles: 'none', suppliers: 'none' },
      'Accountant': { cms: 'none', media: 'none', bookings: 'read', finances: 'write', staff: 'none', vehicles: 'none', suppliers: 'none' }
    };
  });

  const [permSelectedRole, setPermSelectedRole] = useState<string>('Content Editor');
  const [savePermSuccess, setSavePermSuccess] = useState(false);

  // Local wrapper to make activity logging dynamic and update React state immediately
  const addActivityLog = (
    user: string,
    role: string,
    action: string,
    previousValue?: string,
    newValue?: string,
    ipAddress?: string
  ) => {
    cmsAddActivityLog(user, role, action, previousValue, newValue, ipAddress);
    setLogsList(getActivities());
  };
  
  // Login input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Inactivity tracking
  const lastActiveRef = useRef<number>(Date.now());
  const [inactivityNotice, setInactivityNotice] = useState(false);

  // Active sub-section - type changed to string to allow newly introduced ERP tabs
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Transport & Zones state
  const [zonesList, setZonesList] = useState<TransportZone[]>(getTransportZones());
  const [hotelsList, setHotelsList] = useState<HotelOption[]>(getHotels());
  const [transportSubTab, setTransportSubTab] = useState<'zones' | 'hotels'>('zones');
  const [zoneSearch, setZoneSearch] = useState('');
  const [hotelSearch, setHotelSearch] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [csvPasteText, setCsvPasteText] = useState('');
  
  // Company config / system settings state
  const [settingsCurrency, setSettingsCurrency] = useState(localStorage.getItem('ztr_currency_symbol') || '$');
  const [settingsTimeout, setSettingsTimeout] = useState(localStorage.getItem('ztr_inactivity_timeout_duration') || '30');
  const [settingsAccent, setSettingsAccent] = useState(localStorage.getItem('ztr_theme_accent') || 'gold');
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);
  const [dashboardLogFilter, setDashboardLogFilter] = useState<'all' | 'cms' | 'auth'>('all');
  
  // Modals / Adding states
  const [editingZone, setEditingZone] = useState<TransportZone | null>(null);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZonePrice, setNewZonePrice] = useState(0);

  const [editingHotel, setEditingHotel] = useState<HotelOption | null>(null);
  const [isAddingHotel, setIsAddingHotel] = useState(false);
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelZoneId, setNewHotelZoneId] = useState('');
  
  // Booking dynamic state
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  
  // Newsletter Subscriptions dynamic state
  const [subscribersList, setSubscribersList] = useState<any[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'confirmed' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<any | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
    confirmLabel?: string;
  } | null>(null);

  // Email template composer modal
  const [sendEmailModal, setSendEmailModal] = useState<any | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailCustomMessage, setEmailCustomMessage] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Interactive Payment Policies state values
  const [policies, setPolicies] = useState({
    tours: { depositPct: 30, paymentOption: 'both', cutoffHours: 24 },
    kilimanjaro: { depositPct: 20, paymentOption: 'both', cutoffHours: 336 },
    safari_multi: { depositPct: 50, paymentOption: 'both', cutoffHours: 168 },
    safari_fly_in: { depositPct: 100, paymentOption: 'full', cutoffHours: 72 },
    transfers: { depositPct: 20, paymentOption: 'both', cutoffHours: 24 }
  });
  const [policiesSaveSucc, setPoliciesSaveSucc] = useState(false);
  const [extendedSeasons, setExtendedSeasons] = useState<ExtendedSeason[]>(() => getExtendedSeasonality());
  const [extendedSeasonSaveSucc, setExtendedSeasonSaveSucc] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ztr_payment_policies');
    if (saved) {
      try {
        setPolicies(JSON.parse(saved));
      } catch (err) {
        // use default
      }
    }
  }, []);

  useEffect(() => {
    setLogsList(getActivities());
  }, [activeTab]);

  // CMS active content state
  const [siteContent, setSiteContent] = useState<SiteContent>(getSiteContent());
  const [cmsEditSection, setCmsEditSection] = useState<'contact' | 'hero' | 'about' | 'tours' | 'faqs' | 'testimonials' | 'youtube' | 'blog'>('contact');
  
  // Dynamic media files list
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [mediaFolder, setMediaFolder] = useState<'all' | 'banners' | 'tours' | 'avatars' | 'safaris'>('all');
  const [uploadProgress, setUploadProgress] = useState(false);

  // Security & Compliance Audit log search & filtering states
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logRoleFilter, setLogRoleFilter] = useState('all');
  const [logCategoryFilter, setLogCategoryFilter] = useState('all');
  const [selectedInspectLog, setSelectedInspectLog] = useState<any | null>(null);
  const [logsList, setLogsList] = useState<any[]>([]);

  // Edit fields values
  const [editTour, setEditTour] = useState<any | null>(null);
  const [editFaq, setEditFaq] = useState<any | null>(null);
  const [editYoutubeVideo, setEditYoutubeVideo] = useState<any | null>(null);
  const [editBlogPost, setEditBlogPost] = useState<any | null>(null);

  // Staff user creation state variables
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Guide');
  const [newPassword, setNewPassword] = useState('');
  const [userAddError, setUserAddError] = useState('');
  const [userAddSuccess, setUserAddSuccess] = useState('');
  const [usersRefreshTrigger, setUsersRefreshTrigger] = useState(0);

  // --- ERP STATE VARIABLES ---
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);
  const [expensesList, setExpensesList] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  
  // Modals / forms for ERP additions
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newVehicleData, setNewVehicleData] = useState({ plate: '', model: '', capacity: 7, fuel: '100%', driver: '', status: 'Active', logs: '' });
  const [newSupplierData, setNewSupplierData] = useState({ name: '', type: 'Accommodation', location: '', contact: '', details: '' });
  const [newExpenseData, setNewExpenseData] = useState({ date: new Date().toISOString().split('T')[0], category: 'Fuel', amount: '', description: '', reference: '' });

  // Careers & Sustainability admin state
  const [showAddVacancyModal, setShowAddVacancyModal] = useState(false);
  const [newVacancyData, setNewVacancyData] = useState({
    title: '', department: 'Guiding & Operations', location: 'Zanzibar Head Office', type: 'Full-time', salary: '$1,200 - $1,500 / month', desc: '', requirements: '', benefits: ''
  });
  const [sustainabilityData, setSustainabilityData] = useState(() => getSustainability());
  const [sustainSaveSucc, setSustainSaveSucc] = useState(false);
  const [applicantsList, setApplicantsList] = useState<any[]>(() => JSON.parse(localStorage.getItem('ztr_applicants') || '[]'));
  const [careersRefresh, setCareersRefresh] = useState(0);

  // Setup seed users and ERP databases on mount
  useEffect(() => {
    // We will establish the hashed passwords in localStorage if not exists
    const users = localStorage.getItem('ztr_admin_users');
    if (!users) {
      const defaultUsers = [
        { username: 'gerevas', passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', name: 'Gerevas Paulo Mtaki', role: 'Administrator' }, // zanzibarpassword123
        { username: 'manager', passwordHash: '322f98f6d72d24249a15cd388f8d9516ca4d0b13cf3e3b0e13915bc5fcf7ca6c', name: 'Manager Amin', role: 'Manager' }, // managerpassword123
        { username: 'sales', passwordHash: '4f4fa1da80a9693e5066922cfb9b47e5ed7a1262d4e8b394efdc2fbf8ca58ea6', name: 'Sales Rep Salma', role: 'Sales' }, // salespassword123
        { username: 'accountant', passwordHash: '20eb81ec7d9834cbd2d8d87948cd122c81fb392a2a0ff9bb86cc5b1d4ef23b8f', name: 'Frank accountant', role: 'Accountant' }, // accountantpassword123
        { username: 'marketing', passwordHash: '36113bdf2292f39cbf8f8515c61a153835e5d1e2e92bc49692c81358d7e0099e', name: 'Neema Marketing', role: 'Marketing' }, // marketingpassword123
        { username: 'guide', passwordHash: '2a28178a9c2401f8df9765e90eb21ddb97b1ca6dcff7cedc2826cf8438db06ff', name: 'Captain Guide Ali', role: 'Guide' }, // guidepassword123
        { username: 'driver', passwordHash: '0142fa9559c5d0130db99e3ca893b86cb45e05d0e2e987f73967d1db0e987be7', name: 'Driver Juma', role: 'Driver' }, // driverpassword123
        { username: 'customer', passwordHash: '4f880fdf8b10ef1f70a1f2fc5080c98f98ff1f6f1c4df821cfdfc6a3ff6e788e', name: 'Customer John Doe', role: 'Customer' } // customerpassword123
      ];
      localStorage.setItem('ztr_admin_users', JSON.stringify(defaultUsers));
    } else {
      // Ensure all roles exist even if previously initialized
      const parsedUsers = JSON.parse(users);
      if (!parsedUsers.some((u: any) => u.username === 'accountant')) {
        const withAll = [
          ...parsedUsers,
          { username: 'accountant', passwordHash: '20eb81ec7d9834cbd2d8d87948cd122c81fb392a2a0ff9bb86cc5b1d4ef23b8f', name: 'Frank accountant', role: 'Accountant' },
          { username: 'marketing', passwordHash: '36113bdf2292f39cbf8f8515c61a153835e5d1e2e92bc49692c81358d7e0099e', name: 'Neema Marketing', role: 'Marketing' },
          { username: 'driver', passwordHash: '0142fa9559c5d0130db99e3ca893b86cb45e05d0e2e987f73967d1db0e987be7', name: 'Driver Juma', role: 'Driver' },
          { username: 'customer', passwordHash: '4f880fdf8b10ef1f70a1f2fc5080c98f98ff1f6f1c4df821cfdfc6a3ff6e788e', name: 'Customer John Doe', role: 'Customer' }
        ];
        localStorage.setItem('ztr_admin_users', JSON.stringify(withAll));
      }
    }

    // Media library initialization
    const localMedia = localStorage.getItem('ztr_media_library');
    if (localMedia) {
      setMediaList(JSON.parse(localMedia));
    } else {
      setMediaList(DEFAULT_MEDIA);
      localStorage.setItem('ztr_media_library', JSON.stringify(DEFAULT_MEDIA));
    }

    // Vehicles list initialization
    const localVehicles = localStorage.getItem('ztr_vehicles');
    if (localVehicles) {
      setVehiclesList(JSON.parse(localVehicles));
    } else {
      const defaultVehicles = [
        { id: 'v-1', plate: 'ZAN 401', model: 'Toyota Land Cruiser 4x4', capacity: 7, fuel: '85%', driver: 'Driver Juma', status: 'Active', logs: 'Stone Town Tour transfer completed.' },
        { id: 'v-2', plate: 'ZAN 882', model: 'Toyota Alphard Luxury', capacity: 5, fuel: '90%', driver: 'Driver Bakari', status: 'Active', logs: 'Airport pickup completed.' },
        { id: 'v-3', plate: 'ZAN 125', model: 'Toyota Hiace Coaster', capacity: 15, fuel: '60%', driver: 'Driver Idi', status: 'Maintenance', logs: 'AC servicing scheduled.' }
      ];
      setVehiclesList(defaultVehicles);
      localStorage.setItem('ztr_vehicles', JSON.stringify(defaultVehicles));
    }

    // Suppliers list initialization
    const localSuppliers = localStorage.getItem('ztr_suppliers');
    if (localSuppliers) {
      setSuppliersList(JSON.parse(localSuppliers));
    } else {
      const defaultSuppliers = [
        { id: 's-1', name: 'Zanzibar Serena Hotel', type: 'Accommodation', location: 'Stone Town', contact: 'info@serenahotel.co.tz', details: 'Pre-negotiated 15% discount on sea-view rooms.' },
        { id: 's-2', name: 'Nungwi Beach Resort', type: 'Accommodation', location: 'Nungwi', contact: 'booking@nungwibeach.com', details: 'All-inclusive packages and dive center access.' },
        { id: 's-3', name: 'Safari Blue Boat Crew', type: 'Excursions', location: 'Fumba', contact: 'safari.blue@zanzibar.com', details: 'Dhow charters with seafood buffet lunch.' },
        { id: 's-4', name: 'Tangawizi Spice Farms', type: 'Excursions', location: 'Kidichi', contact: 'spice@tangawizi.org', details: 'Organic spice walk and Swahili cooking lesson.' }
      ];
      setSuppliersList(defaultSuppliers);
      localStorage.setItem('ztr_suppliers', JSON.stringify(defaultSuppliers));
    }

    // Expenses list initialization
    const localExpenses = localStorage.getItem('ztr_expenses');
    if (localExpenses) {
      setExpensesList(JSON.parse(localExpenses));
    } else {
      const defaultExpenses = [
        { id: 'e-1', date: '2026-06-25', category: 'Fuel', amount: 120, description: 'Land Cruiser fuel fill-up', reference: 'ZAN-401' },
        { id: 'e-2', date: '2026-06-26', category: 'Food & Meals', amount: 85, description: 'Spice tour client lunch buffet', reference: 'Tangawizi Spice Farms' },
        { id: 'e-3', date: '2026-06-27', category: 'Park Entrance Fees', amount: 200, description: 'Jozani Forest entry tickets', reference: 'Forestry Dept' },
        { id: 'e-4', date: '2026-06-28', category: 'Maintenance', amount: 150, description: 'Hiace Coaster AC recharge', reference: 'ZAN-125' }
      ];
      setExpensesList(defaultExpenses);
      localStorage.setItem('ztr_expenses', JSON.stringify(defaultExpenses));
    }

    // Load session if still valid
    const cachedSession = localStorage.getItem('ztr_active_session');
    if (cachedSession) {
      const parsed = JSON.parse(cachedSession);
      // Validate expiration (2 hours)
      if (Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
        setSession(parsed.user);
        if (parsed.user?.role === 'Content Editor') {
          setActiveTab('cms');
        } else if (parsed.user?.role === 'Accountant') {
          setActiveTab('finances');
        } else if (parsed.user?.role === 'Guide') {
          setActiveTab('guidePortal');
        } else if (parsed.user?.role === 'Driver') {
          setActiveTab('driverPortal');
        } else if (parsed.user?.role === 'Customer') {
          setActiveTab('customerPortal');
        } else {
          setActiveTab('bookings');
        }
      } else {
        localStorage.removeItem('ztr_active_session');
      }
    }
  }, [usersRefreshTrigger]);

  // Monitor user activity for auto-logout
  useEffect(() => {
    if (!session) return;

    const handleUserInteraction = () => {
      lastActiveRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('keypress', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('scroll', handleUserInteraction);

    const interval = setInterval(() => {
      const storedTimeoutMin = parseInt(localStorage.getItem('ztr_inactivity_timeout_duration') || '30', 10);
      const timeoutDuration = storedTimeoutMin * 60 * 1000;
      const elapsed = Date.now() - lastActiveRef.current;
      if (elapsed >= timeoutDuration - 30 * 1000 && !inactivityNotice && elapsed < timeoutDuration) {
        setInactivityNotice(true);
      }
      if (elapsed >= timeoutDuration) {
        handleLogout('Session expired due to inactivity');
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keypress', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      clearInterval(interval);
    };
  }, [session, inactivityNotice]);

  // Fetch real-time Bookings from Supabase
  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setBookingsList(data);
      } else if (error) {
        console.error('Supabase fetch error, using local seed fallback:', error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadSubscribers = async () => {
    setSubscribersLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setSubscribersList(data);
      } else {
        console.error('Supabase subscribers fetch error:', error);
      }
    } catch (e) {
      console.error('Failed to load subscribers from Supabase:', e);
    } finally {
      setSubscribersLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadBookings();
      loadSubscribers();
    }
  }, [session]);

  useEffect(() => {
    if (session && activeTab === 'subscriptions') {
      loadSubscribers();
    }
  }, [activeTab, session]);

  // Export logs to compliance ledger CSV
  const handleExportAuditLogs = () => {
    const filtered = logsList.filter(log => {
      const matchSearch = 
        log.user.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        (log.ipAddress && log.ipAddress.includes(logSearchQuery)) ||
        (log.previousValue && log.previousValue.toLowerCase().includes(logSearchQuery.toLowerCase())) ||
        (log.newValue && log.newValue.toLowerCase().includes(logSearchQuery.toLowerCase()));

      const matchRole = logRoleFilter === 'all' || log.role.toLowerCase() === logRoleFilter.toLowerCase();

      let matchCategory = true;
      if (logCategoryFilter !== 'all') {
        const actionLower = log.action.toLowerCase();
        if (logCategoryFilter === 'payments') {
          matchCategory = actionLower.includes('payment') || actionLower.includes('booking') || actionLower.includes('settle') || actionLower.includes('paid') || actionLower.includes('authorized');
        } else if (logCategoryFilter === 'admin') {
          matchCategory = actionLower.includes('edit') || actionLower.includes('modify') || actionLower.includes('update') || actionLower.includes('policy') || actionLower.includes('create') || actionLower.includes('add');
        } else if (logCategoryFilter === 'media') {
          matchCategory = actionLower.includes('media') || actionLower.includes('image') || actionLower.includes('upload') || actionLower.includes('delete');
        } else if (logCategoryFilter === 'auth') {
          matchCategory = actionLower.includes('login') || actionLower.includes('logout') || actionLower.includes('logged');
        } else if (logCategoryFilter === 'ops') {
          matchCategory = actionLower.includes('vehicle') || actionLower.includes('driver') || actionLower.includes('guide') || actionLower.includes('supplier') || actionLower.includes('expense');
        }
      }

      return matchSearch && matchRole && matchCategory;
    });

    const headers = ['Event ID', 'Timestamp', 'Operator', 'Security Role', 'Security Action Description', 'Previous State', 'New State', 'IP Address'];
    const rows = filtered.map(log => [
      log.id,
      log.timestamp,
      log.user,
      log.role,
      log.action.replace(/"/g, '""'),
      (log.previousValue || 'N/A').replace(/"/g, '""'),
      (log.newValue || 'N/A').replace(/"/g, '""'),
      log.ipAddress || '127.0.0.1'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Zanzibar_Security_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addActivityLog(session?.name || 'Portal Admin', session?.role || 'Administrator', `Exported filtered administrative security audit log (${filtered.length} entries) to CSV.`);
    setLogsList(getActivities());
  };

  // Export logs to PDF Report
  const handleExportAuditLogsToPDF = () => {
    const filtered = logsList.filter(log => {
      const matchSearch = 
        log.user.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        (log.ipAddress && log.ipAddress.includes(logSearchQuery)) ||
        (log.previousValue && log.previousValue.toLowerCase().includes(logSearchQuery.toLowerCase())) ||
        (log.newValue && log.newValue.toLowerCase().includes(logSearchQuery.toLowerCase()));

      const matchRole = logRoleFilter === 'all' || log.role.toLowerCase() === logRoleFilter.toLowerCase();

      let matchCategory = true;
      if (logCategoryFilter !== 'all') {
        const actionLower = log.action.toLowerCase();
        if (logCategoryFilter === 'payments') {
          matchCategory = actionLower.includes('payment') || actionLower.includes('booking') || actionLower.includes('settle') || actionLower.includes('paid') || actionLower.includes('authorized');
        } else if (logCategoryFilter === 'admin') {
          matchCategory = actionLower.includes('edit') || actionLower.includes('modify') || actionLower.includes('update') || actionLower.includes('policy') || actionLower.includes('create') || actionLower.includes('add');
        } else if (logCategoryFilter === 'media') {
          matchCategory = actionLower.includes('media') || actionLower.includes('image') || actionLower.includes('upload') || actionLower.includes('delete');
        } else if (logCategoryFilter === 'auth') {
          matchCategory = actionLower.includes('login') || actionLower.includes('logout') || actionLower.includes('logged');
        } else if (logCategoryFilter === 'ops') {
          matchCategory = actionLower.includes('vehicle') || actionLower.includes('driver') || actionLower.includes('guide') || actionLower.includes('supplier') || actionLower.includes('expense');
        }
      }

      return matchSearch && matchRole && matchCategory;
    });

    if (filtered.length === 0) {
      alert('No logs match your current filters to export.');
      return;
    }

    generateVisitorLogsPDF(filtered);

    addActivityLog(session?.name || 'Portal Admin', session?.role || 'Administrator', `Exported filtered administrative security audit log (${filtered.length} entries) to PDF.`);
    setLogsList(getActivities());
  };

  // SHA-256 Hasher
  const sha256 = async (str: string) => {
    const utf8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!username.trim() || !password) {
      setAuthError('Please fill in credentials.');
      return;
    }

    setAuthLoading(true);
    try {
      const inputHash = await sha256(password);
      const storedUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
      const userMatch = storedUsers.find(
        (u: any) => u.username.toLowerCase() === username.trim().toLowerCase() && u.passwordHash === inputHash
      );

      if (userMatch) {
        const userInfo = {
          username: userMatch.username,
          name: userMatch.name,
          role: userMatch.role
        };
        setSession(userInfo);
        localStorage.setItem('ztr_active_session', JSON.stringify({
          user: userInfo,
          timestamp: Date.now()
        }));
        addActivityLog(userMatch.name, 'loggedIn', `Logged into Admin Portal successfully using ${userMatch.role} clearance.`);
        setInactivityNotice(false);
        if (userMatch.role === 'Content Editor') {
          setActiveTab('cms');
        } else {
          setActiveTab('bookings');
        }
      } else {
        setAuthError('Invalid username or encrypted password.');
      }
    } catch (err: any) {
      setAuthError('Error authenticating secure portal: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = (reason = 'Manual Logout') => {
    if (session) {
      addActivityLog(session.name, 'loggedOut', `${reason} executed successfully.`);
    }
    setSession(null);
    localStorage.removeItem('ztr_active_session');
    setInactivityNotice(false);
    navigate('admin/login');
  };

  // Status updates for bookings
  const updateBookingStatus = async (bookingId: any, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookingsList(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev: any) => ({ ...prev, status: newStatus }));
      }
      
      const title = bookingsList.find(b => b.id === bookingId)?.tour_name || 'Booking';
      addActivityLog(session?.name || 'Admin', 'updateBooking', `Updated booking status of "${title}" to ${newStatus}.`);
    } catch (e: any) {
      alert('Error updating booking status: ' + e.message);
    }
  };

  // Media Library triggers
  const triggerImageUpload = (e: React.ChangeEvent<HTMLInputElement>, folder: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadProgress(true);

    // Simulate clean compression & secure upload
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = () => {
        const newMedia: MediaFile = {
          id: 'ml-' + Math.floor(Math.random() * 100000),
          name: file.name,
          folder: folder,
          url: reader.result as string, // base64 representation is persistent in localStorage
          size: (file.size / 1024).toFixed(0) + ' KB',
          dimensions: 'Optimized via CMS'
        };

        const updated = [newMedia, ...mediaList];
        setMediaList(updated);
        localStorage.setItem('ztr_media_library', JSON.stringify(updated));
        setUploadProgress(false);
        addActivityLog(session?.name || 'Administrator', 'mediaUpload', `Uploaded and compressed image "${file.name}" to folder "${folder}".`);
        alert('Image successfully compressed and uploaded to CMS Media Library!');
      };
      reader.readAsDataURL(file);
    }, 1500);
  };

  const deleteMediaFile = (id: string, name: string) => {
    setConfirmDialog({
      title: 'Delete Media Asset',
      message: `Are you sure you want to delete "${name}" from media folders? This action cannot be undone.`,
      isDanger: true,
      confirmLabel: 'Delete Asset',
      onConfirm: () => {
        const updated = mediaList.filter(m => m.id !== id);
        setMediaList(updated);
        localStorage.setItem('ztr_media_library', JSON.stringify(updated));
        addActivityLog(session?.name || 'Administrator', 'mediaDelete', `Deleted image asset "${name}" from CMS library.`);
        setConfirmDialog(null);
      }
    });
  };

  // Dynamic Contact Form change handler
  const handleContactConfigChange = (field: string, val: string) => {
    const updated = {
      ...siteContent,
      contact: {
        ...siteContent.contact,
        [field]: val
      }
    };
    setSiteContent(updated);
    saveSiteContent(updated);
  };

  const handleHeroConfigChange = (field: string, val: any) => {
    const updated = {
      ...siteContent,
      hero: {
        ...siteContent.hero,
        [field]: val
      }
    };
    setSiteContent(updated);
    saveSiteContent(updated);
  };

  const handleAboutConfigChange = (field: string, val: any) => {
    const updated = {
      ...siteContent,
      about: {
        ...siteContent.about,
        [field]: val
      }
    };
    setSiteContent(updated);
    saveSiteContent(updated);
  };

  // CMS Tour operations
  const saveCmsTour = (tour: any) => {
    let updatedTours = [];
    if (siteContent.tours.some(t => t.id === tour.id)) {
      updatedTours = siteContent.tours.map(t => t.id === tour.id ? tour : t);
      addActivityLog(session?.name || 'Owner', 'cmsTourEdit', `Modified tour info for "${tour.title}".`);
    } else {
      updatedTours = [...siteContent.tours, tour];
      addActivityLog(session?.name || 'Owner', 'cmsTourAdd', `Created dynamic tour package "${tour.title}".`);
    }

    const updated = { ...siteContent, tours: updatedTours };
    setSiteContent(updated);
    saveSiteContent(updated);
    setEditTour(null);
    alert('Tour package saved to dynamic database successfully!');
  };

  const deleteCmsTour = (id: string, name: string) => {
    setConfirmDialog({
      title: 'Delete Tour Package',
      message: `Are you sure you want to completely remove the tour "${name}"? This action is irreversible and will hide the package from all search catalogs.`,
      isDanger: true,
      confirmLabel: 'Delete Tour',
      onConfirm: () => {
        const updatedTours = siteContent.tours.filter(t => t.id !== id);
        const updated = { ...siteContent, tours: updatedTours };
        setSiteContent(updated);
        saveSiteContent(updated);
        addActivityLog(session?.name || 'Owner', 'cmsTourDelete', `Removed tour package "${name}" from database.`);
        setConfirmDialog(null);
      }
    });
  };

  // CMS FAQ operations
  const saveCmsFaq = (faq: any) => {
    let updatedFaqs = [];
    const index = siteContent.faqs.findIndex(f => f.q === faq.originalQ || f.q === faq.q);
    
    if (index >= 0) {
      updatedFaqs = [...siteContent.faqs];
      updatedFaqs[index] = { category: faq.category, q: faq.q, a: faq.a };
      addActivityLog(session?.name || 'Owner', 'cmsFaqEdit', `Modified faq question: "${faq.q.substring(0, 40)}..."`);
    } else {
      updatedFaqs = [...siteContent.faqs, { category: faq.category, q: faq.q, a: faq.a }];
      addActivityLog(session?.name || 'Owner', 'cmsFaqAdd', `Added faq question under ${faq.category}.`);
    }

    const updated = { ...siteContent, faqs: updatedFaqs };
    setSiteContent(updated);
    saveSiteContent(updated);
    setEditFaq(null);
    alert('FAQ entry saved successfully!');
  };

  const deleteCmsFaq = (question: string) => {
    setConfirmDialog({
      title: 'Delete FAQ Entry',
      message: `Are you sure you want to remove the FAQ: "${question.substring(0, 60)}..."?`,
      isDanger: true,
      confirmLabel: 'Delete FAQ',
      onConfirm: () => {
        const updatedFaqs = siteContent.faqs.filter(f => f.q !== question);
        const updated = { ...siteContent, faqs: updatedFaqs };
        setSiteContent(updated);
        saveSiteContent(updated);
        addActivityLog(session?.name || 'Owner', 'cmsFaqDelete', `Deleted FAQ Entry: "${question.substring(0,40)}..."`);
        setConfirmDialog(null);
      }
    });
  };

  // CMS YouTube operations
  const saveCmsYoutubeVideo = (video: any) => {
    let updatedVideos = siteContent.youtubeVideos ? [...siteContent.youtubeVideos] : [];
    const vidId = video.id || `yt-${Date.now()}`;
    const cleanVideo = {
      id: vidId,
      title: video.title || 'Untitled Video',
      url: video.url || '',
      embedId: video.embedId || video.url.split('v=')[1]?.split('&')[0] || video.url.split('/').pop() || '',
      description: video.description || ''
    };

    const index = updatedVideos.findIndex(v => v.id === video.id);
    if (index >= 0) {
      updatedVideos[index] = cleanVideo;
      addActivityLog(session?.name || 'Owner', 'cmsYoutubeEdit', `Modified YouTube Video: "${cleanVideo.title}"`);
    } else {
      updatedVideos.push(cleanVideo);
      addActivityLog(session?.name || 'Owner', 'cmsYoutubeAdd', `Added YouTube Video: "${cleanVideo.title}"`);
    }

    const updated = { ...siteContent, youtubeVideos: updatedVideos };
    setSiteContent(updated);
    saveSiteContent(updated);
    setEditYoutubeVideo(null);
    alert('YouTube video entry saved successfully!');
  };

  const deleteCmsYoutubeVideo = (id: string, title: string) => {
    setConfirmDialog({
      title: 'Delete YouTube Video',
      message: `Are you sure you want to remove the video: "${title}"?`,
      isDanger: true,
      confirmLabel: 'Delete Video',
      onConfirm: () => {
        const updatedVideos = (siteContent.youtubeVideos || []).filter(v => v.id !== id);
        const updated = { ...siteContent, youtubeVideos: updatedVideos };
        setSiteContent(updated);
        saveSiteContent(updated);
        addActivityLog(session?.name || 'Owner', 'cmsYoutubeDelete', `Removed YouTube Video: "${title}"`);
        setConfirmDialog(null);
      }
    });
  };

  // CMS Blog operations
  const [blogRefresh, setBlogRefresh] = useState(0);
  const saveCmsBlogPost = (post: any) => {
    const postKey = post.key || String(post.id || Date.now());
    const numericId = post.id || Date.now();
    
    const updatedBlogs = { ...blogPosts };
    updatedBlogs[postKey] = {
      id: numericId,
      title: post.title || 'Untitled Post',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'Travel Tips',
      author: post.author || 'Gerevas Paulo Mtaki',
      authorBio: post.authorBio || 'Founder of Zanzibar Trip & Relax',
      date: post.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      readTime: post.readTime || '5 min read',
      image: post.image || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
      tags: Array.isArray(post.tags) ? post.tags : (post.tags || '').split(',').map((t: string) => t.trim())
    };

    saveBlogPosts(updatedBlogs);
    setBlogRefresh(prev => prev + 1);
    setEditBlogPost(null);
    addActivityLog(session?.name || 'Owner', 'cmsBlogSave', `Saved blog post: "${post.title}"`);
    alert('Blog post saved successfully!');
  };

  const deleteCmsBlogPost = (key: string, title: string) => {
    setConfirmDialog({
      title: 'Delete Blog Post',
      message: `Are you sure you want to delete the blog post: "${title}"?`,
      isDanger: true,
      confirmLabel: 'Delete Post',
      onConfirm: () => {
        const updatedBlogs = { ...blogPosts };
        delete updatedBlogs[key];
        saveBlogPosts(updatedBlogs);
        setBlogRefresh(prev => prev + 1);
        addActivityLog(session?.name || 'Owner', 'cmsBlogDelete', `Removed blog post: "${title}"`);
        setConfirmDialog(null);
      }
    });
  };

  // Export Bookings to CSV (Excel compatible)
  const exportBookingsToCSV = () => {
    if (bookingsList.length === 0) {
      alert('No bookings to export.');
      return;
    }

    const headers = ['ID', 'Customer Name', 'Email', 'WhatsApp', 'Guests', 'Experience Name', 'Date Requested', 'Pickup', 'Status', 'Submitted At'];
    const rows = bookingsList.map(b => [
      b.id,
      b.full_name,
      b.email || 'None',
      b.whatsapp_number,
      b.number_of_guests,
      b.tour_name,
      b.preferred_date,
      b.pickup_location,
      b.status,
      b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Unspecified'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Zanzibar_Bookings_Report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addActivityLog(session?.name || 'Admin', 'exportBookings', 'Exported full bookings ledger to Excel CSV.');
  };

  // Export Bookings to PDF Summary Report
  const exportBookingsToPDF = () => {
    if (bookingsList.length === 0) {
      alert('No bookings to export.');
      return;
    }
    generateBookingsSummaryPDF(bookingsList);
    addActivityLog(session?.name || 'Admin', 'exportBookingsPDF', 'Exported full bookings summary report to PDF.');
  };

  // Printable layout generator for single booking (PDF proxy)
  const printBookingReceipt = (booking: any) => {
    addActivityLog(session?.name || 'Admin', 'printBooking', `Generated printable booking ledger for customer "${booking.full_name}".`);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Reservation Receipt - ${booking.full_name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; }
            .header { border-bottom: 2px solid #D4A017; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #0B3B8C; text-transform: uppercase; }
            .badge { background: #D4A017; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
            .title { font-size: 20px; color: #0B3B8C; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; font-weight: 600; color: #475569; }
            .footer { margin-top: 50px; font-size: 12px; color: #64748b; text-align: center; border-grow-top: 1px dashed #cbd5e1; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Zanzibar Trip & Relax</div>
              <div style="font-size: 12px; color:#64748b">Stone Town, Zanzibar, Tanzania</div>
            </div>
            <div class="badge">${booking.status.toUpperCase()}</div>
          </div>
          
          <div class="title">RESERVATION VOUCHER</div>
          
          <table>
            <tr><th>Customer Name</th><td>${booking.full_name}</td></tr>
            <tr><th>Email Address</th><td>${booking.email || 'Not provided'}</td></tr>
            <tr><th>WhatsApp Number</th><td>${booking.whatsapp_number}</td></tr>
            <tr><th>Toured Program</th><td>${booking.tour_name}</td></tr>
            <tr><th>Planned Expedition Date</th><td>${booking.preferred_date}</td></tr>
            <tr><th>Pickup Location Requested</th><td>${booking.pickup_location}</td></tr>
            <tr><th>Registered Guests</th><td>${booking.number_of_guests} travelers</td></tr>
            <tr><th>Date Lodged</th><td>${booking.created_at ? new Date(booking.created_at).toLocaleString() : 'N/A'}</td></tr>
          </table>

          <div style="margin-top: 30px; background: #f8fafc; padding: 20px; border-radius: 10px;">
            <strong style="display:block; margin-bottom: 8px;">Notes & Customer Request:</strong>
            <p style="margin:0; font-size: 14px; line-height: 1.5; font-style: italic;">"${booking.message || 'No custom details specified.'}"</p>
          </div>

          <div class="footer">
            <p>Zanzibar Trip & Relax Travel Desk | Direct Phone & WhatsApp: +255 629 506 063</p>
            <p>Email: zavoyatour@gmail.com | Thank you for trusting authentic Swahili hospitality.</p>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Compile branded invoice/instructions email mailto pre-compiler
  const openEmailComposer = (booking: any) => {
    setSelectedBooking(booking);
    setEmailSubject(`Zanzibar Expedition Voucher Confirmation - Reference: ${booking.id || 'ZTR-2026'}`);
    setEmailCustomMessage(`Dear ${booking.full_name},

Greetings from Zanzibar Trip & Relax!

We are absolutely thrilled to confirm and log your upcoming trip:
🌴 Expedition: ${booking.tour_name}
📅 Date: ${booking.preferred_date}
👥 Headcount: ${booking.number_of_guests} Guests
🚗 Pickup Point: ${booking.pickup_location}

Our expert Swahili guide and clean air-conditioned private vehicle will pick you up at your hotel lobby at 08:30 AM on the day of the excursion.

💼 PAYMENT INSTRUCTIONS & COMPLIANCE:
Payment is processed safely in-person prior to tour boarding. We accept US Dollars (USD banknotes printed during and after 2013) or local Tanzanian Shillings (TZS).

WHAT TO CARRY:
Swimwear, sunscreen protection, beach towels, coral reef watershoes, and your camera.

Please feel free to text our 24/7 dedicated guest care line at +255 629 506 063 via WhatsApp for immediate live updates.

Warmest regards,

Gerevas Paulo Mtaki
Founder, Zanzibar Trip & Relax
Stone Town, Zanzibar, Tanzania`);
    setSendEmailModal(booking);
    setEmailStatus('idle');
  };

  const executeSendEmail = () => {
    setEmailStatus('sending');
    setTimeout(() => {
      setEmailStatus('sent');
      addActivityLog(session?.name || 'Portal Manager', 'sendEmail', `Dispatched official itinerary, pricing & payment invoice template to "${sendEmailModal.full_name}" (${sendEmailModal.email || 'No email'}).`);
      
      // Open clean mailto as a visual confirmation
      const mailtoUrl = `mailto:${sendEmailModal.email || 'zavoyatour@gmail.com'}?cc=zavoyatour@gmail.com&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailCustomMessage)}`;
      window.open(mailtoUrl, '_blank');
      
      setTimeout(() => {
        setSendEmailModal(null);
      }, 1500);
    }, 1000);
  };

  const validateBooking = (booking: any): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!booking.full_name || !booking.full_name.trim()) {
      errors.full_name = 'Customer Full Name is required.';
    } else if (booking.full_name.trim().length < 3) {
      errors.full_name = 'Customer Full Name must be at least 3 characters.';
    }

    if (!booking.whatsapp_number || !booking.whatsapp_number.trim()) {
      errors.whatsapp_number = 'WhatsApp contact phone is required.';
    } else if (booking.whatsapp_number.trim().length < 5) {
      errors.whatsapp_number = 'WhatsApp phone must be at least 5 digits/characters.';
    } else if (!/^[+\s\d()-]+$/.test(booking.whatsapp_number.trim())) {
      errors.whatsapp_number = 'WhatsApp phone must only contain digits, spaces, +, -, (, ).';
    }

    if (booking.email && booking.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(booking.email.trim())) {
        errors.email = 'Please provide a valid email address.';
      }
    }

    const guestsNum = Number(booking.number_of_guests);
    if (isNaN(guestsNum) || guestsNum < 1) {
      errors.number_of_guests = 'Number of guests must be at least 1 traveler.';
    } else if (guestsNum > 100) {
      errors.number_of_guests = 'Maximum capacity per booking update is 100 travelers.';
    }

    if (!booking.tour_name || !booking.tour_name.trim()) {
      errors.tour_name = 'Destination / Tour Package name is required.';
    } else if (booking.tour_name.trim().length < 3) {
      errors.tour_name = 'Destination / Tour Package must be at least 3 characters.';
    }

    if (!booking.preferred_date || !booking.preferred_date.trim()) {
      errors.preferred_date = 'Target travel date is required.';
    } else {
      const dateParts = booking.preferred_date.split('-');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        if (year < 2020 || year > 2100) {
          errors.preferred_date = 'Please select a plausible year (between 2020 and 2100).';
        }
      }
    }

    return errors;
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    const errors = validateBooking(editingBooking);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          full_name: editingBooking.full_name,
          email: editingBooking.email || null,
          whatsapp_number: editingBooking.whatsapp_number,
          number_of_guests: Number(editingBooking.number_of_guests) || 1,
          tour_name: editingBooking.tour_name,
          preferred_date: editingBooking.preferred_date,
          pickup_location: editingBooking.pickup_location,
          status: editingBooking.status,
          message: editingBooking.message
        })
        .eq('id', editingBooking.id);

      if (error) throw error;

      addActivityLog(session?.name || 'Admin', 'editBooking', `Modified booking details for customer "${editingBooking.full_name}".`);
      
      await loadBookings();
      
      if (selectedBooking && selectedBooking.id === editingBooking.id) {
        setSelectedBooking({ ...selectedBooking, ...editingBooking });
      }

      setEditingBooking(null);
    } catch (err: any) {
      alert("Error updating booking record: " + err.message);
    }
  };

  const handleDeleteBooking = async () => {
    if (!deletingBooking) return;
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      alert("Please type 'DELETE' to confirm deletion.");
      return;
    }
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', deletingBooking.id);

      if (error) throw error;

      addActivityLog(session?.name || 'Admin', 'deleteBooking', `Deleted booking record for customer "${deletingBooking.full_name}".`);
      
      await loadBookings();
      
      if (selectedBooking && selectedBooking.id === deletingBooking.id) {
        setSelectedBooking(null);
      }

      setDeletingBooking(null);
      setDeleteConfirmationText('');
    } catch (err: any) {
      alert("Error deleting booking record: " + err.message);
    }
  };

  // Derived unique customers list from live bookings ledger
  const customersList = React.useMemo(() => {
    const customerMap = new Map<string, any>();
    
    bookingsList.forEach((b) => {
      const emailKey = b.email?.toLowerCase().trim();
      const nameKey = b.full_name?.toLowerCase().trim();
      const key = emailKey || nameKey || b.id;
      
      const existing = customerMap.get(key);
      if (!existing) {
        customerMap.set(key, {
          id: b.id,
          full_name: b.full_name,
          email: b.email || '',
          whatsapp_number: b.whatsapp_number || 'N/A',
          total_bookings: 1,
          total_guests: Number(b.number_of_guests) || 0,
          latest_experience: b.tour_name,
          latest_date: b.preferred_date,
          status: b.status,
          created_at: b.created_at,
        });
      } else {
        existing.total_bookings += 1;
        existing.total_guests += Number(b.number_of_guests) || 0;
        
        if (b.created_at && (!existing.created_at || new Date(b.created_at) > new Date(existing.created_at))) {
          existing.latest_experience = b.tour_name;
          existing.latest_date = b.preferred_date;
          existing.status = b.status;
          existing.created_at = b.created_at;
        }
      }
    });
    
    return Array.from(customerMap.values());
  }, [bookingsList]);

  // Calculate statistics for admin display
  const totalInquiriesCount = bookingsList.length;
  const pendingCount = bookingsList.filter(b => b.status === 'pending').length;
  const confirmedCount = bookingsList.filter(b => b.status === 'confirmed' || b.status === 'approved').length;

  // Helper to parse price for estimating booking values
  const getEstimatedPrice = (tourName: string) => {
    const name = (tourName || '').toLowerCase();
    if (name.includes('safari blue') || name.includes('ocean cruise')) return 45;
    if (name.includes('mnemba')) return 35;
    if (name.includes('stone town')) return 20;
    if (name.includes('prison')) return 25;
    if (name.includes('spice')) return 15;
    if (name.includes('jozani') || name.includes('forest')) return 25;
    if (name.includes('sunset')) return 55;
    if (name.includes('nakupenda')) return 70;
    if (name.includes('quad') || name.includes('atv')) return 65;
    if (name.includes('serengeti') || name.includes('safari')) return 350;
    if (name.includes('kilimanjaro')) return 500;
    return 50; // default
  };

  // State for Admin Analytics Suite
  const [showCharts, setShowCharts] = useState(true);
  const [chartTab, setChartTab] = useState<'trends' | 'payments' | 'packages' | 'statuses'>('trends');
  const [revenueInterval, setRevenueInterval] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Chart data calculations
  const chartData = React.useMemo(() => {
    // 1. Calculate Travel Trends by Day, Week, and Month
    const dailyCounts: Record<string, { date: string; bookings: number; guests: number; revenue: number }> = {};
    const weeklyCounts: Record<string, { week: string; weekDate: Date; bookings: number; guests: number; revenue: number }> = {};
    const monthlyCounts: Record<string, { month: string; bookings: number; guests: number; revenue: number }> = {};
    
    // 2. Calculate Popular Tour Packages
    const tourCounts: Record<string, { name: string; bookings: number; guests: number; revenue: number }> = {};
    
    // 3. Calculate Booking Status Distribution
    const statusCounts: Record<string, { name: string; value: number }> = {
      pending: { name: 'Pending', value: 0 },
      confirmed: { name: 'Confirmed', value: 0 },
      approved: { name: 'Approved', value: 0 },
      rejected: { name: 'Rejected', value: 0 },
      cancelled: { name: 'Cancelled', value: 0 }
    };

    // Helper to format week label from date string
    const getWeekLabelAndDate = (dateString: string) => {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return null;
      const day = d.getDay();
      // Set to previous Monday
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.getFullYear(), d.getMonth(), diff);
      const mm = String(weekStart.getMonth() + 1).padStart(2, '0');
      const dd = String(weekStart.getDate()).padStart(2, '0');
      return {
        label: `Wk of ${mm}/${dd}`,
        date: weekStart
      };
    };

    let calculatedRevenue = 0;
    let totalGuestsCount = 0;

    // 4. Calculate Payment Status Summaries
    let collectedPaidRevenue = 0;
    let pendingDepositsRevenue = 0;
    let pendingBalancesRevenue = 0;
    let overdueBalancesRevenue = 0;

    const today = new Date();

    bookingsList.forEach(b => {
      const pricePerGuest = getEstimatedPrice(b.tour_name);
      const guests = Number(b.number_of_guests) || 1;
      const totalCost = pricePerGuest * guests;

      const st = (b.status || 'pending').toLowerCase();
      
      if (st !== 'cancelled' && st !== 'rejected') {
        calculatedRevenue += totalCost;
        totalGuestsCount += guests;

        // Payment status details based on policies
        const tourNameLower = (b.tour_name || '').toLowerCase();
        let depositPct = 30; // default tours deposit is 30%
        
        if (tourNameLower.includes('kilimanjaro')) {
          depositPct = policies.kilimanjaro.depositPct;
        } else if (tourNameLower.includes('safari') && (tourNameLower.includes('fly') || tourNameLower.includes('flight'))) {
          depositPct = policies.safari_fly_in.depositPct;
        } else if (tourNameLower.includes('safari')) {
          depositPct = policies.safari_multi.depositPct;
        } else if (tourNameLower.includes('transfer') || tourNameLower.includes('airport')) {
          depositPct = policies.transfers.depositPct;
        } else {
          depositPct = policies.tours.depositPct;
        }

        const requiredDeposit = totalCost * (depositPct / 100);
        const remainingBalance = totalCost - requiredDeposit;

        if (st === 'pending') {
          pendingDepositsRevenue += requiredDeposit;
          pendingBalancesRevenue += remainingBalance;
        } else if (st === 'confirmed' || st === 'approved' || st === 'paid') {
          collectedPaidRevenue += requiredDeposit;

          const travelDate = b.preferred_date ? new Date(b.preferred_date) : null;
          if (travelDate) {
            const diffTime = travelDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
              // Past departure, assume full payout is collected
              collectedPaidRevenue += remainingBalance;
            } else if (diffDays <= 3) {
              // Departure in <= 3 days, balance is overdue if not fully paid
              overdueBalancesRevenue += remainingBalance;
            } else {
              pendingBalancesRevenue += remainingBalance;
            }
          } else {
            pendingBalancesRevenue += remainingBalance;
          }
        }
      }

      // Date parsing for trends
      const dateStr = b.preferred_date || '';
      if (dateStr && st !== 'cancelled' && st !== 'rejected') {
        // Daily grouping
        if (!dailyCounts[dateStr]) {
          dailyCounts[dateStr] = { date: dateStr, bookings: 0, guests: 0, revenue: 0 };
        }
        dailyCounts[dateStr].bookings += 1;
        dailyCounts[dateStr].guests += guests;
        dailyCounts[dateStr].revenue += totalCost;

        // Weekly grouping
        const weekInfo = getWeekLabelAndDate(dateStr);
        if (weekInfo) {
          if (!weeklyCounts[weekInfo.label]) {
            weeklyCounts[weekInfo.label] = { week: weekInfo.label, weekDate: weekInfo.date, bookings: 0, guests: 0, revenue: 0 };
          }
          weeklyCounts[weekInfo.label].bookings += 1;
          weeklyCounts[weekInfo.label].guests += guests;
          weeklyCounts[weekInfo.label].revenue += totalCost;
        }

        // Monthly grouping
        let monthLabel = 'Unspecified';
        if (dateStr.includes('-')) {
          const parts = dateStr.split('-');
          if (parts.length >= 2) {
            const year = parts[0];
            const monthNum = parseInt(parts[1], 10);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            if (monthNum >= 1 && monthNum <= 12) {
              monthLabel = `${months[monthNum - 1]} ${year}`;
            }
          }
        }
        if (!monthlyCounts[monthLabel]) {
          monthlyCounts[monthLabel] = { month: monthLabel, bookings: 0, guests: 0, revenue: 0 };
        }
        monthlyCounts[monthLabel].bookings += 1;
        monthlyCounts[monthLabel].guests += guests;
        monthlyCounts[monthLabel].revenue += totalCost;
      }

      // 2. Popular Tours
      let rawTourName = b.tour_name || 'Other';
      if (rawTourName.includes(':')) {
        rawTourName = rawTourName.split(':').slice(1).join(':').trim();
      }
      if (!tourCounts[rawTourName]) {
        tourCounts[rawTourName] = { name: rawTourName, bookings: 0, guests: 0, revenue: 0 };
      }
      tourCounts[rawTourName].bookings += 1;
      tourCounts[rawTourName].guests += guests;
      tourCounts[rawTourName].revenue += totalCost;

      // 3. Status Distribution
      if (statusCounts[st]) {
        statusCounts[st].value += 1;
      } else {
        if (!statusCounts[st]) {
          statusCounts[st] = { name: st.toUpperCase(), value: 0 };
        }
        statusCounts[st].value += 1;
      }
    });

    // Sort days chronologically
    const sortedDaily = Object.values(dailyCounts).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Sort weeks chronologically
    const sortedWeekly = Object.values(weeklyCounts).sort((a, b) => {
      return a.weekDate.getTime() - b.weekDate.getTime();
    });

    // Sort months chronologically
    const sortedMonths = Object.values(monthlyCounts).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

    // Popular tours sorted by bookings
    const sortedTours = Object.values(tourCounts)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    // Filter out 0 value statuses
    const statusArray = Object.values(statusCounts).filter(s => s.value > 0);

    const paymentDistribution = [
      { name: 'Collected (Deposits/Paid)', value: Math.round(collectedPaidRevenue), color: '#10B981' },
      { name: 'Pending Deposits', value: Math.round(pendingDepositsRevenue), color: '#F59E0B' },
      { name: 'Pending Balances', value: Math.round(pendingBalancesRevenue), color: '#3B82F6' },
      { name: 'Overdue Balances', value: Math.round(overdueBalancesRevenue), color: '#EF4444' }
    ].filter(item => item.value > 0);

    const avgGuests = bookingsList.length > 0 ? (totalGuestsCount / bookingsList.length).toFixed(1) : '0';
    const convRate = bookingsList.length > 0 ? ((confirmedCount / bookingsList.length) * 100).toFixed(0) : '0';

    return {
      dailyTrends: sortedDaily,
      weeklyTrends: sortedWeekly,
      monthlyTrends: sortedMonths,
      popularTours: sortedTours,
      statusDistribution: statusArray,
      paymentDistribution,
      totalRevenue: calculatedRevenue,
      collectedRevenue: collectedPaidRevenue,
      pendingDeposits: pendingDepositsRevenue,
      pendingBalances: pendingBalancesRevenue,
      overdueBalances: overdueBalancesRevenue,
      avgGuests,
      conversionRate: convRate
    };
  }, [bookingsList, confirmedCount, policies]);

  // Render Login page if not authorized
  if (!session) {
    return (
      <div className="min-h-screen bg-[#020C1F] flex items-center justify-center p-4 relative overflow-hidden text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Abstract background vector circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0B3B8C] rounded-full filter blur-[150px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#D4A017] rounded-full filter blur-[180px] opacity-10 pointer-events-none" />

        <div className="max-w-md w-full relative z-10 my-8">
          <div className="bg-[#051128] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-[#0B3B8C]/20 border border-[#D4A017]/30 rounded-full flex items-center justify-center mb-2">
                <Lock className="w-8 h-8 text-[#D4A017] animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-1" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                Zanzibar Trip & Relax
              </h1>
              <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase">
                Enterprise Travel & Tour ERP
              </p>
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <ShieldAlert size={14} className="shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Username, Email, or Phone</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full text-sm bg-[#081835] border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                    placeholder="e.g. gerevas or admin@zanzibar.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Password</label>
                <div className="relative">
                  {showPassword ? (
                    <EyeOff size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer" onClick={() => setShowPassword(false)} />
                  ) : (
                    <Eye size={16} className="absolute right-3.5 top-3.5 text-slate-400 cursor-pointer" onClick={() => setShowPassword(true)} />
                  )}
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full text-sm bg-[#081835] border border-white/15 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-[#D4A017] transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#D4A017]/10"
              >
                {authLoading ? 'Verifying Safe Session...' : 'Authenticate Securely'}
              </button>
            </form>

            {/* QUICK SANDBOX ROLE DIRECT LOGIN SWITCHER */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider">Quick Demo Clearances:</span>
                <span className="text-[9px] text-slate-500 font-mono">Click to test instant roles</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { name: 'Gerevas', label: '👑 Super Admin', user: 'gerevas', pass: 'zanzibarpassword123', target: 'bookings' },
                  { name: 'Amin', label: '📊 Manager', user: 'manager', pass: 'managerpassword123', target: 'bookings' },
                  { name: 'Salma', label: '🎫 Reservation', user: 'sales', pass: 'salespassword123', target: 'bookings' },
                  { name: 'Frank', label: '🧮 Accountant', user: 'accountant', pass: 'accountantpassword123', target: 'finances' },
                  { name: 'Neema', label: '📣 Marketing', user: 'marketing', pass: 'marketingpassword123', target: 'subscriptions' },
                  { name: 'Ali', label: '🧭 Tour Guide', user: 'guide', pass: 'guidepassword123', target: 'guidePortal' },
                  { name: 'Juma', label: '🚐 Tour Driver', user: 'driver', pass: 'driverpassword123', target: 'driverPortal' },
                  { name: 'John', label: '👤 Customer', user: 'customer', pass: 'customerpassword123', target: 'customerPortal' }
                ].map(demo => (
                  <button
                    key={demo.user}
                    onClick={() => {
                      setUsername(demo.user);
                      setPassword(demo.pass);
                      setAuthError('');
                      // Automatically execute immediate secure login session bypass for developer speed
                      const defaultUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
                      const found = defaultUsers.find((u: any) => u.username === demo.user);
                      if (found) {
                        const userInfo = { username: found.username, name: found.name, role: found.role };
                        setSession(userInfo);
                        localStorage.setItem('ztr_active_session', JSON.stringify({
                          user: userInfo,
                          timestamp: Date.now()
                        }));
                        addActivityLog(found.name, 'loggedIn', `Direct logged-in as demo role [${found.role}] via Sandbox console.`);
                        setActiveTab(demo.target);
                        setInactivityNotice(false);
                      }
                    }}
                    className="bg-[#121B30] hover:bg-[#1b2745] text-slate-300 hover:text-white border border-white/5 py-1.5 px-2 rounded-lg text-[10px] font-bold text-left truncate transition-colors flex items-center justify-between"
                  >
                    <span>{demo.label}</span>
                    <span className="text-[8px] opacity-40">→</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-3 text-center">
              <span className="text-[10px] text-slate-400 font-medium">
                Encrypted with PBKDF2 WebCrypto client layer &copy; 2026 Admin Panel.
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('home')} 
            className="mt-4 mx-auto block text-xs font-bold text-slate-400 hover:text-white transition-all underline"
          >
            ← Back to Public Website
          </button>
        </div>
      </div>
    );
  }

  const hasAccess = (moduleKey: string, requiredLevel: 'read' | 'write') => {
    if (!session) return false;
    // Administrator & super-admin always have full unrestricted access
    if (session.role === 'Administrator' || session.role === 'super-admin') return true;
    
    const perm = rolePermissions[session.role]?.[moduleKey] || 'none';
    if (perm === 'write') return true;
    if (perm === 'read' && requiredLevel === 'read') return true;
    return false;
  };

  const isCMSReadOnly = !hasAccess('cms', 'write');
  const isMediaReadOnly = !hasAccess('media', 'write');
  const isBookingReadOnly = !hasAccess('bookings', 'write');

  const renderRestrictedState = (moduleName: string) => {
    return (
      <div className="bg-[#051128] border border-red-500/10 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-6 my-12 shadow-2xl">
        <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            Access Restricted
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Your current role (<strong className="text-slate-300 capitalize">{session?.role.replace('-', ' ')}</strong>) does not possess permission to access the <strong className="text-white">{moduleName}</strong> module.
          </p>
        </div>
        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 text-[10px] text-slate-400 text-left space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <Lock size={12} />
            <span>ADMINISTRATIVE CLEARANCE REQUIRED</span>
          </div>
          <p>
            The system permissions for this role have been customized by a Super Admin. Please contact your system administrator to adjust your role privileges.
          </p>
        </div>
      </div>
    );
  };

  // Loaded Premium Dashboard Layout
  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex flex-col md:flex-row" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* LEFT NAVIGATION COLUMN */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cmsEditSection={cmsEditSection}
        setCmsEditSection={setCmsEditSection}
        session={session}
        bookingsCount={bookingsList.length}
        subscribersCount={subscribersList.length}
        jobsCount={getJobs().length}
        usersCount={JSON.parse(localStorage.getItem('ztr_admin_users') || '[]').length}
        vehiclesCount={vehiclesList.length}
        navigate={navigate}
        handleLogout={handleLogout}
      />

      {/* RIGHT WORKSPACE AREA */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-h-screen">
        
        {/* TOP STATUS ROW */}
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              {activeTab === 'dashboard' ? 'Analytics Dashboard' :
               activeTab === 'settings' ? 'Company Configuration' :
               activeTab === 'bookings' ? 'Bookings Ledger' : 
               activeTab === 'customers' ? 'Customer Profile Directory' :
               activeTab === 'calendar' ? 'Interactive Reservation Calendar' :
               activeTab === 'vehicles' ? 'Vehicles & Fleet Operations' :
               activeTab === 'finances' ? 'Accounting & Financial Ledger' :
               activeTab === 'suppliers' ? 'Suppliers & Hotel Directory' :
               activeTab === 'guidePortal' ? 'Tour Guide Assignment Desk' :
               activeTab === 'driverPortal' ? 'Driver Pickup & Transfer Sheets' :
               activeTab === 'customerPortal' ? 'My Guest Reservation Desk' :
               activeTab === 'cms' ? 'Visual CMS Editor' :
               activeTab === 'media' ? 'Media Asset Library' :
               activeTab === 'users' ? 'Staff Authorization & Roles' :
               activeTab === 'policies' ? 'Holiday Payment Policies' :
               activeTab === 'transportZones' ? 'Transport Zones & Hotels' :
               activeTab === 'seo' ? 'Search Engine SEO Analytics' :
               'Security & Activity Logs'}
            </h1>
            <p className="text-xs text-slate-400">
              {activeTab === 'dashboard' ? 'Dynamic travel demand, revenue estimation, and conversion indexes.' :
               activeTab === 'settings' ? 'Manage global preferences, currency symbols, session timeouts, and visual accents.' :
               activeTab === 'users' ? 'Manage system identities, clearances, and custom organizational permissions' : 
               activeTab === 'policies' ? 'Configure deposit percentages, cut-off hours and checkout rules for each tour category' :
               activeTab === 'transportZones' ? 'Manage geographical zones, transport surcharges, hotel options and perform bulk CSV hotel uploads' :
               activeTab === 'customers' ? 'Monitor unique tourist contacts, historic reservation count, and communications.' :
               activeTab === 'calendar' ? 'Visual daily itinerary schedules and reservation bookings overview.' :
               activeTab === 'vehicles' ? 'Track company fuel logs, service checkups, driver allocations, and fleet usage.' :
               activeTab === 'finances' ? 'Monitor expenditures, cash-flows, guide tips, and net estimated tour profits.' :
               activeTab === 'suppliers' ? 'Manage third-party resort allotments, dhow boat suppliers, and spice garden contacts.' :
               activeTab === 'guidePortal' ? 'Tour Guide checklist, passenger details, language sheets, and feedback.' :
               activeTab === 'driverPortal' ? 'Driver transfer schedules, passenger counts, vehicle check-offs, and live navigation links.' :
               activeTab === 'customerPortal' ? 'Review your logged Zanzibar reservations, download vouchers, or send immediate guest notes.' :
               activeTab === 'seo' ? 'Real-time search click indexes, keyword impressions, CTR curves, and ranking telemetry.' :
               'Manage real-time tour and travel reservations safely.'}
            </p>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span>Server status: <span className="text-green-400 font-bold">● Operational</span></span>
            <span>Local Sync: <span className="text-[#D4A017] font-bold">Active</span></span>
          </div>
        </div>

        {/* INACTIVITY WARNING NOTICE TO PREVENT DATA LOSS */}
        {inactivityNotice && (
          <div className="bg-[#D4A017]/15 border border-[#D4A017]/30 text-[#D4A017] p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>You have been inactive. For tourist privacy and compliance, you will be automatically logged out soon.</span>
            </div>
            <button onClick={() => { lastActiveRef.current = Date.now(); setInactivityNotice(false); }} className="bg-[#D4A017] text-[#020C1F] px-3 py-1 rounded-lg font-bold">
              Stay Active
            </button>
          </div>
        )}

        {/* Dashboard workspace tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0A1224] border border-white/5 p-5 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Inquiries Received</span>
                <p className="text-3xl font-black text-white">{totalInquiriesCount}</p>
                <div className="text-[10px] text-slate-500 font-medium">Aggregated logs since startup</div>
              </div>

              <div className="bg-[#0A1224] border border-white/5 p-5 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Needs Immediate Attention</span>
                <p className="text-3xl font-black text-[#D4A017]">{pendingCount} Pending</p>
                <div className="text-[10px] text-slate-500 font-medium">Awaiting staff confirmation</div>
              </div>

              <div className="bg-[#0A1224] border border-white/5 p-5 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Confirmed Voyages</span>
                <p className="text-3xl font-black text-emerald-400">{confirmedCount} Trips</p>
                <div className="text-[10px] text-slate-500 font-medium">Approved and locked bookings</div>
              </div>
            </div>

            {/* Visual Summary Charts Section */}
            <div className="bg-[#0A1224] border border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#D4A017]/10 rounded-xl text-[#D4A017]">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Visual Analytics & Ledger Trends</h3>
                    <p className="text-[10px] text-slate-400">Dynamic travel demand, revenue estimation, and conversion indexes.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-[#121B30] p-1 rounded-xl border border-white/5 overflow-x-auto max-w-[280px] sm:max-w-none scrollbar-none">
                    <button
                      onClick={() => setChartTab('trends')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                        chartTab === 'trends'
                          ? 'bg-[#0B3B8C] text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Revenue Trends
                    </button>
                    <button
                      onClick={() => setChartTab('payments')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                        chartTab === 'payments'
                          ? 'bg-[#0B3B8C] text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Pending Payments
                    </button>
                    <button
                      onClick={() => setChartTab('packages')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                        chartTab === 'packages'
                          ? 'bg-[#0B3B8C] text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Popular Tours
                    </button>
                    <button
                      onClick={() => setChartTab('statuses')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                        chartTab === 'statuses'
                          ? 'bg-[#0B3B8C] text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Status Clearances
                    </button>
                  </div>

                  <button
                    onClick={() => setShowCharts(!showCharts)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                    title={showCharts ? "Collapse analytics panel" : "Expand analytics panel"}
                  >
                    {showCharts ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {showCharts && (
                <div className="space-y-6 animate-fade-in">
                  {/* Performance stats mini row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#121B30]/40 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Est. Ledger Gross</span>
                        <p className="text-base font-black text-[#D4A017]">${chartData.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                        <DollarSign size={14} />
                      </div>
                    </div>

                    <div className="bg-[#121B30]/40 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Average Party Size</span>
                        <p className="text-base font-black text-slate-200">{chartData.avgGuests} Guests</p>
                      </div>
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                        <Users size={14} />
                      </div>
                    </div>

                    <div className="bg-[#121B30]/40 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status Conversion Rate</span>
                        <p className="text-base font-black text-emerald-400">{chartData.conversionRate}%</p>
                      </div>
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <Activity size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Active Chart view */}
                  <div className="space-y-4 select-none">
                    {bookingsList.length === 0 ? (
                      <div className="h-[280px] flex flex-col items-center justify-center text-slate-500 gap-2 border border-dashed border-white/5 rounded-xl bg-[#121B30]/10">
                        <Activity size={24} className="opacity-40 animate-pulse" />
                        <span className="text-[10px] font-bold">Waiting for live ledger entries to populate charts...</span>
                      </div>
                    ) : chartTab === 'trends' ? (
                      <div className="space-y-3">
                        {/* Time interval toggle */}
                        <div className="flex justify-between items-center bg-[#121B30]/30 px-3 py-2 rounded-xl border border-white/5">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Revenue Interval Selector:</span>
                          <div className="flex bg-[#121B30]/80 p-0.5 rounded-lg border border-white/5">
                            {(['daily', 'weekly', 'monthly'] as const).map((interval) => (
                              <button
                                key={interval}
                                onClick={() => setRevenueInterval(interval)}
                                className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                                  revenueInterval === interval
                                    ? 'bg-[#D4A017] text-[#020C1F] shadow-sm font-black'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {interval}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Revenue trend line chart */}
                        <div className="h-[280px] w-full text-xs font-mono">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={
                                revenueInterval === 'daily'
                                  ? chartData.dailyTrends
                                  : revenueInterval === 'weekly'
                                  ? chartData.weeklyTrends
                                  : chartData.monthlyTrends
                              }
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#D4A017" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#D4A017" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0B3B8C" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#0B3B8C" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                              <XAxis 
                                dataKey={revenueInterval === 'daily' ? 'date' : revenueInterval === 'weekly' ? 'week' : 'month'} 
                                stroke="#94a3b860" 
                                tickLine={false} 
                                axisLine={false} 
                                style={{ fontSize: 9, fontFamily: 'monospace' }} 
                              />
                              <YAxis 
                                yAxisId="left"
                                stroke="#94a3b860" 
                                tickLine={false} 
                                axisLine={false} 
                                style={{ fontSize: 9, fontFamily: 'monospace' }}
                                tickFormatter={(v) => `$${v}`}
                              />
                              <YAxis 
                                yAxisId="right"
                                orientation="right"
                                stroke="#94a3b860" 
                                tickLine={false} 
                                axisLine={false} 
                                style={{ fontSize: 9, fontFamily: 'monospace' }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#0A1224', 
                                  borderColor: '#ffffff1a', 
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontFamily: 'monospace',
                                  color: '#cbd5e1'
                                }} 
                                labelClassName="text-white font-bold mb-1"
                              />
                              <Legend 
                                wrapperStyle={{ fontSize: 9, paddingTop: 10 }}
                                verticalAlign="bottom"
                              />
                              <Area 
                                yAxisId="left"
                                name="Est. Gross Revenue ($)" 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#D4A017" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                              />
                              <Area 
                                yAxisId="right"
                                name="Reservation Count" 
                                type="monotone" 
                                dataKey="bookings" 
                                stroke="#0B3B8C" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorBookings)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : chartTab === 'payments' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
                        {/* Donut Chart */}
                        <div className="h-[240px] flex items-center justify-center relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData.paymentDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {chartData.paymentDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#0A1224', 
                                  borderColor: '#ffffff1a', 
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  color: '#cbd5e1'
                                }} 
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          {/* Inner total text */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Value</span>
                            <span className="text-lg font-black text-white">${chartData.totalRevenue.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Payment Breakdown Cards List */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-1 flex items-center justify-between">
                            <span>Payment Stage Breakdown</span>
                            <span className="text-[#D4A017] lowercase font-mono">live policies applied</span>
                          </h4>
                          <div className="space-y-2">
                            {[
                              { label: 'Collected Revenue', value: chartData.collectedRevenue, color: 'bg-emerald-500', desc: 'Prepayments & realized completed tour balances' },
                              { label: 'Pending Deposits', value: chartData.pendingDeposits, color: 'bg-amber-500', desc: 'Unpaid security prepayments for unconfirmed bookings' },
                              { label: 'Pending Balances', value: chartData.pendingBalances, color: 'bg-blue-500', desc: 'Outstanding balances due in-person at check-in' },
                              { label: 'Overdue Balances', value: chartData.overdueBalances, color: 'bg-red-500', desc: 'Balances due within 72 hrs of upcoming departure' }
                            ].map((item, idx) => {
                              const total = chartData.totalRevenue || 1;
                              const pct = ((item.value / total) * 100).toFixed(0);
                              return (
                                <div key={idx} className="bg-[#121B30]/30 border border-white/5 p-2.5 rounded-xl flex items-center justify-between gap-4 transition-all hover:bg-[#121B30]/50">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className={`w-3 h-3 rounded-full shrink-0 ${item.color}`} />
                                    <div className="min-w-0">
                                      <p className="text-xs font-black text-slate-200 truncate">{item.label}</p>
                                      <p className="text-[9px] text-slate-400 truncate font-semibold leading-none mt-0.5">{item.desc}</p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xs font-black text-white font-mono">${Math.round(item.value).toLocaleString()}</p>
                                    <p className="text-[9px] text-slate-500 font-bold font-mono">{pct}%</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : chartTab === 'packages' ? (
                      <div className="h-[280px] w-full text-xs font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData.popularTours}
                            layout="vertical"
                            margin={{ top: 10, right: 10, left: 30, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={false} />
                            <XAxis 
                              type="number" 
                              stroke="#94a3b860" 
                              tickLine={false} 
                              axisLine={false} 
                              style={{ fontSize: 9, fontFamily: 'monospace' }} 
                            />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              stroke="#94a3b860" 
                              tickLine={false} 
                              axisLine={false} 
                              width={100}
                              style={{ fontSize: 9, fontWeight: 'bold' }} 
                              tickFormatter={(v) => v.length > 20 ? `${v.substring(0, 18)}...` : v}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#0A1224', 
                                borderColor: '#ffffff1a', 
                                borderRadius: '12px',
                                fontSize: '11px',
                                color: '#cbd5e1'
                              }} 
                            />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                            <Bar 
                              name="Total Guests Carried" 
                              dataKey="guests" 
                              fill="#0B3B8C" 
                              radius={[0, 6, 6, 0]}
                              barSize={12}
                            />
                            <Bar 
                              name="Gross Bookings Count" 
                              dataKey="bookings" 
                              fill="#D4A017" 
                              radius={[0, 6, 6, 0]}
                              barSize={12}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full items-center">
                        <div className="h-full max-h-[220px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData.statusDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {chartData.statusDistribution.map((entry, index) => {
                                  let color = '#D4A017'; // gold
                                  if (entry.name.toLowerCase() === 'confirmed') color = '#10B981'; // green
                                  if (entry.name.toLowerCase() === 'approved') color = '#34D399'; // light green
                                  if (entry.name.toLowerCase() === 'pending') color = '#F59E0B'; // amber
                                  if (entry.name.toLowerCase() === 'rejected') color = '#EF4444'; // red
                                  if (entry.name.toLowerCase() === 'cancelled') color = '#F43F5E'; // rose
                                  return <Cell key={`cell-${index}`} fill={color} />;
                                })}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#0A1224', 
                                  borderColor: '#ffffff1a', 
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  color: '#cbd5e1'
                                }} 
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Status Legend table */}
                        <div className="space-y-2 max-w-sm mx-auto w-full px-4">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-1">Ledger Clearances</h4>
                          <div className="space-y-1.5 text-[11px]">
                            {chartData.statusDistribution.map((entry, index) => {
                              let dotColor = 'bg-[#D4A017]';
                              if (entry.name.toLowerCase() === 'confirmed') dotColor = 'bg-[#10B981]';
                              if (entry.name.toLowerCase() === 'approved') dotColor = 'bg-[#34D399]';
                              if (entry.name.toLowerCase() === 'pending') dotColor = 'bg-[#F59E0B]';
                              if (entry.name.toLowerCase() === 'rejected') dotColor = 'bg-[#EF4444]';
                              if (entry.name.toLowerCase() === 'cancelled') dotColor = 'bg-[#F43F5E]';
                              
                              const total = chartData.statusDistribution.reduce((acc, curr) => acc + curr.value, 0);
                              const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0';

                              return (
                                <div key={index} className="flex items-center justify-between py-0.5 border-b border-white/5">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                                    <span className="font-bold text-slate-300 capitalize">{entry.name}</span>
                                  </div>
                                  <div className="font-mono text-slate-400 flex items-center gap-2">
                                    <span className="text-white font-bold">{entry.value}</span>
                                    <span className="text-[9px] text-slate-500">({percentage}%)</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Security & Activity Monitoring Section */}
            <div className="bg-[#0A1224] border border-white/5 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Security & Activity Logs</h3>
                    <p className="text-[10px] text-slate-400">Tracks all CMS changes, admin login events, and configuration updates in real-time.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('logs')}
                    className="px-3.5 py-1.5 rounded-lg bg-[#121B30] border border-white/5 hover:border-[#D4A017]/30 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View Full Log Registry</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Mini filters inside the widget */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setDashboardLogFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      dashboardLogFilter === 'all'
                        ? 'bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/20'
                        : 'bg-[#121B30]/30 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    All Activities ({logsList.length})
                  </button>
                  <button
                    onClick={() => setDashboardLogFilter('cms')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      dashboardLogFilter === 'cms'
                        ? 'bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/20'
                        : 'bg-[#121B30]/30 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    CMS & Content Updates
                  </button>
                  <button
                    onClick={() => setDashboardLogFilter('auth')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      dashboardLogFilter === 'auth'
                        ? 'bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/20'
                        : 'bg-[#121B30]/30 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    Login & Security Events
                  </button>
                </div>

                {(() => {
                  const filteredWidgetLogs = logsList
                    .filter((log) => {
                      const actionLower = log.action.toLowerCase();
                      if (dashboardLogFilter === 'cms') {
                        return actionLower.includes('edit') || actionLower.includes('modify') || actionLower.includes('update') || actionLower.includes('policy') || actionLower.includes('create') || actionLower.includes('add') || actionLower.includes('delete') || actionLower.includes('remove') || actionLower.includes('media') || actionLower.includes('upload');
                      }
                      if (dashboardLogFilter === 'auth') {
                        return actionLower.includes('login') || actionLower.includes('logout') || actionLower.includes('logged');
                      }
                      return true;
                    })
                    .slice(0, 6);

                  if (filteredWidgetLogs.length === 0) {
                    return (
                      <div className="py-8 text-center text-slate-500 border border-dashed border-white/5 rounded-xl bg-[#121B30]/10">
                        <Shield className="mx-auto text-slate-600 mb-2 opacity-40" size={20} />
                        <p className="text-[10px] font-bold">No activities registered matching the selected filter.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                      {filteredWidgetLogs.map((log) => {
                        const actionLower = log.action.toLowerCase();
                        let iconColor = 'text-blue-400 bg-blue-500/10';
                        let categoryText = 'Event';

                        if (actionLower.includes('payment') || actionLower.includes('booking') || actionLower.includes('settle') || actionLower.includes('paid')) {
                          iconColor = 'text-emerald-400 bg-emerald-500/10';
                          categoryText = 'Ledger';
                        } else if (actionLower.includes('delete') || actionLower.includes('removed') || actionLower.includes('terminate')) {
                          iconColor = 'text-rose-400 bg-rose-500/10';
                          categoryText = 'Asset Wipe';
                        } else if (actionLower.includes('login') || actionLower.includes('logout') || actionLower.includes('logged') || actionLower.includes('auth')) {
                          iconColor = 'text-purple-400 bg-purple-500/10';
                          categoryText = 'Auth Gateway';
                        } else if (actionLower.includes('cms') || actionLower.includes('tour') || actionLower.includes('faq') || actionLower.includes('hotel') || actionLower.includes('zone')) {
                          iconColor = 'text-[#D4A017] bg-[#D4A017]/10';
                          categoryText = 'CMS Change';
                        }

                        return (
                          <div
                            key={log.id}
                            className="bg-[#121B30]/50 border border-white/5 hover:border-white/10 p-3 rounded-xl flex items-center justify-between gap-4 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`p-2 rounded-lg shrink-0 ${iconColor}`}>
                                <Shield size={14} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-bold text-slate-200">{log.user}</span>
                                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{log.role}</span>
                                  <span className="text-[9px] text-slate-500">{log.ipAddress || '197.250.3.11'}</span>
                                </div>
                                <p className="text-[11px] text-slate-300 mt-1 font-medium">{log.action}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-slate-500 font-mono font-bold block">{log.timestamp}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide bg-white/5 px-1.5 py-0.5 rounded mt-1 inline-block">{categoryText}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* 1. BOOKINGS LEDGER workspace tab */}
        {activeTab === 'bookings' && (
          !hasAccess('bookings', 'read') ? renderRestrictedState('Bookings') : (
            <div className="space-y-6">
            <AdminDataTable<any>
              data={bookingsList}
              loading={bookingsLoading}
              dateRangeFilters={[
                { key: 'preferred_date', label: 'Travel Date' },
                { key: 'created_at', label: 'Booking Date' },
              ]}
              columns={[
                {
                  header: 'Customer Name',
                  key: 'full_name',
                  render: (b) => (
                    <>
                      <div className="font-bold text-white text-sm">{b.full_name}</div>
                      <div className="text-[10px] text-slate-400">{b.email || 'No email provided'}</div>
                    </>
                  ),
                },
                {
                  header: 'Destination Package',
                  key: 'tour_name',
                  render: (b) => (
                    <>
                      <div className="font-semibold text-[#D4A017]">{b.tour_name}</div>
                      <div className="text-[10px] text-slate-400">{b.number_of_guests} travelers</div>
                    </>
                  ),
                },
                {
                  header: 'WhatsApp contact',
                  key: 'whatsapp_number',
                  render: (b) => (
                    <span className="font-mono font-medium text-slate-300">
                      {b.whatsapp_number}
                    </span>
                  ),
                },
                {
                  header: 'Travel Date',
                  key: 'preferred_date',
                  render: (b) => (
                    <>
                      <div className="font-semibold text-slate-350">{b.preferred_date}</div>
                      <div className="text-[10px] truncate max-w-[150px] text-slate-400" title={b.pickup_location}>🚗 Pickup: {b.pickup_location}</div>
                    </>
                  ),
                },
                {
                  header: 'Status',
                  key: 'status',
                  render: (b) => {
                    const statusVal = (b.status || 'pending').toLowerCase();
                    let badgeClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                    let dotClass = 'bg-amber-400 animate-pulse';
                    if (statusVal === 'confirmed' || statusVal === 'approved' || statusVal === 'paid') {
                      badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      dotClass = 'bg-emerald-400';
                    } else if (statusVal === 'rejected' || statusVal === 'cancelled' || statusVal === 'canceled') {
                      badgeClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                      dotClass = 'bg-rose-400';
                    } else if (statusVal && statusVal !== 'pending') {
                      badgeClass = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
                      dotClass = 'bg-slate-400';
                    }
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                        <span>{b.status}</span>
                      </span>
                    );
                  },
                },
              ]}
              searchKeys={['full_name', 'email', 'whatsapp_number', 'tour_name', 'pickup_location']}
              searchPlaceholder="Search passenger notes, phone, name..."
              statusFilterKey="status"
              statusOptions={[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              csvFilename="Zanzibar_Bookings_Report_2026.csv"
              csvHeaders={['ID', 'Customer Name', 'Email', 'WhatsApp', 'Guests', 'Experience Name', 'Date Requested', 'Pickup', 'Status', 'Submitted At']}
              csvRowMapper={(b) => [
                b.id,
                b.full_name,
                b.email || 'None',
                b.whatsapp_number,
                b.number_of_guests,
                b.tour_name,
                b.preferred_date,
                b.pickup_location,
                b.status,
                b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Unspecified',
              ]}
              onExportSuccess={() => {
                addActivityLog(session?.name || 'Admin', 'exportBookings', 'Exported full bookings ledger to Excel CSV.');
              }}
              onExportPDF={exportBookingsToPDF}
              onBulkUpload={async (importedRows) => {
                const rowsToInsert = importedRows.map(row => ({
                  full_name: row.full_name,
                  email: row.email || null,
                  whatsapp_number: row.whatsapp_number,
                  number_of_guests: Number(row.number_of_guests) || 1,
                  tour_name: row.tour_name || 'Tours: General Package',
                  preferred_date: row.preferred_date || new Date().toISOString().split('T')[0],
                  pickup_location: row.pickup_location || 'Hotel lobby pickup',
                  status: row.status || 'confirmed',
                  message: row.message || 'Imported via Bulk Import Engine',
                }));

                const { error } = await supabase
                  .from('bookings')
                  .insert(rowsToInsert);

                if (error) {
                  throw new Error(`Failed to upload bookings to database: ${error.message}`);
                }

                addActivityLog(session?.name || 'Admin', 'bulkImportBookings', `Successfully imported ${rowsToInsert.length} bookings via CSV bulk upload.`);
                
                await loadBookings();
              }}
              onViewDetails={(b) => setSelectedBooking(b)}
              viewDetailsLabel="View Details & Invoice"
              onEdit={(b) => setEditingBooking({ ...b })}
              onDelete={(b) => setDeletingBooking(b)}
              isEditDisabled={isBookingReadOnly}
              isDeleteDisabled={isBookingReadOnly}
              emptyMessage="No bookings match your current filter settings."
              pageSize={10}
            />
          </div>
          )
        )}

        {/* COMPANY CONFIGURATION / SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Settings size={20} />
                  <span>Company Configuration & Preferences</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Manage global system settings, currencies, automated timeout rules, and visual aesthetics.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Core Configurations */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Local Currency Preference</label>
                  <p className="text-[10px] text-slate-500 mb-1">Set the prefix currency symbol applied to financial calculations and ledger balances.</p>
                  <select
                    value={settingsCurrency}
                    onChange={(e) => setSettingsCurrency(e.target.value)}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  >
                    <option value="$">USD ($) - US Dollar</option>
                    <option value="€">EUR (€) - Euro</option>
                    <option value="£">GBP (£) - British Pound</option>
                    <option value="Tsh">TZS (Tsh) - Tanzanian Shilling</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Inactivity Warning Duration</label>
                  <p className="text-[10px] text-slate-500 mb-1">Select the duration of absolute inactivity before triggering safety warnings and logging out staff.</p>
                  <select
                    value={settingsTimeout}
                    onChange={(e) => setSettingsTimeout(e.target.value)}
                    className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4A017]"
                  >
                    <option value="5">5 Minutes</option>
                    <option value="10">10 Minutes</option>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes (Recommended)</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">Visual Accent Theme</label>
                  <p className="text-[10px] text-slate-500 mb-1">Choose the primary visual indicator color for highlights, selected states, and sidebar accents.</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'gold', label: 'Swahili Gold', color: 'bg-[#D4A017]', border: 'border-[#D4A017]' },
                      { id: 'emerald', label: 'Coast Green', color: 'bg-emerald-500', border: 'border-emerald-500' },
                      { id: 'ocean', label: 'Ocean Blue', color: 'bg-blue-500', border: 'border-blue-500' },
                      { id: 'purple', label: 'Amethyst', color: 'bg-purple-500', border: 'border-purple-500' },
                    ].map((accent) => (
                      <button
                        key={accent.id}
                        type="button"
                        onClick={() => setSettingsAccent(accent.id)}
                        className={`p-2.5 rounded-xl border text-[10px] font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                          settingsAccent === accent.id
                            ? `${accent.border} bg-[#121B30] text-white shadow-md`
                            : 'border-white/5 bg-[#121B30]/30 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${accent.color}`} />
                        <span>{accent.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - System Metadata & Shortcuts */}
              <div className="space-y-6">
                <div className="bg-[#121B30] border border-white/5 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <ShieldAlert size={14} className="text-[#D4A017]" />
                    <span>Zanzibar Server Compliance</span>
                  </h4>
                  <div className="space-y-2 text-[11px] text-slate-400 font-mono">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Sync Engine</span>
                      <span className="text-emerald-400 font-bold">Encrypted Web Sockets</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>DB Engine</span>
                      <span className="text-white">Supabase / PostgreSQL v15</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Session Status</span>
                      <span className="text-[#D4A017]">Authenticated Console</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span>Server Clock</span>
                      <span className="text-slate-200">{new Date().toISOString().substring(11, 19)} UTC</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#121B30]/40 border border-white/5 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300">Quick Links & CMS Redirects</h4>
                  <p className="text-[10px] text-slate-400">Need to modify contact details, help email, or official telephone numbers? Use the site content manager.</p>
                  <button
                    onClick={() => {
                      setActiveTab('cms');
                      setCmsEditSection('contact');
                    }}
                    className="bg-[#0B3B8C] hover:bg-[#093070] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer w-full justify-center"
                  >
                    <span>Edit Company Contact CMS</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-white/5 pt-6">
              <div>
                {saveSettingsSuccess && (
                  <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-bounce">
                    <CheckCircle2 size={14} />
                    <span>Configuration successfully compiled and applied locally!</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  localStorage.setItem('ztr_currency_symbol', settingsCurrency);
                  localStorage.setItem('ztr_inactivity_timeout_duration', settingsTimeout);
                  localStorage.setItem('ztr_theme_accent', settingsAccent);
                  setSaveSettingsSuccess(true);
                  setTimeout(() => setSaveSettingsSuccess(false), 3000);
                  
                  // Reload the page settings or update state
                  addActivityLog(session?.name || 'Admin', 'updateSystemSettings', `Updated system settings: Currency=${settingsCurrency}, Timeout=${settingsTimeout}min, Accent=${settingsAccent}`);
                }}
                className="bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-black px-6 py-2.5 rounded-xl text-xs cursor-pointer flex items-center gap-2"
              >
                <Check size={14} />
                <span>Save Settings Configuration</span>
              </button>
            </div>
          </div>
        )}

        {/* CUSTOMERS LEDGER workspace tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0A1224] border border-white/5 p-5 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unique Customers Logged</span>
                <p className="text-3xl font-black text-white">{customersList.length}</p>
                <div className="text-[10px] text-slate-500 font-medium">Distinct traveler contact profiles</div>
              </div>

              <div className="bg-[#0A1224] border border-white/5 p-5 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Combined Bookings</span>
                <p className="text-3xl font-black text-[#D4A017]">
                  {customersList.reduce((acc, c) => acc + c.total_bookings, 0)} reservations
                </p>
                <div className="text-[10px] text-slate-500 font-medium">Total registered trip bookings</div>
              </div>

              <div className="bg-[#0A1224] border border-white/5 p-5 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Combined Travelers Handled</span>
                <p className="text-3xl font-black text-emerald-400">
                  {customersList.reduce((acc, c) => acc + c.total_guests, 0)} passengers
                </p>
                <div className="text-[10px] text-slate-500 font-medium">Lifetime passengers count</div>
              </div>
            </div>

            {/* ReusableTable */}
            <AdminDataTable<any>
              data={customersList}
              loading={bookingsLoading}
              columns={[
                {
                  header: 'Customer Details',
                  key: 'full_name',
                  render: (c) => (
                    <>
                      <div className="font-bold text-white text-sm">{c.full_name}</div>
                      <div className="text-[10px] text-slate-400">{c.email || 'No email provided'}</div>
                    </>
                  ),
                },
                {
                  header: 'WhatsApp Contact',
                  key: 'whatsapp_number',
                  render: (c) => (
                    <span className="font-mono font-medium text-slate-300">
                      {c.whatsapp_number}
                    </span>
                  ),
                },
                {
                  header: 'Lifetime Reservations',
                  key: 'total_bookings',
                  render: (c) => (
                    <div className="text-slate-200">
                      <span className="font-bold text-white">{c.total_bookings}</span> {c.total_bookings === 1 ? 'Booking' : 'Bookings'}
                      <div className="text-[10px] text-slate-500 font-medium">{c.total_guests} total guests</div>
                    </div>
                  ),
                },
                {
                  header: 'Latest Booking Experience',
                  key: 'latest_experience',
                  render: (c) => (
                    <>
                      <div className="font-semibold text-[#D4A017]">{c.latest_experience}</div>
                      <div className="text-[10px] text-slate-400">Date requested: {c.latest_date}</div>
                    </>
                  ),
                },
                {
                  header: 'Latest Status',
                  key: 'status',
                  render: (c) => {
                    const statusVal = (c.status || 'pending').toLowerCase();
                    let badgeClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                    let dotClass = 'bg-amber-400 animate-pulse';
                    if (statusVal === 'confirmed' || statusVal === 'approved' || statusVal === 'paid') {
                      badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      dotClass = 'bg-emerald-400';
                    } else if (statusVal === 'rejected' || statusVal === 'cancelled' || statusVal === 'canceled') {
                      badgeClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                      dotClass = 'bg-rose-400';
                    } else if (statusVal && statusVal !== 'pending') {
                      badgeClass = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
                      dotClass = 'bg-slate-400';
                    }
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                        <span>{c.status}</span>
                      </span>
                    );
                  },
                },
              ]}
              searchKeys={['full_name', 'email', 'whatsapp_number', 'latest_experience']}
              searchPlaceholder="Search customer profiles, email, name..."
              csvFilename="Zanzibar_Customer_Profiles_2026.csv"
              csvHeaders={['Customer Name', 'Email', 'WhatsApp', 'Total Bookings', 'Total Passengers Handled', 'Latest Experience Name', 'Latest Requested Date', 'Latest Status']}
              csvRowMapper={(c) => [
                c.full_name,
                c.email || 'None',
                c.whatsapp_number,
                c.total_bookings,
                c.total_guests,
                c.latest_experience,
                c.latest_date,
                c.status,
              ]}
              onExportSuccess={() => {
                addActivityLog(session?.name || 'Admin', 'exportCustomers', 'Exported customer profile records to CSV.');
              }}
              onViewDetails={(c) => {
                const b = bookingsList.find(item => item.id === c.id);
                if (b) setSelectedBooking(b);
              }}
              viewDetailsLabel="View Details & Invoice"
              onEdit={(c) => {
                const b = bookingsList.find(item => item.id === c.id);
                if (b) setEditingBooking({ ...b });
              }}
              onDelete={(c) => {
                const b = bookingsList.find(item => item.id === c.id);
                if (b) setDeletingBooking(b);
              }}
              isEditDisabled={isBookingReadOnly}
              isDeleteDisabled={isBookingReadOnly}
              emptyMessage="No customer profiles match your current search terms."
              pageSize={10}
            />

          </div>
        )}

        {/* 2. VISUAL CMS EDITOR workspace tab */}
        {activeTab === 'cms' && (
          <div className="space-y-6">
            
            {/* Owner Authorization check banner prior to CMS actions */}
            {isCMSReadOnly && (
              <div className="bg-red-950/25 border-l-4 border-red-500 text-red-200 p-5 rounded-r-2xl space-y-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={24} className="text-red-400" />
                  <div>
                    <h3 className="font-bold text-sm">CMS Content Locked - Administrator/Editor Clearance Required</h3>
                    <p className="text-xs text-red-300">As non-privileged staff, you have read-only rights to view content. Site content settings and packages are editable exclusively by Administrators and Content Editors.</p>
                  </div>
                </div>
              </div>
            )}

            {/* CMS Sections Buttons toggler row */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-white/5 pb-2">
              {[
                { id: 'contact', label: 'Contact Settings' },
                { id: 'hero', label: 'Home Hero' },
                { id: 'about', label: 'About Us Details' },
                { id: 'tours', label: 'Tour Packages Management' },
                { id: 'faqs', label: 'FAQs List' },
                { id: 'testimonials', label: 'Testimonials / Reviews' },
                { id: 'youtube', label: 'YouTube Video Gallery' },
                { id: 'blog', label: 'Blog Posts CMS' }
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setCmsEditSection(sec.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    cmsEditSection === sec.id ? 'bg-[#0B3B8C] text-white' : 'bg-[#0A1224] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* CMS Forms block */}
            <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
              
              {/* CMS A. CONTACT SETTINGS DETAIL */}
              {cmsEditSection === 'contact' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <Phone size={18} />
                    <span>Company Contact Desk & Hours</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">Official Call Number</label>
                      <input
                        type="text"
                        disabled={isCMSReadOnly}
                        value={siteContent.contact.phone}
                        onChange={e => handleContactConfigChange('phone', e.target.value)}
                        className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">WhatsApp Live Chat Phone</label>
                      <input
                        type="text"
                        disabled={isCMSReadOnly}
                        value={siteContent.contact.whatsapp}
                        onChange={e => handleContactConfigChange('whatsapp', e.target.value)}
                        className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">Contact Email Address</label>
                      <input
                        type="email"
                        disabled={isCMSReadOnly}
                        value={siteContent.contact.email}
                        onChange={e => handleContactConfigChange('email', e.target.value)}
                        className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">Office headquarters Location</label>
                      <input
                        type="text"
                        disabled={isCMSReadOnly}
                        value={siteContent.contact.address}
                        onChange={e => handleContactConfigChange('address', e.target.value)}
                        className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-300">Working Office Hours text</label>
                      <input
                        type="text"
                        disabled={isCMSReadOnly}
                        value={siteContent.contact.workingHours}
                        onChange={e => handleContactConfigChange('workingHours', e.target.value)}
                        className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                      />
                    </div>
                  </div>
                  {!isCMSReadOnly && (
                    <p className="text-[10px] text-green-400 mt-2 font-semibold">✓ Saved automatically to local dynamic store.</p>
                  )}
                </div>
              )}

              {/* CMS B. HERO SECTION & STRAPS */}
              {cmsEditSection === 'hero' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <Sparkles size={18} />
                    <span>Home Hero Typography Settings</span>
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-medium">
                      <div className="space-y-1.5 font-medium">
                        <label className="block text-xs font-bold text-slate-300">Heading Part 1 (Zanzibar)</label>
                        <input
                          type="text"
                          disabled={isCMSReadOnly}
                          value={siteContent.hero.headingPart1}
                          onChange={e => handleHeroConfigChange('headingPart1', e.target.value)}
                          className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-1.5 font-medium">
                        <label className="block text-xs font-bold text-slate-300">Heading Part 2 (Tanzania)</label>
                        <input
                          type="text"
                          disabled={isCMSReadOnly}
                          value={siteContent.hero.headingPart2}
                          onChange={e => handleHeroConfigChange('headingPart2', e.target.value)}
                          className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-1.5 font-medium">
                        <label className="block text-xs font-bold text-slate-300">Heading Part 3 (Paradise)</label>
                        <input
                          type="text"
                          disabled={isCMSReadOnly}
                          value={siteContent.hero.headingPart3}
                          onChange={e => handleHeroConfigChange('headingPart3', e.target.value)}
                          className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 font-medium">
                      <label className="block text-xs font-bold text-slate-300">Subtitle Slogan Strapline</label>
                      <input
                        type="text"
                        disabled={isCMSReadOnly}
                        value={siteContent.hero.subtitle}
                        onChange={e => handleHeroConfigChange('subtitle', e.target.value)}
                        className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-medium">
                      <div className="space-y-1.5 font-medium">
                        <label className="block text-xs font-bold text-slate-300">Primary CTA Button text</label>
                        <input
                          type="text"
                          disabled={isCMSReadOnly}
                          value={siteContent.hero.primaryButtonText}
                          onChange={e => handleHeroConfigChange('primaryButtonText', e.target.value)}
                          className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-1.5 font-medium">
                        <label className="block text-xs font-bold text-slate-300">Secondary CTA Button text</label>
                        <input
                          type="text"
                          disabled={isCMSReadOnly}
                          value={siteContent.hero.secondaryButtonText}
                          onChange={e => handleHeroConfigChange('secondaryButtonText', e.target.value)}
                          className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Slider Images Management */}
                    <div className="pt-6 border-t border-white/5 space-y-6">
                      <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">
                        Homepage & Kilimanjaro Slider Backgrounds
                      </h4>
                      
                      {/* Homepage Hero Slider */}
                      <div className="space-y-3">
                        <label className="block text-xs font-extrabold text-slate-300">
                          Homepage Main Hero Background Images
                        </label>
                        <div className="space-y-2">
                          {(siteContent.hero.bgImages || []).map((img, i) => (
                            <div key={i} className="flex gap-2">
                              <input
                                type="text"
                                disabled={isCMSReadOnly}
                                value={img}
                                onChange={(e) => {
                                  const arr = [...(siteContent.hero.bgImages || [])];
                                  arr[i] = e.target.value;
                                  handleHeroConfigChange('bgImages', arr);
                                }}
                                className="flex-1 text-xs bg-[#121B30] border border-white/10 rounded-xl py-2 px-3 text-white disabled:opacity-50"
                              />
                              <button
                                type="button"
                                disabled={isCMSReadOnly}
                                onClick={() => {
                                  const arr = (siteContent.hero.bgImages || []).filter((_, idx) => idx !== i);
                                  handleHeroConfigChange('bgImages', arr);
                                }}
                                className="bg-red-950 hover:bg-red-900 border border-red-500/20 text-red-400 p-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            disabled={isCMSReadOnly}
                            onClick={() => {
                              const arr = [...(siteContent.hero.bgImages || []), ''];
                              handleHeroConfigChange('bgImages', arr);
                            }}
                            className="text-xs bg-[#0B3B8C] hover:bg-[#072559] text-white py-1.5 px-3 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus size={14} /> Add Background URL
                          </button>
                        </div>
                      </div>

                      {/* Homepage Newsletter Slider */}
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <label className="block text-xs font-extrabold text-slate-300">
                          Homepage Newsletter / Subscription Background Images
                        </label>
                        <div className="space-y-2">
                          {(siteContent.newsletterBgImages || []).map((img, i) => (
                            <div key={i} className="flex gap-2">
                              <input
                                type="text"
                                disabled={isCMSReadOnly}
                                value={img}
                                onChange={(e) => {
                                  const arr = [...(siteContent.newsletterBgImages || [])];
                                  arr[i] = e.target.value;
                                  const updated = { ...siteContent, newsletterBgImages: arr };
                                  setSiteContent(updated);
                                  saveSiteContent(updated);
                                }}
                                className="flex-1 text-xs bg-[#121B30] border border-white/10 rounded-xl py-2 px-3 text-white disabled:opacity-50"
                              />
                              <button
                                type="button"
                                disabled={isCMSReadOnly}
                                onClick={() => {
                                  const arr = (siteContent.newsletterBgImages || []).filter((_, idx) => idx !== i);
                                  const updated = { ...siteContent, newsletterBgImages: arr };
                                  setSiteContent(updated);
                                  saveSiteContent(updated);
                                }}
                                className="bg-red-950 hover:bg-red-900 border border-red-500/20 text-red-400 p-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            disabled={isCMSReadOnly}
                            onClick={() => {
                              const arr = [...(siteContent.newsletterBgImages || []), ''];
                              const updated = { ...siteContent, newsletterBgImages: arr };
                              setSiteContent(updated);
                              saveSiteContent(updated);
                            }}
                            className="text-xs bg-[#0B3B8C] hover:bg-[#072559] text-white py-1.5 px-3 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus size={14} /> Add Newsletter Background URL
                          </button>
                        </div>
                      </div>

                      {/* Kilimanjaro Slider */}
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <label className="block text-xs font-extrabold text-slate-300">
                          Kilimanjaro Page Background Images
                        </label>
                        <div className="space-y-2">
                          {(siteContent.kilimanjaroBgImages || []).map((img, i) => (
                            <div key={i} className="flex gap-2">
                              <input
                                type="text"
                                disabled={isCMSReadOnly}
                                value={img}
                                onChange={(e) => {
                                  const arr = [...(siteContent.kilimanjaroBgImages || [])];
                                  arr[i] = e.target.value;
                                  const updated = { ...siteContent, kilimanjaroBgImages: arr };
                                  setSiteContent(updated);
                                  saveSiteContent(updated);
                                }}
                                className="flex-1 text-xs bg-[#121B30] border border-white/10 rounded-xl py-2 px-3 text-white disabled:opacity-50"
                              />
                              <button
                                type="button"
                                disabled={isCMSReadOnly}
                                onClick={() => {
                                  const arr = (siteContent.kilimanjaroBgImages || []).filter((_, idx) => idx !== i);
                                  const updated = { ...siteContent, kilimanjaroBgImages: arr };
                                  setSiteContent(updated);
                                  saveSiteContent(updated);
                                }}
                                className="bg-red-950 hover:bg-red-900 border border-red-500/20 text-red-400 p-2 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            disabled={isCMSReadOnly}
                            onClick={() => {
                              const arr = [...(siteContent.kilimanjaroBgImages || []), ''];
                              const updated = { ...siteContent, kilimanjaroBgImages: arr };
                              setSiteContent(updated);
                              saveSiteContent(updated);
                            }}
                            className="text-xs bg-[#0B3B8C] hover:bg-[#072559] text-white py-1.5 px-3 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus size={14} /> Add Kilimanjaro Background URL
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CMS C. ABOUT US EDIT BLOCK */}
              {cmsEditSection === 'about' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <FileText size={18} />
                    <span>About Us Story & Editorial Narrative</span>
                  </h3>

                  <div className="space-y-4 font-medium">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 font-medium">
                        <label className="block text-xs font-bold text-slate-300">Hero Section Heading</label>
                        <input
                          type="text"
                          disabled={isCMSReadOnly}
                          value={siteContent.about.heroTitle}
                          onChange={e => handleAboutConfigChange('heroTitle', e.target.value)}
                          className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-1.5 font-medium">
                        <label className="block text-xs font-bold text-slate-300">Our Story Section Title</label>
                        <input
                          type="text"
                          disabled={isCMSReadOnly}
                          value={siteContent.about.storyTitle}
                          onChange={e => handleAboutConfigChange('storyTitle', e.target.value)}
                          className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 font-medium">
                      <label className="block text-xs font-bold text-slate-300">Hero Subtitle</label>
                      <input
                        type="text"
                        disabled={isCMSReadOnly}
                        value={siteContent.about.heroSubtitle}
                        onChange={e => handleAboutConfigChange('heroSubtitle', e.target.value)}
                        className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white disabled:opacity-50 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5 font-medium">
                      <label className="block text-xs font-bold text-slate-300">Story Body Paragraph 1 (Founder narrative)</label>
                      <textarea
                        rows={4}
                        disabled={isCMSReadOnly}
                        value={siteContent.about.storyText1}
                        onChange={e => handleAboutConfigChange('storyText1', e.target.value)}
                        className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl p-3 text-white resize-none disabled:opacity-50 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5 font-medium">
                      <label className="block text-xs font-bold text-slate-300">Story Body Paragraph 2 (Scale and combos)</label>
                      <textarea
                        rows={3}
                        disabled={isCMSReadOnly}
                        value={siteContent.about.storyText2}
                        onChange={e => handleAboutConfigChange('storyText2', e.target.value)}
                        className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl p-3 text-white resize-none disabled:opacity-50 font-medium"
                      />
                    </div>

                    {/* Team Members CMS Editor */}
                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">
                        👥 Meet Our Team & Owner Profile Settings
                      </h4>
                      <p className="text-xs text-slate-400">
                        Customize names, roles, bio descriptions, and photo URLs for Zanzibar Trip & Relax team members. The first member listed is recognized as the CEO/Owner (Gerevas Paulo Mtaki).
                      </p>

                      <div className="space-y-6">
                        {(siteContent.about.team || []).map((member, i) => (
                          <div key={i} className="bg-[#121B30] p-4 rounded-xl border border-white/5 space-y-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-xs font-extrabold text-[#D4A017] uppercase tracking-wider">
                                {i === 0 ? '👑 Member 1: Founder & CEO (Primary Owner)' : `Team Member ${i + 1}`}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400">Full Name</label>
                                <input
                                  type="text"
                                  disabled={isCMSReadOnly}
                                  value={member.name}
                                  onChange={e => {
                                    const updatedTeam = [...siteContent.about.team];
                                    updatedTeam[i] = { ...updatedTeam[i], name: e.target.value };
                                    handleAboutConfigChange('team', updatedTeam);
                                  }}
                                  className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400">Professional Role</label>
                                <input
                                  type="text"
                                  disabled={isCMSReadOnly}
                                  value={member.role}
                                  onChange={e => {
                                    const updatedTeam = [...siteContent.about.team];
                                    updatedTeam[i] = { ...updatedTeam[i], role: e.target.value };
                                    handleAboutConfigChange('team', updatedTeam);
                                  }}
                                  className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-400">Photo URL</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  disabled={isCMSReadOnly}
                                  value={member.image}
                                  onChange={e => {
                                    const updatedTeam = [...siteContent.about.team];
                                    updatedTeam[i] = { ...updatedTeam[i], image: e.target.value };
                                    handleAboutConfigChange('team', updatedTeam);
                                  }}
                                  className="flex-1 bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono"
                                  placeholder="e.g. /src/assets/images/ceo_gerevas.jpg"
                                />
                                <div className="h-9 w-9 shrink-0 bg-slate-950/45 rounded-lg border border-white/10 overflow-hidden flex items-center justify-center">
                                  <img 
                                    src={member.image} 
                                    className="h-full w-full object-cover" 
                                    referrerPolicy="no-referrer" 
                                    onError={e => { e.currentTarget.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'; }} 
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-400">Bio Narrative / Profile</label>
                              <textarea
                                rows={3}
                                disabled={isCMSReadOnly}
                                value={member.bio}
                                onChange={e => {
                                  const updatedTeam = [...siteContent.about.team];
                                  updatedTeam[i] = { ...updatedTeam[i], bio: e.target.value };
                                  handleAboutConfigChange('team', updatedTeam);
                                }}
                                className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CMS D. TOURS MANAGEMENT PANEL */}
              {cmsEditSection === 'tours' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h3 className="text-sm font-bold text-slate-300">Active Excursions ({siteContent.tours.length} packages logged)</h3>
                    {!isCMSReadOnly && (
                      <button
                        onClick={() => setEditTour({ id: 't-' + Math.floor(Math.random() * 10000), title: '', category: 'ocean', desc: '', price: '$35', duration: 'Full Day', img: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=600', itinerary: [], longDescription: '', visible: true })}
                        className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add New Package</span>
                      </button>
                    )}
                  </div>

                  {/* Tours editor active form modal/subview */}
                  {editTour && (
                    <div className="bg-[#121B30] p-5 rounded-2xl border border-white/10 space-y-4">
                      <h4 className="font-bold text-xs text-[#D4A017] uppercase tracking-widest">{editTour.id.startsWith('t-') ? 'Create New Tour' : 'Modify Active Tour'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Tour Headline Title</label>
                          <input type="text" value={editTour.title} onChange={e => setEditTour({ ...editTour, title: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="e.g. Zanzibar Spice Walk" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Shorthand Category</label>
                          <select value={editTour.category} onChange={e => setEditTour({ ...editTour, category: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white">
                            <option value="ocean">Ocean Blue Cruise</option>
                            <option value="culture">Swahili Culture</option>
                            <option value="island">Local Islands</option>
                            <option value="nature">Coastal Nature</option>
                            <option value="adventure">Mainland Adventure</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Average Duration</label>
                          <input type="text" value={editTour.duration || ''} onChange={e => setEditTour({ ...editTour, duration: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="e.g. 4 Hours or Full Day" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Expedition Price</label>
                          <input type="text" value={editTour.price || ''} onChange={e => setEditTour({ ...editTour, price: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="e.g. From $45/person" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Card Display Cover Image URL</label>
                          <input type="text" value={editTour.img} onChange={e => setEditTour({ ...editTour, img: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="https://images.pexels.com/..." />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Editorial Card Description text</label>
                          <textarea rows={2} value={editTour.desc} onChange={e => setEditTour({ ...editTour, desc: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none" placeholder="Provide description..." />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Long Form Detailed Description</label>
                          <textarea rows={3} value={editTour.longDescription || ''} onChange={e => setEditTour({ ...editTour, longDescription: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none" placeholder="Detailed story, historical highlights, or general excursion scope..." />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Tour Itinerary Steps (One step per line. Format: Time - Title - Activity)</label>
                          <textarea rows={4} value={editTour.itinerary ? editTour.itinerary.map((step: any) => typeof step === 'object' ? `${step.time || ''} - ${step.title || ''} - ${step.activity || ''}` : String(step)).join('\n') : ''} onChange={e => setEditTour({ ...editTour, itinerary: e.target.value.split('\n').filter(Boolean) })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono" placeholder="09:00 AM - Spice Walk - Explore the organic farm&#10;11:30 AM - Swahili Cooking - Learn local recipes" />
                        </div>
                        <div className="flex items-center gap-2 pt-2 md:col-span-2">
                          <input type="checkbox" id="tour-visible-checkbox" checked={editTour.visible !== false} onChange={e => setEditTour({ ...editTour, visible: e.target.checked })} className="w-4 h-4 rounded text-[#D4A017] focus:ring-[#D4A017] bg-[#081835] border-white/10 cursor-pointer" />
                          <label htmlFor="tour-visible-checkbox" className="text-xs font-bold text-slate-300 cursor-pointer select-none">Tour is active and visible to public</label>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button onClick={() => setEditTour(null)} className="px-3 py-1.5 bg-slate-800 rounded-xl text-xs font-bold text-slate-300">Cancel</button>
                        <button onClick={() => saveCmsTour(editTour)} className="px-4 py-1.5 bg-[#D4A017] rounded-xl text-xs font-bold text-[#020C1F]">Publish Changes</button>
                      </div>
                    </div>
                  )}

                  {/* Listings Table representation for dynamic editing */}
                  <div className="space-y-3">
                    {siteContent.tours.map(t => (
                      <div key={t.id} className="bg-[#121B30] rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border border-white/5 hover:bg-[#15203b] transition-all">
                        <div className="flex items-center gap-3">
                          <img src={t.img} alt={t.title} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <h4 className="font-bold text-sm text-white">{t.title}</h4>
                            <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-2 gap-y-1 capitalize items-center">
                              <span>Folder: {t.category}</span>
                              <span>• Duration: {t.duration}</span>
                              <span className="text-[#D4A017]">Cost: {t.price}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${t.visible !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                {t.visible !== false ? 'Visible' : 'Hidden'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {!isCMSReadOnly && (
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => setEditTour(t)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-slate-300 text-xs flex items-center gap-1 cursor-pointer">
                              <Edit size={12} />
                              <span>Edit</span>
                            </button>
                            <button onClick={() => deleteCmsTour(t.id, t.title)} className="bg-red-950 hover:bg-red-900 border border-red-500/20 p-2 rounded-lg text-red-300 text-xs flex items-center gap-1 cursor-pointer">
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CMS E. FAQS LIST MANAGEMENT */}
              {cmsEditSection === 'faqs' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h3 className="text-sm font-bold text-slate-300">Zanzibar FAQs ({siteContent.faqs.length} entries published)</h3>
                    {!isCMSReadOnly && (
                      <button
                        onClick={() => setEditFaq({ category: 'Visas & Customs', q: '', a: '' })}
                        className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add FAQ Entry</span>
                      </button>
                    )}
                  </div>

                  {editFaq && (
                    <div className="bg-[#121B30] p-5 rounded-2xl border border-white/10 space-y-4">
                      <h4 className="font-bold text-xs text-[#D4A017] uppercase tracking-widest">{editFaq.originalQ ? 'Modify FAQ Entry' : 'Create FAQ Entry'}</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Shorthand Category classification</label>
                          <input type="text" value={editFaq.category} onChange={e => setEditFaq({ ...editFaq, category: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="e.g. Visas & Customs" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Question headline</label>
                          <input type="text" value={editFaq.q} onChange={e => setEditFaq({ ...editFaq, q: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="Do I need a visa to enter Zanzibar?" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Detailed Answer description</label>
                          <textarea rows={3} value={editFaq.a} onChange={e => setEditFaq({ ...editFaq, a: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none" placeholder="Provide accurate details..." />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end font-bold text-xs">
                        <button onClick={() => setEditFaq(null)} className="px-3 py-1.5 bg-slate-800 rounded-xl text-slate-300">Cancel</button>
                        <button onClick={() => saveCmsFaq(editFaq)} className="px-4 py-1.5 bg-[#D4A017] rounded-xl text-[#020C1F]">Save Entry</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {siteContent.faqs.map((f, i) => (
                      <div key={i} className="bg-[#121B30] p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] bg-[#0B3B8C] text-slate-200 border border-white/5 rounded-full px-2 py-0.5 font-bold tracking-wider uppercase">{f.category}</span>
                            <h4 className="font-bold text-slate-200 text-sm mt-1">{f.q}</h4>
                          </div>

                          {!isCMSReadOnly && (
                            <div className="flex gap-1">
                              <button onClick={() => setEditFaq({ ...f, originalQ: f.q })} className="bg-slate-805 hover:bg-slate-750 p-1.5 rounded text-xs text-slate-300 font-bold flex items-center gap-1 cursor-pointer">
                                <Edit size={12} />
                              </button>
                              <button onClick={() => deleteCmsFaq(f.q)} className="bg-red-950/40 hover:bg-red-900 border border-red-500/20 p-1.5 rounded text-xs text-red-300 font-bold flex items-center gap-1 cursor-pointer">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed italic border-t border-white/5 pt-2">"{f.a}"</p>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* CMS F. TESTIMONIALS */}
              {cmsEditSection === 'testimonials' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <Users size={18} />
                    <span>Testimonials & Review Platform links</span>
                  </h3>
                  
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">To modify, add or edit static testimonials displayed throughout the website, please manage them below. For Live reviews on Google, TripAdvisor and Facebook, select the appropriate review badging in the CMS system.</p>

                  <div className="grid grid-cols-1 gap-4">
                    {siteContent.testimonials.map((t, idx) => (
                      <div key={idx} className="bg-[#121B30] rounded-2xl p-4 border border-white/5 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-bold text-white text-sm">{t.guest_name}</h4>
                            <span className="text-[10px] text-slate-400 font-semibold">{t.toured_package}</span>
                          </div>
                          
                          <span className="bg-emerald-950/20 border border-emerald-500/10 text-emerald-400 px-3 py-0.5 rounded-full text-[10px] font-bold">
                            Source: {t.source}
                          </span>
                        </div>
                        
                        <p className="text-slate-350 text-xs leading-relaxed italic">"{t.comments}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CMS G. YOUTUBE VIDEO GALLERY */}
              {cmsEditSection === 'youtube' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h3 className="text-sm font-bold text-slate-300">YouTube Video Gallery ({(siteContent.youtubeVideos || []).length} videos published)</h3>
                    {!isCMSReadOnly && (
                      <button
                        onClick={() => setEditYoutubeVideo({ title: '', url: '', description: '' })}
                        className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add YouTube Video</span>
                      </button>
                    )}
                  </div>

                  {editYoutubeVideo && (
                    <div className="bg-[#121B30] p-5 rounded-2xl border border-white/10 space-y-4">
                      <h4 className="font-bold text-xs text-[#D4A017] uppercase tracking-widest">{editYoutubeVideo.id ? 'Modify Video Link' : 'Create Video Link'}</h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Video Title</label>
                          <input type="text" value={editYoutubeVideo.title} onChange={e => setEditYoutubeVideo({ ...editYoutubeVideo, title: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="e.g. Zanzibar Vacation Travel Guide 4K" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">YouTube Video URL</label>
                          <input type="text" value={editYoutubeVideo.url} onChange={e => setEditYoutubeVideo({ ...editYoutubeVideo, url: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="e.g. https://www.youtube.com/watch?v=COH39I_8Vv8" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Brief Description</label>
                          <textarea rows={2} value={editYoutubeVideo.description} onChange={e => setEditYoutubeVideo({ ...editYoutubeVideo, description: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none" placeholder="Provide a short highlight summary..." />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end font-bold text-xs">
                        <button onClick={() => setEditYoutubeVideo(null)} className="px-3 py-1.5 bg-slate-800 rounded-xl text-slate-300">Cancel</button>
                        <button onClick={() => saveCmsYoutubeVideo(editYoutubeVideo)} className="px-4 py-1.5 bg-[#D4A017] rounded-xl text-[#020C1F]">Save Video</button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(siteContent.youtubeVideos || []).map((v, i) => (
                      <div key={v.id || i} className="bg-[#121B30] p-4 rounded-2xl border border-white/5 flex gap-4">
                        <div className="relative w-28 aspect-video bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-white/5">
                          <img src={`https://img.youtube.com/vi/${v.embedId}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs truncate">{v.title}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{v.description}</p>
                          </div>
                          <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-1.5">
                            <span className="text-[9px] font-mono text-slate-500 truncate mr-2">{v.url}</span>
                            {!isCMSReadOnly && (
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => setEditYoutubeVideo({ ...v })} className="bg-slate-805 hover:bg-slate-750 p-1 rounded text-[10px] text-slate-300">
                                  <Edit size={10} />
                                </button>
                                <button onClick={() => deleteCmsYoutubeVideo(v.id, v.title)} className="bg-red-950/40 hover:bg-red-900 border border-red-500/20 p-1 rounded text-[10px] text-red-300">
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CMS H. BLOG POSTS */}
              {cmsEditSection === 'blog' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h3 className="text-sm font-bold text-slate-300">Blog Posts CMS ({Object.keys(blogPosts).length} entries published)</h3>
                    {!isCMSReadOnly && (
                      <button
                        onClick={() => setEditBlogPost({ title: '', excerpt: '', content: '', category: 'Travel Tips', author: 'Gerevas Paulo Mtaki', authorBio: 'Founder of Zanzibar Trip & Relax', readTime: '5 min read', image: '', tags: 'zanzibar', date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) })}
                        className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Create Blog Post</span>
                      </button>
                    )}
                  </div>

                  {editBlogPost && (
                    <div className="bg-[#121B30] p-5 rounded-2xl border border-white/10 space-y-4">
                      <h4 className="font-bold text-xs text-[#D4A017] uppercase tracking-widest">{editBlogPost.id ? 'Modify Blog Post' : 'Create Blog Post'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Post Title</label>
                          <input type="text" value={editBlogPost.title} onChange={e => setEditBlogPost({ ...editBlogPost, title: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="e.g. Top 10 Hidden Beaches" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Category</label>
                          <input type="text" value={editBlogPost.category} onChange={e => setEditBlogPost({ ...editBlogPost, category: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="Beaches, Culture, Safari..." />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Author Name</label>
                          <input type="text" value={editBlogPost.author} onChange={e => setEditBlogPost({ ...editBlogPost, author: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Author Bio</label>
                          <input type="text" value={editBlogPost.authorBio} onChange={e => setEditBlogPost({ ...editBlogPost, authorBio: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Banner Image URL</label>
                          <input type="text" value={editBlogPost.image} onChange={e => setEditBlogPost({ ...editBlogPost, image: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="https://..." />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Tags (comma separated)</label>
                          <input type="text" value={Array.isArray(editBlogPost.tags) ? editBlogPost.tags.join(', ') : editBlogPost.tags} onChange={e => setEditBlogPost({ ...editBlogPost, tags: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="beaches, tips, zanzibar" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Excerpt / Intro Text</label>
                          <input type="text" value={editBlogPost.excerpt} onChange={e => setEditBlogPost({ ...editBlogPost, excerpt: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white" placeholder="A brief hook summary for lists..." />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Full Content Text</label>
                          <textarea rows={6} value={editBlogPost.content} onChange={e => setEditBlogPost({ ...editBlogPost, content: e.target.value })} className="w-full bg-[#081835] border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none" placeholder="Write full article here..." />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end font-bold text-xs">
                        <button onClick={() => setEditBlogPost(null)} className="px-3 py-1.5 bg-slate-800 rounded-xl text-slate-300">Cancel</button>
                        <button onClick={() => saveCmsBlogPost(editBlogPost)} className="px-4 py-1.5 bg-[#D4A017] rounded-xl text-[#020C1F]">Publish Post</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {Object.entries(blogPosts).map(([key, p]: [string, any]) => (
                      <div key={key} className="bg-[#121B30] p-4 rounded-2xl border border-white/5 flex gap-4 items-start">
                        {p.image && (
                          <img src={p.image} alt={p.title} className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[9px] bg-[#0B3B8C] text-slate-200 border border-white/5 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">{p.category}</span>
                              <h4 className="font-bold text-slate-200 text-sm mt-1">{p.title}</h4>
                            </div>
                            {!isCMSReadOnly && (
                              <div className="flex gap-1 shrink-0">
                                <button onClick={() => setEditBlogPost({ ...p, key })} className="bg-slate-805 hover:bg-slate-750 p-1.5 rounded text-xs text-slate-300">
                                  <Edit size={12} />
                                </button>
                                <button onClick={() => deleteCmsBlogPost(key, p.title)} className="bg-red-950/40 hover:bg-red-900 border border-red-500/20 p-1.5 rounded text-xs text-red-300">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">{p.excerpt}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2 font-medium">
                            <span>By {p.author}</span>
                            <span>•</span>
                            <span>{p.date}</span>
                            <span>•</span>
                            <span>{p.readTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 3. MEDIA ASSET LIBRARY workspace tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-bold text-slate-200 text-lg">Integrated Assets Vault</h3>
                  <p className="text-xs text-slate-400">Compress and compile images directly to PNG / JPEG configurations.</p>
                </div>

                {!isMediaReadOnly && (
                  <div className="flex items-center gap-3">
                    <label className="bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg transition-all">
                      <Upload size={14} />
                      <span>Upload New Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => triggerImageUpload(e, mediaFolder === 'all' ? 'banners' : mediaFolder)}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Uploading Spinner */}
              {uploadProgress && (
                <div className="bg-[#0B3B8C]/10 border border-[#0B3B8C]/20 p-5 rounded-2xl flex items-center justify-center gap-3 text-slate-200 font-bold text-xs">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Auto-compressing image and storing in CMS Media library...</span>
                </div>
              )}

              {/* Directory Filter tabs */}
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'banners', 'tours', 'avatars', 'safaris'] as const).map(fol => (
                  <button
                    key={fol}
                    onClick={() => setMediaFolder(fol)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                      mediaFolder === fol ? 'bg-[#D4A017] text-[#020C1F]' : 'bg-[#121B30] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Folder: {fol}
                  </button>
                ))}
              </div>

              {/* Media showcase grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {mediaList
                  .filter(m => mediaFolder === 'all' || m.folder === mediaFolder)
                  .map(media => (
                    <div key={media.id} className="bg-[#121B30] rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all group relative">
                      <div className="relative h-40">
                        <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-[#020c1f]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => { navigator.clipboard.writeText(media.url); alert('Direct image URL copied to clipboard!'); }}
                            className="bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-slate-200 text-xs font-bold"
                            title="Copy link"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>

                      <div className="p-3 space-y-1">
                        <div className="font-bold text-slate-200 text-xs truncate" title={media.name}>{media.name}</div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Size: {media.size}</span>
                          {!isMediaReadOnly && (
                            <button onClick={() => deleteMediaFile(media.id, media.name)} className="text-red-400 hover:text-red-300 font-bold">Delete</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          </div>
        )}

        {/* 4. SECURITY & AUDIT LOGS workspace tab */}
        {activeTab === 'logs' && (
          <AuthGuard navigate={navigate} allowedRoles={['Admin']}>
            {(() => {
          // Local calculations for logs tab
          const stats = {
            total: logsList.length,
            bookings: logsList.filter(log => {
              const actionLower = log.action.toLowerCase();
              return actionLower.includes('payment') || actionLower.includes('booking') || actionLower.includes('settle') || actionLower.includes('paid') || actionLower.includes('authorized');
            }).length,
            admin: logsList.filter(log => {
              const actionLower = log.action.toLowerCase();
              return actionLower.includes('edit') || actionLower.includes('modify') || actionLower.includes('update') || actionLower.includes('policy') || actionLower.includes('create') || actionLower.includes('add');
            }).length,
            operators: new Set(logsList.map(l => l.user)).size
          };

          const filteredLogs = logsList.filter(log => {
            const matchSearch = 
              log.user.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
              log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
              (log.ipAddress && log.ipAddress.includes(logSearchQuery)) ||
              (log.previousValue && log.previousValue.toLowerCase().includes(logSearchQuery.toLowerCase())) ||
              (log.newValue && log.newValue.toLowerCase().includes(logSearchQuery.toLowerCase()));

            const matchRole = logRoleFilter === 'all' || log.role.toLowerCase() === logRoleFilter.toLowerCase();

            let matchCategory = true;
            if (logCategoryFilter !== 'all') {
              const actionLower = log.action.toLowerCase();
              if (logCategoryFilter === 'payments') {
                matchCategory = actionLower.includes('payment') || actionLower.includes('booking') || actionLower.includes('settle') || actionLower.includes('paid') || actionLower.includes('authorized');
              } else if (logCategoryFilter === 'admin') {
                matchCategory = actionLower.includes('edit') || actionLower.includes('modify') || actionLower.includes('update') || actionLower.includes('policy') || actionLower.includes('create') || actionLower.includes('add');
              } else if (logCategoryFilter === 'media') {
                matchCategory = actionLower.includes('media') || actionLower.includes('image') || actionLower.includes('upload') || actionLower.includes('delete');
              } else if (logCategoryFilter === 'auth') {
                matchCategory = actionLower.includes('login') || actionLower.includes('logout') || actionLower.includes('logged');
              } else if (logCategoryFilter === 'ops') {
                matchCategory = actionLower.includes('vehicle') || actionLower.includes('driver') || actionLower.includes('guide') || actionLower.includes('supplier') || actionLower.includes('expense');
              }
            }

            return matchSearch && matchRole && matchCategory;
          });

          return (
            <div className="space-y-6">
              
              {/* STATS OVERVIEW BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0A1224] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                    <Activity size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">Total Secure Events</span>
                    <span className="text-xl font-black text-slate-100">{stats.total}</span>
                  </div>
                </div>

                <div className="bg-[#0A1224] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">Bookings & Payments</span>
                    <span className="text-xl font-black text-slate-100">{stats.bookings}</span>
                  </div>
                </div>

                <div className="bg-[#0A1224] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                  <div className="p-3 bg-[#D4A017]/10 text-[#D4A017] rounded-xl">
                    <Settings size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">Configuration Edits</span>
                    <span className="text-xl font-black text-slate-100">{stats.admin}</span>
                  </div>
                </div>

                <div className="bg-[#0A1224] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                    <Users size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold tracking-wider">Active Operators</span>
                    <span className="text-xl font-black text-slate-100">{stats.operators}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
                  <div>
                    <h3 className="font-bold text-slate-200 text-lg">Administrative Audit Logs</h3>
                    <p className="text-xs text-slate-400">Compiles secure system events, login checks, state changes, and staff operations in compliance with data privacy regulations.</p>
                  </div>
                  
                  {/* GLOBAL ACTIONS */}
                  <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
                    <button
                      onClick={() => {
                        setLogSearchQuery('');
                        setLogRoleFilter('all');
                        setLogCategoryFilter('all');
                        setLogsList(getActivities());
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-white/5 bg-[#121B30] hover:bg-[#121B30]/80 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={handleExportAuditLogs}
                      className="px-4 py-1.5 rounded-lg bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-[#D4A017]/10 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Export Audit Ledger</span>
                    </button>
                    <button
                      onClick={handleExportAuditLogsToPDF}
                      className="px-4 py-1.5 rounded-lg bg-[#0B3B8C] hover:bg-[#082E6E] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-[#0B3B8C]/10 cursor-pointer"
                    >
                      <FileText size={14} />
                      <span>Download PDF Report</span>
                    </button>
                  </div>
                </div>

                {/* FILTERING CONTROLS CARD */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 bg-[#121B30]/50 p-4 rounded-2xl border border-white/5">
                  {/* SEARCH */}
                  <div className="md:col-span-5 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                      type="text"
                      placeholder="Search logs by operator, details, IP..."
                      value={logSearchQuery}
                      onChange={(e) => setLogSearchQuery(e.target.value)}
                      className="w-full bg-[#121B30] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#D4A017] font-semibold"
                    />
                  </div>

                  {/* ROLE FILTER */}
                  <div className="md:col-span-3">
                    <select
                      value={logRoleFilter}
                      onChange={(e) => setLogRoleFilter(e.target.value)}
                      className="w-full bg-[#121B30] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-[#D4A017] font-semibold"
                    >
                      <option value="all">All Roles & Clearances</option>
                      <option value="guest">Guest / Web Customers</option>
                      <option value="staff">Staff Operators</option>
                      <option value="administrator">Administrators</option>
                      <option value="super admin">Super Admins</option>
                      <option value="owner">Owners</option>
                      <option value="driver">Drivers</option>
                      <option value="guide">Guides</option>
                      <option value="accountant">Accountants</option>
                      <option value="manager">Managers</option>
                    </select>
                  </div>

                  {/* CATEGORY FILTER */}
                  <div className="md:col-span-4">
                    <select
                      value={logCategoryFilter}
                      onChange={(e) => setLogCategoryFilter(e.target.value)}
                      className="w-full bg-[#121B30] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-[#D4A017] font-semibold"
                    >
                      <option value="all">All Security Classes</option>
                      <option value="payments">Bookings & Financial Payments</option>
                      <option value="admin">Admin & System Configuration Edits</option>
                      <option value="media">Media Uploads & Asset Deletions</option>
                      <option value="auth">Staff Authentication (Logins/Logouts)</option>
                      <option value="ops">Operational ERP Logs (Vehicles, Expenses)</option>
                    </select>
                  </div>
                </div>

                {/* LIST OF EVENT LOGS */}
                <div className="space-y-3.5">
                  {filteredLogs.map((log) => {
                    // Determine stylish context details based on action type
                    const actionLower = log.action.toLowerCase();
                    let iconBg = 'bg-blue-500/10 text-blue-400';
                    let logCategory = 'System Event';

                    if (actionLower.includes('payment') || actionLower.includes('booking') || actionLower.includes('settle') || actionLower.includes('paid') || actionLower.includes('authorized')) {
                      iconBg = 'bg-emerald-500/10 text-emerald-400';
                      logCategory = 'Payment & Booking';
                    } else if (actionLower.includes('delete') || actionLower.includes('terminated')) {
                      iconBg = 'bg-rose-500/10 text-rose-400';
                      logCategory = 'Asset Removal';
                    } else if (actionLower.includes('login') || actionLower.includes('logged')) {
                      iconBg = 'bg-purple-500/10 text-purple-400';
                      logCategory = 'Authentication';
                    } else if (actionLower.includes('edit') || actionLower.includes('modify') || actionLower.includes('update') || actionLower.includes('policy')) {
                      iconBg = 'bg-[#D4A017]/10 text-[#D4A017]';
                      logCategory = 'Admin Modification';
                    }

                    return (
                      <div 
                        key={log.id} 
                        className="bg-[#121B30] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
                            <Shield size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-xs text-white truncate max-w-[150px]" title={log.user}>
                                {log.user}
                              </span>
                              <span className="text-[9px] font-bold bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/15 rounded-full px-2 py-0.5 uppercase tracking-wider scale-95 origin-left">
                                {log.role}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({log.ipAddress || '197.250.3.11'})
                              </span>
                              <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wide">
                                {logCategory}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1.5 font-medium leading-relaxed font-sans">
                              {log.action}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0 shrink-0">
                          <span className="text-[10px] text-slate-500 font-mono font-bold">
                            {log.timestamp}
                          </span>
                          
                          <button 
                            onClick={() => setSelectedInspectLog(log)}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredLogs.length === 0 && (
                    <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
                      <ShieldAlert size={36} className="text-slate-600 mx-auto mb-3" />
                      <p className="text-xs text-slate-400 font-bold">No administrative audit logs found</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">Try adjusting your search queries or category filters above.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* SECURE INSPECTION SIDEBAR DRAWER / COMPLIANCE MODAL */}
              {selectedInspectLog && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-[#0A1224] border-2 border-[#D4A017]/30 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 relative shadow-2xl animate-fade-in">
                    
                    {/* CLOSE BTN */}
                    <button 
                      onClick={() => setSelectedInspectLog(null)}
                      className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <XCircle size={16} />
                    </button>

                    {/* HEADER */}
                    <div className="flex items-center gap-3.5 pb-4 border-b border-white/5">
                      <div className="p-3 bg-[#D4A017]/10 text-[#D4A017] rounded-2xl shrink-0">
                        <Shield size={22} className="animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-base" style={{ fontFamily: 'Playfair Display, serif' }}>
                          Compliance Log Inspector
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400">ID: {selectedInspectLog.id}</p>
                      </div>
                    </div>

                    {/* LOG ATTRIBUTES METADATA GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#121B30] p-5 rounded-2xl border border-white/5 text-xs font-semibold">
                      <div>
                        <span className="block text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-0.5">Operator Identity</span>
                        <span className="text-slate-200 text-sm font-extrabold">{selectedInspectLog.user}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-0.5">Security Clearance</span>
                        <span className="inline-block mt-0.5 text-[9px] font-bold bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/15 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                          {selectedInspectLog.role}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-0.5">Client Host IP Address</span>
                        <span className="text-slate-300 font-mono">{selectedInspectLog.ipAddress || '197.250.3.11'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-0.5">System Timestamp</span>
                        <span className="text-slate-300 font-mono">{selectedInspectLog.timestamp}</span>
                      </div>
                    </div>

                    {/* EVENT ACTION */}
                    <div className="space-y-1.5">
                      <span className="block text-[9px] uppercase text-slate-500 font-bold tracking-wider">Event Action Description</span>
                      <div className="bg-[#121B30]/50 p-4 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-bold">
                        {selectedInspectLog.action}
                      </div>
                    </div>

                    {/* VISUAL DIFFERENCE STATE CHECKER (PREVIOUS VS NEW VALUE DIFF) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* PREVIOUS STATE VALUE (DEPRECATED/REMOVED STATE) */}
                      <div className="space-y-1.5">
                        <span className="block text-[9px] uppercase text-slate-500 font-bold tracking-wider">Previous State Value</span>
                        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 min-h-[100px] flex flex-col justify-between">
                          <p className="text-xs font-mono text-red-300 break-all whitespace-pre-wrap">
                            {selectedInspectLog.previousValue || 'N/A'}
                          </p>
                          <span className="text-[8px] font-black uppercase text-red-400 mt-2 block tracking-widest bg-red-500/10 px-2 py-0.5 rounded w-max">
                            ORIGINAL VALUE
                          </span>
                        </div>
                      </div>

                      {/* NEW STATE VALUE (UPDATED/ACTIVE STATE) */}
                      <div className="space-y-1.5">
                        <span className="block text-[9px] uppercase text-slate-500 font-bold tracking-wider">New State Value</span>
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 min-h-[100px] flex flex-col justify-between">
                          <p className="text-xs font-mono text-emerald-350 break-all whitespace-pre-wrap">
                            {selectedInspectLog.newValue || 'N/A'}
                          </p>
                          <span className="text-[8px] font-black uppercase text-emerald-400 mt-2 block tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded w-max">
                            ACTIVE VALUE
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* BOTTOM REASSURANCE INFO */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-white/5 p-3 rounded-xl">
                      <Lock size={12} className="text-[#D4A017] shrink-0" />
                      <span>This event audit stamp is write-once and secure. Any direct tampering is strictly prohibited under current Zanzibari tourist agency data compliance protocols.</span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button 
                        onClick={() => setSelectedInspectLog(null)}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A017] to-[#c49010] hover:scale-105 active:scale-95 text-[#020C1F] text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#D4A017]/10"
                      >
                        Dismiss View
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          );
        })()}
          </AuthGuard>
        )}

        {/* 4.5 GOOGLE SEARCH CONSOLE SEO ANALYTICS workspace tab */}
        {activeTab === 'seo' && (
          <AuthGuard navigate={navigate} allowedRoles={['Admin']}>
            <SeoAnalytics session={session} />
          </AuthGuard>
        )}

        {/* 5. STAFF AUTHORIZATION & ROLES workspace tab */}
        {activeTab === 'users' && (
          !hasAccess('staff', 'read') ? renderRestrictedState('Staff Directory & ACL') : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs font-semibold">
            
            {/* Left side: Form to register a new user */}
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 lg:col-span-1">
              <div>
                <h3 className="font-bold text-slate-200 text-base" style={{ fontFamily: 'Playfair Display, serif' }}>Register Staff Member</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Sponsor a new identity profile. These values initialize custom local clearances immediately.</p>
              </div>

              {userAddError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3.5 rounded-xl text-xs font-medium">
                  {userAddError}
                </div>
              )}

              {userAddSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl text-xs font-medium">
                  {userAddSuccess}
                </div>
              )}

              <form onSubmit={async (e) => {
                e.preventDefault();
                setUserAddError('');
                setUserAddSuccess('');

                if (!newUsername.trim() || !newName.trim() || !newPassword) {
                  setUserAddError('Please populate all staff configuration fields.');
                  return;
                }

                const currentUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
                const duplicate = currentUsers.find((u: any) => u.username.toLowerCase() === newUsername.trim().toLowerCase());
                if (duplicate) {
                  setUserAddError('Username identity has already been registered in the database.');
                  return;
                }

                try {
                  const hashedPass = await sha256(newPassword);
                  const newUserObj = {
                    username: newUsername.trim().toLowerCase(),
                    passwordHash: hashedPass,
                    name: newName.trim(),
                    role: newRole
                  };
                  
                  const updatedUsers = [...currentUsers, newUserObj];
                  localStorage.setItem('ztr_admin_users', JSON.stringify(updatedUsers));
                  
                  addActivityLog(session?.name || 'Administrator', 'userCreated', `Provisioned new staff role [${newRole}] for user [${newUsername.trim()}].`);
                  
                  setUserAddSuccess(`Successfully created custom staff account for ${newName}!`);
                  setNewUsername('');
                  setNewName('');
                  setNewPassword('');
                  setNewRole('Guide');
                  setUsersRefreshTrigger(prev => prev + 1);
                } catch (err: any) {
                  setUserAddError('Failed to safely hash or store credentials.');
                }
              }} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-350 tracking-wider">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-medium"
                    placeholder="e.g. Careen Harrison Kiondo"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-350 tracking-wider">Login Username</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-mono"
                    placeholder="e.g. careen_kiondo"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-350 tracking-wider">Clearance Permission Role</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-medium"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Sales">Sales Representative</option>
                    <option value="Guide">Tour Captain / Guide</option>
                    <option value="Content Editor">Content Editor</option>
                    <option value="Accountant">Accountant</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-350 tracking-wider">Establish Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full text-xs bg-[#121B30] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#D4A017] transition-all font-medium"
                    placeholder="Min 8 characters"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D4A017] hover:bg-[#c39010] text-[#020C1F] font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#D4A017]/10"
                >
                  Create Staff Account
                </button>
              </form>
            </div>

            {/* Right side: List of active users */}
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 lg:col-span-2">
              <div>
                <h3 className="font-bold text-slate-200 text-base" style={{ fontFamily: 'Playfair Display, serif' }}>Authorized Directory ({JSON.parse(localStorage.getItem('ztr_admin_users') || '[]').length} Keys)</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">Live listing of individuals with authorized clearance credentials to this console.</p>
              </div>

              {/* Roles Description Summary Box */}
              <div className="bg-[#121B30] p-4.5 rounded-2xl border border-white/5 space-y-2 text-[11px] text-slate-400 font-medium">
                <span className="font-bold text-slate-300 uppercase block tracking-wider text-[10px]">Access Clearance Guide:</span>
                <ul className="space-y-1 block list-disc pl-4 leading-relaxed font-medium">
                  <li><strong className="text-red-300">Administrator:</strong> Unrestricted access with full CMS Content editing, Booking ledger controls, security audit logs, and account creation privileges.</li>
                  <li><strong className="text-blue-300">Manager:</strong> Allowed to view and edit Bookings invoice statuses. Allowed to update CMS. No security logs or user creations.</li>
                  <li><strong className="text-emerald-300">Sales Representative:</strong> Allowed to update Booking status details. No access to CMS, media, or logs.</li>
                  <li><strong className="text-indigo-300">Tour Captain / Guide:</strong> Read-only access to view daily Bookings schedules. Cannot change databases or system state.</li>
                  <li><strong className="text-purple-300">Content Editor:</strong> Read-write authorization exclusively to modify Visual CMS pages, FAQs, and Media files.</li>
                  <li><strong className="text-amber-300">Accountant:</strong> Dynamic access starting with write privileges to Financial ledgers and expense recordings.</li>
                </ul>
              </div>

              <div className="space-y-3">
                {JSON.parse(localStorage.getItem('ztr_admin_users') || '[]').map((usr: any, idx: number) => {
                  const r = usr.role;
                  const roleBadgeClass = 
                    r === 'Administrator' || r === 'super-admin' ? 'bg-red-500/10 text-red-400 border-red-500/25' :
                    r === 'Manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/25' :
                    r === 'Sales' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
                    r === 'Guide' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25' :
                    r === 'Accountant' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
                    'bg-purple-500/10 text-purple-400 border-purple-500/25';
                  
                  return (
                    <div key={idx} className="bg-[#121B30] p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-850 border border-white/10 flex items-center justify-center font-bold text-sm text-[#D4A017]">
                          {usr.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100">{usr.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${roleBadgeClass}`}>
                              {usr.role}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-550 mt-0.5 font-medium">Username: <span className="font-mono text-slate-300">{usr.username}</span></p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (session?.username.toLowerCase() === usr.username.toLowerCase()) {
                            alert("Security Error: Self-deletion of your own logged-in identity is prevented to avoid visual system lockouts!");
                            return;
                          }
                          setConfirmDialog({
                            title: 'Revoke Staff Access',
                            message: `Are you sure you want to permanently revoke access for staff account "${usr.name}" (username: ${usr.username})? This user will be immediately logged out and blocked from the Admin panel.`,
                            isDanger: true,
                            confirmLabel: 'Revoke Access',
                            onConfirm: () => {
                              const currentUsers = JSON.parse(localStorage.getItem('ztr_admin_users') || '[]');
                              const nextUsers = currentUsers.filter((u: any) => u.username.toLowerCase() !== usr.username.toLowerCase());
                              localStorage.setItem('ztr_admin_users', JSON.stringify(nextUsers));
                              addActivityLog(session?.name || 'Administrator', 'userDeleted', `Terminated credentials and role permissions for user [${usr.username}].`);
                              setUsersRefreshTrigger(prev => prev + 1);
                              setConfirmDialog(null);
                            }
                          });
                        }}
                        className="bg-red-505/20 hover:bg-red-900 border border-red-500/25 text-red-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Trash2 size={13} />
                        <span>Revoke Access</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Role Permissions Customizer panel */}
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 lg:col-span-3 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-bold text-[#D4A017]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Role Access Control Lists (ACL)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure granular read, write, or restricted authorization privileges for each standard staff role.
                  </p>
                </div>
                {savePermSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 animate-fade-in">
                    <Check size={14} />
                    <span>ACL Permissions Updated Globally!</span>
                  </div>
                )}
              </div>

              {/* Role Select Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'Content Editor', label: 'Content Editor' },
                  { id: 'Accountant', label: 'Accountant' },
                  { id: 'Manager', label: 'Manager' },
                  { id: 'Sales', label: 'Sales Representative' },
                  { id: 'Guide', label: 'Tour Captain / Guide' }
                ].map((roleOpt) => (
                  <button
                    key={roleOpt.id}
                    type="button"
                    onClick={() => {
                      setPermSelectedRole(roleOpt.id);
                      setSavePermSuccess(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      permSelectedRole === roleOpt.id
                        ? 'bg-[#0B3B8C] border-[#D4A017]/30 text-white shadow-lg'
                        : 'bg-[#121B30] border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {roleOpt.label}
                  </button>
                ))}
              </div>

              {/* Module Permissions Matrix */}
              <div className="space-y-4">
                {[
                  { key: 'cms', label: 'CMS & Excursions Content', desc: 'Allows modifying tours, FAQs, and blog articles.', icon: MapPin },
                  { key: 'media', label: 'Media Asset Gallery', desc: 'Allows uploading or deleting visual library images.', icon: Image },
                  { key: 'bookings', label: 'Bookings & Customers', desc: 'Allows accessing reservation calendars, bookings ledger, and client directory.', icon: Calendar },
                  { key: 'finances', label: 'Accounting & Finances', desc: 'Allows recording expenditures, cashflows, and viewing profitability analytics.', icon: TrendingUp },
                  { key: 'staff', label: 'Staff Directory & ACL', desc: 'Allows registering/revoking user accounts and customizing ACL rules (Super Admin only).', icon: Shield },
                  { key: 'vehicles', label: 'Vehicles & Fleet', desc: 'Allows managing the vehicle registry, tracking fuel logs, and service status.', icon: Activity },
                  { key: 'suppliers', label: 'Suppliers & Hotel Directory', desc: 'Allows partnering with resorts, dhow operators, and managing supplier lists.', icon: List }
                ].map((mod) => {
                  const IconComponent = mod.icon;
                  const currentVal = rolePermissions[permSelectedRole]?.[mod.key] || 'none';

                  return (
                    <div
                      key={mod.key}
                      className="bg-[#121B30] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-colors text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#070F1E] border border-white/5 flex items-center justify-center text-[#D4A017] shrink-0 mt-0.5">
                          <IconComponent size={14} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{mod.label}</h4>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{mod.desc}</p>
                        </div>
                      </div>

                      {/* Selectable levels */}
                      <div className="flex items-center gap-1.5 bg-[#070F1E] p-1 rounded-xl border border-white/5">
                        {[
                          { val: 'write', label: 'Read & Write', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                          { val: 'read', label: 'Read-Only', class: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                          { val: 'none', label: 'No Access', class: 'bg-red-500/10 text-red-400 border-red-500/20' }
                        ].map((level) => {
                          const isSelected = currentVal === level.val;
                          return (
                            <button
                              key={level.val}
                              type="button"
                              onClick={() => {
                                setRolePermissions(prev => {
                                  const updated = {
                                    ...prev,
                                    [permSelectedRole]: {
                                      ...prev[permSelectedRole],
                                      [mod.key]: level.val
                                    }
                                  };
                                  return updated;
                                });
                                setSavePermSuccess(false);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                                isSelected
                                  ? `${level.class} border-opacity-50 scale-105 shadow`
                                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-350'
                              }`}
                            >
                              {level.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save security policy button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('ztr_role_permissions', JSON.stringify(rolePermissions));
                    addActivityLog(
                      session?.name || 'Administrator',
                      session?.role || 'Administrator',
                      `Updated security policy and clearances for [${permSelectedRole}] role.`
                    );
                    setSavePermSuccess(true);
                    setTimeout(() => setSavePermSuccess(false), 3500);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A017] to-[#c49010] hover:scale-105 active:scale-95 text-[#020C1F] text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-[#D4A017]/10"
                >
                  Save {permSelectedRole} Security Policy
                </button>
              </div>
            </div>
          </div>
          )
        )}

        {/* 6. HOLIDAY PAYMENT POLICIES AND CUTOFF RULES workspace tab */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            <div className="bg-[#0A1224] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 text-xs text-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Dynamic Rates & Checkout Policies</h3>
                  <p className="text-xs text-slate-400 mt-1">Configure individual deposit ratios, cut-off hours, and payment preferences across all tour types.</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem('ztr_payment_policies', JSON.stringify(policies));
                    addActivityLog(session?.name || 'Administrator', 'policyUpdate', 'Updated dynamic prepayment ratios and deadline cutoffs across all tour structures.');
                    setPoliciesSaveSucc(true);
                    setTimeout(() => setPoliciesSaveSucc(false), 3000);
                  }}
                  className="bg-[#D4A017] hover:bg-[#b8850f] text-[#020C1F] font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider outline-none select-none cursor-pointer"
                >
                  Save Global Policies
                </button>
              </div>

              {policiesSaveSucc && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check size={16} />
                  <span>Success: Prepayment and cut-off deadlines have been updated globally! These rates apply to checkout immediately.</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-semibold">
                {/* Tours section */}
                <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">🏝️ Zanzibar Excursions</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Prepayment Percentage (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={policies.tours.depositPct}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          tours: { ...prev.tours, depositPct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Permissible Checkout Options</label>
                      <select
                        value={policies.tours.paymentOption}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          tours: { ...prev.tours, paymentOption: e.target.value }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white font-semibold"
                      >
                        <option value="both">Allow Security Deposit or 100% Prepayment</option>
                        <option value="full">Require Full 100% Prepayment Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Booking Cut-off limit (Hours Before Start)</label>
                      <input
                        type="number"
                        min={1}
                        value={policies.tours.cutoffHours}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          tours: { ...prev.tours, cutoffHours: Math.max(1, parseInt(e.target.value) || 1) }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Kilimanjaro section */}
                <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">🗻 Mount Kilimanjaro Treks</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Prepayment Percentage (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={policies.kilimanjaro.depositPct}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          kilimanjaro: { ...prev.kilimanjaro, depositPct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Permissible Checkout Options</label>
                      <select
                        value={policies.kilimanjaro.paymentOption}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          kilimanjaro: { ...prev.kilimanjaro, paymentOption: e.target.value }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white font-semibold"
                      >
                        <option value="both">Allow Security Deposit or 100% Prepayment</option>
                        <option value="full">Require Full 100% Prepayment Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Booking Cut-off limit (Hours Before)</label>
                      <input
                        type="number"
                        min={1}
                        value={policies.kilimanjaro.cutoffHours}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          kilimanjaro: { ...prev.kilimanjaro, cutoffHours: Math.max(1, parseInt(e.target.value) || 1) }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Safaris Multi day section */}
                <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">🦁 Tanzania Safaris (Multi-Day Overland)</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Prepayment Percentage (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={policies.safari_multi.depositPct}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          safari_multi: { ...prev.safari_multi, depositPct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Permissible Checkout Options</label>
                      <select
                        value={policies.safari_multi.paymentOption}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          safari_multi: { ...prev.safari_multi, paymentOption: e.target.value }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white font-semibold"
                      >
                        <option value="both">Allow Security Deposit or 100% Prepayment</option>
                        <option value="full">Require Full 100% Prepayment Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Booking Cut-off limit (Hours)</label>
                      <input
                        type="number"
                        min={1}
                        value={policies.safari_multi.cutoffHours}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          safari_multi: { ...prev.safari_multi, cutoffHours: Math.max(1, parseInt(e.target.value) || 1) }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Fly-in Safaris Section */}
                <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">✈️ Fly-In Luxury Safaris</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Prepayment Percentage (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={policies.safari_fly_in.depositPct}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          safari_fly_in: { ...prev.safari_fly_in, depositPct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Permissible Checkout Options</label>
                      <select
                        value={policies.safari_fly_in.paymentOption}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          safari_fly_in: { ...prev.safari_fly_in, paymentOption: e.target.value }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white font-semibold"
                      >
                        <option value="both">Allow Security Deposit or 100% Prepayment</option>
                        <option value="full">Require Full 100% Prepayment Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Booking Cut-off limit (Hours)</label>
                      <input
                        type="number"
                        min={1}
                        value={policies.safari_fly_in.cutoffHours}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          safari_fly_in: { ...prev.safari_fly_in, cutoffHours: Math.max(1, parseInt(e.target.value) || 1) }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Airport Transfers section */}
                <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4 md:col-span-2">
                  <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider font-bold">🚖 Private Airport Transfers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bold">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Prepayment Percentage (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={policies.transfers.depositPct}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          transfers: { ...prev.transfers, depositPct: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Permissible Checkout Options</label>
                      <select
                        value={policies.transfers.paymentOption}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          transfers: { ...prev.transfers, paymentOption: e.target.value }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white font-medium"
                      >
                        <option value="both">Allow Security Deposit or 100% Prepayment</option>
                        <option value="full">Require Full 100% Prepayment Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Booking Cut-off (Hours)</label>
                      <input
                        type="number"
                        min={1}
                        value={policies.transfers.cutoffHours}
                        onChange={e => setPolicies(prev => ({
                          ...prev,
                          transfers: { ...prev.transfers, cutoffHours: Math.max(1, parseInt(e.target.value) || 1) }
                        }))}
                        className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white font-medium"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Extended Seasonal Pricing Rates */}
              <div className="border-t border-white/5 pt-6 mt-6 space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar size={18} className="text-[#D4A017]" />
                    <span>Extended Seasonal Surcharges & Promotion Rates</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Configure active travel seasons with start and end dates. Booking checkout prices will automatically adjust based on these ranges.</p>
                </div>

                {extendedSeasonSaveSucc && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Check size={16} />
                    <span>Success: Seasonal adjustment schedules have been saved and applied to the booking engine!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Current Season List (2 cols) */}
                  <div className="lg:col-span-2 space-y-3">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Active Adjustment Schedules</span>
                    {extendedSeasons.length === 0 ? (
                      <div className="bg-[#121B30] p-6 rounded-2xl border border-white/5 text-center text-slate-400">
                        No custom travel seasons configured. Standard fallback rates will apply.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {extendedSeasons.map((season) => (
                          <div key={season.id} className="bg-[#121B30] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div className="space-y-1">
                              <span className="font-extrabold text-white text-xs">{season.name}</span>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <span>📅 Span:</span>
                                <span className="font-mono text-slate-300">
                                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][season.startMonth - 1]} {season.startDay} - {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][season.endMonth - 1]} {season.endDay}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="bg-[#0A1224] border border-white/10 px-3 py-1.5 rounded-xl text-center">
                                <span className="text-[9px] uppercase text-slate-400 block font-black">Rate Impact</span>
                                <span className={`text-xs font-black ${season.isDiscount ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {season.isDiscount ? '-' : '+'}{season.adjustmentPct}% {season.isDiscount ? 'Discount' : 'Surcharge'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = extendedSeasons.filter(s => s.id !== season.id);
                                  setExtendedSeasons(updated);
                                }}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-xl transition-all select-none cursor-pointer"
                                title="Delete Season"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Season Form (1 col) */}
                  <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-3">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Configure New Season</span>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Season Name</label>
                        <input
                          id="new-season-name"
                          type="text"
                          placeholder="e.g. Easter Holiday"
                          className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white font-semibold text-xs focus:outline-none focus:border-[#D4A017]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Start Month</label>
                          <select id="new-season-sm" className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white font-semibold text-xs focus:outline-none">
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                              <option key={m} value={m}>{['January','February','March','April','May','June','July','August','September','October','November','December'][m-1]}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Start Day</label>
                          <select id="new-season-sd" className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white font-semibold text-xs focus:outline-none">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">End Month</label>
                          <select id="new-season-em" className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white font-semibold text-xs focus:outline-none">
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                              <option key={m} value={m}>{['January','February','March','April','May','June','July','August','September','October','November','December'][m-1]}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">End Day</label>
                          <select id="new-season-ed" className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white font-semibold text-xs focus:outline-none">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Adjustment %</label>
                          <input
                            id="new-season-pct"
                            type="number"
                            min="0"
                            max="100"
                            defaultValue="15"
                            className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white font-semibold text-xs focus:outline-none focus:border-[#D4A017]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Type</label>
                          <select id="new-season-type" className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white font-semibold text-xs focus:outline-none">
                            <option value="surcharge">Surcharge (+)</option>
                            <option value="discount">Discount (-)</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nameInput = document.getElementById('new-season-name') as HTMLInputElement;
                          const smSelect = document.getElementById('new-season-sm') as HTMLSelectElement;
                          const sdSelect = document.getElementById('new-season-sd') as HTMLSelectElement;
                          const emSelect = document.getElementById('new-season-em') as HTMLSelectElement;
                          const edSelect = document.getElementById('new-season-ed') as HTMLSelectElement;
                          const pctInput = document.getElementById('new-season-pct') as HTMLInputElement;
                          const typeSelect = document.getElementById('new-season-type') as HTMLSelectElement;

                          if (!nameInput.value.trim()) {
                            alert('Please provide a name for the travel season.');
                            return;
                          }

                          const newSeason: ExtendedSeason = {
                            id: 's-' + Date.now(),
                            name: nameInput.value.trim(),
                            startMonth: parseInt(smSelect.value),
                            startDay: parseInt(sdSelect.value),
                            endMonth: parseInt(emSelect.value),
                            endDay: parseInt(edSelect.value),
                            adjustmentPct: parseInt(pctInput.value) || 0,
                            isDiscount: typeSelect.value === 'discount'
                          };

                          setExtendedSeasons(prev => [...prev, newSeason]);
                          nameInput.value = '';
                        }}
                        className="w-full bg-[#D4A017]/10 hover:bg-[#D4A017]/25 text-[#D4A017] border border-[#D4A017]/30 font-extrabold py-2 rounded-xl text-xs uppercase tracking-wider transition-all select-none cursor-pointer mt-1 flex items-center justify-center gap-1.5"
                      >
                        <Plus size={13} />
                        <span>Add Season Span</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      saveExtendedSeasonality(extendedSeasons);
                      addActivityLog('Administrator', 'seasonalityUpdate', 'Saved updated extended travel seasons configuration for automated date-based pricing.');
                      setExtendedSeasonSaveSucc(true);
                      setTimeout(() => setExtendedSeasonSaveSucc(false), 3000);
                    }}
                    className="bg-[#D4A017] hover:bg-[#b8850f] text-[#020C1F] font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider select-none cursor-pointer"
                  >
                    Save All Seasonal Rates
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6.5. AUTOMATED TRANSPORT ZONES & HOTELS DIRECTORY WORKSPACE */}
        {activeTab === 'transportZones' && (
          <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6 text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-black text-[#D4A017] tracking-tight">Transport Logistics & Zone Directory</h3>
                <p className="text-xs text-slate-400">Configure pickup location autocomplete directory, map hotels to transport zones, and set internal transport tariffs.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTransportSubTab('zones')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    transportSubTab === 'zones'
                      ? 'bg-[#0B3B8C] text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  🚐 Transport Zones ({zonesList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTransportSubTab('hotels')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    transportSubTab === 'hotels'
                      ? 'bg-[#0B3B8C] text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  🏨 Hotels & Autocomplete ({hotelsList.length})
                </button>
              </div>
            </div>

            {/* SUB-TAB A: TRANSPORT ZONES */}
            {transportSubTab === 'zones' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Search */}
                  <div className="relative w-full sm:max-w-xs">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      value={zoneSearch}
                      onChange={e => setZoneSearch(e.target.value)}
                      placeholder="Search zones..."
                      className="w-full bg-[#121B30]/60 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold placeholder-slate-500 focus:outline-[#D4A017]"
                    />
                  </div>

                  {/* Add Zone Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewZoneName('');
                      setNewZonePrice(0);
                      setIsAddingZone(true);
                      setEditingZone(null);
                    }}
                    className="w-full sm:w-auto bg-[#D4A017] hover:bg-[#b8850f] text-[#020C1F] font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Create Transport Zone</span>
                  </button>
                </div>

                {/* Adding / Editing Zone Inline Drawer */}
                {(isAddingZone || editingZone) && (
                  <div className="bg-[#121B30]/40 border border-[#D4A017]/20 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-[#D4A017]">
                      {editingZone ? `Edit Transport Zone: ${editingZone.name}` : 'Create New Transport Zone'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Zone Name / Description *</label>
                        <input
                          type="text"
                          value={editingZone ? editingZone.name : newZoneName}
                          onChange={e => {
                            const val = e.target.value;
                            if (editingZone) setEditingZone(prev => prev ? { ...prev, name: val } : null);
                            else setNewZoneName(val);
                          }}
                          placeholder="e.g. Zone 13 – Michamvi Kae Peninsula"
                          className="w-full bg-[#020C1F] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Transport Price (USD) *</label>
                        <input
                          type="number"
                          value={editingZone ? editingZone.price : newZonePrice}
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            if (editingZone) setEditingZone(prev => prev ? { ...prev, price: val } : null);
                            else setNewZonePrice(val);
                          }}
                          placeholder="e.g. 45"
                          className="w-full bg-[#020C1F] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingZone(false);
                          setEditingZone(null);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const name = editingZone ? editingZone.name : newZoneName;
                          const price = editingZone ? editingZone.price : newZonePrice;

                          if (!name.trim()) {
                            alert('Please specify a valid transport zone name.');
                            return;
                          }

                          let updated: TransportZone[] = [];
                          if (editingZone) {
                            updated = zonesList.map(z => z.id === editingZone.id ? { ...editingZone, name: name.trim(), price } : z);
                            addActivityLog('Administrator', 'zoneUpdate', `Updated transport zone ${editingZone.id} with tariff $${price}`);
                          } else {
                            const newZ: TransportZone = {
                              id: 'z' + (zonesList.length + 1) + '-' + Date.now().toString().slice(-4),
                              name: name.trim(),
                              price,
                              enabled: true
                            };
                            updated = [...zonesList, newZ];
                            addActivityLog('Administrator', 'zoneCreate', `Created transport zone ${newZ.name} with tariff $${price}`);
                          }

                          setZonesList(updated);
                          saveTransportZones(updated);
                          setIsAddingZone(false);
                          setEditingZone(null);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white"
                      >
                        Save Zone Configuration
                      </button>
                    </div>
                  </div>
                )}

                {/* Zones Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/5">
                  <table className="w-full text-left text-xs font-semibold text-slate-300">
                    <thead className="bg-white/5 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      <tr>
                        <th className="p-4">Zone ID</th>
                        <th className="p-4">Geographical Zone Region</th>
                        <th className="p-4">Internal Transport Price (USD)</th>
                        <th className="p-4">Logistics Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#121B30]/25">
                      {zonesList
                        .filter(z => z.name.toLowerCase().includes(zoneSearch.toLowerCase()) || z.id.toLowerCase().includes(zoneSearch.toLowerCase()))
                        .map(z => (
                          <tr key={z.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-mono font-bold text-slate-400">{z.id}</td>
                            <td className="p-4 text-white font-extrabold">{z.name}</td>
                            <td className="p-4 font-mono text-[#D4A017] font-black">${z.price} USD</td>
                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = zonesList.map(item => item.id === z.id ? { ...item, enabled: item.enabled === false ? true : false } : item);
                                  setZonesList(updated);
                                  saveTransportZones(updated);
                                  addActivityLog('Administrator', 'zoneStatusToggle', `Toggled transport zone ${z.name} status.`);
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  z.enabled !== false
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                              >
                                {z.enabled !== false ? '● ACTIVE / ENABLED' : '○ DISABLED'}
                              </button>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingZone(z);
                                  setIsAddingZone(false);
                                }}
                                className="text-slate-400 hover:text-white transition-colors"
                                title="Edit Zone Details"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete transport zone ${z.name}? This will affect all mapped hotels!`)) {
                                    const updated = zonesList.filter(item => item.id !== z.id);
                                    setZonesList(updated);
                                    saveTransportZones(updated);
                                    addActivityLog('Administrator', 'zoneDelete', `Deleted transport zone ${z.name}.`);
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete Zone"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB B: HOTELS & AUTOCOMPLETE MAPPING */}
            {transportSubTab === 'hotels' && (
              <div className="space-y-6">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  {/* Search, Filter, and Action Bar */}
                  <div className="flex flex-wrap items-center gap-3 w-full xl:max-w-xl">
                    <div className="relative flex-1 min-w-[200px]">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Search size={14} />
                      </span>
                      <input
                        type="text"
                        value={hotelSearch}
                        onChange={e => setHotelSearch(e.target.value)}
                        placeholder="Search resorts, villas, landmarks..."
                        className="w-full bg-[#121B30]/60 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold placeholder-slate-500 focus:outline-[#D4A017]"
                      />
                    </div>
                    <select
                      value={selectedZoneFilter}
                      onChange={e => setSelectedZoneFilter(e.target.value)}
                      className="bg-[#121B30]/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#D4A017] text-slate-300"
                    >
                      <option value="all">All Transport Zones</option>
                      {zonesList.map(z => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Add Hotel Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewHotelName('');
                      setNewHotelZoneId(zonesList[0]?.id || 'z1');
                      setIsAddingHotel(true);
                      setEditingHotel(null);
                    }}
                    className="w-full xl:w-auto bg-[#D4A017] hover:bg-[#b8850f] text-[#020C1F] font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add New Hotel Location</span>
                  </button>
                </div>

                {/* Bulk Import / CSV pasting and file uploading area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#121B30]/20 p-5 border border-white/5 rounded-2xl">
                  <div className="lg:col-span-1 space-y-3">
                    <h4 className="text-xs font-black uppercase text-[#D4A017] flex items-center gap-1">
                      <Upload size={14} />
                      Bulk Import Wizard
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Quickly bulk import your entire database of Zanzibar partner hotels, villas, airbnbs, and drop-off regions. Paste standard CSV rows, or load a `.csv` file. No manual data entry required.
                    </p>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1.5 text-[10px]">
                      <p className="font-extrabold text-[#D4A017] uppercase">CSV Column Format (2 Columns):</p>
                      <code className="block text-slate-300 font-mono select-all">Hotel Name, Zone Name (or Zone ID)</code>
                      <button
                        type="button"
                        onClick={() => {
                          setCsvPasteText(
                            `Riu Palace Zanzibar, Zone 11 – Nungwi\n` +
                            `Z Hotel, Zone 11 – Nungwi\n` +
                            `Nungwi Dreams, Zone 11 – Nungwi\n` +
                            `Paje Blue Surf Palms Resort, Zone 8 – Paje\n` +
                            `Matemwe Beach Retreat, Zone 3 – Matemwe\n` +
                            `Melia Zanzibar Luxury Resort, Zone 4 – Kiwengwa`
                          );
                        }}
                        className="text-[9px] text-[#D4A017] underline font-bold uppercase tracking-wider block mt-2 hover:text-[#b8850f]"
                      >
                        ⚡ Insert Sample CSV Template
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Paste CSV Contents below</label>
                        <textarea
                          rows={4}
                          value={csvPasteText}
                          onChange={e => setCsvPasteText(e.target.value)}
                          placeholder="e.g. Resort Name, Zone Name"
                          className="w-full bg-[#020C1F] border border-white/10 rounded-xl p-2.5 text-[10px] font-mono leading-normal text-slate-200 placeholder-slate-600 focus:outline-[#D4A017]"
                        />
                      </div>
                      <div className="flex flex-col justify-between border border-dashed border-white/10 rounded-xl p-4 text-center bg-white/5 space-y-3">
                        <div className="my-auto space-y-2">
                          <p className="text-[11px] font-bold text-slate-300">Alternatively, Drag & Drop CSV File</p>
                          <p className="text-[10px] text-slate-500">Supports standard UTF-8 CSV sheets</p>
                        </div>
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader();
                              r.onload = (evt) => {
                                const txt = evt.target?.result as string;
                                if (txt) {
                                  setCsvPasteText(txt);
                                }
                              };
                              r.readAsText(file);
                            }
                          }}
                          className="mx-auto text-[10px] text-slate-400 bg-[#020C1F] border border-white/10 px-2.5 py-1.5 rounded-lg max-w-full font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!csvPasteText.trim()) {
                            alert('Please paste some CSV text or load a file first.');
                            return;
                          }
                          const lines = csvPasteText.split('\n');
                          const newHotels: HotelOption[] = [...hotelsList];
                          let successCount = 0;
                          let skippedCount = 0;

                          for (let line of lines) {
                            line = line.trim();
                            if (!line) continue;
                            if (line.toLowerCase().includes('hotel') && (line.toLowerCase().includes('zone') || line.toLowerCase().includes('price'))) {
                              continue; // skip header
                            }

                            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                            if (parts.length >= 2) {
                              const hotelName = parts[0].replace(/^["']|["']$/g, '').trim();
                              const zoneRef = parts[1].replace(/^["']|["']$/g, '').trim();

                              if (hotelName && zoneRef) {
                                // Fuzzy zone matching
                                const matchedZone = zonesList.find(z => 
                                  z.id.toLowerCase() === zoneRef.toLowerCase() || 
                                  z.name.toLowerCase().includes(zoneRef.toLowerCase()) ||
                                  zoneRef.toLowerCase().includes(z.name.toLowerCase())
                                );

                                const targetZoneId = matchedZone ? matchedZone.id : (zonesList[0]?.id || 'z1');
                                
                                const existingIdx = newHotels.findIndex(h => h.name.toLowerCase() === hotelName.toLowerCase());
                                if (existingIdx >= 0) {
                                  newHotels[existingIdx] = {
                                    ...newHotels[existingIdx],
                                    zoneId: targetZoneId
                                  };
                                } else {
                                  newHotels.push({
                                    id: 'h-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
                                    name: hotelName,
                                    zoneId: targetZoneId,
                                    enabled: true
                                  });
                                }
                                successCount++;
                              } else {
                                skippedCount++;
                              }
                            } else {
                              skippedCount++;
                            }
                          }

                          if (successCount > 0) {
                            setHotelsList(newHotels);
                            saveHotels(newHotels);
                            addActivityLog('Administrator', 'bulkHotelImport', `Bulk imported ${successCount} hotel options.`);
                            alert(`Bulk Upload Success! Imported/Updated ${successCount} hotels into database. Mapped automatically to appropriate transport zones.`);
                            setCsvPasteText('');
                          } else {
                            alert('Failed to parse CSV. Please ensure you are pasting two columns separated by a comma (e.g. Royal Orchid, Zone 11).');
                          }
                        }}
                        className="bg-[#D4A017] hover:bg-[#b8850f] text-[#020C1F] font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wide transition-all"
                      >
                        ⚡ Process CSV Upload & Assign Zones
                      </button>
                    </div>
                  </div>
                </div>

                {/* Adding / Editing Hotel Inline Panel */}
                {(isAddingHotel || editingHotel) && (
                  <div className="bg-[#121B30]/40 border border-[#D4A017]/20 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-[#D4A017]">
                      {editingHotel ? `Edit Location: ${editingHotel.name}` : 'Create New Hotel / Landmark Location'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Hotel / Location Name *</label>
                        <input
                          type="text"
                          value={editingHotel ? editingHotel.name : newHotelName}
                          onChange={e => {
                            const val = e.target.value;
                            if (editingHotel) setEditingHotel(prev => prev ? { ...prev, name: val } : null);
                            else setNewHotelName(val);
                          }}
                          placeholder="e.g. Royal Zanzibar Beach Resort"
                          className="w-full bg-[#020C1F] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assigned Transport Zone *</label>
                        <select
                          value={editingHotel ? editingHotel.zoneId : newHotelZoneId}
                          onChange={e => {
                            const val = e.target.value;
                            if (editingHotel) setEditingHotel(prev => prev ? { ...prev, zoneId: val } : null);
                            else setNewHotelZoneId(val);
                          }}
                          className="w-full bg-[#020C1F] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300"
                        >
                          {zonesList.map(z => (
                            <option key={z.id} value={z.id}>{z.name} (${z.price})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingHotel(false);
                          setEditingHotel(null);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const name = editingHotel ? editingHotel.name : newHotelName;
                          const zoneId = editingHotel ? editingHotel.zoneId : newHotelZoneId;

                          if (!name.trim()) {
                            alert('Please specify a valid hotel name.');
                            return;
                          }

                          let updated: HotelOption[] = [];
                          if (editingHotel) {
                            updated = hotelsList.map(h => h.id === editingHotel.id ? { ...editingHotel, name: name.trim(), zoneId } : h);
                            addActivityLog('Administrator', 'hotelUpdate', `Updated hotel location: ${name.trim()}`);
                          } else {
                            const newH: HotelOption = {
                              id: 'h-' + Date.now(),
                              name: name.trim(),
                              zoneId,
                              enabled: true
                            };
                            updated = [...hotelsList, newH];
                            addActivityLog('Administrator', 'hotelCreate', `Added hotel location: ${newH.name}`);
                          }

                          setHotelsList(updated);
                          saveHotels(updated);
                          setIsAddingHotel(false);
                          setEditingHotel(null);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white"
                      >
                        Save Location
                      </button>
                    </div>
                  </div>
                )}

                {/* Hotels List table */}
                <div className="overflow-x-auto rounded-2xl border border-white/5">
                  <table className="w-full text-left text-xs font-semibold text-slate-300">
                    <thead className="bg-white/5 text-[10px] text-slate-400 uppercase font-black tracking-wider">
                      <tr>
                        <th className="p-4">Hotel / Landmark Location</th>
                        <th className="p-4">Mapped Transport Zone</th>
                        <th className="p-4">Surcharge (USD)</th>
                        <th className="p-4">Search Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#121B30]/25">
                      {hotelsList
                        .filter(h => {
                          const matchSearch = h.name.toLowerCase().includes(hotelSearch.toLowerCase());
                          const matchZone = selectedZoneFilter === 'all' || h.zoneId === selectedZoneFilter;
                          return matchSearch && matchZone;
                        })
                        .map(h => {
                          const zone = zonesList.find(z => z.id === h.zoneId);
                          return (
                            <tr key={h.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-4 text-white font-extrabold">{h.name}</td>
                              <td className="p-4 text-slate-300 font-bold">{zone ? zone.name : 'Unknown Zone'}</td>
                              <td className="p-4 font-mono text-[#D4A017] font-black">${zone ? zone.price : 0} USD</td>
                              <td className="p-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = hotelsList.map(item => item.id === h.id ? { ...item, enabled: item.enabled === false ? true : false } : item);
                                    setHotelsList(updated);
                                    saveHotels(updated);
                                    addActivityLog('Administrator', 'hotelStatusToggle', `Toggled hotel ${h.name} search status.`);
                                  }}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    h.enabled !== false
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  }`}
                                >
                                  {h.enabled !== false ? '● active suggestions' : '○ hidden'}
                                </button>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingHotel(h);
                                    setIsAddingHotel(false);
                                  }}
                                  className="text-slate-400 hover:text-white transition-colors"
                                  title="Edit Hotel Details"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${h.name}?`)) {
                                      const updated = hotelsList.filter(item => item.id !== h.id);
                                      setHotelsList(updated);
                                      saveHotels(updated);
                                      addActivityLog('Administrator', 'hotelDelete', `Deleted hotel ${h.name}.`);
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Delete Location"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. NEWSLETTER SUBSCRIPTIONS LEDGER workspace tab */}
        {activeTab === 'subscriptions' && (
          <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Mail size={20} />
                  <span>Newsletter Subscriptions Ledger</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Manage, copy, or purge client emails registered for seasonal Swahili coast travel promotions.</p>
              </div>
              <button
                onClick={() => {
                  const localList = JSON.parse(localStorage.getItem('ztr_newsletter_subscribers') || '[]');
                  const dbList = (subscribersList || []).map((s: any) => s.email);
                  const list = Array.from(new Set([...localList, ...dbList]));
                  if (list.length === 0) {
                    alert('No subscriptions to copy.');
                    return;
                  }
                  navigator.clipboard.writeText(list.join(', '));
                  alert('All email addresses copied to clipboard as a comma-separated list!');
                }}
                className="bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-extrabold px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Copy size={13} />
                <span>Copy All Emails</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {(() => {
                const localList = JSON.parse(localStorage.getItem('ztr_newsletter_subscribers') || '[]');
                const dbList = (subscribersList || []).map((s: any) => s.email);
                const list = Array.from(new Set([...localList, ...dbList]));
                if (list.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                      No email subscribers found in ledger.
                    </div>
                  );
                }
                return list.map((email: string, i: number) => {
                  const isDbOnly = dbList.includes(email) && !localList.includes(email);
                  return (
                    <div key={i} className="bg-[#121B30] rounded-2xl p-4 flex justify-between items-center border border-white/5 hover:bg-[#15203b] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold font-mono">
                          {i + 1}
                        </div>
                        <div>
                          <span className="text-xs text-white font-medium block">{email}</span>
                          {isDbOnly && (
                            <span className="text-[9px] text-[#D4A017] font-semibold uppercase tracking-wider">Cloud Synchronized</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setConfirmDialog({
                            title: 'Remove Subscriber',
                            message: `Are you sure you want to remove the newsletter subscription for "${email}"?`,
                            isDanger: true,
                            confirmLabel: 'Remove Subscription',
                            onConfirm: async () => {
                              const updatedLocal = localList.filter((e: string) => e !== email);
                              localStorage.setItem('ztr_newsletter_subscribers', JSON.stringify(updatedLocal));
                              try {
                                await supabase.from('newsletter_subscribers').delete().eq('email', email);
                              } catch (e) {
                                console.warn('Failed to delete subscriber from database:', e);
                              }
                              loadSubscribers();
                              setConfirmDialog(null);
                            }
                          });
                        }}
                        className="bg-red-950 hover:bg-red-900 border border-red-500/20 p-2 rounded-lg text-red-300 text-xs cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* --- DYNAMIC TAB: CAREERS & VACANCIES ADMINISTRATION MANAGER --- */}
        {activeTab === 'careers' && (
          <div className="space-y-8">
            {/* Vacancies section */}
            <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    <Briefcase size={20} className="text-[#D4A017]" />
                    <span>Active Vacancies Directory ({getJobs().length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Publish, close, edit, or delete recruitment positions across guiding, marine operations, and town sales departments.</p>
                </div>
                <button
                  onClick={() => setShowAddVacancyModal(true)}
                  className="bg-[#D4A017] hover:bg-[#b8850f] text-[#020C1F] font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} className="stroke-[3]" />
                  <span>Post New Vacancy</span>
                </button>
              </div>

              {/* Vacancy lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getJobs().map((job) => (
                  <div key={job.id} className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4 hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#D4A017] tracking-wider bg-[#D4A017]/10 px-2 py-0.5 rounded">
                          {job.department}
                        </span>
                        <h4 className="text-sm font-extrabold text-white mt-1.5">{job.title}</h4>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        job.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/10 text-red-400 border border-red-500/25'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-2">
                      {job.desc}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-300">
                      <div>📍 {job.location}</div>
                      <div>💵 {job.salary}</div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          const list = getJobs();
                          const updated = list.map(j => j.id === job.id ? { ...j, status: (j.status === 'open' ? 'closed' : 'open') as 'open' | 'closed' } : j);
                          saveJobs(updated);
                          addActivityLog(session?.name || 'Admin', 'jobUpdate', `Changed status of position "${job.title}" to ${job.status === 'open' ? 'closed' : 'open'}`);
                          setCareersRefresh(prev => prev + 1);
                        }}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 cursor-pointer"
                      >
                        Toggle Status
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDialog({
                            title: 'Delete Job Position',
                            message: `Are you sure you want to permanently delete the "${job.title}" position?`,
                            isDanger: true,
                            confirmLabel: 'Delete Job',
                            onConfirm: () => {
                              const list = getJobs();
                              const updated = list.filter(j => j.id !== job.id);
                              saveJobs(updated);
                              addActivityLog(session?.name || 'Admin', 'jobDelete', `Deleted recruitment vacancy for "${job.title}".`);
                              setCareersRefresh(prev => prev + 1);
                              setConfirmDialog(null);
                            }
                          });
                        }}
                        className="bg-red-950 hover:bg-red-900 border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold text-red-300 cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 size={11} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application candidates submissions */}
            <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
              <div className="pb-4 border-b border-white/5">
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Users size={20} className="text-[#D4A017]" />
                  <span>CV & Applications Ledger ({applicantsList.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Review applicant profiles, download uploaded CV files, and manage candidate hiring pipelines.</p>
              </div>

              {applicantsList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-semibold">
                  No applicant submittals registered in database yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {applicantsList.map((app: any) => (
                    <div key={app.id} className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-white">{app.name}</h4>
                            <span className="text-slate-500">•</span>
                            <span className="text-xs font-bold text-[#D4A017]">{app.jobTitle}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Applied on: {app.appliedAt}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded ${
                            app.status === 'approved' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                              : app.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/25'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>

                      {/* Candidate contact and resume */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-300 bg-[#091122] p-4 rounded-xl border border-white/5">
                        <div>📞 Phone: {app.phone}</div>
                        <div>✉️ Email: {app.email}</div>
                        <div className="flex items-center gap-1.5 text-blue-400">
                          <FileText size={13} />
                          <span className="truncate underline cursor-pointer hover:text-blue-300" title="Click to view file details">
                            {app.cvName}
                          </span>
                        </div>
                      </div>

                      {app.coverLetter && (
                        <div className="text-xs text-slate-400 bg-black/20 p-4 rounded-xl border border-white/5">
                          <strong className="block text-slate-300 mb-1">Cover Note:</strong>
                          "{app.coverLetter}"
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                const list = applicantsList.map(a => a.id === app.id ? { ...a, status: 'approved' } : a);
                                setApplicantsList(list);
                                localStorage.setItem('ztr_applicants', JSON.stringify(list));
                                addActivityLog(session?.name || 'Admin', 'applicantAction', `Approved candidate "${app.name}" for position "${app.jobTitle}".`);
                              }}
                              className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/25 px-3 py-1.5 rounded-lg text-[10px] font-black text-emerald-300 cursor-pointer"
                            >
                              Approve Candidate
                            </button>
                            <button
                              onClick={() => {
                                const list = applicantsList.map(a => a.id === app.id ? { ...a, status: 'rejected' } : a);
                                setApplicantsList(list);
                                localStorage.setItem('ztr_applicants', JSON.stringify(list));
                                addActivityLog(session?.name || 'Admin', 'applicantAction', `Rejected candidate "${app.name}" for position "${app.jobTitle}".`);
                              }}
                              className="bg-red-950 hover:bg-red-900 border border-red-500/25 px-3 py-1.5 rounded-lg text-[10px] font-black text-red-300 cursor-pointer"
                            >
                              Reject Candidate
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setConfirmDialog({
                              title: 'Remove Candidate Entry',
                              message: `Are you sure you want to delete "${app.name}" from the candidates ledger?`,
                              isDanger: true,
                              confirmLabel: 'Delete Entry',
                              onConfirm: () => {
                                const list = applicantsList.filter(a => a.id !== app.id);
                                setApplicantsList(list);
                                localStorage.setItem('ztr_applicants', JSON.stringify(list));
                                addActivityLog(session?.name || 'Admin', 'applicantAction', `Deleted application entry for candidate "${app.name}".`);
                                setConfirmDialog(null);
                              }
                            });
                          }}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 size={11} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add vacancy Modal */}
            {showAddVacancyModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto text-left text-xs">
                <div className="bg-[#091122] border border-white/10 rounded-3xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
                  <button 
                    onClick={() => setShowAddVacancyModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full cursor-pointer"
                  >
                    <X size={18} />
                  </button>

                  <h3 className="text-lg font-black text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Post New Job Listing</h3>
                  
                  <div className="space-y-3 font-semibold">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Position Title *</label>
                      <input 
                        type="text" 
                        value={newVacancyData.title}
                        onChange={(e) => setNewVacancyData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4A017]"
                        placeholder="e.g. Master PADI Scuba Instructor"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Department *</label>
                        <select 
                          value={newVacancyData.department}
                          onChange={(e) => setNewVacancyData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                        >
                          <option value="Guiding & Operations">Guiding & Operations</option>
                          <option value="Marine & Dive Hub">Marine & Dive Hub</option>
                          <option value="Sales & Guest Relations">Sales & Guest Relations</option>
                          <option value="Hospitality & Dining">Hospitality & Dining</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Job Type *</label>
                        <select 
                          value={newVacancyData.type}
                          onChange={(e) => setNewVacancyData(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full bg-[#121B30] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Contract / Seasonal">Contract / Seasonal</option>
                          <option value="Part-time">Part-time</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Location *</label>
                        <input 
                          type="text" 
                          value={newVacancyData.location}
                          onChange={(e) => setNewVacancyData(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Compensation Range *</label>
                        <input 
                          type="text" 
                          value={newVacancyData.salary}
                          onChange={(e) => setNewVacancyData(prev => ({ ...prev, salary: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Description Brief *</label>
                      <textarea 
                        rows={3}
                        value={newVacancyData.desc}
                        onChange={(e) => setNewVacancyData(prev => ({ ...prev, desc: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none resize-none"
                        placeholder="Provide a quick overview of primary responsibilities."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Requirements (Comma separated) *</label>
                      <textarea 
                        rows={2}
                        value={newVacancyData.requirements}
                        onChange={(e) => setNewVacancyData(prev => ({ ...prev, requirements: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none resize-none"
                        placeholder="e.g. Valid PADI rescue license, First Aid cert, 3 years guiding"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Benefits (Comma separated) *</label>
                      <textarea 
                        rows={2}
                        value={newVacancyData.benefits}
                        onChange={(e) => setNewVacancyData(prev => ({ ...prev, benefits: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none resize-none"
                        placeholder="e.g. Shared villa housing, Free diving equipment use, Performance bonuses"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!newVacancyData.title || !newVacancyData.desc || !newVacancyData.requirements) {
                          alert('Please fill out all required fields.');
                          return;
                        }
                        const currentJobs = getJobs();
                        const newJob = {
                          id: `job-${Date.now()}`,
                          title: newVacancyData.title,
                          department: newVacancyData.department,
                          location: newVacancyData.location,
                          type: newVacancyData.type,
                          salary: newVacancyData.salary,
                          desc: newVacancyData.desc,
                          requirements: newVacancyData.requirements.split(',').map(r => r.trim()).filter(Boolean),
                          benefits: newVacancyData.benefits.split(',').map(b => b.trim()).filter(Boolean),
                          status: 'open' as const
                        };
                        const updated = [newJob, ...currentJobs];
                        saveJobs(updated);
                        addActivityLog(session?.name || 'Admin', 'jobPost', `Created new vacancy posting for "${newJob.title}".`);
                        
                        setShowAddVacancyModal(false);
                        setNewVacancyData({
                          title: '', department: 'Guiding & Operations', location: 'Zanzibar Head Office', type: 'Full-time', salary: '$1,200 - $1,500 / month', desc: '', requirements: '', benefits: ''
                        });
                        setCareersRefresh(prev => prev + 1);
                      }}
                      className="w-full bg-[#D4A017] hover:bg-[#b8850f] text-[#020C1F] font-extrabold py-3 rounded-xl uppercase tracking-wider text-xs cursor-pointer"
                    >
                      Publish Vacancy Immediately
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- DYNAMIC TAB: SUSTAINABILITY CONTENT SETTINGS CMS MANAGER --- */}
        {activeTab === 'sustainability' && (
          <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Leaf size={20} className="text-[#D4A017]" />
                  <span>Sustainability CMS Panel</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Directly edit environmental, plastic reduction, carbon offsetting and coastal partnership texts dynamically.</p>
              </div>
              <button
                onClick={() => {
                  saveSustainability(sustainabilityData);
                  addActivityLog(session?.name || 'Admin', 'sustainabilityUpdate', 'Updated core sustainability and conservation texts.');
                  setSustainSaveSucc(true);
                  setTimeout(() => setSustainSaveSucc(false), 3000);
                }}
                className="bg-[#D4A017] hover:bg-[#b8850f] text-[#020C1F] font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Save Swahili Legacy Content
              </button>
            </div>

            {sustainSaveSucc && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check size={16} />
                <span>Success: Sustainability pages have been updated instantly! No coding required.</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 font-semibold">
              <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">🌟 Page Introduction Heading</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Intro Title</label>
                    <input
                      type="text"
                      value={sustainabilityData.introTitle}
                      onChange={(e) => setSustainabilityData(prev => ({ ...prev, introTitle: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Intro Subtitle</label>
                    <textarea
                      rows={2}
                      value={sustainabilityData.introSubtitle}
                      onChange={(e) => setSustainabilityData(prev => ({ ...prev, introSubtitle: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">🪸 Environmental Conservation</h4>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Reefs, Coral nurseries, Marine reserves</label>
                    <textarea
                      rows={4}
                      value={sustainabilityData.conservationText}
                      onChange={(e) => setSustainabilityData(prev => ({ ...prev, conservationText: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">🐒 Wildlife Protection</h4>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Red Colobus monkeys, wildlife reserves, safety</label>
                    <textarea
                      rows={4}
                      value={sustainabilityData.wildlifeText}
                      onChange={(e) => setSustainabilityData(prev => ({ ...prev, wildlifeText: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">🎒 Community Support</h4>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">School sponsorship, village donations</label>
                    <textarea
                      rows={4}
                      value={sustainabilityData.communityText}
                      onChange={(e) => setSustainabilityData(prev => ({ ...prev, communityText: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">🤝 Local Partnerships</h4>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Swahili boat captains, local cooperatives</label>
                    <textarea
                      rows={4}
                      value={sustainabilityData.partnershipsText}
                      onChange={(e) => setSustainabilityData(prev => ({ ...prev, partnershipsText: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#121B30] border border-white/5 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-[#D4A017] uppercase tracking-wider">🌱 Responsible Travel, Plastics, and Mangrove Offsetting</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Responsible Tourism Text</label>
                    <textarea
                      rows={4}
                      value={sustainabilityData.responsibleTourismText}
                      onChange={(e) => setSustainabilityData(prev => ({ ...prev, responsibleTourismText: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Plastic Reduction Text</label>
                    <textarea
                      rows={4}
                      value={sustainabilityData.plasticReductionText}
                      onChange={(e) => setSustainabilityData(prev => ({ ...prev, plasticReductionText: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Carbon Offsetting Text</label>
                    <textarea
                      rows={4}
                      value={sustainabilityData.carbonInitiativesText}
                      onChange={(e) => setSustainabilityData(prev => ({ ...prev, carbonInitiativesText: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ERP WORKSPACE 1: INTERACTIVE CALENDAR --- */}
        {activeTab === 'calendar' && (
          !hasAccess('bookings', 'read') ? renderRestrictedState('Reservation Calendar') : (
            <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Calendar size={20} />
                  <span>Interactive Reservation Calendar</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Select dates to view planned Swahili coast excursions, tour capacities, and guide roster assignments.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                  className="bg-[#121B30] hover:bg-[#1b2745] text-slate-300 py-1.5 px-3 rounded-xl text-xs font-bold transition-all"
                >
                  ◀ Previous
                </button>
                <span className="text-sm font-bold text-white px-2">
                  {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                  className="bg-[#121B30] hover:bg-[#1b2745] text-slate-300 py-1.5 px-3 rounded-xl text-xs font-bold transition-all"
                >
                  Next ▶
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Grid */}
              <div className="lg:col-span-2 bg-[#121B30]/50 border border-white/5 rounded-2xl p-5">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 pb-3 border-b border-white/5 mb-3">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const year = calendarDate.getFullYear();
                    const month = calendarDate.getMonth();
                    const firstDayIndex = new Date(year, month, 1).getDay();
                    const totalDays = new Date(year, month + 1, 0).getDate();
                    
                    const days = [];
                    // Pad previous month days
                    for (let i = 0; i < firstDayIndex; i++) {
                      days.push(<div key={`empty-${i}`} className="h-14 opacity-20" />);
                    }
                    
                    // Render days of the month
                    for (let d = 1; d <= totalDays; d++) {
                      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const daysBookings = bookingsList.filter(b => b.preferred_date === dayStr);
                      const hasBookings = daysBookings.length > 0;
                      
                      days.push(
                        <div 
                          key={d} 
                          className={`h-16 rounded-xl border p-1 flex flex-col justify-between transition-all cursor-pointer ${
                            hasBookings 
                              ? 'bg-[#0B3B8C]/25 border-[#D4A017]/30 hover:border-[#D4A017]' 
                              : 'bg-[#081020] border-white/5 hover:border-slate-500'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-400 self-end">{d}</span>
                          {hasBookings && (
                            <div className="bg-[#D4A017] text-[#0A1224] text-[9px] font-black rounded px-1 truncate text-center">
                              {daysBookings.length} {daysBookings.length === 1 ? 'Tour' : 'Tours'}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return days;
                  })()}
                </div>
              </div>

              {/* Side schedule detail list */}
              <div className="bg-[#121B30]/40 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold text-[#D4A017] uppercase tracking-wider">Month Expedition Schedule:</h4>
                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                  {(() => {
                    const currentYearMonth = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}`;
                    const monthBookings = bookingsList.filter(b => b.preferred_date && b.preferred_date.startsWith(currentYearMonth));
                    
                    if (monthBookings.length === 0) {
                      return (
                        <div className="text-center py-12 text-xs text-slate-500">
                          No tours scheduled in this calendar range.
                        </div>
                      );
                    }
                    return monthBookings.map((b, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedBooking(b)}
                        className="bg-[#0A1224] border border-white/5 rounded-xl p-3 hover:border-[#D4A017]/40 transition-all cursor-pointer space-y-1.5"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-400">{b.preferred_date}</span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                            b.status === 'confirmed' || b.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/10' : 'bg-amber-950 text-amber-400 border border-amber-500/10'
                          }`}>{b.status}</span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">{b.tour_name}</p>
                        <div className="flex justify-between text-[9px] text-slate-400">
                          <span>{b.full_name}</span>
                          <span className="font-bold">{b.number_of_guests} pax</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
          )
        )}

        {/* --- ERP WORKSPACE 2: VEHICLES & FLEET OPERATIONS --- */}
        {activeTab === 'vehicles' && (
          !hasAccess('vehicles', 'read') ? renderRestrictedState('Vehicles & Fleet') : (
            <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Activity size={20} />
                  <span>Fleet Operations & Fuel Logs</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Coordinate 4x4 Land Cruisers, luxury minivans, and safari coasters. Manage safety clearances and driver logs.</p>
              </div>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-extrabold px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus size={14} />
                <span>Register Fleet Vehicle</span>
              </button>
            </div>

            {/* Fleet Status Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#121B30] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                  {vehiclesList.length}
                </div>
                <div>
                  <h4 className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Fleet Vehicles</h4>
                  <p className="text-sm font-black text-white">Fully registered carriers</p>
                </div>
              </div>
              <div className="bg-[#121B30] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">
                  {vehiclesList.filter(v => v.status === 'Active').length}
                </div>
                <div>
                  <h4 className="text-xs text-slate-400 uppercase tracking-widest font-bold">Active & Dispatched</h4>
                  <p className="text-sm font-black text-white">Operating on route highlights</p>
                </div>
              </div>
              <div className="bg-[#121B30] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400">
                  {vehiclesList.filter(v => v.status === 'Maintenance').length}
                </div>
                <div>
                  <h4 className="text-xs text-slate-400 uppercase tracking-widest font-bold">In Shop & Maintenance</h4>
                  <p className="text-sm font-black text-white">Undergoing scheduled tune-ups</p>
                </div>
              </div>
            </div>

            {/* Fleet List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Registration</th>
                    <th className="py-3 px-4">Model & Capacity</th>
                    <th className="py-3 px-4">Assigned Driver</th>
                    <th className="py-3 px-4">Fuel Status</th>
                    <th className="py-3 px-4">Operating Status</th>
                    <th className="py-3 px-4">Log Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {vehiclesList.map((veh, idx) => (
                    <tr key={veh.id || idx} className="hover:bg-[#121B30]/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{veh.plate}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold block">{veh.model}</span>
                        <span className="text-[10px] text-slate-400">Capacity: {veh.capacity} Guests</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-indigo-300">{veh.driver || 'Unassigned'}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#D4A017] h-full" style={{ width: veh.fuel }} />
                          </div>
                          <span className="font-mono text-[10px]">{veh.fuel}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          veh.status === 'Active' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>{veh.status}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{veh.logs || 'No recent movements.'}</td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button 
                          onClick={() => {
                            const newFuel = prompt('Enter fuel percentage (e.g. 75%):', veh.fuel);
                            if (newFuel) {
                              const updated = vehiclesList.map(v => v.id === veh.id ? { ...v, fuel: newFuel } : v);
                              setVehiclesList(updated);
                              localStorage.setItem('ztr_vehicles', JSON.stringify(updated));
                              addActivityLog(session?.name || 'Manager', 'vehicleFuelUpdate', `Updated fuel log for vehicle ${veh.plate} to ${newFuel}.`);
                            }
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1 px-2 rounded font-bold text-[10px]"
                        >
                          Fuel Log
                        </button>
                        <button 
                          onClick={() => {
                            const updated = vehiclesList.filter(v => v.id !== veh.id);
                            setVehiclesList(updated);
                            localStorage.setItem('ztr_vehicles', JSON.stringify(updated));
                            addActivityLog(session?.name || 'Manager', 'vehicleDeleted', `Removed vehicle ${veh.plate} from registered fleet.`);
                          }}
                          className="bg-red-950/40 hover:bg-red-900 text-red-300 py-1 px-2 rounded font-bold text-[10px]"
                        >
                          Decommission
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Vehicle Modal Form */}
            {showAddVehicleModal && (
              <div className="fixed inset-0 bg-[#020C1F]/95 z-50 flex items-center justify-center p-4">
                <div className="bg-[#0A1224] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h3 className="text-base font-bold text-[#D4A017]">Register Fleet Carrier</h3>
                    <button onClick={() => setShowAddVehicleModal(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block mb-1 text-slate-400">License Registration Plate</label>
                      <input 
                        type="text" 
                        placeholder="e.g. ZAN 991"
                        value={newVehicleData.plate}
                        onChange={e => setNewVehicleData({...newVehicleData, plate: e.target.value})}
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-400">Vehicle Make & Model</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Toyota Land Cruiser Safari Coach"
                        value={newVehicleData.model}
                        onChange={e => setNewVehicleData({...newVehicleData, model: e.target.value})}
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-slate-400">Passenger Capacity</label>
                        <input 
                          type="number" 
                          value={newVehicleData.capacity}
                          onChange={e => setNewVehicleData({...newVehicleData, capacity: Number(e.target.value)})}
                          className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">Default Assigned Driver</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Driver Juma"
                          value={newVehicleData.driver}
                          onChange={e => setNewVehicleData({...newVehicleData, driver: e.target.value})}
                          className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <button 
                      onClick={() => {
                        if (!newVehicleData.plate || !newVehicleData.model) {
                          alert('Please enter license plate and model.');
                          return;
                        }
                        const finalVeh = {
                          id: 'v-' + Date.now(),
                          ...newVehicleData
                        };
                        const updated = [...vehiclesList, finalVeh];
                        setVehiclesList(updated);
                        localStorage.setItem('ztr_vehicles', JSON.stringify(updated));
                        addActivityLog(session?.name || 'Manager', 'vehicleRegistered', `Registered vehicle license ${newVehicleData.plate} to company fleet.`);
                        setShowAddVehicleModal(false);
                        setNewVehicleData({ plate: '', model: '', capacity: 7, fuel: '100%', driver: '', status: 'Active', logs: '' });
                      }}
                      className="flex-1 bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-bold py-2.5 rounded-xl text-xs uppercase"
                    >
                      Save Carrier
                    </button>
                    <button 
                      onClick={() => setShowAddVehicleModal(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          )
        )}

        {/* --- ERP WORKSPACE 3: ACCOUNTING & FINANCIAL LEDGER --- */}
        {activeTab === 'finances' && (
          !hasAccess('finances', 'read') ? renderRestrictedState('Accounting & Finances') : (
            <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <TrendingUp size={20} />
                  <span>Accounting Ledger & Profitability</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Audit guest bookings estimated prices against registered tour operational expenditures (fuel, meals, parks, guide commission).</p>
              </div>
              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-extrabold px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus size={14} />
                <span>Record Operational Expense</span>
              </button>
            </div>

            {/* Accountant Financial Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#121B30] border border-white/5 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Estimated Excursion Revenue</span>
                <p className="text-2xl font-black text-emerald-400 font-mono mt-1">${chartData.totalRevenue || 0}</p>
                <span className="text-[9px] text-slate-500">Based on guest headcount prices</span>
              </div>
              <div className="bg-[#121B30] border border-white/5 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Recorded Fleet & Guide Expenses</span>
                <p className="text-2xl font-black text-red-400 font-mono mt-1">
                  ${expensesList.reduce((sum, exp) => sum + Number(exp.amount), 0)}
                </p>
                <span className="text-[9px] text-slate-500">Fuel, national parks, seafood meals</span>
              </div>
              <div className="bg-[#121B30] border border-white/5 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Net Excursion Profitability</span>
                <p className="text-2xl font-black text-white font-mono mt-1">
                  ${(chartData.totalRevenue || 0) - expensesList.reduce((sum, exp) => sum + Number(exp.amount), 0)}
                </p>
                <span className="text-[9px] text-emerald-500">Est. Gross Margin: {
                  chartData.totalRevenue > 0 
                    ? (((chartData.totalRevenue - expensesList.reduce((sum, exp) => sum + Number(exp.amount), 0)) / chartData.totalRevenue) * 100).toFixed(0)
                    : 0
                }%</span>
              </div>
              <div className="bg-[#121B30] border border-white/5 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Outstanding Guest Balances</span>
                <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                  ${bookingsList.filter(b => b.status === 'pending').length * 100}
                </p>
                <span className="text-[9px] text-slate-500">Collectable in cash prior to boarding</span>
              </div>
            </div>

            {/* Expenses List & Record form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Expense ledger list */}
              <div className="lg:col-span-2 bg-[#121B30]/40 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold text-[#D4A017] uppercase tracking-wider">Historical Expense Ledger</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] font-extrabold text-slate-400 uppercase">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Reference/Vehicle</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {expensesList.map((exp, idx) => (
                        <tr key={exp.id || idx} className="hover:bg-slate-800/20">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{exp.date}</td>
                          <td className="py-2.5 px-3">
                            <span className="bg-red-950 text-red-300 border border-red-500/10 px-1.5 py-0.5 rounded text-[10px] font-semibold">{exp.category}</span>
                          </td>
                          <td className="py-2.5 px-3 text-white font-medium">{exp.description}</td>
                          <td className="py-2.5 px-3 font-mono text-indigo-300">{exp.reference || 'General'}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-red-300 font-mono">${exp.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Record Quick Expense Widget */}
              <div className="bg-[#121B30]/40 border border-white/5 rounded-2xl p-5 space-y-4 text-xs">
                <h4 className="text-xs font-extrabold text-[#D4A017] uppercase tracking-wider">Record Local Cash Disbursements</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-slate-400">Expense Date</label>
                    <input 
                      type="date"
                      value={newExpenseData.date}
                      onChange={e => setNewExpenseData({...newExpenseData, date: e.target.value})}
                      className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-400">Expense Category</label>
                    <select
                      value={newExpenseData.category}
                      onChange={e => setNewExpenseData({...newExpenseData, category: e.target.value})}
                      className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white"
                    >
                      <option value="Fuel">Fuel Logs</option>
                      <option value="Food & Meals">Swahili Buffet / Seafood</option>
                      <option value="Park Entrance Fees">Jozani/National Park Permits</option>
                      <option value="Guide Commission">Local Guide/Commissions</option>
                      <option value="Maintenance">Vehicle / Coaster Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-400">Expense Amount (USD)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 150"
                      value={newExpenseData.amount}
                      onChange={e => setNewExpenseData({...newExpenseData, amount: e.target.value})}
                      className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-400">Item Description / Narration</label>
                    <input 
                      type="text"
                      placeholder="e.g. Fuel fill-up Land Cruiser"
                      value={newExpenseData.description}
                      onChange={e => setNewExpenseData({...newExpenseData, description: e.target.value})}
                      className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-400">Reference / Vehicle License</label>
                    <input 
                      type="text"
                      placeholder="e.g. ZAN-401"
                      value={newExpenseData.reference}
                      onChange={e => setNewExpenseData({...newExpenseData, reference: e.target.value})}
                      className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2 text-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newExpenseData.amount || !newExpenseData.description) {
                        alert('Please fill out expense amount and description.');
                        return;
                      }
                      const finalExp = {
                        id: 'e-' + Date.now(),
                        date: newExpenseData.date,
                        category: newExpenseData.category,
                        amount: Number(newExpenseData.amount),
                        description: newExpenseData.description,
                        reference: newExpenseData.reference
                      };
                      const updated = [finalExp, ...expensesList];
                      setExpensesList(updated);
                      localStorage.setItem('ztr_expenses', JSON.stringify(updated));
                      addActivityLog(session?.name || 'Accountant', 'expenseRecorded', `Recorded operational cost of $${newExpenseData.amount} for "${newExpenseData.description}".`);
                      setNewExpenseData({ date: new Date().toISOString().split('T')[0], category: 'Fuel', amount: '', description: '', reference: '' });
                      alert('Expense recorded and profit margins updated instantly!');
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#020C1F] font-extrabold py-2 rounded-xl text-xs uppercase cursor-pointer transition-colors mt-2"
                  >
                    Commit Cost Ledger
                  </button>
                </div>
              </div>
            </div>
          </div>
          )
        )}

        {/* --- ERP WORKSPACE 4: SUPPLIERS DIRECTORY --- */}
        {activeTab === 'suppliers' && (
          !hasAccess('suppliers', 'read') ? renderRestrictedState('Suppliers & Resort Directory') : (
            <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <List size={20} />
                  <span>Suppliers & Resort Directory</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Manage wholesale contracts and accommodation availability with Stone Town hotels and coastal spice dhow cruise operators.</p>
              </div>
              <button
                onClick={() => setShowAddSupplierModal(true)}
                className="bg-[#D4A017] hover:bg-[#c49010] text-[#0A1224] font-extrabold px-4 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus size={14} />
                <span>Register Partner Supplier</span>
              </button>
            </div>

            {/* Suppliers Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliersList.map((sup, idx) => (
                <div key={sup.id || idx} className="bg-[#121B30] border border-white/5 rounded-2xl p-5 space-y-3 relative hover:border-[#D4A017]/35 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-[#D4A017] bg-[#D4A017]/15 rounded px-2 py-0.5 uppercase tracking-widest">{sup.type}</span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{sup.name}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{sup.location}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">"{sup.details}"</p>
                  <div className="flex justify-between items-center text-[10px] text-indigo-300 font-mono border-t border-white/5 pt-3">
                    <span>Contact: {sup.contact}</span>
                    <button 
                      onClick={() => {
                        const updated = suppliersList.filter(s => s.id !== sup.id);
                        setSuppliersList(updated);
                        localStorage.setItem('ztr_suppliers', JSON.stringify(updated));
                        addActivityLog(session?.name || 'Manager', 'supplierDeleted', `Removed partner supplier "${sup.name}".`);
                      }}
                      className="text-red-400 hover:text-red-200 transition-colors"
                    >
                      Remove Partner
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Register Supplier Modal */}
            {showAddSupplierModal && (
              <div className="fixed inset-0 bg-[#020C1F]/95 z-50 flex items-center justify-center p-4">
                <div className="bg-[#0A1224] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h3 className="text-base font-bold text-[#D4A017]">Register Partner Supplier</h3>
                    <button onClick={() => setShowAddSupplierModal(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block mb-1 text-slate-400">Supplier Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Nungwi Beach Seafood Dhows"
                        value={newSupplierData.name}
                        onChange={e => setNewSupplierData({...newSupplierData, name: e.target.value})}
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-400">Supplier Sector</label>
                      <select 
                        value={newSupplierData.type}
                        onChange={e => setNewSupplierData({...newSupplierData, type: e.target.value})}
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white"
                      >
                        <option value="Accommodation">Accommodation (Resort/Villa)</option>
                        <option value="Excursions">Excursions (Boats/Farms)</option>
                        <option value="Transport">Vehicle Logistics / Hire</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-400">Operating Coordinates/Location</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Stone Town waterfront"
                        value={newSupplierData.location}
                        onChange={e => setNewSupplierData({...newSupplierData, location: e.target.value})}
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-400">Wholesale Desk Email/Contact</label>
                      <input 
                        type="text" 
                        placeholder="e.g. booking@partner.com"
                        value={newSupplierData.contact}
                        onChange={e => setNewSupplierData({...newSupplierData, contact: e.target.value})}
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-400">Negotiated Terms / Contract Details</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 10% cash discount on group reservations."
                        value={newSupplierData.details}
                        onChange={e => setNewSupplierData({...newSupplierData, details: e.target.value})}
                        className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <button 
                      onClick={() => {
                        if (!newSupplierData.name || !newSupplierData.contact) {
                          alert('Please provide supplier name and contact email.');
                          return;
                        }
                        const finalSup = {
                          id: 's-' + Date.now(),
                          ...newSupplierData
                        };
                        const updated = [...suppliersList, finalSup];
                        setSuppliersList(updated);
                        localStorage.setItem('ztr_suppliers', JSON.stringify(updated));
                        addActivityLog(session?.name || 'Manager', 'supplierRegistered', `Partnered with new wholesale supplier "${newSupplierData.name}".`);
                        setShowAddSupplierModal(false);
                        setNewSupplierData({ name: '', type: 'Accommodation', location: '', contact: '', details: '' });
                      }}
                      className="flex-1 bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-bold py-2.5 rounded-xl text-xs uppercase"
                    >
                      Authorize Partner
                    </button>
                    <button 
                      onClick={() => setShowAddSupplierModal(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          )
        )}

        {/* --- ERP WORKSPACE 5: TOUR GUIDE SPECIALIZED PORTAL --- */}
        {activeTab === 'guidePortal' && (
          <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Sparkles size={20} />
                  <span>Swahili Tour Guide Operations Desk</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Hello Captain {session?.name}! Review your assigned tourist groups, track safety checklists, and complete your excursions.</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">● Guide Online</span>
            </div>

            {/* Guide Assigned Tours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-[#121B30]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold text-[#D4A017] uppercase tracking-wider">Assigned Tourist Groups:</h4>
                <div className="space-y-3">
                  {bookingsList.slice(0, 3).map((b, i) => (
                    <div key={i} className="bg-[#0A1224] border border-white/5 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-sm">{b.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{b.preferred_date}</span>
                      </div>
                      <p className="text-xs text-[#D4A017] font-semibold">{b.tour_name}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-white/5">
                        <span>Pickup: {b.pickup_location}</span>
                        <span className="font-bold text-white">{b.number_of_guests} Travelers</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guide Safety Checklist */}
              <div className="bg-[#121B30]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold text-[#D4A017] uppercase tracking-wider">Swahili Expedition Check-Off Sheet:</h4>
                <div className="space-y-3">
                  {[
                    'Verify private vehicle driver has full diesel tank before departure.',
                    'Prepared ice-box coolers with fresh coconut water and pineapple snacks.',
                    'Double check Snorkeling masks and coral safe fins sizes.',
                    'Deliver welcoming Zanzibar history and safety briefing at hotel pickup lobby.',
                    'Initiate direct guest satisfaction feedback at tour conclusion.'
                  ].map((checkText, checkIdx) => (
                    <div key={checkIdx} className="flex items-start gap-3 bg-[#0A1224] p-3 rounded-xl border border-white/5">
                      <input type="checkbox" defaultChecked={checkIdx < 3} className="mt-1 accent-[#D4A017]" />
                      <span className="text-xs text-slate-300 leading-relaxed">{checkText}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    alert('Asante sana! Excursion completed successfully. Committing to supervisor audit logs.');
                    addActivityLog(session?.name || 'Guide Ali', 'guideExcursionComplete', `Completed Zanzibar expedition successfully.`);
                  }}
                  className="w-full bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] font-black py-3 rounded-xl uppercase tracking-widest mt-2"
                >
                  Conclude Excursion & Log Checklist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- ERP WORKSPACE 6: DRIVER TRANSFER DESK --- */}
        {activeTab === 'driverPortal' && (
          <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <MapPin size={20} />
                  <span>Driver Pickup & Transfer sheets</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Hello {session?.name}! Access active airport transfers, private hotel pick-ups, and log movement logs.</p>
              </div>
              <span className="text-xs font-bold text-blue-400 bg-blue-950 border border-blue-500/10 px-3 py-1 rounded-full uppercase tracking-wider font-mono">🚐 4x4 Land Cruiser Assigned</span>
            </div>

            {/* Drivers pickup sheets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-[#121B30]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold text-[#D4A017] uppercase tracking-wider">Scheduled Pickups For Today:</h4>
                <div className="space-y-3">
                  {bookingsList.slice(0, 2).map((b, i) => (
                    <div key={i} className="bg-[#0A1224] border border-white/5 p-4 rounded-xl space-y-2 relative">
                      <span className="absolute top-4 right-4 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/10 px-2 py-0.5 rounded uppercase font-bold">Transfer Pending</span>
                      <p className="font-bold text-white text-sm">{b.full_name}</p>
                      <div className="space-y-1 text-xs text-slate-300">
                        <p><strong className="text-slate-400">Hotel Pickup:</strong> {b.pickup_location}</p>
                        <p><strong className="text-slate-400">Destination:</strong> {b.tour_name}</p>
                        <p><strong className="text-slate-400">Travelers count:</strong> {b.number_of_guests} passengers</p>
                      </div>
                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5">
                        <button 
                          onClick={() => {
                            alert('Dispatching "Departed hotel" telemetry check-in.');
                            addActivityLog(session?.name || 'Driver', 'driverDeparted', `Departed hotel pickup for customer ${b.full_name}.`);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1 rounded font-bold text-[9px] uppercase"
                        >
                          On My Way
                        </button>
                        <button 
                          onClick={() => {
                            alert('Dispatching "Passengers Boarded" telemetry check-in.');
                            addActivityLog(session?.name || 'Driver', 'driverBoarded', `Passengers safely boarded transfer for customer ${b.full_name}.`);
                          }}
                          className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 py-1 rounded font-bold text-[9px] uppercase"
                        >
                          Boarded
                        </button>
                        <button 
                          onClick={() => {
                            alert('Dispatching "Transfer Concluded" final telemetry.');
                            addActivityLog(session?.name || 'Driver', 'driverCompleted', `Safely delivered passengers for customer ${b.full_name}.`);
                          }}
                          className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 py-1 rounded font-bold text-[9px] uppercase"
                        >
                          Arrived
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Checklist */}
              <div className="bg-[#121B30]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-extrabold text-[#D4A017] uppercase tracking-wider">Pre-Route Safety Checklist:</h4>
                <div className="space-y-3">
                  {[
                    'Tire pressure and tread depth inspect.',
                    'Engine coolant and engine oil levels check.',
                    'Interior air conditioning pre-cooled to 20°C.',
                    'Washed vehicle chassis and clean pristine wind-screen.',
                    'Logged vehicle starting fuel tank logs.'
                  ].map((checkText, checkIdx) => (
                    <div key={checkIdx} className="flex items-start gap-3 bg-[#0A1224] p-3 rounded-xl border border-white/5">
                      <input type="checkbox" defaultChecked={checkIdx < 4} className="mt-1 accent-[#D4A017]" />
                      <span className="text-xs text-slate-300 leading-relaxed">{checkText}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ERP WORKSPACE 7: CUSTOMER PORTAL --- */}
        {activeTab === 'customerPortal' && (
          <div className="bg-[#0A1224] border border-white/5 p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold text-[#D4A017] flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <User size={20} />
                  <span>My Guest Reservation Desk</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Karibu Zanzibar! Download travel documents, review your travel dates, or update your pickup request details.</p>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-[#0B3B8C]/20 border border-[#0B3B8C]/40 px-3 py-1 rounded-full uppercase tracking-wider">Active Guest Session</span>
            </div>

            {/* Customers list bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4 text-xs">
                <h4 className="text-xs font-extrabold text-[#D4A017] uppercase tracking-wider">My Confirmed Reservations:</h4>
                <div className="space-y-3">
                  {bookingsList.slice(0, 1).map((b, i) => (
                    <div key={i} className="bg-[#121B30]/50 border border-white/5 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-start pb-3 border-b border-white/5">
                        <div>
                          <h5 className="text-sm font-bold text-white">{b.tour_name}</h5>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Scheduled Date: {b.preferred_date}</span>
                        </div>
                        <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/10 uppercase">{b.status}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Pickup Hotel Location</span>
                          <span className="font-bold text-white text-xs">{b.pickup_location || 'Stone Town Hotel lobby'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-0.5">Registered Travelers</span>
                          <span className="font-bold text-white text-xs">{b.number_of_guests} Passengers</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3">
                        <button 
                          onClick={() => printBookingReceipt(b)}
                          className="flex-1 bg-[#D4A017] hover:bg-[#c49010] text-[#020C1F] py-2 rounded-xl text-xs font-bold uppercase transition-colors"
                        >
                          Print Travel Voucher
                        </button>
                        <button 
                          onClick={() => {
                            const newMsg = prompt('Enter message or dietary requirements for our Swahili team:', b.message);
                            if (newMsg !== null) {
                              alert('Your custom details have been dispatched to our reservation desk. Asante sana!');
                              addActivityLog(b.full_name, 'customerUpdate', `Submitted travel instructions notes: "${newMsg}"`);
                            }
                          }}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl text-xs font-bold uppercase transition-colors"
                        >
                          Send Travel Note
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guest Feedback form */}
              <div className="bg-[#121B30]/50 border border-white/5 rounded-2xl p-5 space-y-4 text-xs">
                <h4 className="text-xs font-extrabold text-[#D4A017] uppercase tracking-wider">Submit Guest Review</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-slate-400">Expedition Rating</label>
                    <select className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white">
                      <option>⭐⭐⭐⭐⭐ (5/5 Pristine Swahili Service)</option>
                      <option>⭐⭐⭐⭐ (4/5 Great tour guides)</option>
                      <option>⭐⭐⭐ (3/5 Average)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-400">Share Swahili Experience</label>
                    <textarea 
                      rows={3}
                      placeholder="Share your amazing memories from Safari Blue or Stone town tour..."
                      className="w-full bg-[#0A1224] border border-white/10 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      alert('Thank you for sharing your warm Swahili review! It has been dispatched to our marketing desk.');
                      addActivityLog(session?.name || 'Customer John', 'guestReviewSubmit', `Submitted positive excursion star review.`);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 rounded-xl text-xs uppercase cursor-pointer"
                  >
                    Submit Swahili Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL WORKSPACE FOR SELECTIVE BOOKING VIEWER & INVOICER */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-[#020C1F]/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1224] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 text-slate-200 shadow-2xl">
            
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-bold bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/20 rounded-full px-2.5 py-1 tracking-widest uppercase">RESERVATION DIRECT VIEW</span>
                <h3 className="text-2xl font-bold text-white mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>{selectedBooking.full_name}</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-white font-black text-lg p-1">✕</button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs bg-[#121B30] p-5 rounded-2xl border border-white/5">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium lowercase">Expedition requested</span>
                <p className="text-sm font-bold text-[#D4A017]">{selectedBooking.tour_name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium lowercase">Target travel date</span>
                <p className="text-sm font-bold text-white">{selectedBooking.preferred_date}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium lowercase">Headcount registration</span>
                <p className="text-sm font-bold text-white">{selectedBooking.number_of_guests} travelers</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium lowercase">WhatsApp phone contact</span>
                <p className="text-sm font-bold text-white">{selectedBooking.whatsapp_number}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium lowercase">Contact Email endpoint</span>
                <p className="text-sm font-bold text-slate-300">{selectedBooking.email || 'No email provided'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium lowercase">Pickup details</span>
                <p className="text-sm font-bold text-slate-300">{selectedBooking.pickup_location}</p>
              </div>
            </div>

            {/* Message block */}
            <div className="bg-[#121B30] p-4 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lodged Customer Message & Notes:</span>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap font-medium italic">
                "{selectedBooking.message || 'No custom notes provided by client.'}"
              </p>
            </div>

            {/* Buttons for Approval rejects and dispatch confirmation invoice */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5 text-xs font-bold">
              
              {!isBookingReadOnly ? (
                <div className="flex flex-wrap gap-1.5 mr-auto">
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                    disabled={selectedBooking.status === 'confirmed'}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                    <span>Confirm Trip</span>
                  </button>

                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, 'rejected')}
                    disabled={selectedBooking.status === 'rejected'}
                    className="bg-red-950 hover:bg-red-900 border border-red-500/10 text-red-100 font-bold py-2 px-3.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    <span>Decline Trip</span>
                  </button>
                </div>
              ) : (
                <div className="text-slate-400 py-2 mr-auto italic font-medium flex items-center gap-1.5">
                  <span>🔒 Read-Only: Sales, Manager or Admin privileges required to adjust booking state.</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => openEmailComposer(selectedBooking)}
                  className="bg-[#0B3B8C] hover:bg-[#092d6b] text-white py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Mail size={14} />
                  <span>Compose Email Invoice</span>
                </button>

                <button
                  onClick={() => printBookingReceipt(selectedBooking)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText size={14} />
                  <span>Print Voucher (PDF)</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* COMPOSER MODAL */}
      {sendEmailModal && (
        <div className="fixed inset-0 bg-[#020C1F]/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1224] border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl w-full space-y-4 text-slate-200">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h4 className="font-bold text-sm text-[#D4A017] uppercase tracking-wider">Itinerary Composer & Invoice Desk</h4>
                <p className="text-xs text-slate-400">A copy is pre-filled and cc-ed to zavoyatour@gmail.com and the client.</p>
              </div>
              <button onClick={() => setSendEmailModal(null)} className="text-slate-400 hover:text-white font-black">✕</button>
            </div>

            <div className="space-y-3 font-bold text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">Recipient Email</label>
                <input type="text" readOnly value={sendEmailModal.email || 'Email missing (Cc will go to zavoyatour@gmail.com)'} className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-slate-300 outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Email Title Subject</label>
                <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Itinerary / Receipt Body Details</label>
                <textarea rows={10} value={emailCustomMessage} onChange={e => setEmailCustomMessage(e.target.value)} className="w-full bg-[#121B30] border border-white/10 rounded-xl p-3 text-slate-200 resize-none font-mono" />
              </div>
            </div>

            <div className="flex gap-2 justify-end text-xs font-bold">
              <button onClick={() => setSendEmailModal(null)} className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300">Cancel</button>
              <button onClick={executeSendEmail} disabled={emailStatus === 'sending'} className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-white">
                {emailStatus === 'sending' ? 'Dispatching Mail...' : 
                 emailStatus === 'sent' ? 'Opened in mail client!' : 'Open in Mail Client'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT BOOKING MODAL */}
      {editingBooking && (
        <div className="fixed inset-0 bg-[#020C1F]/90 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveEdit}
            className="bg-[#0A1224] border border-[#D4A017]/30 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 text-slate-200 shadow-2xl relative"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-[#D4A017]"></div>
            
            <div className="flex justify-between items-start border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 rounded-full px-2.5 py-1 tracking-widest uppercase">ADMIN EDIT SUITE</span>
                <h3 className="text-xl font-bold text-white mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Update Booking Ledger: {editingBooking.full_name}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => { setEditingBooking(null); setValidationErrors({}); }} 
                className="text-slate-400 hover:text-white font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            {Object.keys(validationErrors).length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-xs font-semibold space-y-1">
                <p className="font-bold text-white">⚠️ Please resolve the following validation errors:</p>
                <ul className="list-disc pl-5 space-y-0.5">
                  {Object.values(validationErrors).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Customer Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={editingBooking.full_name} 
                  onChange={e => {
                    setEditingBooking({ ...editingBooking, full_name: e.target.value });
                    if (validationErrors.full_name) {
                      const updated = { ...validationErrors };
                      delete updated.full_name;
                      setValidationErrors(updated);
                    }
                  }}
                  className={`w-full bg-[#121B30] border rounded-xl p-2.5 text-white outline-none transition-all font-semibold ${
                    validationErrors.full_name ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-[#D4A017]'
                  }`} 
                />
                {validationErrors.full_name && (
                  <p className="text-[10px] text-red-400 font-bold mt-1">{validationErrors.full_name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">WhatsApp Contact Phone <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={editingBooking.whatsapp_number} 
                  onChange={e => {
                    setEditingBooking({ ...editingBooking, whatsapp_number: e.target.value });
                    if (validationErrors.whatsapp_number) {
                      const updated = { ...validationErrors };
                      delete updated.whatsapp_number;
                      setValidationErrors(updated);
                    }
                  }}
                  className={`w-full bg-[#121B30] border rounded-xl p-2.5 text-white outline-none transition-all font-mono font-medium ${
                    validationErrors.whatsapp_number ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-[#D4A017]'
                  }`} 
                />
                {validationErrors.whatsapp_number && (
                  <p className="text-[10px] text-red-400 font-bold mt-1">{validationErrors.whatsapp_number}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Email Address</label>
                <input 
                  type="text" 
                  value={editingBooking.email || ''} 
                  onChange={e => {
                    setEditingBooking({ ...editingBooking, email: e.target.value });
                    if (validationErrors.email) {
                      const updated = { ...validationErrors };
                      delete updated.email;
                      setValidationErrors(updated);
                    }
                  }}
                  placeholder="No email provided"
                  className={`w-full bg-[#121B30] border rounded-xl p-2.5 text-white outline-none transition-all ${
                    validationErrors.email ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-[#D4A017]'
                  }`} 
                />
                {validationErrors.email && (
                  <p className="text-[10px] text-red-400 font-bold mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Number of Guests <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  min={1}
                  value={editingBooking.number_of_guests} 
                  onChange={e => {
                    setEditingBooking({ ...editingBooking, number_of_guests: parseInt(e.target.value, 10) || 1 });
                    if (validationErrors.number_of_guests) {
                      const updated = { ...validationErrors };
                      delete updated.number_of_guests;
                      setValidationErrors(updated);
                    }
                  }}
                  className={`w-full bg-[#121B30] border rounded-xl p-2.5 text-white outline-none transition-all ${
                    validationErrors.number_of_guests ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-[#D4A017]'
                  }`} 
                />
                {validationErrors.number_of_guests && (
                  <p className="text-[10px] text-red-400 font-bold mt-1">{validationErrors.number_of_guests}</p>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 font-bold">Destination Experience / Tour Package <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={editingBooking.tour_name} 
                  onChange={e => {
                    setEditingBooking({ ...editingBooking, tour_name: e.target.value });
                    if (validationErrors.tour_name) {
                      const updated = { ...validationErrors };
                      delete updated.tour_name;
                      setValidationErrors(updated);
                    }
                  }}
                  className={`w-full bg-[#121B30] border rounded-xl p-2.5 text-white outline-none transition-all font-semibold ${
                    validationErrors.tour_name ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-[#D4A017]'
                  }`} 
                />
                {validationErrors.tour_name && (
                  <p className="text-[10px] text-red-400 font-bold mt-1">{validationErrors.tour_name}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Target Travel Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={editingBooking.preferred_date} 
                  onChange={e => {
                    setEditingBooking({ ...editingBooking, preferred_date: e.target.value });
                    if (validationErrors.preferred_date) {
                      const updated = { ...validationErrors };
                      delete updated.preferred_date;
                      setValidationErrors(updated);
                    }
                  }}
                  className={`w-full bg-[#121B30] border rounded-xl p-2.5 text-white outline-none transition-all ${
                    validationErrors.preferred_date ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-[#D4A017]'
                  }`} 
                />
                {validationErrors.preferred_date && (
                  <p className="text-[10px] text-red-400 font-bold mt-1">{validationErrors.preferred_date}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold">Booking Status <span className="text-red-500">*</span></label>
                <select 
                  value={editingBooking.status} 
                  onChange={e => setEditingBooking({ ...editingBooking, status: e.target.value })}
                  className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#D4A017] transition-all font-bold capitalize"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 font-bold">Pickup details & Meeting Point</label>
                <input 
                  type="text" 
                  value={editingBooking.pickup_location || ''} 
                  onChange={e => setEditingBooking({ ...editingBooking, pickup_location: e.target.value })}
                  className="w-full bg-[#121B30] border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#D4A017] transition-all" 
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 font-bold">Customer Message & Notes</label>
                <textarea 
                  rows={3}
                  value={editingBooking.message || ''} 
                  onChange={e => setEditingBooking({ ...editingBooking, message: e.target.value })}
                  className="w-full bg-[#121B30] border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:border-[#D4A017] transition-all resize-none" 
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end text-xs font-bold pt-4 border-t border-white/5">
              <button 
                type="button"
                onClick={() => { setEditingBooking(null); setValidationErrors({}); }} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 rounded-xl text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-[#D4A017] hover:bg-[#bfa315] rounded-xl text-[#020C1F] font-black shadow-sm transition-colors flex items-center gap-1"
              >
                <span>Save Record Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE BOOKING CONFIRMATION MODAL */}
      {deletingBooking && (
        <div className="fixed inset-0 bg-[#020C1F]/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A1224] border border-red-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 text-slate-200 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert size={24} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Permanently Remove Reservation?</h3>
                <p className="text-[11px] text-slate-400">
                  This action is irreversible and will delete the customer booking record from the real-time databases.
                </p>
              </div>
            </div>

            <div className="bg-[#121B30] p-4 rounded-xl border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-white">{deletingBooking.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Experience:</span>
                <span className="font-bold text-amber-400 truncate max-w-[200px]" title={deletingBooking.tour_name}>
                  {deletingBooking.tour_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date Requested:</span>
                <span className="font-semibold text-white">{deletingBooking.preferred_date}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-bold block">
                Type <span className="text-red-400 font-black">DELETE</span> to authorize destruction <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                required
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                placeholder="Type DELETE here..."
                className="w-full bg-[#121B30] border border-white/10 focus:border-red-500 rounded-xl p-2.5 text-white outline-none transition-all font-bold tracking-widest text-center"
              />
            </div>

            <div className="flex gap-2 justify-end text-xs font-bold">
              <button 
                onClick={() => { setDeletingBooking(null); setDeleteConfirmationText(''); }} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 rounded-xl text-slate-300 transition-colors w-full sm:w-auto"
              >
                No, Keep Record
              </button>
              <button 
                onClick={handleDeleteBooking}
                disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-950/20 disabled:text-red-400/40 disabled:border-red-950/20 disabled:cursor-not-allowed border border-red-500/10 rounded-xl text-white transition-colors w-full sm:w-auto shadow-sm"
              >
                Yes, Delete Permanently
              </button>
            </div>

          </div>
        </div>
      )}

      {/* GENERIC CONFIRMATION DIALOG MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-[#020C1F]/90 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className={`bg-[#0A1224] border ${confirmDialog.isDanger ? 'border-red-500/30' : 'border-[#D4A017]/30'} rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 text-slate-200 shadow-2xl relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-full h-1.5 ${confirmDialog.isDanger ? 'bg-red-600' : 'bg-[#D4A017]'}`}></div>
            
            <div className="text-center space-y-3">
              <div className={`w-12 h-12 ${confirmDialog.isDanger ? 'bg-red-500/10 border border-red-500/20 text-red-500' : 'bg-[#D4A017]/10 border border-[#D4A017]/20 text-[#D4A017]'} rounded-full flex items-center justify-center mx-auto`}>
                <ShieldAlert size={24} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{confirmDialog.title}</h3>
                <p className="text-[11px] text-slate-400">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end text-xs font-bold">
              <button 
                onClick={() => setConfirmDialog(null)} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 rounded-xl text-slate-300 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className={`px-5 py-2 ${confirmDialog.isDanger ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-[#D4A017] hover:bg-[#bfa315] text-[#020C1F]'} rounded-xl transition-colors w-full sm:w-auto shadow-sm`}
              >
                {confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
