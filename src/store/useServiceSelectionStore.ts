import { create } from 'zustand';

type ServiceSelectionState = {
  serviceId: string | null;
  selectedTierId: string | null;
  addonQuantities: Record<string, number>;
  // Slot: chosen independently of the tier, but its end-time label depends on
  // the tier's duration, so callers recompute and pass it in on any change.
  selectedDate: string | null; // yyyy-mm-dd
  selectedStartTime: string | null; // e.g. "9:00 AM"
  selectedEndTime: string | null; // e.g. "12:00 PM"
  // Switching to a different service clears any in-progress selection;
  // re-entering the same one (e.g. back-then-forward) keeps it.
  selectService: (serviceId: string) => void;
  selectTier: (tierId: string) => void;
  incrementAddon: (addonId: string) => void;
  decrementAddon: (addonId: string) => void;
  // Changing the date clears any chosen time, since a time picked on one day
  // may no longer be valid (or disabled) on another.
  selectDate: (date: string) => void;
  selectStartTime: (startTime: string, endTime: string | null) => void;
};

export const useServiceSelectionStore = create<ServiceSelectionState>((set, get) => ({
  serviceId: null,
  selectedTierId: null,
  addonQuantities: {},
  selectedDate: null,
  selectedStartTime: null,
  selectedEndTime: null,
  selectService: serviceId => {
    if (get().serviceId === serviceId) {
      return;
    }
    set({
      serviceId,
      selectedTierId: null,
      addonQuantities: {},
      selectedDate: null,
      selectedStartTime: null,
      selectedEndTime: null,
    });
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
  selectDate: date =>
    set({ selectedDate: date, selectedStartTime: null, selectedEndTime: null }),
  selectStartTime: (startTime, endTime) =>
    set({ selectedStartTime: startTime, selectedEndTime: endTime }),
}));
