import { createDebtFormSchema } from '@/features/loans/schemas/debt-form-schema';
import { createRepaymentFormSchema } from '@/features/loans/schemas/repayment-form-schema';

const messages = {
  amountRequired: 'required',
  amountInvalid: 'invalid',
  amountPositive: 'positive',
  amountTooLarge: 'large',
  amountDecimals: 'decimals',
  personRequired: 'person',
  personTooLong: 'personLong',
  dateFuture: 'future',
  dueBeforeDate: 'dueBefore',
  noteTooLong: 'noteLong',
};

const valid = { direction: 'lent' as const, counterparty: 'Rahim', amount: '500', date: '2026-11-05T12:00:00.000Z', dueDate: '', note: '' };

function firstError(result: ReturnType<ReturnType<typeof createDebtFormSchema>['safeParse']>) {
  return result.success ? null : { path: result.error.issues[0]?.path[0], message: result.error.issues[0]?.message };
}

describe('debtFormSchema', () => {
  const schema = createDebtFormSchema(messages);

  it('accepts a valid loan and Bangla digits', () => {
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, amount: '১,২৫০.৫০' }).success).toBe(true);
  });

  it('rejects a due date before the date', () => {
    expect(firstError(schema.safeParse({ ...valid, dueDate: '2026-11-01T12:00:00.000Z' }))).toEqual({ path: 'dueDate', message: 'dueBefore' });
    expect(schema.safeParse({ ...valid, dueDate: '2027-01-01T12:00:00.000Z' }).success).toBe(true);
  });

  it('validates person, amount, date and note', () => {
    expect(firstError(schema.safeParse({ ...valid, counterparty: '   ' }))?.message).toBe('person');
    expect(firstError(schema.safeParse({ ...valid, counterparty: 'a'.repeat(101) }))?.message).toBe('personLong');
    expect(firstError(schema.safeParse({ ...valid, amount: '0' }))?.message).toBe('positive');
    expect(firstError(schema.safeParse({ ...valid, amount: '1.234' }))?.message).toBe('decimals');
    expect(firstError(schema.safeParse({ ...valid, date: '2999-01-01T12:00:00.000Z' }))?.message).toBe('future');
    expect(firstError(schema.safeParse({ ...valid, note: 'a'.repeat(501) }))?.message).toBe('noteLong');
  });
});

describe('repaymentFormSchema', () => {
  const schema = createRepaymentFormSchema({ ...messages, amountExceeds: 'exceeds' }, 600);

  it('allows up to the outstanding amount in Latin or Bangla digits', () => {
    expect(schema.safeParse({ amount: '600', date: '2026-11-05T12:00:00.000Z' }).success).toBe(true);
    expect(schema.safeParse({ amount: '৬০০', date: '2026-11-05T12:00:00.000Z' }).success).toBe(true);
  });

  it('rejects more than outstanding and a future date', () => {
    expect(schema.safeParse({ amount: '601', date: '2026-11-05T12:00:00.000Z' }).error?.issues[0]?.message).toBe('exceeds');
    expect(schema.safeParse({ amount: '100', date: '2999-01-01T12:00:00.000Z' }).error?.issues[0]?.message).toBe('future');
  });
});
