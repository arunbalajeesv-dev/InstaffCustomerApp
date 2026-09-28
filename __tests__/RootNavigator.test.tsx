/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { RootNavigator } from '../src/navigation/RootNavigator';
import { useAuthStore } from '../src/store/useAuthStore';

let authStateCallback: ((user: unknown) => void) | null = null;
const mockOnAuthStateChanged = jest.fn((_auth: unknown, callback: (user: unknown) => void) => {
  authStateCallback = callback;
  return () => {};
});

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: (...args: [unknown, (user: unknown) => void]) =>
    mockOnAuthStateChanged(...args),
}));

const mockFindOrCreateUserByPhone = jest.fn();
jest.mock('../src/services/usersApi', () => ({
  findOrCreateUserByPhone: (phone: string) => mockFindOrCreateUserByPhone(phone),
}));

const mockTrackAppOpen = jest.fn();
jest.mock('../src/services/analytics', () => ({
  trackAppOpen: () => mockTrackAppOpen(),
}));

const mockSetCurrentScreen = jest.fn();
jest.mock('../src/services/sentry', () => ({
  setCurrentScreen: (name: string) => mockSetCurrentScreen(name),
}));

const mockRegisterForPushNotifications = jest.fn();
jest.mock('../src/services/notifications', () => ({
  registerForPushNotifications: (userId: string) => mockRegisterForPushNotifications(userId),
}));

// Stubs: the point of this test is which stack gets chosen, not the real
// content of either — real screens would pull in Supabase calls etc.
jest.mock('../src/screens/LoginScreen', () => ({
  LoginScreen: () => require('react').createElement(require('react-native').Text, null, 'LOGIN_SCREEN'),
}));
jest.mock('../src/navigation/TabNavigator', () => ({
  TabNavigator: () => require('react').createElement(require('react-native').Text, null, 'TAB_NAVIGATOR'),
}));

const initialAuthState = useAuthStore.getState();
let currentTree: ReactTestRenderer.ReactTestRenderer | undefined;

beforeEach(() => {
  authStateCallback = null;
  mockOnAuthStateChanged.mockClear();
  mockFindOrCreateUserByPhone.mockReset();
  mockRegisterForPushNotifications.mockReset();
  mockTrackAppOpen.mockClear();
  mockSetCurrentScreen.mockClear();
  useAuthStore.setState(initialAuthState, true);
});

afterEach(() => {
  if (currentTree) {
    ReactTestRenderer.act(() => {
      currentTree!.unmount();
    });
    currentTree = undefined;
  }
});

test('shows a loading state until the first auth check resolves', async () => {
  await ReactTestRenderer.act(async () => {
    currentTree = ReactTestRenderer.create(<RootNavigator />);
  });

  const texts = currentTree!.root.findAllByType(Text).map(t => t.props.children);
  expect(texts).not.toContain('LOGIN_SCREEN');
  expect(texts).not.toContain('TAB_NAVIGATOR');
  expect(mockTrackAppOpen).toHaveBeenCalledTimes(1);
});

test('tags Sentry with the current screen once the navigator is ready', async () => {
  await ReactTestRenderer.act(async () => {
    currentTree = ReactTestRenderer.create(<RootNavigator />);
  });
  await ReactTestRenderer.act(async () => {
    authStateCallback!(null);
  });

  expect(mockSetCurrentScreen).toHaveBeenCalledWith('Login');
});

test('shows Login when no session is restored', async () => {
  await ReactTestRenderer.act(async () => {
    currentTree = ReactTestRenderer.create(<RootNavigator />);
  });

  await ReactTestRenderer.act(async () => {
    authStateCallback!(null);
  });

  const texts = currentTree!.root.findAllByType(Text).map(t => t.props.children);
  expect(texts).toContain('LOGIN_SCREEN');
  expect(mockFindOrCreateUserByPhone).not.toHaveBeenCalled();
});

test('shows the Tabs stack once a session and matching Supabase profile resolve', async () => {
  mockFindOrCreateUserByPhone.mockResolvedValue({ id: 'user-1', contactName: 'Test Customer' });

  await ReactTestRenderer.act(async () => {
    currentTree = ReactTestRenderer.create(<RootNavigator />);
  });

  await ReactTestRenderer.act(async () => {
    await authStateCallback!({ uid: 'fb-1', phoneNumber: '+919876543210' });
  });

  expect(mockFindOrCreateUserByPhone).toHaveBeenCalledWith('+919876543210');
  const texts = currentTree!.root.findAllByType(Text).map(t => t.props.children);
  expect(texts).toContain('TAB_NAVIGATOR');
  expect(texts).not.toContain('LOGIN_SCREEN');
  expect(mockRegisterForPushNotifications).toHaveBeenCalledWith('user-1');
});

test('falls back to Login if a session exists but the Supabase profile lookup fails', async () => {
  mockFindOrCreateUserByPhone.mockRejectedValue(new Error('network error'));

  await ReactTestRenderer.act(async () => {
    currentTree = ReactTestRenderer.create(<RootNavigator />);
  });

  await ReactTestRenderer.act(async () => {
    await authStateCallback!({ uid: 'fb-1', phoneNumber: '+919876543210' });
  });

  const texts = currentTree!.root.findAllByType(Text).map(t => t.props.children);
  expect(texts).toContain('LOGIN_SCREEN');
  expect(texts).not.toContain('TAB_NAVIGATOR');
  expect(mockRegisterForPushNotifications).not.toHaveBeenCalled();
});
