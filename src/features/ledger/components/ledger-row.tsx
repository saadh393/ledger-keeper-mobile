import type { AccessibilityActionEvent } from 'react-native';
import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import { ArrowDown, ArrowUp } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text, ToneTile } from '@/components/ui';
import { LedgerRowDetails } from '@/features/ledger/components/ledger-row-details';
import { formatRowAmount } from '@/features/ledger/utils/format-row-amount';
import { formatRowMeta } from '@/features/ledger/utils/format-row-meta';

export type LedgerRowProps = {
  row: TransactionRow;
  locale: Language;
  currency: string;
  showDate?: boolean;
  expanded?: boolean;
  onToggle?: (row: TransactionRow) => void;
  onOpenMenu?: (row: TransactionRow) => void;
  onCopy?: (row: TransactionRow) => void;
  onDelete?: (row: TransactionRow) => void;
};

const longPressMs = 450;

export const LedgerRow = React.memo(({ row, locale, currency, showDate = false, expanded = false, onToggle, onOpenMenu, onCopy, onDelete }: LedgerRowProps) => {
  const { t } = useTranslation();
  const meta = formatRowMeta(row, locale, showDate);
  const amount = formatRowAmount(row, locale, currency);

  const handleAction = (event: AccessibilityActionEvent) => {
    const actions: Record<string, ((value: TransactionRow) => void) | undefined> = { activate: onToggle, longpress: onOpenMenu, copy: onCopy, delete: onDelete };
    actions[event.nativeEvent.actionName]?.(row);
  };

  return (
    <View>
      <Pressable
        testID="ledger-row"
        className="min-h-14 flex-row items-center gap-3 px-4 py-2 active:bg-paper-200"
        accessibilityRole="button"
        accessibilityLabel={[row.name, meta, amount].filter(Boolean).join(', ')}
        accessibilityHint={t(expanded ? 'ledger.actions.collapse' : 'ledger.actions.expand')}
        accessibilityState={{ expanded }}
        accessibilityActions={[
          { name: 'activate', label: t(expanded ? 'ledger.actions.collapse' : 'ledger.actions.expand') },
          { name: 'longpress', label: t('ledger.actions.menu') },
          { name: 'copy', label: t('ledger.actions.copy') },
          { name: 'delete', label: t('ledger.actions.delete') },
        ]}
        onAccessibilityAction={handleAction}
        onPress={() => onToggle?.(row)}
        onLongPress={() => onOpenMenu?.(row)}
        delayLongPress={longPressMs}
      >
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
      </Pressable>
      {expanded ? <LedgerRowDetails row={row} locale={locale} currency={currency} /> : null}
    </View>
  );
});
