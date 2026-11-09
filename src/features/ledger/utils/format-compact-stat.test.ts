import { formatCompactStat } from '@/features/ledger/utils/format-compact-stat';

describe('formatCompactStat', () => {
  it.each([
    { label: 'Income', value: 12500.5, locale: 'en', currency: 'BDT', expected: '৳12,501' },
    { label: 'Income', value: 12500.5, locale: 'bn', currency: 'BDT', expected: '৳১২,৫০১' },
    { label: 'Avg / tx', value: 45.5, locale: 'en', currency: 'BDT', expected: '৳46' },
    { label: 'Avg / tx', value: 45.5, locale: 'bn', currency: 'BDT', expected: '৳৪৬' },
    { label: 'Income', value: 123456, locale: 'en', currency: 'BDT', expected: '৳1.23 L' },
    { label: 'Income', value: 123456, locale: 'bn', currency: 'BDT', expected: '৳১.২৩ লাখ' },
    { label: 'Income', value: 123456789, locale: 'en', currency: 'BDT', expected: '৳12.3 Cr' },
    { label: 'Income', value: 123456789, locale: 'bn', currency: 'BDT', expected: '৳১২.৩ কোটি' },
    { label: 'Expense', value: 9990000000, locale: 'en', currency: 'BDT', expected: '৳999 Cr' },
    { label: 'Expense', value: 9990000000, locale: 'bn', currency: 'BDT', expected: '৳৯৯৯ কোটি' },
    { label: 'Income', value: 9995000, locale: 'en', currency: 'BDT', expected: '৳1 Cr' },
    { label: 'Income', value: 9995000, locale: 'bn', currency: 'BDT', expected: '৳১ কোটি' },
    { label: 'Income', value: 1234567.89, locale: 'en', currency: 'USD', expected: '$1.23M' },
    { label: 'Income', value: 1234567.89, locale: 'bn', currency: 'USD', expected: '$১.২৩M' },
    { label: 'Income', value: 0, locale: 'en', currency: 'BDT', expected: '৳0' },
    { label: 'Income', value: 0, locale: 'bn', currency: 'BDT', expected: '৳০' },
  ] as const)('formats $label $value in $locale $currency as $expected without a tone', ({ label, value, locale, currency, expected }) => {
    expect(formatCompactStat({ label, value, delta: '' }, locale, currency)).toEqual({ value: expected });
  });

  it.each([
    { locale: 'en', expected: '+৳12.3 Cr' },
    { locale: 'bn', expected: '+৳১২.৩ কোটি' },
  ] as const)('shows a positive net position in $locale as $expected in forest-500', ({ locale, expected }) => {
    expect(formatCompactStat({ label: 'Net position', value: 123456789, delta: '' }, locale, 'BDT')).toEqual({
      value: expected,
      valueClassName: 'text-forest-500',
    });
  });

  it.each([
    { locale: 'en', expected: '−৳2.5 L' },
    { locale: 'bn', expected: '−৳২.৫ লাখ' },
  ] as const)('shows a negative net position in $locale as $expected in clay-500', ({ locale, expected }) => {
    expect(formatCompactStat({ label: 'Net position', value: -250000, delta: '' }, locale, 'BDT')).toEqual({
      value: expected,
      valueClassName: 'text-clay-500',
    });
  });

  it.each([
    { value: 0, locale: 'en', expected: '৳0' },
    { value: 0, locale: 'bn', expected: '৳০' },
    { value: -0, locale: 'en', expected: '৳0' },
    { value: 0.4, locale: 'en', expected: '৳0' },
    { value: 0.4, locale: 'bn', expected: '৳০' },
    { value: -0.4, locale: 'en', expected: '৳0' },
    { value: -0.4, locale: 'bn', expected: '৳০' },
  ] as const)('shows a net position $value in $locale that rounds to zero as $expected without a sign or tone', ({ value, locale, expected }) => {
    expect(formatCompactStat({ label: 'Net position', value, delta: '' }, locale, 'BDT')).toEqual({ value: expected });
  });
});
