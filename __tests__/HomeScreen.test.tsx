/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { HomeScreen } from '../src/screens/HomeScreen';
import { CategoryCard } from '../src/components/CategoryCard';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../src/store/useAppStore', () => ({
  useAppStore: (selector: (s: { businessName: string }) => unknown) =>
    selector({ businessName: 'Test Business' }),
}));

jest.mock('../src/store/useServicesStore', () => ({
  useServicesStore: () => ({
    categories: [
      {
        name: 'Cleaning',
        services: [{ id: '1', name: 'Opening Cleaning', category: 'Cleaning' }],
      },
    ],
    loading: false,
    error: null,
    loadServices: jest.fn(),
  }),
}));

test('tapping a category card navigates to VentureTypeSelector with the category name', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<HomeScreen />);
  });

  const card = tree!.root.findByType(CategoryCard);
  await ReactTestRenderer.act(() => {
    card.props.onPress();
  });

  expect(mockNavigate).toHaveBeenCalledWith('VentureTypeSelector', {
    categoryName: 'Cleaning',
  });
});
