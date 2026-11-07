import type { ThemeName } from '@/lib/theme/colors';
import * as NavigationBar from 'expo-navigation-bar';
import { setStatusBarStyle } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Uniwind } from 'uniwind';

import { applyTheme } from '@/lib/theme/apply-theme';

jest.mock('expo-navigation-bar', () => ({ setStyle: jest.fn() }));
jest.mock('expo-status-bar', () => ({ setStatusBarStyle: jest.fn() }));

describe('applyTheme', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each<[ThemeName, 'light' | 'dark']>([
    ['dark', 'light'],
    ['light', 'dark'],
  ])('applies %s with %s system bar icons on android', (theme, icons) => {
    jest.replaceProperty(Platform, 'OS', 'android');

    applyTheme(theme);

    expect(Uniwind.currentTheme).toBe(theme);
    expect(Uniwind.hasAdaptiveThemes).toBe(false);
    expect(setStatusBarStyle).toHaveBeenCalledWith(icons);
    expect(NavigationBar.setStyle).toHaveBeenCalledWith(theme);
  });

  it('leaves the navigation bar alone outside android', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');

    applyTheme('light');

    expect(setStatusBarStyle).toHaveBeenCalledWith('dark');
    expect(NavigationBar.setStyle).not.toHaveBeenCalled();
  });
});
