import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, EmptyState, Input, Text } from '@/components/ui';
import { useLaunchableApps } from '@/features/auto-capture/api/use-launchable-apps';
import { CaptureAppsList } from '@/features/auto-capture/components/capture-apps-list';
import { handOffCaptureAuth } from '@/features/auto-capture/hooks/use-auto-capture-sync';
import { useBackTo } from '@/features/auto-capture/hooks/use-back-to';
import { useSaveCaptureApps } from '@/features/auto-capture/hooks/use-save-capture-apps';
import { keepInstalled } from '@/features/auto-capture/utils/keep-installed';
import { useUserProfile } from '@/features/currency';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export function CaptureAppsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const enable = flow === 'enable';
  const query = useLaunchableApps();
  const save = useSaveCaptureApps();
  const bookId = useUserProfile().data?.defaultBookId;
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<Set<string> | null>(null);
  useBackTo(enable ? '/settings' : '/auto-capture');

  const chosen = selected ?? new Set(query.data ? keepInstalled(query.data.allowed, query.data.apps) : []);

  const toggle = React.useCallback((packageName: string) => {
    setSelected((current) => {
      const next = new Set(current ?? chosen);
      if (next.has(packageName))
        next.delete(packageName);
      else
        next.add(packageName);
      return next;
    });
  }, [chosen]);

  const done = () => {
    if (!query.data || chosen.size === 0 || save.isPending)
      return;
    save.mutate({ selected: [...chosen], apps: query.data.apps, enable }, {
      onSuccess: () => {
        if (enable && bookId)
          handOffCaptureAuth(bookId).catch(() => {});
        router.navigate('/auto-capture');
      },
    });
  };

  if (query.isError) {
    return <EmptyState testID="capture-apps-error" variant="error" title={t('autoCapture.apps.error')} actionLabel={t('autoCapture.retry')} onAction={() => query.refetch()} />;
  }

  return (
    <View testID="capture-apps-screen" className="flex-1 bg-paper-100">
      <View className="px-4 pt-3">
        <Input testID="capture-apps-search" placeholder={t('autoCapture.apps.search')} value={search} onChangeText={setSearch} autoCorrect={false} containerClassName="mb-1" />
        <Text className="text-meta text-ink-500">{t('autoCapture.apps.hiddenNote')}</Text>
      </View>
      <View className="flex-1">
        {query.data
          ? <CaptureAppsList apps={query.data.apps} query={search} selected={chosen} onToggle={toggle} />
          : <ActivityIndicator testID="capture-apps-loading" className="mt-8" color={themeColors['ink-500']} />}
      </View>
      <View className="gap-1 border-t border-border px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        {chosen.size === 0 ? <Text testID="capture-apps-hint" className="text-center text-meta text-ink-500">{t('autoCapture.apps.chooseOne')}</Text> : null}
        <Button testID="capture-apps-done" label={t('autoCapture.apps.done')} pending={save.isPending} disabled={chosen.size === 0 || save.isPending || !query.data} onPress={done} />
      </View>
    </View>
  );
}
