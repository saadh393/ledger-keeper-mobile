import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Book } from '@/features/books/schemas/book-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheet,
  BottomSheetFlatList,
} from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { BookSwitcherItem } from '@/features/books/components/book-switcher-item';
import { sortBooks } from '@/features/books/utils/sort-books';

export type BookSwitcherSheetProps = {
  books: Book[];
  activeBookId: string | null;
  onSelectBook: (book: Book) => void;
  onCreateBook: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
  onDismiss?: () => void;
  testID?: string;
  sheetRef: React.RefObject<BottomSheetModal | null>;
};

export function BookSwitcherSheet({
  books,
  activeBookId,
  onSelectBook,
  onCreateBook,
  onEditBook,
  onDeleteBook,
  onDismiss,
  testID = 'book-switcher-sheet',
  sheetRef,
}: BookSwitcherSheetProps) {
  const { t } = useTranslation();
  const sortedBooks = React.useMemo(() => sortBooks(books), [books]);
  const insets = useSafeAreaInsets();

  const renderItem = React.useCallback(
    ({ item }: { item: Book }) => (
      <BookSwitcherItem
        book={item}
        isActive={item.id === activeBookId}
        onSelect={onSelectBook}
        onEdit={onEditBook}
        onDelete={onDeleteBook}
      />
    ),
    [activeBookId, onSelectBook, onEditBook, onDeleteBook],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      title={t('books.switcherTitle')}
      dismissible
      showCloseButton
      onDismiss={onDismiss}
      testID={testID}
    >
      <BottomSheetFlatList
        testID={`${testID}-list`}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
        data={sortedBooks}
        keyExtractor={(item: Book) => item.id}
        renderItem={renderItem}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        ListFooterComponent={(
          <Button
            testID={`${testID}-new-book`}
            variant="secondary"
            label={t('books.newBook')}
            onPress={onCreateBook}
            className="mt-3"
          />
        )}
      />
    </BottomSheet>
  );
}
