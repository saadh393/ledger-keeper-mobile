import type { LaunchableApp } from '@/features/auto-capture/native/notification-capture';
import type { CaptureStatus } from '@/features/auto-capture/utils/get-capture-status';
import { Bell, BellOff } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, ToneTile } from '@/components/ui';
import { CaptureAppIcon } from '@/features/auto-capture/components/capture-app-icon';

export type CaptureStatusCardProps = {
  status: CaptureStatus;
  apps: LaunchableApp[];
  pendingCount?: number;
};

export function CaptureStatusCard({ status, apps, pendingCount }: CaptureStatusCardProps) {
  const { t } = useTranslation();
  const on = status === 'on';

  return (
    <View testID="capture-status-card" className="gap-3 rounded-3xl bg-surface-container p-4">
      <View className="flex-row items-center gap-3">
        <ToneTile tone={on ? 'income' : status === 'accessRemoved' ? 'warning' : 'info'} icon={on ? Bell : BellOff} />
        <Text testID="capture-status-label" className="flex-1 text-title text-ink-900">{t(`autoCapture.status.${status}`)}</Text>
      </View>
      {on
        ? apps.map(app => (
            <View key={app.packageName} className="flex-row items-center gap-3">
              <CaptureAppIcon packageName={app.packageName} size={24} />
              <Text className="text-body text-ink-900">{app.label}</Text>
            </View>
          ))
        : null}
      {on && pendingCount !== undefined
        ? <Text testID="capture-status-pending" className="text-meta text-ink-500">{t('autoCapture.status.pending', { count: pendingCount })}</Text>
        : null}
    </View>
  );
}
