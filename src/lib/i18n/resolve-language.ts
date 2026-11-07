import type { Language } from '@/lib/i18n/resources';

export function resolveLanguage(tag?: string | null): Language {
  return tag?.toLowerCase().split(/[-_]/)[0] === 'bn' ? 'bn' : 'en';
}
