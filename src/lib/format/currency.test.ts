import { formatCurrency } from '@/lib/format/currency';

describe('formatCurrency', () => {
  it.each([
    { value: 1200, locale: 'en', currency: 'BDT', expected: '৳1,200' },
    { value: 1200, locale: 'bn', currency: 'BDT', expected: '৳১,২০০' },
    { value: 100000, locale: 'en', currency: 'BDT', expected: '৳100,000' },
    { value: 100000, locale: 'bn', currency: 'BDT', expected: '৳১,০০,০০০' },
    { value: 1200, locale: 'en', currency: 'USD', expected: '$1,200' },
    { value: 1200, locale: 'bn', currency: 'USD', expected: '$১,২০০' },
    { value: 1234567.5, locale: 'en', currency: 'EUR', expected: '€1,234,567.5' },
    { value: 1234567, locale: 'bn', currency: 'EUR', expected: '€১২,৩৪,৫৬৭' },
    { value: 0, locale: 'en', currency: 'BDT', expected: '৳0' },
    { value: 0.005, locale: 'en', currency: 'USD', expected: '$0.005' },
    { value: 999999999999.99, locale: 'en', currency: 'BDT', expected: '৳999,999,999,999.99' },
    { value: 999999999999.99, locale: 'bn', currency: 'BDT', expected: '৳৯,৯৯,৯৯,৯৯,৯৯,৯৯৯.৯৯' },
    { value: 1200, locale: 'en', currency: 'XYZ', expected: 'XYZ 1,200' },
    { value: 1200, locale: 'bn', currency: 'XYZ', expected: 'XYZ ১,২০০' },
    { value: 1200, locale: 'en', currency: 'XY', expected: 'XY 1,200' },
  ] as const)('formats $value in $locale $currency like the web app', ({ value, locale, currency, expected }) => {
    expect(formatCurrency(value, locale, currency)).toBe(expected);
  });

  it('defaults to BDT', () => {
    expect(formatCurrency(1200, 'en')).toBe('৳1,200');
  });

  it('never shows negative zero', () => {
    expect(formatCurrency(-0, 'en', 'BDT')).toBe('৳0');
  });

  it('falls back to the code when formatToParts is missing', () => {
    const { formatToParts } = Intl.NumberFormat.prototype;
    Reflect.deleteProperty(Intl.NumberFormat.prototype, 'formatToParts');
    try {
      expect(formatCurrency(1200, 'en', 'BDT')).toBe('BDT 1,200');
    }
    finally {
      Intl.NumberFormat.prototype.formatToParts = formatToParts;
    }
  });
});
