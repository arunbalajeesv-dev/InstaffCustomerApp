export type SupabaseUser = {
  id: string;
  contactName: string;
  businessName?: string | null;
  phone?: string | null;
  email?: string | null;
};
