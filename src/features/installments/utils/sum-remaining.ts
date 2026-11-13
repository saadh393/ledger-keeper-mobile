import type { Installment } from '@/features/installments/schemas/installment-schema';

export function sumRemaining(installments: Installment[]) {
  return installments.reduce((sum, item) => (item.status === 'active' ? sum + item.remainingAmount : sum), 0);
}
