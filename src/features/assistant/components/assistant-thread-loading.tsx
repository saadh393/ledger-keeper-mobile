import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { AssistantMessagePlaceholder } from '@/features/assistant/components/assistant-message-placeholder';

export function AssistantThreadLoading() {
  const { t } = useTranslation();

  return (
    <View testID="assistant-thread-loading" aria-busy accessibilityLabel={t('common.loading')} className="flex-1 justify-end pb-4">
      <AssistantMessagePlaceholder isUser />
      <AssistantMessagePlaceholder isUser={false} />
      <AssistantMessagePlaceholder isUser />
      <AssistantMessagePlaceholder isUser={false} />
    </View>
  );
}
