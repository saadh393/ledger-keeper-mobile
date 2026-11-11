import type { UseQueryResult } from '@tanstack/react-query';
import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/ui';
import { AssistantEmptyState } from '@/features/assistant/components/assistant-empty-state';
import { AssistantThread } from '@/features/assistant/components/assistant-thread';
import { AssistantThreadLoading } from '@/features/assistant/components/assistant-thread-loading';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';

export function AssistantSheetBody({ conversation }: { conversation: UseQueryResult<Conversation | null> }) {
  const { t } = useTranslation();
  const hasPending = useAssistantStore(state => Boolean(state.pending));

  if (conversation.isError && !hasPending) {
    return (
      <EmptyState
        testID="assistant-error"
        variant="error"
        title={t('assistant.sheet.error')}
        actionLabel={t('assistant.sheet.retry')}
        onAction={() => conversation.refetch()}
        actionLoading={conversation.isFetching}
        className="flex-1"
      />
    );
  }

  if (conversation.data === undefined && !hasPending)
    return <AssistantThreadLoading />;

  if (!conversation.data?.messages.length && !hasPending)
    return <AssistantEmptyState />;

  return <AssistantThread messages={conversation.data?.messages ?? []} currency={conversation.data?.currency} />;
}
