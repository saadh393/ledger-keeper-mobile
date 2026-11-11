import type { InfiniteData } from '@tanstack/react-query';
import type { BookChatPage, Conversation } from '@/features/assistant/schemas/conversation-schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteConversation } from '@/features/assistant/api/delete-conversation';
import { bookChatsQueryKey } from '@/features/assistant/api/use-book-chats';
import { useOpenChat } from '@/features/assistant/api/use-open-chat';
import { openConversationQueryKey } from '@/features/assistant/api/use-open-conversation';
import { removeBookChat } from '@/features/assistant/utils/remove-book-chat';

export function useDeleteChat(bookId: string) {
  const queryClient = useQueryClient();
  const openChat = useOpenChat();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_, chatId) => {
      queryClient.setQueryData<InfiniteData<BookChatPage>>(bookChatsQueryKey(bookId), data => data && removeBookChat(data, chatId));
      if (queryClient.getQueryData<Conversation | null>(openConversationQueryKey(bookId))?.id === chatId)
        openChat(null);
    },
  });
}
