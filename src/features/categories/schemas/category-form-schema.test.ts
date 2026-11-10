import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import { createCategoryFormSchema } from '@/features/categories/schemas/category-form-schema';

const messages = { nameRequired: 'required', nameTooLong: 'too long', nameTaken: 'taken' };
const categories: CategoryItem[] = [{ id: '1', name: 'Food', color: '#4285F4', kind: 'expense', system: true }];
const schema = createCategoryFormSchema(messages, categories);

function firstMessage(value: unknown) {
  const result = schema.safeParse(value);
  return result.success ? null : result.error.issues[0]?.message;
}

describe('createCategoryFormSchema', () => {
  it('trims and accepts a new name', () => {
    expect(schema.parse({ name: '  Rent ', kind: 'expense' })).toEqual({ name: 'Rent', kind: 'expense' });
  });

  it('requires a name', () => {
    expect(firstMessage({ name: '   ', kind: 'expense' })).toBe('required');
  });

  it('limits the name to 40 characters', () => {
    expect(firstMessage({ name: 'a'.repeat(40), kind: 'expense' })).toBeNull();
    expect(firstMessage({ name: 'a'.repeat(41), kind: 'expense' })).toBe('too long');
  });

  it('rejects a name that exists for the same kind', () => {
    expect(firstMessage({ name: 'food', kind: 'expense' })).toBe('taken');
    expect(firstMessage({ name: 'food', kind: 'income' })).toBeNull();
  });
});
