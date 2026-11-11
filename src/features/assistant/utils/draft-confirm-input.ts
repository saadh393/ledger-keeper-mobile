import type { TransactionDraftArtifactData } from '@/features/assistant/schemas/draft-artifact-schemas';
import { parseAmount } from '@/features/ledger/schemas/transaction-form-schema';

export type DraftValues = {
  kind: 'income' | 'expense' | null;
  title: string;
  category: string;
  amount: string;
  dateIso: string;
};

export type DraftConfirmInput = {
  kind: 'income' | 'expense';
  title: string;
  category: string;
  amount: number;
  dateIso: string;
};

export function toDraftValues(data: TransactionDraftArtifactData): DraftValues {
  return {
    kind: data.kind,
    title: data.title ?? '',
    category: data.category ?? '',
    amount: data.amount === null ? '' : String(data.amount),
    dateIso: data.dateIso,
  };
}

export function isDraftAmountMissing(values: DraftValues) {
  return !(parseAmount(values.amount) > 0);
}

export function toDraftConfirmInput(values: DraftValues): DraftConfirmInput | null {
  const title = values.title.trim();
  const category = values.category.trim();
  if (!values.kind || !title || !category || isDraftAmountMissing(values))
    return null;
  return { kind: values.kind, title, category, amount: parseAmount(values.amount), dateIso: new Date(values.dateIso).toISOString() };
}
