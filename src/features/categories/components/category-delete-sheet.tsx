import type { CategoryItem } from '@/features/categories/schemas/category-schema';
import type { TxKeyPath } from '@/lib/i18n';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, useBottomSheetModalRef } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useDeleteCategory } from '@/features/categories/api/use-delete-category';
import { getCategoryErrorKey } from '@/features/categories/utils/get-category-error-key';

export type CategoryDeleteSheetProps = {
  category: CategoryItem;
  onDismiss: () => void;
};

export function CategoryDeleteSheet({ category, onDismiss }: CategoryDeleteSheetProps) {
  const { t } = useTranslation();
  const modal = useBottomSheetModalRef();
  const insets = useSafeAreaInsets();
  const mutation = useDeleteCategory();
  const submitting = React.useRef(false);
  const [errorKey, setErrorKey] = React.useState<TxKeyPath | null>(null);

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const confirm = () => {
    if (submitting.current)
      return;
    submitting.current = true;
    setErrorKey(null);
    mutation.mutate(category.id, {
      onSuccess: modal.dismiss,
      onError: error => setErrorKey(getCategoryErrorKey(error)),
      onSettled: () => {
        submitting.current = false;
      },
    });
  };

  return (
    <BottomSheet
      ref={modal.ref}
      title={t('categories.deleteSheet.title', { name: category.name })}
      dismissible={!mutation.isPending}
      onDismiss={onDismiss}
      testID="category-delete-sheet"
    >
      <BottomSheetView className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Text testID="category-delete-sheet-body" className="text-body text-ink-700">{t('categories.deleteSheet.body')}</Text>
        {errorKey
          ? <Text testID="category-delete-sheet-error" accessibilityRole="alert" className="mt-3 text-meta text-clay-500">{t(errorKey)}</Text>
          : null}
        <View className="mt-4 gap-2">
          <Button
            testID="category-delete-sheet-confirm"
            variant="destructive"
            label={t(mutation.isPending ? 'categories.deleteSheet.deleting' : 'categories.deleteSheet.confirm')}
            pending={mutation.isPending}
            onPress={confirm}
          />
          <Button
            testID="category-delete-sheet-cancel"
            variant="secondary"
            label={t('categories.deleteSheet.cancel')}
            disabled={mutation.isPending}
            onPress={modal.dismiss}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
