import type { SendMessageResponse } from '@/features/assistant/schemas/conversation-schema';
import { sendMessageResponseSchema } from '@/features/assistant/schemas/conversation-schema';
import { apiClient, parse } from '@/lib/api';

export const AI_TIMEOUT_MS = 60000;

export async function sendMessage(conversationId: string, text: string, idempotencyKey: string): Promise<SendMessageResponse> {
  const response = await apiClient.post(
    `/conversations/${conversationId}/messages`,
    { text },
    { headers: { 'Idempotency-Key': idempotencyKey }, timeout: AI_TIMEOUT_MS },
  );
  return parse(sendMessageResponseSchema, response.data);
}
