import { getTransactionError } from '@/features/ledger/utils/get-transaction-error';
import { ApiError } from '@/lib/api/errors';

describe('getTransactionError', () => {
  it('identifies 404 not found error', () => {
    const error = new ApiError({ kind: 'not_found', status: 404, code: 'transaction_not_found' });
    const result = getTransactionError(error);
    expect(result).toEqual({
      type: 'notFound',
      messageKey: 'ledger.form.notFound',
    });
  });

  it('identifies 422 validation error with issues', () => {
    const error = new ApiError({
      kind: 'validation',
      status: 422,
      issues: [
        { path: ['title'], message: 'Title is too long' },
        { path: ['amount'], message: 'Amount is invalid' },
      ],
    });
    const result = getTransactionError(error);
    expect(result).toEqual({
      type: 'fieldErrors',
      fieldErrors: {
        title: 'Title is too long',
        amount: 'Amount is invalid',
      },
    });
  });

  it('identifies 422 transaction_itemized error', () => {
    const error = new ApiError({
      kind: 'validation',
      status: 422,
      code: 'transaction_itemized',
      message: 'Total comes from the receipt items',
    });
    const result = getTransactionError(error);
    expect(result).toEqual({
      type: 'fieldErrors',
      fieldErrors: {
        amount: 'Total comes from the receipt items',
      },
    });
  });

  it('identifies offline and timeout errors', () => {
    const offlineError = new ApiError({ kind: 'offline' });
    expect(getTransactionError(offlineError)).toEqual({
      type: 'formError',
      messageKey: 'ledger.errors.offline',
    });

    const timeoutError = new ApiError({ kind: 'timeout' });
    expect(getTransactionError(timeoutError)).toEqual({
      type: 'formError',
      messageKey: 'ledger.errors.offline',
    });
  });

  it('identifies general server error', () => {
    const serverError = new ApiError({ kind: 'server', status: 500 });
    expect(getTransactionError(serverError)).toEqual({
      type: 'formError',
      messageKey: 'ledger.errors.server',
    });
  });
});
