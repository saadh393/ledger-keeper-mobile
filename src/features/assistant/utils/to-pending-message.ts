import type { ChatMessage } from '@/features/assistant/schemas/conversation-schema';
import type { PendingSend } from '@/features/assistant/store/use-assistant-store';

export function toPendingMessage({ key, text, voice }: PendingSend): ChatMessage {
  const artifacts = voice && [{
    id: key,
    type: 'voice',
    data: { state: 'transcribing', durationSeconds: voice.durationSeconds, clientAudioId: key, transcript: null },
  }];
  return { id: key, role: 'user', text, artifacts, createdAt: '' };
}
