/**
 * Zanzibar Trip & Relax - Privacy-First GA4 Analytics Module
 * Loads dynamically based on user cookie preferences and env configuration.
 */
import { logger } from './logger';

const GA_ID_ENV = (import.meta as any).env.VITE_GA_MEASUREMENT_ID || '';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    [key: string]: any;
  }
}

// Check if user has granted consent for analytics cookies
export function hasAnalyticsConsent(): boolean {
  try {
    const consent = localStorage.getItem('ztr_cookie_consent');
    if (consent) {
      const parsed = JSON.parse(consent);
      return parsed.analytics === true;
    }
  } catch (e) {
    logger.error('Analytics', 'Failed to read cookie consent', e);
  }
  return false; // Default: strict opt-in
}

// Dynamically initialize GA4 tag
export function initGA() {
  const measurementId = GA_ID_ENV;
  if (!measurementId) {
    logger.info('Analytics', 'No GA Measurement ID found in VITE_GA_MEASUREMENT_ID. Running in offline debug mode.');
    return;
  }

  const consentGranted = hasAnalyticsConsent();
  
  if (!consentGranted) {
    logger.info('Analytics', 'Google Analytics is registered but pending cookie consent approval.');
    // Set standard opt-out property to guarantee privacy
    window[`ga-disable-${measurementId}`] = true;
    return;
  }

  // Remove opt-out flag if it was set
  window[`ga-disable-${measurementId}`] = false;

  // Check if already injected
  if (document.getElementById('ztr-gtag-script')) {
    return;
  }

  logger.info('Analytics', 'Initializing GA4 Tracker with Measurement ID', { measurementId });

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  // Set default consents
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'granted',
    personalization_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted'
  });

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_path: window.location.hash || '/',
    send_page_view: false // Manual tracking on route changes
  });

  // Inject script
  const script = document.createElement('script');
  script.id = 'ztr-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

// Track a virtual page view for Single Page Application
export function trackPageView(path: string, title?: string) {
  const measurementId = GA_ID_ENV;
  const pageTitle = title || document.title;
  const pagePath = path || window.location.hash || '/';

  logger.analytics('PageView', pagePath, { pageTitle });

  if (!hasAnalyticsConsent() || !measurementId) {
    return;
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: pagePath,
      send_to: measurementId
    });
  }
}

// Track general user interactions
export function trackEvent(name: string, params: Record<string, any> = {}) {
  logger.analytics('Event', name, params);

  if (!hasAnalyticsConsent() || !GA_ID_ENV) {
    return;
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

// Predefined high-value conversion events
export function trackConversion(
  type: 'booking_started' | 'booking_completed' | 'enquiry_submitted' | 'whatsapp_clicked' | 'trip_builder_completed' | 'newsletter_subscribed',
  data: Record<string, any> = {}
) {
  const eventName = `ztr_${type}`;
  logger.analytics('Conversion', eventName, { ...data, value: data.value || 1.0 });

  if (!hasAnalyticsConsent() || !GA_ID_ENV) {
    return;
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      ...data,
      currency: data.currency || 'USD',
      value: data.value || 1.0
    });
  }
}
