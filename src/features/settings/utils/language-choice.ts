import type { Language } from '@/lib/i18n/resources';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type LanguageChoice = 'system' | Language;

export function parseLanguageChoice(value?: string | null): LanguageChoice {
  return value === 'en' || value === 'bn' ? value : 'system';
}

export function resolveLanguageChoice(choice: LanguageChoice, deviceTag?: string | null): Language {
  return choice === 'system' ? resolveLanguage(deviceTag) : choice;
}

export function getProfileLanguage(choice: LanguageChoice, profileLocale?: string | null): Language | null {
  return choice === 'system' && profileLocale === 'bn' ? 'bn' : null;
}
