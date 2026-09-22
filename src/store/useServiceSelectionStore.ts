import { create } from 'zustand';

type ServiceSelectionState = {
  serviceId: string | null;
  selectedTierId: string | null;
  addonQuantities: Record<string, number>;
  // Switching to a different service clears any in-progress selection;
  // re-entering the same one (e.g. back-then-forward) keeps it.
  selectService: (serviceId: string) => void;
  selectTier: (tierId: string) => void;
  incrementAddon: (addonId: string) => void;
  decrementAddon: (addonId: string) => void;
};

export const useServiceSelectionStore = create<ServiceSelectionState>((set, get) => ({
  serviceId: null,
  selectedTierId: null,
  addonQuantities: {},
  selectService: serviceId => {
    if (get().serviceId === serviceId) {
      return;
    }
    set({ serviceId, selectedTierId: null, addonQuantities: {} });
  },
  selectTier: tierId => set({ selectedTierId: tierId }),
  incrementAddon: addonId =>
    set(state => ({
      addonQuantities: {
        ...state.addonQuantities,
        [addonId]: (state.addonQuantities[addonId] ?? 0) + 1,
      },
    })),
  decrementAddon: addonId =>
    set(state => {
      const current = state.addonQuantities[addonId] ?? 0;
      if (current <= 1) {
        const rest = { ...state.addonQuantities };
        delete rest[addonId];
        return { addonQuantities: rest };
      }
      return { addonQuantities: { ...state.addonQuantities, [addonId]: current - 1 } };
    }),
}));
