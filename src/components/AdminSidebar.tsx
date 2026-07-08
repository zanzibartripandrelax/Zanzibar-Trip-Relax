import React from 'react';
import { Page } from '../hooks/useHashRouter';
import { 
  Layout, Calendar, Users, MapPin, TrendingUp, Activity, 
  User, Sparkles, Clock, FileText, Shield, Layers, Image, 
  BookOpen, Briefcase, Leaf, Settings, LogOut, Compass
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cmsEditSection: string;
  setCmsEditSection: (section: any) => void;
  session: { username: string; name: string; role: string } | null;
  bookingsCount: number;
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
  subscribersCount,
  jobsCount,
  usersCount,
  vehiclesCount,
  navigate,
  handleLogout
}: AdminSidebarProps) {
  if (!session) return null;

  // Define sidebar items conditionally based on role to prevent administrative leaks
  let sidebarItems = [];

  const normalizedRole = session.role ? session.role.trim().toLowerCase() : '';

  if (normalizedRole === 'customer') {
    sidebarItems = [
      { 
        id: 'customerPortal', 
        label: 'My Reservations', 
        icon: Calendar,
        action: () => setActiveTab('customerPortal'),
        isActive: activeTab === 'customerPortal'
      },
      { 
        id: 'logout', 
        label: 'Logout', 
        icon: LogOut,
        action: handleLogout,
        isActive: false,
        isDanger: true
      }
    ];
  } else if (normalizedRole === 'driver') {
    sidebarItems = [
      { 
        id: 'driverPortal', 
        label: 'My Transfer Sheets', 
        icon: Calendar,
        action: () => setActiveTab('driverPortal'),
        isActive: activeTab === 'driverPortal'
      },
      { 
        id: 'logout', 
        label: 'Logout', 
        icon: LogOut,
        action: handleLogout,
        isActive: false,
        isDanger: true
      }
    ];
  } else if (normalizedRole === 'guide' || normalizedRole === 'tour guide') {
    sidebarItems = [
      { 
        id: 'guidePortal', 
        label: 'My Guide Assignments', 
        icon: Calendar,
        action: () => setActiveTab('guidePortal'),
        isActive: activeTab === 'guidePortal'
      },
      { 
        id: 'logout', 
        label: 'Logout', 
        icon: LogOut,
        action: handleLogout,
        isActive: false,
        isDanger: true
      }
    ];
  } else {
    // All possible administrative and operations items
    const allItems = [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: Layout,
        action: () => setActiveTab('dashboard'),
        isActive: activeTab === 'dashboard'
      },
      { 
        id: 'bookings', 
        label: 'Bookings', 
        icon: Calendar,
        badge: bookingsCount > 0 ? bookingsCount : undefined,
        action: () => setActiveTab('bookings'),
        isActive: activeTab === 'bookings'
      },
      { 
        id: 'customers', 
        label: 'Customers', 
        icon: Users,
        badge: subscribersCount > 0 ? subscribersCount : undefined,
        action: () => setActiveTab('customers'),
        isActive: activeTab === 'customers'
      },
      { 
        id: 'holidayPackages', 
        label: 'Holiday Packages', 
        icon: Layers,
        action: () => setActiveTab('holidayPackages'),
        isActive: activeTab === 'holidayPackages'
      },
      { 
        id: 'zanzibarTours', 
        label: 'Zanzibar Tours', 
        icon: MapPin,
        action: () => setActiveTab('zanzibarTours'),
        isActive: activeTab === 'zanzibarTours'
      },
      { 
        id: 'tanzaniaSafaris', 
        label: 'Tanzania Safaris', 
        icon: Compass,
        action: () => setActiveTab('tanzaniaSafaris'),
        isActive: activeTab === 'tanzaniaSafaris'
      },
      { 
        id: 'kilimanjaro', 
        label: 'Kilimanjaro', 
        icon: Leaf,
        action: () => setActiveTab('kilimanjaro'),
        isActive: activeTab === 'kilimanjaro'
      },
      { 
        id: 'airportTransfers', 
        label: 'Airport Transfers', 
        icon: Activity,
        action: () => setActiveTab('airportTransfers'),
        isActive: activeTab === 'airportTransfers'
      },
      { 
        id: 'calendar', 
        label: 'Reservation Calendar', 
        icon: Calendar,
        action: () => setActiveTab('calendar'),
        isActive: activeTab === 'calendar'
      },
      { 
        id: 'payments', 
        label: 'Payments', 
        icon: TrendingUp,
        action: () => setActiveTab('finances'),
        isActive: activeTab === 'finances'
      },
      { 
        id: 'reports', 
        label: 'Reports', 
        icon: FileText,
        action: () => setActiveTab('logs'), 
        isActive: activeTab === 'logs'
      },
      { 
        id: 'staff', 
        label: 'Staff Management', 
        icon: Shield,
        badge: usersCount > 0 ? usersCount : undefined,
        action: () => setActiveTab('users'),
        isActive: activeTab === 'users'
      },
      { 
        id: 'rolesPermissions', 
        label: 'Roles & Permissions', 
        icon: Settings,
        action: () => setActiveTab('rolesPermissions'),
        isActive: activeTab === 'rolesPermissions'
      },
      { 
        id: 'content-management', 
        label: 'Website Content', 
        icon: Layers,
        action: () => {
          setActiveTab('cms');
          if (cmsEditSection === 'tours' || cmsEditSection === 'blog') {
            setCmsEditSection('contact');
          }
        },
        isActive: activeTab === 'cms' && cmsEditSection !== 'tours' && cmsEditSection !== 'blog'
      },
      { 
        id: 'gallery', 
        label: 'Gallery Management', 
        icon: Image,
        action: () => setActiveTab('media'),
        isActive: activeTab === 'media'
      },
      { 
        id: 'blog', 
        label: 'Blog Management', 
        icon: BookOpen,
        action: () => {
          setActiveTab('cms');
          setCmsEditSection('blog');
        },
        isActive: activeTab === 'cms' && cmsEditSection === 'blog'
      },
      { 
        id: 'reviews', 
        label: 'Reviews', 
        icon: Sparkles,
        action: () => setActiveTab('reviews'),
        isActive: activeTab === 'reviews'
      },
      { 
        id: 'sustainability', 
        label: 'Sustainability', 
        icon: Leaf,
        action: () => setActiveTab('sustainability'),
        isActive: activeTab === 'sustainability'
      },
      { 
        id: 'emailCentre', 
        label: 'Email Centre', 
        icon: FileText,
        action: () => setActiveTab('emailCentre'),
        isActive: activeTab === 'emailCentre'
      },
      { 
        id: 'whatsappCentre', 
        label: 'WhatsApp Centre', 
        icon: Sparkles,
        action: () => setActiveTab('whatsappCentre'),
        isActive: activeTab === 'whatsappCentre'
      },
      { 
        id: 'settings', 
        label: 'Website Settings', 
        icon: Settings,
        action: () => setActiveTab('settings'),
        isActive: activeTab === 'settings'
      },
      { 
        id: 'security', 
        label: 'Security Panel', 
        icon: Shield,
        action: () => setActiveTab('security'),
        isActive: activeTab === 'security'
      },
      { 
        id: 'systemBackup', 
        label: 'System Backup', 
        icon: Layers,
        action: () => setActiveTab('systemBackup'),
        isActive: activeTab === 'systemBackup'
      },
      { 
        id: 'auditLogs', 
        label: 'Audit Logs', 
        icon: Clock,
        action: () => setActiveTab('auditLogs'),
        isActive: activeTab === 'auditLogs'
      },
      { 
        id: 'logout', 
        label: 'Logout', 
        icon: LogOut,
        action: handleLogout,
        isActive: false,
        isDanger: true
      }
    ];

    // Allowed module IDs mapped per authorized role
    const permissions: Record<string, string[]> = {
      'owner': [
        'dashboard', 'bookings', 'customers', 'holidayPackages', 'zanzibarTours', 
        'tanzaniaSafaris', 'kilimanjaro', 'airportTransfers', 'calendar', 'payments', 
        'reports', 'staff', 'rolesPermissions', 'content-management', 'gallery', 
        'blog', 'reviews', 'sustainability', 'emailCentre', 'whatsappCentre', 
        'settings', 'security', 'systemBackup', 'auditLogs', 'logout'
      ],
      'super admin': [
        'dashboard', 'bookings', 'customers', 'holidayPackages', 'zanzibarTours', 
        'tanzaniaSafaris', 'kilimanjaro', 'airportTransfers', 'calendar', 'payments', 
        'reports', 'staff', 'rolesPermissions', 'content-management', 'gallery', 
        'blog', 'reviews', 'sustainability', 'emailCentre', 'whatsappCentre', 
        'settings', 'security', 'systemBackup', 'auditLogs', 'logout'
      ],
      'manager': [
        'dashboard', 'bookings', 'customers', 'holidayPackages', 'zanzibarTours', 
        'tanzaniaSafaris', 'kilimanjaro', 'airportTransfers', 'calendar', 'payments', 
        'reports', 'content-management', 'gallery', 'blog', 'reviews', 'sustainability', 
        'settings', 'logout'
      ],
      'reservation officer': ['dashboard', 'bookings', 'customers', 'calendar', 'logout'],
      'sales': ['dashboard', 'bookings', 'customers', 'logout'],
      'accountant': ['dashboard', 'payments', 'reports', 'settings', 'logout'],
      'marketing': ['dashboard', 'customers', 'gallery', 'blog', 'reviews', 'sustainability', 'logout'],
      'customer support': ['dashboard', 'customers', 'logout']
    };

    const allowedIds = permissions[normalizedRole] || ['dashboard', 'logout'];
    sidebarItems = allItems.filter(item => allowedIds.includes(item.id));
  }

  return (
    <aside className="w-full md:w-64 bg-[#0A1224] border-r border-white/5 shrink-0 flex flex-col justify-between h-screen max-h-screen sticky top-0">
      
      {/* Branding Header */}
      <div className="p-5 border-b border-white/5 bg-[#070D1A] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0B3B8C] border border-[#D4A017]/30 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D4A017]" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white font-serif">Zanzibar Trip</h2>
            <p className="text-[10px] tracking-wider font-semibold text-slate-400 uppercase">Control Console</p>
          </div>
        </div>
        
        {/* User Status Badge */}
        <div className="mt-4 flex items-center gap-2 bg-[#121B30] border border-white/5 rounded-xl p-2">
          <div className="w-5 h-5 rounded-full bg-[#D4A017]/20 border border-[#D4A017]/35 flex items-center justify-center font-bold text-[10px] text-[#D4A017] shrink-0">
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate flex-1">
            <p className="text-[11px] font-bold text-slate-200 truncate">{session.name}</p>
            <p className="text-[9px] font-semibold text-slate-400 capitalize">{session.role.replace('-', ' ')}</p>
          </div>
          <button
            onClick={() => navigate('home')}
            className="text-[9px] font-bold text-slate-400 hover:text-[#D4A017] transition-all bg-[#081125] px-1.5 py-0.5 rounded border border-white/5"
            title="View Public Site"
          >
            Web
          </button>
        </div>
      </div>

      {/* Scrollable Navigation Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full text-left py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group ${
                item.isActive 
                  ? 'bg-[#0B3B8C] text-white shadow-lg shadow-[#0B3B8C]/15 border border-[#D4A017]/20' 
                  : item.isDanger
                    ? 'text-red-400 hover:bg-red-950/20 hover:text-red-300 border border-transparent'
                    : 'text-slate-400 hover:bg-[#121B30] hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon 
                  size={14} 
                  className={
                    item.isActive 
                      ? 'text-[#D4A017]' 
                      : item.isDanger 
                        ? 'text-red-400 group-hover:text-red-300' 
                        : 'text-slate-500 group-hover:text-slate-300'
                  } 
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  item.isActive ? 'bg-[#D4A017] text-[#020C1F]' : 'bg-[#121B30] text-slate-400 border border-white/5'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Sticky Action Panel */}
      <div className="p-4 border-t border-white/5 bg-[#070D1A] shrink-0 text-center space-y-2">
        <button
          onClick={() => navigate('home')}
          className="w-full bg-[#121B30] hover:bg-[#1a2642] text-xs font-bold text-[#D4A017] py-2 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>View Website</span>
        </button>
        <p className="text-[8px] font-mono text-slate-600">v3.4.1 • Secure Portal</p>
      </div>
    </aside>
  );
}
