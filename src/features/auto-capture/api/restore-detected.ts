import { apiClient } from '@/lib/api';

export async function restoreDetected(bookId: string, itemId: string): Promise<void> {
  await apiClient.post(`/books/${bookId}/captures/${itemId}/restore`);
}
