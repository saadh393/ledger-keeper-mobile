import type { TransactionDraftArtifactData } from '@/features/assistant/schemas/draft-artifact-schemas';
import type { ArtifactTransaction } from '@/features/assistant/schemas/transaction-artifact-schemas';

export function toDraftTransaction(data: TransactionDraftArtifactData): ArtifactTransaction {
  return {
    id: data.savedId ?? data.draftId,
    kind: data.kind ?? 'expense',
    name: data.title ?? '',
    subtitle: '',
    category: data.category ?? '',
    dateIso: data.dateIso,
    amount: data.amount ?? 0,
    note: data.note,
    original: data.original,
    merchant: null,
    items: [],
    deleted: data.deleted,
  };
}
