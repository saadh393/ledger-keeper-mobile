import type { TextStyle } from 'react-native';

const fontClasses = {
  manrope: {
    400: 'font-manrope-400',
    500: 'font-manrope-500',
    600: 'font-manrope-600',
    700: 'font-manrope-700',
  },
  bengali: {
    400: 'font-bengali-400',
    500: 'font-bengali-500',
    600: 'font-bengali-600',
    700: 'font-bengali-700',
  },
};

type Weight = keyof typeof fontClasses.manrope;

export function fontClass(fontWeight: TextStyle['fontWeight'], language: string) {
  const script = language.startsWith('bn') ? 'bengali' : 'manrope';
  const weight = Math.min(Math.max(Number(fontWeight) || 400, 400), 700) as Weight;
  return fontClasses[script][weight];
}
