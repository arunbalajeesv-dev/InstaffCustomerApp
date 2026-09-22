/**
 * @format
 */

import { useServiceSelectionStore } from '../src/store/useServiceSelectionStore';

const initialState = useServiceSelectionStore.getState();

beforeEach(() => {
  useServiceSelectionStore.setState(initialState, true);
});

test('selectService resets the selection when switching to a different service', () => {
  const { selectService, selectTier, incrementAddon } = useServiceSelectionStore.getState();

  selectService('service-a');
  selectTier('tier-1');
  incrementAddon('addon-1');

  expect(useServiceSelectionStore.getState().selectedTierId).toBe('tier-1');
  expect(useServiceSelectionStore.getState().addonQuantities).toEqual({ 'addon-1': 1 });

  useServiceSelectionStore.getState().selectService('service-b');

  const state = useServiceSelectionStore.getState();
  expect(state.serviceId).toBe('service-b');
  expect(state.selectedTierId).toBeNull();
  expect(state.addonQuantities).toEqual({});
});

test('selectService is a no-op when re-selecting the same service', () => {
  const { selectService, selectTier } = useServiceSelectionStore.getState();
  selectService('service-a');
  selectTier('tier-1');

  useServiceSelectionStore.getState().selectService('service-a');

  expect(useServiceSelectionStore.getState().selectedTierId).toBe('tier-1');
});

test('incrementAddon and decrementAddon track quantity, removing the key at zero', () => {
  const { incrementAddon, decrementAddon } = useServiceSelectionStore.getState();

  incrementAddon('addon-1');
  incrementAddon('addon-1');
  expect(useServiceSelectionStore.getState().addonQuantities).toEqual({ 'addon-1': 2 });

  decrementAddon('addon-1');
  expect(useServiceSelectionStore.getState().addonQuantities).toEqual({ 'addon-1': 1 });

  decrementAddon('addon-1');
  expect(useServiceSelectionStore.getState().addonQuantities).toEqual({});
});
