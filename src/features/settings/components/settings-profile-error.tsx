import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';

export type SettingsProfileErrorProps = {
  loading: boolean;
  onRetry: () => void;
  testID?: string;
};

export function SettingsProfileError({ loading, onRetry, testID }: SettingsProfileErrorProps) {
  const { t } = useTranslation();
  return (
    <View testID={testID} className="flex-row items-center gap-3 px-4 py-3">
      <Text className="flex-1 text-body text-clay-500">{t('settings.profileError')}</Text>
      <Button variant="text" size="sm" fullWidth={false} label={t('settings.retry')} loading={loading} onPress={onRetry} testID={testID ? `${testID}-retry` : undefined} />
    </View>
  );
}
