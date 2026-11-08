import { formatSignedCurrency } from '@/lib/format/signed-currency';

describe('formatSignedCurrency', () => {
  it.each([
    { value: 1200, locale: 'en', kind: 'expense', currency: 'BDT', fractionDigits: 0, expected: '− ৳1,200' },
    { value: 1200, locale: 'en', kind: 'income', currency: 'USD', fractionDigits: 0, expected: '+ $1,200' },
    { value: 1200, locale: 'bn', kind: 'expense', currency: 'BDT', fractionDigits: 0, expected: '− ৳১,২০০' },
    { value: 1200, locale: 'bn', kind: 'income', currency: 'USD', fractionDigits: 0, expected: '+ $১,২০০' },
    { value: 1200, locale: 'en', kind: 'expense', currency: 'BDT', fractionDigits: 2, expected: '− ৳1,200.00' },
    { value: 1200, locale: 'bn', kind: 'income', currency: 'USD', fractionDigits: 2, expected: '+ $১,২০০.০০' },
    { value: 0.005, locale: 'en', kind: 'expense', currency: 'BDT', fractionDigits: 2, expected: '− ৳0.01' },
    { value: 1.005, locale: 'en', kind: 'income', currency: 'USD', fractionDigits: 2, expected: '+ $1.01' },
    { value: 2.5, locale: 'en', kind: 'expense', currency: 'BDT', fractionDigits: 0, expected: '− ৳3' },
    { value: 999999999999.99, locale: 'en', kind: 'expense', currency: 'BDT', fractionDigits: 0, expected: '− ৳1,000,000,000,000' },
    { value: 999999999999.99, locale: 'en', kind: 'income', currency: 'USD', fractionDigits: 2, expected: '+ $999,999,999,999.99' },
    { value: 999999999999.99, locale: 'bn', kind: 'expense', currency: 'BDT', fractionDigits: 2, expected: '− ৳৯,৯৯,৯৯,৯৯,৯৯,৯৯৯.৯৯' },
  ] as const)('formats $value in $locale as $kind $currency with $fractionDigits decimals like the web app', ({ value, locale, kind, currency, fractionDigits, expected }) => {
    expect(formatSignedCurrency(value, locale, { kind, currency, fractionDigits })).toBe(expected);
  });

  it('uses U+2212 for expenses, followed by a space', () => {
    expect(formatSignedCurrency(5, 'en', { kind: 'expense' }).slice(0, 2)).toBe('− ');
  });

  it('defaults to BDT with 0 decimals', () => {
    expect(formatSignedCurrency(1200.4, 'en', { kind: 'income' })).toBe('+ ৳1,200');
  });

  it.each([
    { value: 0, locale: 'en', fractionDigits: 0, expected: '৳0' },
    { value: -0, locale: 'en', fractionDigits: 0, expected: '৳0' },
    { value: 0.4, locale: 'en', fractionDigits: 0, expected: '৳0' },
    { value: 0.004, locale: 'en', fractionDigits: 2, expected: '৳0.00' },
    { value: -0.4, locale: 'en', fractionDigits: 0, expected: '৳0' },
    { value: -0.4, locale: 'bn', fractionDigits: 0, expected: '৳০' },
    { value: -0.004, locale: 'en', fractionDigits: 2, expected: '৳0.00' },
    { value: -0.004, locale: 'bn', fractionDigits: 2, expected: '৳০.০০' },
    { value: 0.3 - 0.1 - 0.2, locale: 'en', fractionDigits: 0, expected: '৳0' },
    { value: 0.3 - 0.1 - 0.2, locale: 'bn', fractionDigits: 2, expected: '৳০.০০' },
  ] as const)('shows $value in $locale with $fractionDigits decimals without a sign', ({ value, locale, fractionDigits, expected }) => {
    expect(formatSignedCurrency(value, locale, { kind: 'expense', fractionDigits })).toBe(expected);
    expect(formatSignedCurrency(value, locale, { kind: 'income', fractionDigits })).toBe(expected);
  });

  it('shows an unknown currency code as a prefix', () => {
    expect(formatSignedCurrency(1200, 'en', { kind: 'income', currency: 'XYZ' })).toBe('+ XYZ 1,200');
  });
});
