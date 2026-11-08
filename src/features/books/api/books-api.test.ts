import { createBook, deleteBook, fetchBooks, updateBook } from '@/features/books/api/books-api';
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

  it('creates a book with POST /books and returns the validated book', async () => {
    jest.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockBooks[1], status: 201 } as any);

    const book = await createBook({ name: 'Business', currency: 'EUR' });

    expect(apiClient.post).toHaveBeenCalledWith('/books', { name: 'Business', currency: 'EUR' });
    expect(book).toEqual(mockBooks[1]);
  });

  it('updates a book with PATCH /books/:bookId sending only the given fields', async () => {
    jest.spyOn(apiClient, 'patch').mockResolvedValueOnce({ data: { ...mockBooks[1], name: 'Work' }, status: 200 } as any);

    const book = await updateBook('book-2', { name: 'Work' });

    expect(apiClient.patch).toHaveBeenCalledWith('/books/book-2', { name: 'Work' });
    expect(book.name).toBe('Work');
  });

  it('deletes a book with DELETE /books/:bookId', async () => {
    jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({ data: '', status: 204 } as any);

    await deleteBook('book-2');

    expect(apiClient.delete).toHaveBeenCalledWith('/books/book-2');
  });
});
