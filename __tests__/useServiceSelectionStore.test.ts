/**
 * @format
 */

import { useServiceSelectionStore } from '../src/store/useServiceSelectionStore';

const initialState = useServiceSelectionStore.getState();

beforeEach(() => {
  useServiceSelectionStore.setState(initialState, true);
});

test('selectService resets the selection when switching to a different service', () => {
  const { selectService, selectTier, incrementAddon, selectDate, selectStartTime } =
    useServiceSelectionStore.getState();

  selectService('service-a');
  selectTier('tier-1');
  incrementAddon('addon-1');
  selectDate('2024-01-15');
  selectStartTime('9:00 AM', '11:00 AM');

  expect(useServiceSelectionStore.getState().selectedTierId).toBe('tier-1');
  expect(useServiceSelectionStore.getState().addonQuantities).toEqual({ 'addon-1': 1 });
  expect(useServiceSelectionStore.getState().selectedStartTime).toBe('9:00 AM');

  useServiceSelectionStore.getState().selectService('service-b');

  const state = useServiceSelectionStore.getState();
  expect(state.serviceId).toBe('service-b');
  expect(state.selectedTierId).toBeNull();
  expect(state.addonQuantities).toEqual({});
  expect(state.selectedDate).toBeNull();
  expect(state.selectedStartTime).toBeNull();
  expect(state.selectedEndTime).toBeNull();
});

test('selectDate stores the date and clears any previously chosen time', () => {
  const { selectStartTime, selectDate } = useServiceSelectionStore.getState();

  selectDate('2024-01-15');
  selectStartTime('9:00 AM', '11:00 AM');
  expect(useServiceSelectionStore.getState().selectedStartTime).toBe('9:00 AM');

  selectDate('2024-01-16');

  const state = useServiceSelectionStore.getState();
  expect(state.selectedDate).toBe('2024-01-16');
  expect(state.selectedStartTime).toBeNull();
  expect(state.selectedEndTime).toBeNull();
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
