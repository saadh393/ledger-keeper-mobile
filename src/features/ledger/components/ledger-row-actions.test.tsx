import type { Book } from '@/features/books/schemas/book-schema';
import type { BookTable, TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import MockAdapter from 'axios-mock-adapter';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';
import { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useAuthStore } from '@/features/auth';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { TransactionList } from '@/features/ledger/components/transaction-list';
import { apiClient } from '@/lib/api/client';
import i18n from '@/lib/i18n';
import { act, fireEvent, render, screen, waitFor, within } from '@/lib/test-utils';

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 24, bottom: 34, left: 0, right: 0 })),
}));

jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));

const personal: Book = { id: 'book-1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const november = { month: { year: 2026, month: 11 }, firstDay: '2026-11-01', lastDay: '2026-11-30' };
const tableUrl = '/books/book-1/table';

function row(overrides: Partial<TransactionRow> & Pick<TransactionRow, 'id'>): TransactionRow {
  return {
    kind: 'expense',
    name: overrides.id,
    subtitle: 'Food',
    category: 'Food',
    dateIso: '2026-11-03T06:30:00.000Z',
    amount: 250,
    note: null,
    original: null,
    merchant: null,
    items: [],
    ...overrides,
  };
}

const receipt = row({
  id: 'Shwapno',
  category: 'Groceries',
  amount: 1150,
  merchant: 'Shwapno',
  items: [
    { id: 'vat', type: 'adjustment', title: 'VAT', category: null, amount: 50, quantity: null, note: null },
    { id: 'rice', type: 'item', title: 'Rice', category: 'Groceries', amount: 800, quantity: 2, note: null },
    { id: 'soap', type: 'item', title: 'Soap', category: 'Household', amount: 300, quantity: null, note: null },
  ],
});

function table(rows: TransactionRow[]): BookTable {
  return { stats: [{ label: 'Expense', value: rows.reduce((sum, item) => sum + item.amount, 0), delta: '', kind: 'expense' }], rows };
}

function rowNamed(name: string) {
  return screen.getAllByTestId('ledger-row').find(node => within(node).queryByText(name))!;
}

function setupLedgerApi() {
  const api: { mock: MockAdapter } = { mock: undefined as unknown as MockAdapter };

  beforeEach(() => {
    api.mock = new MockAdapter(apiClient);
    api.mock.onGet('/books').reply(200, { items: [personal] });
    useAuthStore.setState({ status: 'signedIn' });
    useActiveBookStore.setState({ activeBookId: personal.id });
    jest.clearAllMocks();
  });

  afterEach(async () => {
    api.mock.restore();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
      useActiveBookStore.setState({ activeBookId: null });
    });
    await act(() => i18n.changeLanguage('en'));
  });

  return api;
}

function openDeleteSheet(name: string) {
  fireEvent(rowNamed(name), 'accessibilityAction', { nativeEvent: { actionName: 'delete' } });
  fireEvent.press(screen.getByTestId('ledger-delete-sheet-confirm'));
}

