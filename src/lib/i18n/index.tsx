/* eslint-disable react-refresh/only-export-components */
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resolveLanguage } from '@/lib/i18n/resolve-language';
import { resources } from './resources';
import { getLanguage } from './utils';

export * from './utils';

i18n.use(initReactI18next).init({
  resources,
  lng: resolveLanguage(getLanguage() ?? getLocales()[0]?.languageTag),
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
