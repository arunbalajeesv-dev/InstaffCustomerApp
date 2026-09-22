/* eslint-env jest */
// The real component never fires a native layout event inside the test
// renderer, so SafeAreaProvider's children would otherwise never render.
// The package's mock ships its replacement object under a `default` export;
// unwrap it so named imports (SafeAreaView, useSafeAreaInsets, ...) resolve.
jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});
