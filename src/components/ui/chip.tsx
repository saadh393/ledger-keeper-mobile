import type { LucideIcon, LucideProps } from 'lucide-react-native';
import type {
  GestureResponderEvent,
  Insets,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useThemeColors } from '@/lib/theme/use-theme-colors';
import { twMerge } from '@/lib/tw-merge';

export type ChipProps = {
  label?: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: LucideIcon | React.ComponentType<LucideProps> | React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  onPress?: (event: GestureResponderEvent) => void;
  hitSlop?: Insets | number;
  className?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  accessibilityLabel?: string;
  testID?: string;
} & Omit<PressableProps, 'children' | 'hitSlop' | 'style'>;

const DEFAULT_PRESSABLE_HIT_SLOP: Insets = {
  top: 8,
  bottom: 8,
  left: 4,
  right: 4,
};

function isComponentType(item: unknown): item is React.ComponentType<LucideProps> {
  return (
    typeof item === 'function'
    || (typeof item === 'object' && item !== null && !React.isValidElement(item))
  );
}

export function Chip({
  label,
  selected = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  iconSize = 16,
  onPress,
  hitSlop,
  className = '',
  textClassName = '',
  style,
  children,
  accessibilityLabel,
  testID,
  ...pressableProps
}: ChipProps) {
  const themeColors = useThemeColors();
  const isPressable = Boolean(onPress);

  const containerClasses = twMerge(
    'min-h-[32px] flex-row items-center justify-center self-start rounded-full px-3.5 py-1.5',
    selected ? 'bg-selected' : 'bg-paper-200',
    disabled ? 'opacity-50' : 'active:opacity-80',
    className,
  );

  const textColorClass = selected ? 'text-on-selected' : 'text-ink-900';
  const iconColor = themeColors[selected ? 'on-selected' : 'ink-900'];

  const renderIcon = () => {
    if (!icon) {
      return null;
    }

    if (React.isValidElement(icon)) {
      const elementProps = (icon.props || {}) as Record<string, unknown>;
      // eslint-disable-next-line react/no-clone-element
      return React.cloneElement(icon as React.ReactElement<Record<string, unknown>>, {
        size: elementProps.size ?? iconSize,
        color: elementProps.color ?? iconColor,
        strokeWidth: elementProps.strokeWidth ?? 1.75,
      });
    }

    if (isComponentType(icon)) {
      const IconComponent = icon;
      return (
        <IconComponent
          size={iconSize}
          color={iconColor}
          strokeWidth={1.75}
        />
      );
    }

    return icon;
  };

  const renderedIcon = renderIcon();

  const content = (
    <View className="flex-row items-center gap-1.5">
      {renderedIcon && iconPosition === 'left' ? renderedIcon : null}
      {label
        ? (
            <Text
              className={twMerge('text-label', textColorClass, textClassName)}
            >
              {label}
            </Text>
          )
        : null}
      {children}
      {renderedIcon && iconPosition === 'right' ? renderedIcon : null}
    </View>
  );

  if (isPressable) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        disabled={disabled}
        hitSlop={hitSlop ?? DEFAULT_PRESSABLE_HIT_SLOP}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={accessibilityLabel ?? label}
        className={containerClasses}
        style={style}
        {...pressableProps}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      testID={testID}
      className={containerClasses}
      style={style}
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {content}
    </View>
  );
}
