import { fontFamily } from '@/lib/theme/font-family';

describe('fontFamily', () => {
  it.each([
    [400, 'Manrope_400Regular'],
    [500, 'Manrope_500Medium'],
    [600, 'Manrope_600SemiBold'],
    [700, 'Manrope_700Bold'],
  ] as const)('picks Manrope for weight %i in English', (weight, expected) => {
    expect(fontFamily(weight, 'en')).toBe(expected);
  });

  it.each([
    [400, 'NotoSansBengali_400Regular'],
    [500, 'NotoSansBengali_500Medium'],
    [600, 'NotoSansBengali_600SemiBold'],
    [700, 'NotoSansBengali_700Bold'],
  ] as const)('picks Noto Sans Bengali for weight %i in Bangla', (weight, expected) => {
    expect(fontFamily(weight, 'bn')).toBe(expected);
  });

  it('treats a regional Bangla tag as Bangla', () => {
    expect(fontFamily(500, 'bn-BD')).toBe('NotoSansBengali_500Medium');
  });

  it('defaults to regular when no weight is set', () => {
    expect(fontFamily(undefined, 'en')).toBe('Manrope_400Regular');
  });

  it('clamps weights outside the bundled range', () => {
    expect(fontFamily(300, 'en')).toBe('Manrope_400Regular');
    expect(fontFamily(800, 'en')).toBe('Manrope_700Bold');
  });
});
