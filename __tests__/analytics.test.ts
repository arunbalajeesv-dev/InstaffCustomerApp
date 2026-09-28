/**
 * @format
 */

import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import {
  trackAddonAdded,
  trackAddToCart,
  trackAppOpen,
  trackCategorySelected,
  trackCheckoutStarted,
  trackPaymentCompleted,
  trackServiceViewed,
  trackSlotSelected,
} from '../src/services/analytics';

const mockLogEvent = logEvent as jest.Mock;

beforeEach(() => {
  mockLogEvent.mockClear();
});

test('trackAppOpen logs app_open with no params', () => {
  trackAppOpen();
  expect(mockLogEvent).toHaveBeenCalledWith(getAnalytics(), 'app_open');
});

test('trackCategorySelected logs category_selected with the category name', () => {
  trackCategorySelected('Cleaning');
  expect(mockLogEvent).toHaveBeenCalledWith(getAnalytics(), 'category_selected', {
    category_name: 'Cleaning',
  });
});

test('trackServiceViewed logs service_viewed with the service id and name', () => {
  trackServiceViewed('service-1', 'Opening/Closing Cleaning');
  expect(mockLogEvent).toHaveBeenCalledWith(getAnalytics(), 'service_viewed', {
    service_id: 'service-1',
    service_name: 'Opening/Closing Cleaning',
  });
});

test('trackAddonAdded logs addon_added with the addon and service ids', () => {
  trackAddonAdded('addon-1', 'Carpet Cleaning', 'service-1');
  expect(mockLogEvent).toHaveBeenCalledWith(getAnalytics(), 'addon_added', {
    addon_id: 'addon-1',
    addon_name: 'Carpet Cleaning',
    service_id: 'service-1',
  });
});

test('trackSlotSelected logs slot_selected with the date and start time', () => {
  trackSlotSelected('service-1', '2026-09-25', '07:00 AM');
  expect(mockLogEvent).toHaveBeenCalledWith(getAnalytics(), 'slot_selected', {
    service_id: 'service-1',
    date: '2026-09-25',
    start_time: '07:00 AM',
  });
});

test('trackAddToCart logs add_to_cart with the GA4 ecommerce shape', () => {
  trackAddToCart('service-1', 'Opening/Closing Cleaning', 299);
  expect(mockLogEvent).toHaveBeenCalledWith(getAnalytics(), 'add_to_cart', {
    currency: 'INR',
    value: 299,
    items: [{ item_id: 'service-1', item_name: 'Opening/Closing Cleaning', price: 299, quantity: 1 }],
  });
});

test('trackCheckoutStarted logs checkout_started with the cart value and item count', () => {
  trackCheckoutStarted(402, 2);
  expect(mockLogEvent).toHaveBeenCalledWith(getAnalytics(), 'checkout_started', {
    currency: 'INR',
    value: 402,
    num_items: 2,
  });
});

test('trackPaymentCompleted logs payment_completed with the booking id and total', () => {
  trackPaymentCompleted('booking-1', 402);
  expect(mockLogEvent).toHaveBeenCalledWith(getAnalytics(), 'payment_completed', {
    booking_id: 'booking-1',
    currency: 'INR',
    value: 402,
  });
});
