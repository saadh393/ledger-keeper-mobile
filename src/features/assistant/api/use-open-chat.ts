import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { openConversationQueryKey } from '@/features/assistant/api/use-open-conversation';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { releasePending } from '@/features/assistant/utils/release-pending';
import { useActiveBook } from '@/features/books/hooks/use-active-book';

export function useOpenChat() {
  const queryClient = useQueryClient();
  const bookId = useActiveBook().activeBookId;

  return React.useCallback((conversationId: string | null) => {
    const { pending, select } = useAssistantStore.getState();
    if (!bookId || pending?.failure === null)
      return;
    releasePending();
    select({ bookId, conversationId });
    void queryClient.resetQueries({ queryKey: openConversationQueryKey(bookId) });
  }, [bookId, queryClient]);
}
