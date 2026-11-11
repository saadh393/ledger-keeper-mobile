import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';

export type AssistantHistoryFooterProps = {
  hasMore: boolean;
  loading: boolean;
  failed: boolean;
  onLoadMore: () => void;
};

export function AssistantHistoryFooter({ hasMore, loading, failed, onLoadMore }: AssistantHistoryFooterProps) {
  const { t } = useTranslation();
  if (!hasMore)
    return null;

  return (
    <View className="items-start gap-1 px-3 py-2">
      {failed ? <Text testID="assistant-history-older-error" accessibilityRole="alert" className="text-meta text-clay-500">{t('assistant.history.olderError')}</Text> : null}
      <Button
        testID="assistant-history-show-older"
        variant="text"
        size="sm"
        fullWidth={false}
        label={t(loading ? 'assistant.history.loadingOlder' : 'assistant.history.showOlder')}
        pending={loading}
        onPress={onLoadMore}
      />
    </View>
  );
}
