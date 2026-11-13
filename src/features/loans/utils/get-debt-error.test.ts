import type { TFunction } from 'i18next';
import { getDebtError } from '@/features/loans/utils/get-debt-error';
import { ApiError } from '@/lib/api/errors';
import i18n from '@/lib/i18n';

const context = { t: i18n.t.bind(i18n) as TFunction, formatAmount: (value: number) => `৳${value}`, repaid: 300, outstanding: 700 };

describe('getDebtError', () => {
  it('maps amount_below_repaid to the amount field', () => {
    const error = new ApiError({ kind: 'validation', status: 422, code: 'amount_below_repaid' });
    expect(getDebtError(error, context)).toEqual({ type: 'fields', fields: { amount: 'Amount can\'t be less than the ৳300 already repaid' } });
  });

  it('maps repayment_exceeds_debt using the server outstanding', () => {
    const error = new ApiError({ kind: 'validation', status: 422, code: 'repayment_exceeds_debt', data: { code: 'repayment_exceeds_debt', outstanding: 600 } });
    expect(getDebtError(error, context)).toEqual({ type: 'fields', fields: { amount: 'Only ৳600 is outstanding' } });
  });

  it('maps debt_settled to a form message', () => {
    expect(getDebtError(new ApiError({ kind: 'validation', status: 422, code: 'debt_settled' }), context)).toEqual({ type: 'form', message: 'This loan is already settled' });
  });

  it('maps debt_not_found', () => {
    expect(getDebtError(new ApiError({ kind: 'not_found', status: 404, code: 'debt_not_found' }), context)).toEqual({ type: 'notFound', message: 'This loan no longer exists' });
  });

  it('puts 422 issues under their fields', () => {
    const error = new ApiError({ kind: 'validation', status: 422, issues: [{ path: ['dueDateIso'], message: 'Too early' }, { path: ['counterparty'], message: 'Too long' }] });
    expect(getDebtError(error, context)).toEqual({ type: 'fields', fields: { dueDate: 'Too early', counterparty: 'Too long' } });
  });

  it('maps offline and server errors', () => {
    expect(getDebtError(new ApiError({ kind: 'offline' }), context)).toEqual({ type: 'form', message: 'You\'re offline. Try again.' });
    expect(getDebtError(new ApiError({ kind: 'server', status: 500 }), context)).toEqual({ type: 'form', message: 'Something went wrong. Try again.' });
  });
});
