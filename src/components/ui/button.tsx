/* eslint-disable react-hooks/immutability */
import type { GestureResponderEvent, PressableProps, PressableStateCallbackType, StyleProp, View, ViewStyle } from 'react-native';
import type { VariantProps } from 'tailwind-variants';
import * as React from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/theme/use-theme-colors';
import { tv } from '@/lib/tv';

const EASING_CUBIC_BEZIER = Easing.bezier(0.2, 0, 0, 1);

const buttonTv = tv({
  slots: {
    container: 'flex-row items-center justify-center rounded-full px-5 py-2',
    label: 'text-center text-row-title',
  },

  variants: {
    variant: {
      primary: {
        container: 'bg-accent',
        label: 'text-on-accent',
      },
      secondary: {
        container: 'bg-surface-container',
        label: 'text-ink-900',
      },
      text: {
        container: 'bg-transparent',
        label: 'text-link',
      },
      destructive: {
        container: 'bg-transparent',
        label: 'text-clay-500',
      },
      default: {
        container: 'bg-accent',
        label: 'text-on-accent',
      },
      outline: {
        container: 'border border-border-strong bg-transparent',
        label: 'text-ink-900',
      },
      ghost: {
        container: 'bg-transparent',
        label: 'text-ink-900',
      },
      link: {
        container: 'bg-transparent',
        label: 'text-link',
      },
    },
    size: {
      default: {
        container: 'min-h-[44px] min-w-[44px] px-5 py-2',
        label: 'text-row-title',
      },
      compact: {
        container: 'min-h-[40px] min-w-[44px] px-4 py-1.5',
        label: 'text-row-title',
      },
      sm: {
        container: 'min-h-[40px] min-w-[44px] px-4 py-1.5',
        label: 'text-row-title',
      },
      lg: {
        container: 'min-h-[48px] min-w-[44px] px-6 py-2.5',
        label: 'text-row-title',
      },
      icon: {
        container: 'min-h-[44px] min-w-[44px] p-2',
        label: 'text-row-title',
      },
    },
    disabled: {
      true: {
        container: 'opacity-50',
      },
      false: {},
    },
    fullWidth: {
      true: {
        container: '',
      },
      false: {
        container: 'self-center',
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
    disabled: false,
    fullWidth: true,
  },
});

type ButtonVariants = VariantProps<typeof buttonTv>;

export type ButtonProps = {
  label?: string;
  loading?: boolean;
  pending?: boolean;
  className?: string;
  textClassName?: string;
}
& ButtonVariants
& Omit<PressableProps, 'disabled'>;

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

function getIndicatorColor(
  variant: string | undefined,
  colors: ReturnType<typeof useThemeColors>,
) {
  switch (variant) {
    case 'secondary':
      return colors['ink-900'];
    case 'text':
      return colors.link;
    case 'destructive':
      return colors['clay-500'];
    case 'primary':
    default:
      return colors['on-accent'];
  }
}

type ButtonContentProps = {
  children?: React.ReactNode | ((state: PressableStateCallbackType) => React.ReactNode);
  displayLabel?: string;
  isPending: boolean;
  className?: string;
  testID?: string;
  indicatorColor: string;
};

function ButtonContent({
  children,
  displayLabel,
  isPending,
  className,
  testID,
  indicatorColor,
}: ButtonContentProps) {
  const resolvedChildren = typeof children === 'function'
    ? children({ pressed: false, hovered: false, focused: false } as PressableStateCallbackType)
    : children;

  if (resolvedChildren) {
    if (typeof resolvedChildren === 'string') {
      const text = isPending && !resolvedChildren.endsWith('…') ? `${resolvedChildren}…` : resolvedChildren;
      return (
        <Text
          testID={testID ? `${testID}-label` : undefined}
          className={className}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {text}
        </Text>
      );
    }
    return <>{resolvedChildren}</>;
  }

  if (displayLabel) {
    return (
      <Text
        testID={testID ? `${testID}-label` : undefined}
        className={className}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {displayLabel}
      </Text>
    );
  }

  if (isPending) {
    return (
      <ActivityIndicator
        size="small"
        color={indicatorColor}
        testID={testID ? `${testID}-activity-indicator` : undefined}
      />
    );
  }

  return null;
}

function useButtonMotion(
  onPressIn?: ((e: GestureResponderEvent) => void) | null,
  onPressOut?: ((e: GestureResponderEvent) => void) | null,
) {
  const systemReducedMotion = useIsReduceMotionEnabled();
  const reanimatedReducedMotion = useReducedMotion();
  const shouldReduceMotion = systemReducedMotion || Boolean(reanimatedReducedMotion);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = React.useCallback(
    (e: GestureResponderEvent) => {
      onPressIn?.(e);
      if (!shouldReduceMotion) {
        scale.value = withTiming(0.98, {
          duration: 80,
          easing: EASING_CUBIC_BEZIER,
        });
      }
    },
    [onPressIn, shouldReduceMotion, scale],
  );

  const handlePressOut = React.useCallback(
    (e: GestureResponderEvent) => {
      onPressOut?.(e);
      if (!shouldReduceMotion) {
        scale.value = withTiming(1, {
          duration: 80,
          easing: EASING_CUBIC_BEZIER,
        });
      }
    },
    [onPressOut, shouldReduceMotion, scale],
  );

  return { animatedStyle, handlePressIn, handlePressOut };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  ref,
  label: text,
  loading = false,
  pending = false,
  variant = 'primary',
  disabled = false,
  size = 'default',
  className = '',
  testID,
  textClassName = '',
  style,
  hitSlop,
  accessibilityState,
  onPressIn,
  onPressOut,
  onPress,
  children,
  fullWidth,
  ...props
}: ButtonProps & { ref?: React.RefObject<View | null> }) {
  const isPending = Boolean(pending || loading);
  const isDisabled = Boolean(disabled || isPending);
  const isHandlingPressRef = React.useRef(false);

  const themeColors = useThemeColors();
  const { animatedStyle, handlePressIn, handlePressOut } = useButtonMotion(onPressIn, onPressOut);

  const styles = React.useMemo(
    () => buttonTv({ variant, disabled: Boolean(disabled), size, fullWidth }),
    [variant, disabled, size, fullWidth],
  );

  const handlePress = React.useCallback(
    (e: GestureResponderEvent) => {
      if (isDisabled || isHandlingPressRef.current) {
        return;
      }
      isHandlingPressRef.current = true;
      try {
        onPress?.(e);
      }
      finally {
        queueMicrotask(() => {
          isHandlingPressRef.current = false;
        });
      }
    },
    [isDisabled, onPress],
  );

  const defaultHitSlop = size === 'compact' || size === 'sm'
    ? { top: 2, bottom: 2, left: 0, right: 0 }
    : undefined;

  const displayLabel = isPending && text ? (text.endsWith('…') ? text : `${text}…`) : text;
  const indicatorColor = getIndicatorColor(variant, themeColors);

  return (
    <AnimatedPressable
      ref={ref}
      disabled={isDisabled}
      className={styles.container({ className })}
      style={[animatedStyle, style as StyleProp<ViewStyle>]}
      hitSlop={hitSlop ?? defaultHitSlop}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: isPending,
        ...accessibilityState,
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      testID={testID}
      {...props}
    >
      <ButtonContent
        children={children}
        displayLabel={displayLabel}
        isPending={isPending}
        className={styles.label({ className: textClassName })}
        testID={testID}
        indicatorColor={indicatorColor}
      />
    </AnimatedPressable>
  );
}
