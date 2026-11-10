import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { Alert } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { TransactionFormSheet } from '@/features/ledger/components/transaction-form-sheet';
import { apiClient } from '@/lib/api/client';
import { fireEvent, render, screen, waitFor } from '@/lib/test-utils';

jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));

const mockCategories = [
  { id: 'cat-1', name: 'Food', kind: 'expense', color: '#ff0000', system: true },
  { id: 'cat-2', name: 'Salary', kind: 'income', color: '#00ff00', system: true },
];

const mockRow: TransactionRow = {
  id: 'tx-1',
  kind: 'expense',
  name: 'Lunch',
  subtitle: 'Food',
  category: 'Food',
  amount: 250,
  dateIso: '2026-11-10T12:00:00.000Z',
  note: 'Office lunch',
  merchant: null,
  items: [],
  original: null,
};

const foreignRow: TransactionRow = {
  ...mockRow,
  id: 'tx-foreign',
  original: {
    amount: 10,
    currency: 'USD',
    rate: 120,
  },
};

const itemizedRow: TransactionRow = {
  ...mockRow,
  id: 'tx-itemized',
  items: [
    { id: 'item-1', type: 'line', title: 'Rice', category: null, amount: 200, quantity: 1, note: null },
    { id: 'item-2', type: 'adjustment', title: 'VAT', category: null, amount: 50, quantity: null, note: null },
  ],
};

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  mock.onGet('/categories').reply(200, mockCategories);
  jest.mocked(showMessage).mockClear();
  jest.spyOn(Alert, 'alert').mockClear();
});

afterEach(() => {
  mock.restore();
  jest.restoreAllMocks();
});

describe('transactionFormSheet rendering & modes', () => {
  it('renders empty form sheet titled Add transaction for create', async () => {
    render(<TransactionFormSheet bookId="book-1" currency="BDT" onDismiss={jest.fn()} />);

    expect(screen.getByTestId('transaction-form-sheet-title')).toHaveTextContent('Add transaction');
    expect(screen.getByTestId('transaction-form-amount')).toHaveTextContent('');
    expect(screen.getByTestId('transaction-form-title')).toHaveTextContent('');
    expect(screen.getByText('BDT')).toBeOnTheScreen();
  });

  it('renders prefilled form sheet titled Edit transaction for edit', async () => {
    render(<TransactionFormSheet bookId="book-1" currency="BDT" row={mockRow} onDismiss={jest.fn()} />);

    expect(screen.getByTestId('transaction-form-sheet-title')).toHaveTextContent('Edit transaction');
    expect(screen.getByTestId('transaction-form-title')).toHaveProp('value', 'Lunch');
    expect(screen.getByTestId('transaction-form-amount')).toHaveProp('value', '250');
    expect(screen.getByText('Food')).toBeOnTheScreen();
  });
});

describe('transactionFormSheet itemized & foreign hints', () => {
  it('makes amount read-only with hint for itemized receipt', () => {
    render(<TransactionFormSheet bookId="book-1" currency="BDT" row={itemizedRow} onDismiss={jest.fn()} />);

    const amountInput = screen.getByTestId('transaction-form-amount');
    expect(amountInput.props.editable).toBe(false);
    expect(screen.getByTestId('transaction-form-itemized-hint')).toHaveTextContent(
      'Total comes from the receipt items',
    );
  });

  it('shows foreign amount warning when editing amount of converted foreign transaction', () => {
    render(<TransactionFormSheet bookId="book-1" currency="BDT" row={foreignRow} onDismiss={jest.fn()} />);

    expect(screen.queryByTestId('transaction-form-foreign-hint')).toBeNull();
    fireEvent.changeText(screen.getByTestId('transaction-form-amount'), '300');
    expect(screen.getByTestId('transaction-form-foreign-hint')).toHaveTextContent(
      'The original foreign amount will be removed',
    );
  });
});

