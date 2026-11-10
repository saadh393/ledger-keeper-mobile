import type { CategoryFormValues } from '@/features/categories/schemas/category-form-schema';
import type { CategoryItem, CategoryKind } from '@/features/categories/schemas/category-schema';
import type { TxKeyPath } from '@/lib/i18n';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '@/features/categories/api/use-categories';
import { useCreateCategory } from '@/features/categories/api/use-create-category';
import { useRenameCategory } from '@/features/categories/api/use-rename-category';
import { createCategoryFormSchema } from '@/features/categories/schemas/category-form-schema';
import { getCategoryErrorKey } from '@/features/categories/utils/get-category-error-key';

type UseCategoryFormOptions = {
  kind: CategoryKind;
  category?: CategoryItem;
  onSaved: () => void;
};

export function useCategoryForm({ kind, category, onSaved }: UseCategoryFormOptions) {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateCategory();
  const renameMutation = useRenameCategory();
  const submitting = React.useRef(false);
  const [errorKey, setErrorKey] = React.useState<TxKeyPath | null>(null);

  const schema = React.useMemo(
    () => createCategoryFormSchema({
      nameRequired: t('categories.errors.nameRequired'),
      nameTooLong: t('categories.errors.nameTooLong'),
      nameTaken: t('categories.errors.nameTaken'),
    }, categories.filter(item => item.id !== category?.id)),
    [t, categories, category?.id],
  );

  const form = useForm({
    defaultValues: { name: category?.name ?? '', kind: category?.kind ?? kind } as CategoryFormValues,
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: ({ value }) => {
      if (submitting.current)
        return;
      submitting.current = true;
      setErrorKey(null);
      const name = value.name.trim();
      const callbacks = {
        onSuccess: onSaved,
        onError: (error: unknown) => setErrorKey(getCategoryErrorKey(error)),
        onSettled: () => {
          submitting.current = false;
        },
      };
      if (category)
        renameMutation.mutate({ categoryId: category.id, name }, callbacks);
      else
        createMutation.mutate({ name, kind: value.kind }, callbacks);
    },
  });

  return { form, errorKey, isPending: createMutation.isPending || renameMutation.isPending };
}
