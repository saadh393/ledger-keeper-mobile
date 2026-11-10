/* eslint-disable max-lines-per-function */
import type { Book } from '@/features/books/schemas/book-schema';
import type { BookTable } from '@/features/ledger/schemas/book-table-schema';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import * as ReactNative from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useAuthStore } from '@/features/auth';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { LedgerStats } from '@/features/ledger/components/ledger-stats';
import { apiClient } from '@/lib/api/client';
import i18n from '@/lib/i18n';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));

const personal: Book = { id: 'book-1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const business: Book = { id: 'book-2', name: 'Business', currency: 'USD', isDefault: false, createdAt: '2026-01-02T00:00:00.000Z' };

const november = { firstDay: '2026-11-01', lastDay: '2026-11-30' };
const october = { firstDay: '2026-10-01', lastDay: '2026-10-31' };

function table([income, expense, net, average]: [number, number, number, number]): BookTable {
  return {
    stats: [
      { label: 'Income', value: income, delta: '', kind: 'income' },
      { label: 'Expense', value: expense, delta: '', kind: 'expense' },
      { label: 'Net position', value: net, delta: '' },
      { label: 'Avg / tx', value: average, delta: '' },
    ],
    rows: [],
  };
}

function cells() {
  return screen.getAllByTestId('ledger-summary-cell');
}

function valueNodes() {
  return screen.getAllByTestId('ledger-summary-value');
}

function values() {
  return valueNodes().map(value => value.props.children);
}

function expectPlaceholders() {
  expect(cells()).toHaveLength(4);
  expect(screen.getAllByTestId('ledger-summary-placeholder')).toHaveLength(4);
  expect(screen.queryAllByTestId('ledger-summary-value')).toHaveLength(0);
}

describe('ledgerStats', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    mock.onGet('/books').reply(200, { items: [personal, business] });
    useAuthStore.setState({ status: 'signedIn' });
    useActiveBookStore.setState({ activeBookId: personal.id });
  });

  afterEach(async () => {
    mock.restore();
    act(() => {
      ReactNative.Dimensions.set({
        window: { width: 360, height: 740, scale: 3, fontScale: 1 },
        screen: { width: 360, height: 740, scale: 3, fontScale: 1 },
      });
      useAuthStore.setState({ status: 'idle' });
      useActiveBookStore.setState({ activeBookId: null });
    });
    await act(() => i18n.changeLanguage('en'));
  });

  it('renders the four values in one strip from the server stats for the active book and month', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([25000, 18000, 7000, 1500]));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()).toEqual(['৳25,000', '৳18,000', '+৳7,000', '৳1,500']));
    expect(cells().map(cell => cell.props.accessibilityLabel)).toEqual([
      'Income, ৳25,000',
      'Expense, ৳18,000',
      'Net position, + ৳7,000',
      'Avg / tx, ৳1,500',
    ]);
    cells().forEach(cell => expect(cell.props.accessible).toBe(true));
    expect(screen.getByTestId('ledger-stats').props.className).toContain('bg-surface-container');
    expect(screen.getByTestId('ledger-stats').props.className).toContain('flex-row');
    expect(mock.history.get.find(request => request.url === '/books/book-1/table')?.params).toEqual({ fromDate: '2026-11-01', toDate: '2026-11-30' });

    expect(valueNodes()[0]?.props.className).toContain('text-forest-500');
    expect(valueNodes()[1]?.props.className).toContain('text-clay-500');
    expect(valueNodes()[2]?.props.className).toContain('text-forest-500');
    expect(valueNodes()[3]?.props.className).not.toMatch(/text-(forest|clay)-500/);
    valueNodes().forEach(value => expect(value.props.className).toContain('text-row-title'));
  });

  it('shows the exact value on long-press without changing the accessibility label', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([123456789, 18000, 7000, 1500]));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()[0]).toBe('৳12.3 Cr'));
    fireEvent(cells()[0]!, 'longPress');
    expect(showMessage).toHaveBeenCalledWith({ message: 'Income ৳123,456,789', type: 'info' });
    expect(cells()[0]?.props.accessibilityLabel).toBe('Income, ৳123,456,789');
    expect(cells()[0]?.props.accessibilityRole).toBeUndefined();
  });

  it('uses tabular figures and lets large values shrink on one line', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([12345678, 12345678, 0, 12345678]));
    await act(() => i18n.changeLanguage('bn'));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()[0]).toBe('৳১.২৩ কোটি'));
    valueNodes().forEach((value) => {
      expect(value.props.style).toEqual(expect.objectContaining({ fontVariant: ['tabular-nums'] }));
      expect(value.props.adjustsFontSizeToFit).toBe(true);
      expect(value.props.numberOfLines).toBe(1);
      expect(value.props.minimumFontScale).toBe(0.8);
    });
    expect(cells()[0]?.props.accessibilityLabel).toBe('আয়, ৳১,২৩,৪৫,৬৭৮');
  });

  it('shows short English labels and keeps the full label in the accessibility label', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([1, 1, 0, 1]));
    render(<LedgerStats {...november} />);

    expect(await screen.findByText('Net')).toBeOnTheScreen();
    expect(screen.getByText('Income')).toBeOnTheScreen();
    expect(screen.getByText('Expense')).toBeOnTheScreen();
    expect(screen.getByText('Avg')).toBeOnTheScreen();
    expect(screen.queryByText('Net position')).not.toBeOnTheScreen();
    expect(screen.queryByText('Avg / tx')).not.toBeOnTheScreen();
  });

  it.each([
    { language: 'en', expected: ['৳12.3 Cr', '৳999 Cr', '+৳12.3 Cr', '৳46'], netLabel: 'Net position, + ৳123,456,789' },
    { language: 'bn', expected: ['৳১২.৩ কোটি', '৳৯৯৯ কোটি', '+৳১২.৩ কোটি', '৳৪৬'], netLabel: 'নিট অবস্থান, + ৳১২,৩৪,৫৬,৭৮৯' },
  ])('shows a large month compactly in $language with the exact value in the accessibility label', async ({ language, expected, netLabel }) => {
    mock.onGet('/books/book-1/table').reply(200, table([123456789, 9990000000, 123456789, 45.5]));
    await act(() => i18n.changeLanguage(language));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()).toEqual(expected));
    expect(valueNodes()[2]?.props.className).toContain('text-forest-500');
    expect(cells()[2]?.props.accessibilityLabel).toBe(netLabel);
  });

  it('shows the medium, rounding-edge and negative net values compactly', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([123456, 9995000, -250000, 0.4]));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()).toEqual(['৳1.23 L', '৳1 Cr', '−৳2.5 L', '৳0']));
    expect(valueNodes()[2]?.props.className).toContain('text-clay-500');
    expect(cells()[3]?.props.accessibilityLabel).toBe('Avg / tx, ৳0.4');
  });

  it('shows a USD book in K / M / B', async () => {
    useActiveBookStore.setState({ activeBookId: business.id });
    mock.onGet('/books/book-2/table').reply(200, table([1234567.89, 123456, 0, 50]));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()).toEqual(['$1.23M', '$123K', '$0', '$50']));
    expect(cells()[0]?.props.accessibilityLabel).toBe('Income, $1,234,567.89');
  });

  it('keeps four equal cells in one row at the default font size', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([1, 1, 0, 1]));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()).toHaveLength(4));
    expect(screen.getByTestId('ledger-stats').props.className).not.toContain('flex-wrap');
    cells().forEach(cell => expect(cell.props.className).toContain('flex-1 basis-0'));
  });

  it('switches to two rows of two cells at a larger font size', async () => {
    act(() => {
      ReactNative.Dimensions.set({
        window: { width: 360, height: 740, scale: 3, fontScale: 1.3 },
        screen: { width: 360, height: 740, scale: 3, fontScale: 1.3 },
      });
    });
    mock.onGet('/books/book-1/table').reply(200, table([1, 1, 0, 1]));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()).toHaveLength(4));
    expect(screen.getByTestId('ledger-stats').props.className).toContain('flex-wrap');
    cells().forEach((cell) => {
      expect(cell.props.className).toContain('basis-1/2');
      expect(cell.props.className).not.toContain('flex-1');
    });
  });

  it('shows a negative net position with − in clay-500', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([1000, 3500, -2500, 875]));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()[2]).toBe('−৳2,500'));
    expect(valueNodes()[2]?.props.className).toContain('text-clay-500');
  });

  it('shows 0 in every cell for a month with no transactions', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([0, 0, 0, 0]));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()).toEqual(['৳0', '৳0', '৳0', '৳0']));
    const net = valueNodes()[2];
    expect(net?.props.className).not.toContain('text-forest-500');
    expect(net?.props.className).not.toContain('text-clay-500');
    expect(screen.queryByText(/NaN/)).not.toBeOnTheScreen();
  });

  it('shows loading placeholders and never 0 while loading', async () => {
    mock.onGet('/books/book-1/table').reply(() => new Promise(() => {}));
    render(<LedgerStats {...november} />);

    expectPlaceholders();
    await waitFor(() => expect(mock.history.get.some(request => request.url === '/books/book-1/table')).toBe(true));
    expectPlaceholders();
    expect(cells()[2]?.props.accessibilityLabel).toBe('Net position, Loading');
    expect(screen.queryByText('৳0')).not.toBeOnTheScreen();
  });

  it('translates known labels and shows unknown labels as sent', async () => {
    mock.onGet('/books/book-1/table').reply(200, {
      stats: [...table([1, 1, 0, 1]).stats, { label: 'Savings rate', value: 5, delta: '' }],
      rows: [],
    });
    await act(() => i18n.changeLanguage('bn'));
    render(<LedgerStats {...november} />);

    expect(await screen.findByText('Savings rate')).toBeOnTheScreen();
    expect(screen.getByText('আয়')).toBeOnTheScreen();
    expect(screen.getByText('খরচ')).toBeOnTheScreen();
    expect(screen.getByText('নিট')).toBeOnTheScreen();
    expect(screen.getByText('গড়')).toBeOnTheScreen();
    expect(screen.queryByText('নিট অবস্থান')).not.toBeOnTheScreen();
    expect(cells().map(cell => cell.props.accessibilityLabel)).toEqual([
      'আয়, ৳১',
      'খরচ, ৳১',
      'নিট অবস্থান, ৳০',
      'গড় / লেনদেন, ৳১',
      'Savings rate, ৳৫',
    ]);
  });

  it('shows the error state with Retry, and Retry refetches', async () => {
    mock.onGet('/books/book-1/table').replyOnce(500).onGet('/books/book-1/table').reply(200, table([500, 200, 300, 100]));
    render(<LedgerStats {...november} />);

    expect(await screen.findByTestId('ledger-stats-error')).toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-stats')).not.toBeOnTheScreen();

    fireEvent.press(screen.getByText('Retry'));

    await waitFor(() => expect(values()).toEqual(['৳500', '৳200', '+৳300', '৳100']));
    expect(screen.queryByTestId('ledger-stats-error')).not.toBeOnTheScreen();
  });

  it('keeps the strip when a later refetch fails', async () => {
    mock.onGet('/books/book-1/table').replyOnce(200, table([500, 200, 300, 100])).onGet('/books/book-1/table').reply(500);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <LedgerStats {...november} />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(values()).toEqual(['৳500', '৳200', '+৳300', '৳100']));

    await act(() => client.refetchQueries({ queryKey: ['books', 'book-1', 'table'] }));

    expect(values()).toEqual(['৳500', '৳200', '+৳300', '৳100']);
    expect(screen.queryByTestId('ledger-stats-error')).not.toBeOnTheScreen();
  });

  it('shows placeholders, not the previous month values, when the month changes', async () => {
    let resolveOctober: (value: [number, BookTable]) => void = () => {};
    mock.onGet('/books/book-1/table', { params: { fromDate: '2026-11-01', toDate: '2026-11-30' } }).reply(200, table([900, 400, 500, 80]));
    mock.onGet('/books/book-1/table', { params: { fromDate: '2026-10-01', toDate: '2026-10-31' } }).reply(
      () => new Promise((resolve) => {
        resolveOctober = resolve;
      }),
    );
    const view = render(<LedgerStats {...november} />);
    await waitFor(() => expect(values()[0]).toBe('৳900'));

    view.rerender(<LedgerStats {...october} />);

    expectPlaceholders();
    expect(screen.queryByText('৳900')).not.toBeOnTheScreen();

    await waitFor(() => expect(mock.history.get.some(request => request.params?.fromDate === '2026-10-01')).toBe(true));
    await act(async () => resolveOctober([200, table([100, 50, 50, 10])]));
    await waitFor(() => expect(values()).toEqual(['৳100', '৳50', '+৳50', '৳10']));
  });

  it('shows placeholders, then the new book values in its currency, when the book changes', async () => {
    let resolveBusiness: (value: [number, BookTable]) => void = () => {};
    mock.onGet('/books/book-1/table').reply(200, table([900, 400, 500, 80]));
    mock.onGet('/books/book-2/table').reply(
      () => new Promise((resolve) => {
        resolveBusiness = resolve;
      }),
    );
    render(<LedgerStats {...november} />);
    await waitFor(() => expect(values()[0]).toBe('৳900'));

    act(() => useActiveBookStore.setState({ activeBookId: business.id }));

    expectPlaceholders();
    await waitFor(() => expect(mock.history.get.some(request => request.url === '/books/book-2/table')).toBe(true));
    await act(async () => resolveBusiness([200, table([70, 20, -5, 3])]));
    await waitFor(() => expect(values()).toEqual(['$70', '$20', '−$5', '$3']));
  });
});
