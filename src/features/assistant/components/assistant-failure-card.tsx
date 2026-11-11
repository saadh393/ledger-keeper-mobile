import type { SendFailure } from '@/features/assistant/utils/send-retry';
import { useRouter } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type AssistantFailureCardProps = {
  failure: SendFailure;
  onRetry: () => void;
  onDismiss: () => void;
};

export function AssistantFailureCard({ failure, onRetry, onDismiss }: AssistantFailureCardProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const locale = resolveLanguage(i18n.language);
  const message = t(`assistant.failure.${failure.reason}`, {
    required: formatNumber(failure.required ?? 0, locale),
    available: formatNumber(failure.available ?? 0, locale),
    limit: formatNumber(failure.limit ?? 0, locale),
  });

  return (
    <View className="px-4 py-1.5">
      <ArtifactCard
        testID="assistant-failure"
        label={t('assistant.failure.title')}
        icon={CircleAlert}
        tone="expense"
        summary={message}
        footer={(
          <>
            {failure.retryKey ? <Button testID="assistant-failure-retry" variant="text" size="sm" fullWidth={false} label={t('assistant.failure.retry')} onPress={onRetry} /> : null}
            {failure.reason === 'credits' ? <Button testID="assistant-failure-buy" variant="text" size="sm" fullWidth={false} label={t('assistant.failure.buyCredits')} onPress={() => router.push('/credits')} /> : null}
            <Button testID="assistant-failure-dismiss" variant="ghost" size="sm" fullWidth={false} label={t('assistant.failure.dismiss')} onPress={onDismiss} />
          </>
        )}
      >
        <Text className="py-2 text-body text-ink-900">{message}</Text>
      </ArtifactCard>
    </View>
  );
}
