import type { ApiError } from '@/lib/api';

type DraftStatus = 'draft' | 'saved' | 'dismissed';

const conflictStatuses: Record<string, DraftStatus> = {
  draft_dismissed: 'dismissed',
  draft_saved: 'saved',
};

export function resolveDraftConflict<T extends { status: DraftStatus }>(error: ApiError, data: T): T | null {
  const status = error.kind === 'conflict' && error.code ? conflictStatuses[error.code] : undefined;
  return status ? { ...data, status } : null;
}
