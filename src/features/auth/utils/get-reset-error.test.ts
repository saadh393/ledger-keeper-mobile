import type { TFunction } from 'i18next';
import { getResetError } from '@/features/auth/utils/get-reset-error';
import { ApiError } from '@/lib/api/errors';
import i18n from '@/lib/i18n';

const t = i18n.t.bind(i18n) as TFunction;

describe('getResetError', () => {
  it('maps an invalid token to expired', () => {
    expect(getResetError(new ApiError({ kind: 'server', status: 400, data: { code: 'INVALID_TOKEN' } }), t)).toEqual({ type: 'expired' });
  });

  it('maps offline and server errors to messages', () => {
    expect(getResetError(new ApiError({ kind: 'offline' }), t)).toEqual({ type: 'message', message: 'You\'re offline. Check your connection and try again.' });
    expect(getResetError(new ApiError({ kind: 'server', status: 500 }), t)).toEqual({ type: 'message', message: 'Something went wrong. Try again.' });
  });
});
