import type { Installment } from '@/features/installments/schemas/installment-schema';
import * as React from 'react';

export function useExpandedInstallment() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const toggle = React.useCallback((installment: Installment) => setExpandedId(current => (current === installment.id ? null : installment.id)), []);
  return { expandedId, toggle };
}
