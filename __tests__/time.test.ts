/**
 * @format
 */

import { formatTimeOfDay, getNext7Days, isSlotDisabled } from '../src/utils/time';

test('formatTimeOfDay formats minutes-from-midnight as a 12-hour clock label', () => {
  expect(formatTimeOfDay(0)).toBe('12:00 AM');
  expect(formatTimeOfDay(6 * 60)).toBe('6:00 AM');
  expect(formatTimeOfDay(12 * 60)).toBe('12:00 PM');
  expect(formatTimeOfDay(13 * 60 + 30)).toBe('1:30 PM');
  expect(formatTimeOfDay(23 * 60)).toBe('11:00 PM');
});

test('getNext7Days returns 7 consecutive days starting today, labeled "Today" first', () => {
  const today = new Date(2024, 0, 15); // a Monday
  const days = getNext7Days(today);

  expect(days).toHaveLength(7);
  expect(days[0].label).toBe('Today');
  expect(days[0].key).toBe('2024-01-15');
  expect(days[1].label).toBe('Tue');
  expect(days[6].key).toBe('2024-01-21');
});

test('isSlotDisabled disables slots less than 2 hours from now, not slots 2+ hours away', () => {
  const day = new Date(2024, 0, 15);
  const now = new Date(2024, 0, 15, 10, 0, 0); // 10:00 AM

  expect(isSlotDisabled(day, 11 * 60, now)).toBe(true); // 11:00 AM, 1h away
  expect(isSlotDisabled(day, 12 * 60, now)).toBe(false); // 12:00 PM, exactly 2h away
  expect(isSlotDisabled(day, 13 * 60, now)).toBe(false); // 1:00 PM, 3h away
});
