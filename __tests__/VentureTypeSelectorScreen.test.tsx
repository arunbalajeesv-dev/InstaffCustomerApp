/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { VentureTypeSelectorScreen } from '../src/screens/VentureTypeSelectorScreen';
import { VentureTypeCard } from '../src/components/VentureTypeCard';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({ params: { categoryName: 'Cleaning' } }),
}));

const ventureType = { id: 'vt-1', name: 'Retail', description: 'Shops and storefronts' };

jest.mock('../src/store/useVentureTypesStore', () => ({
  useVentureTypesStore: () => ({
    ventureTypes: [
      { id: 'vt-1', name: 'Retail', description: 'Shops and storefronts' },
    ],
    loading: false,
    error: null,
    loadVentureTypes: jest.fn(),
  }),
}));

test('tapping a venture type card navigates to ServiceList with category and venture type', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<VentureTypeSelectorScreen />);
  });

  const card = tree!.root.findByType(VentureTypeCard);
  await ReactTestRenderer.act(() => {
    card.props.onPress();
  });

  expect(mockNavigate).toHaveBeenCalledWith('ServiceList', {
    categoryName: 'Cleaning',
    ventureType,
  });
});
