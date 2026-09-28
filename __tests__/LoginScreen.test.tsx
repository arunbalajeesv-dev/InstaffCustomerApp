/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert, Text } from 'react-native';
import { LoginScreen } from '../src/screens/LoginScreen';
import { useAuthStore } from '../src/store/useAuthStore';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const mockGetAuth = jest.fn(() => ({ authInstance: true }));
const mockSignInWithPhoneNumber = jest.fn();
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: () => mockGetAuth(),
  signInWithPhoneNumber: (...args: unknown[]) => mockSignInWithPhoneNumber(...args),
}));

const initialAuthState = useAuthStore.getState();
let currentTree: ReactTestRenderer.ReactTestRenderer | undefined;

beforeEach(() => {
  mockNavigate.mockClear();
  mockGetAuth.mockClear();
  mockSignInWithPhoneNumber.mockReset();
  useAuthStore.setState(initialAuthState, true);
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
    currentTree = ReactTestRenderer.create(<LoginScreen />);
  });
  return currentTree!;
}

test('shows a validation error and does not send when submitted empty', async () => {
  const tree = render();

  await ReactTestRenderer.act(() => {
    tree.root.findByProps({ testID: 'sendOtpButton' }).props.onPress();
  });

  const errorText = tree.root.findAllByType(Text).map(t => t.props.children);
  expect(errorText).toContain('Please enter your phone number');
  expect(mockSignInWithPhoneNumber).not.toHaveBeenCalled();
});

test('sends the code to +<country code><digits>, stores the confirmation, and navigates to Otp', async () => {
  const confirmation = { confirm: jest.fn() };
  mockSignInWithPhoneNumber.mockResolvedValue(confirmation);
  const tree = render();

  const phoneInput = tree.root.findByProps({ testID: 'phoneInput' });
  await ReactTestRenderer.act(() => {
    phoneInput.props.onChangeText('9876543210');
  });

  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'sendOtpButton' }).props.onPress();
  });

  expect(mockSignInWithPhoneNumber).toHaveBeenCalledWith(
    expect.anything(),
    '+919876543210',
  );
  expect(useAuthStore.getState().confirmation).toBe(confirmation);
  expect(mockNavigate).toHaveBeenCalledWith('Otp', { phone: '+919876543210' });
});

test('respects an edited country code', async () => {
  mockSignInWithPhoneNumber.mockResolvedValue({ confirm: jest.fn() });
  const tree = render();

  const countryCodeInput = tree.root.findByProps({ testID: 'countryCodeInput' });
  await ReactTestRenderer.act(() => {
    countryCodeInput.props.onChangeText('+1');
  });
  const phoneInput = tree.root.findByProps({ testID: 'phoneInput' });
  await ReactTestRenderer.act(() => {
    phoneInput.props.onChangeText('6505551234');
  });

  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'sendOtpButton' }).props.onPress();
  });

  expect(mockSignInWithPhoneNumber).toHaveBeenCalledWith(expect.anything(), '+16505551234');
});

test('shows an alert and does not navigate if sending the code fails', async () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockSignInWithPhoneNumber.mockRejectedValue(new Error('Invalid phone number'));
  const tree = render();

  const phoneInput = tree.root.findByProps({ testID: 'phoneInput' });
  await ReactTestRenderer.act(() => {
    phoneInput.props.onChangeText('9876543210');
  });

  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'sendOtpButton' }).props.onPress();
  });

  expect(alertSpy).toHaveBeenCalledWith("Couldn't send code", 'Invalid phone number');
  expect(mockNavigate).not.toHaveBeenCalled();
});

test('strips non-digit characters typed into the phone field before sending', async () => {
  mockSignInWithPhoneNumber.mockResolvedValue({ confirm: jest.fn() });
  const tree = render();

  const phoneInput = tree.root.findByProps({ testID: 'phoneInput' });
  await ReactTestRenderer.act(() => {
    phoneInput.props.onChangeText('(987) 654-3210');
  });

  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'sendOtpButton' }).props.onPress();
  });

  expect(mockSignInWithPhoneNumber).toHaveBeenCalledWith(expect.anything(), '+919876543210');
});
