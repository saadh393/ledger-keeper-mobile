import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchOpenConversation } from '@/features/assistant/api/fetch-open-conversation';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { getSelectedConversationId } from '@/features/assistant/utils/get-selected-conversation-id';
import { booksKeys } from '@/features/books/utils/query-keys';

export function openConversationQueryKey(bookId: string) {
  return booksKeys.scoped(bookId, 'conversations', 'open');
}

export function openConversationQuery(bookId: string) {
  return queryOptions({
    queryKey: openConversationQueryKey(bookId),
    queryFn: () => fetchOpenConversation(bookId, getSelectedConversationId(useAssistantStore.getState().selection, bookId)),
  });
}

export function useOpenConversation(bookId: string | null) {
  return useQuery({ ...openConversationQuery(bookId ?? ''), enabled: Boolean(bookId) });
}
