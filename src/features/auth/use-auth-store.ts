/* eslint-disable max-lines-per-function */
import { onlineManager } from '@tanstack/react-query';
import { showMessage } from 'react-native-flash-message';
import { create } from 'zustand';

import { authClient } from '@/features/auth/api/auth-client';
import { queryClient, setOnUnauthorized } from '@/lib/api';
import { ApiError, toApiError } from '@/lib/api/errors';
import { clearToken, getToken, setToken } from '@/lib/auth/token-storage';
import { translate } from '@/lib/i18n';
import { clearUserStorage } from '@/lib/storage';

export type AuthStatus = 'idle' | 'signedIn' | 'signedOut';

export type AuthState = {
  status: AuthStatus;
  sessionNotice: string | null;
  needsSessionRecheck: boolean;
  hydrate: () => Promise<void>;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSessionNotice: (notice: string | null) => void;
  recheckSession: () => Promise<void>;
};

let inFlightHydrate: Promise<void> | null = null;
let inFlightSignOut: Promise<void> | null = null;
let cleanupAuthSessionGuard: (() => void) | null = null;

export const useAuthStore = create<AuthState>(set => ({
  status: 'idle',
  sessionNotice: null,
  needsSessionRecheck: false,

  hydrate: async () => {
    if (inFlightHydrate) {
      return inFlightHydrate;
    }

    inFlightHydrate = (async () => {
      try {
        const token = await getToken();
        if (!token) {
          set({ status: 'signedOut', needsSessionRecheck: false });
          return;
        }

        // Offline check: let user with stored token in, recheck when network returns
        if (!onlineManager.isOnline()) {
          set({ status: 'signedIn', needsSessionRecheck: true });
          return;
        }

        try {
          const sessionData = await authClient.getSession();
          if (sessionData && sessionData.session) {
            set({ status: 'signedIn', needsSessionRecheck: false });
          }
          else {
            // Server returned 200 with null session -> invalid session
            await clearToken();
            set({ status: 'signedOut', needsSessionRecheck: false });
          }
        }
        catch (error) {
          const apiError = error instanceof ApiError ? error : toApiError(error);
          if (apiError.kind === 'offline' || apiError.kind === 'timeout') {
            // Offline or timeout -> let user into app, recheck later
            set({ status: 'signedIn', needsSessionRecheck: true });
          }
          else if (apiError.kind === 'unauthorized' || apiError.status === 401) {
            // 401 Unauthorized -> invalid session, clear token and sign out
            await clearToken();
            set({ status: 'signedOut', needsSessionRecheck: false });
          }
          else {
            // Other server error (500 etc) -> let user into app with stored token
            set({ status: 'signedIn', needsSessionRecheck: true });
          }
        }
      }
      catch {
        set({ status: 'signedOut', needsSessionRecheck: false });
      }
    })().finally(() => {
      inFlightHydrate = null;
    });

    return inFlightHydrate;
  },

  signIn: async (token: string) => {
    await setToken(token);
    set({ status: 'signedIn', sessionNotice: null, needsSessionRecheck: false });
  },

  signOut: async () => {
    if (inFlightSignOut) {
      return inFlightSignOut;
    }

    inFlightSignOut = (async () => {
      // 1. Call server sign-out endpoint
      try {
        await authClient.signOut();
      }
      catch {
        // Continue cleanup even if server sign-out throws or is offline
      }

      // 2. Clear token in secure storage
      try {
        await clearToken();
      }
      catch {
        // Continue cleanup even if secure store deletion throws
      }

      // 3. Clear TanStack Query cache
      try {
        queryClient.clear();
      }
      catch {
        // QueryClient clear should not crash signOut
      }

      // 4. Clear user MMKV storage
      try {
        clearUserStorage();
      }
      catch {
        // Storage cleanup should not crash signOut
      }

      set({ status: 'signedOut', needsSessionRecheck: false });
    })().finally(() => {
      inFlightSignOut = null;
    });

    return inFlightSignOut;
  },

  setSessionNotice: (notice: string | null) => {
    set({ sessionNotice: notice });
  },

  recheckSession: async () => {
    if (!onlineManager.isOnline()) {
      return;
    }
    const token = await getToken();
    if (!token) {
      set({ needsSessionRecheck: false });
      return;
    }

    try {
      const sessionData = await authClient.getSession();
      if (sessionData && sessionData.session) {
        set({ needsSessionRecheck: false });
      }
      else {
        await useAuthStore.getState().signOut();
        const notice = translate('auth.sessionEnded');
        useAuthStore.getState().setSessionNotice(notice);
        showMessage({
          message: notice,
          type: 'danger',
          duration: 4000,
        });
        set({ needsSessionRecheck: false });
      }
    }
    catch (error) {
      const apiError = error instanceof ApiError ? error : toApiError(error);
      if (apiError.kind === 'unauthorized' || apiError.status === 401) {
        await useAuthStore.getState().signOut();
        const notice = translate('auth.sessionEnded');
        useAuthStore.getState().setSessionNotice(notice);
        showMessage({
          message: notice,
          type: 'danger',
          duration: 4000,
        });
        set({ needsSessionRecheck: false });
      }
      // If still offline or timeout, keep needsSessionRecheck = true
    }
  },
}));

export function setupAuthSessionGuard(): () => void {
  if (cleanupAuthSessionGuard) {
    return cleanupAuthSessionGuard;
  }

  // Hook 401 unauthorized requests during use
  setOnUnauthorized(async () => {
    const currentStatus = useAuthStore.getState().status;
    if (currentStatus === 'signedIn') {
      await useAuthStore.getState().signOut();
      const notice = translate('auth.sessionEnded');
      useAuthStore.getState().setSessionNotice(notice);
      showMessage({
        message: notice,
        type: 'danger',
        duration: 4000,
      });
    }
  });

  // Re-run session check when network returns after offline launch
  const unsubscribeNetwork = onlineManager.subscribe((isOnline) => {
    if (isOnline && useAuthStore.getState().needsSessionRecheck) {
      useAuthStore.getState().recheckSession();
    }
  });

  const cleanup = () => {
    setOnUnauthorized(null);
    unsubscribeNetwork();
    cleanupAuthSessionGuard = null;
  };

  cleanupAuthSessionGuard = cleanup;
  return cleanup;
}

export const useAuthStatus = () => useAuthStore(state => state.status);
export const useIsSignedIn = () => useAuthStore(state => state.status === 'signedIn');
export const useIsSignedOut = () => useAuthStore(state => state.status === 'signedOut');
export const useIsAuthIdle = () => useAuthStore(state => state.status === 'idle');
export const useAuthSessionNotice = () => useAuthStore(state => state.sessionNotice);

export const hydrate = () => useAuthStore.getState().hydrate();
export const signIn = (token: string) => useAuthStore.getState().signIn(token);
export const signOut = () => useAuthStore.getState().signOut();
export const setSessionNotice = (notice: string | null) => useAuthStore.getState().setSessionNotice(notice);
export const recheckSession = () => useAuthStore.getState().recheckSession();

export function _resetAuthStore(): void {
  inFlightHydrate = null;
  inFlightSignOut = null;
  if (cleanupAuthSessionGuard) {
    cleanupAuthSessionGuard();
  }
  useAuthStore.setState({
    status: 'idle',
    sessionNotice: null,
    needsSessionRecheck: false,
  });
}
