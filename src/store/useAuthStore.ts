import type { ConfirmationResult, User } from '@react-native-firebase/auth';
import { create } from 'zustand';
import type { SupabaseUser } from '../types';

type AuthState = {
  // True only until the very first onAuthStateChanged callback fires (i.e.
  // while Firebase is checking for a restored session on cold start).
  initializing: boolean;
  firebaseUser: User | null;
  supabaseUser: SupabaseUser | null;
  // Held here rather than in navigation params — it carries methods, not
  // serializable data — between "OTP sent" and OtpScreen confirming it.
  confirmation: ConfirmationResult | null;
  setInitializing: (initializing: boolean) => void;
  setFirebaseUser: (user: User | null) => void;
  setSupabaseUser: (user: SupabaseUser | null) => void;
  setConfirmation: (confirmation: ConfirmationResult | null) => void;
};

export const useAuthStore = create<AuthState>(set => ({
  initializing: true,
  firebaseUser: null,
  supabaseUser: null,
  confirmation: null,
  setInitializing: initializing => set({ initializing }),
  setFirebaseUser: firebaseUser => set({ firebaseUser }),
  setSupabaseUser: supabaseUser => set({ supabaseUser }),
  setConfirmation: confirmation => set({ confirmation }),
}));