describe('ledger row details', () => {
  const api = setupLedgerApi();

  it('expands a row on tap, collapses it on a second tap, and keeps only one row open', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Lunch', note: 'With team' }), row({ id: 'Bus', category: 'Transport' })]));
    render(<TransactionList {...november} />);

    fireEvent.press(await screen.findByText('Lunch'));
    expect(screen.getByTestId('ledger-row-detail-note')).toHaveTextContent('NoteWith team');
    expect(rowNamed('Lunch').props.accessibilityState).toEqual(expect.objectContaining({ expanded: true }));

    fireEvent.press(screen.getByText('Bus'));
    expect(screen.getAllByTestId('ledger-row-details')).toHaveLength(1);
    expect(screen.queryByTestId('ledger-row-detail-note')).not.toBeOnTheScreen();
    expect(screen.getByTestId('ledger-row-detail-category')).toHaveTextContent('CategoryTransport');

    fireEvent.press(screen.getByText('Bus'));
    expect(screen.queryByTestId('ledger-row-details')).not.toBeOnTheScreen();
  });

  it('shows category, Dhaka date and time, note, merchant and the original amount', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Coffee', note: 'Two cups', merchant: 'Starbucks', original: { amount: 12, currency: 'USD', rate: 121.5 } })]));
    render(<TransactionList {...november} />);

    fireEvent.press(await screen.findByText('Coffee'));

    expect(screen.getByTestId('ledger-row-detail-category')).toHaveTextContent('CategoryFood');
    expect(screen.getByTestId('ledger-row-detail-date')).toHaveTextContent('Date3 Nov 2026 · 12:30 PM');
    expect(screen.getByTestId('ledger-row-detail-note')).toHaveTextContent('NoteTwo cups');
    expect(screen.getByTestId('ledger-row-detail-merchant')).toHaveTextContent('MerchantStarbucks');
    expect(screen.getByTestId('ledger-row-detail-original')).toHaveTextContent('Original amount$12 at 121.5');
  });

  it('hides empty fields', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Lunch' })]));
    render(<TransactionList {...november} />);

    fireEvent.press(await screen.findByText('Lunch'));

    expect(screen.getByTestId('ledger-row-detail-category')).toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-row-detail-note')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-row-detail-merchant')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-row-detail-original')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('ledger-row-items')).not.toBeOnTheScreen();
    expect(screen.queryByText(/—/)).not.toBeOnTheScreen();
  });

  it('lists receipt items with the adjustment last so the lines add up to the total', async () => {
    api.mock.onGet(tableUrl).reply(200, table([receipt, row({ id: 'Refund', amount: 100 })]));
    render(<TransactionList {...november} />);

    fireEvent.press(await screen.findByText('Shwapno'));

    expect(screen.getAllByTestId('ledger-receipt-item-title').map(node => node.props.children)).toEqual(['Rice', 'Soap', 'VAT']);
    expect(screen.getAllByTestId('ledger-receipt-item-meta').map(node => node.props.children)).toEqual(['Groceries · × 2', 'Household']);
    expect(screen.getAllByTestId('ledger-receipt-item-amount').map(node => node.props.children)).toEqual(['৳800', '৳300', '৳50']);
    expect(screen.getByTestId('ledger-row-items-total')).toHaveTextContent('Total৳1,150');
  });

  it('shows a negative adjustment with a minus sign', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Aarong', amount: 900, items: [
      { id: 'shirt', type: 'item', title: 'Shirt', category: 'Clothing', amount: 1000, quantity: null, note: null },
      { id: 'discount', type: 'adjustment', title: 'Discount', category: null, amount: -100, quantity: null, note: null },
    ] })]));
    render(<TransactionList {...november} />);

    fireEvent.press(await screen.findByText('Aarong'));

    expect(screen.getAllByTestId('ledger-receipt-item-amount').map(node => node.props.children)).toEqual(['৳1,000', '−৳100']);
    expect(screen.getByTestId('ledger-row-items-total')).toHaveTextContent('Total৳900');
  });

  it('animates the details over 120 ms, and not at all with animations removed', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Lunch' })]));
    render(<TransactionList {...november} />);

    fireEvent.press(await screen.findByText('Lunch'));
    expect(FadeIn.duration).toHaveBeenCalledWith(120);

    fireEvent.press(screen.getByText('Lunch'));
    jest.mocked(FadeIn.duration).mockClear();
    jest.mocked(useReducedMotion).mockReturnValue(true);
    fireEvent.press(screen.getByText('Lunch'));
    expect(screen.getByTestId('ledger-row-details')).toBeOnTheScreen();
    expect(FadeIn.duration).not.toHaveBeenCalled();
    jest.mocked(useReducedMotion).mockReturnValue(false);
  });
});

