// Scoped to a service (addons.service_id is NOT NULL) — confirmed against
// the real schema, not the earlier "global catalog" guess.
export type Addon = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
};
