import type { TextStyle } from 'react-native';
import type { fonts } from '@/lib/theme/fonts';

const families = {
  manrope: {
    400: 'Manrope_400Regular',
    500: 'Manrope_500Medium',
    600: 'Manrope_600SemiBold',
    700: 'Manrope_700Bold',
  },
  bengali: {
    400: 'NotoSansBengali_400Regular',
    500: 'NotoSansBengali_500Medium',
    600: 'NotoSansBengali_600SemiBold',
    700: 'NotoSansBengali_700Bold',
  },
} satisfies Record<string, Record<400 | 500 | 600 | 700, keyof typeof fonts>>;

type Weight = keyof typeof families.manrope;

export function fontFamily(fontWeight: TextStyle['fontWeight'], language: string) {
  const script = language.startsWith('bn') ? 'bengali' : 'manrope';
  const weight = Math.min(Math.max(Number(fontWeight) || 400, 400), 700) as Weight;
  return families[script][weight];
}
