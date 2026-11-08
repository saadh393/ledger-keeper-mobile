import type { TxKeyPath } from '@/lib/i18n';
import { toApiError } from '@/lib/api/errors';

export type BookError = {
  field: 'name' | 'currency' | 'form';
  messageKey: TxKeyPath;
  retryable: boolean;
};

const CONFLICT_ERRORS: Record<string, BookError> = {
  book_name_taken: { field: 'name', messageKey: 'books.errors.nameTaken', retryable: false },
  book_not_empty: { field: 'currency', messageKey: 'books.errors.currencyLocked', retryable: false },
  default_book: { field: 'form', messageKey: 'books.errors.defaultBook', retryable: false },
};

export function getBookError(error: unknown): BookError {
  const apiError = toApiError(error);
  const conflict = apiError.kind === 'conflict' && apiError.code ? CONFLICT_ERRORS[apiError.code] : undefined;
  if (conflict) {
    return conflict;
  }
  if (apiError.kind === 'offline' || apiError.kind === 'timeout') {
    return { field: 'form', messageKey: 'books.errors.offline', retryable: true };
  }
  return { field: 'form', messageKey: 'books.errors.server', retryable: true };
}
