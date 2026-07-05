import React, { createContext, useContext, useEffect } from 'react';
import { 
  initGA, 
  trackPageView as rawTrackPageView, 
  trackEvent as rawTrackEvent, 
  trackConversion as rawTrackConversion,
  hasAnalyticsConsent
} from '../lib/analytics';
import { logger } from '../lib/logger';

export interface AnalyticsContextType {
  trackPageView: (path: string, title?: string) => void;
  trackEvent: (name: string, params?: Record<string, any>) => void;
  trackBookingInitiate: (category: string, tourName?: string, additionalParams?: Record<string, any>) => void;
  trackInquirySend: (source: string, leadName: string, additionalParams?: Record<string, any>) => void;
  trackWhatsAppClick: (location: string, topic?: string, additionalParams?: Record<string, any>) => void;
  trackConversion: (
    type: 'booking_started' | 'booking_completed' | 'enquiry_submitted' | 'whatsapp_clicked' | 'trip_builder_completed' | 'newsletter_subscribed',
    data?: Record<string, any>
  ) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Attempt dynamic tag injection on load if consent exists
    if (hasAnalyticsConsent()) {
      initGA();
    }
  }, []);

  const trackPageView = (path: string, title?: string) => {
    rawTrackPageView(path, title);
  };

  const trackEvent = (name: string, params: Record<string, any> = {}) => {
    rawTrackEvent(name, params);
  };

  const trackBookingInitiate = (category: string, tourName?: string, additionalParams: Record<string, any> = {}) => {
    const params = {
      category,
      tour_name: tourName || 'General Booking Form',
      ...additionalParams,
    };
    logger.analytics('GA4Custom', 'booking_initiate', params);
    rawTrackEvent('booking_initiate', params);
  };

  const trackInquirySend = (source: string, leadName: string, additionalParams: Record<string, any> = {}) => {
    const params = {
      source,
      lead_name: leadName,
      ...additionalParams,
    };
    logger.analytics('GA4Custom', 'inquiry_send', params);
    rawTrackEvent('inquiry_send', params);
  };

  const trackWhatsAppClick = (location: string, topic?: string, additionalParams: Record<string, any> = {}) => {
    const params = {
      location,
      topic: topic || 'General Help Desk',
      ...additionalParams,
    };
    logger.analytics('GA4Custom', 'whatsapp_click', params);
    rawTrackEvent('whatsapp_click', params);
  };

  const trackConversion = (
    type: 'booking_started' | 'booking_completed' | 'enquiry_submitted' | 'whatsapp_clicked' | 'trip_builder_completed' | 'newsletter_subscribed',
    data: Record<string, any> = {}
  ) => {
    rawTrackConversion(type, data);
  };

  return (
    <AnalyticsContext.Provider value={{
      trackPageView,
      trackEvent,
      trackBookingInitiate,
      trackInquirySend,
      trackWhatsAppClick,
      trackConversion
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
