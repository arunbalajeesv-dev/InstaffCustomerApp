/**
 * @format
 */

import { createBooking, validateSlots } from '../src/services/bookingsApi';
import { TEST_USER_ID } from '../src/config/testUser';

const mockInvoke = jest.fn();
const mockInsertBookings = jest.fn();
const mockInsertBookingItems = jest.fn();

jest.mock('../src/services/supabase', () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
    from: (table: string) => {
      if (table === 'bookings') {
        return {
          insert: (payload: unknown) => ({
            select: () => ({
              single: () => mockInsertBookings(payload),
            }),
          }),
        };
      }
      if (table === 'booking_items') {
        return { insert: (payload: unknown) => mockInsertBookingItems(payload) };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
  },
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
const addon = { id: 'addon-1', name: 'Deep Clean Extra', price: 500 };
const item = {
  id: 'cart-1',
  service,
  tier,
  addons: [{ addon, quantity: 2 }],
  date: '2024-01-15',
  dateDisplay: 'Mon, Jan 15',
  startTime: '9:00 AM',
  endTime: '11:00 AM',
  startTime24: '09:00:00',
  endTime24: '11:00:00',
  linePrice: 2500,
};

beforeEach(() => {
  mockInvoke.mockReset();
  mockInsertBookings.mockReset();
  mockInsertBookingItems.mockReset();
});

describe('validateSlots', () => {
  test('returns [] without calling the function when there are no items', async () => {
    const result = await validateSlots([]);
    expect(result).toEqual([]);
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  test('invokes the edge function and returns its results', async () => {
    mockInvoke.mockResolvedValue({
      data: { results: [{ itemId: 'cart-1', available: true }] },
      error: null,
    });

    const result = await validateSlots([
      { itemId: 'cart-1', serviceId: 'svc-1', scheduledDate: '2024-01-15', startTime: '09:00:00', endTime: '11:00:00' },
    ]);

    expect(mockInvoke).toHaveBeenCalledWith('validate-slots', {
      body: {
        items: [
          { itemId: 'cart-1', serviceId: 'svc-1', scheduledDate: '2024-01-15', startTime: '09:00:00', endTime: '11:00:00' },
        ],
      },
    });
    expect(result).toEqual([{ itemId: 'cart-1', available: true }]);
  });

  test('throws when the edge function call errors', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: { message: 'Function not deployed' } });

    await expect(
      validateSlots([
        { itemId: 'cart-1', serviceId: 'svc-1', scheduledDate: '2024-01-15', startTime: '09:00:00', endTime: '11:00:00' },
      ]),
    ).rejects.toThrow('Function not deployed');
  });
});

describe('createBooking', () => {
  const totals = { subtotal: 2500, platformFee: 49, gst: 450, total: 2999 };

  test('inserts a booking marked test_mode_paid, then its booking_items, and returns the booking id', async () => {
    mockInsertBookings.mockResolvedValue({ data: { id: 'booking-1' }, error: null });
    mockInsertBookingItems.mockResolvedValue({ error: null });

    const bookingId = await createBooking([item], 'address-1', totals);

    expect(bookingId).toBe('booking-1');
    expect(mockInsertBookings).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: TEST_USER_ID,
        address_id: 'address-1',
        subtotal: 2500,
        platform_fee: 49,
        gst: 450,
        total: 2999,
        payment_status: 'test_mode_paid',
        payment_method: 'mock',
      }),
    );
    expect(mockInsertBookingItems).toHaveBeenCalledWith([
      expect.objectContaining({
        booking_id: 'booking-1',
        service_id: 'svc-1',
        pricing_tier_id: 'tier-small',
        scheduled_date: '2024-01-15',
        start_time: '09:00:00',
        end_time: '11:00:00',
        slot_hold_status: 'confirmed',
        line_total: 2500,
        addons: [{ addon_id: 'addon-1', name: 'Deep Clean Extra', price: 500, quantity: 2 }],
      }),
    ]);
  });

  test('throws if the booking insert fails', async () => {
    mockInsertBookings.mockResolvedValue({ data: null, error: { message: 'insert failed' } });

    await expect(createBooking([item], 'address-1', totals)).rejects.toThrow('insert failed');
    expect(mockInsertBookingItems).not.toHaveBeenCalled();
  });

  test('throws distinctly if the booking succeeds but its items fail', async () => {
    mockInsertBookings.mockResolvedValue({ data: { id: 'booking-1' }, error: null });
    mockInsertBookingItems.mockResolvedValue({ error: { message: 'items insert failed' } });

    await expect(createBooking([item], 'address-1', totals)).rejects.toThrow(
      'Booking created but items failed to save: items insert failed',
    );
  });
});
