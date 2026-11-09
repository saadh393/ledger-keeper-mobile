/* eslint-disable max-lines-per-function */
import type { Book } from '@/features/books/schemas/book-schema';
import type { BookTable, TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';
import { useAuthStore } from '@/features/auth';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { TransactionList } from '@/features/ledger/components/transaction-list';
import { apiClient } from '@/lib/api/client';
import i18n from '@/lib/i18n';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 24, bottom: 34, left: 0, right: 0 })),
}));

jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));

const personal: Book = { id: 'book-1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const business: Book = { id: 'book-2', name: 'Business', currency: 'USD', isDefault: false, createdAt: '2026-01-02T00:00:00.000Z' };

const november = { month: { year: 2026, month: 11 }, firstDay: '2026-11-01', lastDay: '2026-11-30' };
const october = { month: { year: 2026, month: 10 }, firstDay: '2026-10-01', lastDay: '2026-10-31' };

const dayInMs = 24 * 60 * 60 * 1000;

function row(overrides: Partial<TransactionRow> & Pick<TransactionRow, 'id' | 'dateIso'>): TransactionRow {
  return {
    kind: 'expense',
    name: overrides.id,
    subtitle: 'Food',
    category: 'Food',
    amount: 100,
    note: null,
    original: null,
    merchant: null,
    items: [],
    ...overrides,
  };
}

function table(rows: TransactionRow[], income = 0, expense = 0): BookTable {
  return {
    stats: [
      { label: 'Income', value: income, delta: '', kind: 'income' },
      { label: 'Expense', value: expense, delta: '', kind: 'expense' },
      { label: 'Net position', value: income - expense, delta: '' },
      { label: 'Avg / tx', value: 0, delta: '' },
    ],
    rows,
  };
}

type Instance = typeof screen.root;

function listOrder() {
  return screen.root
    .findAll((node: Instance) => typeof node.type === 'string' && ['ledger-day-header', 'ledger-row-title'].includes(node.props.testID))
    .map((node: Instance) => node.props.children);
}

function rowTitles() {
  return screen.queryAllByTestId('ledger-row-title').map(node => node.props.children);
}

const now = Date.now();
const today = new Date(now).toISOString();
const yesterday = new Date(now - dayInMs).toISOString();

describe('transactionList', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    mock.onGet('/books').reply(200, { items: [personal, business] });
    useAuthStore.setState({ status: 'signedIn' });
    useActiveBookStore.setState({ activeBookId: personal.id });
    jest.mocked(showMessage).mockClear();
  });

  afterEach(async () => {
    mock.restore();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
      useActiveBookStore.setState({ activeBookId: null });
    });
    await act(() => i18n.changeLanguage('en'));
  });

  it('lists the month rows grouped under day headers, newest first', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([
      row({ id: 'Rent', dateIso: '2026-10-03T05:00:00.000Z' }),
      row({ id: 'Lunch', dateIso: yesterday }),
      row({ id: 'Salary', dateIso: today, kind: 'income' }),
      row({ id: 'Bus', dateIso: '2026-10-03T09:00:00.000Z' }),
    ]));
    render(<TransactionList {...november} />);

    expect(await screen.findByText('Salary')).toBeOnTheScreen();
    expect(listOrder()).toEqual(['Today', 'Salary', 'Yesterday', 'Lunch', '3 Oct', 'Bus', 'Rent']);
    expect(mock.history.get.find(request => request.url === '/books/book-1/table')?.params).toEqual({ fromDate: '2026-11-01', toDate: '2026-11-30' });
  });

  it('shows Bangla day headers when the app is in Bangla', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([
      row({ id: 'Lunch', dateIso: yesterday }),
      row({ id: 'Salary', dateIso: today }),
      row({ id: 'Rent', dateIso: '2026-10-03T05:00:00.000Z' }),
    ]));
    await act(() => i18n.changeLanguage('bn'));
    render(<TransactionList {...november} />);

    expect(await screen.findByText('আজ')).toBeOnTheScreen();
    expect(screen.getByText('গতকাল')).toBeOnTheScreen();
    expect(screen.getByText('৩ অক্টো')).toBeOnTheScreen();
  });

  it('shows the tone tile, title, meta and signed amount on each row', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([
      row({ id: 'Coffee', dateIso: today, amount: 1458, original: { amount: 12, currency: 'USD', rate: 121.5 } }),
      row({ id: 'Salary', dateIso: yesterday, kind: 'income', category: 'Salary', amount: 50000 }),
    ]));
    render(<TransactionList {...november} />);

    expect(await screen.findByText('Coffee')).toBeOnTheScreen();
    expect(screen.getAllByTestId('ledger-row-meta').map(node => node.props.children)).toEqual(['Food · $12 at 121.5', 'Salary']);
    const amounts = screen.getAllByTestId('ledger-row-amount');
    expect(amounts.map(node => node.props.children)).toEqual(['− ৳1,458', '+ ৳50,000']);
    expect(amounts[0]?.props.className).toContain('text-clay-500');
    expect(amounts[1]?.props.className).toContain('text-forest-500');
    amounts.forEach((amount) => {
      expect(amount.props.style).toEqual(expect.objectContaining({ fontVariant: ['tabular-nums'] }));
      expect(amount.props.className).toContain('shrink-0');
      expect(amount.props.numberOfLines).toBeUndefined();
    });
    const tones = screen.getAllByTestId('ledger-row-tone', { includeHiddenElements: true });
    expect(tones[0]?.props.className).toContain('bg-clay-100');
    expect(tones[1]?.props.className).toContain('bg-forest-100');
  });

  it('truncates a long title to one line', async () => {
    const name = 'A very long transaction title that will never fit on a single line of a phone screen';
    mock.onGet('/books/book-1/table').reply(200, table([row({ id: 'long', name, dateIso: today })]));
    render(<TransactionList {...november} />);

    const title = await screen.findByText(name);
    expect(title.props.numberOfLines).toBe(1);
    expect(title.props.ellipsizeMode).toBe('tail');
  });

  it('shows a footer with the count and the month income and expense totals', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([
      row({ id: 'Lunch', dateIso: today }),
      row({ id: 'Salary', dateIso: yesterday, kind: 'income' }),
    ], 25000, 18000));
    render(<TransactionList {...november} />);

    expect(await screen.findByTestId('ledger-list-footer')).toBeOnTheScreen();
    expect(screen.getByTestId('ledger-list-footer-count')).toHaveTextContent('Transactions2');
    expect(screen.getByTestId('ledger-list-footer-income')).toHaveTextContent('Income৳25,000');
    expect(screen.getByTestId('ledger-list-footer-expense')).toHaveTextContent('Expense৳18,000');
  });

  it('keeps the last row and footer clear of the bottom safe area', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([row({ id: 'Lunch', dateIso: today })]));
    render(<TransactionList {...november} />);

    await screen.findByText('Lunch');
    expect(screen.getByTestId('ledger-list').props.contentContainerStyle).toEqual(expect.objectContaining({ paddingBottom: 50 }));
  });

  it('shows 6 placeholder rows while loading the first time', async () => {
    mock.onGet('/books/book-1/table').reply(() => new Promise(() => {}));
    render(<TransactionList {...november} />);

    expect(screen.getAllByTestId('ledger-row-placeholder')).toHaveLength(6);
    expect(screen.getAllByTestId('ledger-row-placeholder')[0]?.props.accessibilityLabel).toBe('Loading');
    await waitFor(() => expect(mock.history.get.some(request => request.url === '/books/book-1/table')).toBe(true));
    expect(screen.getAllByTestId('ledger-row-placeholder')).toHaveLength(6);
    expect(screen.queryByTestId('ledger-list-empty')).not.toBeOnTheScreen();
  });

  it('shows the empty state with the month name and no action', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([]));
    render(<TransactionList {...november} />);

    expect(await screen.findByTestId('ledger-list-empty')).toBeOnTheScreen();
    expect(screen.getByText('No transactions in November 2026')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-list-footer')).not.toBeOnTheScreen();
  });

  it('shows the empty state in Bangla', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([]));
    await act(() => i18n.changeLanguage('bn'));
    render(<TransactionList {...november} />);

    expect(await screen.findByText('নভেম্বর ২০২৬-এ কোনো লেনদেন নেই')).toBeOnTheScreen();
  });

  it('shows the error state with Retry, and Retry refetches', async () => {
    mock.onGet('/books/book-1/table').replyOnce(500).onGet('/books/book-1/table').reply(200, table([row({ id: 'Lunch', dateIso: today })]));
    render(<TransactionList {...november} />);

    expect(await screen.findByTestId('ledger-list-error')).toBeOnTheScreen();
    expect(screen.getByText('Could not load transactions')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Retry'));

    expect(await screen.findByText('Lunch')).toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-list-error')).not.toBeOnTheScreen();
  });

  it('refetches on pull to refresh and shows the spinner until done', async () => {
    let resolveRefresh: (value: [number, BookTable]) => void = () => {};
    mock.onGet('/books/book-1/table').replyOnce(200, table([row({ id: 'Lunch', dateIso: today })])).onGet('/books/book-1/table').reply(
      () => new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );
    render(<TransactionList {...november} />);
    await screen.findByText('Lunch');

    act(() => {
      screen.getByTestId('ledger-list').props.refreshControl.props.onRefresh();
    });

    await waitFor(() => expect(screen.getByTestId('ledger-list').props.refreshControl.props.refreshing).toBe(true));
    expect(screen.getByText('Lunch')).toBeOnTheScreen();

    await act(async () => resolveRefresh([200, table([row({ id: 'Dinner', dateIso: today }), row({ id: 'Lunch', dateIso: yesterday })])]));

    expect(await screen.findByText('Dinner')).toBeOnTheScreen();
    expect(screen.getByTestId('ledger-list').props.refreshControl.props.refreshing).toBe(false);
    expect(showMessage).not.toHaveBeenCalled();
  });

  it('keeps the old rows and shows a short error when a refresh fails', async () => {
    mock.onGet('/books/book-1/table').replyOnce(200, table([row({ id: 'Lunch', dateIso: today })])).onGet('/books/book-1/table').reply(500);
    render(<TransactionList {...november} />);
    await screen.findByText('Lunch');

    await act(async () => {
      await screen.getByTestId('ledger-list').props.refreshControl.props.onRefresh();
    });

    expect(showMessage).toHaveBeenCalledWith(expect.objectContaining({ message: 'Could not refresh', type: 'danger' }));
    expect(screen.getByText('Lunch')).toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-list-error')).not.toBeOnTheScreen();
    expect(screen.getByTestId('ledger-list').props.refreshControl.props.refreshing).toBe(false);
  });

  it('shows placeholders, never the previous month rows, when the month changes', async () => {
    let resolveOctober: (value: [number, BookTable]) => void = () => {};
    mock.onGet('/books/book-1/table', { params: { fromDate: '2026-11-01', toDate: '2026-11-30' } }).reply(200, table([row({ id: 'November rent', dateIso: today })]));
    mock.onGet('/books/book-1/table', { params: { fromDate: '2026-10-01', toDate: '2026-10-31' } }).reply(
      () => new Promise((resolve) => {
        resolveOctober = resolve;
      }),
    );
    const view = render(<TransactionList {...november} />);
    await screen.findByText('November rent');

    view.rerender(<TransactionList {...october} />);

    expect(screen.getAllByTestId('ledger-row-placeholder')).toHaveLength(6);
    expect(screen.queryByText('November rent')).not.toBeOnTheScreen();

    await waitFor(() => expect(mock.history.get.some(request => request.params?.fromDate === '2026-10-01')).toBe(true));
    await act(async () => resolveOctober([200, table([row({ id: 'October rent', dateIso: '2026-10-03T05:00:00.000Z' })])]));
    expect(await screen.findByText('October rent')).toBeOnTheScreen();
    expect(rowTitles()).toEqual(['October rent']);
  });

  it('shows placeholders, then the new book rows in its currency, when the book changes', async () => {
    let resolveBusiness: (value: [number, BookTable]) => void = () => {};
    mock.onGet('/books/book-1/table').reply(200, table([row({ id: 'Personal lunch', dateIso: today })]));
    mock.onGet('/books/book-2/table').reply(
      () => new Promise((resolve) => {
        resolveBusiness = resolve;
      }),
    );
    render(<TransactionList {...november} />);
    await screen.findByText('Personal lunch');

    act(() => useActiveBookStore.setState({ activeBookId: business.id }));

    expect(screen.getAllByTestId('ledger-row-placeholder')).toHaveLength(6);
    expect(screen.queryByText('Personal lunch')).not.toBeOnTheScreen();

    await waitFor(() => expect(mock.history.get.some(request => request.url === '/books/book-2/table')).toBe(true));
    await act(async () => resolveBusiness([200, table([row({ id: 'Client lunch', dateIso: today, amount: 12.5 })])]));
    expect(await screen.findByText('Client lunch')).toBeOnTheScreen();
    expect(screen.getByTestId('ledger-row-amount')).toHaveTextContent('− $12.50');
  });
});
