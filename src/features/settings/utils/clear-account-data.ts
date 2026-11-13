import { signOut } from '@/features/auth';
import { useLanguageStore } from '@/features/settings/store/use-language-store';
import { clearAllStorage } from '@/lib/storage';
import { useThemeStore } from '@/lib/theme/use-theme-store';

export async function clearAccountData(): Promise<void> {
  await signOut();
  useThemeStore.setState({ theme: 'dark' });
  useLanguageStore.getState().setChoice('system');
  clearAllStorage();
}
