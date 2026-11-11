import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEarlierMessages } from '@/features/assistant/api/fetch-earlier-messages';
import { openConversationQueryKey } from '@/features/assistant/api/use-open-conversation';
import { prependMessages } from '@/features/assistant/utils/prepend-messages';
import { toApiError } from '@/lib/api';

export function useLoadEarlierMessages(bookId: string, conversation: Conversation) {
  const queryClient = useQueryClient();
  const queryKey = openConversationQueryKey(bookId);

  return useMutation({
    mutationFn: (before: string) => fetchEarlierMessages(conversation.id, before),
    onSuccess: (page) => {
      queryClient.setQueryData<Conversation | null>(queryKey, current => current?.id === conversation.id ? prependMessages(current, page) : current);
    },
    onError: (error) => {
      if (toApiError(error).kind === 'not_found')
        void queryClient.resetQueries({ queryKey });
    },
  });
}
