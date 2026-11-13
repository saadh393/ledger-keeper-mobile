import Env from '@env';
import { apiClient } from '@/lib/api/client';

export async function requestPasswordReset(email: string): Promise<void> {
  const scheme = Env.EXPO_PUBLIC_SCHEME || 'ledgerkeeper';
  await apiClient.post(
    '/auth/request-password-reset',
    { email: email.trim(), redirectTo: `${scheme}://reset-password` },
    { headers: { 'expo-origin': `${scheme}://` } },
  );
}
