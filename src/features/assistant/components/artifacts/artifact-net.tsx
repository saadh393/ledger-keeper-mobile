import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { formatStat } from '@/features/ledger/utils/format-stat';
import { netPositionLabel } from '@/features/ledger/utils/stat-labels';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type ArtifactNetProps = {
  value: number;
  currency: string;
};

export function ArtifactNet({ value, currency }: ArtifactNetProps) {
  const { t, i18n } = useTranslation();
  const net = formatStat({ label: netPositionLabel, value, delta: '' }, resolveLanguage(i18n.language), currency);

  return (
    <Text testID="artifact-net" className={`shrink-0 text-label font-semibold ${net.valueClassName ?? 'text-ink-900'}`} style={{ fontVariant: ['tabular-nums'] }}>
      {`${t('ledger.stats.short.net')} ${net.value}`}
    </Text>
  );
}
