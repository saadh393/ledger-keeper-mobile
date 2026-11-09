/* eslint-disable max-lines-per-function */
import type { Book } from '@/features/books/schemas/book-schema';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { useAuthStore } from '@/features/auth';
import { BookSwitcher } from '@/features/books/components/book-switcher';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

const personal: Book = { id: 'b-personal', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const trip: Book = { id: 'b-trip', name: 'Trip', currency: 'USD', isDefault: false, createdAt: '2026-01-02T00:00:00.000Z' };
const created: Book = { id: 'b-work', name: 'Work', currency: 'EUR', isDefault: false, createdAt: '2026-01-03T00:00:00.000Z' };

const profile = {
  id: 'u-1',
  name: 'Jane',
  email: 'jane@example.com',
  image: null,
  role: 'user',
  locale: 'en',
  currency: 'EUR',
  currencyConfirmed: true,
  defaultBookId: personal.id,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('book management', () => {
  let mockApi: MockAdapter;
  let queryClient: QueryClient;

  beforeEach(() => {
    mockApi = new MockAdapter(apiClient);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false, networkMode: 'always' } },
    });
    queryClient.setQueryData(['users', 'me'], profile);
    useAuthStore.setState({ status: 'signedIn' });
    useActiveBookStore.setState({ activeBookId: null });
  });

  afterEach(() => {
    mockApi.restore();
    queryClient.clear();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
      useActiveBookStore.setState({ activeBookId: null });
    });
  });

  async function openList(books: Book[] = [personal, trip]) {
    mockApi.onGet('/books').reply(200, { items: books });
    render(
      <QueryClientProvider client={queryClient}>
        <BookSwitcher />
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId('book-switcher-trigger')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('book-switcher-trigger'));
  }

  function getBooksRequests() {
    return mockApi.history.get.filter(request => request.url === '/books').length;
  }

  describe('create', () => {
    it('opens the sheet from "New book" with an empty name and the user\'s default currency', async () => {
      await openList();
      fireEvent.press(screen.getByTestId('book-switcher-sheet-new-book'));

      expect(screen.getByTestId('book-form-sheet-title')).toHaveTextContent('New book');
      expect(screen.getByTestId('book-form-name').props.value).toBe('');
      expect(screen.getByTestId('book-form-currency-code')).toHaveTextContent('EUR');
    });

    it('lets the user pick a currency from the currency list', async () => {
      await openList();
      fireEvent.press(screen.getByTestId('book-switcher-sheet-new-book'));
      fireEvent.press(screen.getByTestId('book-form-currency'));
      fireEvent.changeText(screen.getByTestId('book-currency-search'), 'jpy');
      fireEvent.press(screen.getByTestId('book-currency-item-JPY'));

      expect(screen.getByTestId('book-form-currency-code')).toHaveTextContent('JPY');
    });

    it('shows the required and too-long errors and the counter', async () => {
      await openList();
      fireEvent.press(screen.getByTestId('book-switcher-sheet-new-book'));

      fireEvent.changeText(screen.getByTestId('book-form-name'), 'a'.repeat(61));
      expect(screen.getByTestId('book-form-name-counter')).toHaveTextContent('61/60');
      await waitFor(() => expect(screen.getByTestId('book-form-name-error')).toHaveTextContent('Name must be at most 60 characters'));

      fireEvent.changeText(screen.getByTestId('book-form-name'), '   ');
      await waitFor(() => expect(screen.getByTestId('book-form-name-error')).toHaveTextContent('Name is required'));

      fireEvent.press(screen.getByTestId('book-form-sheet-submit'));
      expect(await screen.findByTestId('book-form-name-error')).toHaveTextContent('Name is required');
      expect(mockApi.history.post).toHaveLength(0);
    });

    it('posts the trimmed name and currency, shows "Creating…", ignores repeat taps, then closes and activates the new book', async () => {
      const response = deferred<[number, Book]>();
      mockApi.onPost('/books').reply(() => response.promise);
      await openList();
      const before = getBooksRequests();

      fireEvent.press(screen.getByTestId('book-switcher-sheet-new-book'));
      fireEvent.changeText(screen.getByTestId('book-form-name'), '  Work  ');
      fireEvent.press(screen.getByTestId('book-form-sheet-submit'));

      await waitFor(() => expect(screen.getByTestId('book-form-sheet-submit-label')).toHaveTextContent('Creating…'));
      fireEvent.press(screen.getByTestId('book-form-sheet-submit'));
      expect(mockApi.history.post).toHaveLength(1);
      expect(JSON.parse(mockApi.history.post[0].data)).toEqual({ name: 'Work', currency: 'EUR' });

      mockApi.onGet('/books').reply(200, { items: [personal, trip, created] });
      await act(async () => response.resolve([201, created]));

      await waitFor(() => expect(screen.queryByTestId('book-form-sheet')).not.toBeOnTheScreen());
      expect(useActiveBookStore.getState().activeBookId).toBe(created.id);
      await waitFor(() => expect(getBooksRequests()).toBeGreaterThan(before));
      await waitFor(() => expect(screen.getByTestId('book-switcher-active-name')).toHaveTextContent('Work'));
    });

    it('shows the name-taken error under Name on 409 book_name_taken', async () => {
      mockApi.onPost('/books').reply(409, { message: 'taken', code: 'book_name_taken' });
      await openList();
      fireEvent.press(screen.getByTestId('book-switcher-sheet-new-book'));
      fireEvent.changeText(screen.getByTestId('book-form-name'), 'Trip');
      fireEvent.press(screen.getByTestId('book-form-sheet-submit'));

      await waitFor(() => expect(screen.getByTestId('book-form-name-error')).toHaveTextContent('You already have a book with this name'));
      expect(screen.getByTestId('book-form-sheet')).toBeOnTheScreen();
    });

    it('keeps the sheet and values on offline errors and retries', async () => {
      mockApi.onPost('/books').networkErrorOnce();
      await openList();
      fireEvent.press(screen.getByTestId('book-switcher-sheet-new-book'));
      fireEvent.changeText(screen.getByTestId('book-form-name'), 'Work');
      fireEvent.press(screen.getByTestId('book-form-sheet-submit'));
      await waitFor(() => expect(screen.getByTestId('book-form-sheet-error-message')).toHaveTextContent('You\'re offline. Check your connection and try again.'));
      expect(screen.getByTestId('book-form-name').props.value).toBe('Work');

      mockApi.onPost('/books').reply(201, created);
      fireEvent.press(screen.getByTestId('book-form-sheet-error-retry'));
      await waitFor(() => expect(mockApi.history.post).toHaveLength(2));
      await waitFor(() => expect(screen.queryByTestId('book-form-sheet')).not.toBeOnTheScreen());
    });

    it('keeps the sheet open with a Retry on server errors', async () => {
      mockApi.onPost('/books').reply(500, { message: 'boom' });
      await openList();
      fireEvent.press(screen.getByTestId('book-switcher-sheet-new-book'));
      fireEvent.changeText(screen.getByTestId('book-form-name'), 'Work');
      fireEvent.press(screen.getByTestId('book-form-sheet-submit'));

      await waitFor(() => expect(screen.getByTestId('book-form-sheet-error-message')).toHaveTextContent('Something went wrong. Please try again.'));
      expect(screen.getByTestId('book-form-sheet-error-retry')).toBeOnTheScreen();
      expect(screen.getByTestId('book-form-name').props.value).toBe('Work');
    });
  });

  describe('edit', () => {
    it('opens the sheet prefilled with Save disabled until something changes', async () => {
      await openList();
      fireEvent.press(screen.getByTestId('book-item-edit-b-trip'));

      expect(screen.getByTestId('book-form-sheet-title')).toHaveTextContent('Edit book');
      expect(screen.getByTestId('book-form-name').props.value).toBe('Trip');
      expect(screen.getByTestId('book-form-currency-code')).toHaveTextContent('USD');
      expect(screen.getByTestId('book-form-sheet-submit')).toBeDisabled();

      fireEvent.changeText(screen.getByTestId('book-form-name'), 'Trip 2026');
      await waitFor(() => expect(screen.getByTestId('book-form-sheet-submit')).toBeEnabled());

      fireEvent.changeText(screen.getByTestId('book-form-name'), 'Trip ');
      await waitFor(() => expect(screen.getByTestId('book-form-sheet-submit')).toBeDisabled());
    });

    it('sends only the changed fields with PATCH and refetches books', async () => {
      mockApi.onPatch('/books/b-trip').reply(200, { ...trip, name: 'Holiday' });
      await openList();
      const before = getBooksRequests();
      fireEvent.press(screen.getByTestId('book-item-edit-b-trip'));
      fireEvent.changeText(screen.getByTestId('book-form-name'), 'Holiday');
      await waitFor(() => expect(screen.getByTestId('book-form-sheet-submit')).toBeEnabled());
      fireEvent.press(screen.getByTestId('book-form-sheet-submit'));

      await waitFor(() => expect(screen.queryByTestId('book-form-sheet')).not.toBeOnTheScreen());
      expect(JSON.parse(mockApi.history.patch[0].data)).toEqual({ name: 'Holiday' });
      await waitFor(() => expect(getBooksRequests()).toBeGreaterThan(before));
    });

    it('shows the currency error under Currency on 409 book_not_empty and keeps the sheet open', async () => {
      mockApi.onPatch('/books/b-trip').reply(409, { message: 'not empty', code: 'book_not_empty' });
      await openList();
      fireEvent.press(screen.getByTestId('book-item-edit-b-trip'));
      fireEvent.press(screen.getByTestId('book-form-currency'));
      fireEvent.press(screen.getByTestId('book-currency-item-EUR'));
      await waitFor(() => expect(screen.getByTestId('book-form-sheet-submit')).toBeEnabled());
      fireEvent.press(screen.getByTestId('book-form-sheet-submit'));

      await waitFor(() => expect(screen.getByTestId('book-form-currency-error')).toHaveTextContent('Currency can only change while the book is empty'));
      expect(JSON.parse(mockApi.history.patch[0].data)).toEqual({ currency: 'EUR' });
      expect(screen.getByTestId('book-form-sheet')).toBeOnTheScreen();
    });

    it('shows the name-taken error on 409 book_name_taken', async () => {
      mockApi.onPatch('/books/b-trip').reply(409, { message: 'taken', code: 'book_name_taken' });
      await openList();
      fireEvent.press(screen.getByTestId('book-item-edit-b-trip'));
      fireEvent.changeText(screen.getByTestId('book-form-name'), 'Personal');
      await waitFor(() => expect(screen.getByTestId('book-form-sheet-submit')).toBeEnabled());
      fireEvent.press(screen.getByTestId('book-form-sheet-submit'));

      await waitFor(() => expect(screen.getByTestId('book-form-name-error')).toHaveTextContent('You already have a book with this name'));
    });
  });

  describe('delete', () => {
    it('shows Delete only on non-default books', async () => {
      await openList();

      expect(screen.getByTestId('book-item-delete-b-trip')).toBeOnTheScreen();
      expect(screen.queryByTestId('book-item-delete-b-personal')).toBeNull();
      expect(screen.getByTestId('book-item-edit-b-personal')).toBeOnTheScreen();
    });

    it('asks for confirmation naming the book and what is lost, with a destructive confirm button', async () => {
      await openList();
      fireEvent.press(screen.getByTestId('book-item-delete-b-trip'));

      expect(screen.getByTestId('book-delete-sheet-title')).toHaveTextContent('Delete “Trip”?');
      expect(screen.getByTestId('book-delete-sheet-body')).toHaveTextContent(
        'All its transactions, loans, installment plans and chats are deleted and cannot be recovered.',
      );
      expect(screen.getByTestId('book-delete-sheet-confirm-label')).toHaveTextContent('Delete book');
      expect(screen.getByTestId('book-delete-sheet-confirm-label').props.className).toContain('text-clay-500');
      expect(mockApi.history.delete).toHaveLength(0);
    });

    it('sends DELETE, shows "Deleting…", removes the book and switches the active book to the default', async () => {
      const response = deferred<[number]>();
      mockApi.onDelete('/books/b-trip').reply(() => response.promise);
      useActiveBookStore.setState({ activeBookId: trip.id });
      await openList();
      const before = getBooksRequests();

      fireEvent.press(screen.getByTestId('book-item-delete-b-trip'));
      fireEvent.press(screen.getByTestId('book-delete-sheet-confirm'));
      await waitFor(() => expect(screen.getByTestId('book-delete-sheet-confirm-label')).toHaveTextContent('Deleting…'));
      fireEvent.press(screen.getByTestId('book-delete-sheet-confirm'));
      expect(mockApi.history.delete).toHaveLength(1);

      mockApi.onGet('/books').reply(200, { items: [personal] });
      await act(async () => response.resolve([204]));

      await waitFor(() => expect(screen.queryByTestId('book-delete-sheet')).not.toBeOnTheScreen());
      expect(useActiveBookStore.getState().activeBookId).toBe(personal.id);
      expect(screen.queryByTestId('book-item-b-trip')).toBeNull();
      await waitFor(() => expect(getBooksRequests()).toBeGreaterThan(before));
    });

    it('shows "The default book can\'t be deleted" on 409 default_book', async () => {
      mockApi.onDelete('/books/b-trip').reply(409, { message: 'default', code: 'default_book' });
      await openList();
      fireEvent.press(screen.getByTestId('book-item-delete-b-trip'));
      fireEvent.press(screen.getByTestId('book-delete-sheet-confirm'));

      await waitFor(() => expect(screen.getByTestId('book-delete-sheet-error-message')).toHaveTextContent('The default book can\'t be deleted'));
      expect(screen.queryByTestId('book-delete-sheet-error-retry')).toBeNull();
    });

    it('keeps the sheet open with Retry on offline errors', async () => {
      mockApi.onDelete('/books/b-trip').networkErrorOnce();
      await openList();
      fireEvent.press(screen.getByTestId('book-item-delete-b-trip'));
      fireEvent.press(screen.getByTestId('book-delete-sheet-confirm'));

      expect(await screen.findByTestId('book-delete-sheet-error-retry')).toBeOnTheScreen();
      mockApi.onDelete('/books/b-trip').reply(204);
      fireEvent.press(screen.getByTestId('book-delete-sheet-error-retry'));
      await waitFor(() => expect(mockApi.history.delete).toHaveLength(2));

      await waitFor(() => expect(screen.queryByTestId('book-delete-sheet')).not.toBeOnTheScreen());
    });
  });
});
