import {
  formatDate,
  formatDateTime,
  formatMonthDay,
  formatMonthYear,
  formatTime,
} from '@/lib/format/date';

const instant = '2026-11-30T19:30:00Z';

describe('date formatting', () => {
  it('runs with a process time zone other than Dhaka', () => {
    expect(new Date(instant).getTimezoneOffset()).toBe(300);
  });

  it.each([
    ['en', formatDate, '1 Dec 2026'],
    ['en', formatTime, '1:30 AM'],
    ['en', formatDateTime, '1 Dec 2026 · 1:30 AM'],
    ['en', formatMonthYear, 'December 2026'],
    ['en', formatMonthDay, '1 Dec'],
    ['bn', formatDate, '১ ডিসে ২০২৬'],
    ['bn', formatTime, '১:৩০ AM'],
    ['bn', formatDateTime, '১ ডিসে ২০২৬ · ১:৩০ AM'],
    ['bn', formatMonthYear, 'ডিসেম্বর ২০২৬'],
    ['bn', formatMonthDay, '১ ডিসে'],
  ] as const)('shows the Dhaka date in %s with %o', (locale, format, expected) => {
    expect(format(instant, locale)).toBe(expected);
  });

  it('accepts a Date', () => {
    expect(formatDate(new Date(instant), 'en')).toBe('1 Dec 2026');
  });
});
