// Fetched without a service filter: treated as a general add-on catalog
// rather than per-service, since the task didn't specify a scoping column.
// If add-ons should be service-specific, add an .eq('service_id', ...) to
// fetchAddons in addonsApi.ts.
export type Addon = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
};
