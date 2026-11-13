import type { CreateTransactionInput } from '@/features/ledger/api/create-transaction';
import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import { transactionRowSchema } from '@/features/ledger/schemas/book-table-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export async function confirmDetected(bookId: string, itemId: string, input?: CreateTransactionInput): Promise<TransactionRow> {
  const response = await apiClient.post(`/books/${bookId}/captures/${itemId}/confirm`, input ?? {});
  return parse(transactionRowSchema, response.data);
}
