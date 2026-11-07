import type { ThemeName } from '@/lib/theme/colors';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';
import { parseTheme } from '@/lib/theme/parse-theme';

type ThemeState = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      theme: 'dark',
      setTheme: theme => set({ theme }),
    }),
    {
      name: 'theme',
      storage: createJSONStorage(() => zustandStorage),
      partialize: state => ({ theme: state.theme }),
      merge: (persisted, current) => ({
        ...current,
        theme: parseTheme((persisted as Partial<ThemeState> | undefined)?.theme),
      }),
    },
  ),
);
