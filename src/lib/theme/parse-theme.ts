import type { ThemeName } from '@/lib/theme/colors';

export function parseTheme(value: unknown): ThemeName {
  return value === 'light' ? 'light' : 'dark';
}
