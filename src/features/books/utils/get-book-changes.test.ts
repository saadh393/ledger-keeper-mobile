import type { Book } from '@/features/books/schemas/book-schema';
import { getBookChanges } from '@/features/books/utils/get-book-changes';

const book: Book = {
  id: 'b-1',
  name: 'Business',
  currency: 'USD',
  isDefault: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('getBookChanges', () => {
  it('returns an empty payload when nothing changed', () => {
    expect(getBookChanges(book, { name: 'Business', currency: 'USD' })).toEqual({});
  });

  it('ignores surrounding whitespace on the name', () => {
    expect(getBookChanges(book, { name: '  Business ', currency: 'USD' })).toEqual({});
  });

  it('returns only the trimmed name when the name changed', () => {
    expect(getBookChanges(book, { name: ' Work ', currency: 'USD' })).toEqual({ name: 'Work' });
  });

  it('returns only the currency when the currency changed', () => {
    expect(getBookChanges(book, { name: 'Business', currency: 'EUR' })).toEqual({ currency: 'EUR' });
  });

  it('returns both fields when both changed', () => {
    expect(getBookChanges(book, { name: 'Trip', currency: 'EUR' })).toEqual({ name: 'Trip', currency: 'EUR' });
  });
});
