import { apiClient } from '@/lib/api';

export async function discardPending(bookId: string): Promise<void> {
  await apiClient.post(`/books/${bookId}/captures/discard-pending`);
}
