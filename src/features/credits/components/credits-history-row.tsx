import type { TFunction } from 'i18next';
import type { CreditLedgerEntry } from '@/features/credits/schemas/credit-ledger-schema';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { getLedgerEntryLabel } from '@/features/credits/utils/get-ledger-entry-label';
import { formatDateTime } from '@/lib/format/date';
import { formatNumber } from '@/lib/format/number';
import { twMerge } from '@/lib/tw-merge';

export type CreditsHistoryRowProps = {
  entry: CreditLedgerEntry;
  locale: Language;
};

export function CreditsHistoryRow({ entry, locale }: CreditsHistoryRowProps) {
  const { t } = useTranslation();
  const label = getLedgerEntryLabel(entry, t as TFunction, value => formatNumber(value, locale));

  return (
    <View testID={`credits-history-row-${entry.id}`} className="flex-row items-center gap-3 px-4 py-3">
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className="text-row-title text-ink-900">{label}</Text>
        <Text className="text-meta text-ink-500" style={{ fontVariant: ['tabular-nums'] }}>{formatDateTime(entry.createdAt, locale)}</Text>
      </View>
      {entry.operation
        ? null
        : (
            <Text
              testID="credits-history-amount"
              className={twMerge('text-row-title', entry.amount < 0 ? 'text-clay-500' : 'text-forest-500')}
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {formatNumber(entry.amount, locale, { signDisplay: 'exceptZero' })}
            </Text>
          )}
    </View>
  );
}
