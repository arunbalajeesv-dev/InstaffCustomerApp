/* eslint-env jest */
// The real component never fires a native layout event inside the test
// renderer, so SafeAreaProvider's children would otherwise never render.
// The package's mock ships its replacement object under a `default` export;
// unwrap it so named imports (SafeAreaView, useSafeAreaInsets, ...) resolve.
jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});

// The real package (and its @firebase/* web fallback) isn't meant to run
// outside a native/bundled environment and fails to parse under Jest.
// Default here is "no session restored" (onAuthStateChanged fires with
// null); LoginScreen/OtpScreen/RootNavigator tests override specific
// functions per test via their own jest.mock.
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((_auth, callback) => {
    callback(null);
    return () => {};
  }),
  signInWithPhoneNumber: jest.fn(),
}));

// Same rationale as the auth mock above. Default token/refresh behave like
// a successful device; notifications.test.ts and RootNavigator tests
// override specific functions per test via their own jest.mock.
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
  onTokenRefresh: jest.fn(() => () => {}),
  onMessage: jest.fn(() => () => {}),
  setBackgroundMessageHandler: jest.fn(),
  requestPermission: jest.fn(() => Promise.resolve(1)),
}));

// Same rationale again. analytics.test.ts asserts on logEvent calls via its
// own jest.mock; this default just keeps every other screen test (which
// transitively imports src/services/analytics.ts) from crashing.
jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(() => Promise.resolve()),
}));

// The real native SDK has nothing to initialize against under Jest.
// sentry.test.ts asserts on these calls via its own jest.mock.
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: jest.fn(component => component),
  setTag: jest.fn(),
}));
