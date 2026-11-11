import type { Conversation, MessagePage } from '@/features/assistant/schemas/conversation-schema';

export function prependMessages(conversation: Conversation, page: MessagePage): Conversation {
  return { ...conversation, messages: [...page.messages, ...conversation.messages], hasMore: page.hasMore };
}
