import { DrawerActions } from '@react-navigation/native';
import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';

import { getRouteDecision, useAuthStatus } from '@/features/auth';
import { useAutoCaptureSync } from '@/features/auto-capture/hooks/use-auto-capture-sync';
import { LedgerHeaderActions, MonthSwitcher } from '@/features/ledger';
import {
  AppDrawerContent,
  DRAWER_SCRIM_COLOR,
  DRAWER_WIDTH,
  SectionTopBar,
} from '@/features/navigation';
import { useLanguageSync } from '@/features/settings/hooks/use-language-sync';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export default function AppLayout() {
  const status = useAuthStatus();
  const decision = getRouteDecision(status, '(app)');
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const themeColors = useThemeColors();
  useLanguageSync();
  useAutoCaptureSync();

  if (!decision.canRender) {
    if (decision.redirect) {
      return <Redirect href={decision.redirect} />;
    }
    return null;
  }

  const drawerWidth = Math.min(DRAWER_WIDTH, windowWidth);

  return (
    <Drawer
      initialRouteName="index"
      backBehavior="initialRoute"
      drawerContent={props => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        header: ({ navigation, route, options }) => (
          <SectionTopBar
            title={options.title ?? route.name}
            titleElement={route.name === 'index' ? <MonthSwitcher /> : undefined}
            onOpenMenu={() => navigation.dispatch(DrawerActions.openDrawer())}
            rightElement={options.headerRight ? options.headerRight({ canGoBack: false }) : undefined}
          />
        ),
        drawerStyle: {
          width: drawerWidth,
          backgroundColor: themeColors['surface-container'],
        },
        overlayColor: DRAWER_SCRIM_COLOR,
        swipeEdgeWidth: 32,
        swipeEnabled: true,
        drawerType: 'front',
        sceneStyle: {
          backgroundColor: themeColors['paper-100'],
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: t('navigation.ledger'),
          headerRight: () => <LedgerHeaderActions />,
        }}
      />
      <Drawer.Screen
        name="loans"
        options={{
          title: t('navigation.loans'),
        }}
      />
      <Drawer.Screen
        name="installments"
        options={{
          title: t('navigation.installments'),
        }}
      />
      <Drawer.Screen
        name="credits"
        options={{
          title: t('navigation.credits'),
        }}
      />
      <Drawer.Screen
        name="categories"
        options={{
          title: t('categories.title'),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: t('navigation.settings'),
        }}
      />
      <Drawer.Screen
        name="auto-capture"
        options={{
          title: t('autoCapture.title'),
        }}
      />
      <Drawer.Screen
        name="auto-capture-consent"
        options={{
          title: t('autoCapture.title'),
        }}
      />
      <Drawer.Screen
        name="auto-capture-apps"
        options={{
          title: t('autoCapture.apps.title'),
        }}
      />
      <Drawer.Screen
        name="detected"
        options={{
          title: t('autoCapture.inbox.title'),
        }}
      />
    </Drawer>
  );
}
