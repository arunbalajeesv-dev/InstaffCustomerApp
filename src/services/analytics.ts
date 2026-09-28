import { getAnalytics, logEvent } from '@react-native-firebase/analytics';

// Firebase Analytics *is* the mobile SDK for GA4 — events logged here show
// up as GA4 events in the Firebase/Analytics console under this project.
// One typed function per tracked event, rather than a generic dispatcher,
// to match this codebase's per-purpose-function style (createAddress,
// createBooking, ...) and to keep each event's param shape self-documenting.

const CURRENCY = 'INR';

export function trackAppOpen(): void {
  logEvent(getAnalytics(), 'app_open');
}

export function trackCategorySelected(categoryName: string): void {
  logEvent(getAnalytics(), 'category_selected', { category_name: categoryName });
}

export function trackServiceViewed(serviceId: string, serviceName: string): void {
  logEvent(getAnalytics(), 'service_viewed', {
    service_id: serviceId,
    service_name: serviceName,
  });
}

export function trackAddonAdded(addonId: string, addonName: string, serviceId: string): void {
  logEvent(getAnalytics(), 'addon_added', {
    addon_id: addonId,
    addon_name: addonName,
    service_id: serviceId,
  });
}

export function trackSlotSelected(serviceId: string, date: string, startTime: string): void {
  logEvent(getAnalytics(), 'slot_selected', {
    service_id: serviceId,
    date,
    start_time: startTime,
  });
}

export function trackAddToCart(
  serviceId: string,
  serviceName: string,
  value: number,
): void {
  // Mirrors GA4's recommended ecommerce shape (value/currency/items) under
  // the product-requested event name add_to_cart, rather than GA4's own
  // default name for this concept.
  logEvent(getAnalytics(), 'add_to_cart', {
    currency: CURRENCY,
    value,
    items: [{ item_id: serviceId, item_name: serviceName, price: value, quantity: 1 }],
  });
}

export function trackCheckoutStarted(value: number, numItems: number): void {
  logEvent(getAnalytics(), 'checkout_started', {
    currency: CURRENCY,
    value,
    num_items: numItems,
  });
}

export function trackPaymentCompleted(bookingId: string, value: number): void {
  logEvent(getAnalytics(), 'payment_completed', {
    booking_id: bookingId,
    currency: CURRENCY,
    value,
  });
}
