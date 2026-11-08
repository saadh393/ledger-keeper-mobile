import type { NetInfoState } from '@react-native-community/netinfo';
import type { AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export function isOnlineFromNetInfo(
  state: Partial<NetInfoState> | null | undefined,
): boolean {
  if (!state) {
    return false;
  }
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

export function setupOnlineManager(): () => void {
  let unsubscribe: (() => void) | undefined;

  onlineManager.setEventListener((setOnline) => {
    const sub = NetInfo.addEventListener((state) => {
      setOnline(isOnlineFromNetInfo(state));
    });
    unsubscribe = typeof sub === 'function' ? sub : () => {};
    return unsubscribe;
  });

  return () => {
    unsubscribe?.();
  };
}

export function setupFocusManager(): () => void {
  let unsubscribe: (() => void) | undefined;

  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        handleFocus(status === 'active');
      }
    });

    unsubscribe = () => {
      subscription.remove();
    };

    return unsubscribe;
  });

  return () => {
    unsubscribe?.();
  };
}

export function setupNetworkAndFocus(): () => void {
  const cleanupOnline = setupOnlineManager();
  const cleanupFocus = setupFocusManager();
  return () => {
    cleanupOnline();
    cleanupFocus();
  };
}
