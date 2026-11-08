import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import type { UserProfile } from '@/features/currency/types';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStatus } from '@/features/auth';
import {
  booksQueryKey,
  getUserProfile,
  updateProfile,
  userProfileQueryKey,
} from '@/features/currency/api/profile-api';

export function useUserProfile(options?: Partial<UseQueryOptions<UserProfile, Error>>) {
  const authStatus = useAuthStatus();

  return useQuery({
    queryKey: userProfileQueryKey,
    queryFn: getUserProfile,
    enabled: authStatus === 'signedIn',
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useUpdateDefaultCurrency(
  options?: Partial<UseMutationOptions<UserProfile, Error, string>>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (currency: string) => updateProfile({ currency }),
    ...options,
    onSuccess: async (...args) => {
      queryClient.setQueryData(userProfileQueryKey, args[0]);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userProfileQueryKey }),
        queryClient.invalidateQueries({ queryKey: booksQueryKey }),
      ]);

      await Promise.all([
        queryClient.refetchQueries({ queryKey: userProfileQueryKey }),
        queryClient.refetchQueries({ queryKey: booksQueryKey }),
      ]);

      if (options?.onSuccess) {
        await options.onSuccess(...args);
      }
    },
  });
}
