import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import { fetchBookChats } from '@/features/assistant/api/fetch-book-chats';
import { fetchConversation } from '@/features/assistant/api/fetch-conversation';

export async function fetchLatestConversation(bookId: string): Promise<Conversation | null> {
  const latest = (await fetchBookChats(bookId, undefined, 1)).items[0];
  return latest ? fetchConversation(latest.id) : null;
}
