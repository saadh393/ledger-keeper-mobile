import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import { hasCategoryName } from '@/features/categories/utils/has-category-name';

const categories: CategoryItem[] = [
  { id: '1', name: 'Food', color: '#4285F4', kind: 'expense', system: true },
  { id: '2', name: 'Salary', color: '#34A853', kind: 'income', system: true },
];

describe('hasCategoryName', () => {
  it('matches a name of the same kind ignoring case and spaces', () => {
    expect(hasCategoryName(categories, 'expense', '  fOOd ')).toBe(true);
  });

  it('ignores names of the other kind', () => {
    expect(hasCategoryName(categories, 'income', 'Food')).toBe(false);
  });

  it('returns false for a new name', () => {
    expect(hasCategoryName(categories, 'expense', 'Rent')).toBe(false);
  });
});
