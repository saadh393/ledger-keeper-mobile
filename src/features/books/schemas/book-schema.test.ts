import { bookSchema, booksResponseSchema } from '@/features/books/schemas/book-schema';

describe('book-schema', () => {
  const validBook = {
    id: 'book-1',
    name: 'Personal',
    currency: 'USD',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  describe('bookSchema', () => {
    it('validates a valid book successfully', () => {
      const parsed = bookSchema.parse(validBook);
      expect(parsed).toEqual(validBook);
    });

    it('rejects missing or empty id', () => {
      expect(() => bookSchema.parse({ ...validBook, id: '' })).toThrow();
      expect(() => bookSchema.parse({ ...validBook, id: undefined })).toThrow();
    });

    it('rejects missing or empty name', () => {
      expect(() => bookSchema.parse({ ...validBook, name: '' })).toThrow();
      expect(() => bookSchema.parse({ ...validBook, name: undefined })).toThrow();
    });

    it('rejects missing currency', () => {
      expect(() => bookSchema.parse({ ...validBook, currency: '' })).toThrow();
      expect(() => bookSchema.parse({ ...validBook, currency: undefined })).toThrow();
    });

    it('rejects non-boolean isDefault', () => {
      expect(() => bookSchema.parse({ ...validBook, isDefault: 'true' })).toThrow();
      expect(() => bookSchema.parse({ ...validBook, isDefault: undefined })).toThrow();
    });

    it('rejects missing or empty createdAt', () => {
      expect(() => bookSchema.parse({ ...validBook, createdAt: '' })).toThrow();
      expect(() => bookSchema.parse({ ...validBook, createdAt: undefined })).toThrow();
    });
  });

  describe('booksResponseSchema', () => {
    it('validates an array of books wrapped in { items: [...] }', () => {
      const data = {
        items: [
          validBook,
          {
            id: 'book-2',
            name: 'Business',
            currency: 'BDT',
            isDefault: false,
            createdAt: '2026-02-01T12:00:00.000Z',
          },
        ],
      };

      const parsed = booksResponseSchema.parse(data);
      expect(parsed.items).toHaveLength(2);
      expect(parsed.items[0]).toEqual(validBook);
    });

    it('accepts an empty items array', () => {
      const parsed = booksResponseSchema.parse({ items: [] });
      expect(parsed.items).toEqual([]);
    });

    it('rejects payload missing items property', () => {
      expect(() => booksResponseSchema.parse({})).toThrow();
      expect(() => booksResponseSchema.parse([validBook])).toThrow();
    });

    it('rejects payload where an item violates the schema', () => {
      expect(() =>
        booksResponseSchema.parse({
          items: [{ ...validBook, currency: undefined }],
        }),
      ).toThrow();
    });
  });
});
