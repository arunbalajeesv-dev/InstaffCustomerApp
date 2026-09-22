/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { CartScreen } from '../src/screens/CartScreen';
import { CartItemCard } from '../src/components/CartItemCard';
import { useCartStore } from '../src/store/useCartStore';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

const service = { id: 'svc-1', name: 'Opening/Closing Cleaning', category: 'Cleaning' };
const tier = {
  id: 'tier-small',
  serviceId: 'svc-1',
  facilitySize: 'Small',
  professionals: 2,
  durationHours: 2,
  price: 1500,
};
const addon = { id: 'addon-1', name: 'Deep Clean Extra', price: 500 };

const item = {
  service,
  tier,
  addons: [{ addon, quantity: 2 }],
  date: '2024-01-15',
  dateDisplay: 'Mon, Jan 15',
  startTime: '9:00 AM',
  endTime: '11:00 AM',
  linePrice: 2500, // 1500 tier + 2x500 addon
};

let currentTree: ReactTestRenderer.ReactTestRenderer | undefined;

beforeEach(() => {
  mockNavigate.mockClear();
  useCartStore.setState({ items: [] });
});

afterEach(() => {
  if (currentTree) {
    ReactTestRenderer.act(() => {
      currentTree!.unmount();
    });
    currentTree = undefined;
  }
});

function render() {
  ReactTestRenderer.act(() => {
    currentTree = ReactTestRenderer.create(<CartScreen />);
  });
  return currentTree!;
}

test('shows an empty state with no summary when the cart has no items', () => {
  const tree = render();
  const texts = tree.root.findAllByType(Text).map(t => t.props.children);
  expect(texts).toContain('Your cart is empty.');
  expect(tree.root.findAllByProps({ testID: 'proceedButton' })).toHaveLength(0);
});

test('lists items and computes subtotal, platform fee, GST and total', () => {
  useCartStore.getState().addItem(item);
  const tree = render();

  // subtotal 2500, platform fee 49, GST 18% of 2500 = 450, total = 2999
  const total = tree.root.findByProps({ testID: 'cartTotalValue' }).props.children;
  expect(total).toBe('₹2,999');
});

test('tapping an item navigates to ServiceDetail in edit mode', () => {
  const id = useCartStore.getState().addItem(item);
  const tree = render();

  ReactTestRenderer.act(() => {
    tree.root.findByType(CartItemCard).props.onPress();
  });

  expect(mockNavigate).toHaveBeenCalledWith('ServiceDetail', {
    service,
    editCartItemId: id,
  });
});

test('removing an item takes it out of the cart', () => {
  useCartStore.getState().addItem(item);
  const tree = render();

  ReactTestRenderer.act(() => {
    tree.root.findByType(CartItemCard).props.onRemove();
  });

  expect(useCartStore.getState().items).toHaveLength(0);
});

test('Proceed navigates to the Address screen', () => {
  useCartStore.getState().addItem(item);
  const tree = render();

  ReactTestRenderer.act(() => {
    tree.root.findByProps({ testID: 'proceedButton' }).props.onPress();
  });

  expect(mockNavigate).toHaveBeenCalledWith('Address');
});
