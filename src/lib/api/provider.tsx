/* eslint-disable react-refresh/only-export-components */
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import {
  MutationCache,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import * as React from 'react';

import { ApiError } from '@/lib/api/errors';
import { setupNetworkAndFocus } from '@/lib/api/setup-network';

// Wire onlineManager to NetInfo and focusManager to AppState
setupNetworkAndFocus();

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        networkMode: 'always',
      },
    },
    mutationCache: new MutationCache({
      onMutate: () => {
        if (!onlineManager.isOnline()) {
          throw new ApiError({
            kind: 'offline',
            message: 'Network error: could not connect to server',
          });
        }
      },
    }),
  });
}

export const queryClient = createQueryClient();

export function APIProvider({ children }: { children: React.ReactNode }) {
  useReactQueryDevTools(queryClient);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
