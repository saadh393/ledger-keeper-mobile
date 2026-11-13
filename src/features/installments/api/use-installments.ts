import type { InstallmentStatusFilter } from '@/features/installments/schemas/installment-schema';
import { useQuery } from '@tanstack/react-query';
import { fetchInstallments } from '@/features/installments/api/fetch-installments';
import { installmentsKeys } from '@/features/installments/utils/installments-keys';

export function useInstallments(bookId: string | null, status: InstallmentStatusFilter) {
  return useQuery({
    queryKey: installmentsKeys.list(bookId ?? '', status),
    queryFn: () => fetchInstallments(bookId!, status),
    enabled: Boolean(bookId),
  });
}
