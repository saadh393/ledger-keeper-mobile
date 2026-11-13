export const detectedKeys = {
  all: (bookId: string) => ['books', bookId, 'captures'] as const,
  list: (bookId: string) => ['books', bookId, 'captures', 'list'] as const,
  count: (bookId: string) => ['books', bookId, 'captures', 'count'] as const,
};
