import { create } from 'zustand';
import { fetchServices, groupByCategory } from '../services/servicesApi';
import type { ServiceCategory } from '../types';

type ServicesState = {
  categories: ServiceCategory[];
  loading: boolean;
  error: string | null;
  loadServices: () => Promise<void>;
};

export const useServicesStore = create<ServicesState>(set => ({
  categories: [],
  loading: false,
  error: null,
  loadServices: async () => {
    set({ loading: true, error: null });
    try {
      const services = await fetchServices();
      set({ categories: groupByCategory(services), loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load services',
      });
    }
  },
}));
