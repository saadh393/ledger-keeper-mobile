import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import { createdConversationSchema } from '@/features/assistant/schemas/conversation-schema';
import { apiClient, parse } from '@/lib/api';

export async function createConversation(bookId: string): Promise<Conversation> {
  const response = await apiClient.post('/conversations', { bookId });
  const created = parse(createdConversationSchema, response.data);
  return { id: created.id, bookId: created.bookId, title: created.suffix, currency: created.currency, messages: [], hasMore: false };
}
