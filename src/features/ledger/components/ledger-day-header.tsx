import * as React from 'react';
import { Text } from '@/components/ui';

export function LedgerDayHeader({ label }: { label: string }) {
  return (
    <Text testID="ledger-day-header" accessibilityRole="header" className="px-4 pt-4 pb-1 text-label text-ink-500 tabular-nums">
      {label}
    </Text>
  );
}
