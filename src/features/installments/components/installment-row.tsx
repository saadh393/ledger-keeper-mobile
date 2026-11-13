import type { Installment } from '@/features/installments/schemas/installment-schema';
import type { InstallmentActions } from '@/features/installments/types';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { InstallmentRowDetails } from '@/features/installments/components/installment-row-details';
import { InstallmentSummary } from '@/features/installments/components/installment-summary';
import { describeInstallment } from '@/features/installments/utils/describe-installment';

export type InstallmentRowProps = InstallmentActions & {
  bookId: string;
  installment: Installment;
  locale: Language;
  expanded: boolean;
  onToggle: (installment: Installment) => void;
};

export const InstallmentRow = React.memo(({ bookId, installment, locale, expanded, onToggle, ...actions }: InstallmentRowProps) => {
  const { t } = useTranslation();

  return (
    <View>
      <Pressable
        testID={`installment-row-${installment.id}`}
        className="px-4 active:bg-paper-200"
        accessibilityRole="button"
        accessibilityLabel={describeInstallment(installment, locale, t)}
        accessibilityHint={t(expanded ? 'ledger.actions.collapse' : 'ledger.actions.expand')}
        accessibilityState={{ expanded }}
        onPress={() => onToggle(installment)}
      >
        <InstallmentSummary installment={installment} locale={locale} />
      </Pressable>
      {expanded ? <InstallmentRowDetails bookId={bookId} installment={installment} locale={locale} {...actions} /> : null}
    </View>
  );
});
