import type { Book } from '@/features/books/schemas/book-schema';
import { BookOpen, ChevronsUpDown } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Button, Text, useBottomSheetModalRef } from '@/components/ui';
import { BookSwitcherSheet } from '@/features/books/components/book-switcher-sheet';
import { useActiveBook } from '@/features/books/hooks/use-active-book';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type BookSwitcherProps = {
  navigation?: {
    closeDrawer?: () => void;
    [key: string]: any;
  };
  testID?: string;
};

type BookSwitcherLoadingProps = {
  testID?: string;
};

function BookSwitcherLoading({ testID }: BookSwitcherLoadingProps) {
  const { t } = useTranslation();
  return (
    <View
      testID={testID ? `${testID}-loading` : 'book-switcher-loading'}
      accessibilityRole="none"
      accessibilityLabel={t('books.loading')}
      className="min-h-[44px] flex-row items-center justify-between rounded-2xl bg-paper-200 px-3 py-2.5"
    >
      <View className="flex-row items-center gap-2">
        <View className="size-5 rounded-full bg-border" />
        <View className="h-4 w-28 rounded-sm bg-border" />
      </View>
      <View className="h-4 w-10 rounded-sm bg-border" />
    </View>
  );
}

type BookSwitcherErrorProps = {
  testID?: string;
  onRetry: () => void;
};

function BookSwitcherError({ testID, onRetry }: BookSwitcherErrorProps) {
  const { t } = useTranslation();
  return (
    <View
      testID={testID ? `${testID}-error` : 'book-switcher-error'}
      className="min-h-[44px] flex-row items-center justify-between rounded-2xl bg-clay-100 px-3 py-2"
    >
      <Text
        numberOfLines={1}
        testID="book-switcher-error-message"
        className="mr-2 flex-1 text-label font-medium text-clay-500"
      >
        {t('books.errorLoading')}
      </Text>
      <Button
        variant="destructive"
        size="compact"
        label={t('books.retry')}
        onPress={onRetry}
        testID="book-switcher-retry"
      />
    </View>
  );
}

type BookSwitcherTriggerProps = {
  activeBook: Book;
  onPress: () => void;
};

function BookSwitcherTrigger({ activeBook, onPress }: BookSwitcherTriggerProps) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();

  return (
    <Pressable
      testID="book-switcher-trigger"
      accessibilityRole="button"
      accessibilityLabel={`${activeBook.name}, ${activeBook.currency}`}
      accessibilityHint={t('books.activeBookHint')}
      onPress={onPress}
      className="min-h-[44px] flex-row items-center justify-between rounded-2xl bg-paper-200 px-3 py-2.5 active:opacity-80"
    >
      <View className="mr-2 flex-1 flex-row items-center">
        <BookOpen
          size={18}
          strokeWidth={1.75}
          color={themeColors['ink-700']}
        />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          testID="book-switcher-active-name"
          className="ml-2.5 flex-1 text-row-title font-medium text-ink-900"
        >
          {activeBook.name}
        </Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Text
          testID="book-switcher-active-currency"
          className="text-meta font-medium text-ink-500 tabular-nums"
        >
          {activeBook.currency}
        </Text>
        <ChevronsUpDown
          size={16}
          strokeWidth={1.75}
          color={themeColors['ink-500']}
        />
      </View>
    </Pressable>
  );
}

export function BookSwitcher({
  navigation,
  testID = 'book-switcher',
}: BookSwitcherProps) {
  const {
    activeBook,
    activeBookId,
    setActiveBook,
    books,
    isLoading,
    isError,
    refetch,
  } = useActiveBook();

  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const sheetModal = useBottomSheetModalRef();

  const handleOpenSheet = React.useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = React.useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  React.useEffect(() => {
    if (isSheetOpen) {
      sheetModal.present();
    }
  }, [isSheetOpen, sheetModal]);

  const handleSelectBook = React.useCallback(
    (book: Book) => {
      if (book.id === activeBookId) {
        handleCloseSheet();
        return;
      }
      setActiveBook(book);
      handleCloseSheet();
      navigation?.closeDrawer?.();
    },
    [activeBookId, handleCloseSheet, navigation, setActiveBook],
  );

  if (isLoading) {
    return <BookSwitcherLoading testID={testID} />;
  }

  if (isError) {
    return <BookSwitcherError testID={testID} onRetry={refetch} />;
  }

  if (!activeBook) {
    return null;
  }

  return (
    <View testID={testID}>
      <BookSwitcherTrigger activeBook={activeBook} onPress={handleOpenSheet} />
      {isSheetOpen && (
        <BookSwitcherSheet
          sheetRef={sheetModal.ref}
          books={books}
          activeBookId={activeBookId}
          onSelectBook={handleSelectBook}
          onDismiss={handleCloseSheet}
        />
      )}
    </View>
  );
}
