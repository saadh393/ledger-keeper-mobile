import { useUniwind } from 'uniwind';

import { colors } from '@/lib/theme/colors';

export function useThemeColors() {
  const { theme } = useUniwind();
  return theme === 'dark' ? colors.dark : colors.light;
}
