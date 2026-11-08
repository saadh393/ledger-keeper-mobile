import { create } from 'zustand';

import { queryClient } from '@/lib/api';
import { clearToken, getToken, setToken } from '@/lib/auth/token-storage';
import { clearUserStorage } from '@/lib/storage';

export type AuthStatus = 'idle' | 'signedIn' | 'signedOut';

export type AuthState = {
  status: AuthStatus;
  hydrate: () => Promise<void>;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

let inFlightHydrate: Promise<void> | null = null;
let inFlightSignOut: Promise<void> | null = null;

export const useAuthStore = create<AuthState>(set => ({
  status: 'idle',

  hydrate: async () => {
    if (inFlightHydrate) {
      return inFlightHydrate;
    }

    inFlightHydrate = (async () => {
      try {
        const token = await getToken();
        if (token) {
          set({ status: 'signedIn' });
        }
        else {
          set({ status: 'signedOut' });
        }
      }
      catch {
        set({ status: 'signedOut' });
      }
    })().finally(() => {
      inFlightHydrate = null;
    });

    return inFlightHydrate;
  },

  signIn: async (token: string) => {
    await setToken(token);
    set({ status: 'signedIn' });
  },

  signOut: async () => {
    if (inFlightSignOut) {
      return inFlightSignOut;
    }

    inFlightSignOut = (async () => {
      try {
        await clearToken();
      }
      catch {
        // Continue cleanup even if secure store deletion throws
      }

      try {
        queryClient.clear();
      }
      catch {
        // QueryClient clear should not crash signOut
      }

      try {
        clearUserStorage();
      }
      catch {
        // Storage cleanup should not crash signOut
      }

      set({ status: 'signedOut' });
    })().finally(() => {
      inFlightSignOut = null;
    });

    return inFlightSignOut;
  },
}));

export const useAuthStatus = () => useAuthStore(state => state.status);
export const useIsSignedIn = () => useAuthStore(state => state.status === 'signedIn');
export const useIsSignedOut = () => useAuthStore(state => state.status === 'signedOut');
export const useIsAuthIdle = () => useAuthStore(state => state.status === 'idle');

export const hydrate = () => useAuthStore.getState().hydrate();
export const signIn = (token: string) => useAuthStore.getState().signIn(token);
export const signOut = () => useAuthStore.getState().signOut();

export function _resetAuthStore(): void {
  inFlightHydrate = null;
  inFlightSignOut = null;
  useAuthStore.setState({ status: 'idle' });
}
