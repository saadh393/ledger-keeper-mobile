import type { Installment, InstallmentPayment } from '@/features/installments/schemas/installment-schema';
import type { InstallmentActions, InstallmentSheet } from '@/features/installments/types';
import * as React from 'react';

export function useInstallmentActions(setSheet: (sheet: InstallmentSheet) => void): InstallmentActions & { onAdd: () => void } {
  return React.useMemo(() => ({
    onAdd: () => setSheet({ kind: 'add' }),
    onEdit: (installment: Installment) => setSheet({ kind: 'edit', installment }),
    onPay: (installment: Installment) => setSheet({ kind: 'pay', installment }),
    onDelete: (installment: Installment) => setSheet({ kind: 'delete', installment }),
    onUndo: (installment: Installment, payment: InstallmentPayment) => setSheet({ kind: 'undo', installment, payment }),
  }), [setSheet]);
}