describe('transactionFormSheet type and category', () => {
  it('clears category when switching Type to income if category does not belong to new type', async () => {
    render(<TransactionFormSheet bookId="book-1" currency="BDT" row={mockRow} onDismiss={jest.fn()} />);

    await waitFor(() => {
      expect(mock.history.get.some(req => req.url === '/categories')).toBe(true);
    });

    fireEvent.press(screen.getByTestId('transaction-form-type-income'));

    await waitFor(() => {
      expect(screen.queryByText('Food')).toBeNull();
    });
    expect(screen.getByText('Select category')).toBeOnTheScreen();
  });
});

describe('transactionFormSheet validation', () => {
  it('shows error under invalid fields when Save is tapped and sends nothing', async () => {
    render(<TransactionFormSheet bookId="book-1" currency="BDT" onDismiss={jest.fn()} />);

    fireEvent.press(screen.getByTestId('transaction-form-submit'));

    await waitFor(() => {
      expect(screen.getByText('Amount is required')).toBeOnTheScreen();
      expect(screen.getByText('Title is required')).toBeOnTheScreen();
      expect(screen.getByText('Category is required')).toBeOnTheScreen();
    });

    expect(mock.history.post.length).toBe(0);
  });
});

describe('transactionFormSheet save create', () => {
  it('submits create request with parsed Bangla digits amount and closes sheet on success', async () => {
    const onDismiss = jest.fn();
    mock.onPost('/books/book-1/transactions').reply(201, {
      ...mockRow,
      id: 'new-tx',
      amount: 150.5,
      name: 'Snacks',
      dateIso: '2026-11-10T12:00:00.000Z',
    });

    render(
      <TransactionFormSheet
        bookId="book-1"
        currency="BDT"
        viewedMonth={{ year: 2026, month: 11 }}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.changeText(screen.getByTestId('transaction-form-amount'), '১৫০.৫০');
    fireEvent.changeText(screen.getByTestId('transaction-form-title'), 'Snacks');

    fireEvent.press(screen.getByTestId('transaction-form-category'));
    expect(await screen.findByText('Food')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Food'));

    fireEvent.press(screen.getByTestId('transaction-form-submit'));

    await waitFor(() => {
      expect(mock.history.post.length).toBe(1);
    });

    const payload = JSON.parse(mock.history.post[0].data);
    expect(payload.amount).toBe(150.5);
    expect(payload.title).toBe('Snacks');
    expect(payload.category).toBe('Food');
    expect(payload.kind).toBe('expense');
  });

  it('shows toast Saved to Month Year when dated in another month', async () => {
    mock.onPost('/books/book-1/transactions').reply(201, {
      ...mockRow,
      dateIso: '2026-10-15T12:00:00.000Z',
    });

    render(
      <TransactionFormSheet
        bookId="book-1"
        currency="BDT"
        viewedMonth={{ year: 2026, month: 11 }}
        onDismiss={jest.fn()}
      />,
    );

    fireEvent.changeText(screen.getByTestId('transaction-form-amount'), '200');
    fireEvent.changeText(screen.getByTestId('transaction-form-title'), 'Dinner');

    fireEvent.press(screen.getByTestId('transaction-form-category'));
    expect(await screen.findByText('Food')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Food'));

    fireEvent.press(screen.getByTestId('transaction-form-date'));
    fireEvent.press(screen.getByTestId('transaction-date-picker-prev-month'));
    fireEvent.press(screen.getByTestId('date-picker-day-2026-10-15'));

    fireEvent.press(screen.getByTestId('transaction-form-submit'));

    await waitFor(() => {
      expect(showMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Saved to October 2026',
          type: 'success',
        }),
      );
    });
  });
});

describe('transactionFormSheet save edit', () => {
  it('disables Save button when nothing is changed', () => {
    render(<TransactionFormSheet bookId="book-1" currency="BDT" row={mockRow} onDismiss={jest.fn()} />);

    const submitButton = screen.getByTestId('transaction-form-submit');
    expect(submitButton.props.accessibilityState.disabled).toBe(true);
  });

  it('sends only changed fields on edit', async () => {
    mock.onPatch('/books/book-1/transactions/tx-1').reply(200, {
      ...mockRow,
      name: 'Buffet',
    });

    render(<TransactionFormSheet bookId="book-1" currency="BDT" row={mockRow} onDismiss={jest.fn()} />);

    fireEvent.changeText(screen.getByTestId('transaction-form-title'), 'Buffet');
    const submitButton = screen.getByTestId('transaction-form-submit');
    expect(submitButton.props.accessibilityState.disabled).toBe(false);

    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mock.history.patch.length).toBe(1);
    });

    const patch = JSON.parse(mock.history.patch[0].data);
    expect(patch).toEqual({ title: 'Buffet' });
  });

  it('handles 404 deleted elsewhere by closing sheet and showing notice', async () => {
    mock.onPatch('/books/book-1/transactions/tx-1').reply(404, {
      code: 'transaction_not_found',
      message: 'Transaction not found',
    });

    render(<TransactionFormSheet bookId="book-1" currency="BDT" row={mockRow} onDismiss={jest.fn()} />);

    fireEvent.changeText(screen.getByTestId('transaction-form-title'), 'Buffet');
    fireEvent.press(screen.getByTestId('transaction-form-submit'));

    await waitFor(() => {
      expect(showMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'This transaction no longer exists',
        }),
      );
    });
  });
});

