/**
 * @format
 */

import { useServiceSelectionStore } from '../src/store/useServiceSelectionStore';

const initialState = useServiceSelectionStore.getState();

beforeEach(() => {
  useServiceSelectionStore.setState(initialState, true);
});

test('startNewSelection always starts blank, even re-selecting the same service', () => {
  const { startNewSelection, selectTier, incrementAddon, selectDate, selectStartTime } =
    useServiceSelectionStore.getState();

  startNewSelection('service-a');
  selectTier('tier-1');
  incrementAddon('addon-1');
  selectDate('2024-01-15');
  selectStartTime('9:00 AM', '11:00 AM');

  expect(useServiceSelectionStore.getState().selectedTierId).toBe('tier-1');
  expect(useServiceSelectionStore.getState().addonQuantities).toEqual({ 'addon-1': 1 });
  expect(useServiceSelectionStore.getState().selectedStartTime).toBe('9:00 AM');

  // Re-adding the same service (e.g. a second cart entry for it) starts blank
  // rather than carrying over the previous entry's in-progress selection.
  useServiceSelectionStore.getState().startNewSelection('service-a');

  const state = useServiceSelectionStore.getState();
  expect(state.serviceId).toBe('service-a');
  expect(state.selectedTierId).toBeNull();
  expect(state.addonQuantities).toEqual({});
  expect(state.selectedDate).toBeNull();
  expect(state.selectedStartTime).toBeNull();
  expect(state.selectedEndTime).toBeNull();
});

test('loadSelection restores a full selection atomically, for editing a cart item', () => {
  useServiceSelectionStore.getState().loadSelection({
    serviceId: 'service-a',
    tierId: 'tier-1',
    addonQuantities: { 'addon-1': 2 },
    date: '2024-01-16',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
  });

  const state = useServiceSelectionStore.getState();
  expect(state.serviceId).toBe('service-a');
  expect(state.selectedTierId).toBe('tier-1');
  expect(state.addonQuantities).toEqual({ 'addon-1': 2 });
  expect(state.selectedDate).toBe('2024-01-16');
  expect(state.selectedStartTime).toBe('10:00 AM');
  expect(state.selectedEndTime).toBe('12:00 PM');
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
