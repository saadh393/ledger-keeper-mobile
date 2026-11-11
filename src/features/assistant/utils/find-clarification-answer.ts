import type { ChatMessage } from '@/features/assistant/schemas/conversation-schema';

export function findClarificationAnswer(messages: ChatMessage[], artifactId: string) {
  const index = messages.findIndex(message => message.artifacts?.some(artifact => artifact.id === artifactId));
  const next = index === -1 ? undefined : messages[index + 1];
  return next?.role === 'user' && next.text ? next.text : null;
}
