/**
 * Zanzibar Trip & Relax - Notification Service
 * Subscribes to the EventBus to process automated emails and WhatsApp logs
 * dynamically according to active system templates and settings.
 */

import { eventBus } from './eventBus';
import { dispatchAutomatedEmail } from '../lib/emailService';
import { logger } from '../lib/logger';

// Helper to check if WhatsApp notifications are globally enabled
const isWhatsAppEnabled = (): boolean => {
  const value = localStorage.getItem('ztr_settings_notify_channel_whatsapp');
  return value === null ? true : value === 'true' || value === '1';
};

// Helper to check if automatic email confirmations are enabled
const isEmailEnabled = (): boolean => {
  const value = localStorage.getItem('ztr_settings_notify_channel_email');
  return value === null ? true : value === 'true' || value === '1';
};

// Formatting helper to replace double-curly variables in templates
function formatTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
  }
  return result;
}

// Persist a simulated WhatsApp dispatch message and attempt real SMS send if configured
const addWhatsAppLog = async (phone: string, message: string) => {
  try {
    // 1. Simulated Logging
    const existingStr = localStorage.getItem('ztr_whatsapp_logs') || '[]';
    let logs: any[] = [];
    try {
      logs = JSON.parse(existingStr);
      if (!Array.isArray(logs)) logs = [];
    } catch {
      logs = [];
    }

    const newLog = {
      id: `wa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      phone: phone || '+255 777 123 456',
      message,
      status: 'sending',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    logs.unshift(newLog);
    if (logs.length > 200) {
      logs = logs.slice(0, 200);
    }
    localStorage.setItem('ztr_whatsapp_logs', JSON.stringify(logs));

    // 2. Real SMS Dispatch (Background)
    fetch('/api/notification/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toPhone: phone, message })
    })
    .then(async (res) => {
      const data = await res.json();
      // Update local log status
      const updatedLogs = JSON.parse(localStorage.getItem('ztr_whatsapp_logs') || '[]');
      const targetIdx = updatedLogs.findIndex((l: any) => l.id === newLog.id);
      if (targetIdx !== -1) {
        updatedLogs[targetIdx].status = data.success ? 'delivered' : 'failed';
        localStorage.setItem('ztr_whatsapp_logs', JSON.stringify(updatedLogs));
      }
      if (!data.success) {
        console.warn('[SMS Dispatch] Failed to deliver real-time notification:', data.error);
      }
    })
    .catch(err => {
      console.warn('[SMS Dispatch] Server endpoint unreachable:', err.message);
    });

    logger.info('NotificationService', `WhatsApp dispatch recorded for: ${phone}`, newLog);
    return newLog;
  } catch (err) {
    logger.error('NotificationService', 'Failed to process WhatsApp/SMS notification', err);
    return null;
  }
};

let isInitialized = false;

/**
 * Initializes and registers subscribers on the EventBus.
 * Ensures registration happens exactly once per application boot.
 */
export function initializeNotificationService() {
  if (isInitialized) return;
  isInitialized = true;

  logger.info('NotificationService', 'Initializing EventBus subscribers...');

  // 1. Listen for Booking Created (On Hold / Pending)
  eventBus.on('booking.created', (booking) => {
    logger.info('NotificationService', `Processing booking.created event for: ${booking.reference}`);

    // Email dispatch (Booking confirmation - payment pending)
    if (isEmailEnabled()) {
      try {
        dispatchAutomatedEmail('booking_confirm', booking.email, booking.fullName, {
          reference: booking.reference,
          tourName: booking.tourName,
          date: booking.preferredDate,
          price: `$${booking.totalPrice}`
        });
        logger.info('NotificationService', `Booking created confirmation email queued for ${booking.email}`);
      } catch (err) {
        logger.error('NotificationService', `Failed to send booking.created email for ${booking.reference}`, err);
      }
    }

    // WhatsApp notification
    if (isWhatsAppEnabled()) {
      const storedTemplate = localStorage.getItem('ztr_settings_whatsapp_confirm_template') || 
        'Jambo {{name}}, your booking for {{product}} on {{date}} is CONFIRMED. Reference: {{ref}}. Karibu Zanzibar!';
      
      const formattedMsg = formatTemplate(storedTemplate, {
        name: booking.fullName,
        product: booking.tourName,
        date: booking.preferredDate,
        ref: booking.reference
      });

      addWhatsAppLog(booking.whatsappNumber, formattedMsg);
    }
  });

  // 2. Listen for Booking Confirmed (Manually confirmed by admin or automated instant secure)
  eventBus.on('booking.confirmed', (booking) => {
    logger.info('NotificationService', `Processing booking.confirmed event for: ${booking.reference}`);

    if (isEmailEnabled()) {
      try {
        dispatchAutomatedEmail('booking_confirm', booking.email, booking.fullName, {
          reference: booking.reference,
          tourName: booking.tourName,
          date: booking.preferredDate,
          price: `$${booking.totalPrice}`
        });
        logger.info('NotificationService', `Booking confirmed email dispatched to ${booking.email}`);
      } catch (err) {
        logger.error('NotificationService', `Failed to send booking.confirmed email for ${booking.reference}`, err);
      }
    }

    if (isWhatsAppEnabled()) {
      const storedTemplate = localStorage.getItem('ztr_settings_whatsapp_confirm_template') || 
        'Jambo {{name}}, your booking for {{product}} on {{date}} is CONFIRMED. Reference: {{ref}}. Karibu Zanzibar!';
      
      const formattedMsg = formatTemplate(storedTemplate, {
        name: booking.fullName,
        product: booking.tourName,
        date: booking.preferredDate,
        ref: booking.reference
      });

      addWhatsAppLog(booking.whatsappNumber, formattedMsg);
    }
  });

  // 3. Listen for Booking Paid (Partial Deposit or Fully Paid)
  eventBus.on('booking.paid', (payment) => {
    logger.info('NotificationService', `Processing booking.paid event for: ${payment.reference}`);

    if (isEmailEnabled()) {
      try {
        dispatchAutomatedEmail('payment_confirm', payment.email, payment.fullName, {
          reference: payment.reference,
          amountPaid: `$${payment.amountPaid}`,
          remainingBalance: `$${payment.remainingBalance}`,
          status: payment.paymentStatus === 'fully_paid' ? 'Fully Paid' : 'Deposit Paid',
          transactionId: payment.transactionId
        });
        logger.info('NotificationService', `Payment confirmation email sent to ${payment.email}`);
      } catch (err) {
        logger.error('NotificationService', `Failed to send booking.paid email for ${payment.reference}`, err);
      }
    }

    if (isWhatsAppEnabled()) {
      const confirmMsg = `Jambo ${payment.fullName}! We have successfully received your payment of $${payment.amountPaid} for Reference: ${payment.reference}. Your remaining balance is $${payment.remainingBalance}. Asante sana!`;
      addWhatsAppLog(payment.email, confirmMsg); // Uses customer phone or email contact proxy
    }
  });

  // 4. Listen for Booking Cancelled
  eventBus.on('booking.cancelled', (cancel) => {
    logger.info('NotificationService', `Processing booking.cancelled event for: ${cancel.reference}`);

    if (isEmailEnabled()) {
      try {
        dispatchAutomatedEmail('booking_cancel', 'client@example.com', 'Valued Guest', {
          reference: cancel.reference,
          reason: cancel.reason || 'Requested by customer'
        });
        logger.info('NotificationService', `Cancellation warning email dispatched for: ${cancel.reference}`);
      } catch (err) {
        logger.error('NotificationService', `Failed to send booking.cancelled email for ${cancel.reference}`, err);
      }
    }

    if (isWhatsAppEnabled()) {
      const cancelMsg = `Dear Guest, your booking with Reference ${cancel.reference} has been cancelled. Reason: ${cancel.reason || 'Requested by customer'}. If you believe this is an error, please reach out.`;
      addWhatsAppLog('+255 777 123 456', cancelMsg);
    }
  });

  // 5. Listen for Vehicle & Driver Dispatch Updated
  eventBus.on('dispatch.updated', (dispatch) => {
    logger.info('NotificationService', `Processing dispatch.updated event for: ${dispatch.reference}`);

    if (isWhatsAppEnabled()) {
      const driverTemplate = `SYSTEM DISPATCH ORDER [Ref: ${dispatch.reference}]\n` +
        `-------------------------------\n` +
        `Assigned Driver: {{driverName}}\n` +
        `Pickup Location: {{pickupLocation}}\n` +
        `Pickup Time: {{pickupTime}}\n` +
        `Vehicle Plate: {{vehiclePlate}}\n` +
        `Contact Phone: {{driverPhone}}\n` +
        `-------------------------------\n` +
        `Please confirm receipt. Karibu!`;

      const driverMsg = formatTemplate(driverTemplate, {
        driverName: dispatch.driverName,
        pickupLocation: dispatch.pickupLocation,
        pickupTime: dispatch.pickupTime,
        vehiclePlate: dispatch.vehiclePlate,
        driverPhone: dispatch.driverPhone
      });

      // Send log to Driver's phone
      addWhatsAppLog(dispatch.driverPhone, driverMsg);

      // Also send reminder template to the Customer's phone if configured
      const autoSendReminder = localStorage.getItem('ztr_settings_auto_send_reminder_whatsapp') !== 'false';
      if (autoSendReminder) {
        const storedTemplate = localStorage.getItem('ztr_settings_whatsapp_reminder_template') ||
          'Jambo {{name}}, this is a friendly reminder that your {{product}} starts tomorrow at {{time}}! Pickup at {{pickup}}.';

        const customerMsg = formatTemplate(storedTemplate, {
          name: 'Valued Guest',
          product: 'Your Experience',
          time: dispatch.pickupTime,
          pickup: dispatch.pickupLocation
        });

        addWhatsAppLog('+255 777 123 456', customerMsg);
      }
    }
  });

  logger.info('NotificationService', 'All EventBus subscribers successfully initialized!');
}
