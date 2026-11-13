import type { useInstallmentForm } from '@/features/installments/hooks/use-installment-form';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { Button, Input, Text } from '@/components/ui';
import { InstallmentCategoryField } from '@/features/installments/components/installment-category-field';
import { InstallmentTotalPreview } from '@/features/installments/components/installment-total-preview';
import { LoanFormError } from '@/features/loans/components/loan-form-error';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type InstallmentFormFieldsProps = {
  form: ReturnType<typeof useInstallmentForm>;
  currency: string;
  paidCount: number;
  onPickCategory: () => void;
};

export function InstallmentFormFields({ form, currency, paidCount, onPickCategory }: InstallmentFormFieldsProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const { values, fieldErrors, isPending } = form;

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Input
        testID="installment-form-title"
        label={t('installments.form.title')}
        placeholder={t('installments.form.titlePlaceholder')}
        value={values.title}
        onChangeText={text => form.setField('title', text)}
        disabled={isPending}
        error={fieldErrors.title}
        maxLength={200}
      />
      <InstallmentCategoryField value={values.category} error={fieldErrors.category} disabled={isPending} onPress={onPickCategory} />
      <Input
        testID="installment-form-amount"
        label={t('installments.form.amount')}
        value={values.amount}
        onChangeText={text => form.setField('amount', text)}
        keyboardType="decimal-pad"
        disabled={isPending}
        error={fieldErrors.amount}
        rightAccessory={<Text className="text-body font-medium text-ink-500">{currency}</Text>}
      />
      <Input
        testID="installment-form-count"
        label={t('installments.form.count')}
        value={values.totalCount}
        onChangeText={text => form.setField('totalCount', text)}
        keyboardType="number-pad"
        disabled={isPending}
        error={fieldErrors.totalCount}
      />
      {paidCount > 0 ? <Text testID="installment-form-paid" className="-mt-2 mb-4 text-meta text-ink-500">{t('installments.form.alreadyPaid', { paid: formatNumber(paidCount, locale) })}</Text> : null}
      <InstallmentTotalPreview amount={values.amount} totalCount={values.totalCount} currency={currency} locale={locale} />
      <LoanFormError testID="installment-form-error" message={form.formError} />
      <View className="mt-2 mb-4">
        <Button
          testID="installment-form-submit"
          label={t(isPending ? 'installments.form.saving' : form.isEditing ? 'installments.form.save' : 'installments.actions.add')}
          pending={isPending}
          disabled={form.isSaveDisabled}
          onPress={form.submit}
        />
      </View>
    </ScrollView>
  );
}
