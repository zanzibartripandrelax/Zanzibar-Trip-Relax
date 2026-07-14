/**
 * Zanzibar Trip & Relax - Event Bus
 * Light-weight, type-safe, and asynchronous EventEmitter pattern
 * to decouple core booking operations from notification delivery,
 * CRM integrations, and logging pipelines.
 */

export interface BookingEventPayload {
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
  paymentOption: 'deposit' | 'full' | 'later';
  paymentStatus: 'pending' | 'partially_paid' | 'fully_paid';
  transactionId?: string;
  currency: string;
  specialRequests?: string;
  timestamp: string;
}

export interface PaymentEventPayload {
  reference: string;
  fullName: string;
  email: string;
  amountPaid: number;
  remainingBalance: number;
  paymentStatus: 'partially_paid' | 'fully_paid';
  transactionId: string;
  timestamp: string;
}

export interface DispatchEventPayload {
  reference: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  pickupTime: string;
  pickupLocation: string;
  timestamp: string;
}

export type EventMap = {
  'booking.created': BookingEventPayload;
  'booking.confirmed': BookingEventPayload;
  'booking.paid': PaymentEventPayload;
  'booking.cancelled': { reference: string; reason?: string; timestamp: string };
  'dispatch.updated': DispatchEventPayload;
};

export type EventKey = keyof EventMap;
export type EventCallback<K extends EventKey> = (data: EventMap[K]) => void | Promise<void>;

class EventBus {
  private listeners: Record<string, any[]> = {};

  /**
   * Subscribes a listener callback to a specific event.
   * Returns an unsubscribe function for easy cleanup.
   */
  on<K extends EventKey>(event: K, callback: EventCallback<K>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribes a listener callback from a specific event.
   */
  off<K extends EventKey>(event: K, callback: EventCallback<K>): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Asynchronously emits an event, executing all registered listeners concurrently
   * and handling any thrown errors to prevent chain disruption.
   */
  async emit<K extends EventKey>(event: K, data: EventMap[K]): Promise<void> {
    const callbacks = this.listeners[event];
    if (!callbacks || callbacks.length === 0) return;

    // Run all callbacks in parallel and catch errors safely
    await Promise.all(
      callbacks.map(async (cb) => {
        try {
          await cb(data);
        } catch (error) {
          console.error(`[EventBus] Error in listener for event "${event}":`, error);
        }
      })
    );
  }
}

export const eventBus = new EventBus();
