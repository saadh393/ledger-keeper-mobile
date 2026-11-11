import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type AiBarCounterProps = {
  count: number;
  max: number;
  isOverLimit: boolean;
};

export function AiBarCounter({ count, max, isOverLimit }: AiBarCounterProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);

  return (
    <Text
      testID="ai-bar-counter"
      accessibilityLiveRegion="polite"
      className={`ml-2 text-meta ${isOverLimit ? 'text-clay-500' : 'text-ink-500'}`}
      style={{ fontVariant: ['tabular-nums'] }}
    >
      {t('assistant.bar.counter', { length: formatNumber(count, locale), max: formatNumber(max, locale) })}
    </Text>
  );
}
