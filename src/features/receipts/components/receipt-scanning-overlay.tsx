import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui';

export function ReceiptScanningOverlay() {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  const pulse = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  React.useEffect(() => {
    if (!reducedMotion)
      opacity.set(withRepeat(withTiming(0.4, { duration: 800 }), -1, true));
  }, [opacity, reducedMotion]);

  return (
    <Animated.View
      testID="receipt-scanning"
      accessibilityLiveRegion="polite"
      style={pulse}
      className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2"
    >
      <Text className="text-meta font-medium text-white">{t('receipts.scanning')}</Text>
    </Animated.View>
  );
}
