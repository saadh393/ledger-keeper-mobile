import { getBookError } from '@/features/books/utils/get-book-error';
import { ApiError } from '@/lib/api/errors';
import i18n from '@/lib/i18n';

function conflict(code: string) {
  return new ApiError({ kind: 'conflict', status: 409, code });
}

describe('getBookError', () => {
  it('maps book_name_taken to the name field', () => {
    const error = getBookError(conflict('book_name_taken'));
    expect(error).toEqual({ field: 'name', messageKey: 'books.errors.nameTaken', retryable: false });
    expect(i18n.t(error.messageKey)).toBe('You already have a book with this name');
  });

  it('maps book_not_empty to the currency field', () => {
    const error = getBookError(conflict('book_not_empty'));
    expect(error).toEqual({ field: 'currency', messageKey: 'books.errors.currencyLocked', retryable: false });
    expect(i18n.t(error.messageKey)).toBe('Currency can only change while the book is empty');
  });

  it('maps default_book to a form message', () => {
    const error = getBookError(conflict('default_book'));
    expect(error).toEqual({ field: 'form', messageKey: 'books.errors.defaultBook', retryable: false });
    expect(i18n.t(error.messageKey)).toBe('The default book can\'t be deleted');
  });

  it('maps offline and timeout errors to a retryable offline message', () => {
    expect(getBookError(new ApiError({ kind: 'offline' }))).toEqual({ field: 'form', messageKey: 'books.errors.offline', retryable: true });
    expect(getBookError(new ApiError({ kind: 'timeout' }))).toEqual({ field: 'form', messageKey: 'books.errors.offline', retryable: true });
  });

  it('maps server errors and unknown conflict codes to a retryable server message', () => {
    const expected = { field: 'form', messageKey: 'books.errors.server', retryable: true };
    expect(getBookError(new ApiError({ kind: 'server', status: 500 }))).toEqual(expected);
    expect(getBookError(conflict('something_else'))).toEqual(expected);
    expect(getBookError(new Error('boom'))).toEqual(expected);
  });
});
