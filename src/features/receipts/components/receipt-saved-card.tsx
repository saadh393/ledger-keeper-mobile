import type { ReceiptDraftArtifactData } from '@/features/receipts/schemas/receipt-artifact-schemas';
import { CalendarClock, Check } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { ArtifactTransactionRow } from '@/features/assistant/components/artifacts/artifact-transaction-row';
import { toReceiptTransaction } from '@/features/receipts/utils/to-receipt-transaction';

export type ReceiptSavedCardProps = {
  data: ReceiptDraftArtifactData;
  currency: string;
};

export function ReceiptSavedCard({ data, currency }: ReceiptSavedCardProps) {
  const { t } = useTranslation();

  if (data.savedAs === 'installment_plan') {
    return (
      <ArtifactCard testID="receipt-plan-created" label={t('receipts.draft.planCreated')} icon={CalendarClock} tone="info">
        <View className="py-2">
          <Text className="text-row-title text-ink-900">{data.title ?? data.merchant ?? t('receipts.image.label')}</Text>
          <Text className="mt-0.5 text-meta text-ink-500">{t('receipts.draft.planCreatedBody')}</Text>
        </View>
      </ArtifactCard>
    );
  }

  const row = toReceiptTransaction(data, t('receipts.draft.adjustment'));
  const label = t(data.savedAs === 'installment_payment' ? 'receipts.draft.paymentSaved' : 'assistant.draft.saved');

  return (
    <ArtifactCard testID="receipt-saved" label={label} icon={Check} tone={row.deleted ? 'info' : 'expense'}>
      <View className="-mx-4 pb-1">
        <ArtifactTransactionRow row={row} currency={currency} />
      </View>
    </ArtifactCard>
  );
}
