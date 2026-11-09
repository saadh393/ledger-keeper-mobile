import MockAdapter from 'axios-mock-adapter';
import { fetchBookTable } from '@/features/ledger/api/fetch-book-table';
import { bookTableQueryKey } from '@/features/ledger/api/use-book-table';
import { apiClient } from '@/lib/api/client';

describe('fetchBookTable', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  it('requests the book table for the date range', async () => {
    mock.onGet('/books/book-1/table').reply(200, { stats: [], rows: [] });
    await expect(fetchBookTable('book-1', '2026-11-01', '2026-11-30')).resolves.toEqual({ stats: [], rows: [] });
    expect(mock.history.get[0]?.params).toEqual({ fromDate: '2026-11-01', toDate: '2026-11-30' });
  });

  it('rejects a malformed response', async () => {
    mock.onGet('/books/book-1/table').reply(200, { stats: 'x' });
    await expect(fetchBookTable('book-1', '2026-11-01', '2026-11-30')).rejects.toThrow();
  });
});

describe('bookTableQueryKey', () => {
  it('is scoped to the book and date range', () => {
    expect(bookTableQueryKey('book-1', '2026-11-01', '2026-11-30')).toEqual(['books', 'book-1', 'table', '2026-11-01', '2026-11-30']);
  });
});
