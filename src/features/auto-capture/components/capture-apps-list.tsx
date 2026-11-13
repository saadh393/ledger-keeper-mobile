import type { LaunchableApp } from '@/features/auto-capture/native/notification-capture';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList } from 'react-native';
import { Text } from '@/components/ui';
import { CaptureAppRow } from '@/features/auto-capture/components/capture-app-row';
import { SUGGESTED_PACKAGES } from '@/features/auto-capture/constants/suggested-apps';
import { orderApps } from '@/features/auto-capture/utils/order-apps';

export type CaptureAppsListProps = {
  apps: LaunchableApp[];
  query: string;
  selected: ReadonlySet<string>;
  onToggle: (packageName: string) => void;
};

export function CaptureAppsList({ apps, query, selected, onToggle }: CaptureAppsListProps) {
  const { t } = useTranslation();
  const sections = React.useMemo(() => {
    const ordered = orderApps(apps, SUGGESTED_PACKAGES, query);
    return [
      { key: 'suggested', title: t('autoCapture.apps.suggested'), data: ordered.suggested },
      { key: 'all', title: t('autoCapture.apps.all'), data: ordered.others },
    ].filter(section => section.data.length > 0);
  }, [apps, query, t]);

  return (
    <SectionList
      testID="capture-apps-list"
      sections={sections}
      keyExtractor={item => item.packageName}
      initialNumToRender={20}
      extraData={selected}
      keyboardShouldPersistTaps="handled"
      renderSectionHeader={({ section }) => <Text accessibilityRole="header" className="bg-paper-100 px-4 pt-4 pb-1 text-label text-ink-500">{section.title}</Text>}
      renderItem={({ item }) => <CaptureAppRow app={item} checked={selected.has(item.packageName)} onToggle={onToggle} />}
      ListEmptyComponent={<Text className="px-4 py-6 text-center text-body text-ink-500">{t('autoCapture.apps.noMatch')}</Text>}
    />
  );
}
