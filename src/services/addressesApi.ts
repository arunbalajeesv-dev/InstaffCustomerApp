import { TEST_USER_ID } from '../config/testUser';
import { supabase } from './supabase';

export async function createAddress(fullAddress: string): Promise<string> {
  const { data, error } = await supabase
    .from('addresses')
    .insert({ user_id: TEST_USER_ID, full_address: fullAddress })
    .select('id')
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to save address');
  }
  return data.id as string;
}
