import { formatNumber } from '@/lib/format/number';

describe('formatNumber', () => {
  it('uses Bangla digits in Bangla', () => {
    expect(formatNumber(1200, 'bn')).toBe('১,২০০');
  });

  it('applies the given options', () => {
    expect(formatNumber(1.5, 'en', { minimumFractionDigits: 2 })).toBe('1.50');
  });

  it('never shows negative zero', () => {
    expect(formatNumber(-0, 'en')).toBe('0');
  });
});
