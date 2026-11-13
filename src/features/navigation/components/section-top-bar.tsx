import { Menu } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type SectionTopBarProps = {
  title: string;
  titleElement?: React.ReactNode;
  onOpenMenu: () => void;
  rightElement?: React.ReactNode;
};

export function SectionTopBar({ title, titleElement, onOpenMenu, rightElement }: SectionTopBarProps) {
  const { t } = useTranslation();
  const insets = React.use(SafeAreaInsetsContext) ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const themeColors = useThemeColors();

  return (
    <View
      testID="section-top-bar"
      style={{ paddingTop: insets.top }}
      className="bg-paper-100"
    >
      <View className="h-14 flex-row items-center gap-2 px-2">
        <Pressable
          testID="top-bar-menu-button"
          accessibilityRole="button"
          accessibilityLabel={t('navigation.openMenu')}
          onPress={onOpenMenu}
          className="size-11 items-center justify-center rounded-full active:bg-paper-200"
          hitSlop={8}
        >
          <Menu
            size={24}
            strokeWidth={1.75}
            color={themeColors['ink-900']}
          />
        </Pressable>
        {titleElement ?? (
          <Text
            numberOfLines={1}
            className="flex-1 text-title font-medium text-ink-900"
            testID="top-bar-title"
          >
            {title}
          </Text>
        )}
        {rightElement}
      </View>
    </View>
  );
}
