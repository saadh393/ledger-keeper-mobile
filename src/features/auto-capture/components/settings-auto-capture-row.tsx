import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useCaptureStatus } from '@/features/auto-capture/hooks/use-capture-status';
import { isAutoCaptureSupported } from '@/features/auto-capture/native/notification-capture';
import { SettingsRow } from '@/features/settings/components/settings-row';
import { SettingsSection } from '@/features/settings/components/settings-section';

export function SettingsAutoCaptureRow() {
  const { t } = useTranslation();
  const router = useRouter();
  const status = useCaptureStatus();

  if (!isAutoCaptureSupported)
    return null;

  return (
    <SettingsSection title={t('settings.sections.automation')} testID="settings-automation">
      <SettingsRow
        testID="settings-auto-capture"
        label={t('autoCapture.title')}
        value={status.data ? t(`autoCapture.status.${status.data.status}`) : undefined}
        onPress={() => router.push('/auto-capture')}
      />
    </SettingsSection>
  );
}
