/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ServiceListScreen } from '../src/screens/ServiceListScreen';
import { ServiceCard } from '../src/components/ServiceCard';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({
    params: {
      categoryName: 'Cleaning',
      ventureType: { id: 'vt-1', name: 'Retail' },
    },
  }),
}));

const service = {
  id: 'svc-1',
  name: 'Opening/Closing Cleaning',
  category: 'Cleaning',
  description: 'Pre-opening or post-closing cleaning.',
};

jest.mock('../src/store/useServiceListStore', () => ({
  useServiceListStore: () => ({
    services: [service],
    lowestPrices: { 'svc-1': 2500 },
    loading: false,
    error: null,
    load: jest.fn(),
  }),
}));

test('tapping a service card navigates to ServiceDetail with the service', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<ServiceListScreen />);
  });

  const card = tree!.root.findByType(ServiceCard);
  await ReactTestRenderer.act(() => {
    card.props.onPress();
  });

  expect(mockNavigate).toHaveBeenCalledWith('ServiceDetail', { service });
});
