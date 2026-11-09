import type { Book } from '@/features/books/schemas/book-schema';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { BookSwitcherSheet } from '@/features/books/components/book-switcher-sheet';
import { cleanup, fireEvent, render, screen } from '@/lib/test-utils';

const books: Book[] = [
  { id: 'b-1', name: 'Personal', currency: 'BDT', isDefault: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'b-2', name: 'Business', currency: 'USD', isDefault: false, createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'b-3', name: 'Family', currency: 'EUR', isDefault: false, createdAt: '2026-01-03T00:00:00.000Z' },
];

function setupSheet(overrides: Partial<React.ComponentProps<typeof BookSwitcherSheet>> = {}) {
  const props = {
    books,
    activeBookId: 'b-2',
    onSelectBook: jest.fn(),
    onCreateBook: jest.fn(),
    onEditBook: jest.fn(),
    onDeleteBook: jest.fn(),
    sheetRef: { current: null } as React.RefObject<BottomSheetModal | null>,
    ...overrides,
  };
  render(<BookSwitcherSheet {...props} />);
  return props;
}

afterEach(cleanup);

describe('bookSwitcherSheet', () => {
  it('shows the title, every book and the New book button', () => {
    setupSheet();

    expect(screen.getByTestId('book-switcher-sheet-title')).toHaveTextContent('Switch book');
    books.forEach(book => expect(screen.getByTestId(`book-item-${book.id}`)).toBeOnTheScreen());
    expect(screen.getByTestId('book-switcher-sheet-new-book')).toBeOnTheScreen();
    expect(screen.getByTestId('book-item-b-2').props.accessibilityState.selected).toBe(true);
  });

  it('fits its content and caps the height at 85% of the screen', () => {
    setupSheet();

    const modal = screen.UNSAFE_getByType(BottomSheetModal);
    expect(modal.props.snapPoints).toBeUndefined();
    expect(modal.props.enableDynamicSizing).toBe(true);
    expect(modal.props.maxDynamicContentSize).toBeGreaterThan(0);
  });

  it('selects, creates, edits and deletes through the row and footer actions', () => {
    const handlers = setupSheet();

    fireEvent.press(screen.getByTestId('book-item-b-3'));
    expect(handlers.onSelectBook).toHaveBeenCalledWith(books[2]);

    fireEvent.press(screen.getByTestId('book-switcher-sheet-new-book'));
    expect(handlers.onCreateBook).toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('book-item-edit-b-3'));
    expect(handlers.onEditBook).toHaveBeenCalledWith(books[2]);

    fireEvent.press(screen.getByTestId('book-item-delete-b-3'));
    expect(handlers.onDeleteBook).toHaveBeenCalledWith(books[2]);
  });
});
