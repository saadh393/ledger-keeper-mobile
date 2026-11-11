import type { ListRenderItem } from 'react-native';
import type { BookChat } from '@/features/assistant/schemas/conversation-schema';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui';
import { useBookChats } from '@/features/assistant/api/use-book-chats';
import { useOpenChat } from '@/features/assistant/api/use-open-chat';
import { AssistantDeleteChatSheet } from '@/features/assistant/components/assistant-delete-chat-sheet';
import { AssistantHistoryFooter } from '@/features/assistant/components/assistant-history-footer';
import { AssistantHistoryPlaceholder } from '@/features/assistant/components/assistant-history-placeholder';
import { AssistantHistoryRow } from '@/features/assistant/components/assistant-history-row';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { formatDayHeader } from '@/lib/format/day-header';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type AssistantHistoryProps = {
  bookId: string | null;
  openConversationId: string | null;
};

export function AssistantHistory({ bookId, openConversationId }: AssistantHistoryProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const chats = useBookChats(bookId);
  const openChat = useOpenChat();
  const setView = useAssistantStore(state => state.setView);
  const [deleting, setDeleting] = React.useState<BookChat | null>(null);
  const items = React.useMemo(() => chats.data?.pages.flatMap(page => page.items) ?? [], [chats.data]);
  const now = new Date();

  const open = React.useCallback((chat: BookChat) => {
    if (chat.id !== openConversationId)
      openChat(chat.id);
    setView('thread');
  }, [openChat, openConversationId, setView]);

  const loadMore = () => {
    if (!chats.isFetchingNextPage)
      void chats.fetchNextPage();
  };

  const renderItem: ListRenderItem<BookChat> = ({ item }) => (
    <AssistantHistoryRow
      chat={item}
      date={formatDayHeader(item.updatedAt, locale, now)}
      isOpen={item.id === openConversationId}
      onOpen={open}
      onDelete={setDeleting}
    />
  );

  const renderContent = () => {
    if (chats.isError && !chats.data) {
      return (
        <EmptyState
          testID="assistant-history-error"
          variant="error"
          title={t('assistant.history.error')}
          actionLabel={t('assistant.history.retry')}
          onAction={() => chats.refetch()}
          actionLoading={chats.isFetching}
          className="flex-1"
        />
      );
    }
    if (!chats.data)
      return <AssistantHistoryPlaceholder />;
    if (!items.length)
      return <EmptyState testID="assistant-history-empty" title={t('assistant.history.empty')} className="flex-1" />;
    return (
      <BottomSheetFlatList
        testID="assistant-history"
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}
        ListFooterComponent={(
          <AssistantHistoryFooter
            hasMore={chats.hasNextPage}
            loading={chats.isFetchingNextPage}
            failed={chats.isFetchNextPageError}
            onLoadMore={loadMore}
          />
        )}
      />
    );
  };

  return (
    <>
      {renderContent()}
      {deleting && bookId
        ? <AssistantDeleteChatSheet bookId={bookId} chat={deleting} onDismiss={() => setDeleting(null)} />
        : null}
    </>
  );
}
