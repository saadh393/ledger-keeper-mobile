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
import { groupMessagesByDay } from '@/features/assistant/utils/group-messages-by-day';
import { formatDayHeader } from '@/lib/format/day-header';
import { toDayKey } from '@/lib/format/day-key';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export function AssistantThread({ conversation }: { conversation: Conversation | null | undefined }) {
  const { i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const today = toDayKey(new Date());
  const currency = conversation?.currency;
  const items = React.useMemo(() => groupMessagesByDay(conversation?.messages ?? []).reverse(), [conversation?.messages]);

  const renderItem = React.useCallback<ListRenderItem<ThreadItem>>(
    ({ item }) => (item.type === 'day'
      ? <AssistantDayDivider label={formatDayHeader(item.day, locale, today)} />
      : <AssistantMessage message={item.message} currency={currency} />),
    [locale, today, currency],
  );

  return (
    <BottomSheetFlatList
      inverted
      testID="assistant-thread"
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.key}
      ListHeaderComponent={AssistantPendingMessage}
      ListFooterComponent={conversation?.hasMore ? <AssistantLoadEarlier conversation={conversation} /> : null}
      contentContainerStyle={{ paddingTop: 16 }}
    />
  );
}
