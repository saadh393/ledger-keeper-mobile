import type { TxKeyPath } from '@/lib/i18n';
import { toApiError } from '@/lib/api/errors';

export function getCategoryErrorKey(error: unknown): TxKeyPath {
  const { kind } = toApiError(error);
  return kind === 'offline' || kind === 'timeout' ? 'categories.errors.offline' : 'categories.errors.server';
}
