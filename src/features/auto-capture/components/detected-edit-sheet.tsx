import type { DetectedItem } from '@/features/auto-capture/schemas/detected-item-schema';
import type { CreateTransactionInput } from '@/features/ledger/api/create-transaction';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { confirmDetected } from '@/features/auto-capture/api/confirm-detected';
import { TransactionFormSheet } from '@/features/ledger/components/transaction-form-sheet';

export type DetectedEditSheetProps = {
  bookId: string;
  currency: string;
  item: DetectedItem;
  onDismiss: () => void;
};

export function DetectedEditSheet({ bookId, currency, item, onDismiss }: DetectedEditSheetProps) {
  const { t } = useTranslation();
  const create = React.useCallback((id: string, input: CreateTransactionInput) => confirmDetected(id, item.id, input), [item.id]);

  return (
    <TransactionFormSheet
      testID="detected-edit-sheet"
      bookId={bookId}
      currency={currency}
      title={t('autoCapture.inbox.editTitle')}
      initial={{
        type: item.kind ?? 'expense',
        amount: item.amount === null ? '' : String(item.amount),
        title: item.title ?? '',
        category: item.category ?? '',
        date: item.dateIso ?? item.receivedAt,
      }}
      create={create}
      onDismiss={onDismiss}
    />
  );
}
