import { applyTheme } from '@/lib/theme/apply-theme';
import { useThemeStore } from '@/lib/theme/use-theme-store';

export function syncTheme() {
  applyTheme(useThemeStore.getState().theme);
  return useThemeStore.subscribe(state => applyTheme(state.theme));
}
