import type { Installment, InstallmentStatusFilter } from '@/features/installments/schemas/installment-schema';
import { installmentListSchema } from '@/features/installments/schemas/installment-schema';
import { apiClient, parse } from '@/lib/api';

export async function fetchInstallments(bookId: string, status: InstallmentStatusFilter): Promise<Installment[]> {
  const response = await apiClient.get(`/books/${bookId}/installments`, { params: { status } });
  return parse(installmentListSchema, response.data).items;
}
