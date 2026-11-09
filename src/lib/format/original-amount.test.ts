import { formatOriginalAmount } from '@/lib/format/original-amount';

describe('formatOriginalAmount', () => {
  it.each([
    { original: { amount: 12, currency: 'USD', rate: 121.5 }, locale: 'en', expected: '$12 at 121.5' },
    { original: { amount: 1234.56, currency: 'EUR', rate: 130.12345 }, locale: 'en', expected: '€1,234.56 at 130.1235' },
    { original: { amount: 50, currency: 'INR', rate: 1.4 }, locale: 'en', expected: '₹50 at 1.4' },
    { original: { amount: 12, currency: 'USD', rate: 121.5 }, locale: 'bn', expected: '$১২ at ১২১.৫' },
    { original: { amount: 1234.56, currency: 'EUR', rate: 130.12345 }, locale: 'bn', expected: '€১,২৩৪.৫৬ at ১৩০.১২৩৫' },
    { original: { amount: 50, currency: 'INR', rate: 1.4 }, locale: 'bn', expected: '₹৫০ at ১.৪' },
  ] as const)('formats $original.amount $original.currency at $original.rate in $locale like the web app', ({ original, locale, expected }) => {
    expect(formatOriginalAmount(original, locale)).toBe(expected);
  });
});
