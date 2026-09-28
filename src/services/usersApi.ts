import type { SupabaseUser } from '../types';
import { supabase } from './supabase';

// No name is collected during phone-OTP signup, so a new row gets this
// placeholder — a profile screen to edit it is natural next work, not built
// yet.
const NEW_USER_PLACEHOLDER_NAME = 'New Customer';

const SELECT_COLUMNS =
  'id, contactName:contact_name, businessName:business_name, phone, email';

// Called every time Firebase reports a signed-in user (fresh OTP verify, or
// a restored session on cold start) — looks up the matching Supabase
// profile by phone, creating one on first sign-in.
export async function findOrCreateUserByPhone(phone: string): Promise<SupabaseUser> {
  const { data: existing, error: findError } = await supabase
    .from('users')
    .select(SELECT_COLUMNS)
    .eq('phone', phone)
    .maybeSingle();
  if (findError) {
    throw new Error(findError.message);
  }
  if (existing) {
    return existing as SupabaseUser;
  }

  const { data: created, error: insertError } = await supabase
    .from('users')
    .insert({ phone, contact_name: NEW_USER_PLACEHOLDER_NAME })
    .select(SELECT_COLUMNS)
    .single();
  if (insertError || !created) {
    throw new Error(insertError?.message ?? 'Failed to create user');
  }
  return created as SupabaseUser;
}

// Saves this device's current FCM token on the user's profile so the
// send-booking-notification edge function can target push notifications at
// them. Best-effort by design (see callers) — failures here shouldn't block
// the rest of the app.
export async function updateFcmToken(userId: string, fcmToken: string): Promise<void> {
  const { error } = await supabase.from('users').update({ fcm_token: fcmToken }).eq('id', userId);
  if (error) {
    throw new Error(error.message);
  }
}
