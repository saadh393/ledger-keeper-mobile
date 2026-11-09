import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, Button, Text, useBottomSheetModalRef } from '@/components/ui';
import { useDeleteTransaction } from '@/features/ledger/api/use-delete-transaction';
import { formatRowAmount } from '@/features/ledger/utils/format-row-amount';
import { toApiError } from '@/lib/api/errors';

export type LedgerDeleteSheetProps = {
  bookId: string;
  row: TransactionRow;
  locale: Language;
  currency: string;
  onDismiss: () => void;
};

export function LedgerDeleteSheet({ bookId, row, locale, currency, onDismiss }: LedgerDeleteSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();
  const mutation = useDeleteTransaction(bookId);
  const submitting = React.useRef(false);
  const [errorKey, setErrorKey] = React.useState<'ledger.delete.offline' | 'ledger.delete.error' | null>(null);

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const confirm = () => {
    if (submitting.current)
      return;
    submitting.current = true;
    setErrorKey(null);
    mutation.mutate(row.id, {
      onSuccess: modal.dismiss,
      onError: error => setErrorKey(toApiError(error).kind === 'offline' ? 'ledger.delete.offline' : 'ledger.delete.error'),
      onSettled: () => {
        submitting.current = false;
      },
    });
  };

  return (
    <BottomSheet ref={modal.ref} title={t('ledger.delete.title')} dismissible={!mutation.isPending} onDismiss={onDismiss} testID="ledger-delete-sheet">
      <BottomSheetView className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Text testID="ledger-delete-sheet-summary" className="text-row-title text-ink-900">
          {t('ledger.delete.summary', { title: row.name, amount: formatRowAmount(row, locale, currency) })}
        </Text>
        <Text testID="ledger-delete-sheet-body" className="mt-1 text-body text-ink-700">
          {row.items.length ? `${t('ledger.delete.irreversible')} ${t('ledger.delete.items')}` : t('ledger.delete.irreversible')}
        </Text>
        {errorKey
          ? <Text testID="ledger-delete-sheet-error" accessibilityRole="alert" className="mt-3 text-meta text-clay-500">{t(errorKey)}</Text>
          : null}
        <View className="mt-4 gap-2">
          <Button
            testID="ledger-delete-sheet-confirm"
            variant="destructive"
            label={t(mutation.isPending ? 'ledger.delete.deleting' : 'ledger.delete.confirm')}
            pending={mutation.isPending}
            onPress={confirm}
          />
          <Button
            testID="ledger-delete-sheet-cancel"
            variant="secondary"
            label={t('ledger.delete.cancel')}
            disabled={mutation.isPending}
            onPress={modal.dismiss}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
