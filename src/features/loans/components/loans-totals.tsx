import type { DebtTotals } from '@/features/loans/schemas/debt-schema';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StatTile } from '@/components/ui/stat-tile';
import { formatCurrency } from '@/lib/format/currency';

export type LoansTotalsProps = {
  totals: DebtTotals | undefined;
  currency: string;
  locale: Language;
};

export function LoansTotals({ totals, currency, locale }: LoansTotalsProps) {
  const { t } = useTranslation();
  const money = (value: number | undefined) => (value === undefined ? null : formatCurrency(value, locale, currency));

  return (
    <View testID="loans-totals" className="flex-row gap-2 px-4 pt-2">
      <StatTile testID="loans-total-lent" label={t('loans.totals.lent')} value={money(totals?.lent)} valueClassName="text-forest-500" />
      <StatTile testID="loans-total-borrowed" label={t('loans.totals.borrowed')} value={money(totals?.borrowed)} />
    </View>
  );
}
