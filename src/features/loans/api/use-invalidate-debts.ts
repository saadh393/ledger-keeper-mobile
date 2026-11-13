import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { debtsKeys } from '@/features/loans/utils/debts-keys';

export function useInvalidateDebts(bookId: string) {
  const queryClient = useQueryClient();
  return React.useCallback(() => queryClient.invalidateQueries({ queryKey: debtsKeys.all(bookId) }), [queryClient, bookId]);
}
