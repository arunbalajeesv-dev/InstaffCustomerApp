/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import { PaymentScreen } from '../src/screens/PaymentScreen';
import { useCartStore } from '../src/store/useCartStore';

const mockNavigate = jest.fn();
const mockReset = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, reset: mockReset, goBack: mockGoBack }),
  useRoute: () => ({ params: { addressId: 'address-123' } }),
}));

const mockValidateSlots = jest.fn();
const mockCreateBooking = jest.fn();
jest.mock('../src/services/bookingsApi', () => ({
  validateSlots: (...args: unknown[]) => mockValidateSlots(...args),
  createBooking: (...args: unknown[]) => mockCreateBooking(...args),
}));

const service = { id: 'svc-1', name: 'Opening/Closing Cleaning', category: 'Cleaning' };
const tier = {
  id: 'tier-small',
  serviceId: 'svc-1',
  facilitySize: 'Small',
  professionals: 2,
  durationHours: 2,
  price: 1500,
};
const item = {
  id: 'cart-1',
  service,
  tier,
  addons: [],
  date: '2024-01-15',
  dateDisplay: 'Mon, Jan 15',
  startTime: '9:00 AM',
  endTime: '11:00 AM',
  startTime24: '09:00:00',
  endTime24: '11:00:00',
  linePrice: 1500,
};

let currentTree: ReactTestRenderer.ReactTestRenderer | undefined;

beforeEach(() => {
  mockNavigate.mockClear();
  mockReset.mockClear();
  mockGoBack.mockClear();
  mockValidateSlots.mockReset();
  mockCreateBooking.mockReset();
  useCartStore.setState({ items: [item] });
});

afterEach(() => {
  if (currentTree) {
    ReactTestRenderer.act(() => {
      currentTree!.unmount();
    });
    currentTree = undefined;
  }
  jest.restoreAllMocks();
});

async function render() {
  await ReactTestRenderer.act(async () => {
    currentTree = ReactTestRenderer.create(<PaymentScreen />);
  });
  return currentTree!;
}

test('shows Pay Now once slot validation succeeds, with the correct total', async () => {
  mockValidateSlots.mockResolvedValue([{ itemId: 'cart-1', available: true }]);
  const tree = await render();

  const payButton = () => tree.root.findByProps({ testID: 'payNowButton' });
  expect(payButton().props.disabled).toBe(false);

  // subtotal 1500 + platform fee 49 + GST 18% of 1500 (270) = 1819
  const total = tree.root.findByProps({ testID: 'paymentTotalValue' }).props.children;
  expect(total).toBe('₹1,819');
});

test('shows an alert and sends the user back to fix an unavailable slot', async () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
    buttons?.[0]?.onPress?.();
  });
  mockValidateSlots.mockResolvedValue([{ itemId: 'cart-1', available: false }]);

  await render();

  expect(alertSpy).toHaveBeenCalledWith(
    'Slot unavailable',
    "Your slot for Opening/Closing Cleaning is no longer available. Please pick a new time.",
    expect.anything(),
  );
  expect(mockNavigate).toHaveBeenCalledWith('ServiceDetail', {
    service,
    editCartItemId: 'cart-1',
  });
});

test('shows a retryable error if the validation call itself fails', async () => {
  mockValidateSlots.mockRejectedValueOnce(new Error('Network down'));
  const tree = await render();

  expect(tree.root.findAllByProps({ testID: 'payNowButton' })).toHaveLength(0);
  const texts = tree.root.findAllByType(require('react-native').Text).map(t => t.props.children);
  expect(texts).toContain('Network down');

  mockValidateSlots.mockResolvedValueOnce([{ itemId: 'cart-1', available: true }]);
  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'retryValidationButton' }).props.onPress();
  });

  expect(tree.root.findByProps({ testID: 'payNowButton' })).toBeTruthy();
});

test('Pay Now waits, creates the booking, clears the cart, and resets to BookingConfirmation', async () => {
  jest.useFakeTimers();
  mockValidateSlots.mockResolvedValue([{ itemId: 'cart-1', available: true }]);
  mockCreateBooking.mockResolvedValue('booking-456');
  const tree = await render();

  await ReactTestRenderer.act(async () => {
    tree.root.findByProps({ testID: 'payNowButton' }).props.onPress();
  });

  // still "paying" — createBooking hasn't been reached yet (timer pending)
  expect(mockCreateBooking).not.toHaveBeenCalled();

  await ReactTestRenderer.act(async () => {
    await jest.advanceTimersByTimeAsync(1500);
  });

  expect(mockCreateBooking).toHaveBeenCalledWith(
    [item],
    'address-123',
    expect.objectContaining({ total: 1819 }),
  );
  expect(useCartStore.getState().items).toHaveLength(0);
  expect(mockReset).toHaveBeenCalledWith({
    index: 0,
    routes: [{ name: 'BookingConfirmation', params: { bookingId: 'booking-456', total: 1819 } }],
  });

  jest.useRealTimers();
});

test('Pay Now shows an alert and stays on the screen if booking creation fails', async () => {
  jest.useFakeTimers();
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockValidateSlots.mockResolvedValue([{ itemId: 'cart-1', available: true }]);
  mockCreateBooking.mockRejectedValue(new Error('Insert failed'));
  const tree = await render();

  await ReactTestRenderer.act(async () => {
    tree.root.findByProps({ testID: 'payNowButton' }).props.onPress();
  });
  await ReactTestRenderer.act(async () => {
    await jest.advanceTimersByTimeAsync(1500);
  });

  expect(alertSpy).toHaveBeenCalledWith('Payment failed', 'Insert failed');
  expect(mockReset).not.toHaveBeenCalled();
  expect(useCartStore.getState().items).toHaveLength(1); // cart NOT cleared
  expect(tree.root.findByProps({ testID: 'payNowButton' }).props.disabled).toBe(false);

  jest.useRealTimers();
});
