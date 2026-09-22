import type { VentureType } from '../types';
import { supabase } from './supabase';

export async function fetchVentureTypes(): Promise<VentureType[]> {
  // Select '*' rather than naming columns: unlike "services", this table's
  // exact schema hasn't been confirmed, so we only rely on id/name existing
  // and read everything else defensively.
  const { data, error } = await supabase.from('venture_types').select('*').order('name');
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? null,
  }));
}
