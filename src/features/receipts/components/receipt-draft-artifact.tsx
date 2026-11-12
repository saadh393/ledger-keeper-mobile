import type { ArtifactComponentProps } from '@/features/assistant/components/artifacts/artifact-registry';
import type { ReceiptDraftArtifactData } from '@/features/receipts/schemas/receipt-artifact-schemas';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useDraftAction } from '@/features/assistant/api/use-draft-action';
import { DraftDiscardedCard } from '@/features/assistant/components/artifacts/draft-discarded-card';
import { ReceiptDraftEditor } from '@/features/receipts/components/receipt-draft-editor';
import { ReceiptSavedCard } from '@/features/receipts/components/receipt-saved-card';
import { receiptDraftArtifactSchema } from '@/features/receipts/schemas/receipt-artifact-schemas';
import { toReceiptDraftValues } from '@/features/receipts/utils/receipt-draft-values';

export function ReceiptDraftArtifact({ data, currency, artifactId }: ArtifactComponentProps<ReceiptDraftArtifactData>) {
  const { t } = useTranslation();
  const [values, setValues] = React.useState(() => toReceiptDraftValues(data));
  const action = useDraftAction(artifactId, data, receiptDraftArtifactSchema);

  if (data.status === 'saved')
    return <ReceiptSavedCard data={data} currency={currency} />;
  if (data.status === 'dismissed')
    return <DraftDiscardedCard title={values.merchant.trim() || t('receipts.image.label')} action={action} />;
  return <ReceiptDraftEditor data={data} values={values} onChange={setValues} currency={currency} action={action} />;
}
