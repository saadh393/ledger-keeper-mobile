import type { Installment, InstallmentPayment } from '@/features/installments/schemas/installment-schema';

export type InstallmentSheet
  = | { kind: 'add' }
    | { kind: 'edit'; installment: Installment }
    | { kind: 'pay'; installment: Installment }
    | { kind: 'delete'; installment: Installment }
    | { kind: 'undo'; installment: Installment; payment: InstallmentPayment };

export type InstallmentActions = {
  onEdit: (installment: Installment) => void;
  onPay: (installment: Installment) => void;
  onDelete: (installment: Installment) => void;
  onUndo: (installment: Installment, payment: InstallmentPayment) => void;
};
