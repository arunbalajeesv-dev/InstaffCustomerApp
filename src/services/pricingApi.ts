import type { PricingTier } from '../types';
import { supabase } from './supabase';

export async function fetchPricingTiers(serviceId: string): Promise<PricingTier[]> {
  const { data, error } = await supabase
    .from('service_pricing_tiers')
    .select(
      'id, serviceId:service_id, facilitySize:facility_size_label, professionals:num_professionals, durationHours:duration_hours, price:base_price',
    )
    .eq('service_id', serviceId)
    .order('base_price');
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as PricingTier[];
}

// One lowest-price lookup per service shown in a list, batched into a
// single request rather than one query per card.
export async function fetchLowestPrices(
  serviceIds: string[],
): Promise<Record<string, number>> {
  if (serviceIds.length === 0) {
    return {};
  }
  const { data, error } = await supabase
    .from('service_pricing_tiers')
    .select('serviceId:service_id, price:base_price')
    .in('service_id', serviceIds);
  if (error) {
    throw new Error(error.message);
  }
  const lowest: Record<string, number> = {};
  for (const row of (data ?? []) as { serviceId: string; price: number }[]) {
    if (lowest[row.serviceId] === undefined || row.price < lowest[row.serviceId]) {
      lowest[row.serviceId] = row.price;
    }
  }
  return lowest;
}
