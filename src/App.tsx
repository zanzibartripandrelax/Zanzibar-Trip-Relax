import { useState, useEffect, lazy, Suspense } from 'react';
import { useHashRouter } from './hooks/useHashRouter';
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
const TripBuilder = lazy(() => import('./pages/TripBuilder'));
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
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const OwnerLogin = lazy(() => import('./pages/OwnerLogin'));
const MyAccount = lazy(() => import('./pages/MyAccount'));
const ManageBooking = lazy(() => import('./pages/ManageBooking'));
const Careers = lazy(() => import('./pages/Careers'));
const Sustainability = lazy(() => import('./pages/Sustainability'));

import AuthGuard from './components/AuthGuard';

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

  // Intercept direct pathways like /admin or /admin/login or /dashboard
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/admin/login') {
      window.location.hash = 'admin/login';
      window.history.replaceState(null, '', '/');
    } else if (path === '/owner' || path === '/owner/login') {
      window.location.hash = 'owner/login';
      window.history.replaceState(null, '', '/');
    } else if (path === '/admin' || path === '/dashboard') {
      window.location.hash = 'admin';
      window.history.replaceState(null, '', '/');
    }
  }, []);

  useEffect(() => {
    import('./lib/cmsStore').then(({ syncSiteContentFromDb }) => {
      syncSiteContentFromDb().then(() => {
        setCmsSynced(true);
      });
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
      case 'trip-builder':
        return <TripBuilder navigate={navigate} />;
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
      case 'admin/login':
        return <AdminLogin navigate={navigate} />;
      case 'owner':
      case 'owner/login':
        return <OwnerLogin navigate={navigate} />;
      case 'my-account':
        return <MyAccount navigate={navigate} />;
      case 'admin':
      case 'dashboard':
      case 'admin/dashboard':
        return (
          <AuthGuard navigate={navigate}>
            <Admin navigate={navigate} />
          </AuthGuard>
        );
      case 'manage-booking':
        return <ManageBooking navigate={navigate} />;
      case 'careers':
        return <Careers navigate={navigate} />;
      case 'sustainability':
        return <Sustainability navigate={navigate} />;
      default:
        return <Home navigate={navigate} />;
    }
  };

  const isAdminPage = currentPage === 'admin' || currentPage === 'admin/login' || currentPage === 'owner' || currentPage === 'owner/login' || currentPage === 'dashboard' || currentPage === 'admin/dashboard';

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

      {/* Elegant Back to Top button */}
      {!isAdminPage && <BackToTopButton />}

      {/* Unified Toast Notifications system */}
      <ToastContainer />

      {/* Enterprise Cookie Consent banner */}
      <CookieConsent />
    </div>
  );
}
