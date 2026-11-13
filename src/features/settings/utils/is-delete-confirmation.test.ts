import { isDeleteConfirmation } from '@/features/settings/utils/is-delete-confirmation';

describe('isDeleteConfirmation', () => {
  it('accepts DELETE in any case with surrounding spaces', () => {
    expect(isDeleteConfirmation('DELETE')).toBe(true);
    expect(isDeleteConfirmation(' delete ')).toBe(true);
    expect(isDeleteConfirmation('DeLeTe')).toBe(true);
  });

  it('accepts full-width letters from other keyboards', () => {
    expect(isDeleteConfirmation('ＤＥＬＥＴＥ')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isDeleteConfirmation('')).toBe(false);
    expect(isDeleteConfirmation('DELET')).toBe(false);
    expect(isDeleteConfirmation('DELETE ME')).toBe(false);
  });
});
