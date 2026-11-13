import type { InstallmentFormValues } from '@/features/installments/schemas/installment-form-schema';
import type { Installment } from '@/features/installments/schemas/installment-schema';
import type { InstallmentInput } from '@/features/installments/utils/build-installment-input';
import { buildInstallmentInput } from '@/features/installments/utils/build-installment-input';

export function getInstallmentChanges(installment: Installment, values: InstallmentFormValues): Partial<InstallmentInput> {
  const next = buildInstallmentInput(values);
  const changes: Partial<InstallmentInput> = {};
  if (next.title !== installment.title)
    changes.title = next.title;
  if (next.category !== (installment.category ?? ''))
    changes.category = next.category;
  if (next.amount !== installment.amount)
    changes.amount = next.amount;
  if (next.totalCount !== installment.totalCount)
    changes.totalCount = next.totalCount;
  return changes;
}
