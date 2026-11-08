/* eslint-disable react-refresh/only-export-components */
import type { NetInfoState } from '@react-native-community/netinfo';
import type { StyleProp, ViewStyle } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { twMerge } from '@/lib/tw-merge';

export const OFFLINE_BANNER_DEBOUNCE_MS = 2000;

export function checkIsOffline(
  state: Partial<NetInfoState> | null | undefined,
): boolean {
  if (!state) {
    return false;
  }
  if (state.isConnected === false) {
    return true;
  }
  if (state.isInternetReachable === false) {
    return true;
  }
  return false;
}

export function useIsOffline(): boolean {
  const [isOffline, setIsOffline] = React.useState<boolean>(false);

  React.useEffect(() => {
    let isMounted = true;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (isMounted) {
        setIsOffline(checkIsOffline(state));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return isOffline;
}

export type OfflineBannerProps = {
  className?: string;
  debounceMs?: number;
  isOffline?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  topInset?: number;
};

export function OfflineBanner({
  className = '',
  debounceMs = OFFLINE_BANNER_DEBOUNCE_MS,
  isOffline: isOfflineProp,
  style,
  testID = 'offline-banner',
  topInset,
}: OfflineBannerProps) {
  let safeAreaTop = 0;
  try {
    const insets = useSafeAreaInsets();
    safeAreaTop = insets?.top ?? 0;
  }
  catch {
    safeAreaTop = 0;
  }

  const effectiveTopInset = topInset !== undefined ? topInset : safeAreaTop;
  const networkIsOffline = useIsOffline();
  const effectiveIsOffline = isOfflineProp !== undefined ? isOfflineProp : networkIsOffline;
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (effectiveIsOffline) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, debounceMs);

      return () => {
        clearTimeout(timer);
      };
    }
    else {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setVisible(false);
    }
  }, [effectiveIsOffline, debounceMs]);

  if (!visible) {
    return null;
  }

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[
        {
          paddingTop: Math.max(effectiveTopInset, 8),
          paddingBottom: 8,
          paddingHorizontal: 16,
        },
        style,
      ]}
      className={twMerge(
        'absolute inset-x-0 top-0 z-50 items-center justify-center bg-wheat-200',
        className,
      )}
    >
      <Text
        tx="offline.banner"
        className="text-center text-label font-medium text-ink-900"
      >
        You&apos;re offline
      </Text>
    </View>
  );
}