describe('ledger row actions', () => {
  const api = setupLedgerApi();

  it('opens Copy and Delete on a 450 ms long-press with a haptic tap', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Lunch' })]));
    render(<TransactionList {...november} />);

    await screen.findByText('Lunch');
    expect(screen.UNSAFE_getByProps({ testID: 'ledger-row', delayLongPress: 450 })).toBeTruthy();
    fireEvent(rowNamed('Lunch'), 'longPress');

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(screen.getByTestId('ledger-row-menu-copy')).toHaveTextContent('Copy');
    expect(screen.getByTestId('ledger-row-menu-delete-label').props.className).toContain('text-clay-500');
    expect(screen.queryByText('Edit')).not.toBeOnTheScreen();
  });

  it('exposes Copy and Delete as screen reader actions on the row', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Lunch' })]));
    render(<TransactionList {...november} />);

    await screen.findByText('Lunch');
    const lunch = rowNamed('Lunch');
    expect(lunch.props.accessibilityActions.map((action: { label: string }) => action.label)).toEqual(['Show details', 'Transaction actions', 'Copy', 'Delete']);

    fireEvent(lunch, 'accessibilityAction', { nativeEvent: { actionName: 'copy' } });
    await waitFor(() => expect(showMessage).toHaveBeenCalled());
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Lunch · −৳250 · 3 Nov 2026');

    fireEvent(lunch, 'accessibilityAction', { nativeEvent: { actionName: 'delete' } });
    expect(screen.getByTestId('ledger-delete-sheet-title')).toHaveTextContent('Delete this transaction?');
  });

  it('copies the title, signed amount and date in the app language and shows Copied', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Lunch' })]));
    await act(() => i18n.changeLanguage('bn'));
    render(<TransactionList {...november} />);

    fireEvent(rowNamed(await screen.findByText('Lunch').then(() => 'Lunch')), 'longPress');
    fireEvent.press(screen.getByTestId('ledger-row-menu-copy'));

    await waitFor(() => expect(showMessage).toHaveBeenCalled());
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Lunch · −৳২৫০ · ৩ নভে ২০২৬');
    expect(showMessage).toHaveBeenCalledWith(expect.objectContaining({ message: 'কপি হয়েছে' }));
  });
});

describe('ledger row delete', () => {
  const api = setupLedgerApi();

  it('confirms and deletes the transaction, then removes the row and refreshes the totals', async () => {
    api.mock.onGet(tableUrl).replyOnce(200, table([row({ id: 'Lunch' }), row({ id: 'Bus' })])).onGet(tableUrl).reply(200, table([row({ id: 'Bus' })]));
    api.mock.onDelete('/books/book-1/transactions/Lunch').reply(204);
    render(<TransactionList {...november} />);

    fireEvent(rowNamed(await screen.findByText('Lunch').then(() => 'Lunch')), 'longPress');
    fireEvent.press(screen.getByTestId('ledger-row-menu-delete'));

    expect(screen.getByTestId('ledger-delete-sheet-summary')).toHaveTextContent('Lunch · − ৳250');
    expect(screen.getByTestId('ledger-delete-sheet-body')).toHaveTextContent('This can’t be undone.');
    fireEvent.press(screen.getByTestId('ledger-delete-sheet-confirm'));

    await waitFor(() => expect(screen.queryByText('Lunch')).not.toBeOnTheScreen());
    expect(api.mock.history.delete).toHaveLength(1);
    await waitFor(() => expect(api.mock.history.get.filter(request => request.url === tableUrl)).toHaveLength(2));
    expect(screen.getByTestId('ledger-list-footer-count')).toHaveTextContent('Transactions1');
    expect(screen.queryByTestId('ledger-delete-sheet')).not.toBeOnTheScreen();
  });

  it('says the items are deleted too for an itemised receipt', async () => {
    api.mock.onGet(tableUrl).reply(200, table([receipt]));
    render(<TransactionList {...november} />);

    await screen.findByText('Shwapno');
    fireEvent(rowNamed('Shwapno'), 'accessibilityAction', { nativeEvent: { actionName: 'delete' } });

    expect(screen.getByTestId('ledger-delete-sheet-body')).toHaveTextContent('This can’t be undone. Its items are deleted too.');
  });

  it('shows Deleting… and sends one request on repeat taps', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Lunch' })]));
    let finish: (value: [number]) => void = () => {};
    api.mock.onDelete('/books/book-1/transactions/Lunch').reply(() => new Promise((resolve) => {
      finish = resolve;
    }));
    render(<TransactionList {...november} />);

    await screen.findByText('Lunch');
    fireEvent(rowNamed('Lunch'), 'accessibilityAction', { nativeEvent: { actionName: 'delete' } });
    const confirm = screen.getByTestId('ledger-delete-sheet-confirm');
    fireEvent.press(confirm);
    fireEvent.press(confirm);
    fireEvent.press(confirm);

    expect(await screen.findByText('Deleting…')).toBeOnTheScreen();
    await waitFor(() => expect(api.mock.history.delete).toHaveLength(1));
    await act(async () => finish([204]));
    await waitFor(() => expect(screen.queryByTestId('ledger-delete-sheet')).not.toBeOnTheScreen());
    expect(api.mock.history.delete).toHaveLength(1);
  });
});

