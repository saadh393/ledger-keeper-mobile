import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StatTile } from '@/components/ui/stat-tile';
import { formatCurrency } from '@/lib/format/currency';

export type InstallmentsRemainingProps = {
  remaining: number | undefined;
  currency: string;
  locale: Language;
};

export function InstallmentsRemaining({ remaining, currency, locale }: InstallmentsRemainingProps) {
  const { t } = useTranslation();

  return (
    <View testID="installments-remaining" className="flex-row px-4 pt-2">
      <StatTile testID="installments-remaining-total" label={t('installments.remaining')} value={remaining === undefined ? null : formatCurrency(remaining, locale, currency)} />
    </View>
  );
}
