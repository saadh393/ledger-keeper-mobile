import { BOOK_NAME_MAX_LENGTH, createBookFormSchema } from '@/features/books/schemas/book-form-schema';

const schema = createBookFormSchema({ nameRequired: 'required', nameTooLong: 'too long' });

describe('createBookFormSchema', () => {
  it('accepts a valid name and currency and trims the name', () => {
    expect(schema.parse({ name: '  Business  ', currency: 'USD' })).toEqual({ name: 'Business', currency: 'USD' });
  });

  it('rejects an empty or whitespace-only name with the required message', () => {
    const result = schema.safeParse({ name: '   ', currency: 'USD' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ path: ['name'], message: 'required' });
  });

  it('accepts exactly the maximum length after trimming', () => {
    const name = ` ${'a'.repeat(BOOK_NAME_MAX_LENGTH)} `;
    expect(schema.safeParse({ name, currency: 'USD' }).success).toBe(true);
  });

  it('rejects names longer than 60 characters with the too-long message', () => {
    const result = schema.safeParse({ name: 'a'.repeat(BOOK_NAME_MAX_LENGTH + 1), currency: 'USD' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ path: ['name'], message: 'too long' });
  });

  it('requires a currency', () => {
    expect(schema.safeParse({ name: 'Trip', currency: '' }).success).toBe(false);
  });
});
