import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import { conversationSchema } from '@/features/assistant/schemas/conversation-schema';
import { apiClient, parse } from '@/lib/api';

export async function fetchConversation(conversationId: string): Promise<Conversation> {
  const response = await apiClient.get(`/conversations/${conversationId}`);
  return parse(conversationSchema, response.data);
}
