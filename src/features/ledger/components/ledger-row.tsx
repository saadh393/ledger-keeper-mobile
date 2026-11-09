import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import { ArrowDown, ArrowUp } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import { Text, ToneTile } from '@/components/ui';
import { formatRowAmount } from '@/features/ledger/utils/format-row-amount';
import { formatRowMeta } from '@/features/ledger/utils/format-row-meta';

export type LedgerRowProps = {
  row: TransactionRow;
  locale: Language;
  currency: string;
};

export const LedgerRow = React.memo(({ row, locale, currency }: LedgerRowProps) => {
  const meta = formatRowMeta(row, locale);
  const amount = formatRowAmount(row, locale, currency);

  return (
    <View testID="ledger-row" className="min-h-14 flex-row items-center gap-3 px-4 py-2" accessible accessibilityLabel={[row.name, meta, amount].filter(Boolean).join(', ')}>
      <ToneTile testID="ledger-row-tone" tone={row.kind} icon={row.kind === 'income' ? ArrowUp : ArrowDown} iconSize={18} />
      <View className="min-w-0 flex-1">
        <Text testID="ledger-row-title" className="text-row-title text-ink-900" numberOfLines={1} ellipsizeMode="tail">
          {row.name}
        </Text>
        {meta
          ? (
              <Text testID="ledger-row-meta" className="mt-0.5 text-meta text-ink-500" numberOfLines={1} ellipsizeMode="tail">
                {meta}
              </Text>
            )
          : null}
      </View>
      <Text
        testID="ledger-row-amount"
        className={row.kind === 'income' ? 'shrink-0 text-row-title font-semibold text-forest-500' : 'shrink-0 text-row-title font-semibold text-clay-500'}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {amount}
      </Text>
    </View>
  );
});
