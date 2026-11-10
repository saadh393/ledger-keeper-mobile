import { getCategoryErrorKey } from '@/features/categories/utils/get-category-error-key';
import { ApiError } from '@/lib/api/errors';

describe('getCategoryErrorKey', () => {
  it('maps offline and timeout to the offline message', () => {
    expect(getCategoryErrorKey(new ApiError({ kind: 'offline' }))).toBe('categories.errors.offline');
    expect(getCategoryErrorKey(new ApiError({ kind: 'timeout' }))).toBe('categories.errors.offline');
  });

  it('maps anything else to the server message', () => {
    expect(getCategoryErrorKey(new ApiError({ kind: 'server', status: 500 }))).toBe('categories.errors.server');
  });

  it('maps a taken name and a built-in refusal', () => {
    expect(getCategoryErrorKey(new ApiError({ kind: 'conflict', code: 'category_name_taken' }))).toBe('categories.errors.nameTaken');
    expect(getCategoryErrorKey(new ApiError({ kind: 'forbidden', code: 'category_builtin' }))).toBe('categories.errors.builtIn');
  });
});
