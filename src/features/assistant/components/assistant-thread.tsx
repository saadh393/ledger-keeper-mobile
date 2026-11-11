import type { ListRenderItem } from 'react-native';
import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import type { ThreadItem } from '@/features/assistant/utils/group-messages-by-day';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AssistantDayDivider } from '@/features/assistant/components/assistant-day-divider';
import { AssistantLoadEarlier } from '@/features/assistant/components/assistant-load-earlier';
import { AssistantMessage } from '@/features/assistant/components/assistant-message';
import { AssistantPendingMessage } from '@/features/assistant/components/assistant-pending-message';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { groupMessagesByDay } from '@/features/assistant/utils/group-messages-by-day';
import { formatDayHeader } from '@/lib/format/day-header';
import { toDayKey } from '@/lib/format/day-key';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

const keepVisiblePosition = { minIndexForVisible: 0 };

export function AssistantThread({ conversation }: { conversation: Conversation | null | undefined }) {
  const { i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const today = toDayKey(new Date());
  const currency = conversation?.currency;
  const listRef = React.useRef<React.ComponentRef<typeof BottomSheetFlatList<ThreadItem>>>(null);
  const pending = useAssistantStore(state => state.pending);
  const items = React.useMemo(() => groupMessagesByDay(conversation?.messages ?? []), [conversation?.messages]);
  const tail = `${items.at(-1)?.key}:${pending?.key}`;
  const [heldAt, setHeldAt] = React.useState<string | null>(null);
  const holding = heldAt === tail;

  const renderItem = React.useCallback<ListRenderItem<ThreadItem>>(
    ({ item }) => (item.type === 'day'
      ? <AssistantDayDivider label={formatDayHeader(item.day, locale, today)} />
      : <AssistantMessage message={item.message} currency={currency} />),
    [locale, today, currency],
  );

  const holdScroll = React.useCallback(() => setHeldAt(tail), [tail]);

  const scrollToEnd = () => {
    if (!holding)
      listRef.current?.scrollToEnd({ animated: false });
  };

  return (
    <BottomSheetFlatList
      ref={listRef}
      testID="assistant-thread"
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.key}
      ListHeaderComponent={conversation?.hasMore ? <AssistantLoadEarlier conversation={conversation} onLoad={holdScroll} /> : null}
      ListFooterComponent={AssistantPendingMessage}
      maintainVisibleContentPosition={holding ? keepVisiblePosition : undefined}
      contentContainerStyle={{ paddingBottom: 16 }}
      onLayout={scrollToEnd}
      onContentSizeChange={scrollToEnd}
    />
  );
}
