import type { Installment } from '@/features/installments/schemas/installment-schema';
import { CalendarClock } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { ArtifactLink } from '@/features/assistant/components/artifacts/artifact-link';
import { InstallmentSummary } from '@/features/installments/components/installment-summary';
import { describeInstallment } from '@/features/installments/utils/describe-installment';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type InstallmentArtifactProps = {
  data: Installment;
};

export function InstallmentArtifact({ data }: InstallmentArtifactProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);

  return (
    <ArtifactCard
      testID="installment-artifact"
      label={t('installments.card.title')}
      icon={CalendarClock}
      tone="expense"
      summary={describeInstallment(data, locale, t)}
      footer={<ArtifactLink testID="installment-artifact-view" label={t('installments.card.viewInInstallments')} href="/installments" />}
    >
      <InstallmentSummary installment={data} locale={locale} />
    </ArtifactCard>
  );
}
