import type { LanguageChoice } from '@/features/settings/utils/language-choice';
import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { parseLanguageChoice, resolveLanguageChoice } from '@/features/settings/utils/language-choice';
import i18n, { getLanguage, LOCAL } from '@/lib/i18n';
import { storage } from '@/lib/storage';

type LanguageState = {
  choice: LanguageChoice;
  setChoice: (choice: LanguageChoice) => void;
};

export const useLanguageStore = create<LanguageState>(set => ({
  choice: parseLanguageChoice(getLanguage()),
  setChoice: (choice) => {
    if (choice === 'system')
      storage.remove(LOCAL);
    else
      storage.set(LOCAL, choice);
    void i18n.changeLanguage(resolveLanguageChoice(choice, getLocales()[0]?.languageTag));
    set({ choice });
  },
}));
