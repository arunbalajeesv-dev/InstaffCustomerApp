import { create } from 'zustand';
import { fetchLowestPrices } from '../services/pricingApi';
import { fetchServicesByVentureType } from '../services/servicesApi';
import type { Service } from '../types';

type ServiceListState = {
  services: Service[];
  lowestPrices: Record<string, number>;
  loading: boolean;
  error: string | null;
  load: (categoryName: string, ventureTypeId: string) => Promise<void>;
};

export const useServiceListStore = create<ServiceListState>(set => ({
  services: [],
  lowestPrices: {},
  loading: false,
  error: null,
  load: async (categoryName, ventureTypeId) => {
    set({ loading: true, error: null });
    try {
      const services = await fetchServicesByVentureType(categoryName, ventureTypeId);
      const lowestPrices = await fetchLowestPrices(services.map(s => s.id));
      set({ services, lowestPrices, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load services',
      });
    }
  },
}));
