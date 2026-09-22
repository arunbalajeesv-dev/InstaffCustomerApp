/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { BookingConfirmationScreen } from '../src/screens/BookingConfirmationScreen';

const mockReset = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ reset: mockReset }),
  useRoute: () => ({ params: { bookingId: 'booking-456', total: 1819 } }),
}));

test('shows the booking id and amount, and Done resets the stack back to Tabs', () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<BookingConfirmationScreen />);
  });

  const texts = tree!.root.findAllByType(require('react-native').Text).map(t => t.props.children);
  expect(texts).toContain('booking-456');
  expect(texts).toContain('₹1,819');

  ReactTestRenderer.act(() => {
    tree!.root.findByProps({ testID: 'doneButton' }).props.onPress();
  });

  expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Tabs' }] });
});
