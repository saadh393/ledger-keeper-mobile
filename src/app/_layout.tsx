import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { ThemeProvider } from '@react-navigation/native';
import { Stack, useNavigationContainerRef } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { useThemeConfig } from '@/components/ui/use-theme-config';

import { APIProvider } from '@/lib/api';
import { initSentry, routingInstrumentation, Sentry } from '@/lib/sentry';
import { syncTheme } from '@/lib/theme/sync-theme';
import { useFontsReady } from '@/lib/theme/use-fonts-ready';
import '@/lib/i18n';
// Import  global CSS file
import '../global.css';

export { ErrorBoundary } from 'expo-router';

// eslint-disable-next-line react-refresh/only-export-components
export const unstable_settings = {
  initialRouteName: '(app)',
};

initSentry();
syncTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

function RootLayout() {
  const fontsReady = useFontsReady();
  const navigationRef = useNavigationContainerRef();

  React.useEffect(() => {
    if (navigationRef) {
      routingInstrumentation.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);

  if (!fontsReady) {
    return null;
  }

  return (
    <Providers>
      <OfflineBanner />
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}

const SentryRootLayout = Sentry.wrap(RootLayout);

export default SentryRootLayout;

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      // eslint-disable-next-line better-tailwindcss/no-unknown-classes
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
