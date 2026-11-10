import type { CreateTransactionInput } from '@/features/ledger/api/create-transaction';
import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import { transactionRowSchema } from '@/features/ledger/schemas/book-table-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export type UpdateTransactionInput = Partial<CreateTransactionInput>;

export async function updateTransaction(
  bookId: string,
  transactionId: string,
  patch: UpdateTransactionInput,
): Promise<TransactionRow> {
  const response = await apiClient.patch(`/books/${bookId}/transactions/${transactionId}`, patch);
  return parse(transactionRowSchema, response.data);
}
