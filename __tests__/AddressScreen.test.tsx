/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert, Text, TextInput } from 'react-native';
import { AddressScreen } from '../src/screens/AddressScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
}));

let currentTree: ReactTestRenderer.ReactTestRenderer | undefined;

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

test('shows a validation error and does not alert when submitted empty', async () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const tree = render();

  await ReactTestRenderer.act(() => {
    tree.root.findByProps({ testID: 'continueButton' }).props.onPress();
  });

  const errorText = tree.root.findAllByType(Text).map(t => t.props.children);
  expect(errorText).toContain('Please enter an address');
  expect(alertSpy).not.toHaveBeenCalled();
});

test('submits successfully once an address is entered', async () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const tree = render();

  const input = tree.root.findByType(TextInput);
  await ReactTestRenderer.act(() => {
    input.props.onChangeText('221B Baker Street');
  });

  await ReactTestRenderer.act(() => {
    tree.root.findByProps({ testID: 'continueButton' }).props.onPress();
  });

  expect(alertSpy).toHaveBeenCalledWith(
    'Address saved',
    expect.stringContaining('221B Baker Street'),
  );
});
