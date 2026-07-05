import { useState, useEffect } from 'react';
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

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Tours from './pages/Tours';
import Booking from './pages/Booking';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Packages from './pages/Packages';
import Safaris from './pages/Safaris';
import Transfers from './pages/Transfers';
import Blog from './pages/Blog';
import Reviews from './pages/Reviews';
import TripBuilder from './pages/TripBuilder';
import BlogDetail from './pages/BlogDetail';
import Kilimanjaro from './pages/Kilimanjaro';
import FAQ from './pages/FAQ';
import TourDetail from './pages/TourDetail';
import Policies from './pages/Policies';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import AuthGuard from './components/AuthGuard';
import ManageBooking from './pages/ManageBooking';
import Careers from './pages/Careers';
import Sustainability from './pages/Sustainability';

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
        return <Packages navigate={navigate} />;
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

  const isAdminPage = currentPage === 'admin' || currentPage === 'admin/login' || currentPage === 'dashboard' || currentPage === 'admin/dashboard';

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
            {renderPage()}
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
