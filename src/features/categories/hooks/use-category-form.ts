import type { CategoryFormValues } from '@/features/categories/schemas/category-form-schema';
import type { CategoryKind } from '@/features/categories/schemas/category-schema';
import type { TxKeyPath } from '@/lib/i18n';
import { useForm } from '@tanstack/react-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '@/features/categories/api/use-categories';
import { useCreateCategory } from '@/features/categories/api/use-create-category';
import { createCategoryFormSchema } from '@/features/categories/schemas/category-form-schema';
import { getCategoryErrorKey } from '@/features/categories/utils/get-category-error-key';

type UseCategoryFormOptions = {
  kind: CategoryKind;
  onSaved: () => void;
};

export function useCategoryForm({ kind, onSaved }: UseCategoryFormOptions) {
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories();
  const mutation = useCreateCategory();
  const submitting = React.useRef(false);
  const [errorKey, setErrorKey] = React.useState<TxKeyPath | null>(null);

  const schema = React.useMemo(
    () => createCategoryFormSchema({
      nameRequired: t('categories.errors.nameRequired'),
      nameTooLong: t('categories.errors.nameTooLong'),
      nameTaken: t('categories.errors.nameTaken'),
    }, categories),
    [t, categories],
  );

  const form = useForm({
    defaultValues: { name: '', kind } as CategoryFormValues,
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: ({ value }) => {
      if (submitting.current)
        return;
      submitting.current = true;
      setErrorKey(null);
      mutation.mutate({ name: value.name.trim(), kind: value.kind }, {
        onSuccess: onSaved,
        onError: error => setErrorKey(getCategoryErrorKey(error)),
        onSettled: () => {
          submitting.current = false;
        },
      });
    },
  });

  return { form, errorKey, isPending: mutation.isPending };
}
