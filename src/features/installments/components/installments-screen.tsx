import type { InstallmentStatusFilter as StatusFilter } from '@/features/installments/schemas/installment-schema';
import type { InstallmentSheet } from '@/features/installments/types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { EmptyState } from '@/components/ui';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useInstallments } from '@/features/installments/api/use-installments';
import { InstallmentList } from '@/features/installments/components/installment-list';
import { InstallmentSheets } from '@/features/installments/components/installment-sheets';
import { InstallmentStatusFilter } from '@/features/installments/components/installment-status-filter';
import { InstallmentsRemaining } from '@/features/installments/components/installments-remaining';
import { useInstallmentActions } from '@/features/installments/hooks/use-installment-actions';
import { sumRemaining } from '@/features/installments/utils/sum-remaining';
import { AddTransactionButton } from '@/features/ledger/components/add-transaction-button';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export function InstallmentsScreen() {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const activeBook = useActiveBook();
  const bookId = activeBook.activeBookId;
  const currency = activeBook.activeBook?.currency ?? 'BDT';
  const [status, setStatus] = React.useState<StatusFilter>('active');
  const [sheet, setSheet] = React.useState<InstallmentSheet | null>(null);
  const query = useInstallments(bookId, status);
  const active = useInstallments(bookId, 'active');
  const actions = useInstallmentActions(setSheet);

  if (activeBook.isError) {
    return (
      <EmptyState
        testID="installments-book-error"
        variant="error"
        title={t('installments.error')}
        actionLabel={t('installments.retry')}
        onAction={() => activeBook.refetch()}
      />
    );
  }

  return (
    <View testID="installments-screen" className="flex-1 bg-paper-100">
      <InstallmentsRemaining remaining={active.data && sumRemaining(active.data)} currency={currency} locale={locale} />
      <InstallmentStatusFilter value={status} onChange={setStatus} />
      <View className="flex-1">
        {bookId
          ? <InstallmentList key={`${bookId}-${status}`} bookId={bookId} status={status} query={query} locale={locale} {...actions} />
          : null}
      </View>
      {bookId ? <AddTransactionButton testID="installments-add" label={t('installments.actions.add')} onPress={actions.onAdd} /> : null}
      {bookId && sheet ? <InstallmentSheets bookId={bookId} sheet={sheet} currency={currency} onDismiss={() => setSheet(null)} /> : null}
    </View>
  );
}
