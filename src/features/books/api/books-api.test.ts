import { fetchBooks } from '@/features/books/api/books-api';
import { apiClient } from '@/lib/api';

describe('fetchBooks', () => {
  const mockBooks = [
    {
      id: 'book-1',
      name: 'Personal',
      currency: 'USD',
      isDefault: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'book-2',
      name: 'Business',
      currency: 'EUR',
      isDefault: false,
      createdAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches /books and returns validated books array', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { items: mockBooks },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    const books = await fetchBooks();

    expect(apiClient.get).toHaveBeenCalledWith('/books');
    expect(books).toEqual(mockBooks);
  });

  it('throws validation error if API response does not conform to Zod schema', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { items: [{ id: 'book-1', name: 'No Currency' }] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    await expect(fetchBooks()).rejects.toThrow();
  });

  it('throws validation error if API response is not wrapped in items object', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockBooks,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    await expect(fetchBooks()).rejects.toThrow();
  });

  it('propagates API client errors', async () => {
    const error = new Error('Network failure');
    jest.spyOn(apiClient, 'get').mockRejectedValueOnce(error);

    await expect(fetchBooks()).rejects.toThrow('Network failure');
  });
});
