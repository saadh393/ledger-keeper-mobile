import type { Book } from '@/features/books/schemas/book-schema';
import { sortBooks } from '@/features/books/utils/sort-books';

describe('sortBooks', () => {
  const createBook = (id: string, name: string, isDefault = false): Book => ({
    id,
    name,
    currency: 'USD',
    isDefault,
    createdAt: '2026-01-01T00:00:00.000Z',
  });

  it('returns empty array when given empty list', () => {
    expect(sortBooks([])).toEqual([]);
  });

  it('returns single book unchanged', () => {
    const book = createBook('1', 'Personal', true);
    expect(sortBooks([book])).toEqual([book]);
  });

  it('places default book first regardless of original position', () => {
    const b1 = createBook('1', 'Alpha', false);
    const b2 = createBook('2', 'Beta', false);
    const bDefault = createBook('3', 'Zulu', true);

    const result = sortBooks([b1, b2, bDefault]);
    expect(result[0].id).toBe('3');
    expect(result[1].id).toBe('1');
    expect(result[2].id).toBe('2');
  });

  it('sorts non-default books alphabetically by name', () => {
    const bZ = createBook('z', 'Zebra', false);
    const bA = createBook('a', 'Apple', false);
    const bM = createBook('m', 'Mango', false);
    const bDefault = createBook('d', 'Office', true);

    const result = sortBooks([bZ, bDefault, bM, bA]);
    expect(result.map(b => b.name)).toEqual(['Office', 'Apple', 'Mango', 'Zebra']);
  });

  it('handles case-insensitive alphabetical sorting for names', () => {
    const b1 = createBook('1', 'banana', false);
    const b2 = createBook('2', 'Apple', false);
    const b3 = createBook('3', 'cherry', false);

    const result = sortBooks([b1, b3, b2]);
    expect(result.map(b => b.name)).toEqual(['Apple', 'banana', 'cherry']);
  });

  it('does not mutate the original array', () => {
    const b1 = createBook('1', 'Zebra', false);
    const b2 = createBook('2', 'Apple', true);
    const original = [b1, b2];

    const result = sortBooks(original);
    expect(result).not.toBe(original);
    expect(original[0].name).toBe('Zebra');
    expect(original[1].name).toBe('Apple');
  });
});
