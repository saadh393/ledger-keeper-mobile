import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { Logo, Text, View } from '@/components/ui';
import { DrawerNavItem } from '@/features/navigation/components/drawer-item';
import { DrawerProfileFooter } from '@/features/navigation/components/drawer-profile-footer';
import { DRAWER_WIDTH, NAV_ITEMS } from '@/features/navigation/constants';

export type AppDrawerContentProps = Partial<DrawerContentComponentProps> & {
  state?: DrawerContentComponentProps['state'];
  navigation?: DrawerContentComponentProps['navigation'];
  descriptors?: DrawerContentComponentProps['descriptors'];
};

export function AppDrawerContent(props: AppDrawerContentProps) {
  const { state, navigation } = props;
  const { t } = useTranslation();
  const insets = React.use(SafeAreaInsetsContext) ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const { width: windowWidth } = useWindowDimensions();

  const currentRouteName = state && typeof state.index === 'number'
    ? state.routes?.[state.index]?.name ?? 'index'
    : 'index';

  const handleNavPress = (routeName: string) => {
    if (currentRouteName === routeName) {
      navigation?.closeDrawer?.();
    }
    else {
      navigation?.navigate?.(routeName);
      navigation?.closeDrawer?.();
    }
  };

  const drawerWidth = Math.min(DRAWER_WIDTH, windowWidth);

  return (
    <View
      testID="app-drawer-content"
      style={{
        width: drawerWidth,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-surface-container"
    >
      {/* 1. Logo row */}
      <View testID="drawer-logo-row" className="flex-row items-center gap-3 p-4">
        <Logo size={32} testID="drawer-logo" />
        <Text
          numberOfLines={1}
          className="text-title font-medium text-ink-900"
          testID="drawer-app-title"
        >
          {t('home.title')}
        </Text>
      </View>

      {/* 2. Reserved slot for the book switcher (filled by #22) */}
      <View
        testID="drawer-book-switcher-slot"
        className="px-4 py-1"
      />

      {/* 3. Nav rows */}
      <View testID="drawer-nav-items" className="flex-1 gap-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const isSelected = currentRouteName === item.name;
          return (
            <DrawerNavItem
              key={item.name}
              item={item}
              isSelected={isSelected}
              onPress={() => handleNavPress(item.name)}
            />
          );
        })}
      </View>

      {/* 4. Profile footer */}
      <DrawerProfileFooter />
    </View>
  );
}
