import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { BOOK_NAME_MAX_LENGTH } from '@/features/books/schemas/book-form-schema';

export type BookNameFieldProps = {
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function BookNameField({ value, error, disabled, onChange, onBlur }: BookNameFieldProps) {
  const { t } = useTranslation();
  const isOverLimit = value.trim().length > BOOK_NAME_MAX_LENGTH;

  return (
    <>
      <Input
        testID="book-form-name"
        label={t('books.form.name')}
        placeholder={t('books.form.namePlaceholder')}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        error={error}
        disabled={disabled}
        autoCapitalize="sentences"
        containerClassName="mb-1"
      />
      <Text
        testID="book-form-name-counter"
        className={`mb-3 text-right text-meta tabular-nums ${isOverLimit ? 'text-clay-500' : 'text-ink-500'}`}
      >
        {`${value.trim().length}/${BOOK_NAME_MAX_LENGTH}`}
      </Text>
    </>
  );
}
