import type { TransactionDraftArtifactData } from '@/features/assistant/schemas/draft-artifact-schemas';
import * as React from 'react';
import { useDraftAction } from '@/features/assistant/api/use-draft-action';
import { DraftDiscardedCard } from '@/features/assistant/components/artifacts/draft-discarded-card';
import { DraftEditorCard } from '@/features/assistant/components/artifacts/draft-editor-card';
import { DraftSavedCard } from '@/features/assistant/components/artifacts/draft-saved-card';
import { toDraftValues } from '@/features/assistant/utils/draft-confirm-input';

export type TransactionDraftArtifactProps = {
  data: TransactionDraftArtifactData;
  currency: string;
  artifactId: string;
};

export function TransactionDraftArtifact({ data, currency, artifactId }: TransactionDraftArtifactProps) {
  const [values, setValues] = React.useState(() => toDraftValues(data));
  const action = useDraftAction(artifactId, data);

  if (data.status === 'saved')
    return <DraftSavedCard data={data} currency={currency} />;
  if (data.status === 'dismissed')
    return <DraftDiscardedCard title={values.title} action={action} />;
  return <DraftEditorCard data={data} values={values} onChange={setValues} currency={currency} action={action} />;
}
