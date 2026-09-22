// Raw columns (aliased in pricingApi.ts): service_id, facility_size_label,
// num_professionals, duration_hours, base_price.
export type PricingTier = {
  id: string;
  serviceId: string;
  facilitySize: string;
  professionals: number;
  durationHours: number;
  price: number;
};
