import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import { fetchConversation } from '@/features/assistant/api/fetch-conversation';
import { fetchLatestConversation } from '@/features/assistant/api/fetch-latest-conversation';

export async function fetchOpenConversation(bookId: string, conversationId: string | null | undefined): Promise<Conversation | null> {
  if (conversationId === undefined)
    return fetchLatestConversation(bookId);
  return conversationId ? fetchConversation(conversationId) : null;
}
