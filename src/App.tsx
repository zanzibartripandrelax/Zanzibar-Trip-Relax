import { useState, useEffect, lazy, Suspense } from 'react';
import { useHashRouter } from './hooks/useHashRouter';
import { ExitIntentModal } from './components/ExitIntentModal';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import SEOMetadata from './components/SEOMetadata';
import { TopLoadingBar } from './components/TopLoadingBar';
import { ToastContainer } from './components/ToastNotification';
import CookieConsent from './components/CookieConsent';
import { useAnalytics } from './context/AnalyticsContext';
import BackToTopButton from './components/BackToTopButton';
import PageLoader from './components/PageLoader';

// Pages - Static (Small/Initial)
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

// Pages - Lazy Loaded (Heavy/Secondary)
const Gallery = lazy(() => import('./pages/Gallery'));
const Tours = lazy(() => import('./pages/Tours'));
const Booking = lazy(() => import('./pages/Booking'));
const Packages = lazy(() => import('./pages/Packages'));
const Safaris = lazy(() => import('./pages/Safaris'));
const Transfers = lazy(() => import('./pages/Transfers'));
const Blog = lazy(() => import('./pages/Blog'));
const Reviews = lazy(() => import('./pages/Reviews'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Kilimanjaro = lazy(() => import('./pages/Kilimanjaro'));
const FAQ = lazy(() => import('./pages/FAQ'));
const TourDetail = lazy(() => import('./pages/TourDetail'));
const Policies = lazy(() => import('./pages/Policies'));
const Admin = lazy(() => import('./pages/Admin'));
const ManageBooking = lazy(() => import('./pages/ManageBooking'));
const Careers = lazy(() => import('./pages/Careers'));
const Sustainability = lazy(() => import('./pages/Sustainability'));
const BestTimeToVisit = lazy(() => import('./pages/BestTimeToVisit'));
const Destinations = lazy(() => import('./pages/Destinations'));
const Hotels = lazy(() => import('./pages/Hotels'));

// Check if this window is an OAuth redirect popup
if (typeof window !== 'undefined' && window.opener && (window.location.hash.includes('access_token') || window.location.hash.includes('token'))) {
  try {
    window.opener.postMessage({
      type: 'GOOGLE_OAUTH_SUCCESS',
      hash: window.location.hash
    }, window.location.origin);
    window.close();
  } catch (err) {
    console.error('Failed to postMessage to opener:', err);
  }
}

export default function App() {
  const { currentPage, navigate, blogId, queryParams } = useHashRouter();
  const [cmsSynced, setCmsSynced] = useState(false);
  const { trackPageView } = useAnalytics();

  // Intercept direct pathways and map clean pathnames to hash routes
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/admin' || path === '/dashboard' || path === '/admin/dashboard') {
      window.location.hash = 'admin';
      window.history.replaceState(null, '', '/');
    } else if (path === '/owner/setup' || path === '/create-owner') {
      window.location.hash = 'create-owner';
      window.history.replaceState(null, '', '/');
    } else if (path === '/owner-login' || path === '/owner/login') {
      window.location.hash = 'owner-login';
      window.history.replaceState(null, '', '/');
    } else if (path === '/admin-login' || path === '/admin/login') {
      window.location.hash = 'admin-login';
      window.history.replaceState(null, '', '/');
    }
  }, []);

  // Onboarding (Task 3) & Auth Guard (Task 4) Redirections
  useEffect(() => {
    // 1. Check if an Owner exists in local storage
    const storedUsersStr = localStorage.getItem('ztr_admin_users');
    let hasOwner = false;
    try {
      const storedUsers = JSON.parse(storedUsersStr || '[]');
      hasOwner = storedUsers.some((u: any) => u.role?.toUpperCase() === 'ADMIN' || u.role?.toLowerCase() === 'owner');
    } catch (e) {
      // ignore
    }

    const isAdminRoute = [
      'admin', 'dashboard', 'admin/dashboard', 'owner/setup', 
      'create-owner', 'owner-login', 'admin-login'
    ].includes(currentPage);

    if (!hasOwner) {
      // If no owner exists and the user is on any admin/login pages, automatically open /create-owner
      if (isAdminRoute && currentPage !== 'create-owner') {
        navigate('create-owner');
      }
    } else {
      // Owner exists. If the user tries to access /create-owner or owner/setup, send them to owner-login
      if (currentPage === 'create-owner' || currentPage === 'owner/setup') {
        navigate('owner-login');
      }

      // 2. Check Authentication status
      const sessionStr = localStorage.getItem('ztr_active_session');
      let isAuthenticated = false;
      try {
        if (sessionStr) {
          const parsed = JSON.parse(sessionStr);
          if (Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
            isAuthenticated = !!parsed.user;
          }
        }
      } catch (e) {
        // ignore
      }

      // Auth Guard: Only authenticated Owners can access /admin, /admin/dashboard, or /dashboard
      const isRestrictedRoute = ['admin', 'dashboard', 'admin/dashboard'].includes(currentPage);
      if (!isAuthenticated && isRestrictedRoute) {
        navigate('owner-login');
      }
    }
  }, [currentPage, navigate]);

  useEffect(() => {
    import('./lib/cmsStore').then(({ syncSiteContentFromDb }) => {
      syncSiteContentFromDb()
        .then(() => {
          setCmsSynced(true);
        })
        .catch((err) => {
          console.warn('CMS content db sync failed:', err);
          setCmsSynced(true);
        });
    })
    .catch((err) => {
      console.warn('Dynamic import of cmsStore failed:', err);
      setCmsSynced(true);
    });
  }, []);

  useEffect(() => {
    trackPageView(currentPage);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigate={navigate} />;
      case 'about':
        return <About navigate={navigate} />;
      case 'tours':
        return <Tours navigate={navigate} queryParams={queryParams} />;
      case 'booking':
        return <Booking navigate={navigate} queryParams={queryParams} />;
      case 'gallery':
        return <Gallery navigate={navigate} />;
      case 'contact':
        return <Contact navigate={navigate} />;
      case 'packages':
        return <Packages navigate={navigate} queryParams={queryParams} />;
      case 'safaris':
        return <Safaris navigate={navigate} />;
      case 'transfers':
        return <Transfers navigate={navigate} />;
      case 'blog':
        return <Blog navigate={navigate} />;
      case 'reviews':
        return <Reviews navigate={navigate} />;
      case 'blog-detail':
        return <BlogDetail navigate={navigate} blogId={blogId} />;
      case 'kilimanjaro':
        return <Kilimanjaro navigate={navigate} />;
      case 'faq':
        return <FAQ navigate={navigate} />;
      case 'tour-detail':
        return <TourDetail navigate={navigate} />;
      case 'policies':
        return <Policies navigate={navigate} />;
      case 'admin':
      case 'dashboard':
      case 'admin/dashboard':
      case 'owner/setup':
      case 'create-owner':
      case 'owner-login':
      case 'admin-login':
        return <Admin navigate={navigate} currentPage={currentPage} />;
      case 'manage-booking':
        return <ManageBooking navigate={navigate} />;
      case 'careers':
        return <Careers navigate={navigate} />;
      case 'sustainability':
        return <Sustainability navigate={navigate} />;
      case 'best-time-to-visit':
        return <BestTimeToVisit navigate={navigate} />;
      case 'destinations':
        return <Destinations navigate={navigate} />;
      case 'hotels':
        return <Hotels navigate={navigate} />;
      default:
        return <Home navigate={navigate} />;
    }
  };

  const isAdminPage = ['admin', 'dashboard', 'admin/dashboard', 'owner/setup', 'create-owner', 'owner-login', 'admin-login'].includes(currentPage);

  return (
    <div className="flex flex-col min-h-screen text-gray-900 selection:bg-[#D4A017] selection:text-white">
      <TopLoadingBar isSyncing={!cmsSynced} triggerKey={currentPage + (blogId ? `-${blogId}` : '')} />
      <SEOMetadata pageId={currentPage} />
      {/* Navigation */}
      {!isAdminPage && <Navbar currentPage={currentPage} navigate={navigate} />}

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + (currentPage === 'blog-detail' ? `-${blogId}` : '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Suspense fallback={<PageLoader />}>
              {renderPage()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      {!isAdminPage && <Footer navigate={navigate} currentPage={currentPage} />}

      {/* Persistent Floating WhatsApp Help desk icon */}
      {!isAdminPage && <WhatsAppButton />}

      {/* Premium Luxury CRO Exit Intent Lead-Gen Popup */}
      {!isAdminPage && currentPage !== 'booking' && <ExitIntentModal />}

      {/* Elegant Back to Top button */}
      {!isAdminPage && <BackToTopButton />}

      {/* Unified Toast Notifications system */}
      <ToastContainer />

      {/* Enterprise Cookie Consent banner */}
      <CookieConsent />
    </div>
  );
}
