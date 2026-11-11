import type { z } from 'zod';
import * as React from 'react';
import { ClarificationArtifact } from '@/features/assistant/components/artifacts/clarification-artifact';
import { InsightArtifact } from '@/features/assistant/components/artifacts/insight-artifact';
import { StatusArtifact } from '@/features/assistant/components/artifacts/status-artifact';
import { SummaryArtifact } from '@/features/assistant/components/artifacts/summary-artifact';
import { TransactionArtifact } from '@/features/assistant/components/artifacts/transaction-artifact';
import { TransactionBatchArtifact } from '@/features/assistant/components/artifacts/transaction-batch-artifact';
import { TransactionDraftArtifact } from '@/features/assistant/components/artifacts/transaction-draft-artifact';
import { TransactionListArtifact } from '@/features/assistant/components/artifacts/transaction-list-artifact';
import { clarificationArtifactSchema, transactionDraftArtifactSchema } from '@/features/assistant/schemas/draft-artifact-schemas';
import {
  artifactTransactionSchema,
  insightArtifactSchema,
  statusArtifactSchema,
  summaryArtifactSchema,
  transactionBatchArtifactSchema,
  transactionListArtifactSchema,
} from '@/features/assistant/schemas/transaction-artifact-schemas';

export type ArtifactComponentProps<T> = {
  data: T;
  currency: string;
  artifactId: string;
};

export type ArtifactEntry = (data: unknown, currency: string, artifactId: string) => React.ReactNode;

function entry<T>(schema: z.ZodType<T>, Component: React.ComponentType<ArtifactComponentProps<T>>): ArtifactEntry {
  return (data, currency, artifactId) => {
    const parsed = schema.safeParse(data);
    return parsed.success ? <Component data={parsed.data} currency={currency} artifactId={artifactId} /> : null;
  };
}

export const artifactRegistry: Partial<Record<string, ArtifactEntry>> = {
  'transaction': entry(artifactTransactionSchema, TransactionArtifact),
  'transaction-batch': entry(transactionBatchArtifactSchema, TransactionBatchArtifact),
  'transaction-draft': entry(transactionDraftArtifactSchema, TransactionDraftArtifact),
  'clarification': entry(clarificationArtifactSchema, ClarificationArtifact),
  'transaction-list': entry(transactionListArtifactSchema, TransactionListArtifact),
  'summary': entry(summaryArtifactSchema, SummaryArtifact),
  'insight': entry(insightArtifactSchema, InsightArtifact),
  'status': entry(statusArtifactSchema, StatusArtifact),
};
