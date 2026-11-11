import type { ConversationSelection } from '@/features/assistant/store/use-assistant-store';

export function getSelectedConversationId(selection: ConversationSelection | null, bookId: string) {
  return selection?.bookId === bookId ? selection.conversationId : undefined;
}
