import type { DebtStatusFilter } from '@/features/loans/schemas/debt-schema';
import { booksKeys } from '@/features/books/utils/query-keys';

export const debtsKeys = {
  all: (bookId: string) => booksKeys.scoped(bookId, 'debts'),
  list: (bookId: string, status: DebtStatusFilter) => booksKeys.scoped(bookId, 'debts', 'list', status),
  detail: (bookId: string, debtId: string) => booksKeys.scoped(bookId, 'debts', 'detail', debtId),
};
