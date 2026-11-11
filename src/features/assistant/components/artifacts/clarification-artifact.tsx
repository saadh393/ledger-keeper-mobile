import type { ClarificationArtifactData } from '@/features/assistant/schemas/draft-artifact-schemas';
import { Sparkles } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useLatestConversation } from '@/features/assistant/api/use-latest-conversation';
import { useSendMessage } from '@/features/assistant/api/use-send-message';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { ClarificationAnswered } from '@/features/assistant/components/artifacts/clarification-answered';
import { ClarificationControl } from '@/features/assistant/components/artifacts/clarification-control';
import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { findClarificationAnswer } from '@/features/assistant/utils/find-clarification-answer';
import { formatClarificationAnswer } from '@/features/assistant/utils/format-clarification-answer';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { getChatCredits, useRateCard } from '@/features/credits';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type ClarificationArtifactProps = {
  data: ClarificationArtifactData;
  currency: string;
  artifactId: string;
};

export function ClarificationArtifact({ data, currency, artifactId }: ClarificationArtifactProps) {
  const { t, i18n } = useTranslation();
  const conversation = useLatestConversation(useActiveBook().activeBookId);
  const rateCard = useRateCard();
  const { send } = useSendMessage();
  const isSending = useAssistantStore(state => state.pending?.failure === null);
  const isChatOff = rateCard.data ? getChatCredits(rateCard.data) === null : false;
  const answer = data.state.status === 'answered' ? data.state.value : findClarificationAnswer(conversation.data?.messages ?? [], artifactId);

  if (answer !== null)
    return <ClarificationAnswered question={data.question} answer={formatClarificationAnswer(data.control, answer, { locale: resolveLanguage(i18n.language), currency })} />;

  return (
    <ArtifactCard testID="clarification-artifact" label={t('assistant.clarification.title')} icon={Sparkles} tone="warning">
      <View className="gap-3 pt-2 pb-3">
        <View>
          <Text className="text-row-title text-ink-900">{data.question}</Text>
          {data.summary ? <Text className="mt-1 text-meta text-ink-500">{data.summary}</Text> : null}
        </View>
        <ClarificationControl control={data.control} currency={currency} onSubmit={send} disabled={isSending || isChatOff} />
        {isChatOff ? <Text testID="clarification-unavailable" className="text-meta text-clay-500">{t('assistant.clarification.unavailable')}</Text> : null}
      </View>
    </ArtifactCard>
  );
}
