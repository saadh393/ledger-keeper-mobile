import type { Installment } from '@/features/installments/schemas/installment-schema';
import { createInstallmentFormSchema } from '@/features/installments/schemas/installment-form-schema';
import { getInstallmentChanges } from '@/features/installments/utils/get-installment-changes';
import { getInstallmentError } from '@/features/installments/utils/get-installment-error';
import { getInstallmentTotal } from '@/features/installments/utils/get-installment-total';
import { sortPayments } from '@/features/installments/utils/sort-payments';
import { sumRemaining } from '@/features/installments/utils/sum-remaining';
import { ApiError } from '@/lib/api/errors';

const plan: Installment = { id: 'p1', title: 'Phone EMI', category: 'Gadgets', amount: 5000, totalCount: 12, paidCount: 3, remainingAmount: 45000, currency: 'BDT', status: 'active' };
const values = { title: 'Phone EMI', category: 'Gadgets', amount: '5000', totalCount: '12' };
const t = ((key: string, options?: Record<string, unknown>) => (options ? `${key} ${JSON.stringify(options)}` : key)) as never;
const messages = {
  amountRequired: 'amountRequired',
  amountInvalid: 'amountInvalid',
  amountPositive: 'amountPositive',
  amountTooLarge: 'amountTooLarge',
  amountDecimals: 'amountDecimals',
  titleRequired: 'titleRequired',
  titleTooLong: 'titleTooLong',
  categoryRequired: 'categoryRequired',
  countInvalid: 'countInvalid',
  countBelowPaid: 'countBelowPaid',
};

function issues(input: typeof values, paidCount = 0) {
  const result = createInstallmentFormSchema(messages, paidCount).safeParse(input);
  return result.success ? [] : result.error.issues.map(issue => issue.message);
}

describe('installment form schema', () => {
  it('accepts a valid plan, including Bangla digits', () => {
    expect(issues(values)).toEqual([]);
    expect(issues({ ...values, amount: '৫০০০', totalCount: '১২' })).toEqual([]);
  });

  it('requires a title and a category', () => {
    expect(issues({ ...values, title: '  ', category: '' })).toEqual(['titleRequired', 'categoryRequired']);
    expect(issues({ ...values, title: 'x'.repeat(201) })).toEqual(['titleTooLong']);
  });

  it.each(['0', '601', '1.5', 'ten', ''])('rejects %p installments', (totalCount) => {
    expect(issues({ ...values, totalCount })).toContain('countInvalid');
  });

  it('rejects amounts with more than 2 decimals', () => {
    expect(issues({ ...values, amount: '10.123' })).toEqual(['amountDecimals']);
  });

  it('does not allow fewer installments than already paid', () => {
    expect(issues({ ...values, totalCount: '2' }, 3)).toEqual(['countBelowPaid']);
    expect(issues({ ...values, totalCount: '3' }, 3)).toEqual([]);
  });
});

describe('getInstallmentTotal', () => {
  it('previews count × amount', () => {
    expect(getInstallmentTotal('5000', '12')).toEqual({ count: 12, amount: 5000, total: 60000 });
    expect(getInstallmentTotal('৳1,250.50', '4')).toBeNull();
    expect(getInstallmentTotal('1,250.50', '4')).toEqual({ count: 4, amount: 1250.5, total: 5002 });
  });

  it('shows nothing until both values are valid', () => {
    expect(getInstallmentTotal('', '12')).toBeNull();
    expect(getInstallmentTotal('5000', '0')).toBeNull();
    expect(getInstallmentTotal('5000', '601')).toBeNull();
  });
});

describe('getInstallmentChanges', () => {
  it('sends only changed fields', () => {
    expect(getInstallmentChanges(plan, values)).toEqual({});
    expect(getInstallmentChanges(plan, { ...values, title: ' Phone ', totalCount: '10' })).toEqual({ title: 'Phone', totalCount: 10 });
    expect(getInstallmentChanges(plan, { ...values, amount: '৪০০০', category: 'Bills' })).toEqual({ amount: 4000, category: 'Bills' });
  });
});

describe('getInstallmentError', () => {
  it('maps each server error', () => {
    expect(getInstallmentError(new ApiError({ kind: 'not_found', status: 404 }), t, '3').type).toBe('notFound');
    expect(getInstallmentError(new ApiError({ kind: 'validation', status: 422, code: 'installment_completed' }), t, '3')).toEqual({ type: 'completed', message: 'installments.errors.completed' });
    expect(getInstallmentError(new ApiError({ kind: 'validation', status: 422, code: 'count_below_paid' }), t, '3'))
      .toEqual({ type: 'fields', fields: { totalCount: 'installments.errors.countBelowPaid {"paid":"3"}' } });
    expect(getInstallmentError(new ApiError({ kind: 'validation', status: 422, code: 'invalid_installment_count' }), t, '3'))
      .toEqual({ type: 'fields', fields: { totalCount: 'installments.errors.countInvalid' } });
    expect(getInstallmentError(new ApiError({ kind: 'validation', status: 422, issues: [{ path: ['title'], message: 'Too long' }] }), t, '3'))
      .toEqual({ type: 'fields', fields: { title: 'Too long' } });
    expect(getInstallmentError(new ApiError({ kind: 'offline' }), t, '3')).toEqual({ type: 'form', message: 'installments.errors.offline' });
    expect(getInstallmentError(new ApiError({ kind: 'server', status: 500 }), t, '3')).toEqual({ type: 'form', message: 'installments.errors.server' });
  });
});

describe('list helpers', () => {
  it('sums the remaining amount of active plans only', () => {
    expect(sumRemaining([plan, { ...plan, id: 'p2', remainingAmount: 1000 }, { ...plan, id: 'p3', status: 'completed', remainingAmount: 0 }])).toBe(46000);
  });

  it('sorts payments newest first', () => {
    const payments = [
      { id: 'a', amount: 1, dateIso: '2026-09-01T06:00:00.000Z', note: null },
      { id: 'b', amount: 1, dateIso: '2026-11-01T06:00:00.000Z', note: null },
      { id: 'c', amount: 1, dateIso: '2026-10-01T06:00:00.000Z', note: null },
    ];
    expect(sortPayments(payments).map(payment => payment.id)).toEqual(['b', 'c', 'a']);
  });
});
