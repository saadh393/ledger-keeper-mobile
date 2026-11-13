import type { DetectedItem } from '@/features/auto-capture/schemas/detected-item-schema';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';
import { DetectedList } from '@/features/auto-capture/components/detected-list';
import { apiClient } from '@/lib/api/client';
import { fireEvent, render, screen, waitFor } from '@/lib/test-utils';

jest.mock('@/features/auto-capture/native/notification-capture');
jest.mock('react-native-flash-message', () => ({ showMessage: jest.fn() }));

const item: DetectedItem = {
  id: 'd1',
  packageName: 'com.bKash.customerapp',
  appName: 'bKash',
  sourceText: 'Payment Tk 450.00 to Daraz successful.',
  receivedAt: '2026-11-12T10:00:00.000Z',
  kind: 'expense',
  title: 'Daraz',
  category: 'Shopping',
  amount: 450,
  currency: 'BDT',
  dateIso: '2026-11-12T10:00:00.000Z',
  duplicateOf: null,
};

const transaction = { id: 't1', kind: 'expense', name: 'Daraz', subtitle: '', category: 'Shopping', dateIso: '2026-11-12T10:00:00.000Z', amount: 450, note: null, original: null, merchant: null, items: [] };

function reply(items: DetectedItem[]) {
  return { items, total: items.length, page: 1, pageSize: 25 };
}

describe('detectedList', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    jest.mocked(showMessage).mockClear();
  });

  afterEach(() => mock.restore());

  it('shows the empty state', async () => {
    mock.onGet('/books/book-1/captures').reply(200, reply([]));
    render(<DetectedList bookId="book-1" currency="BDT" />);
    expect(await screen.findByText('Nothing to review')).toBeOnTheScreen();
  });

  it('marks possible duplicates and blocks confirming unparsed items', async () => {
    mock.onGet('/books/book-1/captures').reply(200, reply([
      { ...item, duplicateOf: { id: 't9', title: 'Daraz order', dateIso: '2026-11-12T09:58:00.000Z', amount: 450, kind: 'expense' } },
      { ...item, id: 'd2', amount: null, title: null },
    ]));
    render(<DetectedList bookId="book-1" currency="BDT" />);
    expect(await screen.findByTestId('detected-row-duplicate')).toHaveTextContent(/Possible duplicate of Daraz order/);
    const confirmButtons = screen.getAllByTestId('detected-confirm');
    expect(confirmButtons[0]).toBeEnabled();
    expect(confirmButtons[1]).toBeDisabled();
  });

  it('shows the source text when tapped', async () => {
    mock.onGet('/books/book-1/captures').reply(200, reply([item]));
    render(<DetectedList bookId="book-1" currency="BDT" />);
    fireEvent.press(await screen.findByTestId('detected-row-title'));
    expect(screen.getByTestId('detected-row-source')).toHaveTextContent('Payment Tk 450.00 to Daraz successful.');
  });

  it('confirms an item and refreshes the inbox', async () => {
    mock.onGet('/books/book-1/captures').replyOnce(200, reply([item])).onGet('/books/book-1/captures').reply(200, reply([]));
    mock.onPost('/books/book-1/captures/d1/confirm').reply(201, transaction);
    render(<DetectedList bookId="book-1" currency="BDT" />);
    fireEvent.press(await screen.findByTestId('detected-confirm'));
    expect(await screen.findByText('Nothing to review')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(1);
  });

  it('removes an item handled on another device without an error', async () => {
    mock.onGet('/books/book-1/captures').replyOnce(200, reply([item])).onGet('/books/book-1/captures').reply(200, reply([]));
    mock.onPost('/books/book-1/captures/d1/confirm').reply(409);
    render(<DetectedList bookId="book-1" currency="BDT" />);
    fireEvent.press(await screen.findByTestId('detected-confirm'));
    expect(await screen.findByText('Nothing to review')).toBeOnTheScreen();
    expect(showMessage).not.toHaveBeenCalled();
  });

  it('keeps the item and shows an error when confirming fails', async () => {
    mock.onGet('/books/book-1/captures').reply(200, reply([item]));
    mock.onPost('/books/book-1/captures/d1/confirm').reply(500);
    render(<DetectedList bookId="book-1" currency="BDT" />);
    fireEvent.press(await screen.findByTestId('detected-confirm'));
    await waitFor(() => expect(showMessage).toHaveBeenCalledWith(expect.objectContaining({ message: 'Couldn\'t confirm this payment. Try again.' })));
    expect(screen.getByTestId('detected-row-d1')).toBeOnTheScreen();
  });

  it('discards with a 5 second undo', async () => {
    mock.onGet('/books/book-1/captures').replyOnce(200, reply([item])).onGet('/books/book-1/captures').reply(200, reply([]));
    mock.onPost('/books/book-1/captures/d1/discard').reply(204);
    mock.onPost('/books/book-1/captures/d1/restore').reply(204);
    render(<DetectedList bookId="book-1" currency="BDT" />);
    fireEvent.press(await screen.findByTestId('detected-discard'));
    await waitFor(() => expect(showMessage).toHaveBeenCalledWith(expect.objectContaining({ message: 'Discarded', duration: 5000 })));
    jest.mocked(showMessage).mock.calls[0][0].onPress?.();
    await waitFor(() => expect(mock.history.post.map(request => request.url)).toContain('/books/book-1/captures/d1/restore'));
  });

  it('edits and confirms with the edited values', async () => {
    mock.onGet('/books/book-1/captures').reply(200, reply([{ ...item, amount: null }]));
    mock.onGet('/categories').reply(200, [{ id: 'c1', name: 'Shopping', kind: 'expense', color: '#000', system: true }]);
    mock.onPost('/books/book-1/captures/d1/confirm').reply(201, transaction);
    render(<DetectedList bookId="book-1" currency="BDT" />);
    fireEvent.press(await screen.findByTestId('detected-edit'));
    fireEvent.changeText(await screen.findByTestId('transaction-form-amount'), '450');
    fireEvent.press(screen.getByTestId('transaction-form-submit'));
    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0].data)).toEqual(expect.objectContaining({ kind: 'expense', title: 'Daraz', category: 'Shopping', amount: 450 }));
  });
});
