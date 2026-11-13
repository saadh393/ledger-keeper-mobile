import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { useAuthStore } from '@/features/auth';
import { useAutoCaptureSync } from '@/features/auto-capture/hooks/use-auto-capture-sync';
import { notificationCapture } from '@/features/auto-capture/native/notification-capture';
import { apiClient, getApiBaseUrl } from '@/lib/api/client';
import { getToken } from '@/lib/auth/token-storage';
import { act, render, waitFor } from '@/lib/test-utils';

jest.mock('@/features/auto-capture/native/notification-capture');
jest.mock('@/lib/auth/token-storage', () => ({ getToken: jest.fn(async () => 'bearer-1'), clearToken: jest.fn(async () => {}), setToken: jest.fn(async () => {}) }));

function Sync() {
  useAutoCaptureSync();
  return null;
}

describe('useAutoCaptureSync', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    jest.clearAllMocks();
    jest.mocked(getToken).mockResolvedValue('bearer-1');
  });

  afterEach(() => {
    mock.restore();
    act(() => useAuthStore.setState({ status: 'idle' }));
  });

  it('hands the token, base URL and default book to the module after sign-in', async () => {
    mock.onGet('/users/me').reply(200, { id: 'u1', name: 'A', email: 'a@b.c', image: null, role: 'user', locale: 'en', currency: 'BDT', currencyConfirmed: true, defaultBookId: 'book-1', createdAt: '2026-01-01T00:00:00.000Z' });
    act(() => useAuthStore.setState({ status: 'signedIn' }));
    render(<Sync />);
    await waitFor(() => expect(notificationCapture.setAuth).toHaveBeenCalledWith('bearer-1', getApiBaseUrl(), 'book-1'));
    expect(notificationCapture.flush).toHaveBeenCalled();
  });

  it('clears the module token and queue on sign-out', async () => {
    act(() => useAuthStore.setState({ status: 'signedIn' }));
    mock.onPost('/auth/sign-out').reply(200);
    await act(() => useAuthStore.getState().signOut());
    expect(notificationCapture.clearAuth).toHaveBeenCalled();
  });
});
