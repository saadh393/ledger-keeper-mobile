import * as React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export type LedgerSummaryErrorProps = {
  message: string;
  actionLabel: string;
  loading: boolean;
  onRetry: () => void;
};

export function LedgerSummaryError({ message, actionLabel, loading, onRetry }: LedgerSummaryErrorProps) {
  return (
    <View
      testID="ledger-stats-error"
      className="mx-4 flex-row items-center gap-2 rounded-2xl bg-surface-container py-1 pr-1 pl-4"
    >
      <Text accessibilityRole="alert" className="flex-1 text-meta text-clay-500">
        {message}
      </Text>
      <Button variant="text" size="compact" label={actionLabel} loading={loading} onPress={onRetry} />
    </View>
  );
}
