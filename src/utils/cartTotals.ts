import type { CartItem } from '../types';

const PLATFORM_FEE = 49;
const GST_RATE = 0.18;

export type CartTotals = {
  subtotal: number;
  platformFee: number;
  gst: number;
  total: number;
};

export function computeCartTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.linePrice, 0);
  const platformFee = items.length > 0 ? PLATFORM_FEE : 0;
  const gst = subtotal * GST_RATE;
  const total = subtotal + platformFee + gst;
  return { subtotal, platformFee, gst, total };
}