describe('transactionFormSheet server errors & discard', () => {
  it('keeps sheet open with all values and displays 422 error under matching fields', async () => {
    mock.onPost('/books/book-1/transactions').reply(422, {
      message: 'Validation failed',
      data: {
        issues: [
          { path: ['amount'], message: 'Amount is invalid from server' },
          { path: ['title'], message: 'Title is reserved' },
        ],
      },
    });

    render(<TransactionFormSheet bookId="book-1" currency="BDT" onDismiss={jest.fn()} />);

    fireEvent.changeText(screen.getByTestId('transaction-form-amount'), '500');
    fireEvent.changeText(screen.getByTestId('transaction-form-title'), 'Test Title');

    fireEvent.press(screen.getByTestId('transaction-form-category'));
    expect(await screen.findByText('Food')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Food'));

    fireEvent.press(screen.getByTestId('transaction-form-submit'));

    await waitFor(() => {
      expect(screen.getByText('Amount is invalid from server')).toBeOnTheScreen();
      expect(screen.getByText('Title is reserved')).toBeOnTheScreen();
    });

    expect(screen.getByTestId('transaction-form-title')).toHaveProp('value', 'Test Title');
    expect(screen.getByTestId('transaction-form-amount')).toHaveProp('value', '500');
  });

  it('keeps sheet open and shows banner on offline/server failure', async () => {
    mock.onPost('/books/book-1/transactions').networkError();

    render(<TransactionFormSheet bookId="book-1" currency="BDT" onDismiss={jest.fn()} />);

    fireEvent.changeText(screen.getByTestId('transaction-form-amount'), '500');
    fireEvent.changeText(screen.getByTestId('transaction-form-title'), 'Dinner');

    fireEvent.press(screen.getByTestId('transaction-form-category'));
    expect(await screen.findByText('Food')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Food'));

    fireEvent.press(screen.getByTestId('transaction-form-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('transaction-form-error')).toBeOnTheScreen();
    });
  });

  it('prompts Discard changes? when closing with unsaved changes', async () => {
    render(<TransactionFormSheet bookId="book-1" currency="BDT" onDismiss={jest.fn()} />);

    fireEvent.changeText(screen.getByTestId('transaction-form-title'), 'Changed Title');
    fireEvent.press(screen.getByTestId('transaction-form-sheet-close-button'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Discard changes?',
      'You have unsaved changes. Are you sure you want to discard them?',
      expect.any(Array),
    );
  });

  it('closes without prompt when closing without changes', () => {
    render(<TransactionFormSheet bookId="book-1" currency="BDT" row={mockRow} onDismiss={jest.fn()} />);

    fireEvent.press(screen.getByTestId('transaction-form-sheet-close-button'));
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
