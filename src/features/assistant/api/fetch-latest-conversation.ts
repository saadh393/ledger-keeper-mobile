import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import { bookChatPageSchema, conversationSchema } from '@/features/assistant/schemas/conversation-schema';
import { apiClient } from '@/lib/api';

export async function fetchLatestConversation(bookId: string): Promise<Conversation | null> {
  const page = await apiClient.get(`/books/${bookId}/conversations`, { params: { limit: 1 } });
  const latest = bookChatPageSchema.parse(page.data).items[0];
  if (!latest)
    return null;
  const response = await apiClient.get(`/conversations/${latest.id}`);
  return conversationSchema.parse(response.data);
}
