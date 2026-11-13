import { isExpiredResetLink } from '@/features/auth/utils/is-expired-reset-link';

describe('isExpiredResetLink', () => {
  it('accepts a link with a token', () => {
    expect(isExpiredResetLink({ token: 'abc' })).toBe(false);
  });

  it('treats an error or a missing token as expired', () => {
    expect(isExpiredResetLink({ token: 'abc', error: 'INVALID_TOKEN' })).toBe(true);
    expect(isExpiredResetLink({ error: 'INVALID_TOKEN' })).toBe(true);
    expect(isExpiredResetLink({})).toBe(true);
    expect(isExpiredResetLink({ token: '' })).toBe(true);
  });
});
