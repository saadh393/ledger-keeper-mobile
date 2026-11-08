import type { Book } from '@/features/books/schemas/book-schema';
import type { BookError } from '@/features/books/utils/get-book-error';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { BottomSheet, useBottomSheetModalRef } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useDeleteBook } from '@/features/books/api/use-delete-book';
import { BookErrorBanner } from '@/features/books/components/book-error-banner';
import { getBookError } from '@/features/books/utils/get-book-error';

export type BookDeleteSheetProps = {
  book: Book;
  onDismiss: () => void;
  testID?: string;
};

export function BookDeleteSheet({ book, onDismiss, testID = 'book-delete-sheet' }: BookDeleteSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const mutation = useDeleteBook();
  const [error, setError] = React.useState<BookError | null>(null);
  const snapPoints = React.useMemo(() => ['50%'], []);

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const confirm = React.useCallback(() => {
    if (mutation.isPending) {
      return;
    }
    setError(null);
    mutation.mutate(book.id, {
      onSuccess: modal.dismiss,
      onError: err => setError(getBookError(err)),
    });
  }, [book.id, modal.dismiss, mutation]);

  return (
    <BottomSheet
      ref={modal.ref}
      snapPoints={snapPoints}
      title={t('books.deleteSheet.title', { name: book.name })}
      dismissible
      showCloseButton
      onDismiss={onDismiss}
      testID={testID}
    >
      <View testID={testID} className="flex-1 px-4 pb-4">
        <Text testID={`${testID}-body`} className="mb-4 text-body text-ink-700">
          {t('books.deleteSheet.body')}
        </Text>
        {error && (
          <BookErrorBanner
            message={t(error.messageKey)}
            onRetry={error.retryable ? confirm : undefined}
            testID={`${testID}-error`}
          />
        )}
        <View className="gap-2">
          <Button
            testID={`${testID}-confirm`}
            variant="destructive"
            label={t(mutation.isPending ? 'books.deleteSheet.deleting' : 'books.deleteSheet.confirm')}
            pending={mutation.isPending}
            onPress={confirm}
          />
          <Button
            testID={`${testID}-cancel`}
            variant="secondary"
            label={t('books.deleteSheet.cancel')}
            disabled={mutation.isPending}
            onPress={modal.dismiss}
          />
        </View>
      </View>
    </BottomSheet>
  );
}
