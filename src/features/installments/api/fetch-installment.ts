import type { Installment } from '@/features/installments/schemas/installment-schema';
import { installmentSchema } from '@/features/installments/schemas/installment-schema';
import { apiClient, parse } from '@/lib/api';

export async function fetchInstallment(bookId: string, installmentId: string): Promise<Installment> {
  const response = await apiClient.get(`/books/${bookId}/installments/${installmentId}`);
  return parse(installmentSchema, response.data);
}
