import type { InstallmentFormValues } from '@/features/installments/schemas/installment-form-schema';
import { parseCount } from '@/features/installments/schemas/installment-form-schema';
import { parseAmount } from '@/features/ledger/schemas/amount-schema';

export type InstallmentInput = {
  title: string;
  category: string;
  amount: number;
  totalCount: number;
};

export function buildInstallmentInput(values: InstallmentFormValues): InstallmentInput {
  return {
    title: values.title.trim(),
    category: values.category.trim(),
    amount: parseAmount(values.amount),
    totalCount: parseCount(values.totalCount),
  };
}
