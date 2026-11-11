import { z } from 'zod';
import { ledgerKindSchema, transactionRowSchema } from '@/features/ledger/schemas/book-table-schema';

export const transactionDraftArtifactSchema = z.object({
  draftId: z.string(),
  kind: ledgerKindSchema.nullable(),
  title: z.string().nullable(),
  category: z.string().nullable(),
  amount: z.number().nullable(),
  dateIso: z.string(),
  note: z.string().nullable().default(null),
  original: transactionRowSchema.shape.original.default(null),
  categories: z.array(z.string()).default([]),
  status: z.enum(['draft', 'saved', 'dismissed']),
  savedId: z.string().optional(),
  deleted: z.boolean().default(false),
});

const clarificationOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const clarificationControlSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('amount'), suggestions: z.array(z.number()).default([]), placeholder: z.string().optional() }),
  z.object({ type: z.literal('text'), suggestions: z.array(clarificationOptionSchema).default([]), placeholder: z.string().optional() }),
  z.object({ type: z.literal('toggle'), options: z.array(clarificationOptionSchema) }),
  z.object({ type: z.literal('select'), options: z.array(clarificationOptionSchema), placeholder: z.string().optional() }),
]);

export const clarificationArtifactSchema = z.object({
  question: z.string(),
  summary: z.string().default(''),
  control: clarificationControlSchema,
  state: z.discriminatedUnion('status', [
    z.object({ status: z.literal('pending') }),
    z.object({ status: z.literal('answered'), value: z.string() }),
  ]).default({ status: 'pending' }),
});

export type TransactionDraftArtifactData = z.infer<typeof transactionDraftArtifactSchema>;
export type ClarificationControl = z.infer<typeof clarificationControlSchema>;
export type ClarificationArtifactData = z.infer<typeof clarificationArtifactSchema>;
