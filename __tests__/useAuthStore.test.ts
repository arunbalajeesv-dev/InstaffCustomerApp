/**
 * @format
 */

import { useAuthStore } from '../src/store/useAuthStore';

const initialState = useAuthStore.getState();

beforeEach(() => {
  useAuthStore.setState(initialState, true);
});

test('starts initializing, with no user or confirmation', () => {
  const state = useAuthStore.getState();
  expect(state.initializing).toBe(true);
  expect(state.firebaseUser).toBeNull();
  expect(state.supabaseUser).toBeNull();
  expect(state.confirmation).toBeNull();
});

test('setters update their own field independently', () => {
  const firebaseUser = { uid: 'fb-1', phoneNumber: '+919876543210' } as never;
  const supabaseUser = { id: 'user-1', contactName: 'Test Customer' };
  const confirmation = { confirm: jest.fn() } as never;

  useAuthStore.getState().setFirebaseUser(firebaseUser);
  useAuthStore.getState().setSupabaseUser(supabaseUser);
  useAuthStore.getState().setConfirmation(confirmation);
  useAuthStore.getState().setInitializing(false);

  const state = useAuthStore.getState();
  expect(state.firebaseUser).toBe(firebaseUser);
  expect(state.supabaseUser).toBe(supabaseUser);
  expect(state.confirmation).toBe(confirmation);
  expect(state.initializing).toBe(false);
});
