import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import * as React from 'react';
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { twMerge } from '@/lib/tw-merge';

export type SegmentOption<T extends string = string> = {
  label: string;
  value: T;
  testID?: string;
  accessibilityLabel?: string;
};

export type SegmentedControlProps<T extends string = string> = {
  options: (SegmentOption<T> | string)[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  testID?: string;
  disabled?: boolean;
};

function useIsReduceMotionEnabled(): boolean {
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted && enabled) {
          setReduceMotion(true);
        }
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (mounted) {
          setReduceMotion(Boolean(enabled));
        }
      },
    );

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return reduceMotion;
}

type SegmentItemProps<T extends string> = {
  option: SegmentOption<T>;
  isSelected: boolean;
  disabled: boolean;
  testID?: string;
  onPress: () => void;
  containerWidth: number;
  elevationStyle: ViewStyle | undefined;
};

function SegmentItem<T extends string>({
  option,
  isSelected,
  disabled,
  testID,
  onPress,
  containerWidth,
  elevationStyle,
}: SegmentItemProps<T>) {
  const segmentTestId
    = option.testID
      ?? (testID ? `${testID}-segment-${option.value}` : undefined);

  return (
    <Pressable
      testID={segmentTestId}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected, disabled }}
      accessibilityLabel={option.accessibilityLabel ?? option.label}
      disabled={disabled}
      onPress={onPress}
      className={twMerge(
        'min-h-[44px] min-w-[44px] flex-1 items-center justify-center rounded-full px-3 py-2',
        containerWidth === 0 && isSelected ? 'bg-surface' : 'bg-transparent',
      )}
      style={containerWidth === 0 && isSelected ? [elevationStyle] : undefined}
    >
      <Text
        className={twMerge(
          'text-center text-label font-medium',
          isSelected ? 'text-ink-900' : 'text-ink-500',
        )}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {option.label}
      </Text>
    </Pressable>
  );
}

function useIndicatorAnimation(
  segmentWidth: number,
  activeIndex: number,
  shouldReduceMotion: boolean,
) {
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    if (segmentWidth > 0 && activeIndex >= 0) {
      const targetX = activeIndex * segmentWidth;
      if (shouldReduceMotion) {
        translateX.value = targetX;
      }
      else {
        translateX.value = withTiming(targetX, {
          duration: 120,
          easing: Easing.bezier(0.2, 0, 0, 1),
        });
      }
    }
  }, [activeIndex, segmentWidth, shouldReduceMotion, translateX]);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth,
  }));
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  testID,
  disabled = false,
}: SegmentedControlProps<T>) {
  const systemReducedMotion = useIsReduceMotionEnabled();
  const reanimatedReducedMotion = useReducedMotion();
  const shouldReduceMotion
    = systemReducedMotion || Boolean(reanimatedReducedMotion);

  const normalizedOptions: SegmentOption<T>[] = React.useMemo(() => {
    return options.map((option) => {
      if (typeof option === 'string') {
        return { label: option, value: option as T };
      }
      return option;
    });
  }, [options]);

  const activeIndex = React.useMemo(() => {
    return normalizedOptions.findIndex(opt => opt.value === value);
  }, [normalizedOptions, value]);

  const [containerWidth, setContainerWidth] = React.useState(0);
  const padding = 4;
  const availableWidth = Math.max(0, containerWidth - padding * 2);
  const segmentWidth
    = normalizedOptions.length > 0
      ? availableWidth / normalizedOptions.length
      : 0;

  const animatedIndicatorStyle = useIndicatorAnimation(
    segmentWidth,
    activeIndex,
    shouldReduceMotion,
  );

  const onLayout = React.useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  const elevationStyle = React.useMemo(() => {
    return Platform.select<ViewStyle>({
      android: { elevation: 1 },
      ios: {
        elevation: 1,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      default: { elevation: 1 },
    });
  }, []);

  return (
    <View
      onLayout={onLayout}
      className={twMerge(
        'relative flex-row items-center rounded-full bg-paper-200 p-1',
        className,
      )}
      testID={testID ? `${testID}-track` : testID}
      accessibilityRole="tablist"
    >
      {containerWidth > 0 && segmentWidth > 0 && (
        <View
          pointerEvents="none"
          testID={testID ? `${testID}-indicator-layer` : 'segmented-control-indicator-layer'}
          style={StyleSheet.absoluteFill}
        >
          <Animated.View
            testID={testID ? `${testID}-active-indicator` : 'segmented-control-active-indicator'}
            style={[
              {
                position: 'absolute',
                top: padding,
                bottom: padding,
                left: padding,
              },
              animatedIndicatorStyle,
              elevationStyle,
            ]}
            className="rounded-full bg-surface"
          />
        </View>
      )}

      {normalizedOptions.map(option => (
        <SegmentItem
          key={option.value}
          option={option}
          isSelected={option.value === value}
          disabled={disabled}
          testID={testID}
          containerWidth={containerWidth}
          elevationStyle={elevationStyle}
          onPress={() => {
            if (disabled || option.value === value)
              return;
            onChange(option.value);
          }}
        />
      ))}
    </View>
  );
}
