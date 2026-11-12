import type { ChatMessage } from '@/features/assistant/schemas/conversation-schema';
import { voiceArtifactSchema } from '@/features/voice/schemas/voice-artifact-schema';

export function getVoiceArtifact(message: ChatMessage) {
  const parsed = voiceArtifactSchema.safeParse(message.artifacts?.find(artifact => artifact.type === 'voice')?.data);
  return parsed.success ? parsed.data : null;
}
