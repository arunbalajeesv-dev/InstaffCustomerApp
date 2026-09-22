import type { ScopeItem } from '../types';
import { supabase } from './supabase';

export async function fetchScopeItems(serviceId: string): Promise<ScopeItem[]> {
  const { data, error } = await supabase
    .from('service_scope_items')
    .select('id, serviceId:service_id, description:item_text, isIncluded:is_included')
    .eq('service_id', serviceId);
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as ScopeItem[];
}
