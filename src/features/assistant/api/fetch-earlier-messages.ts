import type { MessagePage } from '@/features/assistant/schemas/conversation-schema';
import { messagePageSchema } from '@/features/assistant/schemas/conversation-schema';
import { apiClient, parse } from '@/lib/api';

export const EARLIER_MESSAGES_LIMIT = 50;

export async function fetchEarlierMessages(conversationId: string, before: string): Promise<MessagePage> {
  const response = await apiClient.get(`/conversations/${conversationId}/messages`, { params: { before, limit: EARLIER_MESSAGES_LIMIT } });
  return parse(messagePageSchema, response.data);
}
