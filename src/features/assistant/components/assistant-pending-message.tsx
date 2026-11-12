import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useSendMessage } from '@/features/assistant/api/use-send-message';
import { AssistantFailureCard } from '@/features/assistant/components/assistant-failure-card';
import { AssistantMessage } from '@/features/assistant/components/assistant-message';
import { AssistantTypingIndicator } from '@/features/assistant/components/assistant-typing-indicator';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { toPendingMessage } from '@/features/assistant/utils/to-pending-message';

const serverFailures = new Set(['provider', 'transcription']);

export function AssistantPendingMessage() {
  const { t } = useTranslation();
  const pending = useAssistantStore(state => state.pending);
  const { retry, dismiss } = useSendMessage();

  if (!pending)
    return null;

  return (
    <View testID="assistant-pending">
      {pending.failure && serverFailures.has(pending.failure.reason)
        ? null
        : <AssistantMessage message={toPendingMessage(pending)} />}
      {pending.failure
        ? <AssistantFailureCard failure={pending.failure} onRetry={retry} onDismiss={dismiss} />
        : (
            <>
              <Text testID="assistant-sending" className="px-4 text-right text-meta text-ink-500">{t('assistant.send.sending')}</Text>
              <AssistantTypingIndicator />
            </>
          )}
    </View>
  );
}
