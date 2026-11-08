/* eslint-disable max-lines-per-function */
import type { Book } from '@/features/books/schemas/book-schema';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { Text, View } from 'react-native';
import { useAuthStore } from '@/features/auth';
import { BookSwitcher } from '@/features/books/components/book-switcher';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { booksKeys } from '@/features/books/utils/query-keys';
import { apiClient } from '@/lib/api/client';
import i18n from '@/lib/i18n';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

const bookPersonal: Book = {
  id: 'b-personal',
  name: 'Personal Expenses',
  currency: 'BDT',
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const bookBusiness: Book = {
  id: 'b-business',
  name: 'Business Ledger',
  currency: 'USD',
  isDefault: false,
  createdAt: '2026-01-02T00:00:00.000Z',
};

const bookFamily: Book = {
  id: 'b-family',
  name: 'Family Fund',
  currency: 'EUR',
  isDefault: false,
  createdAt: '2026-01-03T00:00:00.000Z',
};

describe('bookSwitcher', () => {
  let mockApi: MockAdapter;
  let testQueryClient: QueryClient;

  const createMockNavigation = () => ({
    closeDrawer: jest.fn(),
    navigate: jest.fn(),
    openDrawer: jest.fn(),
  });

  beforeEach(() => {
    mockApi = new MockAdapter(apiClient);
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    useAuthStore.setState({ status: 'signedIn' });
    useActiveBookStore.setState({ activeBookId: null });
  });

  afterEach(async () => {
    mockApi.restore();
    testQueryClient.clear();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
      useActiveBookStore.setState({ activeBookId: null });
    });
    await act(() => i18n.changeLanguage('en'));
  });

  function renderSwitcher(
    navigation = createMockNavigation(),
    customSlot?: React.ReactNode,
  ) {
    return render(
      <QueryClientProvider client={testQueryClient}>
        <View testID="drawer-book-switcher-slot">
          <BookSwitcher navigation={navigation as any} />
        </View>
        {customSlot}
      </QueryClientProvider>,
    );
  }

  describe('slot display and truncation (Criterion 1)', () => {
    it('shows active book name and currency code', async () => {
      mockApi.onGet('/books').reply(200, {
        items: [bookPersonal, bookBusiness],
      });

      renderSwitcher();

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-trigger')).toBeOnTheScreen();
      });

      expect(screen.getByTestId('book-switcher-active-name')).toHaveTextContent('Personal Expenses');
      expect(screen.getByTestId('book-switcher-active-currency')).toHaveTextContent('BDT');
    });

    it('truncates long book names with single line and tail ellipsis', async () => {
      const longNameBook: Book = {
        id: 'b-long',
        name: 'Extremely Long Book Name That Needs To Truncate Beautifully In Drawer',
        currency: 'GBP',
        isDefault: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      mockApi.onGet('/books').reply(200, {
        items: [longNameBook],
      });

      renderSwitcher();

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-active-name')).toBeOnTheScreen();
      });

      const nameElement = screen.getByTestId('book-switcher-active-name');
      expect(nameElement.props.numberOfLines).toBe(1);
      expect(nameElement.props.ellipsizeMode).toBe('tail');
      expect(nameElement).toHaveTextContent(longNameBook.name);
    });
  });

  describe('opening list and item indicators (Criteria 2 and 3)', () => {
    it('tapping slot opens list of books with default marked "Default" and active having check mark', async () => {
      mockApi.onGet('/books').reply(200, {
        items: [bookPersonal, bookBusiness, bookFamily],
      });

      renderSwitcher();

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-trigger')).toBeOnTheScreen();
      });

      // Sheet is not open initially
      expect(screen.queryByTestId('book-switcher-sheet')).toBeNull();

      // Tap slot to open
      fireEvent.press(screen.getByTestId('book-switcher-trigger'));

      // Sheet opens
      expect(screen.getByTestId('book-switcher-sheet')).toBeOnTheScreen();
      expect(screen.getByTestId('book-switcher-sheet-title')).toHaveTextContent('Switch book');

      // Check default mark
      expect(screen.getByTestId('book-item-default-b-personal')).toBeOnTheScreen();
      expect(screen.getByTestId('book-item-default-b-personal')).toHaveTextContent('Default');
      expect(screen.queryByTestId('book-item-default-b-business')).toBeNull();

      // Check active mark on personal book
      expect(screen.getByTestId('book-item-check-b-personal')).toBeOnTheScreen();
      expect(screen.queryByTestId('book-item-check-b-business')).toBeNull();

      // Check name and currency on items
      expect(screen.getByTestId('book-item-name-b-personal')).toHaveTextContent('Personal Expenses');
      expect(screen.getByTestId('book-item-currency-b-personal')).toHaveTextContent('BDT');
      expect(screen.getByTestId('book-item-name-b-business')).toHaveTextContent('Business Ledger');
      expect(screen.getByTestId('book-item-currency-b-business')).toHaveTextContent('USD');
    });

    it('books are listed default first, then alphabetically by name', async () => {
      const bookZebra: Book = {
        id: 'b-zebra',
        name: 'Zebra Ledger',
        currency: 'USD',
        isDefault: false,
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      const bookApple: Book = {
        id: 'b-apple',
        name: 'Apple Farm',
        currency: 'EUR',
        isDefault: false,
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      const bookDefaultMiddle: Book = {
        id: 'b-def',
        name: 'Office Default',
        currency: 'BDT',
        isDefault: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      mockApi.onGet('/books').reply(200, {
        items: [bookZebra, bookDefaultMiddle, bookApple],
      });

      renderSwitcher();

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-trigger')).toBeOnTheScreen();
      });

      fireEvent.press(screen.getByTestId('book-switcher-trigger'));

      const list = screen.getByTestId('book-switcher-sheet-list');
      const items = list.props.data as Book[];

      // Default first, then Apple, then Zebra
      expect(items.map(b => b.name)).toEqual(['Office Default', 'Apple Farm', 'Zebra Ledger']);
    });
  });

  describe('switching books (Criterion 4)', () => {
    it('tapping another book makes it active, closes the list and the drawer', async () => {
      const navigation = createMockNavigation();
      mockApi.onGet('/books').reply(200, {
        items: [bookPersonal, bookBusiness],
      });

      renderSwitcher(navigation);

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-trigger')).toBeOnTheScreen();
      });

      expect(useActiveBookStore.getState().activeBookId).toBe(bookPersonal.id);

      // Open sheet
      fireEvent.press(screen.getByTestId('book-switcher-trigger'));
      expect(screen.getByTestId('book-switcher-sheet')).toBeOnTheScreen();

      // Tap business book
      fireEvent.press(screen.getByTestId('book-item-b-business'));

      // Active book changed in store
      expect(useActiveBookStore.getState().activeBookId).toBe(bookBusiness.id);

      // Sheet closed
      expect(screen.queryByTestId('book-switcher-sheet')).toBeNull();

      // Drawer closed
      expect(navigation.closeDrawer).toHaveBeenCalledTimes(1);

      // Trigger now displays the newly active book
      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-active-name')).toHaveTextContent('Business Ledger');
      });
      expect(screen.getByTestId('book-switcher-active-currency')).toHaveTextContent('USD');
    });
  });

  describe('cache isolation and screen loading state (Criterion 5)', () => {
    function MockScreenView() {
      const { activeBookId } = useActiveBook();
      const { data, isLoading } = useQuery({
        queryKey: booksKeys.table(activeBookId!),
        queryFn: async () => {
          const res = await apiClient.get(`/books/${activeBookId}/table`);
          return res.data;
        },
        enabled: Boolean(activeBookId),
      });

      if (isLoading) {
        return <Text testID="screen-loading">Loading book data…</Text>;
      }

      return (
        <View testID="screen-data">
          <Text testID="screen-total">{data?.total}</Text>
        </View>
      );
    }

    it('while new book data loads, screen shows loading state and never previous book numbers', async () => {
      const navigation = createMockNavigation();
      mockApi.onGet('/books').reply(200, {
        items: [bookPersonal, bookBusiness],
      });

      // Data for personal book loads immediately
      mockApi.onGet('/books/b-personal/table').reply(200, {
        total: 12500,
      });

      // Data for business book is delayed (deferred)
      let resolveBusinessQuery: (value: [number, any]) => void;
      const businessPromise = new Promise<[number, any]>((resolve) => {
        resolveBusinessQuery = resolve;
      });
      mockApi.onGet('/books/b-business/table').reply(() => businessPromise);

      renderSwitcher(navigation, <MockScreenView />);

      // Wait for personal book data to load
      await waitFor(() => {
        expect(screen.getByTestId('screen-total')).toHaveTextContent('12500');
      });

      // Open switcher and select business book
      fireEvent.press(screen.getByTestId('book-switcher-trigger'));
      fireEvent.press(screen.getByTestId('book-item-b-business'));

      // New active book is business book
      expect(useActiveBookStore.getState().activeBookId).toBe('b-business');

      // Current screen immediately shows loading state, NEVER the previous book numbers (12500)
      expect(screen.getByTestId('screen-loading')).toBeOnTheScreen();
      expect(screen.queryByTestId('screen-total')).toBeNull();
      expect(screen.queryByText('12500')).toBeNull();

      // Resolve business book query
      await act(async () => {
        resolveBusinessQuery!([200, { total: 98000 }]);
      });

      // Now business book data is displayed
      await waitFor(() => {
        expect(screen.getByTestId('screen-total')).toHaveTextContent('98000');
      });
      expect(screen.queryByTestId('screen-loading')).toBeNull();
    });
  });

  describe('tapping active book (Criterion 6)', () => {
    it('tapping already active book only closes list without closing drawer', async () => {
      const navigation = createMockNavigation();
      mockApi.onGet('/books').reply(200, {
        items: [bookPersonal, bookBusiness],
      });

      renderSwitcher(navigation);

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-trigger')).toBeOnTheScreen();
      });

      // Open sheet
      fireEvent.press(screen.getByTestId('book-switcher-trigger'));
      expect(screen.getByTestId('book-switcher-sheet')).toBeOnTheScreen();

      // Tap active book (Personal)
      fireEvent.press(screen.getByTestId('book-item-b-personal'));

      // Sheet closes
      expect(screen.queryByTestId('book-switcher-sheet')).toBeNull();

      // Drawer is NOT closed
      expect(navigation.closeDrawer).not.toHaveBeenCalled();

      // Active book remains Personal
      expect(useActiveBookStore.getState().activeBookId).toBe(bookPersonal.id);
    });
  });

  describe('loading state and error with retry (Criterion 7)', () => {
    it('shows placeholder while books load', () => {
      // Simulate slow query with unresolved promise
      mockApi.onGet('/books').reply(() => new Promise(() => {}));

      renderSwitcher();

      expect(screen.getByTestId('book-switcher-loading')).toBeOnTheScreen();
      expect(screen.queryByTestId('book-switcher-trigger')).toBeNull();
      expect(screen.queryByTestId('book-switcher-error')).toBeNull();
    });

    it('shows error banner with "Couldn\'t load books" and Retry button on failure', async () => {
      mockApi.onGet('/books').reply(500, { message: 'Server error' });

      renderSwitcher();

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-error')).toBeOnTheScreen();
      });

      expect(screen.getByTestId('book-switcher-error-message')).toHaveTextContent('Couldn\'t load books');
      const retryBtn = screen.getByTestId('book-switcher-retry');
      expect(retryBtn).toHaveTextContent('Retry');

      // Now mock successful reply on retry
      mockApi.reset();
      mockApi.onGet('/books').reply(200, {
        items: [bookPersonal],
      });

      fireEvent.press(retryBtn);

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-trigger')).toBeOnTheScreen();
      });

      expect(screen.queryByTestId('book-switcher-error')).toBeNull();
      expect(screen.getByTestId('book-switcher-active-name')).toHaveTextContent('Personal Expenses');
    });
  });

  describe('single book edge case (Criterion 8)', () => {
    it('with only one book, the list still opens and shows that book', async () => {
      mockApi.onGet('/books').reply(200, {
        items: [bookPersonal],
      });

      renderSwitcher();

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-trigger')).toBeOnTheScreen();
      });

      // Tapping it opens the sheet
      fireEvent.press(screen.getByTestId('book-switcher-trigger'));
      expect(screen.getByTestId('book-switcher-sheet')).toBeOnTheScreen();

      // The single book is shown
      expect(screen.getByTestId('book-item-b-personal')).toBeOnTheScreen();
      expect(screen.getByTestId('book-item-name-b-personal')).toHaveTextContent('Personal Expenses');
      expect(screen.getByTestId('book-item-default-b-personal')).toBeOnTheScreen();
      expect(screen.getByTestId('book-item-check-b-personal')).toBeOnTheScreen();
    });
  });

  describe('many books scrolling and drawer layout (Criterion 9)', () => {
    it('with 20+ books, list contains all books and drawer layout does not break', async () => {
      const manyBooks: Book[] = Array.from({ length: 25 }, (_, idx) => ({
        id: `b-${idx + 1}`,
        name: `Book ${String(idx + 1).padStart(2, '0')}`,
        currency: idx % 2 === 0 ? 'BDT' : 'USD',
        isDefault: idx === 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      }));

      mockApi.onGet('/books').reply(200, {
        items: manyBooks,
      });

      renderSwitcher();

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-trigger')).toBeOnTheScreen();
      });

      // Drawer slot remains mounted and intact
      expect(screen.getByTestId('drawer-book-switcher-slot')).toBeOnTheScreen();

      // Open sheet
      fireEvent.press(screen.getByTestId('book-switcher-trigger'));

      const list = screen.getByTestId('book-switcher-sheet-list');
      const data = list.props.data as Book[];
      expect(data).toHaveLength(25);

      // Drawer slot still intact
      expect(screen.getByTestId('drawer-book-switcher-slot')).toBeOnTheScreen();
    });
  });

  describe('accessibility (Criterion 10)', () => {
    it('each row is announced with name, currency, and selected state', async () => {
      mockApi.onGet('/books').reply(200, {
        items: [bookPersonal, bookBusiness],
      });

      renderSwitcher();

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-trigger')).toBeOnTheScreen();
      });

      fireEvent.press(screen.getByTestId('book-switcher-trigger'));

      const personalItem = screen.getByTestId('book-item-b-personal');
      const businessItem = screen.getByTestId('book-item-b-business');

      // Personal row is active
      expect(personalItem.props.accessibilityRole).toBe('button');
      expect(personalItem.props.accessibilityState).toEqual({ selected: true });
      expect(personalItem.props.accessibilityLabel).toBe('Personal Expenses, BDT, Default');

      // Business row is inactive
      expect(businessItem.props.accessibilityRole).toBe('button');
      expect(businessItem.props.accessibilityState).toEqual({ selected: false });
      expect(businessItem.props.accessibilityLabel).toBe('Business Ledger, USD');
    });
  });

  describe('localization in Bangla (Criterion 11)', () => {
    it('renders Bangla strings for default badge, switcher title, error and retry', async () => {
      await act(() => i18n.changeLanguage('bn'));

      mockApi.onGet('/books').reply(200, {
        items: [bookPersonal],
      });

      renderSwitcher();

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-trigger')).toBeOnTheScreen();
      });

      fireEvent.press(screen.getByTestId('book-switcher-trigger'));

      expect(screen.getByTestId('book-switcher-sheet-title')).toHaveTextContent('বই পরিবর্তন');
      expect(screen.getByTestId('book-item-default-b-personal')).toHaveTextContent('ডিফল্ট');
    });

    it('renders Bangla strings for error state and retry button', async () => {
      await act(() => i18n.changeLanguage('bn'));

      mockApi.onGet('/books').reply(500, { message: 'Failed' });

      renderSwitcher();

      await waitFor(() => {
        expect(screen.getByTestId('book-switcher-error')).toBeOnTheScreen();
      });

      expect(screen.getByTestId('book-switcher-error-message')).toHaveTextContent('বই লোড করা যায়নি');
      expect(screen.getByTestId('book-switcher-retry')).toHaveTextContent('আবার চেষ্টা করুন');
    });
  });
});
