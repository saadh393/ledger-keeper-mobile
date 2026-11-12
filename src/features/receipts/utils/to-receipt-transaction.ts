import type { ArtifactTransaction } from '@/features/assistant/schemas/transaction-artifact-schemas';
import type { ReceiptDraftArtifactData } from '@/features/receipts/schemas/receipt-artifact-schemas';

function toItems(data: ReceiptDraftArtifactData, adjustmentTitle: string): ArtifactTransaction['items'] {
  if (data.savedAs === 'installment_payment')
    return [];
  const items = data.items.map((item, index) => ({ ...item, id: String(index), type: 'item', amount: item.amount ?? 0 }));
  return data.adjustment
    ? [...items, { id: 'adjustment', type: 'adjustment', title: adjustmentTitle, category: null, amount: data.adjustment, quantity: null, note: null }]
    : items;
}

export function toReceiptTransaction(data: ReceiptDraftArtifactData, adjustmentTitle: string): ArtifactTransaction {
  return {
    id: data.savedId ?? data.draftId,
    kind: 'expense',
    name: data.title ?? data.merchant ?? '',
    subtitle: '',
    category: data.category ?? '',
    dateIso: data.dateIso,
    amount: data.total,
    note: null,
    original: data.original,
    merchant: data.merchant,
    items: toItems(data, adjustmentTitle),
    deleted: data.deleted,
  };
}
