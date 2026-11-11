import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

export function AssistantSheetViewport({ children }: { children: React.ReactNode }) {
  const { animatedPosition, animatedDetentsState } = useBottomSheetInternal();
  const style = useAnimatedStyle(() => ({
    paddingBottom: Math.max(0, Math.min(animatedPosition.value, animatedDetentsState.value.detents?.[0] ?? 0)),
  }));
  return <Animated.View style={[{ flex: 1 }, style]}>{children}</Animated.View>;
}
