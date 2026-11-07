import { fontClass } from '@/lib/theme/font-class';

describe('fontClass', () => {
  it.each([
    [400, 'font-manrope-400'],
    [500, 'font-manrope-500'],
    [600, 'font-manrope-600'],
    [700, 'font-manrope-700'],
  ] as const)('picks Manrope for weight %i in English', (weight, expected) => {
    expect(fontClass(weight, 'en')).toBe(expected);
  });

  it.each([
    [400, 'font-bengali-400'],
    [500, 'font-bengali-500'],
    [600, 'font-bengali-600'],
    [700, 'font-bengali-700'],
  ] as const)('picks Noto Sans Bengali for weight %i in Bangla', (weight, expected) => {
    expect(fontClass(weight, 'bn')).toBe(expected);
  });

  it('treats a regional Bangla tag as Bangla', () => {
    expect(fontClass(500, 'bn-BD')).toBe('font-bengali-500');
  });

  it('defaults to regular when no weight is set', () => {
    expect(fontClass(undefined, 'en')).toBe('font-manrope-400');
  });

  it('clamps weights outside the bundled range', () => {
    expect(fontClass(300, 'en')).toBe('font-manrope-400');
    expect(fontClass(800, 'en')).toBe('font-manrope-700');
  });
});
