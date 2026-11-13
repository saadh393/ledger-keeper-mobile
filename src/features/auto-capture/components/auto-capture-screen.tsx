import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { Button, EmptyState, Text } from '@/components/ui';
import { useDetectedCount } from '@/features/auto-capture/api/use-detected-count';
import { useLaunchableApps } from '@/features/auto-capture/api/use-launchable-apps';
import { CaptureStatusCard } from '@/features/auto-capture/components/capture-status-card';
import { CaptureTurnOffSheet } from '@/features/auto-capture/components/capture-turn-off-sheet';
import { useBackTo } from '@/features/auto-capture/hooks/use-back-to';
import { useCaptureStatus } from '@/features/auto-capture/hooks/use-capture-status';
import { isAutoCaptureSupported, notificationCapture } from '@/features/auto-capture/native/notification-capture';
import { useUserProfile } from '@/features/currency';

export function AutoCaptureScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const status = useCaptureStatus();
  const apps = useLaunchableApps();
  const bookId = useUserProfile().data?.defaultBookId ?? null;
  const on = status.data?.status === 'on';
  const count = useDetectedCount(bookId, on);
  const [turningOff, setTurningOff] = React.useState(false);
  useBackTo('/settings');

  if (!isAutoCaptureSupported)
    return <EmptyState testID="auto-capture-unsupported" title={t('autoCapture.unsupported')} />;

  if (!status.data)
    return null;

  const chosen = (apps.data?.apps ?? []).filter(app => status.data.packages.includes(app.packageName));

  return (
    <ScrollView testID="auto-capture-screen" className="flex-1 bg-paper-100" contentContainerClassName="gap-4 px-4 py-4">
      <CaptureStatusCard status={status.data.status} apps={chosen} pendingCount={count.isSuccess ? count.data : undefined} />
      {status.data.status === 'off' ? <Button testID="auto-capture-turn-on" label={t('autoCapture.actions.turnOn')} onPress={() => router.push('/auto-capture-consent')} /> : null}
      {status.data.status === 'accessRemoved' ? <Button testID="auto-capture-reenable" label={t('autoCapture.actions.reenable')} onPress={() => router.push('/auto-capture-consent')} /> : null}
      {on
        ? (
            <View className="gap-2">
              <Button testID="auto-capture-change-apps" variant="secondary" label={t('autoCapture.actions.changeApps')} onPress={() => router.push('/auto-capture-apps')} />
              <Button testID="auto-capture-turn-off" variant="destructive" label={t('autoCapture.actions.turnOff')} onPress={() => setTurningOff(true)} />
            </View>
          )
        : null}
      <View className="gap-2 pt-2">
        <Text className="text-meta text-ink-500">{t('autoCapture.androidNote')}</Text>
        <Button testID="auto-capture-open-settings" variant="text" label={t('autoCapture.actions.openSettings')} onPress={() => notificationCapture.openAccessSettings()} />
      </View>
      {turningOff ? <CaptureTurnOffSheet bookId={bookId} onDismiss={() => setTurningOff(false)} /> : null}
    </ScrollView>
  );
}
