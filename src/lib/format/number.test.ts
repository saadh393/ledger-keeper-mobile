import { formatNumber } from '@/lib/format/number';

describe('formatNumber', () => {
  it('uses Bangla digits in Bangla', () => {
    expect(formatNumber(1200, 'bn')).toBe('১,২০০');
  });

  it('applies the given options', () => {
    expect(formatNumber(1.5, 'en', { minimumFractionDigits: 2 })).toBe('1.50');
  });

  it.each([
    { value: -0, locale: 'en', options: {}, expected: '0' },
    { value: -0.0004, locale: 'en', options: {}, expected: '0' },
    { value: -0.4, locale: 'en', options: { maximumFractionDigits: 0 }, expected: '0' },
    { value: -0.4, locale: 'bn', options: { maximumFractionDigits: 0 }, expected: '০' },
    { value: -0.004, locale: 'en', options: { minimumFractionDigits: 2, maximumFractionDigits: 2 }, expected: '0.00' },
    { value: -0.004, locale: 'bn', options: { minimumFractionDigits: 2, maximumFractionDigits: 2 }, expected: '০.০০' },
    { value: 0.3 - 0.1 - 0.2, locale: 'en', options: {}, expected: '0' },
  ] as const)('never shows negative zero for $value in $locale', ({ value, locale, options, expected }) => {
    expect(formatNumber(value, locale, options)).toBe(expected);
  });

  it('keeps the minus on negative amounts that do not round to zero', () => {
    expect(formatNumber(-0.5, 'en', { maximumFractionDigits: 0 })).toBe('-1');
    expect(formatNumber(-1200, 'bn')).toBe('-১,২০০');
  });
});
