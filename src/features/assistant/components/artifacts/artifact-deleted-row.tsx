import type { ArtifactTransaction } from '@/features/assistant/schemas/transaction-artifact-schemas';
import type { Language } from '@/lib/i18n/resources';
import { ArrowDown, ArrowUp } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, ToneTile } from '@/components/ui';
import { formatRowAmount } from '@/features/ledger/utils/format-row-amount';
import { formatRowMeta } from '@/features/ledger/utils/format-row-meta';

export type ArtifactDeletedRowProps = {
  row: ArtifactTransaction;
  locale: Language;
  currency: string;
};

export function ArtifactDeletedRow({ row, locale, currency }: ArtifactDeletedRowProps) {
  const { t } = useTranslation();

  return (
    <View testID="artifact-deleted-row" className="min-h-14 flex-row items-center gap-3 px-4 py-2 opacity-55">
      <ToneTile tone={row.kind} icon={row.kind === 'income' ? ArrowUp : ArrowDown} iconSize={18} />
      <View className="min-w-0 flex-1">
        <Text className="text-row-title text-ink-900 line-through" numberOfLines={1} ellipsizeMode="tail">{row.name}</Text>
        <Text className="mt-0.5 text-meta text-ink-500" numberOfLines={1} ellipsizeMode="tail">
          {[t('assistant.artifacts.deleted'), formatRowMeta(row, locale, true)].join(' · ')}
        </Text>
      </View>
      <Text testID="artifact-deleted-row-amount" className="shrink-0 text-row-title font-semibold text-ink-500 line-through" style={{ fontVariant: ['tabular-nums'] }}>
        {formatRowAmount(row, locale, currency)}
      </Text>
    </View>
  );
}
