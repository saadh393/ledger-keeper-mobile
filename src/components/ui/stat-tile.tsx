import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { twMerge } from '@/lib/tw-merge';

export type StatTileTone = 'income' | 'expense' | 'info' | 'warning' | 'neutral';

export type StatTileProps = {
  label: string;
  value?: string | number;
  valueClassName?: string;
  tone?: StatTileTone;
  dotColor?: string;
  loading?: boolean;
  onPress?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
} & Omit<ViewProps, 'style'>;

const dotToneStyles: Record<StatTileTone, string> = {
  income: 'bg-forest-500',
  expense: 'bg-clay-500',
  info: 'bg-link',
  warning: 'bg-wheat-500',
  neutral: 'bg-ink-500',
};

export function StatTile({
  label,
  value,
  valueClassName,
  tone = 'neutral',
  dotColor,
  loading = false,
  onPress,
  className = '',
  style,
  testID,
  accessibilityLabel,
  ...props
}: StatTileProps) {
  const { t } = useTranslation();
  const isPressable = Boolean(onPress);
  const dotClass = dotToneStyles[tone] ?? 'bg-ink-500';

  const containerClasses = twMerge(
    'justify-between rounded-[20px] bg-surface-container p-4',
    isPressable && 'active:opacity-80',
    className,
  );

  const defaultAccessibilityLabel = loading
    ? `${label}, ${t('common.loading')}`
    : `${label}: ${value ?? ''}`;

  const content = (
    <>
      <View className="mb-2 flex-row items-center gap-2">
        <View
          testID="stat-tile-dot"
          className={twMerge('size-2 rounded-full', dotClass)}
          style={dotColor ? { backgroundColor: dotColor } : undefined}
          accessibilityElementsHidden
          importantForAccessibility="no"
          aria-hidden
        />
        <Text
          className="text-label text-ink-500"
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>

      {loading
        ? (
            <View
              testID="stat-tile-placeholder"
              className="mt-1 h-6 w-24 rounded-md bg-border"
              accessibilityLabel={t('common.loading')}
            />
          )
        : (
            <Text
              testID="stat-tile-value"
              className={twMerge('text-hero text-ink-900', valueClassName)}
              style={{ fontVariant: ['tabular-nums'] }}
              adjustsFontSizeToFit
              numberOfLines={2}
              minimumFontScale={0.65}
            >
              {value !== undefined && value !== null ? String(value) : ''}
            </Text>
          )}
    </>
  );

  if (isPressable) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? defaultAccessibilityLabel}
        aria-busy={loading}
        className={containerClasses}
        style={style}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? defaultAccessibilityLabel}
      aria-busy={loading}
      className={containerClasses}
      style={style}
      {...props}
    >
      {content}
    </View>
  );
}
