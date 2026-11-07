import type { ThemeName } from '@/lib/theme/colors';
import * as NavigationBar from 'expo-navigation-bar';
import { setStatusBarStyle } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Uniwind } from 'uniwind';

export function applyTheme(theme: ThemeName) {
  Uniwind.setTheme(theme);
  setStatusBarStyle(theme === 'dark' ? 'light' : 'dark');
  if (Platform.OS === 'android')
    NavigationBar.setStyle(theme);
}
