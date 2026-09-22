import { TEST_USER_ID } from '../config/testUser';
import type { CartItem } from '../types';
import { supabase } from './supabase';

export type SlotValidationRequestItem = {
  itemId: string;
  serviceId: string;
  scheduledDate: string; // yyyy-mm-dd
  startTime: string; // HH:MM:00
  endTime: string; // HH:MM:00
};

export type SlotValidationResult = {
  itemId: string;
  available: boolean;
};

export async function validateSlots(
  items: SlotValidationRequestItem[],
): Promise<SlotValidationResult[]> {
  if (items.length === 0) {
    return [];
  }
  const { data, error } = await supabase.functions.invoke('validate-slots', {
    body: { items },
  });
  if (error) {
    throw new Error(error.message);
  }
  return (data?.results ?? []) as SlotValidationResult[];
}

export async function createBooking(
  items: CartItem[],
  addressId: string,
  totals: { subtotal: number; platformFee: number; gst: number; total: number },
): Promise<string> {
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id: TEST_USER_ID,
      address_id: addressId,
      subtotal: totals.subtotal,
      platform_fee: totals.platformFee,
      gst: totals.gst,
      total: totals.total,
      payment_status: 'test_mode_paid',
      payment_method: 'mock',
    })
    .select('id')
    .single();
  if (bookingError || !booking) {
    throw new Error(bookingError?.message ?? 'Failed to create booking');
  }

  const bookingItems = items.map(item => ({
    booking_id: booking.id,
    service_id: item.service.id,
    pricing_tier_id: item.tier.id,
    quantity: 1,
    scheduled_date: item.date,
    start_time: item.startTime24,
    end_time: item.endTime24,
    slot_hold_status: 'confirmed',
    addons: item.addons.map(a => ({
      addon_id: a.addon.id,
      name: a.addon.name,
      price: a.addon.price,
      quantity: a.quantity,
    })),
    line_total: item.linePrice,
  }));

  const { error: itemsError } = await supabase.from('booking_items').insert(bookingItems);
  if (itemsError) {
    // The booking row exists but its items failed — surface this distinctly
    // since a retry would otherwise create a second, duplicate booking.
    throw new Error(`Booking created but items failed to save: ${itemsError.message}`);
  }

  return booking.id as string;
}
