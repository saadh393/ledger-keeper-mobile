/* eslint-disable max-lines-per-function */
import { act, renderHook } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import {
  _resetAuthStore,
  hydrate,
  signIn,
  signOut,
  useAuthStatus,
  useAuthStore,
  useIsAuthIdle,
  useIsSignedIn,
  useIsSignedOut,
} from '@/features/auth';
import { queryClient } from '@/lib/api';
import { storage } from '@/lib/storage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetAuthStore();
    queryClient.clear();
  });

  describe('initial state', () => {
    it('starts with exactly "idle" state', () => {
      expect(useAuthStore.getState().status).toBe('idle');
    });
  });

  describe('hydrate()', () => {
    it('moves idle -> signedIn when a token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('valid-jwt-token');

      await useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().status).toBe('signedIn');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
    });

    it('moves idle -> signedOut when no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      await useAuthStore.getState().hydrate();

      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('auth_token');
    });

    it('ends in signedOut instead of crashing or staying idle when secure storage throws', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Keystore corrupted or device locked'),
      );

      await expect(useAuthStore.getState().hydrate()).resolves.toBeUndefined();

      expect(useAuthStore.getState().status).toBe('signedOut');
      errorSpy.mockRestore();
    });

    it('handles concurrent hydrate() calls safely with single in-flight resolution', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('concurrent-token');

      await Promise.all([
        useAuthStore.getState().hydrate(),
        useAuthStore.getState().hydrate(),
      ]);

      expect(useAuthStore.getState().status).toBe('signedIn');
      expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('signIn(token)', () => {
    it('saves token in secure storage and moves to signedIn', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);

      await useAuthStore.getState().signIn('user-session-token');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'user-session-token');
      expect(useAuthStore.getState().status).toBe('signedIn');
    });

    it('never writes the token to MMKV or logs', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      const secretToken = 'ultra-secret-token-xyz';

      await useAuthStore.getState().signIn(secretToken);

      // Verify MMKV was never called with the token
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
    it('clears token, clears queryClient, deletes user MMKV keys, preserves theme, and moves to signedOut', async () => {
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

    it('calling signOut() twice at once leaves store in signedOut without errors', async () => {
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

    it('is safe and idempotent when calling signOut() again while already signedOut', async () => {
      useAuthStore.setState({ status: 'signedOut' });
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await expect(useAuthStore.getState().signOut()).resolves.toBeUndefined();

      expect(useAuthStore.getState().status).toBe('signedOut');
    });

    it('continues cleanup and transitions to signedOut even if secure storage throws', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      useAuthStore.setState({ status: 'signedIn' });
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Secure storage delete failure'),
      );
      (storage.getAllKeys as jest.Mock).mockReturnValue(['theme', 'active_book_id']);
      const clearQuerySpy = jest.spyOn(queryClient, 'clear');

      await expect(useAuthStore.getState().signOut()).resolves.toBeUndefined();

      expect(useAuthStore.getState().status).toBe('signedOut');
      expect(clearQuerySpy).toHaveBeenCalled();
      expect(storage.remove).toHaveBeenCalledWith('active_book_id');

      clearQuerySpy.mockRestore();
      errorSpy.mockRestore();
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

      expect(isIdleResult.current).toBe(true);
      expect(isSignedInResult.current).toBe(false);
      expect(isSignedOutResult.current).toBe(false);
      expect(statusResult.current).toBe('idle');

      act(() => {
        useAuthStore.setState({ status: 'signedIn' });
      });

      expect(isIdleResult.current).toBe(false);
      expect(isSignedInResult.current).toBe(true);
      expect(isSignedOutResult.current).toBe(false);
      expect(statusResult.current).toBe('signedIn');

      act(() => {
        useAuthStore.setState({ status: 'signedOut' });
      });

      expect(isIdleResult.current).toBe(false);
      expect(isSignedInResult.current).toBe(false);
      expect(isSignedOutResult.current).toBe(true);
      expect(statusResult.current).toBe('signedOut');
    });

    it('provides standalone helper actions hydrate, signIn, signOut', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('helper-token');
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await hydrate();
      expect(useAuthStore.getState().status).toBe('signedIn');

      await signOut();
      expect(useAuthStore.getState().status).toBe('signedOut');

      await signIn('new-token');
      expect(useAuthStore.getState().status).toBe('signedIn');
    });
  });
});
