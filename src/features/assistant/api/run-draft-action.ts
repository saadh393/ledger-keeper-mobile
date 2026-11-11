import type { TransactionDraftArtifactData } from '@/features/assistant/schemas/draft-artifact-schemas';
import type { DraftConfirmInput } from '@/features/assistant/utils/draft-confirm-input';
import { transactionDraftArtifactSchema } from '@/features/assistant/schemas/draft-artifact-schemas';
import { apiClient, parse } from '@/lib/api';

export type DraftAction
  = | { type: 'confirm'; input: DraftConfirmInput }
    | { type: 'dismiss' }
    | { type: 'restore' };

export async function runDraftAction(conversationId: string, artifactId: string, action: DraftAction): Promise<TransactionDraftArtifactData> {
  const response = await apiClient.post(
    `/conversations/${conversationId}/artifacts/${artifactId}/${action.type}`,
    action.type === 'confirm' ? action.input : undefined,
  );
  return parse(transactionDraftArtifactSchema, response.data);
}
