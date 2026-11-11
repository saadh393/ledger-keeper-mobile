import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type AiBarHintProps = {
  chatCredits?: number | null;
};

export function AiBarHint({ chatCredits }: AiBarHintProps) {
  const { t, i18n } = useTranslation();
  const text = chatCredits === null
    ? t('assistant.bar.unavailable')
    : chatCredits === undefined
      ? t('assistant.bar.disclaimer')
      : t('assistant.bar.hint', { credits: formatNumber(chatCredits, resolveLanguage(i18n.language)) });

  return (
    <Text testID="ai-bar-hint" numberOfLines={1} className="flex-1 text-center text-meta text-ink-500">
      {text}
    </Text>
  );
}
