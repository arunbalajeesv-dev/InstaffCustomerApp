/**
 * @format
 */

import { PermissionsAndroid, Platform } from 'react-native';
import { getToken, onTokenRefresh } from '@react-native-firebase/messaging';
import { registerForPushNotifications } from '../src/services/notifications';

const mockUpdateFcmToken = jest.fn();
jest.mock('../src/services/usersApi', () => ({
  updateFcmToken: (userId: string, token: string) => mockUpdateFcmToken(userId, token),
}));

const mockGetToken = getToken as jest.Mock;
const mockOnTokenRefresh = onTokenRefresh as jest.Mock;

function setPlatform(os: 'android' | 'ios', version: number) {
  Platform.OS = os;
  Object.defineProperty(Platform, 'Version', { value: version, configurable: true });
}

beforeEach(() => {
  mockUpdateFcmToken.mockReset().mockResolvedValue(undefined);
  mockGetToken.mockReset().mockResolvedValue('device-token-1');
  mockOnTokenRefresh.mockReset().mockReturnValue(() => {});
  jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('does nothing on iOS (not wired up yet)', async () => {
  setPlatform('ios', 17);

  await registerForPushNotifications('user-1');

  expect(PermissionsAndroid.request).not.toHaveBeenCalled();
  expect(mockGetToken).not.toHaveBeenCalled();
  expect(mockUpdateFcmToken).not.toHaveBeenCalled();
});

test('on Android below API 33, skips the runtime prompt and saves the token', async () => {
  setPlatform('android', 30);

  await registerForPushNotifications('user-1');

  expect(PermissionsAndroid.request).not.toHaveBeenCalled();
  expect(mockUpdateFcmToken).toHaveBeenCalledWith('user-1', 'device-token-1');
});

test('on Android 13+, requests POST_NOTIFICATIONS and saves the token when granted', async () => {
  setPlatform('android', 33);

  await registerForPushNotifications('user-1');

  expect(PermissionsAndroid.request).toHaveBeenCalledWith(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  expect(mockUpdateFcmToken).toHaveBeenCalledWith('user-1', 'device-token-1');
});

test('on Android 13+, does not fetch or save a token when permission is denied', async () => {
  setPlatform('android', 33);
  (PermissionsAndroid.request as jest.Mock).mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

  await registerForPushNotifications('user-1');

  expect(mockGetToken).not.toHaveBeenCalled();
  expect(mockUpdateFcmToken).not.toHaveBeenCalled();
});

test('re-saves the token when it refreshes', async () => {
  setPlatform('android', 30);
  let refreshListener: ((token: string) => void) | undefined;
  mockOnTokenRefresh.mockImplementation((_messaging, listener) => {
    refreshListener = listener;
    return () => {};
  });

  await registerForPushNotifications('user-1');
  refreshListener?.('device-token-2');

  expect(mockUpdateFcmToken).toHaveBeenCalledWith('user-1', 'device-token-2');
});

test('does not throw if fetching or saving the token fails', async () => {
  setPlatform('android', 30);
  mockGetToken.mockRejectedValue(new Error('no token'));

  await expect(registerForPushNotifications('user-1')).resolves.toBeUndefined();
});
