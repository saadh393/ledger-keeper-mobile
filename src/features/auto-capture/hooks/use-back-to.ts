import type { Href } from 'expo-router';
import { useFocusEffect, useRouter } from 'expo-router';
import * as React from 'react';
import { BackHandler } from 'react-native';

export function useBackTo(href: Href) {
  const router = useRouter();
  useFocusEffect(React.useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      router.navigate(href);
      return true;
    });
    return () => subscription.remove();
  }, [router, href]));
}
