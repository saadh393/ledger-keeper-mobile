import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import { transactionRowSchema } from '@/features/ledger/schemas/book-table-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export type CreateTransactionInput = {
  kind: 'income' | 'expense';
  title: string;
  category: string;
  amount: number;
  dateIso: string;
  note?: string | null;
};

export async function createTransaction(
  bookId: string,
  input: CreateTransactionInput,
): Promise<TransactionRow> {
  const response = await apiClient.post(`/books/${bookId}/transactions`, input);
  return parse(transactionRowSchema, response.data);
}
