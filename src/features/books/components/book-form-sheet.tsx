import type { Book } from '@/features/books/schemas/book-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { BottomSheet, useBottomSheetModalRef } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { getFieldError } from '@/components/ui/form-utils';
import { BookCurrencyField } from '@/features/books/components/book-currency-field';
import { BookCurrencyPicker } from '@/features/books/components/book-currency-picker';
import { BookErrorBanner } from '@/features/books/components/book-error-banner';
import { BookNameField } from '@/features/books/components/book-name-field';
import { useBookForm } from '@/features/books/hooks/use-book-form';
import { getBookChanges } from '@/features/books/utils/get-book-changes';
import { useUserProfile } from '@/features/currency';

export type BookFormSheetProps = {
  book?: Book;
  onDismiss: () => void;
  testID?: string;
};

export function BookFormSheet({ book, onDismiss, testID = 'book-form-sheet' }: BookFormSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const { data: profile } = useUserProfile();
  const defaultCurrency = profile?.currency ?? 'BDT';
  const [isPickingCurrency, setIsPickingCurrency] = React.useState(false);
  const snapPoints = React.useMemo(() => ['85%'], []);
  const { form, serverError, setServerError, isPending } = useBookForm({
    book,
    defaultCurrency,
    onSaved: modal.dismiss,
  });

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const submit = React.useCallback(() => {
    void form.handleSubmit();
  }, [form]);

  const fieldError = (field: 'name' | 'currency') =>
    serverError?.field === field ? t(serverError.messageKey) : undefined;

  const submitLabel = book
    ? t(isPending ? 'books.form.saving' : 'books.form.save')
    : t(isPending ? 'books.form.creating' : 'books.form.create');

  return (
    <BottomSheet
      ref={modal.ref}
      snapPoints={snapPoints}
      title={t(book ? 'books.form.editTitle' : 'books.form.createTitle')}
      dismissible
      showCloseButton
      onDismiss={onDismiss}
      testID={testID}
    >
      <View testID={testID} className="flex-1 px-4 pb-4">
        {isPickingCurrency
          ? (
              <form.Field name="currency">
                {field => (
                  <BookCurrencyPicker
                    selected={field.state.value}
                    defaultCurrency={defaultCurrency}
                    onSelect={(code) => {
                      field.handleChange(code);
                      setServerError(error => (error?.field === 'currency' ? null : error));
                      setIsPickingCurrency(false);
                    }}
                    onBack={() => setIsPickingCurrency(false)}
                  />
                )}
              </form.Field>
            )
          : (
              <>
                <form.Field name="name">
                  {field => (
                    <BookNameField
                      value={field.state.value}
                      error={getFieldError(field) ?? fieldError('name')}
                      disabled={isPending}
                      onChange={(value) => {
                        field.handleChange(value);
                        setServerError(error => (error?.field === 'name' ? null : error));
                      }}
                      onBlur={field.handleBlur}
                    />
                  )}
                </form.Field>
                <form.Field name="currency">
                  {field => (
                    <BookCurrencyField
                      value={field.state.value}
                      error={fieldError('currency')}
                      disabled={isPending}
                      onPress={() => setIsPickingCurrency(true)}
                    />
                  )}
                </form.Field>
                {serverError?.field === 'form' && (
                  <BookErrorBanner
                    message={t(serverError.messageKey)}
                    onRetry={serverError.retryable ? submit : undefined}
                    testID={`${testID}-error`}
                  />
                )}
                <form.Subscribe selector={state => state.values}>
                  {values => (
                    <Button
                      testID={`${testID}-submit`}
                      label={submitLabel}
                      pending={isPending}
                      disabled={Boolean(book) && Object.keys(getBookChanges(book!, values)).length === 0}
                      onPress={submit}
                    />
                  )}
                </form.Subscribe>
              </>
            )}
      </View>
    </BottomSheet>
  );
}
