import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { booksQueryKey } from '@/features/books/utils/query-keys';

export function useRefetchBooks() {
  const queryClient = useQueryClient();

  return React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: booksQueryKey, exact: true });
  }, [queryClient]);
}
