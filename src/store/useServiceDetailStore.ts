import { create } from 'zustand';
import { fetchAddons } from '../services/addonsApi';
import { fetchPricingTiers } from '../services/pricingApi';
import { fetchScopeItems } from '../services/scopeItemsApi';
import type { Addon, PricingTier, ScopeItem } from '../types';

type ServiceDetailState = {
  tiers: PricingTier[];
  scopeItems: ScopeItem[];
  addons: Addon[];
  loading: boolean;
  error: string | null;
  load: (serviceId: string) => Promise<void>;
};

export const useServiceDetailStore = create<ServiceDetailState>(set => ({
  tiers: [],
  scopeItems: [],
  addons: [],
  loading: false,
  error: null,
  load: async serviceId => {
    set({ loading: true, error: null });
    try {
      const [tiers, scopeItems, addons] = await Promise.all([
        fetchPricingTiers(serviceId),
        fetchScopeItems(serviceId),
        fetchAddons(serviceId),
      ]);
      set({ tiers, scopeItems, addons, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load service details',
      });
    }
  },
}));
