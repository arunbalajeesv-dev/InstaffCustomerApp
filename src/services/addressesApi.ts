import { supabase } from './supabase';

export async function createAddress(
  fullAddress: string,
  latitude: number,
  longitude: number,
  userId: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('addresses')
    .insert({ user_id: userId, full_address: fullAddress, latitude, longitude })
    .select('id')
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to save address');
  }
  return data.id as string;
}
