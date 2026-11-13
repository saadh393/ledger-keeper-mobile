import type { Book } from '@/features/books/schemas/book-schema';
import type { Installment } from '@/features/installments/schemas/installment-schema';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { useAuthStore } from '@/features/auth';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { InstallmentsScreen } from '@/features/installments/components/installments-screen';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

jest.mock('react-native-flash-message', () => ({ showMessage: jest.fn() }));

const personal: Book = { id: 'book-1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' };
const url = '/books/book-1/installments';

function plan(overrides: Partial<Installment> & Pick<Installment, 'id'>): Installment {
  return { title: overrides.id, category: 'Gadgets', amount: 5000, totalCount: 12, paidCount: 3, remainingAmount: 45000, currency: 'BDT', status: 'active', ...overrides };
}

const phone = plan({ id: 'phone', title: 'Phone EMI' });
const bike = plan({ id: 'bike', title: 'Bike', amount: 1000, totalCount: 10, paidCount: 9, remainingAmount: 1000 });
const done = plan({ id: 'done', title: 'Insurance', paidCount: 12, remainingAmount: 0, status: 'completed' });

describe('installmentsScreen', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    mock.onGet('/books').reply(200, { items: [personal] });
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

  function replyByStatus(lists: Record<string, Installment[]>) {
    mock.onGet(url).reply(config => [200, { items: lists[config.params.status] ?? [] }]);
  }

  it('shows active plans with progress and the remaining total', async () => {
    replyByStatus({ active: [phone, bike] });
    render(<InstallmentsScreen />);
    expect(await screen.findByTestId('installment-row-phone')).toHaveTextContent(/Phone EMI.*Gadgets · ৳5,000 each.*3 of 12 paid.*৳45,000 remaining/);
    expect(screen.getByTestId('installments-status-active')).toBeSelected();
    await waitFor(() => expect(screen.getByTestId('installments-remaining-total')).toHaveTextContent(/৳46,000/));
    expect(screen.getAllByTestId('installment-summary-progress')[0]).toHaveStyle({ width: '25%' });
  });

  it('loads each tab with its empty state', async () => {
    replyByStatus({ completed: [done] });
    render(<InstallmentsScreen />);
    expect(await screen.findByText('No active plans')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('installments-status-completed'));
    expect(await screen.findByTestId('installment-row-done')).toHaveTextContent(/Completed/);
    expect(screen.getByTestId('installment-summary-progress')).toHaveStyle({ width: '100%' });
    fireEvent.press(screen.getByTestId('installments-status-all'));
    expect(await screen.findByText('No installment plans yet')).toBeOnTheScreen();
    expect(mock.history.get.filter(request => request.url === url).map(request => request.params.status)).toEqual(expect.arrayContaining(['active', 'completed', 'all']));
  });

  it('shows placeholders while loading', async () => {
    mock.onGet(url).reply(() => new Promise(() => {}));
    render(<InstallmentsScreen />);
    expect(await screen.findByTestId('installment-list-loading')).toBeOnTheScreen();
  });

  it('shows an error with Retry', async () => {
    mock.onGet(url).replyOnce(500).onGet(url).reply(200, { items: [phone] });
    render(<InstallmentsScreen />);
    fireEvent.press(await screen.findByText('Retry'));
    expect(await screen.findByTestId('installment-row-phone')).toBeOnTheScreen();
  });

  it('expands a row with payments newest first and hides Pay on completed plans', async () => {
    replyByStatus({ active: [phone], all: [done] });
    mock.onGet(`${url}/phone`).reply(200, { ...phone, payments: [
      { id: 't1', amount: 5000, dateIso: '2026-09-01T06:00:00.000Z', note: 'Installment 1 of 12' },
      { id: 't3', amount: 5000, dateIso: '2026-11-01T06:00:00.000Z', note: 'Installment 3 of 12' },
    ] });
    mock.onGet(`${url}/done`).reply(200, { ...done, payments: [] });
    render(<InstallmentsScreen />);
    fireEvent.press(await screen.findByTestId('installment-row-phone'));
    expect(await screen.findByTestId('installment-payment-t3')).toHaveTextContent(/Installment 3 of 12/);
    expect(screen.getAllByTestId(/^installment-payment-t\d$/).map(node => node.props.testID)).toEqual(['installment-payment-t3', 'installment-payment-t1']);
    expect(screen.getByTestId('installment-row-pay')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('installments-status-all'));
    fireEvent.press(await screen.findByTestId('installment-row-done'));
    expect(await screen.findByTestId('installment-payments-empty')).toBeOnTheScreen();
    expect(screen.queryByTestId('installment-row-pay')).toBeNull();
  });
});
