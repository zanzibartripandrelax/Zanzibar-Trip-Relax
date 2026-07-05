/**
 * Zanzibar Trip & Relax - CRM Readiness Module
 * Standardizes customer lead and booking transaction data layouts
 * to simplify future REST/Webhook synchronizations (HubSpot, Salesforce, Zoho, etc.).
 */
import { logger } from './logger';
import { trackConversion } from './analytics';

export interface CRMLeadPayload {
  source: 'contact_form' | 'trip_builder' | 'careers' | 'newsletter';
  fullName: string;
  email: string | null;
  whatsappNumber: string;
  subject?: string;
  message?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface CRMBookingPayload {
  reference: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  tourName: string;
  preferredDate: string;
  pickupLocation: string;
  numberOfGuests: number;
  totalPrice: number;
  depositAmount: number;
  remainingBalance: number;
  paymentOption: 'deposit' | 'full';
  paymentStatus: 'pending' | 'partially_paid' | 'fully_paid';
  transactionId?: string;
  currency: string;
  timestamp: string;
}

/**
 * Standardizes and processes contact/enquiry lead data for future CRM sync.
 */
export async function syncLeadToCRM(lead: Omit<CRMLeadPayload, 'timestamp'>) {
  const payload: CRMLeadPayload = {
    ...lead,
    timestamp: new Date().toISOString()
  };

  logger.info('CRM', `Standardized CRM Lead Payload compiled for: ${payload.fullName} (Source: ${payload.source})`, payload);

  // Trigger Analytics conversion event
  let analyticsType: 'enquiry_submitted' | 'trip_builder_completed' | 'newsletter_subscribed' = 'enquiry_submitted';
  if (payload.source === 'trip_builder') {
    analyticsType = 'trip_builder_completed';
  } else if (payload.source === 'newsletter') {
    analyticsType = 'newsletter_subscribed';
  }

  trackConversion(analyticsType, {
    lead_source: payload.source,
    lead_name: payload.fullName,
    lead_subject: payload.subject || 'None'
  });

  // Future Extensibility Point:
  // try {
  //   await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.CRM_API_KEY}` },
  //     body: JSON.stringify({ properties: { firstname: payload.fullName, email: payload.email, phone: payload.whatsappNumber } })
  //   });
  // } catch (e) { ... }
}

/**
 * Standardizes and processes transaction/booking data for future CRM sync.
 */
export async function syncBookingToCRM(booking: Omit<CRMBookingPayload, 'timestamp'>) {
  const payload: CRMBookingPayload = {
    ...booking,
    timestamp: new Date().toISOString()
  };

  logger.info('CRM', `Standardized CRM Booking Transaction compiled for Ref: ${payload.reference}`, payload);

  // Trigger Analytics conversion event
  trackConversion('booking_completed', {
    transaction_id: payload.transactionId || payload.reference,
    value: payload.depositAmount,
    currency: payload.currency,
    items: [
      {
        item_id: payload.reference,
        item_name: payload.tourName,
        price: payload.totalPrice,
        quantity: payload.numberOfGuests
      }
    ]
  });

  // Future Extensibility Point:
  // await fetch('https://api.crm.example.com/v1/bookings', { ... });
}
