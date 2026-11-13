import type { Debt } from '@/features/loans/schemas/debt-schema';
import * as React from 'react';

export function useExpandedDebt() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const toggle = React.useCallback((debt: Debt) => setExpandedId(current => (current === debt.id ? null : debt.id)), []);
  return { expandedId, toggle };
}
