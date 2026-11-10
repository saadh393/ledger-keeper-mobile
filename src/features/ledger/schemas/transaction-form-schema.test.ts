import {
  createTransactionFormSchema,
  normalizeBanglaDigits,
  parseAmount,
} from '@/features/ledger/schemas/transaction-form-schema';

const mockMessages = {
  amountRequired: 'Amount is required',
  amountInvalid: 'Enter a valid amount',
  amountPositive: 'Amount must be greater than 0',
  amountTooLarge: 'Amount is too large',
  amountDecimals: 'At most 2 decimal places',
  titleRequired: 'Title is required',
  titleTooLong: 'Title must be 200 characters or less',
  categoryRequired: 'Category is required',
  dateFuture: 'Date cannot be in the future',
  noteTooLong: 'Note must be 500 characters or less',
};

const validData = {
  type: 'expense' as const,
  amount: '150.50',
  title: 'Groceries',
  category: 'Food',
  date: '2026-11-01T00:00:00.000Z',
  note: 'Weekly market',
};

describe('transactionFormSchema basic & bangla parsing', () => {
  const schema = createTransactionFormSchema(mockMessages);

  it('validates correct data', () => {
    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('normalizes Bangla digits correctly', () => {
    expect(normalizeBanglaDigits('০১২৩৪৫৬৭৮৯')).toBe('0123456789');
    expect(normalizeBanglaDigits('১২৫.৫০')).toBe('125.50');
  });

  it('parses amount with Bangla digits', () => {
    expect(parseAmount('১২৫.৫০')).toBe(125.5);
    expect(parseAmount('১০০০')).toBe(1000);
    expect(parseAmount('1,500.50')).toBe(1500.5);
  });

  it('accepts Bangla digits in schema validation', () => {
    const result = schema.safeParse({ ...validData, amount: '১২৫.৫০' });
    expect(result.success).toBe(true);
  });

  it('accepts Latin digits in schema validation', () => {
    const result = schema.safeParse({ ...validData, amount: '125.50' });
    expect(result.success).toBe(true);
  });

  it('accepts income and expense types', () => {
    expect(schema.safeParse({ ...validData, type: 'income' }).success).toBe(true);
    expect(schema.safeParse({ ...validData, type: 'expense' }).success).toBe(true);
  });
});

describe('transactionFormSchema amount rules', () => {
  const schema = createTransactionFormSchema(mockMessages);

  it('requires non-empty amount', () => {
    const result = schema.safeParse({ ...validData, amount: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(mockMessages.amountRequired);
    }
  });

  it('rejects non-numeric characters', () => {
    const result = schema.safeParse({ ...validData, amount: 'abc' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(mockMessages.amountInvalid);
    }
  });

  it('rejects multiple decimal points', () => {
    const result = schema.safeParse({ ...validData, amount: '12.34.56' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(mockMessages.amountInvalid);
    }
  });

  it('rejects more than 2 decimal places', () => {
    const result = schema.safeParse({ ...validData, amount: '10.123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(mockMessages.amountDecimals);
    }
  });

  it('accepts at most 2 decimal places', () => {
    expect(schema.safeParse({ ...validData, amount: '10' }).success).toBe(true);
    expect(schema.safeParse({ ...validData, amount: '10.5' }).success).toBe(true);
    expect(schema.safeParse({ ...validData, amount: '10.55' }).success).toBe(true);
  });

  it('requires amount > 0', () => {
    const zeroResult = schema.safeParse({ ...validData, amount: '0' });
    expect(zeroResult.success).toBe(false);
    if (!zeroResult.success) {
      expect(zeroResult.error.issues[0].message).toBe(mockMessages.amountPositive);
    }

    const zeroBangla = schema.safeParse({ ...validData, amount: '০.০০' });
    expect(zeroBangla.success).toBe(false);
    if (!zeroBangla.success) {
      expect(zeroBangla.error.issues[0].message).toBe(mockMessages.amountPositive);
    }
  });

  it('requires amount <= 999,999,999,999.99', () => {
    const maxAllowed = schema.safeParse({ ...validData, amount: '999999999999.99' });
    expect(maxAllowed.success).toBe(true);

    const tooLarge = schema.safeParse({ ...validData, amount: '1000000000000' });
    expect(tooLarge.success).toBe(false);
    if (!tooLarge.success) {
      expect(tooLarge.error.issues[0].message).toBe(mockMessages.amountTooLarge);
    }
  });
});

describe('transactionFormSchema text, category and date rules', () => {
  const schema = createTransactionFormSchema(mockMessages);

  it('requires title (non-empty trimmed)', () => {
    const result = schema.safeParse({ ...validData, title: '   ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(mockMessages.titleRequired);
    }
  });

  it('rejects title longer than 200 characters', () => {
    const result = schema.safeParse({ ...validData, title: 'a'.repeat(201) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(mockMessages.titleTooLong);
    }
  });

  it('accepts title up to 200 characters', () => {
    const result = schema.safeParse({ ...validData, title: 'a'.repeat(200) });
    expect(result.success).toBe(true);
  });

  it('requires category', () => {
    const result = schema.safeParse({ ...validData, category: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(mockMessages.categoryRequired);
    }
  });

  it('rejects future day for date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 2);
    const result = schema.safeParse({ ...validData, date: future.toISOString() });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(mockMessages.dateFuture);
    }
  });

  it('accepts today or past day for date', () => {
    const today = new Date().toISOString();
    expect(schema.safeParse({ ...validData, date: today }).success).toBe(true);

    const past = new Date(2025, 0, 1).toISOString();
    expect(schema.safeParse({ ...validData, date: past }).success).toBe(true);
  });

  it('allows empty note', () => {
    expect(schema.safeParse({ ...validData, note: '' }).success).toBe(true);
  });

  it('rejects note longer than 500 characters', () => {
    const result = schema.safeParse({ ...validData, note: 'n'.repeat(501) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(mockMessages.noteTooLong);
    }
  });

  it('accepts note up to 500 characters', () => {
    expect(schema.safeParse({ ...validData, note: 'n'.repeat(500) }).success).toBe(true);
  });
});
