import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useUserProfile } from '@/features/currency';
import { PENDING_LANGUAGE_SYNC, syncProfileLanguage } from '@/features/settings/api/sync-profile-language';
import { useLanguageStore } from '@/features/settings/store/use-language-store';
import { getProfileLanguage } from '@/features/settings/utils/language-choice';
import { storage } from '@/lib/storage';

export function useLanguageSync() {
  const locale = useUserProfile().data?.locale;

  React.useEffect(() => {
    if (!locale)
      return;
    const pending = storage.getString(PENDING_LANGUAGE_SYNC) as Language | undefined;
    if (pending) {
      syncProfileLanguage(pending).catch(() => {});
      return;
    }
    const { choice, setChoice } = useLanguageStore.getState();
    const profileLanguage = getProfileLanguage(choice, locale);
    if (profileLanguage)
      setChoice(profileLanguage);
  }, [locale]);
}
