import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { useAuthStore } from '@/features/auth';
import { useBooks } from '@/features/books/api/use-books';
import { apiClient } from '@/lib/api/client';

describe('useBooks', () => {
  let mock: MockAdapter;
  let queryClient: QueryClient;

  const mockBooks = [
    {
      id: 'book-1',
      name: 'Personal',
      currency: 'USD',
      isDefault: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'book-2',
      name: 'Business',
      currency: 'EUR',
      isDefault: false,
      createdAt: '2026-02-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    useAuthStore.setState({ status: 'signedIn' });
  });

  afterEach(() => {
    mock.restore();
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('fetches and returns the list of books when signed in', async () => {
    mock.onGet('/books').reply(200, { items: mockBooks });

    const { result } = renderHook(() => useBooks(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.books).toEqual([]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.books).toEqual(mockBooks);
    expect(result.current.data).toEqual(mockBooks);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('remains idle and does not fetch when signedOut', async () => {
    useAuthStore.setState({ status: 'signedOut' });
    mock.onGet('/books').reply(200, { items: mockBooks });

    const { result } = renderHook(() => useBooks(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isPending).toBe(true);
    expect(result.current.books).toEqual([]);
    expect(mock.history.get).toHaveLength(0);
  });

  it('exposes error state when API request fails', async () => {
    mock.onGet('/books').reply(500, { message: 'Internal Server Error' });

    const { result } = renderHook(() => useBooks(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.books).toEqual([]);
  });

  it('exposes error state when API response is invalid schema', async () => {
    mock.onGet('/books').reply(200, { items: [{ id: 'bad' }] });

    const { result } = renderHook(() => useBooks(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
