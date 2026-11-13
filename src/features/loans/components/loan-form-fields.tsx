import type { useLoanForm } from '@/features/loans/hooks/use-loan-form';
import type { DebtDirection } from '@/features/loans/schemas/debt-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { Button, Input, SegmentedControl, Text } from '@/components/ui';
import { LoanDateField } from '@/features/loans/components/loan-date-field';
import { LoanFormError } from '@/features/loans/components/loan-form-error';

export type LoanFormFieldsProps = {
  form: ReturnType<typeof useLoanForm>;
  currency: string;
  onPickDate: () => void;
  onPickDueDate: () => void;
};

export function LoanFormFields({ form, currency, onPickDate, onPickDueDate }: LoanFormFieldsProps) {
  const { t } = useTranslation();
  const { values, fieldErrors, isPending } = form;
  const directions = React.useMemo(() => [
    { value: 'lent' as const, label: t('loans.direction.lent'), testID: 'loan-form-direction-lent' },
    { value: 'borrowed' as const, label: t('loans.direction.borrowed'), testID: 'loan-form-direction-borrowed' },
  ], [t]);

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View className="mb-4">
        {form.isEditing
          ? <Text testID="loan-form-direction-readonly" className="text-label text-ink-500">{t(values.direction === 'lent' ? 'loans.direction.lent' : 'loans.direction.borrowed')}</Text>
          : <SegmentedControl<DebtDirection> testID="loan-form-direction" options={directions} value={values.direction} onChange={value => form.setField('direction', value)} disabled={isPending} />}
      </View>
      <Input
        testID="loan-form-person"
        label={t(values.direction === 'lent' ? 'loans.form.lentTo' : 'loans.form.borrowedFrom')}
        placeholder={t('loans.form.personPlaceholder')}
        value={values.counterparty}
        onChangeText={text => form.setField('counterparty', text)}
        disabled={isPending}
        error={fieldErrors.counterparty}
        maxLength={100}
      />
      <Input
        testID="loan-form-amount"
        label={t('loans.form.amount')}
        value={values.amount}
        onChangeText={text => form.setField('amount', text)}
        keyboardType="decimal-pad"
        disabled={isPending}
        error={fieldErrors.amount}
        rightAccessory={<Text className="text-body font-medium text-ink-500">{currency}</Text>}
      />
      <LoanDateField testID="loan-form-date" label={t('loans.form.date')} value={values.date} error={fieldErrors.date} disabled={isPending} onPress={onPickDate} />
      <LoanDateField
        testID="loan-form-due-date"
        label={t('loans.form.dueDate')}
        value={values.dueDate}
        placeholder={t('loans.form.noDueDate')}
        clearLabel={t('loans.form.clearDueDate')}
        error={fieldErrors.dueDate}
        disabled={isPending}
        onPress={onPickDueDate}
        onClear={() => form.setField('dueDate', '')}
      />
      <Input
        testID="loan-form-note"
        label={t('loans.form.note')}
        value={values.note}
        onChangeText={text => form.setField('note', text)}
        multiline
        numberOfLines={3}
        disabled={isPending}
        error={fieldErrors.note}
        maxLength={500}
      />
      <LoanFormError testID="loan-form-error" message={form.formError} />
      <View className="mt-2 mb-4">
        <Button
          testID="loan-form-submit"
          label={t(isPending ? 'loans.form.saving' : form.isEditing ? 'loans.form.save' : 'loans.actions.add')}
          pending={isPending}
          disabled={form.isSaveDisabled}
          onPress={form.submit}
        />
      </View>
    </ScrollView>
  );
}
