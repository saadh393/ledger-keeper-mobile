/* eslint-disable max-lines-per-function */
import { onlineManager } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { showMessage } from 'react-native-flash-message';

import {
  _resetAuthStore,
  authClient,
  hydrate,
  recheckSession,
  setSessionNotice,
  setupAuthSessionGuard,
  signIn,
  signOut,
  useAuthSessionNotice,
  useAuthStatus,
  useAuthStore,
  useIsAuthIdle,
  useIsSignedIn,
  useIsSignedOut,
} from '@/features/auth';
import { notifyUnauthorized, queryClient } from '@/lib/api';
import { ApiError } from '@/lib/api/errors';
import { storage } from '@/lib/storage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
  default: () => null,
}));

describe('useAuthStore', () => {
  const mockValidSession = {
    session: { id: 'session-valid-123', userId: 'user-valid-456' },
    user: { id: 'user-valid-456', email: 'user@example.com', name: 'Valid User' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    _resetAuthStore();
    queryClient.clear();
    jest.spyOn(onlineManager, 'isOnline').mockReturnValue(true);
    jest.spyOn(authClient, 'getSession').mockResolvedValue(mockValidSession);
    jest.spyOn(authClient, 'signOut').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial state', () => {
    it('starts with status "idle", null sessionNotice, and needsSessionRecheck false', () => {
      const state = useAuthStore.getState();
      expect(state.status).toBe('idle');
      expect(state.sessionNotice).toBeNull();
      expect(state.needsSessionRecheck).toBe(false);
    });
  });

  describe('hydrate()', () => {
    it('moves idle -> signedIn when a token exists and server confirms session is valid', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('valid-jwt-token');

      await useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().status).toBe('signedIn');
      expect(useAuthStore.getState().needsSessionRecheck).toBe(false);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
      expect(authClient.getSession).toHaveBeenCalled();
    });

    it('moves idle -> signedOut when no token exists in secure storage', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      await useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(useAuthStore.getState().needsSessionRecheck).toBe(false);
      expect(authClient.getSession).not.toHaveBeenCalled();
    });

    it('clears token and moves to signedOut if server returns 401 unauthorized', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('expired-token');
      (authClient.getSession as jest.Mock).mockRejectedValueOnce(
        new ApiError({ kind: 'unauthorized', status: 401, message: 'Invalid session' }),
      );

      await useAuthStore.getState().hydrate();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(useAuthStore.getState().needsSessionRecheck).toBe(false);
    });

    it('clears token and moves to signedOut if server returns 200 with no session', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('revoked-token');
      (authClient.getSession as jest.Mock).mockResolvedValueOnce(null);

      await useAuthStore.getState().hydrate();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(useAuthStore.getState().needsSessionRecheck).toBe(false);
    });

    it('lets user into the app without signing out if device is offline at launch', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('offline-token');
      jest.spyOn(onlineManager, 'isOnline').mockReturnValue(false);

      await useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().status).toBe('signedIn');
      expect(useAuthStore.getState().needsSessionRecheck).toBe(true);
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
      expect(authClient.getSession).not.toHaveBeenCalled();
    });

    it('lets user into app if server check throws offline ApiError', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('cached-token');
      (authClient.getSession as jest.Mock).mockRejectedValueOnce(
        new ApiError({ kind: 'offline', message: 'No internet connection' }),
      );

      await useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().status).toBe('signedIn');
      expect(useAuthStore.getState().needsSessionRecheck).toBe(true);
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });

    it('lets user into app if session check times out', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('cached-token');
      (authClient.getSession as jest.Mock).mockRejectedValueOnce(
        new ApiError({ kind: 'timeout', message: 'Request timed out' }),
      );

      await useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().status).toBe('signedIn');
      expect(useAuthStore.getState().needsSessionRecheck).toBe(true);
      expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
    });

    it('ends in signedOut when secure storage throws on read', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Keystore corrupted or device locked'),
      );

      await expect(useAuthStore.getState().hydrate()).resolves.toBeUndefined();

      expect(useAuthStore.getState().status).toBe('signedOut');
      errorSpy.mockRestore();
    });

    it('handles concurrent hydrate() calls safely with single in-flight resolution', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('concurrent-token');

      await Promise.all([
        useAuthStore.getState().hydrate(),
        useAuthStore.getState().hydrate(),
      ]);

      expect(useAuthStore.getState().status).toBe('signedIn');
      expect(authClient.getSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('recheckSession()', () => {
    it('clears needsSessionRecheck flag when session is valid', async () => {
      useAuthStore.setState({ status: 'signedIn', needsSessionRecheck: true });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('valid-token');
      (authClient.getSession as jest.Mock).mockResolvedValueOnce(mockValidSession);

      await useAuthStore.getState().recheckSession();

      expect(useAuthStore.getState().status).toBe('signedIn');
      expect(useAuthStore.getState().needsSessionRecheck).toBe(false);
    });

    it('signs out and shows session ended notice if server says session is invalid on recheck', async () => {
      useAuthStore.setState({ status: 'signedIn', needsSessionRecheck: true });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('revoked-token');
      (authClient.getSession as jest.Mock).mockResolvedValueOnce(null);

      await useAuthStore.getState().recheckSession();

      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(useAuthStore.getState().needsSessionRecheck).toBe(false);
      expect(useAuthStore.getState().sessionNotice).toBe('Your session has ended. Sign in again.');
      expect(showMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Your session has ended. Sign in again.',
          type: 'danger',
        }),
      );
    });

    it('signs out and shows session ended notice if server returns 401 on recheck', async () => {
      useAuthStore.setState({ status: 'signedIn', needsSessionRecheck: true });
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('invalid-token');
      (authClient.getSession as jest.Mock).mockRejectedValueOnce(
        new ApiError({ kind: 'unauthorized', status: 401, message: 'Expired' }),
      );

      await useAuthStore.getState().recheckSession();

      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(useAuthStore.getState().sessionNotice).toBe('Your session has ended. Sign in again.');
      expect(showMessage).toHaveBeenCalled();
    });

    it('keeps needsSessionRecheck true if phone is still offline', async () => {
      useAuthStore.setState({ status: 'signedIn', needsSessionRecheck: true });
      jest.spyOn(onlineManager, 'isOnline').mockReturnValue(false);

      await useAuthStore.getState().recheckSession();

      expect(useAuthStore.getState().needsSessionRecheck).toBe(true);
      expect(authClient.getSession).not.toHaveBeenCalled();
    });
  });

  describe('signIn(token)', () => {
    it('saves token in secure storage, resets notice/recheck, and moves to signedIn', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      useAuthStore.setState({ sessionNotice: 'Old notice', needsSessionRecheck: true });

      await useAuthStore.getState().signIn('user-session-token');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'user-session-token');
      expect(useAuthStore.getState().status).toBe('signedIn');
      expect(useAuthStore.getState().sessionNotice).toBeNull();
      expect(useAuthStore.getState().needsSessionRecheck).toBe(false);
    });

    it('never writes the token to MMKV or logs', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      const secretToken = 'ultra-secret-token-xyz';

      await useAuthStore.getState().signIn(secretToken);

      expect(storage.set).not.toHaveBeenCalledWith(expect.anything(), expect.stringContaining(secretToken));
      expect(storage.set).not.toHaveBeenCalledWith(secretToken, expect.anything());
    });

    it('propagates error and stays in previous state when secure storage fails', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Disk full'));

      await expect(useAuthStore.getState().signIn('failed-token')).rejects.toThrow('Disk full');

      expect(useAuthStore.getState().status).toBe('idle');
      errorSpy.mockRestore();
    });
  });

  describe('signOut()', () => {
    it('calls server sign-out endpoint and clears local state cleanly', async () => {
      useAuthStore.setState({ status: 'signedIn' });
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      (storage.getAllKeys as jest.Mock).mockReturnValue([
        'theme',
        'local',
        'active_book_id',
        'activeBookId',
        'draft_cache',
      ]);

      const clearQuerySpy = jest.spyOn(queryClient, 'clear');

      await useAuthStore.getState().signOut();

      // Server signout called
      expect(authClient.signOut).toHaveBeenCalled();

      // Secure store cleared
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');

      // Query cache cleared
      expect(clearQuerySpy).toHaveBeenCalled();

      // User-specific MMKV keys deleted
      expect(storage.remove).toHaveBeenCalledWith('active_book_id');
      expect(storage.remove).toHaveBeenCalledWith('activeBookId');
      expect(storage.remove).toHaveBeenCalledWith('draft_cache');

      // Device preferences preserved
      expect(storage.remove).not.toHaveBeenCalledWith('theme');
      expect(storage.remove).not.toHaveBeenCalledWith('local');

      // Auth state updated
      expect(useAuthStore.getState().status).toBe('signedOut');

      clearQuerySpy.mockRestore();
    });

    it('clears local state even if server sign-out throws or fails', async () => {
      useAuthStore.setState({ status: 'signedIn' });
      (authClient.signOut as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      (storage.getAllKeys as jest.Mock).mockReturnValue(['theme', 'active_book_id']);

      await expect(useAuthStore.getState().signOut()).resolves.toBeUndefined();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(storage.remove).toHaveBeenCalledWith('active_book_id');
      expect(useAuthStore.getState().status).toBe('signedOut');
    });

    it('calling signOut() twice at once resolves idempotently', async () => {
      useAuthStore.setState({ status: 'signedIn' });
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
      (storage.getAllKeys as jest.Mock).mockReturnValue(['theme', 'active_book_id']);

      await expect(
        Promise.all([
          useAuthStore.getState().signOut(),
          useAuthStore.getState().signOut(),
        ]),
      ).resolves.not.toThrow();

      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
    });

    it('continues cleanup and transitions to signedOut even if secure storage throws', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      useAuthStore.setState({ status: 'signedIn' });
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Secure storage delete failure'),
      );
      (storage.getAllKeys as jest.Mock).mockReturnValue(['theme', 'active_book_id']);

      await expect(useAuthStore.getState().signOut()).resolves.toBeUndefined();

      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(storage.remove).toHaveBeenCalledWith('active_book_id');
      errorSpy.mockRestore();
    });
  });

  describe('401 during use (setupAuthSessionGuard)', () => {
    it('signs out and shows "Your session has ended. Sign in again." when 401 occurs while signedIn', async () => {
      const cleanup = setupAuthSessionGuard();
      useAuthStore.setState({ status: 'signedIn' });

      // Trigger 401 notification
      notifyUnauthorized();

      // Wait for signOut async execution
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(useAuthStore.getState().sessionNotice).toBe('Your session has ended. Sign in again.');
      expect(showMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Your session has ended. Sign in again.',
          type: 'danger',
        }),
      );

      cleanup();
    });

    it('does not show session notice if 401 notification occurs while already signedOut', async () => {
      const cleanup = setupAuthSessionGuard();
      useAuthStore.setState({ status: 'signedOut', sessionNotice: null });

      notifyUnauthorized();

      await act(async () => {
        await Promise.resolve();
      });

      expect(useAuthStore.getState().sessionNotice).toBeNull();
      expect(showMessage).not.toHaveBeenCalled();

      cleanup();
    });
  });

  describe('multi-user session switching', () => {
    it('retains nothing from the first user after signing out and signing in as another user', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      // 1. User A signs in
      await useAuthStore.getState().signIn('user-a-token');
      expect(useAuthStore.getState().status).toBe('signedIn');

      // Populate User A data in TanStack Query cache
      queryClient.setQueryData(['books'], [{ id: 'book-a-1', name: 'User A Books' }]);
      queryClient.setQueryData(['transactions', 'book-a-1'], [{ id: 'tx-1', amount: 500 }]);
      expect(queryClient.getQueryData(['books'])).toBeDefined();

      // Mock User A storage keys
      (storage.getAllKeys as jest.Mock).mockReturnValue(['theme', 'active_book_id']);

      // 2. User A signs out
      await useAuthStore.getState().signOut();
      expect(useAuthStore.getState().status).toBe('signedOut');

      // Verify User A query cache is completely emptied
      expect(queryClient.getQueryData(['books'])).toBeUndefined();
      expect(queryClient.getQueryData(['transactions', 'book-a-1'])).toBeUndefined();

      // Verify User A storage key was purged
      expect(storage.remove).toHaveBeenCalledWith('active_book_id');
      expect(storage.remove).not.toHaveBeenCalledWith('theme');

      // 3. User B signs in
      await useAuthStore.getState().signIn('user-b-token');
      expect(useAuthStore.getState().status).toBe('signedIn');

      // User B should not see any queries from User A
      expect(queryClient.getQueryData(['books'])).toBeUndefined();
      expect(queryClient.getQueryData(['transactions', 'book-a-1'])).toBeUndefined();
    });
  });

  describe('convenience exports and selectors', () => {
    it('provides status selectors matching state', () => {
      act(() => {
        useAuthStore.setState({ status: 'idle' });
      });
      const { result: statusResult } = renderHook(() => useAuthStatus());
      const { result: isIdleResult } = renderHook(() => useIsAuthIdle());
      const { result: isSignedInResult } = renderHook(() => useIsSignedIn());
      const { result: isSignedOutResult } = renderHook(() => useIsSignedOut());
      const { result: noticeResult } = renderHook(() => useAuthSessionNotice());

      expect(isIdleResult.current).toBe(true);
      expect(isSignedInResult.current).toBe(false);
      expect(isSignedOutResult.current).toBe(false);
      expect(statusResult.current).toBe('idle');
      expect(noticeResult.current).toBeNull();

      act(() => {
        useAuthStore.setState({ status: 'signedIn', sessionNotice: 'Notice text' });
      });

      expect(isIdleResult.current).toBe(false);
      expect(isSignedInResult.current).toBe(true);
      expect(isSignedOutResult.current).toBe(false);
      expect(statusResult.current).toBe('signedIn');
      expect(noticeResult.current).toBe('Notice text');

      act(() => {
        useAuthStore.setState({ status: 'signedOut' });
      });

      expect(isIdleResult.current).toBe(false);
      expect(isSignedInResult.current).toBe(false);
      expect(isSignedOutResult.current).toBe(true);
      expect(statusResult.current).toBe('signedOut');
    });

    it('provides standalone helper actions hydrate, signIn, signOut, setSessionNotice, recheckSession', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('helper-token');
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await hydrate();
      expect(useAuthStore.getState().status).toBe('signedIn');

      setSessionNotice('Custom notice');
      expect(useAuthStore.getState().sessionNotice).toBe('Custom notice');

      await recheckSession();
      expect(useAuthStore.getState().needsSessionRecheck).toBe(false);

      await signOut();
      expect(useAuthStore.getState().status).toBe('signedOut');

      await signIn('new-token');
      expect(useAuthStore.getState().status).toBe('signedIn');
    });
  });
});
