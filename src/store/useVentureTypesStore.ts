import { create } from 'zustand';
import { fetchVentureTypes } from '../services/ventureTypesApi';
import type { VentureType } from '../types';

type VentureTypesState = {
  ventureTypes: VentureType[];
  loading: boolean;
  error: string | null;
  loadVentureTypes: () => Promise<void>;
};

export const useVentureTypesStore = create<VentureTypesState>(set => ({
  ventureTypes: [],
  loading: false,
  error: null,
  loadVentureTypes: async () => {
    set({ loading: true, error: null });
    try {
      const ventureTypes = await fetchVentureTypes();
      set({ ventureTypes, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load venture types',
      });
    }
  },
}));