describe('ledger row delete failures', () => {
  const api = setupLedgerApi();

  it('removes the row without an error when the transaction is already gone', async () => {
    api.mock.onGet(tableUrl).replyOnce(200, table([row({ id: 'Lunch' })])).onGet(tableUrl).reply(200, table([]));
    api.mock.onDelete('/books/book-1/transactions/Lunch').reply(404, { code: 'transaction_not_found', message: 'Transaction not found' });
    render(<TransactionList {...november} />);

    await screen.findByText('Lunch');
    openDeleteSheet('Lunch');

    await waitFor(() => expect(screen.queryByText('Lunch')).not.toBeOnTheScreen());
    await waitFor(() => expect(api.mock.history.get.filter(request => request.url === tableUrl)).toHaveLength(2));
    expect(screen.queryByTestId('ledger-delete-sheet-error')).not.toBeOnTheScreen();
    expect(showMessage).not.toHaveBeenCalled();
  });

  it('keeps the row and offers a retry on a 404 without transaction_not_found', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Lunch' })]));
    api.mock.onDelete('/books/book-1/transactions/Lunch').replyOnce(404, { message: 'Route not found' }).onDelete('/books/book-1/transactions/Lunch').reply(204);
    render(<TransactionList {...november} />);

    await screen.findByText('Lunch');
    openDeleteSheet('Lunch');

    expect(await screen.findByTestId('ledger-delete-sheet-error')).toHaveTextContent('Could not delete. Try again.');
    expect(rowNamed('Lunch')).toBeOnTheScreen();
    expect(screen.getByTestId('ledger-delete-sheet-confirm')).toHaveTextContent('Delete');

    fireEvent.press(screen.getByTestId('ledger-delete-sheet-confirm'));
    await waitFor(() => expect(screen.queryByTestId('ledger-delete-sheet')).not.toBeOnTheScreen());
    expect(api.mock.history.delete).toHaveLength(2);
  });

  it('keeps the row and shows an error when the server fails', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Lunch' })]));
    api.mock.onDelete('/books/book-1/transactions/Lunch').reply(500);
    render(<TransactionList {...november} />);

    await screen.findByText('Lunch');
    openDeleteSheet('Lunch');

    expect(await screen.findByTestId('ledger-delete-sheet-error')).toHaveTextContent('Could not delete. Try again.');
    expect(screen.getAllByText('Lunch').length).toBeGreaterThan(0);
    expect(screen.getByTestId('ledger-delete-sheet-confirm')).toHaveTextContent('Delete');
  });

  it('keeps the row and shows an offline message when there is no connection', async () => {
    api.mock.onGet(tableUrl).reply(200, table([row({ id: 'Lunch' })]));
    api.mock.onDelete('/books/book-1/transactions/Lunch').networkError();
    render(<TransactionList {...november} />);

    await screen.findByText('Lunch');
    openDeleteSheet('Lunch');

    expect(await screen.findByTestId('ledger-delete-sheet-error')).toHaveTextContent('You’re offline. Try again when you’re connected.');
    expect(rowNamed('Lunch')).toBeOnTheScreen();
  });
});
