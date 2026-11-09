/* eslint-disable max-lines-per-function */
import type { Book } from '@/features/books/schemas/book-schema';
import type { BookTable } from '@/features/ledger/schemas/book-table-schema';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { useAuthStore } from '@/features/auth';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { LedgerStats } from '@/features/ledger/components/ledger-stats';
import { apiClient } from '@/lib/api/client';
import i18n from '@/lib/i18n';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

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

function tiles() {
  return screen.getAllByTestId('ledger-stat-tile');
}

function values() {
  return screen.getAllByTestId('stat-tile-value').map(value => value.props.children);
}

function expectPlaceholders() {
  expect(tiles()).toHaveLength(4);
  expect(screen.getAllByTestId('stat-tile-placeholder')).toHaveLength(4);
  expect(screen.queryAllByTestId('stat-tile-value')).toHaveLength(0);
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
      useAuthStore.setState({ status: 'idle' });
      useActiveBookStore.setState({ activeBookId: null });
    });
    await act(() => i18n.changeLanguage('en'));
  });

  it('renders the four tiles from the server stats for the active book and month', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([25000, 18000, 7000, 1500]));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()).toEqual(['৳25,000', '৳18,000', '+ ৳7,000', '৳1,500']));
    expect(tiles().map(tile => tile.props.accessibilityLabel)).toEqual([
      'Income: ৳25,000',
      'Expense: ৳18,000',
      'Net position: + ৳7,000',
      'Avg / tx: ৳1,500',
    ]);
    expect(mock.history.get.find(request => request.url === '/books/book-1/table')?.params).toEqual({ fromDate: '2026-11-01', toDate: '2026-11-30' });

    const dots = screen.getAllByTestId('stat-tile-dot', { includeHiddenElements: true });
    expect(dots[0]?.props.className).toContain('bg-forest-500');
    expect(dots[1]?.props.className).toContain('bg-clay-500');
    expect(screen.getAllByTestId('stat-tile-value')[2]?.props.className).toContain('text-forest-500');
  });

  it('uses tabular figures and lets large values wrap or shrink', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([12345678, 12345678, 0, 12345678]));
    await act(() => i18n.changeLanguage('bn'));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()[0]).toBe('৳১,২৩,৪৫,৬৭৮'));
    screen.getAllByTestId('stat-tile-value').forEach((value) => {
      expect(value.props.style).toEqual(expect.objectContaining({ fontVariant: ['tabular-nums'] }));
      expect(value.props.adjustsFontSizeToFit).toBe(true);
      expect(value.props.numberOfLines).toBe(2);
    });
    tiles().forEach(tile => expect(tile.props.className).toContain('min-w-[40%]'));
  });

  it('shows a negative net position with − in clay-500', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([1000, 3500, -2500, 875]));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()[2]).toBe('− ৳2,500'));
    expect(screen.getAllByTestId('stat-tile-value')[2]?.props.className).toContain('text-clay-500');
  });

  it('shows 0 in every tile for a month with no transactions', async () => {
    mock.onGet('/books/book-1/table').reply(200, table([0, 0, 0, 0]));
    render(<LedgerStats {...november} />);

    await waitFor(() => expect(values()).toEqual(['৳0', '৳0', '৳0', '৳0']));
    const net = screen.getAllByTestId('stat-tile-value')[2];
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
    expect(screen.getByText('নিট অবস্থান')).toBeOnTheScreen();
    expect(screen.getByText('গড় / লেনদেন')).toBeOnTheScreen();
  });

  it('shows the error state with Retry, and Retry refetches', async () => {
    mock.onGet('/books/book-1/table').replyOnce(500).onGet('/books/book-1/table').reply(200, table([500, 200, 300, 100]));
    render(<LedgerStats {...november} />);

    expect(await screen.findByTestId('ledger-stats-error')).toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-stats')).not.toBeOnTheScreen();

    fireEvent.press(screen.getByText('Retry'));

    await waitFor(() => expect(values()).toEqual(['৳500', '৳200', '+ ৳300', '৳100']));
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
    await waitFor(() => expect(values()).toEqual(['৳100', '৳50', '+ ৳50', '৳10']));
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
    await waitFor(() => expect(values()).toEqual(['$70', '$20', '− $5', '$3']));
  });
});
