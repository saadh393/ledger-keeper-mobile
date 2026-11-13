import type { CreateDebtInput } from '@/features/loans/api/create-debt';
import type { DebtFormValues } from '@/features/loans/schemas/debt-form-schema';
import { parseAmount } from '@/features/ledger/schemas/amount-schema';

export function buildDebtInput(values: DebtFormValues): CreateDebtInput {
  return {
    direction: values.direction,
    counterparty: values.counterparty.trim(),
    amount: parseAmount(values.amount),
    dateIso: new Date(values.date).toISOString(),
    dueDateIso: values.dueDate ? new Date(values.dueDate).toISOString() : null,
    note: values.note.trim() || null,
  };
}
