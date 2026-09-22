import { create } from 'zustand';

type AppState = {
  isReady: boolean;
  businessName: string;
  setReady: (isReady: boolean) => void;
  setBusinessName: (businessName: string) => void;
};

export const useAppStore = create<AppState>(set => ({
  isReady: false,
  // TODO: replace with the signed-in customer's business once auth exists.
  businessName: 'My Business',
  setReady: isReady => set({ isReady }),
  setBusinessName: businessName => set({ businessName }),
}));
