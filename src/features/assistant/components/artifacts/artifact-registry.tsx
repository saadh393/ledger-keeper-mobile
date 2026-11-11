import type { z } from 'zod';
import * as React from 'react';
import { CategoryArtifact } from '@/features/assistant/components/artifacts/category-artifact';
import { ClarificationArtifact } from '@/features/assistant/components/artifacts/clarification-artifact';
import { DebtArtifact } from '@/features/assistant/components/artifacts/debt-artifact';
import { DebtListArtifact } from '@/features/assistant/components/artifacts/debt-list-artifact';
import { InsightArtifact } from '@/features/assistant/components/artifacts/insight-artifact';
import { InstallmentArtifact } from '@/features/assistant/components/artifacts/installment-artifact';
import { InstallmentListArtifact } from '@/features/assistant/components/artifacts/installment-list-artifact';
import { StatusArtifact } from '@/features/assistant/components/artifacts/status-artifact';
import { SummaryArtifact } from '@/features/assistant/components/artifacts/summary-artifact';
import { TransactionArtifact } from '@/features/assistant/components/artifacts/transaction-artifact';
import { TransactionBatchArtifact } from '@/features/assistant/components/artifacts/transaction-batch-artifact';
import { TransactionDraftArtifact } from '@/features/assistant/components/artifacts/transaction-draft-artifact';
import { TransactionListArtifact } from '@/features/assistant/components/artifacts/transaction-list-artifact';
import { TrendArtifact } from '@/features/assistant/components/artifacts/trend-artifact';
import { categoryArtifactSchema, trendArtifactSchema } from '@/features/assistant/schemas/chart-artifact-schemas';
import { clarificationArtifactSchema, transactionDraftArtifactSchema } from '@/features/assistant/schemas/draft-artifact-schemas';
import { debtListArtifactSchema, installmentListArtifactSchema } from '@/features/assistant/schemas/loan-artifact-schemas';
import {
  artifactTransactionSchema,
  insightArtifactSchema,
  statusArtifactSchema,
  summaryArtifactSchema,
  transactionBatchArtifactSchema,
  transactionListArtifactSchema,
} from '@/features/assistant/schemas/transaction-artifact-schemas';
import { installmentSchema } from '@/features/installments/schemas/installment-schema';
import { debtSchema } from '@/features/loans/schemas/debt-schema';

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
  'category': entry(categoryArtifactSchema, CategoryArtifact),
  'trend': entry(trendArtifactSchema, TrendArtifact),
  'insight': entry(insightArtifactSchema, InsightArtifact),
  'status': entry(statusArtifactSchema, StatusArtifact),
  'debt': entry(debtSchema, DebtArtifact),
  'debt-list': entry(debtListArtifactSchema, DebtListArtifact),
  'installment': entry(installmentSchema, InstallmentArtifact),
  'installment-list': entry(installmentListArtifactSchema, InstallmentListArtifact),
};
