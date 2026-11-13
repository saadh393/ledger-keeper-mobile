import type { Debt, Repayment } from '@/features/loans/schemas/debt-schema';

export type LoanSheet
  = | { kind: 'add' }
    | { kind: 'edit'; debt: Debt }
    | { kind: 'repay'; debt: Debt }
    | { kind: 'delete'; debt: Debt }
    | { kind: 'undo'; debt: Debt; repayment: Repayment };

export type LoanActions = {
  onEdit: (debt: Debt) => void;
  onRepay: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onUndo: (debt: Debt, repayment: Repayment) => void;
};
