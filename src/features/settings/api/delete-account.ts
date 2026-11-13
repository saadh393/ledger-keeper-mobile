import { apiClient } from '@/lib/api';

export async function deleteAccount(): Promise<void> {
  await apiClient.delete('/users/me');
}
