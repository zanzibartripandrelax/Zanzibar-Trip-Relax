import React, { useState } from 'react';
import { Page } from '../hooks/useHashRouter';
import { 
  Layout, Calendar, Users, MapPin, TrendingUp, Activity, 
  User, Sparkles, Clock, FileText, Shield, Layers, Image, 
  BookOpen, Briefcase, Leaf, Settings, LogOut, Compass, Mail, PlusCircle,
  ChevronDown, ChevronRight, Menu, X
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cmsEditSection: string;
  setCmsEditSection: (section: any) => void;
  session: { username: string; name: string; role: string } | null;
  bookingsCount: number;
  inquiriesCount: number;
  subscribersCount: number;
  jobsCount: number;
  usersCount: number;
  vehiclesCount: number;
  navigate: (page: Page) => void;
  handleLogout: () => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  cmsEditSection,
  setCmsEditSection,
  session,
  bookingsCount,
  inquiriesCount,
  subscribersCount,
  jobsCount,
  usersCount,
  vehiclesCount,
  navigate,
  handleLogout
}: AdminSidebarProps) {
  if (!session) return null;

  // Mobile navigation overlay toggle state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Sidebar expanded/collapsed section state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    catalog: true,
    people: true,
    content: true,
    system: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const normalizedRole = session.role ? session.role.trim().toLowerCase() : '';

  // 15 requested dashboard items mapped precisely to current system tab IDs
  const allItems = [
    // 1. Overview
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Layout,
      section: 'overview',
      action: () => { setActiveTab('dashboard'); setIsMobileOpen(false); },
      isActive: activeTab === 'dashboard'
    },
    { 
      id: 'profile', 
      label: 'My Profile', 
      icon: User,
      section: 'overview',
      action: () => { setActiveTab('profile'); setIsMobileOpen(false); },
      isActive: activeTab === 'profile'
    },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      icon: Calendar,
      section: 'overview',
      badge: bookingsCount > 0 ? bookingsCount : undefined,
      action: () => { setActiveTab('bookings'); setIsMobileOpen(false); },
      isActive: activeTab === 'bookings'
    },
    { 
      id: 'inquiries', 
      label: 'Messages', 
      icon: Mail,
      section: 'overview',
      badge: inquiriesCount > 0 ? inquiriesCount : undefined,
      action: () => { setActiveTab('inquiries'); setIsMobileOpen(false); },
      isActive: activeTab === 'inquiries'
    },

    // 2. Catalog
    { 
      id: 'zanzibarTours', 
      label: 'Tours', 
      icon: MapPin,
      section: 'catalog',
      action: () => { setActiveTab('zanzibarTours'); setIsMobileOpen(false); },
      isActive: activeTab === 'zanzibarTours'
    },
    { 
      id: 'holidayPackages', 
      label: 'Holiday Packages', 
      icon: Layers,
      section: 'catalog',
      action: () => { setActiveTab('holidayPackages'); setIsMobileOpen(false); },
      isActive: activeTab === 'holidayPackages'
    },
    { 
      id: 'tanzaniaSafaris', 
      label: 'Safaris', 
      icon: Compass,
      section: 'catalog',
      action: () => { setActiveTab('tanzaniaSafaris'); setIsMobileOpen(false); },
      isActive: activeTab === 'tanzaniaSafaris'
    },
    { 
      id: 'kilimanjaro', 
      label: 'Kilimanjaro', 
      icon: Leaf,
      section: 'catalog',
      action: () => { setActiveTab('kilimanjaro'); setIsMobileOpen(false); },
      isActive: activeTab === 'kilimanjaro'
    },
    { 
      id: 'airportTransfers', 
      label: 'Transfers', 
      icon: Activity,
      section: 'catalog',
      action: () => { setActiveTab('airportTransfers'); setIsMobileOpen(false); },
      isActive: activeTab === 'airportTransfers'
    },
    { 
      id: 'suppliers', 
      label: 'Hotels', 
      icon: Briefcase,
      section: 'catalog',
      action: () => { setActiveTab('suppliers'); setIsMobileOpen(false); },
      isActive: activeTab === 'suppliers'
    },

    // 3. People
    { 
      id: 'customers', 
      label: 'Customers', 
      icon: Users,
      section: 'people',
      action: () => { setActiveTab('customers'); setIsMobileOpen(false); },
      isActive: activeTab === 'customers'
    },
    { 
      id: 'users', 
      label: 'Staff', 
      icon: Shield,
      section: 'people',
      badge: usersCount > 0 ? usersCount : undefined,
      action: () => { setActiveTab('users'); setIsMobileOpen(false); },
      isActive: activeTab === 'users'
    },

    // 4. Content
    { 
      id: 'media', 
      label: 'Media Library', 
      icon: Image,
      section: 'content',
      action: () => { setActiveTab('media'); setIsMobileOpen(false); },
      isActive: activeTab === 'media'
    },
    { 
      id: 'cms', 
      label: 'Website CMS', 
      icon: Layers,
      section: 'content',
      action: () => { 
        setActiveTab('cms'); 
        setCmsEditSection('contact');
        setIsMobileOpen(false);
      },
      isActive: activeTab === 'cms'
    },

    // 5. System
    { 
      id: 'logs', 
      label: 'Reports', 
      icon: FileText,
      section: 'system',
      action: () => { setActiveTab('logs'); setIsMobileOpen(false); },
      isActive: activeTab === 'logs'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      section: 'system',
      action: () => { setActiveTab('settings'); setIsMobileOpen(false); },
      isActive: activeTab === 'settings'
    },
  ];

  // Specific role configurations (limit visible tabs depending on credentials to prevent leaks)
  const rolePermissions: Record<string, string[]> = {
    'admin': [
      'dashboard', 'profile', 'bookings', 'inquiries', 'zanzibarTours', 'holidayPackages', 
      'tanzaniaSafaris', 'kilimanjaro', 'airportTransfers', 'suppliers', 
      'customers', 'users', 'media', 'cms', 'logs', 'settings'
    ],
    'owner': [
      'dashboard', 'profile', 'bookings', 'inquiries', 'zanzibarTours', 'holidayPackages', 
      'tanzaniaSafaris', 'kilimanjaro', 'airportTransfers', 'suppliers', 
      'customers', 'users', 'media', 'cms', 'logs', 'settings'
    ],
    'super admin': [
      'dashboard', 'profile', 'bookings', 'inquiries', 'zanzibarTours', 'holidayPackages', 
      'tanzaniaSafaris', 'kilimanjaro', 'airportTransfers', 'suppliers', 
      'customers', 'users', 'media', 'cms', 'logs', 'settings'
    ],
    'manager': [
      'dashboard', 'profile', 'bookings', 'inquiries', 'zanzibarTours', 'holidayPackages', 
      'tanzaniaSafaris', 'kilimanjaro', 'airportTransfers', 'suppliers', 
      'customers', 'media', 'cms', 'logs', 'settings'
    ],
    'reservation officer': ['dashboard', 'profile', 'bookings', 'inquiries', 'customers'],
    'sales': ['dashboard', 'profile', 'bookings', 'customers'],
    'accountant': ['dashboard', 'profile', 'logs', 'settings'],
    'guide': ['dashboard', 'profile', 'bookings'],
    'driver': ['dashboard', 'profile', 'bookings'],
    'content creator': ['dashboard', 'profile', 'media', 'cms'],
    'marketing': ['dashboard', 'profile', 'customers', 'media', 'cms'],
    'customer support': ['dashboard', 'profile', 'customers', 'inquiries']
  };

  const allowedIds = rolePermissions[normalizedRole] || ['dashboard'];
  const filteredItems = allItems.filter(item => allowedIds.includes(item.id));

  // Sub-items based on section
  const renderSectionItems = (sectionName: string) => {
    const sectionItems = filteredItems.filter(item => item.section === sectionName);
    if (sectionItems.length === 0) return null;

    return (
      <div className="space-y-1 mt-1 transition-all duration-300">
        {sectionItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={item.action}
              className={`w-full text-left py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group ${
                item.isActive 
                  ? 'bg-[#0B3B8C] text-white shadow-lg shadow-[#0B3B8C]/15 border border-[#D4A017]/25 font-bold' 
                  : 'text-slate-400 hover:bg-[#121B30] hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon 
                  size={14} 
                  className={
                    item.isActive 
                      ? 'text-[#D4A017]' 
                      : 'text-slate-500 group-hover:text-slate-300 transition-colors'
                  } 
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  item.isActive ? 'bg-[#D4A017] text-[#020C1F]' : 'bg-[#121B30] text-slate-400 border border-white/5'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full bg-[#0A1224]">
      {/* Branding Header */}
      <div className="p-5 border-b border-white/5 bg-[#070D1A] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0B3B8C] border border-[#D4A017]/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#D4A017]" />
            </div>
            <div>
              <h2 className="font-bold text-xs text-white uppercase tracking-wider font-sans">Zanzibar Trip</h2>
              <p className="text-[9px] font-bold text-[#D4A017] uppercase tracking-widest">Admin Dashboard</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button 
            className="md:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* User Profile Info Card */}
        <div 
          onClick={() => { setActiveTab('profile'); setIsMobileOpen(false); }}
          className="mt-4 flex items-center gap-2.5 bg-[#121B30] border border-white/5 rounded-xl p-2.5 hover:bg-[#1a2745] hover:border-[#D4A017]/30 transition-all cursor-pointer group"
          title="Click to view/edit your profile"
        >
          <div className="w-7 h-7 rounded-full bg-[#D4A017]/15 border border-[#D4A017]/25 flex items-center justify-center font-bold text-xs text-[#D4A017] shrink-0 group-hover:scale-105 transition-transform">
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-slate-200 truncate group-hover:text-white">{session.name}</p>
            <p className="text-[9px] font-semibold text-slate-500 capitalize">{session.role.replace('-', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Navigation Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-none">
        
        {/* OVERVIEW SECTION */}
        <div>
          <button 
            onClick={() => toggleSection('overview')}
            className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <span>Overview</span>
            {expandedSections.overview ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {expandedSections.overview && renderSectionItems('overview')}
        </div>

        {/* CATALOG SECTION */}
        <div>
          <button 
            onClick={() => toggleSection('catalog')}
            className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <span>Products</span>
            {expandedSections.catalog ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {expandedSections.catalog && renderSectionItems('catalog')}
        </div>

        {/* PEOPLE SECTION */}
        <div>
          <button 
            onClick={() => toggleSection('people')}
            className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <span>Users & Staff</span>
            {expandedSections.people ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {expandedSections.people && renderSectionItems('people')}
        </div>

        {/* CONTENT SECTION */}
        <div>
          <button 
            onClick={() => toggleSection('content')}
            className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <span>Content & CMS</span>
            {expandedSections.content ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {expandedSections.content && renderSectionItems('content')}
        </div>

        {/* SYSTEM SECTION */}
        <div>
          <button 
            onClick={() => toggleSection('system')}
            className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <span>Administration</span>
            {expandedSections.system ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {expandedSections.system && renderSectionItems('system')}
        </div>

      </nav>

      {/* Bottom Sticky Action Panel */}
      <div className="p-4 border-t border-white/5 bg-[#070D1A] shrink-0 text-center space-y-2">
        <button
          onClick={() => navigate('home')}
          className="w-full bg-[#121B30] hover:bg-[#1a2642] text-xs font-bold text-[#D4A017] py-2.5 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Exit to Public Website</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full bg-red-950/20 hover:bg-red-950/40 text-xs font-bold text-red-400 py-2 rounded-xl border border-red-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
        >
          <LogOut size={12} />
          <span>Logout Session</span>
        </button>
        <p className="text-[8px] font-mono text-slate-600 mt-1">v3.5.0 • Development Mode Active</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Mini Header Toggle */}
      <header className="md:hidden w-full bg-[#0A1224] border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0B3B8C] border border-[#D4A017]/20 rounded-lg flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#D4A017]" />
          </div>
          <span className="font-bold text-xs text-white tracking-wider uppercase font-serif">Zanzibar Trip</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-1 text-slate-300 hover:text-white"
          id="mobile-sidebar-toggle"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Desktop Sticky Left Sidebar (Sticky on md+) */}
      <aside className="hidden md:flex w-64 border-r border-white/5 shrink-0 flex-col h-screen sticky top-0 self-start">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Menu (Slide-in Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Sidebar Area */}
          <div className="relative flex flex-col w-64 max-w-[80vw] h-full bg-[#0A1224] border-r border-white/5 shadow-2xl transition-transform">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
