import type { CategoryItem, CategoryKind } from '@/features/categories/schemas/category-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, useBottomSheetModalRef } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { getFieldError } from '@/components/ui/form-utils';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Text } from '@/components/ui/text';
import { CategoryNameField } from '@/features/categories/components/category-name-field';
import { useCategoryForm } from '@/features/categories/hooks/use-category-form';

export type CategoryFormSheetProps = {
  kind: CategoryKind;
  category?: CategoryItem;
  onDismiss: () => void;
};

export function CategoryFormSheet({ kind, category, onDismiss }: CategoryFormSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();
  const { form, errorKey, isPending } = useCategoryForm({ kind, category, onSaved: modal.dismiss });
  const kindOptions = React.useMemo(() => [
    { value: 'income' as const, label: t('ledger.types.income') },
    { value: 'expense' as const, label: t('ledger.types.expense') },
  ], [t]);

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  return (
    <BottomSheet ref={modal.ref} title={t(category ? 'categories.form.renameTitle' : 'categories.form.title')} dismissible={!isPending} onDismiss={onDismiss} testID="category-form-sheet">
      <BottomSheetView className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {category
          ? null
          : (
              <form.Field name="kind">
                {field => (
                  <SegmentedControl<CategoryKind>
                    testID="category-form-kind"
                    className="mb-3"
                    options={kindOptions}
                    value={field.state.value}
                    disabled={isPending}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>
            )}
        <form.Field name="name">
          {field => (
            <CategoryNameField
              value={field.state.value}
              error={getFieldError(field)}
              disabled={isPending}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>
        {errorKey
          ? <Text testID="category-form-sheet-error" accessibilityRole="alert" className="mb-3 text-meta text-clay-500">{t(errorKey)}</Text>
          : null}
        <form.Subscribe selector={state => state.values.name}>
          {name => (
            <Button
              testID="category-form-sheet-submit"
              label={t(category
                ? (isPending ? 'categories.form.saving' : 'categories.form.saveRename')
                : (isPending ? 'categories.form.adding' : 'categories.form.save'))}
              pending={isPending}
              disabled={Boolean(category) && name.trim() === category?.name}
              onPress={() => void form.handleSubmit()}
            />
          )}
        </form.Subscribe>
      </BottomSheetView>
    </BottomSheet>
  );
}
