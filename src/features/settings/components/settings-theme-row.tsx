import type { ThemeName } from '@/lib/theme/colors';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SegmentedControl, Text } from '@/components/ui';
import { useThemeStore } from '@/lib/theme/use-theme-store';

export function SettingsThemeRow() {
  const { t } = useTranslation();
  const theme = useThemeStore(state => state.theme);
  const setTheme = useThemeStore(state => state.setTheme);

  return (
    <View className="gap-2 px-4 py-3">
      <Text className="text-row-title text-ink-900">{t('settings.theme.label')}</Text>
      <SegmentedControl<ThemeName>
        testID="settings-theme"
        value={theme}
        onChange={setTheme}
        options={[
          { label: t('settings.theme.light'), value: 'light', testID: 'settings-theme-light' },
          { label: t('settings.theme.dark'), value: 'dark', testID: 'settings-theme-dark' },
        ]}
      />
    </View>
  );
}
