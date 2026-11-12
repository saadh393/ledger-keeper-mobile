import type { SendMessageResponse } from '@/features/assistant/schemas/conversation-schema';
import type { ReceiptImage } from '@/features/receipts/types';
import { File } from 'expo-file-system';
import { AI_TIMEOUT_MS } from '@/features/assistant/api/send-message';
import { sendMessageResponseSchema } from '@/features/assistant/schemas/conversation-schema';
import { apiClient, parse } from '@/lib/api';

export async function sendReceipt(conversationId: string, receipt: ReceiptImage, idempotencyKey: string): Promise<SendMessageResponse> {
  const body = await new File(receipt.uri).bytes();
  const response = await apiClient.post(`/conversations/${conversationId}/receipt`, body, {
    headers: { 'Content-Type': receipt.mimeType, 'Idempotency-Key': idempotencyKey },
    timeout: AI_TIMEOUT_MS,
  });
  return parse(sendMessageResponseSchema, response.data);
}
