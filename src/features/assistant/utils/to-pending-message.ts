import type { ChatMessage, MessageArtifact } from '@/features/assistant/schemas/conversation-schema';
import type { PendingSend } from '@/features/assistant/store/use-assistant-store';

function toPendingArtifacts({ key, voice, receipt }: PendingSend): MessageArtifact[] | undefined {
  if (voice)
    return [{ id: key, type: 'voice', data: { state: 'transcribing', durationSeconds: voice.durationSeconds, clientAudioId: key, transcript: null } }];
  if (receipt)
    return [{ id: key, type: 'receipt', data: { byteSize: receipt.sizeBytes, image: null, previewUri: receipt.uri } }];
  return undefined;
}

export function toPendingMessage(pending: PendingSend): ChatMessage {
  return { id: pending.key, role: 'user', text: pending.text, artifacts: toPendingArtifacts(pending), createdAt: '' };
}
