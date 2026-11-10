import type { UpdateTransactionInput } from '@/features/ledger/api/update-transaction';
import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { TransactionFormValues } from '@/features/ledger/schemas/transaction-form-schema';
import { parseAmount } from '@/features/ledger/schemas/transaction-form-schema';
import { toDayKey } from '@/lib/format/day-key';

export function getTransactionChanges(
  row: TransactionRow,
  values: TransactionFormValues,
): UpdateTransactionInput {
  const patch: UpdateTransactionInput = {};

  if (values.type !== row.kind) {
    patch.kind = values.type;
  }

  const trimmedTitle = values.title.trim();
  if (trimmedTitle !== row.name) {
    patch.title = trimmedTitle;
  }

  if (values.category && values.category !== row.category) {
    patch.category = values.category;
  }

  const parsedAmount = parseAmount(values.amount);
  if (parsedAmount > 0 && parsedAmount !== row.amount) {
    patch.amount = parsedAmount;
  }

  if (toDayKey(values.date) !== toDayKey(row.dateIso)) {
    patch.dateIso = new Date(values.date).toISOString();
  }

  const trimmedNote = values.note ? values.note.trim() : null;
  const existingNote = row.note ? row.note.trim() : null;
  if (trimmedNote !== existingNote) {
    patch.note = trimmedNote;
  }

  return patch;
}

export function hasFormChanges(
  values: TransactionFormValues,
  row?: TransactionRow,
  initialDate?: string,
): boolean {
  if (row) {
    return Object.keys(getTransactionChanges(row, values)).length > 0;
  }

  const isTypeDirty = values.type !== 'expense';
  const isAmountDirty = values.amount.trim().length > 0;
  const isTitleDirty = values.title.trim().length > 0;
  const isCategoryDirty = values.category.trim().length > 0;
  const isNoteDirty = values.note.trim().length > 0;
  const isDateDirty = initialDate ? toDayKey(values.date) !== toDayKey(initialDate) : toDayKey(values.date) !== toDayKey(new Date());

  return isTypeDirty || isAmountDirty || isTitleDirty || isCategoryDirty || isNoteDirty || isDateDirty;
}
