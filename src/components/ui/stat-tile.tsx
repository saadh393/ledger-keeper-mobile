import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { twMerge } from '@/lib/tw-merge';

export type StatTileProps = {
  label: string;
  value: string | null;
  valueClassName?: string;
  fontSize?: number;
  stacked?: boolean;
  accessibilityLabel?: string;
  onLongPress?: () => void;
  testID?: string;
};

export function StatTile({ label, value, valueClassName, fontSize, stacked = false, accessibilityLabel, onLongPress, testID }: StatTileProps) {
  return (
    <Pressable
      testID={testID}
      accessible
      accessibilityLabel={accessibilityLabel ?? (value ? `${label}, ${value}` : label)}
      aria-busy={value === null}
      onLongPress={onLongPress}
      delayLongPress={450}
      className={twMerge('min-w-0 rounded-2xl bg-surface-container px-3 py-2.5', stacked ? 'flex-row items-center justify-between gap-3' : 'flex-1 basis-0')}
    >
      <Text numberOfLines={1} className="text-meta text-ink-500">{label}</Text>
      {value === null
        ? <View testID="stat-tile-placeholder" className="mt-1 h-6 w-2/3 rounded-md bg-border" />
        : (
            <Text
              testID="stat-tile-value"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              className={twMerge('text-title font-semibold text-ink-900', valueClassName)}
              style={[{ fontVariant: ['tabular-nums'] }, fontSize ? { fontSize, lineHeight: Math.round(fontSize * 1.3) } : null]}
            >
              {value}
            </Text>
          )}
    </Pressable>
  );
}
