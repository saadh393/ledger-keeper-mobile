/* eslint-disable max-lines-per-function */
import type { Book } from '@/features/books/schemas/book-schema';
import type { BookTable, TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { LedgerListItem } from '@/features/ledger/utils/group-rows-by-day';
import type { Month, MonthRange } from '@/features/ledger/utils/month';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { useAuthStore } from '@/features/auth';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { LedgerStats } from '@/features/ledger/components/ledger-stats';
import { LedgerToolbar } from '@/features/ledger/components/ledger-toolbar';
import { TransactionList } from '@/features/ledger/components/transaction-list';
import { useLedgerFiltersStore } from '@/features/ledger/store/use-ledger-filters-store';
import { apiClient } from '@/lib/api/client';
import i18n from '@/lib/i18n';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

const personal: Book = { id: 'book-1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const business: Book = { id: 'book-2', name: 'Business', currency: 'USD', isDefault: false, createdAt: '2026-01-02T00:00:00.000Z' };

const november = { month: { year: 2026, month: 11 }, firstDay: '2026-11-01', lastDay: '2026-11-30' };
const october = { month: { year: 2026, month: 10 }, firstDay: '2026-10-01', lastDay: '2026-10-31' };

function row(overrides: Partial<TransactionRow> & Pick<TransactionRow, 'id'>): TransactionRow {
  return {
    kind: 'expense',
    name: overrides.id,
    subtitle: '',
    category: 'Food',
    dateIso: '2026-11-05T06:00:00.000Z',
    amount: 100,
    note: null,
    original: null,
    merchant: null,
    items: [],
    ...overrides,
  };
}

function table(rows: TransactionRow[]): BookTable {
  return {
    stats: [
      { label: 'Income', value: 50300, delta: '', kind: 'income' },
      { label: 'Expense', value: 1650, delta: '', kind: 'expense' },
      { label: 'Net position', value: 48650, delta: '' },
      { label: 'Avg / tx', value: 12988, delta: '' },
    ],
    rows,
  };
}

const novemberRows = [
  row({ id: 'Lunch', category: 'Food', dateIso: '2026-11-03T06:00:00.000Z', amount: 450 }),
  row({ id: 'Salary', kind: 'income', category: 'Job', merchant: 'Acme Ltd', dateIso: '2026-11-01T06:00:00.000Z', amount: 50000 }),
  row({ id: 'Groceries', category: 'Shopping', note: 'Weekly run', items: [{ id: 'i1', type: 'expense', title: 'Rice', category: null, amount: 900, quantity: 1, note: null }], dateIso: '2026-11-04T06:00:00.000Z', amount: 1200 }),
  row({ id: 'Refund', kind: 'income', category: 'Other', dateIso: '2026-11-02T06:00:00.000Z', amount: 300 }),
];

function listOrder() {
  const [list] = screen.UNSAFE_root.findAll((node: typeof screen.UNSAFE_root) => node.props.testID === 'ledger-list' && Array.isArray(node.props.data));
  return list?.props.data.map((item: LedgerListItem) => (item.type === 'day' ? item.day : item.row.name));
}

function metas() {
  return screen.getAllByTestId('ledger-row-meta').map(node => node.props.children).sort();
}

function rowTitles() {
  return screen.queryAllByTestId('ledger-row-title').map(node => node.props.children).sort();
}

function statValues() {
  return screen.getAllByTestId('stat-tile-value').map(node => node.props.children);
}

function tableRequests(mock: MockAdapter) {
  return mock.history.get.filter(request => request.url?.endsWith('/table')).length;
}

function Ledger({ month, firstDay, lastDay }: MonthRange & { month: Month }) {
  return (
    <>
      <LedgerStats firstDay={firstDay} lastDay={lastDay} />
      <LedgerToolbar />
      <TransactionList month={month} firstDay={firstDay} lastDay={lastDay} />
    </>
  );
}

async function renderLedger(rows = novemberRows) {
  mockRef.current.onGet('/books/book-1/table').reply(200, table(rows));
  const view = render(<Ledger {...november} />);
  await screen.findByText(rows[0]?.name ?? '');
  await waitFor(() => expect(screen.getAllByTestId('stat-tile-value')).toHaveLength(4));
  return view;
}

async function search(text: string) {
  fireEvent.changeText(screen.getByTestId('ledger-search'), text);
}

async function chooseSort(label: string) {
  fireEvent.press(screen.getByTestId('ledger-sort-button'));
  fireEvent.press(await screen.findByRole('radio', { name: label }));
  await waitFor(() => expect(screen.queryByTestId('ledger-sort-option-newest')).not.toBeOnTheScreen());
}

const mockRef: { current: MockAdapter } = { current: undefined as unknown as MockAdapter };

describe('ledger search, filter and sort', () => {
  beforeEach(() => {
    mockRef.current = new MockAdapter(apiClient);
    mockRef.current.onGet('/books').reply(200, { items: [personal, business] });
    useAuthStore.setState({ status: 'signedIn' });
    useActiveBookStore.setState({ activeBookId: personal.id });
  });

  afterEach(async () => {
    mockRef.current.restore();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
      useActiveBookStore.setState({ activeBookId: null });
      useLedgerFiltersStore.setState({ query: '', kind: 'all', sort: 'newest' });
    });
    await act(() => i18n.changeLanguage('en'));
  });

  it('shows a search field, an All / Income / Expense control and a sort button above the list', async () => {
    await renderLedger();

    expect(screen.getByPlaceholderText('Search transactions')).toBeOnTheScreen();
    expect(screen.getAllByRole('tab').map(tab => tab.props.accessibilityLabel)).toEqual(['All', 'Income', 'Expense']);
    expect(screen.getByRole('tab', { name: 'All' }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByRole('button', { name: 'Sort: Newest first' })).toBeOnTheScreen();
  });

  it('updates results about 250 ms after typing stops, not on every keystroke', async () => {
    await renderLedger();

    await search('l');
    await search('lu');
    await search('lun');
    expect(rowTitles()).toHaveLength(4);

    await waitFor(() => expect(rowTitles()).toEqual(['Lunch']));
  });

  it.each([
    ['merchant', 'ACME', ['Salary']],
    ['category', 'shopping', ['Groceries']],
    ['note', 'weekly', ['Groceries']],
    ['receipt item title', 'rice', ['Groceries']],
    ['title with spaces around', '  refund  ', ['Refund']],
  ])('searches the %s', async (_field, text, expected) => {
    await renderLedger();
    await search(text);
    await waitFor(() => expect(rowTitles()).toEqual(expected));
  });

  it('searches Bangla text', async () => {
    await renderLedger([row({ id: 'বাজার', category: 'খাবার' }), row({ id: 'ভাড়া', category: 'বাসা' })]);
    await search('খাবার');
    await waitFor(() => expect(rowTitles()).toEqual(['বাজার']));
  });

  it('shows a clear button only when the search is not empty, and clearing shows every row', async () => {
    await renderLedger();
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeOnTheScreen();

    await search('lunch');
    await waitFor(() => expect(rowTitles()).toEqual(['Lunch']));
    fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));

    expect(screen.getByTestId('ledger-search').props.value).toBe('');
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeOnTheScreen();
    expect(rowTitles()).toHaveLength(4);
  });

  it('shows only income, only expense, or both, combined with search', async () => {
    await renderLedger();

    fireEvent.press(screen.getByRole('tab', { name: 'Income' }));
    expect(rowTitles()).toEqual(['Refund', 'Salary']);
    expect(screen.getByRole('tab', { name: 'Income' }).props.accessibilityState.selected).toBe(true);

    fireEvent.press(screen.getByRole('tab', { name: 'Expense' }));
    expect(rowTitles()).toEqual(['Groceries', 'Lunch']);

    await search('f');
    await waitFor(() => expect(rowTitles()).toEqual(['Lunch']));

    fireEvent.press(screen.getByRole('tab', { name: 'Income' }));
    expect(rowTitles()).toEqual(['Refund']);

    fireEvent.press(screen.getByRole('tab', { name: 'All' }));
    expect(rowTitles()).toEqual(['Lunch', 'Refund']);
  });

  it('lists the sort options with the active one checked', async () => {
    await renderLedger();
    fireEvent.press(screen.getByTestId('ledger-sort-button'));

    expect(await screen.findByTestId('ledger-sort-sheet-title')).toHaveTextContent('Sort');
    const options = screen.getAllByRole('radio');
    expect(options.map(option => option.props.accessibilityLabel)).toEqual(['Newest first', 'Oldest first', 'Highest amount', 'Lowest amount']);
    expect(options.map(option => option.props.accessibilityState.checked)).toEqual([true, false, false, false]);
    expect(screen.getByTestId('ledger-sort-check-newest')).toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-sort-check-oldest')).not.toBeOnTheScreen();
  });

  it('sorts oldest first and keeps day headers', async () => {
    await renderLedger();
    await chooseSort('Oldest first');

    expect(listOrder()).toEqual(['2026-11-01', 'Salary', '2026-11-02', 'Refund', '2026-11-03', 'Lunch', '2026-11-04', 'Groceries']);
    expect(screen.getAllByTestId('ledger-day-header')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Sort: Oldest first' })).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('ledger-sort-button'));
    expect((await screen.findByRole('radio', { name: 'Oldest first' })).props.accessibilityState.checked).toBe(true);
  });

  it('sorts by highest and lowest amount as a flat list with the date in each row', async () => {
    await renderLedger();

    await chooseSort('Highest amount');
    expect(listOrder()).toEqual(['Salary', 'Groceries', 'Lunch', 'Refund']);
    expect(screen.queryAllByTestId('ledger-day-header')).toHaveLength(0);
    expect(metas()).toEqual(['1 Nov · Job', '2 Nov · Other', '3 Nov · Food', '4 Nov · Shopping']);

    await chooseSort('Lowest amount');
    expect(listOrder()).toEqual(['Refund', 'Lunch', 'Groceries', 'Salary']);
    expect(screen.queryAllByTestId('ledger-day-header')).toHaveLength(0);

    await chooseSort('Newest first');
    expect(listOrder()).toEqual(['2026-11-04', 'Groceries', '2026-11-03', 'Lunch', '2026-11-02', 'Refund', '2026-11-01', 'Salary']);
    expect(metas()).toEqual(['Food', 'Job', 'Other', 'Shopping']);
  });

  it('shows "N of M transactions" in the footer only while rows are hidden', async () => {
    await renderLedger();
    expect(screen.queryByTestId('ledger-list-footer-shown')).not.toBeOnTheScreen();

    fireEvent.press(screen.getByRole('tab', { name: 'Income' }));
    expect(screen.getByTestId('ledger-list-footer-shown')).toHaveTextContent('2 of 4 transactions');

    fireEvent.press(screen.getByRole('tab', { name: 'All' }));
    await search('lunch');
    await waitFor(() => expect(screen.getByTestId('ledger-list-footer-shown')).toHaveTextContent('1 of 4 transactions'));

    await chooseSort('Highest amount');
    await search('');
    expect(screen.queryByTestId('ledger-list-footer-shown')).not.toBeOnTheScreen();
  });

  it('shows the filtered count in Bangla', async () => {
    await act(() => i18n.changeLanguage('bn'));
    await renderLedger();

    expect(screen.getByPlaceholderText('লেনদেন খুঁজুন')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('tab', { name: 'আয়' }));
    expect(screen.getByTestId('ledger-list-footer-shown')).toHaveTextContent('৪টির মধ্যে ২টি লেনদেন');
  });

  it('keeps the stat tiles on the whole month while searching and filtering', async () => {
    await renderLedger();
    const before = statValues();

    fireEvent.press(screen.getByRole('tab', { name: 'Expense' }));
    await search('lunch');
    await waitFor(() => expect(rowTitles()).toEqual(['Lunch']));

    expect(statValues()).toEqual(before);
    expect(screen.getByTestId('ledger-list-footer-income')).toHaveTextContent('Income৳50,300');
  });

  it('shows "No matching transactions" and Clear filters resets search and filter but not sort', async () => {
    await renderLedger();
    await chooseSort('Lowest amount');
    fireEvent.press(screen.getByRole('tab', { name: 'Income' }));
    await search('lunch');

    expect(await screen.findByText('No matching transactions')).toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-list-empty')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-list-footer')).not.toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Clear filters' }));

    expect(screen.queryByText('No matching transactions')).not.toBeOnTheScreen();
    expect(listOrder()).toEqual(['Refund', 'Lunch', 'Groceries', 'Salary']);
    expect(screen.getByTestId('ledger-search').props.value).toBe('');
    expect(screen.getByRole('tab', { name: 'All' }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByRole('button', { name: 'Sort: Lowest amount' })).toBeOnTheScreen();
  });

  it('keeps the month empty state when the month has no rows at all', async () => {
    mockRef.current.onGet('/books/book-1/table').reply(200, table([]));
    act(() => useLedgerFiltersStore.setState({ kind: 'income' }));
    render(<Ledger {...november} />);

    expect(await screen.findByText('No transactions in November 2026')).toBeOnTheScreen();
    await waitFor(() => expect(screen.getAllByTestId('stat-tile-value')).toHaveLength(4));
    expect(screen.queryByText('No matching transactions')).not.toBeOnTheScreen();
  });

  it('keeps search, filter and sort when the month changes', async () => {
    mockRef.current.onGet('/books/book-1/table', { params: { fromDate: '2026-10-01', toDate: '2026-10-31' } }).reply(200, table([
      row({ id: 'October bus', dateIso: '2026-10-03T06:00:00.000Z', amount: 50 }),
      row({ id: 'October bonus', kind: 'income', dateIso: '2026-10-04T06:00:00.000Z', amount: 900 }),
      row({ id: 'October bus pass', dateIso: '2026-10-05T06:00:00.000Z', amount: 500 }),
    ]));
    const view = await renderLedger();
    fireEvent.press(screen.getByRole('tab', { name: 'Expense' }));
    await chooseSort('Highest amount');
    await search('bus');

    view.rerender(<Ledger {...october} />);

    await waitFor(() => expect(listOrder()).toEqual(['October bus pass', 'October bus']));
    expect(screen.getByTestId('ledger-search').props.value).toBe('bus');
    expect(screen.getByRole('tab', { name: 'Expense' }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByRole('button', { name: 'Sort: Highest amount' })).toBeOnTheScreen();
  });

  it('keeps search, filter and sort when the book changes', async () => {
    mockRef.current.onGet('/books/book-2/table').reply(200, table([
      row({ id: 'Client lunch', amount: 12.5 }),
      row({ id: 'Invoice', kind: 'income', amount: 900 }),
    ]));
    await renderLedger();
    fireEvent.press(screen.getByRole('tab', { name: 'Expense' }));
    await search('lunch');
    await waitFor(() => expect(rowTitles()).toEqual(['Lunch']));

    act(() => useActiveBookStore.setState({ activeBookId: business.id }));

    expect(await screen.findByText('Client lunch')).toBeOnTheScreen();
    await waitFor(() => expect(screen.getAllByTestId('stat-tile-value')).toHaveLength(4));
    expect(rowTitles()).toEqual(['Client lunch']);
    expect(screen.getByTestId('ledger-search').props.value).toBe('lunch');
  });

  it('makes no network request when typing, filtering or sorting', async () => {
    await renderLedger();
    const before = tableRequests(mockRef.current);
    const all = mockRef.current.history.get.length;

    await search('lu');
    await search('lunch');
    await waitFor(() => expect(rowTitles()).toEqual(['Lunch']));
    fireEvent.press(screen.getByRole('tab', { name: 'Income' }));
    fireEvent.press(screen.getByRole('tab', { name: 'All' }));
    await chooseSort('Highest amount');
    fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));

    expect(tableRequests(mockRef.current)).toBe(before);
    expect(mockRef.current.history.get).toHaveLength(all);
  });
});
