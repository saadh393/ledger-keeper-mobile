import { useQuery } from '@tanstack/react-query';
import { fetchInstallment } from '@/features/installments/api/fetch-installment';
import { installmentsKeys } from '@/features/installments/utils/installments-keys';

export function useInstallment(bookId: string, installmentId: string) {
  return useQuery({
    queryKey: installmentsKeys.detail(bookId, installmentId),
    queryFn: () => fetchInstallment(bookId, installmentId),
  });
}
