import type { TxKeyPath } from '@/lib/i18n';
import { toApiError } from '@/lib/api/errors';

export type TransactionFieldKey = 'title' | 'amount' | 'category' | 'date' | 'note' | 'type';

export type TransactionErrorResult
  = | {
    type: 'notFound';
    messageKey: TxKeyPath;
  }
  | {
    type: 'fieldErrors';
    fieldErrors: Partial<Record<TransactionFieldKey, string>>;
  }
  | {
    type: 'formError';
    messageKey: TxKeyPath;
  };

export function getTransactionError(error: unknown): TransactionErrorResult {
  const apiError = toApiError(error);

  if (apiError.kind === 'not_found' || apiError.status === 404 || apiError.code === 'transaction_not_found') {
    return {
      type: 'notFound',
      messageKey: 'ledger.form.notFound',
    };
  }

  if (apiError.kind === 'validation' || apiError.status === 422) {
    const fieldErrors: Partial<Record<TransactionFieldKey, string>> = {};

    if (apiError.code === 'transaction_itemized') {
      fieldErrors.amount = apiError.message || 'Total comes from the receipt items';
    }
    else if (apiError.code === 'category_not_found' || apiError.code === 'category_kind_mismatch') {
      fieldErrors.category = apiError.message;
    }

    if (Array.isArray(apiError.issues) && apiError.issues.length > 0) {
      for (const rawIssue of apiError.issues) {
        const issue = rawIssue as { path?: unknown[]; message?: string };
        const path = Array.isArray(issue.path) ? issue.path : [];
        const message = issue.message ?? 'Invalid value';

        if (path.includes('title')) {
          fieldErrors.title = message;
        }
        else if (path.includes('amount')) {
          fieldErrors.amount = message;
        }
        else if (path.includes('category')) {
          fieldErrors.category = message;
        }
        else if (path.includes('dateIso') || path.includes('date')) {
          fieldErrors.date = message;
        }
        else if (path.includes('note')) {
          fieldErrors.note = message;
        }
        else if (path.includes('kind') || path.includes('type')) {
          fieldErrors.type = message;
        }
      }
    }

    if (apiError.field) {
      const field = apiError.field as TransactionFieldKey;
      fieldErrors[field] = apiError.message;
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        type: 'fieldErrors',
        fieldErrors,
      };
    }

    return {
      type: 'formError',
      messageKey: 'ledger.errors.server',
    };
  }

  if (apiError.kind === 'offline' || apiError.kind === 'timeout') {
    return {
      type: 'formError',
      messageKey: 'ledger.errors.offline',
    };
  }

  return {
    type: 'formError',
    messageKey: 'ledger.errors.server',
  };
}
