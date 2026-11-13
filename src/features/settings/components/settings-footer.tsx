import * as Application from 'expo-application';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';

export function SettingsFooter() {
  const { t } = useTranslation();
  return (
    <Text testID="settings-version" className="py-6 text-center text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>
      {t('settings.version', { version: Application.nativeApplicationVersion ?? '', build: Application.nativeBuildVersion ?? '' })}
    </Text>
  );
}
