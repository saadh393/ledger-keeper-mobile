/* eslint-disable max-lines-per-function */
import type { Book } from '@/features/books/schemas/book-schema';
import { resolveActiveBook } from '@/features/books/utils/resolve-active-book';

describe('resolveActiveBook', () => {
  const defaultBook: Book = {
    id: 'book-default',
    name: 'Personal Ledger',
    currency: 'USD',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const businessBook: Book = {
    id: 'book-business',
    name: 'Business Ledger',
    currency: 'EUR',
    isDefault: false,
    createdAt: '2026-02-01T00:00:00.000Z',
  };

  const tripBook: Book = {
    id: 'book-trip',
    name: 'Trip Ledger',
    currency: 'BDT',
    isDefault: false,
    createdAt: '2026-03-01T00:00:00.000Z',
  };

  const standardBooks: Book[] = [defaultBook, businessBook, tripBook];

  describe('case 1: saved valid', () => {
    it('returns the saved book when savedId exists in books list', () => {
      const result = resolveActiveBook(standardBooks, 'book-business');

      expect(result).toEqual({
        activeBook: businessBook,
        resolvedId: 'book-business',
        shouldUpdateSaved: false,
        isEmpty: false,
      });
    });

    it('returns the default book when savedId explicitly points to default book', () => {
      const result = resolveActiveBook(standardBooks, 'book-default');

      expect(result).toEqual({
        activeBook: defaultBook,
        resolvedId: 'book-default',
        shouldUpdateSaved: false,
        isEmpty: false,
      });
    });

    it('returns the saved book even if none of the books are marked isDefault', () => {
      const booksWithoutDefault: Book[] = [
        { ...defaultBook, isDefault: false },
        businessBook,
      ];
      const result = resolveActiveBook(booksWithoutDefault, 'book-business');

      expect(result).toEqual({
        activeBook: businessBook,
        resolvedId: 'book-business',
        shouldUpdateSaved: false,
        isEmpty: false,
      });
    });
  });

  describe('case 2: saved missing', () => {
    it('falls back to default book and flags shouldUpdateSaved when savedId is not in list', () => {
      // E.g., book deleted on another device or web
      const result = resolveActiveBook(standardBooks, 'deleted-book-id');

      expect(result).toEqual({
        activeBook: defaultBook,
        resolvedId: 'book-default',
        shouldUpdateSaved: true,
        isEmpty: false,
      });
    });

    it('falls back to first book and flags shouldUpdateSaved when savedId is missing AND list has no default', () => {
      const booksWithoutDefault: Book[] = [
        { ...defaultBook, isDefault: false },
        businessBook,
      ];
      const result = resolveActiveBook(booksWithoutDefault, 'deleted-book-id');

      expect(result).toEqual({
        activeBook: booksWithoutDefault[0],
        resolvedId: booksWithoutDefault[0].id,
        shouldUpdateSaved: true,
        isEmpty: false,
      });
    });
  });

  describe('case 3: no saved id (first use)', () => {
    it('returns the default book when savedId is null', () => {
      const result = resolveActiveBook(standardBooks, null);

      expect(result).toEqual({
        activeBook: defaultBook,
        resolvedId: 'book-default',
        shouldUpdateSaved: true,
        isEmpty: false,
      });
    });

    it('returns the default book when savedId is undefined', () => {
      const result = resolveActiveBook(standardBooks, undefined);

      expect(result).toEqual({
        activeBook: defaultBook,
        resolvedId: 'book-default',
        shouldUpdateSaved: true,
        isEmpty: false,
      });
    });

    it('returns the default book when savedId is empty string', () => {
      const result = resolveActiveBook(standardBooks, '');

      expect(result).toEqual({
        activeBook: defaultBook,
        resolvedId: 'book-default',
        shouldUpdateSaved: true,
        isEmpty: false,
      });
    });
  });

  describe('case 4: no default', () => {
    const noDefaultBooks: Book[] = [
      {
        id: 'book-first',
        name: 'First Non-Default',
        currency: 'EUR',
        isDefault: false,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'book-second',
        name: 'Second Non-Default',
        currency: 'USD',
        isDefault: false,
        createdAt: '2026-01-02T00:00:00.000Z',
      },
    ];

    it('falls back to the first book in the list when no book is default and no savedId', () => {
      const result = resolveActiveBook(noDefaultBooks, null);

      expect(result).toEqual({
        activeBook: noDefaultBooks[0],
        resolvedId: 'book-first',
        shouldUpdateSaved: true,
        isEmpty: false,
      });
    });

    it('falls back to the first book in the list when no book is default and savedId is invalid', () => {
      const result = resolveActiveBook(noDefaultBooks, 'non-existent-id');

      expect(result).toEqual({
        activeBook: noDefaultBooks[0],
        resolvedId: 'book-first',
        shouldUpdateSaved: true,
        isEmpty: false,
      });
    });
  });

  describe('case 5: empty list', () => {
    it('returns empty state with null activeBook when books list is empty', () => {
      const result = resolveActiveBook([], null);

      expect(result).toEqual({
        activeBook: null,
        resolvedId: null,
        shouldUpdateSaved: false,
        isEmpty: true,
      });
    });

    it('returns empty state and flags shouldUpdateSaved if an orphan savedId exists for an empty list', () => {
      const result = resolveActiveBook([], 'old-orphan-id');

      expect(result).toEqual({
        activeBook: null,
        resolvedId: null,
        shouldUpdateSaved: true,
        isEmpty: true,
      });
    });

    it('handles null books input gracefully', () => {
      const result = resolveActiveBook(null, 'some-id');

      expect(result).toEqual({
        activeBook: null,
        resolvedId: null,
        shouldUpdateSaved: true,
        isEmpty: true,
      });
    });

    it('handles undefined books input gracefully', () => {
      const result = resolveActiveBook(undefined, null);

      expect(result).toEqual({
        activeBook: null,
        resolvedId: null,
        shouldUpdateSaved: false,
        isEmpty: true,
      });
    });
  });
});
