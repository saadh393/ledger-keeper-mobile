import type { Installment } from '@/features/installments/schemas/installment-schema';
import type { InstallmentInput } from '@/features/installments/utils/build-installment-input';
import { installmentSchema } from '@/features/installments/schemas/installment-schema';
import { apiClient, parse } from '@/lib/api';

export type InstallmentPaymentInput = {
  amount: number;
  dateIso: string;
};

export async function createInstallment(bookId: string, input: InstallmentInput): Promise<Installment> {
  const response = await apiClient.post(`/books/${bookId}/installments`, input);
  return parse(installmentSchema, response.data);
}

export async function updateInstallment(bookId: string, installmentId: string, patch: Partial<InstallmentInput>): Promise<Installment> {
  const response = await apiClient.patch(`/books/${bookId}/installments/${installmentId}`, patch);
  return parse(installmentSchema, response.data);
}

export async function deleteInstallment(bookId: string, installmentId: string): Promise<void> {
  await apiClient.delete(`/books/${bookId}/installments/${installmentId}`);
}

export async function payInstallment(bookId: string, installmentId: string, input: InstallmentPaymentInput): Promise<void> {
  await apiClient.post(`/books/${bookId}/installments/${installmentId}/payments`, input);
}
