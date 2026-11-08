import type { BookFormValues } from '@/features/books/schemas/book-form-schema';
import type { Book } from '@/features/books/schemas/book-schema';
import type { BookError } from '@/features/books/utils/get-book-error';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateBook } from '@/features/books/api/use-create-book';
import { useUpdateBook } from '@/features/books/api/use-update-book';
import { createBookFormSchema } from '@/features/books/schemas/book-form-schema';
import { useActiveBookStore } from '@/features/books/store/use-active-book-store';
import { getBookChanges } from '@/features/books/utils/get-book-changes';
import { getBookError } from '@/features/books/utils/get-book-error';

type UseBookFormOptions = {
  book?: Book;
  defaultCurrency: string;
  onSaved: () => void;
};

export function useBookForm({ book, defaultCurrency, onSaved }: UseBookFormOptions) {
  const { t } = useTranslation();
  const [serverError, setServerError] = React.useState<BookError | null>(null);
  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();
  const setActiveBookId = useActiveBookStore(state => state.setActiveBookId);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const schema = React.useMemo(
    () => createBookFormSchema({
      nameRequired: t('books.errors.nameRequired'),
      nameTooLong: t('books.errors.nameTooLong'),
    }),
    [t],
  );

  const form = useForm({
    defaultValues: {
      name: book?.name ?? '',
      currency: book?.currency ?? defaultCurrency,
    } as BookFormValues,
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: ({ value }) => {
      if (createMutation.isPending || updateMutation.isPending) {
        return;
      }
      setServerError(null);
      const onError = (error: unknown) => setServerError(getBookError(error));
      if (book) {
        updateMutation.mutate(
          { bookId: book.id, patch: getBookChanges(book, value) },
          { onSuccess: onSaved, onError },
        );
        return;
      }
      createMutation.mutate(
        { name: value.name.trim(), currency: value.currency },
        {
          onSuccess: (created) => {
            setActiveBookId(created.id);
            onSaved();
          },
          onError,
        },
      );
    },
  });

  return { form, serverError, setServerError, isPending };
}
