import type { ConfigContext, ExpoConfig } from '@expo/config';

import type { AppIconBadgeConfig } from 'app-icon-badge/types';

import 'tsx/cjs';

// adding lint exception as we need to import tsx/cjs before env.ts is imported
// eslint-disable-next-line perfectionist/sort-imports
import Env from './env';

const EXPO_ACCOUNT_OWNER = process.env.EXPO_ACCOUNT_OWNER;
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID;

const appIconBadgeConfig: AppIconBadgeConfig = {
  enabled: Env.EXPO_PUBLIC_APP_ENV !== 'production',
  badges: [
    {
      text: Env.EXPO_PUBLIC_APP_ENV,
      type: 'banner',
      color: 'white',
    },
    {
      text: Env.EXPO_PUBLIC_VERSION.toString(),
      type: 'ribbon',
      color: 'white',
    },
  ],
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Env.EXPO_PUBLIC_NAME,
  description: `${Env.EXPO_PUBLIC_NAME} Mobile App`,
  ...(EXPO_ACCOUNT_OWNER ? { owner: EXPO_ACCOUNT_OWNER } : {}),
  scheme: Env.EXPO_PUBLIC_SCHEME,
  slug: 'ledger-keeper',
  version: Env.EXPO_PUBLIC_VERSION.toString(),
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: Env.EXPO_PUBLIC_BUNDLE_ID,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  experiments: {
    typedRoutes: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#131314',
    },
    package: Env.EXPO_PUBLIC_PACKAGE,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    [
      'expo-splash-screen',
      {
        backgroundColor: '#131314',
        image: './assets/splash-icon.png',
        imageWidth: 150,
      },
    ],
    ['expo-localization', { supportsRTL: false }],
    'expo-router',
    'expo-secure-store',
    [
      'expo-audio',
      {
        microphonePermission: `Allow ${Env.EXPO_PUBLIC_NAME} to use the microphone to record voice notes for your ledger.`,
        recordAudioAndroid: true,
      },
    ],
    ['app-icon-badge', appIconBadgeConfig],
    [
      '@sentry/react-native/expo',
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
    ],
  ],
  extra: EAS_PROJECT_ID ? { eas: { projectId: EAS_PROJECT_ID } } : {},
});
