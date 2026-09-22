import type { Service, ServiceCategory } from '../types';
import { supabase } from './supabase';

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, category, description')
    .eq('active', true)
    .order('name');
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as Service[];
}

export function groupByCategory(services: Service[]): ServiceCategory[] {
  const map = new Map<string, Service[]>();
  for (const service of services) {
    const name = service.category?.trim() || 'Other';
    map.set(name, [...(map.get(name) ?? []), service]);
  }
  return [...map.entries()]
    .map(([name, items]) => ({ name, services: items }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
