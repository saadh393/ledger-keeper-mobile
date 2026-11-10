import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { CATEGORY_NAME_MAX_LENGTH } from '@/features/categories/schemas/category-form-schema';

export type CategoryNameFieldProps = {
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
};

export function CategoryNameField({ value, error, disabled, onChange, onBlur }: CategoryNameFieldProps) {
  const { t } = useTranslation();
  const length = value.trim().length;

  return (
    <>
      <Input
        testID="category-form-name"
        label={t('categories.form.name')}
        placeholder={t('categories.form.namePlaceholder')}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        error={error}
        disabled={disabled}
        autoCapitalize="sentences"
        containerClassName="mb-1"
      />
      <Text
        testID="category-form-name-counter"
        className={`mb-3 text-right text-meta tabular-nums ${length > CATEGORY_NAME_MAX_LENGTH ? 'text-clay-500' : 'text-ink-500'}`}
      >
        {`${length}/${CATEGORY_NAME_MAX_LENGTH}`}
      </Text>
    </>
  );
}
