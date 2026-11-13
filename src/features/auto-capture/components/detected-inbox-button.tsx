import { useRouter } from 'expo-router';
import { Inbox } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { useDetectedCount } from '@/features/auto-capture/api/use-detected-count';
import { isAutoCaptureSupported } from '@/features/auto-capture/native/notification-capture';
import { formatBadgeCount } from '@/features/auto-capture/utils/format-badge-count';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export function DetectedInboxButton() {
  const { t } = useTranslation();
  const router = useRouter();
  const themeColors = useThemeColors();
  const bookId = useActiveBook().activeBookId;
  const count = useDetectedCount(bookId, isAutoCaptureSupported);
  const badge = formatBadgeCount(count.data ?? 0);

  if (!isAutoCaptureSupported)
    return null;

  return (
    <Pressable
      testID="detected-inbox-button"
      accessibilityRole="button"
      accessibilityLabel={badge ? t('autoCapture.inbox.openWithCount', { count: count.data }) : t('autoCapture.inbox.open')}
      onPress={() => router.push('/detected')}
      className="size-11 items-center justify-center"
    >
      <Inbox size={22} color={themeColors['ink-700']} />
      {badge
        ? (
            <View className="absolute top-1 right-0.5 min-w-[18px] items-center rounded-full bg-clay-500 px-1">
              <Text testID="detected-inbox-badge" className="text-[11px] leading-[16px] font-semibold text-white">{badge}</Text>
            </View>
          )
        : null}
    </Pressable>
  );
}
