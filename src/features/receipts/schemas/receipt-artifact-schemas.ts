import { z } from 'zod';
import { transactionRowSchema } from '@/features/ledger/schemas/book-table-schema';

export const receiptImageArtifactSchema = z.object({
  byteSize: z.number(),
  image: z.object({
    width: z.number().nullable(),
    height: z.number().nullable(),
    url: z.string(),
    thumbnailUrl: z.string(),
  }).nullable().default(null),
  previewUri: z.string().optional(),
});

export const receiptDraftItemSchema = z.object({
  title: z.string(),
  category: z.string().nullable(),
  amount: z.number().nullable(),
  quantity: z.number().nullable().default(null),
  note: z.string().nullable().default(null),
});

export const receiptDraftArtifactSchema = z.object({
  draftId: z.string(),
  merchant: z.string().nullable(),
  dateIso: z.string(),
  total: z.number(),
  adjustment: z.number().default(0),
  items: z.array(receiptDraftItemSchema),
  original: transactionRowSchema.shape.original.default(null),
  categories: z.array(z.string()).default([]),
  status: z.enum(['draft', 'saved', 'dismissed']),
  savedId: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  documentType: z.enum(['purchase', 'installment_payment']).optional(),
  paidInInstallments: z.boolean().optional(),
  plans: z.array(z.string()).default([]),
  plan: z.string().nullable().default(null),
  duplicate: z.object({ title: z.string(), dateIso: z.string(), amount: z.number() }).nullable().default(null),
  savedAs: z.enum(['expense', 'installment_plan', 'installment_payment']).optional(),
  deleted: z.boolean().default(false),
});

export type ReceiptImageArtifactData = z.infer<typeof receiptImageArtifactSchema>;
export type ReceiptDraftArtifactData = z.infer<typeof receiptDraftArtifactSchema>;
