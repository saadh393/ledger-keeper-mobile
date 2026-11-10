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
});
