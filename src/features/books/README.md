# Books Feature

This feature manages books (user ledgers) and maintains the currently active book across the application.

## 1. Overview & Architecture

A **book** is a user's ledger: it owns transactions, loans, and installment plans, and has a specific ISO 4217 currency.
Every book-scoped screen reads from the active book state managed by `useActiveBook()`.

- **Books List Data**: Fetched from `GET /api/books` using TanStack Query (`useBooks()`) and validated with Zod.
- **Active Book State**: Managed with Zustand + MMKV local storage (`useActiveBookStore`), persisting the active book ID across app restarts.
- **Pure Fallback Selection**: Deterministic resolution logic (`resolveActiveBook`) handles first use, deleted books, missing defaults, and empty book lists.

---

## 2. Query Key Convention & Cache Isolation

> [!IMPORTANT]
> **MANDATORY CONVENTION:** Every book-scoped query key MUST start with `['books', bookId, ...]`.

### Why This Is Required
When a user switches books, React components re-render immediately with the newly active `bookId`.
By prefixing every book-scoped query key with `['books', bookId, ...]`:
1. Queries for the previous book and the new book have **completely isolated cache entries** in TanStack Query.
2. Switching books **never flashes or leaks the previous book's data** while new data is loading.
3. If the user navigates back to the original book, cached responses remain intact without requiring unnecessary network refetches.

### Query Key Structure & Examples

| Query Purpose | Query Key Pattern | Helper Function |
|---|---|---|
| All books list | `['books']` | `booksKeys.all` |
| Book root scope | `['books', bookId]` | `booksKeys.book(bookId)` |
| Book transactions table | `['books', bookId, 'table', params?]` | `booksKeys.table(bookId, params)` |
| Book conversations | `['books', bookId, 'conversations', params?]` | `booksKeys.conversations(bookId, params)` |
| Book loans | `['books', bookId, 'loans', params?]` | `booksKeys.loans(bookId, params)` |
| Book installments | `['books', bookId, 'installments', params?]` | `booksKeys.installments(bookId, params)` |
| Custom scoped query | `['books', bookId, ...subKeys]` | `bookScopedQueryKey(bookId, ...subKeys)` |

### Usage Example
```typescript
import { useQuery } from '@tanstack/react-query';
import { booksKeys, useActiveBook } from '@/features/books';
import { apiClient } from '@/lib/api';

export function useBookTransactions(dateRange?: { fromDate?: string; toDate?: string }) {
  const { activeBookId } = useActiveBook();

  return useQuery({
    queryKey: booksKeys.table(activeBookId!, dateRange),
    queryFn: async () => {
      const { data } = await apiClient.get(`/books/${activeBookId}/table`, { params: dateRange });
      return data;
    },
    enabled: Boolean(activeBookId),
  });
}
```

---

## 3. Fallback Selection Pure Function

The active book is resolved deterministically by `resolveActiveBook(books, savedId)`:

1. **Saved Valid**: If `savedId` matches a book in the list, that book is active (`shouldUpdateSaved = false`).
2. **Saved Missing**: If `savedId` is not found (e.g. deleted on the web or another device), it falls back to the default book (`isDefault: true`) and updates the saved ID in MMKV (`shouldUpdateSaved = true`).
3. **No Saved ID (First Use)**: If no ID has been saved yet, it falls back to the default book (`isDefault: true`) and saves it to MMKV (`shouldUpdateSaved = true`).
4. **No Default Book**: If the list contains no book marked `isDefault: true`, it falls back to the first book (`books[0]`) and updates the saved ID (`shouldUpdateSaved = true`).
5. **Empty List**: If `books` is empty (`[]`), the hook returns `activeBook = null` and `isEmpty = true`, enabling the UI to render an empty state.

---

## 4. MMKV Persistence & App Restarts

The active book ID is saved in MMKV under key `active_book_id` via Zustand's `persist` middleware:
- Reading and writing with MMKV is synchronous and encrypted on device.
- Survives app kills and device restarts.
- Rehydrates immediately when the app launches.

---

## 5. Sign-out Behavior

When the user signs out (`useAuthStore.getState().signOut()`):
1. `clearUserStorage()` in `@/lib/storage` removes the `active_book_id` key from MMKV.
2. The sign-out hook registered by `useActiveBookStore` resets the in-memory store state to `activeBookId: null`.
3. TanStack Query cache is purged via `queryClient.clear()`.
4. Subsequent logins start with a clean active book state, defaulting to the new user's default book.

---

## 6. Hooks API Reference

### `useBooks(options?)`
Fetches all user books from `GET /api/books` and validates the response with Zod:
```typescript
export function useBooksExample() {
  const { data, books, isLoading, isError, error, refetch } = useBooks();
  return { data, books, isLoading, isError, error, refetch };
}
```

### `useActiveBook()`
Returns the resolved active book object and helpers:
```typescript
export function useActiveBookExample() {
  const {
    activeBook,
    activeBookId,
    setActiveBook,
    setActiveBookId,
    books,
    isLoading,
    isError,
    error,
    isEmpty,
    refetch,
  } = useActiveBook();

  return {
    activeBook,
    activeBookId,
    setActiveBook,
    setActiveBookId,
    books,
    isLoading,
    isError,
    error,
    isEmpty,
    refetch,
  };
}
```
Changing the active book via `setActiveBook` or `setActiveBookId` updates every screen using `useActiveBook()` instantly without an app restart.
