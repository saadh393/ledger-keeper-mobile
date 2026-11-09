import { formatStat } from '@/features/ledger/utils/format-stat';

describe('formatStat', () => {
  it.each([
    { label: 'Income', value: 25000, locale: 'en', currency: 'BDT', expected: '৳25,000' },
    { label: 'Expense', value: 1200, locale: 'bn', currency: 'BDT', expected: '৳১,২০০' },
    { label: 'Avg / tx', value: 450, locale: 'en', currency: 'USD', expected: '$450' },
    { label: 'Income', value: 12345678, locale: 'en', currency: 'BDT', expected: '৳12,345,678' },
    { label: 'Expense', value: 12345678, locale: 'bn', currency: 'BDT', expected: '৳১,২৩,৪৫,৬৭৮' },
  ] as const)('formats $label $value in $locale $currency as $expected without a tone', ({ label, value, locale, currency, expected }) => {
    expect(formatStat({ label, value, delta: '' }, locale, currency)).toEqual({ value: expected });
  });

  it('shows a positive net position with + in forest-500', () => {
    expect(formatStat({ label: 'Net position', value: 3000, delta: '' }, 'en', 'BDT')).toEqual({
      value: '+ ৳3,000',
      valueClassName: 'text-forest-500',
    });
  });

  it('shows a negative net position with − in clay-500', () => {
    expect(formatStat({ label: 'Net position', value: -1250.5, delta: '' }, 'en', 'USD')).toEqual({
      value: '− $1,250.50',
      valueClassName: 'text-clay-500',
    });
  });

  it.each([
    { value: 0, expected: '৳0' },
    { value: -0, expected: '৳0' },
    { value: 0.001, expected: '৳0.00' },
    { value: -0.004, expected: '৳0.00' },
  ])('shows a zero net position $value as $expected without a sign or tone', ({ value, expected }) => {
    expect(formatStat({ label: 'Net position', value, delta: '' }, 'en', 'BDT')).toEqual({ value: expected });
  });

  it('shows zero for every stat in an empty month', () => {
    expect(formatStat({ label: 'Income', value: 0, delta: '' }, 'bn', 'BDT')).toEqual({ value: '৳০' });
    expect(formatStat({ label: 'Avg / tx', value: 0, delta: '' }, 'en', 'BDT')).toEqual({ value: '৳0' });
  });
});
