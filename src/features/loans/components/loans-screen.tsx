import type { DebtStatusFilter } from '@/features/loans/schemas/debt-schema';
import type { LoanSheet } from '@/features/loans/types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { EmptyState } from '@/components/ui';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { AddTransactionButton } from '@/features/ledger/components/add-transaction-button';
import { useDebts } from '@/features/loans/api/use-debts';
import { LoanList } from '@/features/loans/components/loan-list';
import { LoanSheets } from '@/features/loans/components/loan-sheets';
import { LoanStatusFilter } from '@/features/loans/components/loan-status-filter';
import { LoansTotals } from '@/features/loans/components/loans-totals';
import { useLoanActions } from '@/features/loans/hooks/use-loan-actions';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export function LoansScreen() {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const activeBook = useActiveBook();
  const bookId = activeBook.activeBookId;
  const currency = activeBook.activeBook?.currency ?? 'BDT';
  const [status, setStatus] = React.useState<DebtStatusFilter>('open');
  const [sheet, setSheet] = React.useState<LoanSheet | null>(null);
  const query = useDebts(bookId, status);
  const actions = useLoanActions(setSheet);
  const totals = query.data?.pages[0]?.totals;

  if (activeBook.isError) {
    return (
      <EmptyState
        testID="loans-book-error"
        variant="error"
        title={t('loans.error')}
        actionLabel={t('loans.retry')}
        onAction={() => activeBook.refetch()}
      />
    );
  }

  return (
    <View testID="loans-screen" className="flex-1 bg-paper-100">
      <LoansTotals totals={totals} currency={currency} locale={locale} />
      <LoanStatusFilter value={status} onChange={setStatus} />
      <View className="flex-1">
        {bookId
          ? (
              <LoanList
                key={`${bookId}-${status}`}
                bookId={bookId}
                status={status}
                query={query}
                locale={locale}
                {...actions}
              />
            )
          : null}
      </View>
      {bookId ? <AddTransactionButton testID="loans-add" label={t('loans.actions.add')} onPress={actions.onAdd} /> : null}
      {bookId && sheet ? <LoanSheets bookId={bookId} sheet={sheet} currency={currency} onDismiss={() => setSheet(null)} /> : null}
    </View>
  );
}
