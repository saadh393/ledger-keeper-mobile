import type { ChatMessage, SendMessageResponse } from '@/features/assistant/schemas/conversation-schema';
import type { ApiError } from '@/lib/api';
import { getVoiceArtifact } from '@/features/voice/utils/get-voice-artifact';

export type SendFailureReason = 'uncertain' | 'failed' | 'credits' | 'too_long' | 'too_large' | 'rate_limited' | 'disabled' | 'provider' | 'transcription' | 'image_too_large';

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

export function classifySendError(error: ApiError, isReceipt = false): SendFailure {
  if (isReceipt && (error.status === 413 || error.code === 'limit_exceeded'))
    return { reason: 'image_too_large', retryKey: null };
  if (error.status === 413)
    return { reason: 'too_large', retryKey: null };
  if (uncertainKinds.has(error.kind) || isOperationInProgress(error))
    return { reason: 'uncertain', retryKey: 'same' };
  if (error.kind === 'insufficient_credits')
    return { reason: 'credits', retryKey: null, required: error.required, available: error.available };
  if (error.code === 'limit_exceeded')
    return { reason: 'too_long', retryKey: null, limit: error.limit };
  if (error.code === 'operation_disabled')
    return { reason: 'disabled', retryKey: null };
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

export function getReplyFailure(result: SendMessageResponse): SendFailure | null {
  if (getVoiceArtifact(result.userMessage)?.state === 'failed')
    return { reason: 'transcription', retryKey: 'new' };
  return isProviderFailure(result.aiMessage, result.credits.charged) ? { reason: 'provider', retryKey: 'new' } : null;
}

export type SentMessage = {
  text: string;
  key: string;
  isReceipt?: boolean;
};

export function isSentMessage(message: ChatMessage, { text, key, isReceipt }: SentMessage) {
  if (isReceipt)
    return Boolean(message.artifacts?.some(artifact => artifact.type === 'receipt'));
  const voice = getVoiceArtifact(message);
  return voice ? voice.clientAudioId === key : message.text === text;
}

export function hasServerReply(messages: ChatMessage[], sinceId: string | null, sent: SentMessage) {
  const start = sinceId ? messages.findIndex(message => message.id === sinceId) + 1 : 0;
  const recent = messages.slice(start);
  return recent.some((message, index) => message.role === 'user' && isSentMessage(message, sent) && recent[index + 1]?.role === 'ai');
}
