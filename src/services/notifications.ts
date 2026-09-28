import { getMessaging, getToken, onTokenRefresh } from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { updateFcmToken } from './usersApi';

// Android 13 (API 33) introduced a runtime POST_NOTIFICATIONS permission —
// below that, notifications are allowed by default and this resolves
// immediately without showing anything. iOS is handled separately (not
// wired up yet).
async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

// Called once auth resolves to a logged-in user. Requests the notification
// permission, then fetches this device's FCM token and saves it on the
// user's profile so the backend can target push notifications at them (e.g.
// the booking-confirmed notification sent from the send-booking-notification
// edge function). Safe to call on every login, not just the very first —
// the OS itself only prompts once, and re-saving the same/rotated token is
// harmless.
export async function registerForPushNotifications(userId: string): Promise<void> {
  if (Platform.OS !== 'android') {
    // iOS requires its own APNs-backed permission flow — not wired up yet.
    return;
  }

  const granted = await requestAndroidNotificationPermission();
  if (!granted) {
    return;
  }

  try {
    const messaging = getMessaging();
    const token = await getToken(messaging);
    await updateFcmToken(userId, token);

    // Keep the stored token current if it rotates while the user stays
    // logged in (e.g. after a reinstall-like token refresh).
    onTokenRefresh(messaging, newToken => {
      updateFcmToken(userId, newToken).catch(() => {
        // Best-effort — a stale token just means a future push silently
        // misses this device until the next successful refresh/login.
      });
    });
  } catch {
    // Best-effort — booking flows must not fail because push registration
    // did.
  }
}
