import type { Debt, Repayment } from '@/features/loans/schemas/debt-schema';
import type { LoanActions, LoanSheet } from '@/features/loans/types';
import * as React from 'react';

export function useLoanActions(setSheet: (sheet: LoanSheet) => void): LoanActions & { onAdd: () => void } {
  return React.useMemo(() => ({
    onAdd: () => setSheet({ kind: 'add' }),
    onEdit: (debt: Debt) => setSheet({ kind: 'edit', debt }),
    onRepay: (debt: Debt) => setSheet({ kind: 'repay', debt }),
    onDelete: (debt: Debt) => setSheet({ kind: 'delete', debt }),
    onUndo: (debt: Debt, repayment: Repayment) => setSheet({ kind: 'undo', debt, repayment }),
  }), [setSheet]);
}
