/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert, Text, TextInput } from 'react-native';
import { AddressScreen } from '../src/screens/AddressScreen';
import { useAuthStore } from '../src/store/useAuthStore';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

const mockCreateAddress = jest.fn();
jest.mock('../src/services/addressesApi', () => ({
  createAddress: (fullAddress: string, latitude: number, longitude: number, userId: string) =>
    mockCreateAddress(fullAddress, latitude, longitude, userId),
}));

const mockAutocompletePlaces = jest.fn();
const mockGetPlaceDetails = jest.fn();
jest.mock('../src/services/placesApi', () => ({
  autocompletePlaces: (input: string, sessionToken: string) =>
    mockAutocompletePlaces(input, sessionToken),
  getPlaceDetails: (placeId: string, sessionToken: string) =>
    mockGetPlaceDetails(placeId, sessionToken),
  createSessionToken: () => 'session-token',
}));

const initialAuthState = useAuthStore.getState();
let currentTree: ReactTestRenderer.ReactTestRenderer | undefined;

beforeEach(() => {
  jest.useFakeTimers();
  mockNavigate.mockClear();
  mockCreateAddress.mockReset();
  mockAutocompletePlaces.mockReset();
  mockGetPlaceDetails.mockReset();
  useAuthStore.setState(
    { ...initialAuthState, supabaseUser: { id: 'user-1', contactName: 'Test Customer' } },
    true,
  );
});

afterEach(() => {
  if (currentTree) {
    ReactTestRenderer.act(() => {
      currentTree!.unmount();
    });
    currentTree = undefined;
  }
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function render() {
  ReactTestRenderer.act(() => {
    currentTree = ReactTestRenderer.create(<AddressScreen />);
  });
  return currentTree!;
}

async function typeAndDebounce(tree: ReactTestRenderer.ReactTestRenderer, text: string) {
  const input = tree.root.findByType(TextInput);
  await ReactTestRenderer.act(() => {
    input.props.onChangeText(text);
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(300);
  });
}

test('shows a validation error and does not save when submitted without a selection', async () => {
  const tree = render();

  await ReactTestRenderer.act(() => {
    tree.root.findByProps({ testID: 'continueButton' }).props.onPress();
  });

  const errorText = tree.root.findAllByType(Text).map(t => t.props.children);
  expect(errorText).toContain('Please select an address from the suggestions');
  expect(mockCreateAddress).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
});

test('does not search until at least 3 characters are typed', async () => {
  const tree = render();

  await typeAndDebounce(tree, 'MG');

  expect(mockAutocompletePlaces).not.toHaveBeenCalled();
});

test('fetches suggestions after debouncing and renders them', async () => {
  mockAutocompletePlaces.mockResolvedValue([
    { placeId: 'place-1', description: 'MG Road, Bengaluru', mainText: 'MG Road', secondaryText: 'Bengaluru' },
  ]);
  const tree = render();

  await typeAndDebounce(tree, 'MG Road');

  expect(mockAutocompletePlaces).toHaveBeenCalledWith('MG Road', 'session-token');
  const row = tree.root.findByProps({ testID: 'suggestion-0' });
  expect(row).toBeTruthy();
});

test('selecting a suggestion fetches place details and shows the resolved address', async () => {
  mockAutocompletePlaces.mockResolvedValue([
    { placeId: 'place-1', description: 'MG Road, Bengaluru', mainText: 'MG Road', secondaryText: 'Bengaluru' },
  ]);
  mockGetPlaceDetails.mockResolvedValue({
    formattedAddress: 'MG Road, Bengaluru, Karnataka 560001',
    latitude: 12.9752,
    longitude: 77.6065,
  });
  const tree = render();

  await typeAndDebounce(tree, 'MG Road');

  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'suggestion-0' }).props.onPress();
  });

  expect(mockGetPlaceDetails).toHaveBeenCalledWith('place-1', 'session-token');
  const selected = tree.root.findByProps({ testID: 'selectedAddress' });
  const texts = selected.findAllByType(Text).map(t => t.props.children);
  expect(texts).toContain('MG Road, Bengaluru, Karnataka 560001');
});

test('saves the selected place and navigates to Payment with its id', async () => {
  mockAutocompletePlaces.mockResolvedValue([
    { placeId: 'place-1', description: 'MG Road, Bengaluru', mainText: 'MG Road', secondaryText: 'Bengaluru' },
  ]);
  mockGetPlaceDetails.mockResolvedValue({
    formattedAddress: 'MG Road, Bengaluru, Karnataka 560001',
    latitude: 12.9752,
    longitude: 77.6065,
  });
  mockCreateAddress.mockResolvedValue('address-123');
  const tree = render();

  await typeAndDebounce(tree, 'MG Road');
  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'suggestion-0' }).props.onPress();
  });

  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'continueButton' }).props.onPress();
  });

  expect(mockCreateAddress).toHaveBeenCalledWith(
    'MG Road, Bengaluru, Karnataka 560001',
    12.9752,
    77.6065,
    'user-1',
  );
  expect(mockNavigate).toHaveBeenCalledWith('Payment', { addressId: 'address-123' });
});

test('shows an alert and does not navigate if saving the address fails', async () => {
  const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockAutocompletePlaces.mockResolvedValue([
    { placeId: 'place-1', description: 'MG Road, Bengaluru', mainText: 'MG Road', secondaryText: 'Bengaluru' },
  ]);
  mockGetPlaceDetails.mockResolvedValue({
    formattedAddress: 'MG Road, Bengaluru, Karnataka 560001',
    latitude: 12.9752,
    longitude: 77.6065,
  });
  mockCreateAddress.mockRejectedValue(new Error('Network error'));
  const tree = render();

  await typeAndDebounce(tree, 'MG Road');
  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'suggestion-0' }).props.onPress();
  });

  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'continueButton' }).props.onPress();
  });

  expect(alertSpy).toHaveBeenCalledWith("Couldn't save address", 'Network error');
  expect(mockNavigate).not.toHaveBeenCalled();
});

test('shows an inline error if resolving place details fails', async () => {
  mockAutocompletePlaces.mockResolvedValue([
    { placeId: 'place-1', description: 'MG Road, Bengaluru', mainText: 'MG Road', secondaryText: 'Bengaluru' },
  ]);
  mockGetPlaceDetails.mockRejectedValue(new Error('Details lookup failed'));
  const tree = render();

  await typeAndDebounce(tree, 'MG Road');
  await ReactTestRenderer.act(async () => {
    await tree.root.findByProps({ testID: 'suggestion-0' }).props.onPress();
  });

  const errorText = tree.root.findAllByType(Text).map(t => t.props.children);
  expect(errorText).toContain('Details lookup failed');
});
