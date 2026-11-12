import type { z } from 'zod';
import type { DraftConfirmInput } from '@/features/assistant/utils/draft-confirm-input';
import type { PayInstallmentInput, ReceiptConfirmInput } from '@/features/receipts/utils/receipt-draft-values';
import { apiClient, parse } from '@/lib/api';

export type DraftAction
  = | { type: 'confirm'; input: DraftConfirmInput }
    | { type: 'confirm-receipt'; input: ReceiptConfirmInput }
    | { type: 'pay-installment'; input: PayInstallmentInput }
    | { type: 'dismiss' }
    | { type: 'restore' };

export type DraftTarget = {
  conversationId: string;
  artifactId: string;
};

export async function runDraftAction<T>({ conversationId, artifactId }: DraftTarget, action: DraftAction, schema: z.ZodType<T>): Promise<T> {
  const response = await apiClient.post(
    `/conversations/${conversationId}/artifacts/${artifactId}/${action.type}`,
    'input' in action ? action.input : undefined,
  );
  return parse(schema, response.data);
}
