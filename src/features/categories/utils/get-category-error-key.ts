import type { TxKeyPath } from '@/lib/i18n';
import { toApiError } from '@/lib/api/errors';

export function getCategoryErrorKey(error: unknown): TxKeyPath {
  const { kind, code } = toApiError(error);
  if (code === 'category_name_taken')
    return 'categories.errors.nameTaken';
  if (code === 'category_builtin' || kind === 'forbidden')
    return 'categories.errors.builtIn';
  return kind === 'offline' || kind === 'timeout' ? 'categories.errors.offline' : 'categories.errors.server';
}
