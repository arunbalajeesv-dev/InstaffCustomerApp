/**
 * @format
 */

import * as Sentry from '@sentry/react-native';
import { initSentry, setCurrentScreen, wrapWithSentry } from '../src/services/sentry';

beforeEach(() => {
  (Sentry.init as jest.Mock).mockClear();
  (Sentry.setTag as jest.Mock).mockClear();
});

test('initSentry initializes the SDK with a DSN', () => {
  initSentry();
  expect(Sentry.init).toHaveBeenCalledWith(
    expect.objectContaining({ dsn: expect.stringContaining('sentry.io') }),
  );
});

test('setCurrentScreen tags subsequent errors with the given screen name', () => {
  setCurrentScreen('ServiceDetail');
  expect(Sentry.setTag).toHaveBeenCalledWith('screen', 'ServiceDetail');
});

test('wrapWithSentry is Sentry.wrap', () => {
  expect(wrapWithSentry).toBe(Sentry.wrap);
});
