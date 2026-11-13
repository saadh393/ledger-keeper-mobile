import type { UpdateDebtInput } from '@/features/loans/api/update-debt';
import type { DebtFormValues } from '@/features/loans/schemas/debt-form-schema';
import type { Debt } from '@/features/loans/schemas/debt-schema';
import { buildDebtInput } from '@/features/loans/utils/build-debt-input';
import { toDayKey } from '@/lib/format/day-key';

function sameDay(a: string | null | undefined, b: string | null | undefined) {
  return (a ? toDayKey(a) : null) === (b ? toDayKey(b) : null);
}

export function getDebtChanges(debt: Debt, values: DebtFormValues): UpdateDebtInput {
  const input = buildDebtInput(values);
  const patch: UpdateDebtInput = {};
  if (input.counterparty !== debt.counterparty)
    patch.counterparty = input.counterparty;
  if (input.amount !== debt.amount)
    patch.amount = input.amount;
  if (!sameDay(input.dateIso, debt.dateIso))
    patch.dateIso = input.dateIso;
  if (!sameDay(input.dueDateIso, debt.dueDateIso))
    patch.dueDateIso = input.dueDateIso;
  if (input.note !== (debt.note?.trim() || null))
    patch.note = input.note;
  return patch;
}
