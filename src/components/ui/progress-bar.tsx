import * as React from 'react';
import { useImperativeHandle } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

import { useThemeColors } from '@/lib/theme/use-theme-colors';

type Props = {
  initialProgress?: number;
  className?: string;
};

export type ProgressBarRef = {
  setProgress: (value: number) => void;
};

export function ProgressBar({ ref, initialProgress = 0, className = '' }: Props & { ref?: React.RefObject<ProgressBarRef | null> }) {
  const progress = useSharedValue<number>(initialProgress ?? 0);
  const fill = useThemeColors()['ink-900'];
  useImperativeHandle(ref, () => {
    return {
      setProgress: (value: number) => {
        progress.value = withTiming(value, {
          duration: 250,
          easing: Easing.inOut(Easing.quad),
        });
      },
    };
  }, [progress]);

  const style = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
      backgroundColor: fill,
      height: 2,
    };
  });
  return (
    <View className={twMerge('bg-paper-200', className)}>
      <Animated.View style={style} />
    </View>
  );
}
