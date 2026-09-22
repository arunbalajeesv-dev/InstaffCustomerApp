import type { Addon } from '../types';
import { supabase } from './supabase';

export async function fetchAddons(): Promise<Addon[]> {
  const { data, error } = await supabase
    .from('addons')
    .select('id, name, description, price')
    .order('name');
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as Addon[];
}
