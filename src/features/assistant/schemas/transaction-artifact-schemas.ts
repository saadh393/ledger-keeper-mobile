import { z } from 'zod';
import { ledgerKindSchema, transactionRowSchema } from '@/features/ledger/schemas/book-table-schema';

export const artifactTransactionSchema = transactionRowSchema.extend({
  subtitle: z.string().default(''),
  note: z.string().nullable().default(null),
  original: transactionRowSchema.shape.original.default(null),
  merchant: z.string().nullable().default(null),
  items: transactionRowSchema.shape.items.default([]),
  deleted: z.boolean().default(false),
});

export const transactionBatchArtifactSchema = z.object({
  rows: z.array(artifactTransactionSchema),
  net: z.number(),
});

export const transactionListArtifactSchema = z.object({
  rows: z.array(artifactTransactionSchema),
});

export const summaryArtifactSchema = z.object({
  income: z.number(),
  expense: z.number(),
  net: z.number(),
  incomeDelta: z.number(),
  expenseDelta: z.number(),
  periodIso: z.string(),
  kind: ledgerKindSchema.nullish(),
  fromDate: z.string().nullish(),
  toDate: z.string().nullish(),
});

export const insightArtifactSchema = z.object({
  title: z.string(),
  body: z.string(),
  progress: z.number(),
  periodLabel: z.string(),
});

export const statusArtifactSchema = z.object({
  tone: z.enum(['positive', 'negative', 'error', 'info']),
  title: z.string(),
  body: z.string(),
});

export type ArtifactTransaction = z.infer<typeof artifactTransactionSchema>;
export type TransactionBatchArtifactData = z.infer<typeof transactionBatchArtifactSchema>;
export type TransactionListArtifactData = z.infer<typeof transactionListArtifactSchema>;
export type SummaryArtifactData = z.infer<typeof summaryArtifactSchema>;
export type InsightArtifactData = z.infer<typeof insightArtifactSchema>;
export type StatusArtifactData = z.infer<typeof statusArtifactSchema>;
