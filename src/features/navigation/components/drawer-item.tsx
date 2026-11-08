import type { GestureResponderEvent } from 'react-native';
import type { NavItem } from '@/features/navigation/types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { Text, View } from '@/components/ui';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type DrawerNavItemProps = {
  item: NavItem;
  isSelected: boolean;
  onPress: (e: GestureResponderEvent) => void;
};

export function DrawerNavItem({ item, isSelected, onPress }: DrawerNavItemProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const Icon = item.icon;

  const iconColor = isSelected ? themeColors['on-selected'] : themeColors['ink-700'];

  return (
    <Pressable
      testID={item.testID}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={t(item.labelTx)}
      onPress={onPress}
      className={`min-h-[44px] flex-row items-center gap-3 rounded-full px-4 py-2.5 ${
        isSelected ? 'bg-selected' : 'bg-transparent active:bg-paper-200'
      }`}
    >
      <View testID={`${item.testID}-icon`}>
        <Icon
          size={20}
          strokeWidth={1.75}
          color={iconColor}
        />
      </View>
      <Text
        numberOfLines={1}
        className={`text-row-title font-medium ${
          isSelected ? 'text-on-selected' : 'text-ink-700'
        }`}
      >
        {t(item.labelTx)}
      </Text>
    </Pressable>
  );
}
