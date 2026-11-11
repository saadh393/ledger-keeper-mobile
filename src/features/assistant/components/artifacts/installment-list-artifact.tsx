import type { InstallmentListArtifactData } from '@/features/assistant/schemas/loan-artifact-schemas';
import { CalendarClock } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { ArtifactLink } from '@/features/assistant/components/artifacts/artifact-link';
import { ShowAllButton } from '@/features/assistant/components/artifacts/show-all-button';
import { getVisibleRows } from '@/features/assistant/utils/get-visible-rows';
import { InstallmentSummary } from '@/features/installments/components/installment-summary';
import { describeInstallment } from '@/features/installments/utils/describe-installment';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type InstallmentListArtifactProps = {
  data: InstallmentListArtifactData;
};

export function InstallmentListArtifact({ data }: InstallmentListArtifactProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const [showAll, setShowAll] = React.useState(false);
  const summary = [t('installments.card.listTitle'), ...data.rows.map(row => describeInstallment(row, locale, t))].join('. ');

  return (
    <ArtifactCard
      testID="installment-list-artifact"
      label={t('installments.card.listTitle')}
      icon={CalendarClock}
      summary={summary}
      footer={(
        <>
          <ShowAllButton testID="installment-list-artifact-show-all" count={data.rows.length} showAll={showAll} onPress={() => setShowAll(true)} />
          <ArtifactLink testID="installment-list-artifact-view" label={t('installments.card.viewInInstallments')} href="/installments" />
        </>
      )}
    >
      {data.rows.length
        ? getVisibleRows(data.rows, showAll).map(row => (
            <View key={row.id} testID="installment-list-artifact-row" className="border-b border-border last:border-b-0">
              <InstallmentSummary installment={row} locale={locale} />
            </View>
          ))
        : <Text testID="installment-list-artifact-empty" className="py-2 text-meta text-ink-500">{t('installments.card.empty')}</Text>}
    </ArtifactCard>
  );
}
