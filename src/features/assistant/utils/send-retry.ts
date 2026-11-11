import type { ChatMessage } from '@/features/assistant/schemas/conversation-schema';
import type { ApiError } from '@/lib/api';

export type SendFailureReason = 'uncertain' | 'failed' | 'credits' | 'too_long' | 'rate_limited' | 'provider';

export type SendFailure = {
  reason: SendFailureReason;
  retryKey: 'same' | 'new' | null;
  required?: number;
  available?: number;
  limit?: number;
};

const uncertainKinds = new Set(['offline', 'timeout', 'server', 'invalid_response']);

export function isOperationInProgress(error: ApiError) {
  return error.kind === 'conflict' && error.code === 'operation_in_progress';
}

export function classifySendError(error: ApiError): SendFailure {
  if (uncertainKinds.has(error.kind) || isOperationInProgress(error))
    return { reason: 'uncertain', retryKey: 'same' };
  if (error.kind === 'insufficient_credits')
    return { reason: 'credits', retryKey: null, required: error.required, available: error.available };
  if (error.code === 'limit_exceeded')
    return { reason: 'too_long', retryKey: null, limit: error.limit };
  if (error.kind === 'rate_limited')
    return { reason: 'rate_limited', retryKey: 'same' };
  return { reason: 'failed', retryKey: 'new' };
}

export function getRetryKey(failure: SendFailure, key: string, createKey: () => string) {
  return failure.retryKey === 'same' ? key : createKey();
}

export function isProviderFailure(aiMessage: ChatMessage, charged: number) {
  return charged === 0 && Boolean(aiMessage.artifacts?.some(artifact =>
    artifact.type === 'status' && (artifact.data as { tone?: string } | null)?.tone === 'error'));
}

export function hasServerReply(messages: ChatMessage[], sinceId: string | null, text: string) {
  const start = sinceId ? messages.findIndex(message => message.id === sinceId) + 1 : 0;
  const recent = messages.slice(start);
  return recent.some((message, index) => message.role === 'user' && message.text === text && recent[index + 1]?.role === 'ai');
}
