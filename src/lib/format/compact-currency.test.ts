import { formatCompactCurrency } from '@/lib/format/compact-currency';

describe('formatCompactCurrency', () => {
  it.each([
    { value: 0, locale: 'en', expected: '৳0' },
    { value: 0, locale: 'bn', expected: '৳০' },
    { value: 12500.5, locale: 'en', expected: '৳12,501' },
    { value: 12500.5, locale: 'bn', expected: '৳১২,৫০১' },
    { value: 45.5, locale: 'en', expected: '৳46' },
    { value: 45.5, locale: 'bn', expected: '৳৪৬' },
    { value: 99999, locale: 'en', expected: '৳99,999' },
    { value: 99999, locale: 'bn', expected: '৳৯৯,৯৯৯' },
    { value: 100000, locale: 'en', expected: '৳1 L' },
    { value: 100000, locale: 'bn', expected: '৳১ লাখ' },
    { value: 123456, locale: 'en', expected: '৳1.23 L' },
    { value: 123456, locale: 'bn', expected: '৳১.২৩ লাখ' },
    { value: 1234567, locale: 'en', expected: '৳12.3 L' },
    { value: 1234567, locale: 'bn', expected: '৳১২.৩ লাখ' },
    { value: 9994999, locale: 'en', expected: '৳99.9 L' },
    { value: 9995000, locale: 'en', expected: '৳1 Cr' },
    { value: 9995000, locale: 'bn', expected: '৳১ কোটি' },
    { value: 10000000, locale: 'en', expected: '৳1 Cr' },
    { value: 10000000, locale: 'bn', expected: '৳১ কোটি' },
    { value: 12345678, locale: 'en', expected: '৳1.23 Cr' },
    { value: 12345678, locale: 'bn', expected: '৳১.২৩ কোটি' },
    { value: 123456789, locale: 'en', expected: '৳12.3 Cr' },
    { value: 123456789, locale: 'bn', expected: '৳১২.৩ কোটি' },
    { value: 1234567890, locale: 'en', expected: '৳123 Cr' },
    { value: 1234567890, locale: 'bn', expected: '৳১২৩ কোটি' },
    { value: 9990000000, locale: 'en', expected: '৳999 Cr' },
    { value: 9990000000, locale: 'bn', expected: '৳৯৯৯ কোটি' },
    { value: 9996000000, locale: 'en', expected: '৳1,000 Cr' },
    { value: 9996000000, locale: 'bn', expected: '৳১,০০০ কোটি' },
    { value: 12340000000, locale: 'en', expected: '৳1,234 Cr' },
    { value: 12340000000, locale: 'bn', expected: '৳১,২৩৪ কোটি' },
  ] as const)('formats BDT $value in $locale as $expected', ({ value, locale, expected }) => {
    expect(formatCompactCurrency(value, locale, 'BDT')).toBe(expected);
  });

  it.each([
    { value: 1200, locale: 'en', expected: '$1,200' },
    { value: 99999, locale: 'en', expected: '$99,999' },
    { value: 99999, locale: 'bn', expected: '$৯৯,৯৯৯' },
    { value: 100000, locale: 'en', expected: '$100K' },
    { value: 100000, locale: 'bn', expected: '$১০০K' },
    { value: 123456, locale: 'en', expected: '$123K' },
    { value: 123456, locale: 'bn', expected: '$১২৩K' },
    { value: 999499, locale: 'en', expected: '$999K' },
    { value: 999600, locale: 'en', expected: '$1M' },
    { value: 999600, locale: 'bn', expected: '$১M' },
    { value: 1234567.89, locale: 'en', expected: '$1.23M' },
    { value: 1234567.89, locale: 'bn', expected: '$১.২৩M' },
    { value: 12345678, locale: 'en', expected: '$12.3M' },
    { value: 12345678, locale: 'bn', expected: '$১২.৩M' },
    { value: 999600000, locale: 'en', expected: '$1B' },
    { value: 999600000, locale: 'bn', expected: '$১B' },
    { value: 1500000000, locale: 'en', expected: '$1.5B' },
    { value: 1500000000, locale: 'bn', expected: '$১.৫B' },
    { value: 1234000000000, locale: 'en', expected: '$1,234B' },
    { value: 1234000000000, locale: 'bn', expected: '$১,২৩৪B' },
  ] as const)('formats USD $value in $locale as $expected', ({ value, locale, expected }) => {
    expect(formatCompactCurrency(value, locale, 'USD')).toBe(expected);
  });

  it.each([
    { value: -250000, locale: 'en', currency: 'BDT', expected: '−৳2.5 L' },
    { value: -250000, locale: 'bn', currency: 'BDT', expected: '−৳২.৫ লাখ' },
    { value: -2500, locale: 'en', currency: 'BDT', expected: '−৳2,500' },
    { value: -1234567.89, locale: 'en', currency: 'USD', expected: '−$1.23M' },
    { value: -0.6, locale: 'en', currency: 'BDT', expected: '−৳1' },
    { value: -0.4, locale: 'en', currency: 'BDT', expected: '৳0' },
  ] as const)('formats negative $value in $locale $currency with U+2212 as $expected', ({ value, locale, currency, expected }) => {
    expect(formatCompactCurrency(value, locale, currency)).toBe(expected);
  });

  it('uses the currency code for an unknown currency', () => {
    expect(formatCompactCurrency(1234567, 'en', 'XYZ')).toBe('XYZ 1.23M');
  });

  it('defaults to BDT', () => {
    expect(formatCompactCurrency(123456, 'en')).toBe('৳1.23 L');
  });
});
