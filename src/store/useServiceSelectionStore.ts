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
  selectTier: (tierId: string) => void;
  incrementAddon: (addonId: string) => void;
  decrementAddon: (addonId: string) => void;
  // Changing the date clears any chosen time, since a time picked on one day
  // may no longer be valid (or disabled) on another.
  selectDate: (date: string) => void;
  selectStartTime: (startTime: string, endTime: string | null) => void;
  // Arriving at ServiceDetail for a brand-new cart addition: always starts
  // blank, even if this service was configured before (e.g. adding the same
  // service to the cart a second time with a different slot).
  startNewSelection: (serviceId: string) => void;
  // Arriving at ServiceDetail to edit an existing cart item: loads its
  // choices verbatim in one atomic update.
  loadSelection: (selection: {
    serviceId: string;
    tierId: string;
    addonQuantities: Record<string, number>;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
};

export const useServiceSelectionStore = create<ServiceSelectionState>(set => ({
  serviceId: null,
  selectedTierId: null,
  addonQuantities: {},
  selectedDate: null,
  selectedStartTime: null,
  selectedEndTime: null,
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
  startNewSelection: serviceId =>
    set({
      serviceId,
      selectedTierId: null,
      addonQuantities: {},
      selectedDate: null,
      selectedStartTime: null,
      selectedEndTime: null,
    }),
  loadSelection: ({ serviceId, tierId, addonQuantities, date, startTime, endTime }) =>
    set({
      serviceId,
      selectedTierId: tierId,
      addonQuantities,
      selectedDate: date,
      selectedStartTime: startTime,
      selectedEndTime: endTime,
    }),
}));
