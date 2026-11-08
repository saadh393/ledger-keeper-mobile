import {
  bookScopedQueryKey,
  booksKeys,
  booksQueryKey,
} from '@/features/books/utils/query-keys';

describe('query-keys', () => {
  it('defines the root books list query key as ["books"]', () => {
    expect(booksQueryKey).toEqual(['books']);
    expect(booksKeys.all).toEqual(['books']);
  });

  describe('enforcing ["books", bookId, ...] prefix', () => {
    const bookId = 'book-123';

    it('booksKeys.book(bookId) starts with ["books", bookId]', () => {
      const key = booksKeys.book(bookId);
      expect(key).toEqual(['books', 'book-123']);
      expect(key[0]).toBe('books');
      expect(key[1]).toBe(bookId);
    });

    it('booksKeys.table(bookId) starts with ["books", bookId, "table"]', () => {
      const keyWithoutParams = booksKeys.table(bookId);
      expect(keyWithoutParams).toEqual(['books', 'book-123', 'table']);

      const params = { fromDate: '2026-01-01', toDate: '2026-01-31' };
      const keyWithParams = booksKeys.table(bookId, params);
      expect(keyWithParams).toEqual(['books', 'book-123', 'table', params]);
      expect(keyWithParams[0]).toBe('books');
      expect(keyWithParams[1]).toBe(bookId);
    });

    it('booksKeys.conversations(bookId) starts with ["books", bookId, "conversations"]', () => {
      const key = booksKeys.conversations(bookId, { limit: 20 });
      expect(key).toEqual(['books', 'book-123', 'conversations', { limit: 20 }]);
      expect(key[0]).toBe('books');
      expect(key[1]).toBe(bookId);
    });

    it('booksKeys.loans(bookId) starts with ["books", bookId, "loans"]', () => {
      const key = booksKeys.loans(bookId);
      expect(key).toEqual(['books', 'book-123', 'loans']);
      expect(key[0]).toBe('books');
      expect(key[1]).toBe(bookId);
    });

    it('booksKeys.installments(bookId) starts with ["books", bookId, "installments"]', () => {
      const key = booksKeys.installments(bookId);
      expect(key).toEqual(['books', 'book-123', 'installments']);
      expect(key[0]).toBe('books');
      expect(key[1]).toBe(bookId);
    });

    it('booksKeys.scoped(bookId, ...) starts with ["books", bookId, ...]', () => {
      const key = booksKeys.scoped(bookId, 'custom', 'sub');
      expect(key).toEqual(['books', 'book-123', 'custom', 'sub']);
      expect(key[0]).toBe('books');
      expect(key[1]).toBe(bookId);
    });

    it('bookScopedQueryKey(bookId, ...) helper builds ["books", bookId, ...]', () => {
      const key = bookScopedQueryKey(bookId, 'analytics', 'monthly');
      expect(key).toEqual(['books', 'book-123', 'analytics', 'monthly']);
      expect(key[0]).toBe('books');
      expect(key[1]).toBe(bookId);
    });
  });
});
