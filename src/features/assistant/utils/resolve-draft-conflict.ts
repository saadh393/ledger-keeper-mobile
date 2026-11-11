import type { TransactionDraftArtifactData } from '@/features/assistant/schemas/draft-artifact-schemas';
import type { ApiError } from '@/lib/api';

const conflictStatuses: Record<string, TransactionDraftArtifactData['status']> = {
  draft_dismissed: 'dismissed',
  draft_saved: 'saved',
};

export function resolveDraftConflict(error: ApiError, data: TransactionDraftArtifactData): TransactionDraftArtifactData | null {
  const status = error.kind === 'conflict' && error.code ? conflictStatuses[error.code] : undefined;
  return status ? { ...data, status } : null;
}
