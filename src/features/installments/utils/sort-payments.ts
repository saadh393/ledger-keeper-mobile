import type { InstallmentPayment } from '@/features/installments/schemas/installment-schema';

export function sortPayments(payments: InstallmentPayment[]) {
  return [...payments].sort((a, b) => b.dateIso.localeCompare(a.dateIso));
}
