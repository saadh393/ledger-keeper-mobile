import { formatCompactCurrency } from '@/lib/format/compact-currency';
import { formatCurrency } from '@/lib/format/currency';
import { formatDate, formatMonthDay, formatMonthYear, formatTime } from '@/lib/format/date';
import { formatNumber } from '@/lib/format/number';

jest.mock('@/lib/format/locale', () => ({
  ...jest.requireActual('@/lib/format/locale'),
  resolveLocale: () => 'en-BD',
}));

const latinDigit = /\d/;
const date = '2026-11-11T06:00:00.000Z';

describe('formatters on a runtime without Bengali digits', () => {
  it.each([
    ['formatNumber', () => formatNumber(80000, 'bn'), '৮০,০০০'],
    ['formatCurrency', () => formatCurrency(80000, 'bn'), '৳৮০,০০০'],
    ['formatCompactCurrency', () => formatCompactCurrency(250000, 'bn'), '৳২.৫ লাখ'],
  ])('%s shows Bengali digits in Bangla', (_, format, expected) => {
    expect(format()).toBe(expected);
  });

  it.each([
    ['formatDate', () => formatDate(date, 'bn')],
    ['formatMonthDay', () => formatMonthDay(date, 'bn')],
    ['formatMonthYear', () => formatMonthYear(date, 'bn')],
    ['formatTime', () => formatTime(date, 'bn')],
  ])('%s shows Bengali digits in Bangla', (_, format) => {
    expect(format()).not.toMatch(latinDigit);
    expect(format()).toMatch(/[\u09E6-\u09EF]/);
  });

  it('keeps Latin digits in English', () => {
    expect(formatCurrency(80000, 'en')).toBe('৳80,000');
    expect(formatDate(date, 'en')).toMatch(/11/);
  });
});
