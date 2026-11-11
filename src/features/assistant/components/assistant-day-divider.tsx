import * as React from 'react';
import { Text } from '@/components/ui';

export function AssistantDayDivider({ label }: { label: string }) {
  return (
    <Text testID="assistant-day-divider" accessibilityRole="header" className="py-3 text-center text-meta text-ink-500 tabular-nums">
      {label}
    </Text>
  );
}
