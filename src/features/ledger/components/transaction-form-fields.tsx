import type { useTransactionForm } from '@/features/ledger/hooks/use-transaction-form';
import { ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { Button, Input, SegmentedControl, Text } from '@/components/ui';
import { formatDate } from '@/lib/format/date';
import { resolveLanguage } from '@/lib/i18n/resolve-language';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

type TransactionForm = ReturnType<typeof useTransactionForm>;

export type TransactionFormFieldsProps = {
  form: TransactionForm;
  currency: string;
  onOpenCategoryPicker: () => void;
  onOpenDatePicker: () => void;
};

function AmountSection({ form, currency }: { form: TransactionForm; currency: string }) {
  const { t } = useTranslation();
  return (
    <View className="mb-4">
      <Input
        testID="transaction-form-amount"
        label={t('ledger.form.amount')}
        value={form.amount}
        onChangeText={(text) => {
          form.setAmount(text);
          form.setFieldErrors(prev => ({ ...prev, amount: undefined }));
        }}
        keyboardType="decimal-pad"
        editable={!form.isItemized && !form.isPending}
        error={form.fieldErrors.amount}
        rightAccessory={<Text className="text-body font-medium text-ink-500">{currency}</Text>}
      />
      {form.isItemized && (
        <Text testID="transaction-form-itemized-hint" className="mt-1 text-meta text-ink-500">
          {t('ledger.form.receiptTotalHint')}
        </Text>
      )}
      {form.isForeign && form.isAmountChanged && (
        <Text testID="transaction-form-foreign-hint" className="mt-1 text-meta text-wheat-500">
          {t('ledger.form.foreignAmountWarning')}
        </Text>
      )}
    </View>
  );
}

function CategoryField({ form, onOpen }: { form: TransactionForm; onOpen: () => void }) {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  return (
    <View className="mb-4">
      <Text className="mb-1 text-label text-ink-900">{t('ledger.form.category')}</Text>
      <Pressable
        testID="transaction-form-category"
        accessibilityRole="button"
        accessibilityLabel={`${t('ledger.form.category')}, ${form.category || t('ledger.form.selectCategory')}`}
        accessibilityHint={t('ledger.form.selectCategory')}
        disabled={form.isPending}
        onPress={onOpen}
        className={`min-h-[44px] flex-row items-center rounded-[12px] border bg-surface-container px-4 py-3 ${
          form.fieldErrors.category ? 'border-clay-500' : 'border-transparent'
        } ${form.isPending ? 'opacity-50' : ''}`}
      >
        {form.selectedCategoryObj && (
          <View
            className="mr-2 size-3 rounded-full"
            style={{ backgroundColor: form.selectedCategoryObj.color || themeColors['forest-500'] }}
          />
        )}
        <Text numberOfLines={1} className={`flex-1 text-body-l ${form.category ? 'text-ink-900' : 'text-ink-500'}`}>
          {form.category || t('ledger.form.selectCategory')}
        </Text>
        <ChevronRight size={18} strokeWidth={1.75} color={themeColors['ink-500']} />
      </Pressable>
      {form.fieldErrors.category && (
        <Text testID="transaction-form-category-error" accessibilityRole="alert" className="mt-1 text-meta text-clay-500">
          {form.fieldErrors.category}
        </Text>
      )}
    </View>
  );
}

function DateField({ form, onOpen }: { form: TransactionForm; onOpen: () => void }) {
  const { t, i18n } = useTranslation();
  const themeColors = useThemeColors();
  const locale = resolveLanguage(i18n.language);
  return (
    <View className="mb-4">
      <Text className="mb-1 text-label text-ink-900">{t('ledger.form.date')}</Text>
      <Pressable
        testID="transaction-form-date"
        accessibilityRole="button"
        accessibilityLabel={`${t('ledger.form.date')}, ${formatDate(form.date, locale)}`}
        accessibilityHint={t('ledger.form.selectDate')}
        disabled={form.isPending}
        onPress={onOpen}
        className={`min-h-[44px] flex-row items-center rounded-[12px] border bg-surface-container px-4 py-3 ${
          form.fieldErrors.date ? 'border-clay-500' : 'border-transparent'
        } ${form.isPending ? 'opacity-50' : ''}`}
      >
        <Text numberOfLines={1} className="flex-1 text-body-l text-ink-900 tabular-nums">
          {formatDate(form.date, locale)}
        </Text>
        <ChevronRight size={18} strokeWidth={1.75} color={themeColors['ink-500']} />
      </Pressable>
      {form.fieldErrors.date && (
        <Text testID="transaction-form-date-error" accessibilityRole="alert" className="mt-1 text-meta text-clay-500">
          {form.fieldErrors.date}
        </Text>
      )}
    </View>
  );
}

export function TransactionFormFields({
  form,
  currency,
  onOpenCategoryPicker,
  onOpenDatePicker,
}: TransactionFormFieldsProps) {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View className="mb-4">
        <SegmentedControl
          testID="transaction-form-type"
          options={form.typeOptions}
          value={form.type}
          onChange={form.handleTypeChange}
          disabled={form.isPending}
        />
      </View>

      <AmountSection form={form} currency={currency} />

      <Input
        testID="transaction-form-title"
        label={t('ledger.form.title')}
        placeholder={t('ledger.form.titlePlaceholder')}
        value={form.title}
        onChangeText={(text) => {
          form.setTitle(text);
          form.setFieldErrors(prev => ({ ...prev, title: undefined }));
        }}
        disabled={form.isPending}
        error={form.fieldErrors.title}
        maxLength={200}
      />

      <CategoryField form={form} onOpen={onOpenCategoryPicker} />
      <DateField form={form} onOpen={onOpenDatePicker} />

      <Input
        testID="transaction-form-note"
        label={t('ledger.form.noteOptional')}
        placeholder={t('ledger.form.notePlaceholder')}
        value={form.note}
        onChangeText={(text) => {
          form.setNote(text);
          form.setFieldErrors(prev => ({ ...prev, note: undefined }));
        }}
        multiline
        numberOfLines={3}
        disabled={form.isPending}
        error={form.fieldErrors.note}
        maxLength={500}
      />

      {form.formError && (
        <View testID="transaction-form-error" accessibilityRole="alert" className="mb-4 rounded-xl bg-clay-100 p-3">
          <Text className="text-body text-clay-500">{form.formError}</Text>
        </View>
      )}

      <View className="mt-2 mb-4">
        <Button
          testID="transaction-form-submit"
          label={form.isPending ? t('ledger.form.saving') : t('ledger.form.save')}
          pending={form.isPending}
          disabled={form.isSaveDisabled}
          onPress={form.handleSubmit}
        />
      </View>
    </ScrollView>
  );
}
