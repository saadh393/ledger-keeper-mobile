import type { Language } from '@/lib/i18n/resources';

const localeMap: Record<Language, string> = {
  en: 'en-BD',
  bn: 'bn-BD',
};

export const timeZone = 'Asia/Dhaka';

export function resolveLocale(locale: Language) {
  return localeMap[locale];
}
