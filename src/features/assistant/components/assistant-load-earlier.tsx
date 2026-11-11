import type { Conversation } from '@/features/assistant/schemas/conversation-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { useLoadEarlierMessages } from '@/features/assistant/api/use-load-earlier-messages';

export type AssistantLoadEarlierProps = {
  conversation: Conversation;
  onLoad: () => void;
};

export function AssistantLoadEarlier({ conversation, onLoad }: AssistantLoadEarlierProps) {
  const { t } = useTranslation();
  const mutation = useLoadEarlierMessages(conversation.bookId, conversation);
  const busy = React.useRef(false);
  const oldestId = conversation.messages[0]?.id;

  const load = () => {
    if (busy.current || !oldestId)
      return;
    busy.current = true;
    onLoad();
    mutation.mutate(oldestId, {
      onSettled: () => {
        busy.current = false;
      },
    });
  };

  return (
    <View testID="assistant-load-earlier" className="items-center gap-1 py-2">
      {mutation.isError
        ? <Text testID="assistant-load-earlier-error" accessibilityRole="alert" className="text-meta text-clay-500">{t('assistant.earlier.error')}</Text>
        : null}
      <Button
        testID="assistant-load-earlier-button"
        variant="text"
        size="sm"
        fullWidth={false}
        label={t(mutation.isPending ? 'assistant.earlier.loading' : mutation.isError ? 'assistant.earlier.retry' : 'assistant.earlier.load')}
        pending={mutation.isPending}
        onPress={load}
      />
    </View>
  );
}
