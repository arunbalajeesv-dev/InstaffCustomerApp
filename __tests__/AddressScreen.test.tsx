/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert, Text, TextInput } from 'react-native';
import { AddressScreen } from '../src/screens/AddressScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

const mockCreateAddress = jest.fn();
jest.mock('../src/services/addressesApi', () => ({
  createAddress: (address: string) => mockCreateAddress(address),
}));

let currentTree: ReactTestRenderer.ReactTestRenderer | undefined;

beforeEach(() => {
  mockNavigate.mockClear();
  mockCreateAddress.mockReset();
});

afterEach(() => {
  if (currentTree) {
    ReactTestRenderer.act(() => {
      currentTree!.unmount();
    });
    currentTree = undefined;
  }
  jest.restoreAllMocks();
});

function render() {
  ReactTestRenderer.act(() => {
    currentTree = ReactTestRenderer.create(<AddressScreen />);
  });
  return currentTree!;
}

test('shows a validation error and does not save when submitted empty', async () => {
  const tree = render();

  await ReactTestRenderer.act(() => {
    tree.root.findByProps({ testID: 'continueButton' }).props.onPress();
  });

  const errorText = tree.root.findAllByType(Text).map(t => t.props.children);
  expect(errorText).toContain('Please enter an address');
  expect(mockCreateAddress).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
});

test('saves the address and navigates to Payment with its id', async () => {
  mockCreateAddress.mockResolvedValue('address-123');
  const tree = render();

  const input = tree.root.findByType(TextInput);
  await ReactTestRenderer.act(() => {
    input.props.onChangeText('221B Baker Street');
  });

  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'continueButton' }).props.onPress();
  });

  expect(mockCreateAddress).toHaveBeenCalledWith('221B Baker Street');
  expect(mockNavigate).toHaveBeenCalledWith('Payment', { addressId: 'address-123' });
});

test('shows an alert and does not navigate if saving the address fails', async () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockCreateAddress.mockRejectedValue(new Error('Network error'));
  const tree = render();

  const input = tree.root.findByType(TextInput);
  await ReactTestRenderer.act(() => {
    input.props.onChangeText('221B Baker Street');
  });

  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'continueButton' }).props.onPress();
  });

  expect(alertSpy).toHaveBeenCalledWith("Couldn't save address", 'Network error');
  expect(mockNavigate).not.toHaveBeenCalled();
});
