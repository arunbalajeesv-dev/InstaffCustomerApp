const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export type DayOption = {
  key: string; // yyyy-mm-dd, local
  date: Date; // local midnight of that day
  label: string; // "Today" or e.g. "Mon"
  dayNumber: string;
};

// Start-time buttons: 6:00 AM through 9:00 PM, one per hour.
export const START_TIME_OPTIONS_MINUTES = Array.from({ length: 16 }, (_, i) => (6 + i) * 60);

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getNext7Days(today: Date = new Date()): DayOption[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return {
      key: dateKey(date),
      date,
      label: i === 0 ? 'Today' : DAY_LABELS[date.getDay()],
      dayNumber: String(date.getDate()),
    };
  });
}

// Formats minutes-from-midnight as a 12-hour clock label, e.g. 570 -> "9:30 AM".
export function formatTimeOfDay(minutesFromMidnight: number): string {
  const totalMinutes = ((minutesFromMidnight % 1440) + 1440) % 1440;
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

// An absolute label (not relative like "Today"), since cart items may be
// viewed well after the day they were picked. e.g. "Mon, Sep 23".
export function formatDayDisplay(date: Date): string {
  return `${DAY_LABELS[date.getDay()]}, ${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`;
}

function slotDateTime(dayDate: Date, minutesFromMidnight: number): Date {
  const result = new Date(dayDate);
  result.setHours(0, minutesFromMidnight, 0, 0);
  return result;
}

export function isSlotDisabled(
  dayDate: Date,
  minutesFromMidnight: number,
  now: Date = new Date(),
): boolean {
  return slotDateTime(dayDate, minutesFromMidnight).getTime() - now.getTime() < TWO_HOURS_MS;
}
