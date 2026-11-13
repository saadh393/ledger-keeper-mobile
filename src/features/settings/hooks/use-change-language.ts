import type { LanguageChoice } from '@/features/settings/utils/language-choice';
import { useQueryClient } from '@tanstack/react-query';
import { getLocales } from 'expo-localization';
import { userProfileQueryKey } from '@/features/currency';
import { syncProfileLanguage } from '@/features/settings/api/sync-profile-language';
import { useLanguageStore } from '@/features/settings/store/use-language-store';
import { resolveLanguageChoice } from '@/features/settings/utils/language-choice';

export function useChangeLanguage() {
  const queryClient = useQueryClient();
  const setChoice = useLanguageStore(state => state.setChoice);

  return (choice: LanguageChoice) => {
    setChoice(choice);
    syncProfileLanguage(resolveLanguageChoice(choice, getLocales()[0]?.languageTag))
      .then(profile => queryClient.setQueryData(userProfileQueryKey, profile))
      .catch(() => {});
  };
}
