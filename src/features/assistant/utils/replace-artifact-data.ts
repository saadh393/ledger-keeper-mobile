import type { Conversation } from '@/features/assistant/schemas/conversation-schema';

export function replaceArtifactData(conversation: Conversation, artifactId: string, data: unknown): Conversation {
  return {
    ...conversation,
    messages: conversation.messages.map(message => (message.artifacts?.some(artifact => artifact.id === artifactId)
      ? { ...message, artifacts: message.artifacts.map(artifact => (artifact.id === artifactId ? { ...artifact, data } : artifact)) }
      : message)),
  };
}
