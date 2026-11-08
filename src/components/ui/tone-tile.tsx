import type { LucideIcon, LucideProps } from 'lucide-react-native';
import type { ViewProps } from 'react-native';
import type { ColorToken } from '@/lib/theme/colors';
import * as React from 'react';

import { View } from 'react-native';
import { useThemeColors } from '@/lib/theme/use-theme-colors';
import { twMerge } from '@/lib/tw-merge';

export type Tone = 'income' | 'expense' | 'info' | 'warning';
export type ToneTileSize = 40 | 48 | '40' | '48' | 'sm' | 'md';

export type ToneTileProps = {
  tone: Tone;
  size?: ToneTileSize;
  icon?: LucideIcon | React.ComponentType<LucideProps> | React.ReactNode;
  iconSize?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  accessibilityLabel?: string;
} & Omit<ViewProps, 'children'>;

const toneStyles: Record<
  Tone,
  {
    bgClass: string;
    iconToken: ColorToken;
  }
> = {
  income: {
    bgClass: 'bg-forest-100',
    iconToken: 'forest-500',
  },
  expense: {
    bgClass: 'bg-clay-100',
    iconToken: 'clay-500',
  },
  info: {
    bgClass: 'bg-selected',
    iconToken: 'link',
  },
  warning: {
    bgClass: 'bg-wheat-200',
    iconToken: 'wheat-500',
  },
};

function isComponentType(item: unknown): item is React.ComponentType<LucideProps> {
  return (
    typeof item === 'function'
    || (typeof item === 'object' && item !== null && !React.isValidElement(item))
  );
}

export function ToneTile({
  tone,
  size = 40,
  icon,
  iconSize,
  strokeWidth = 1.75,
  className = '',
  children,
  accessibilityLabel,
  style,
  ...props
}: ToneTileProps) {
  const themeColors = useThemeColors();
  const config = toneStyles[tone];
  const is48 = size === 48 || size === '48' || size === 'md';
  const resolvedIconSize = iconSize ?? (is48 ? 24 : 20);
  const iconColor = themeColors[config.iconToken];
  const isLabeled = Boolean(accessibilityLabel);

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      const elementProps = (icon.props || {}) as Record<string, unknown>;
      // eslint-disable-next-line react/no-clone-element
      return React.cloneElement(icon as React.ReactElement<Record<string, unknown>>, {
        size: elementProps.size ?? resolvedIconSize,
        color: elementProps.color ?? iconColor,
        strokeWidth: elementProps.strokeWidth ?? strokeWidth,
      });
    }

    if (isComponentType(icon)) {
      const IconComponent = icon;
      return (
        <IconComponent
          size={resolvedIconSize}
          color={iconColor}
          strokeWidth={strokeWidth}
        />
      );
    }

    if (icon) {
      return icon;
    }

    return children ?? null;
  };

  return (
    <View
      className={twMerge(
        'items-center justify-center',
        is48 ? 'size-12 rounded-[16px]' : 'size-10 rounded-[12px]',
        config.bgClass,
        className,
      )}
      style={style}
      accessibilityElementsHidden={!isLabeled}
      importantForAccessibility={isLabeled ? 'yes' : 'no-hide-descendants'}
      aria-hidden={!isLabeled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={isLabeled ? 'image' : undefined}
      {...props}
    >
      {renderIcon()}
    </View>
  );
}
