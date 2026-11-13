import type { StorePack } from '@/features/credits/utils/to-store-packs';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { formatNumber } from '@/lib/format/number';
import { useThemeColors } from '@/lib/theme/use-theme-colors';
import { twMerge } from '@/lib/tw-merge';

export type BuyCreditsPackRowProps = {
  pack: StorePack;
  locale: Language;
  pending: boolean;
  disabled: boolean;
  onPress: (pack: StorePack) => void;
};

export function BuyCreditsPackRow({ pack, locale, pending, disabled, onPress }: BuyCreditsPackRowProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();

  return (
    <Pressable
      testID={`buy-credits-pack-${pack.id}`}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: pending }}
      disabled={disabled}
      onPress={() => onPress(pack)}
      className={twMerge('min-h-[56px] flex-row items-center gap-3 rounded-2xl bg-surface-container px-4 py-3', disabled && !pending ? 'opacity-50' : '')}
    >
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="text-row-title text-ink-900">{pack.name}</Text>
        <Text className="text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>
          {t('credits.purchase.credits', { count: pack.credits, credits: formatNumber(pack.credits, locale) })}
        </Text>
      </View>
      {pending
        ? <ActivityIndicator testID="buy-credits-pack-pending" color={themeColors['ink-500']} />
        : <Text className="text-row-title text-link" style={{ fontVariant: ['tabular-nums'] }}>{pack.price}</Text>}
    </Pressable>
  );
}
