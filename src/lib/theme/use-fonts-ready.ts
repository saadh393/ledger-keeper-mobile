import { useFonts } from 'expo-font';

import { fonts } from '@/lib/theme/fonts';

export function useFontsReady() {
  const [loaded, error] = useFonts(fonts);
  return loaded || Boolean(error);
}
