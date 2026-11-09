import { z } from 'zod';

export const ledgerKindSchema = z.enum(['income', 'expense']);

export const tableStatSchema = z.object({
  label: z.string(),
  value: z.number(),
  delta: z.string(),
  kind: ledgerKindSchema.optional(),
});

export const transactionItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  category: z.string().nullable(),
  amount: z.number(),
  quantity: z.number().nullable(),
  note: z.string().nullable(),
});

export const transactionRowSchema = z.object({
  id: z.string(),
  kind: ledgerKindSchema,
  name: z.string(),
  subtitle: z.string(),
  category: z.string(),
  dateIso: z.string(),
  amount: z.number(),
  note: z.string().nullable(),
  original: z.object({ amount: z.number(), currency: z.string(), rate: z.number() }).nullable(),
  merchant: z.string().nullable(),
  items: z.array(transactionItemSchema),
  account: z.string().optional(),
});

export const bookTableSchema = z.object({
  stats: z.array(tableStatSchema),
  rows: z.array(transactionRowSchema),
});

export type TableStat = z.infer<typeof tableStatSchema>;
export type TransactionRow = z.infer<typeof transactionRowSchema>;
export type BookTable = z.infer<typeof bookTableSchema>;
