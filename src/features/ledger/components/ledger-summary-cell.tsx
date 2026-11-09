import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { twMerge } from '@/lib/tw-merge';

export type LedgerSummaryCellProps = {
  label: string;
  value: string;
  valueClassName?: string;
  loading: boolean;
  accessibilityLabel: string;
  className?: string;
};

export function LedgerSummaryCell({
  label,
  value,
  valueClassName,
  loading,
  accessibilityLabel,
  className,
}: LedgerSummaryCellProps) {
  return (
    <View
      testID="ledger-summary-cell"
      accessible
      accessibilityLabel={accessibilityLabel}
      aria-busy={loading}
      className={twMerge('min-w-0 px-1.5 py-0.5', className)}
    >
      <Text className="text-label text-ink-500" numberOfLines={1}>
        {label}
      </Text>
      {loading
        ? <View testID="ledger-summary-placeholder" className="my-0.5 h-4 w-16 rounded-md bg-border" />
        : (
            <Text
              testID="ledger-summary-value"
              className={twMerge('text-row-title text-ink-900', valueClassName)}
              style={{ fontVariant: ['tabular-nums'] }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {value}
            </Text>
          )}
    </View>
  );
}
