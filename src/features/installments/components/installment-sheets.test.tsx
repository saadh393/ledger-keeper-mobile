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
const phone: Installment = { id: 'phone', title: 'Phone EMI', category: 'Gadgets', amount: 5000, totalCount: 12, paidCount: 3, remainingAmount: 45000, currency: 'BDT', status: 'active' };
const payment = { id: 't3', amount: 5000, dateIso: '2026-11-01T06:00:00.000Z', note: 'Installment 3 of 12' };

describe('installment sheets', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    mock.onGet('/books').reply(200, { items: [personal] });
    mock.onGet('/categories').reply(200, [{ id: 'c1', name: 'Gadgets', kind: 'expense', color: '#111111', system: false }]);
    mock.onGet(url).reply(200, { items: [phone] });
    mock.onGet(`${url}/phone`).reply(200, { ...phone, payments: [payment] });
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

  async function openRow() {
    render(<InstallmentsScreen />);
    fireEvent.press(await screen.findByTestId('installment-row-phone'));
  }

  it('adds a plan with a live total preview', async () => {
    mock.onPost(url).reply(201, phone);
    render(<InstallmentsScreen />);
    fireEvent.press(await screen.findByTestId('installments-add'));
    fireEvent.changeText(await screen.findByTestId('installment-form-title'), ' Phone EMI ');
    fireEvent.press(screen.getByTestId('installment-form-category'));
    fireEvent.press(await screen.findByTestId('category-item-Gadgets'));
    fireEvent.changeText(screen.getByTestId('installment-form-amount'), '৫০০০');
    fireEvent.changeText(screen.getByTestId('installment-form-count'), '12');
    expect(screen.getByTestId('installment-form-total')).toHaveTextContent('12 × ৳5,000 = ৳60,000');
    fireEvent.press(screen.getByTestId('installment-form-submit'));
    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]!.data)).toEqual({ title: 'Phone EMI', category: 'Gadgets', amount: 5000, totalCount: 12 });
  });

  it('edits only changed fields and blocks a count below paid', async () => {
    mock.onPatch(`${url}/phone`).reply(200, { ...phone, totalCount: 10 });
    await openRow();
    fireEvent.press(await screen.findByTestId('installment-row-edit'));
    expect(await screen.findByTestId('installment-form-paid')).toHaveTextContent('3 already paid');
    fireEvent.changeText(screen.getByTestId('installment-form-count'), '2');
    fireEvent.press(screen.getByTestId('installment-form-submit'));
    expect(await screen.findByText('3 already paid, so the total can\'t be lower')).toBeOnTheScreen();
    fireEvent.changeText(screen.getByTestId('installment-form-count'), '10');
    fireEvent.press(screen.getByTestId('installment-form-submit'));
    await waitFor(() => expect(mock.history.patch).toHaveLength(1));
    expect(JSON.parse(mock.history.patch[0]!.data)).toEqual({ totalCount: 10 });
  });

  it('records a payment prefilled with the plan amount', async () => {
    mock.onPost(`${url}/phone/payments`).reply(201, { installment: phone, transaction: {} });
    await openRow();
    fireEvent.press(await screen.findByTestId('installment-row-pay'));
    expect(await screen.findByTestId('installment-payment-amount')).toHaveDisplayValue('5000');
    expect(screen.getByTestId('installment-payment-next')).toHaveTextContent('Phone EMI · Installment 4 of 12');
    fireEvent.press(screen.getByTestId('installment-payment-submit'));
    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]!.data)).toMatchObject({ amount: 5000 });
  });

  it('shows a readable message when the plan was completed elsewhere', async () => {
    mock.onPost(`${url}/phone/payments`).reply(422, { code: 'installment_completed', message: 'All paid' });
    await openRow();
    fireEvent.press(await screen.findByTestId('installment-row-pay'));
    fireEvent.press(await screen.findByTestId('installment-payment-submit'));
    expect(await screen.findByText('This plan is already complete')).toBeOnTheScreen();
  });

  it('undoes a payment by deleting its transaction', async () => {
    mock.onDelete('/books/book-1/transactions/t3').reply(204);
    await openRow();
    fireEvent.press(await screen.findByTestId('installment-payment-t3-undo'));
    fireEvent.press(await screen.findByTestId('installment-undo-sheet-confirm'));
    await waitFor(() => expect(mock.history.delete[0]?.url).toBe('/books/book-1/transactions/t3'));
  });

  it('deletes a plan after confirmation', async () => {
    mock.onDelete(`${url}/phone`).reply(204);
    await openRow();
    fireEvent.press(await screen.findByTestId('installment-row-delete'));
    expect(await screen.findByText('Delete this plan? Its payments stay in your ledger as expenses.')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('installment-delete-sheet-confirm'));
    await waitFor(() => expect(mock.history.delete[0]?.url).toBe(`${url}/phone`));
  });
});
