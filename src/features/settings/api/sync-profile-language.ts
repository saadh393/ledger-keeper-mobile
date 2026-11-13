import type { Language } from '@/lib/i18n/resources';
import { updateProfile } from '@/features/currency/api/profile-api';
import { storage } from '@/lib/storage';

export const PENDING_LANGUAGE_SYNC = 'pending_language_sync';

export async function syncProfileLanguage(locale: Language) {
  storage.set(PENDING_LANGUAGE_SYNC, locale);
  const profile = await updateProfile({ locale });
  storage.remove(PENDING_LANGUAGE_SYNC);
  return profile;
}
