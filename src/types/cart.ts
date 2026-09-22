import type { Addon } from './addon';
import type { PricingTier } from './pricingTier';
import type { Service } from './service';

export type CartAddonSelection = { addon: Addon; quantity: number };

export type CartItem = {
  id: string;
  service: Service;
  tier: PricingTier;
  addons: CartAddonSelection[];
  date: string; // yyyy-mm-dd
  dateDisplay: string; // e.g. "Mon, Sep 23"
  startTime: string; // 12-hour display label, e.g. "9:00 PM"
  endTime: string;
  startTime24: string; // "HH:MM:00", for booking_items.start_time
  endTime24: string;
  linePrice: number;
};
