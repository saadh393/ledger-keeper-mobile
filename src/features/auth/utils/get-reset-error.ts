import type { TFunction } from 'i18next';
import { ApiError, toApiError } from '@/lib/api/errors';

export type ResetError = { type: 'expired' } | { type: 'message'; message: string };

export function getResetError(error: unknown, t: TFunction): ResetError {
  const apiError = error instanceof ApiError ? error : toApiError(error);
  if (apiError.kind === 'offline')
    return { type: 'message', message: t('auth.errors.offline') };
  if (apiError.status === 400 && (apiError.data as { code?: string } | undefined)?.code === 'INVALID_TOKEN')
    return { type: 'expired' };
  return { type: 'message', message: t('auth.errors.serverError') };
}
