import { apiClient } from '@/lib/api';

export async function discardDetected(bookId: string, itemId: string): Promise<void> {
  await apiClient.post(`/books/${bookId}/captures/${itemId}/discard`);
}
