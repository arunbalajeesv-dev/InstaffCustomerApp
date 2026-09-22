/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { ServiceDetailScreen } from '../src/screens/ServiceDetailScreen';
import { TierSelector } from '../src/components/TierSelector';
import { TimeSlotGrid } from '../src/components/TimeSlotGrid';
import { AddonCard } from '../src/components/AddonCard';
import { useServiceSelectionStore } from '../src/store/useServiceSelectionStore';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({
    params: {
      service: { id: 'svc-1', name: 'Opening/Closing Cleaning', category: 'Cleaning' },
    },
  }),
}));

const tiers = [
  { id: 'tier-small', serviceId: 'svc-1', facilitySize: 'Small', professionals: 2, durationHours: 2, price: 1500 },
  { id: 'tier-large', serviceId: 'svc-1', facilitySize: 'Large', professionals: 4, durationHours: 4, price: 3000 },
];
const addons = [{ id: 'addon-1', name: 'Deep Clean Extra', price: 500 }];

jest.mock('../src/store/useServiceDetailStore', () => ({
  useServiceDetailStore: () => ({
    tiers,
    scopeItems: [],
    addons,
    loading: false,
    error: null,
    load: jest.fn(),
  }),
}));

const initialSelectionState = useServiceSelectionStore.getState();

// Fixed "now" so which time slots are disabled (<2h away) is deterministic:
// 10:00 AM means 6–11 AM are disabled and 12 PM onward are not.
const NOW = new Date(2024, 0, 15, 10, 0, 0);

let currentTree: ReactTestRenderer.ReactTestRenderer | undefined;

beforeEach(() => {
  useServiceSelectionStore.setState(initialSelectionState, true);
  jest.useFakeTimers().setSystemTime(NOW);
});

afterEach(() => {
  currentTree?.unmount();
  currentTree = undefined;
  jest.useRealTimers();
});

test('Add to Cart is disabled until a facility size is selected, then total updates live', async () => {
  await ReactTestRenderer.act(() => {
    currentTree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ServiceDetailScreen />
      </SafeAreaProvider>,
    );
  });
  const tree = currentTree;

  const cartButton = () => tree!.root.findByProps({ testID: 'addToCartButton' });
  const totalValue = () => tree!.root.findByProps({ testID: 'totalValue' }).props.children;

  expect(cartButton().props.disabled).toBe(true);
  expect(totalValue()).toBe('₹0');

  const tierSelector = tree!.root.findByType(TierSelector);
  await ReactTestRenderer.act(() => {
    tierSelector.props.onSelect('tier-small');
  });

  expect(totalValue()).toBe('₹1,500');

  const addonCard = tree!.root.findByType(AddonCard);
  await ReactTestRenderer.act(() => {
    addonCard.props.onIncrement();
  });
  await ReactTestRenderer.act(() => {
    addonCard.props.onIncrement();
  });

  // tier (1500) + 2 x add-on (500) = 2500
  expect(totalValue()).toBe('₹2,500');

  await ReactTestRenderer.act(() => {
    tierSelector.props.onSelect('tier-large');
  });

  // tier (3000) + 2 x add-on (500) = 4000
  expect(totalValue()).toBe('₹4,000');
});

test('a slot is required in addition to a facility size before Add to Cart enables', async () => {
  await ReactTestRenderer.act(() => {
    currentTree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ServiceDetailScreen />
      </SafeAreaProvider>,
    );
  });
  const tree = currentTree;

  const cartButton = () => tree!.root.findByProps({ testID: 'addToCartButton' });
  const tierSelector = tree!.root.findByType(TierSelector);
  const timeGrid = () => tree!.root.findByType(TimeSlotGrid);

  // Today auto-selects; 6–11 AM are within 2 hours of the fixed "now"
  // (10:00 AM) and should be disabled, 12 PM onward should not be.
  expect(timeGrid().props.disabledMinutes.has(6 * 60)).toBe(true);
  expect(timeGrid().props.disabledMinutes.has(11 * 60)).toBe(true);
  expect(timeGrid().props.disabledMinutes.has(12 * 60)).toBe(false);

  await ReactTestRenderer.act(() => {
    tierSelector.props.onSelect('tier-small'); // 2-hour duration
  });
  expect(cartButton().props.disabled).toBe(true); // tier alone isn't enough

  await ReactTestRenderer.act(() => {
    timeGrid().props.onSelect(12 * 60); // 12:00 PM
  });

  expect(cartButton().props.disabled).toBe(false);
  const summary = tree!.root.findByProps({ testID: 'slotSummary' }).props.children;
  expect(summary).toBe('Your shift will run 12:00 PM – 2:00 PM');
});
