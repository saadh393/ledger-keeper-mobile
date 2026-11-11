import type { BookChatPage } from '@/features/assistant/schemas/conversation-schema';
import { bookChatPageSchema } from '@/features/assistant/schemas/conversation-schema';
import { apiClient, parse } from '@/lib/api';

export async function fetchBookChats(bookId: string, cursor: string | undefined, limit: number): Promise<BookChatPage> {
  const response = await apiClient.get(`/books/${bookId}/conversations`, { params: { cursor, limit } });
  return parse(bookChatPageSchema, response.data);
}
