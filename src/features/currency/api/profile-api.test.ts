import type { UserProfile } from '@/features/currency/types';

import MockAdapter from 'axios-mock-adapter';
import { getUserProfile, updateProfile } from '@/features/currency/api/profile-api';
import { apiClient } from '@/lib/api/client';

const mockProfile: UserProfile = {
  id: 'user-123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  image: null,
  role: 'user',
  locale: 'en',
  currency: 'BDT',
  currencyConfirmed: false,
  defaultBookId: 'book-1',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('profileApi', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('fetches profile with GET /users/me', async () => {
    mock.onGet('/users/me').reply(200, mockProfile);

    const result = await getUserProfile();
    expect(result).toEqual(mockProfile);
    expect(mock.history.get).toHaveLength(1);
    expect(mock.history.get[0].url).toBe('/users/me');
  });

  it('updates profile with PATCH /users/me', async () => {
    const updated = { ...mockProfile, currency: 'USD', currencyConfirmed: true };
    mock.onPatch('/users/me').reply(200, updated);

    const result = await updateProfile({ currency: 'USD' });
    expect(result).toEqual(updated);
    expect(mock.history.patch).toHaveLength(1);
    expect(mock.history.patch[0].url).toBe('/users/me');
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ currency: 'USD' });
  });

  it('propagates error when GET /users/me fails', async () => {
    mock.onGet('/users/me').reply(500, { message: 'Server error' });

    await expect(getUserProfile()).rejects.toThrow();
  });

  it('propagates error when PATCH /users/me fails', async () => {
    mock.onPatch('/users/me').reply(500, { message: 'Server error' });

    await expect(updateProfile({ currency: 'EUR' })).rejects.toThrow();
  });
});
