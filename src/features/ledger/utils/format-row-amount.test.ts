import { formatRowAmount } from '@/features/ledger/utils/format-row-amount';

describe('formatRowAmount', () => {
  it.each([
    { amount: 1200, kind: 'expense', locale: 'en', currency: 'BDT', expected: '− ৳1,200' },
    { amount: 50000, kind: 'income', locale: 'en', currency: 'BDT', expected: '+ ৳50,000' },
    { amount: 12.5, kind: 'expense', locale: 'en', currency: 'USD', expected: '− $12.50' },
    { amount: 1200, kind: 'income', locale: 'bn', currency: 'BDT', expected: '+ ৳১,২০০' },
  ] as const)('formats $amount $kind in $locale $currency', ({ amount, kind, locale, currency, expected }) => {
    expect(formatRowAmount({ amount, kind }, locale, currency)).toBe(expected);
  });
});
