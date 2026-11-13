import type { ChatMessage } from '@/features/assistant/schemas/conversation-schema';
import { classifySendError, getReplyFailure, getRetryKey, hasServerReply } from '@/features/assistant/utils/send-retry';
import { ApiError } from '@/lib/api/errors';

const createKey = () => 'new-key';

function message(id: string, role: 'user' | 'ai', content: Pick<ChatMessage, 'text' | 'artifacts'> = {}): ChatMessage {
  return { id, role, ...content, createdAt: '2026-11-11T06:00:00.000Z' };
}

function voice(state: string, clientAudioId: string) {
  return [{ id: 'v', type: 'voice', data: { state, durationSeconds: 3, clientAudioId, transcript: null } }];
}

describe('classifySendError', () => {
  it.each(['offline', 'timeout', 'server', 'invalid_response'] as const)('keeps the same key after an uncertain %s failure', (kind) => {
    const failure = classifySendError(new ApiError({ kind }));
    expect(failure).toEqual({ reason: 'uncertain', retryKey: 'same' });
    expect(getRetryKey(failure, 'key-1', createKey)).toBe('key-1');
  });

  it('treats operation_in_progress as uncertain', () => {
    expect(classifySendError(new ApiError({ kind: 'conflict', code: 'operation_in_progress' })).retryKey).toBe('same');
  });

  it('uses a new key after operation_failed', () => {
    const failure = classifySendError(new ApiError({ kind: 'conflict', code: 'operation_failed' }));
    expect(failure).toEqual({ reason: 'failed', retryKey: 'new' });
    expect(getRetryKey(failure, 'key-1', createKey)).toBe('new-key');
  });

  it('returns the credits card data on 402', () => {
    expect(classifySendError(new ApiError({ kind: 'insufficient_credits', status: 402, required: 3, available: 1 })))
      .toEqual({ reason: 'credits', retryKey: null, required: 3, available: 1 });
  });

  it('maps limits, disabled, rate limit and 413', () => {
    expect(classifySendError(new ApiError({ kind: 'validation', code: 'limit_exceeded', limit: 500 }))).toEqual({ reason: 'too_long', retryKey: null, limit: 500 });
    expect(classifySendError(new ApiError({ kind: 'forbidden', code: 'operation_disabled' })).reason).toBe('disabled');
    expect(classifySendError(new ApiError({ kind: 'rate_limited', status: 429 }))).toEqual({ reason: 'rate_limited', retryKey: 'same' });
    expect(classifySendError(new ApiError({ kind: 'validation', status: 413 })).reason).toBe('too_large');
    expect(classifySendError(new ApiError({ kind: 'validation', status: 413 }), true).reason).toBe('image_too_large');
  });
});

describe('getReplyFailure', () => {
  const ok = { userMessage: message('u', 'user', { text: 'hi' }), aiMessage: message('a', 'ai', { text: 'ok' }), credits: { charged: 1, balance: 9 } };

  it('returns null for a normal reply', () => {
    expect(getReplyFailure(ok)).toBeNull();
  });

  it('asks for a new key after a provider error that charged nothing', () => {
    const aiMessage = message('a', 'ai', { artifacts: [{ id: 's', type: 'status', data: { tone: 'error' } }] });
    expect(getReplyFailure({ ...ok, aiMessage, credits: { charged: 0, balance: 10 } })).toEqual({ reason: 'provider', retryKey: 'new' });
  });

  it('asks for a new key after a failed transcription', () => {
    expect(getReplyFailure({ ...ok, userMessage: message('u', 'user', { artifacts: voice('failed', 'k') }) })).toEqual({ reason: 'transcription', retryKey: 'new' });
  });
});

describe('hasServerReply', () => {
  const messages = [message('1', 'user', { text: 'old' }), message('2', 'ai', { text: 'r' }), message('3', 'user', { text: 'Spent 250' }), message('4', 'ai', { text: 'Saved' })];

  it('finds the sent message followed by a reply after the last known message', () => {
    expect(hasServerReply(messages, '2', { text: 'Spent 250', key: 'k' })).toBe(true);
  });

  it('ignores messages before the last known one and unanswered sends', () => {
    expect(hasServerReply(messages, '4', { text: 'Spent 250', key: 'k' })).toBe(false);
    expect(hasServerReply(messages.slice(0, 3), '2', { text: 'Spent 250', key: 'k' })).toBe(false);
  });

  it('matches voice notes by client audio id', () => {
    const sent = [message('1', 'user', { artifacts: voice('transcribed', 'audio-1') }), message('2', 'ai', { text: 'ok' })];
    expect(hasServerReply(sent, null, { text: '', key: 'audio-1' })).toBe(true);
    expect(hasServerReply(sent, null, { text: '', key: 'audio-2' })).toBe(false);
  });
});
