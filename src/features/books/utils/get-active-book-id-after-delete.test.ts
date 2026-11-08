import type { Book } from '@/features/books/schemas/book-schema';
import { getActiveBookIdAfterDelete } from '@/features/books/utils/get-active-book-id-after-delete';

const books: Book[] = [
  { id: 'b-default', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'b-trip', name: 'Trip', currency: 'USD', isDefault: false, createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'b-work', name: 'Work', currency: 'EUR', isDefault: false, createdAt: '2026-01-03T00:00:00.000Z' },
];

describe('getActiveBookIdAfterDelete', () => {
  it('switches to the default book when the active book is deleted', () => {
    expect(getActiveBookIdAfterDelete(books, 'b-trip', 'b-trip')).toBe('b-default');
  });

  it('keeps the active book when another book is deleted', () => {
    expect(getActiveBookIdAfterDelete(books, 'b-work', 'b-trip')).toBe('b-trip');
  });

  it('returns null when the active book is deleted and no default book is known', () => {
    expect(getActiveBookIdAfterDelete(books.filter(book => !book.isDefault), 'b-trip', 'b-trip')).toBeNull();
  });
});
