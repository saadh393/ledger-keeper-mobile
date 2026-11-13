import type { Debt } from '@/features/loans/schemas/debt-schema';
import type { LoanActions } from '@/features/loans/types';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { LoanRowDetails } from '@/features/loans/components/loan-row-details';
import { LoanSummary } from '@/features/loans/components/loan-summary';
import { describeDebt } from '@/features/loans/utils/describe-debt';

export type LoanRowProps = LoanActions & {
  bookId: string;
  debt: Debt;
  locale: Language;
  expanded: boolean;
  onToggle: (debt: Debt) => void;
};

export const LoanRow = React.memo(({ bookId, debt, locale, expanded, onToggle, ...actions }: LoanRowProps) => {
  const { t } = useTranslation();

  return (
    <View>
      <Pressable
        testID={`loan-row-${debt.id}`}
        className="px-4 active:bg-paper-200"
        accessibilityRole="button"
        accessibilityLabel={describeDebt(debt, locale, t)}
        accessibilityHint={t(expanded ? 'ledger.actions.collapse' : 'ledger.actions.expand')}
        accessibilityState={{ expanded }}
        onPress={() => onToggle(debt)}
      >
        <LoanSummary debt={debt} locale={locale} />
      </Pressable>
      {expanded ? <LoanRowDetails bookId={bookId} debt={debt} locale={locale} {...actions} /> : null}
    </View>
  );
});
