/* eslint-disable max-lines-per-function */
import type { Book } from '@/features/books/schemas/book-schema';
import type { Debt, DebtPage } from '@/features/loans/schemas/debt-schema';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { useAuthStore } from '@/features/auth';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { LoansScreen } from '@/features/loans/components/loans-screen';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn(() => ({ top: 24, bottom: 34, left: 0, right: 0 })),
}));

jest.mock('react-native-flash-message', () => ({ showMessage: jest.fn() }));

const personal: Book = { id: 'book-1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const business: Book = { id: 'book-2', name: 'Business', currency: 'USD', isDefault: false, createdAt: '2026-01-02T00:00:00.000Z' };

function debt(overrides: Partial<Debt> & Pick<Debt, 'id'>): Debt {
  return {
    direction: 'lent',
    counterparty: overrides.id,
    amount: 1000,
    repaid: 0,
    outstanding: 1000,
    currency: 'BDT',
    note: null,
    dateIso: '2026-11-01T06:00:00.000Z',
    dueDateIso: null,
    status: 'open',
    ...overrides,
  };
}

function page(items: Debt[], extra: Partial<DebtPage> = {}): DebtPage {
  return { items, total: items.length, page: 1, pageSize: 20, totals: { lent: 1500, borrowed: 400 }, ...extra };
}

const rahim = debt({ id: 'rahim', counterparty: 'Rahim', amount: 1000, repaid: 400, outstanding: 600, note: 'For rent', dueDateIso: '2020-01-01T06:00:00.000Z' });
const karim = debt({ id: 'karim', counterparty: 'Karim', direction: 'borrowed', amount: 400, outstanding: 400 });
const settled = debt({ id: 'salma', counterparty: 'Salma', repaid: 1000, outstanding: 0, status: 'settled' });

describe('loansScreen', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    mock.onGet('/books').reply(200, { items: [personal, business] });
    useAuthStore.setState({ status: 'signedIn' });
    useActiveBookStore.setState({ activeBookId: personal.id });
  });

  afterEach(() => {
    mock.restore();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
      useActiveBookStore.setState({ activeBookId: null });
    });
  });

  function replyList(handler: (status: string, pageNumber: number) => DebtPage) {
    mock.onGet('/books/book-1/debts').reply(config => [200, handler(config.params.status, config.params.page)]);
  }

  it('shows totals and open loans with outstanding, original, due and overdue', async () => {
    replyList(() => page([rahim, karim]));
    render(<LoansScreen />);
    expect(await screen.findByText('Rahim')).toBeOnTheScreen();
    expect(screen.getByTestId('loans-total-lent')).toHaveTextContent('Owed to you৳1,500');
    expect(screen.getByTestId('loans-total-borrowed')).toHaveTextContent('You owe৳400');
    expect(screen.getByTestId('loans-status-open')).toBeSelected();
    expect(screen.getByTestId('loan-row-rahim')).toHaveTextContent(/৳600.*of ৳1,000/);
    expect(screen.getByTestId('loan-row-rahim')).toHaveTextContent(/Overdue/);
    expect(screen.getByTestId('loan-row-karim')).toHaveTextContent(/Borrowed/);
    expect(mock.history.get.find(r => r.url === '/books/book-1/debts')?.params).toEqual({ status: 'open', page: 1, pageSize: 20 });
  });

  it('loads each tab and shows its empty state', async () => {
    replyList(status => (status === 'settled' ? page([settled]) : page([])));
    render(<LoansScreen />);
    expect(await screen.findByText('No open loans')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('loans-status-settled'));
    expect(await screen.findByTestId('loan-row-salma')).toHaveTextContent(/Settled/);
    expect(screen.getByTestId('loan-row-salma')).not.toHaveTextContent(/of ৳/);
    fireEvent.press(screen.getByTestId('loans-status-all'));
    expect(await screen.findByText('No loans yet')).toBeOnTheScreen();
  });

  it('shows an error with Retry', async () => {
    mock.onGet('/books/book-1/debts').replyOnce(500).onGet('/books/book-1/debts').reply(200, page([rahim]));
    render(<LoansScreen />);
    fireEvent.press(await screen.findByText('Retry'));
    expect(await screen.findByText('Rahim')).toBeOnTheScreen();
  });

  it('loads the next page at the end of the list', async () => {
    const first = Array.from({ length: 20 }, (_, i) => debt({ id: `p1-${i}` }));
    replyList((_status, n) => (n === 1 ? page(first, { total: 21 }) : page([debt({ id: 'p2-0', counterparty: 'Last' })], { total: 21, page: 2 })));
    render(<LoansScreen />);
    await screen.findByTestId('loan-row-p1-0');
    fireEvent(screen.getByTestId('loan-list'), 'onEndReached');
    expect(await screen.findByText('Last')).toBeOnTheScreen();
  });

  it('expands a row with the note and repayments newest first', async () => {
    replyList(() => page([rahim]));
    mock.onGet('/books/book-1/debts/rahim').reply(200, { ...rahim, repayments: [
      { id: 'r1', amount: 100, dateIso: '2026-11-02T06:00:00.000Z' },
      { id: 'r2', amount: 300, dateIso: '2026-11-05T06:00:00.000Z' },
    ] });
    render(<LoansScreen />);
    fireEvent.press(await screen.findByTestId('loan-row-rahim'));
    expect(await screen.findByTestId('loan-repayment-r2')).toBeOnTheScreen();
    expect(screen.getByTestId('loan-row-note')).toHaveTextContent('For rent');
    expect(screen.getAllByTestId(/^loan-repayment-r\d$/).map(node => node.props.testID)).toEqual(['loan-repayment-r2', 'loan-repayment-r1']);
  });

  it('adds a loan and refreshes the list', async () => {
    replyList(() => page([]));
    mock.onPost('/books/book-1/debts').reply(201, rahim);
    render(<LoansScreen />);
    await screen.findByText('No open loans');
    fireEvent.press(screen.getByTestId('loans-add'));
    fireEvent.changeText(await screen.findByTestId('loan-form-person'), ' Rahim ');
    fireEvent.changeText(screen.getByTestId('loan-form-amount'), '১০০০');
    fireEvent.press(screen.getByTestId('loan-form-submit'));
    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]!.data)).toMatchObject({ direction: 'lent', counterparty: 'Rahim', amount: 1000, dueDateIso: null, note: null });
    await waitFor(() => expect(mock.history.get.filter(r => r.url === '/books/book-1/debts').length).toBeGreaterThan(1));
  });

  it('records a repayment and shows the server limit', async () => {
    replyList(() => page([rahim]));
    mock.onGet('/books/book-1/debts/rahim').reply(200, { ...rahim, repayments: [] });
    mock.onPost('/books/book-1/debts/rahim/repayments').reply(422, { message: 'Too much', data: { code: 'repayment_exceeds_debt', outstanding: 500 } });
    render(<LoansScreen />);
    fireEvent.press(await screen.findByTestId('loan-row-rahim'));
    fireEvent.press(await screen.findByTestId('loan-row-repay'));
    expect(await screen.findByTestId('repayment-form-amount')).toHaveDisplayValue('600');
    fireEvent.press(screen.getByTestId('repayment-form-submit'));
    expect(await screen.findByText('Only ৳500 is outstanding')).toBeOnTheScreen();
  });

  it('deletes a loan after confirmation', async () => {
    replyList(() => page([rahim]));
    mock.onGet('/books/book-1/debts/rahim').reply(200, { ...rahim, repayments: [] });
    mock.onDelete('/books/book-1/debts/rahim').reply(204);
    render(<LoansScreen />);
    fireEvent.press(await screen.findByTestId('loan-row-rahim'));
    fireEvent.press(await screen.findByTestId('loan-row-delete'));
    expect(await screen.findByText('Delete this loan and its repayment history?')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('loan-delete-sheet-confirm'));
    await waitFor(() => expect(mock.history.delete).toHaveLength(1));
  });

  it('undoes a repayment after confirmation', async () => {
    replyList(() => page([rahim]));
    mock.onGet('/books/book-1/debts/rahim').reply(200, { ...rahim, repayments: [{ id: 'r1', amount: 400, dateIso: '2026-11-02T06:00:00.000Z' }] });
    mock.onDelete('/books/book-1/debts/rahim/repayments/r1').reply(200, { ...rahim, repaid: 0, outstanding: 1000 });
    render(<LoansScreen />);
    fireEvent.press(await screen.findByTestId('loan-row-rahim'));
    fireEvent.press(await screen.findByTestId('loan-repayment-r1-undo'));
    fireEvent.press(await screen.findByTestId('repayment-undo-sheet-confirm'));
    await waitFor(() => expect(mock.history.delete[0]?.url).toBe('/books/book-1/debts/rahim/repayments/r1'));
  });

  it('reloads for the new book when the book changes', async () => {
    replyList(() => page([rahim]));
    mock.onGet('/books/book-2/debts').reply(200, page([karim]));
    render(<LoansScreen />);
    await screen.findByText('Rahim');
    act(() => useActiveBookStore.setState({ activeBookId: business.id }));
    expect(await screen.findByText('Karim')).toBeOnTheScreen();
    expect(screen.queryByText('Rahim')).toBeNull();
  });
});
