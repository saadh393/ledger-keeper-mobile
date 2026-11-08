import {
  formatMonthLabel,
  getCurrentMonth,
  getMonthRange,
  getNextMonth,
  getPreviousMonth,
  isCurrentMonth,
} from '@/features/ledger/utils/month';

describe('month math', () => {
  it('runs with the phone set to America/New_York', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/New_York');
  });

  it.each([
    ['2026-11-15T06:00:00Z', { year: 2026, month: 11 }],
    ['2026-11-30T17:59:59Z', { year: 2026, month: 11 }],
    ['2026-11-30T18:00:00Z', { year: 2026, month: 12 }],
    ['2026-12-31T17:59:59Z', { year: 2026, month: 12 }],
    ['2026-12-31T18:00:00Z', { year: 2027, month: 1 }],
    ['2027-01-01T02:00:00Z', { year: 2027, month: 1 }],
  ])('puts %s in the Dhaka month %o', (now, expected) => {
    expect(getCurrentMonth(now)).toEqual(expected);
  });

  it('uses Dhaka even when the New York date is still the previous month', () => {
    const now = new Date('2026-12-01T01:00:00Z');
    expect(now.getMonth()).toBe(10);
    expect(getCurrentMonth(now)).toEqual({ year: 2026, month: 12 });
  });

  it.each([
    [{ year: 2026, month: 11 }, { year: 2026, month: 10 }],
    [{ year: 2026, month: 1 }, { year: 2025, month: 12 }],
    [{ year: 2000, month: 1 }, { year: 1999, month: 12 }],
  ])('moves back from %o to %o', (month, expected) => {
    expect(getPreviousMonth(month)).toEqual(expected);
  });

  it.each([
    [{ year: 2026, month: 10 }, { year: 2026, month: 11 }],
    [{ year: 2025, month: 12 }, { year: 2026, month: 1 }],
  ])('moves forward from %o to %o', (month, expected) => {
    expect(getNextMonth(month)).toEqual(expected);
  });

  it.each([
    [{ year: 2026, month: 11 }, '2026-11-01', '2026-11-30'],
    [{ year: 2026, month: 12 }, '2026-12-01', '2026-12-31'],
    [{ year: 2026, month: 1 }, '2026-01-01', '2026-01-31'],
    [{ year: 2026, month: 2 }, '2026-02-01', '2026-02-28'],
    [{ year: 2024, month: 2 }, '2024-02-01', '2024-02-29'],
    [{ year: 2000, month: 2 }, '2000-02-01', '2000-02-29'],
    [{ year: 2100, month: 2 }, '2100-02-01', '2100-02-28'],
  ])('gives %o the days %s to %s', (month, firstDay, lastDay) => {
    expect(getMonthRange(month)).toEqual({ firstDay, lastDay });
  });

  it.each([
    [{ year: 2026, month: 11 }, '2026-11-30T17:59:59Z', true],
    [{ year: 2026, month: 11 }, '2026-11-30T18:00:00Z', false],
    [{ year: 2026, month: 12 }, '2026-11-30T18:00:00Z', true],
    [{ year: 2025, month: 11 }, '2026-11-15T06:00:00Z', false],
  ])('tells whether %o is current at %s', (month, now, expected) => {
    expect(isCurrentMonth(month, now)).toBe(expected);
  });

  it.each([
    [{ year: 2026, month: 11 }, 'en', 'November 2026'],
    [{ year: 2026, month: 11 }, 'bn', 'নভেম্বর ২০২৬'],
    [{ year: 2025, month: 12 }, 'en', 'December 2025'],
    [{ year: 2026, month: 1 }, 'en', 'January 2026'],
  ] as const)('labels %o in %s as %s', (month, locale, expected) => {
    expect(formatMonthLabel(month, locale)).toBe(expected);
  });
});
