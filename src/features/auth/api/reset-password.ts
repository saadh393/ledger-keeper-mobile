import Env from '@env';
import { apiClient } from '@/lib/api/client';

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const scheme = Env.EXPO_PUBLIC_SCHEME || 'ledgerkeeper';
  await apiClient.post(
    '/auth/reset-password',
    { token, newPassword },
    { headers: { 'expo-origin': `${scheme}://` } },
  );
}
