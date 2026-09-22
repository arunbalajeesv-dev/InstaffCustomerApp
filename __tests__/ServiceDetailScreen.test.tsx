/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { ServiceDetailScreen } from '../src/screens/ServiceDetailScreen';
import { TierSelector } from '../src/components/TierSelector';
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

beforeEach(() => {
  useServiceSelectionStore.setState(initialSelectionState, true);
});

test('Add to Cart is disabled until a facility size is selected, then total updates live', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ServiceDetailScreen />
      </SafeAreaProvider>,
    );
  });

  const cartButton = () => tree!.root.findByProps({ testID: 'addToCartButton' });
  const totalValue = () => tree!.root.findByProps({ testID: 'totalValue' }).props.children;

  expect(cartButton().props.disabled).toBe(true);
  expect(totalValue()).toBe('₹0');

  const tierSelector = tree!.root.findByType(TierSelector);
  await ReactTestRenderer.act(() => {
    tierSelector.props.onSelect('tier-small');
  });

  expect(cartButton().props.disabled).toBe(false);
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
