import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { Book } from '@/features/books/schemas/book-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  BottomSheet,
  BottomSheetFlatList,
} from '@/components/ui/bottom-sheet';
import { BookSwitcherItem } from '@/features/books/components/book-switcher-item';
import { sortBooks } from '@/features/books/utils/sort-books';

export type BookSwitcherSheetProps = {
  books: Book[];
  activeBookId: string | null;
  onSelectBook: (book: Book) => void;
  onDismiss?: () => void;
  testID?: string;
  sheetRef: React.RefObject<BottomSheetModal | null>;
};

export function BookSwitcherSheet({
  books,
  activeBookId,
  onSelectBook,
  onDismiss,
  testID = 'book-switcher-sheet',
  sheetRef,
}: BookSwitcherSheetProps) {
  const { t } = useTranslation();
  const sortedBooks = React.useMemo(() => sortBooks(books), [books]);
  const snapPoints = React.useMemo(() => ['60%'], []);

  const renderItem = React.useCallback(
    ({ item }: { item: Book }) => (
      <BookSwitcherItem
        book={item}
        isActive={item.id === activeBookId}
        onSelect={onSelectBook}
      />
    ),
    [activeBookId, onSelectBook],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      title={t('books.switcherTitle')}
      dismissible
      showCloseButton
      onDismiss={onDismiss}
      testID={testID}
    >
      <View testID={testID} className="flex-1 px-4 pb-4">
        <BottomSheetFlatList
          testID={`${testID}-list`}
          data={sortedBooks}
          keyExtractor={(item: Book) => item.id}
          renderItem={renderItem}
          initialNumToRender={15}
          maxToRenderPerBatch={20}
        />
      </View>
    </BottomSheet>
  );
}
