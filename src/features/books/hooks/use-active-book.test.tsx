/* eslint-disable max-lines-per-function */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { useAuthStore } from '@/features/auth';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import {
  ACTIVE_BOOK_STORAGE_KEY,
  useActiveBookStore,
} from '@/features/books/store/use-active-book-store';
import { apiClient } from '@/lib/api/client';
import { storage } from '@/lib/storage';

const setStorageMock = jest.mocked(storage.set);

describe('useActiveBook', () => {
  let mock: MockAdapter;
  let queryClient: QueryClient;

  const defaultBook = {
    id: 'book-default',
    name: 'Personal',
    currency: 'USD',
    isDefault: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const businessBook = {
    id: 'book-business',
    name: 'Business Ledger',
    currency: 'EUR',
    isDefault: false,
    createdAt: '2026-01-02T00:00:00.000Z',
  };

  const booksList = [defaultBook, businessBook];

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    setStorageMock.mockClear();
    useActiveBookStore.setState({ activeBookId: null });
    useAuthStore.setState({ status: 'signedIn' });
  });

  afterEach(() => {
    mock.restore();
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('exposes loading state while books are being fetched', async () => {
    mock.onGet('/books').reply(200, { items: booksList });

    const { result } = renderHook(() => useActiveBook(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.activeBook).toBeNull();
    expect(result.current.activeBookId).toBeNull();
    expect(result.current.isEmpty).toBe(false);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('on first use (no saved id), returns default book and saves its id to MMKV', async () => {
    mock.onGet('/books').reply(200, { items: booksList });

    const { result } = renderHook(() => useActiveBook(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.activeBook).toEqual(defaultBook);
    expect(result.current.activeBookId).toBe(defaultBook.id);
    expect(result.current.isEmpty).toBe(false);

    // Verify saved id is updated in store and MMKV
    await waitFor(() => {
      expect(useActiveBookStore.getState().activeBookId).toBe(defaultBook.id);
      expect(setStorageMock).toHaveBeenCalledWith(
        ACTIVE_BOOK_STORAGE_KEY,
        JSON.stringify({ state: { activeBookId: defaultBook.id }, version: 0 }),
      );
    });
  });

  it('returns saved book object when saved id is valid', async () => {
    useActiveBookStore.setState({ activeBookId: businessBook.id });
    mock.onGet('/books').reply(200, { items: booksList });

    const { result } = renderHook(() => useActiveBook(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.activeBook).toEqual(businessBook);
    expect(result.current.activeBookId).toBe(businessBook.id);
    expect(result.current.isEmpty).toBe(false);
  });

  it('falls back to default book and updates saved id if saved id is deleted/missing from list', async () => {
    useActiveBookStore.setState({ activeBookId: 'deleted-book-id' });
    mock.onGet('/books').reply(200, { items: booksList });

    const { result } = renderHook(() => useActiveBook(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.activeBook).toEqual(defaultBook);
    expect(result.current.activeBookId).toBe(defaultBook.id);

    // Verify store and MMKV are updated to the fallback id
    await waitFor(() => {
      expect(useActiveBookStore.getState().activeBookId).toBe(defaultBook.id);
    });
  });

  it('falls back to first book when list has no default book', async () => {
    const noDefaultBooks = [
      { ...defaultBook, isDefault: false, id: 'first-book' },
      { ...businessBook, isDefault: false, id: 'second-book' },
    ];
    mock.onGet('/books').reply(200, { items: noDefaultBooks });

    const { result } = renderHook(() => useActiveBook(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.activeBook).toEqual(noDefaultBooks[0]);
    expect(result.current.activeBookId).toBe('first-book');
    await waitFor(() => {
      expect(useActiveBookStore.getState().activeBookId).toBe('first-book');
    });
  });

  it('returns empty state when books list is empty', async () => {
    mock.onGet('/books').reply(200, { items: [] });

    const { result } = renderHook(() => useActiveBook(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.activeBook).toBeNull();
    expect(result.current.activeBookId).toBeNull();
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.books).toEqual([]);
  });

  it('changing active book updates every screen that uses useActiveBook() without a restart', async () => {
    mock.onGet('/books').reply(200, { items: booksList });

    // Render two instances of the hook to simulate two different screens
    const { result: view1 } = renderHook(() => useActiveBook(), { wrapper });
    const { result: view2 } = renderHook(() => useActiveBook(), { wrapper });

    await waitFor(() => {
      expect(view1.current.isSuccess).toBe(true);
      expect(view2.current.isSuccess).toBe(true);
    });

    expect(view1.current.activeBookId).toBe(defaultBook.id);
    expect(view2.current.activeBookId).toBe(defaultBook.id);

    // Screen 1 changes the active book
    act(() => {
      view1.current.setActiveBook(businessBook.id);
    });

    // Both screens update immediately to the new active book
    expect(view1.current.activeBook).toEqual(businessBook);
    expect(view1.current.activeBookId).toBe(businessBook.id);

    expect(view2.current.activeBook).toEqual(businessBook);
    expect(view2.current.activeBookId).toBe(businessBook.id);

    // Change using book object
    act(() => {
      view2.current.setActiveBook(defaultBook);
    });

    expect(view1.current.activeBook).toEqual(defaultBook);
    expect(view2.current.activeBook).toEqual(defaultBook);
  });

  it('exposes error state when loading books fails', async () => {
    mock.onGet('/books').reply(500, { message: 'Server error' });

    const { result } = renderHook(() => useActiveBook(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.activeBook).toBeNull();
    expect(result.current.activeBookId).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.isEmpty).toBe(false);
  });
});
