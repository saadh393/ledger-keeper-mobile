import type { InstallmentStatusFilter } from '@/features/installments/schemas/installment-schema';
import { booksKeys } from '@/features/books/utils/query-keys';

export const installmentsKeys = {
  all: (bookId: string) => booksKeys.installments(bookId),
  list: (bookId: string, status: InstallmentStatusFilter) => booksKeys.scoped(bookId, 'installments', 'list', status),
  detail: (bookId: string, installmentId: string) => booksKeys.scoped(bookId, 'installments', 'detail', installmentId),
};
