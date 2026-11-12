import type { useDraftAction } from '@/features/assistant/api/use-draft-action';
import type { ReceiptDraftArtifactData } from '@/features/receipts/schemas/receipt-artifact-schemas';
import type { ReceiptDraftValues } from '@/features/receipts/utils/receipt-draft-values';
import { randomUUID } from 'expo-crypto';
import { ReceiptText } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Input, Text } from '@/components/ui';
import { ArtifactCard } from '@/features/assistant/components/artifacts/artifact-card';
import { DraftActionError } from '@/features/assistant/components/artifacts/draft-action-error';
import { DraftDateField } from '@/features/assistant/components/artifacts/draft-date-field';
import { ReceiptDraftItem } from '@/features/receipts/components/receipt-draft-item';
import { ReceiptDraftTotals } from '@/features/receipts/components/receipt-draft-totals';
import { ReceiptInstallmentFields } from '@/features/receipts/components/receipt-installment-fields';
import { ReceiptPlanFields } from '@/features/receipts/components/receipt-plan-fields';
import { createReceiptItem, getReceiptTotals, MAX_RECEIPT_ITEMS, toPayInstallmentInput, toReceiptConfirmInput } from '@/features/receipts/utils/receipt-draft-values';
import { formatCurrency } from '@/lib/format/currency';
import { formatDate } from '@/lib/format/date';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type ReceiptDraftEditorProps = {
  data: ReceiptDraftArtifactData;
  values: ReceiptDraftValues;
  onChange: (values: ReceiptDraftValues) => void;
  currency: string;
  action: ReturnType<typeof useDraftAction>;
};

function getSaveLabel(isPaying: boolean, isEmi: boolean) {
  if (isPaying)
    return 'receipts.draft.payInstallment';
  return isEmi ? 'receipts.draft.createPlan' : 'receipts.draft.save';
}

export function ReceiptDraftEditor({ data, values, onChange, currency, action }: ReceiptDraftEditorProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);
  const isPaying = data.documentType === 'installment_payment' && data.plans.length > 0;
  const disabled = Boolean(action.pending);
  const isSaving = action.pending === 'confirm-receipt' || action.pending === 'pay-installment';
  const { subtotal, total } = getReceiptTotals(values.items, data.adjustment);
  const confirmInput = isPaying ? null : toReceiptConfirmInput(values, data.adjustment);
  const payInput = isPaying ? toPayInstallmentInput(values) : null;
  const { items } = values;

  const save = () => {
    if (payInput)
      action.run({ type: 'pay-installment', input: payInput });
    else if (confirmInput)
      action.run({ type: 'confirm-receipt', input: confirmInput });
  };

  return (
    <ArtifactCard
      testID="receipt-draft"
      label={t('receipts.draft.label')}
      icon={ReceiptText}
      tone="warning"
      meta={<Text className="rounded-full bg-wheat-200 px-2 py-0.5 text-meta font-semibold text-ink-900">{t('receipts.draft.badge')}</Text>}
      footer={(
        <>
          <DraftActionError failed={action.failed} onRetry={action.retry} />
          {confirmInput || payInput ? null : <Text className="w-full px-2 text-meta text-ink-500">{t(isPaying ? 'receipts.draft.needsPlan' : 'receipts.draft.needsItems')}</Text>}
          <View className="w-full flex-row justify-end gap-2">
            <Button
              testID="receipt-discard"
              variant="ghost"
              size="sm"
              fullWidth={false}
              label={action.pending === 'dismiss' ? t('assistant.draft.discarding') : t('assistant.draft.discard')}
              disabled={disabled}
              pending={action.pending === 'dismiss'}
              onPress={() => action.run({ type: 'dismiss' })}
            />
            <Button
              testID="receipt-save"
              size="sm"
              fullWidth={false}
              label={isSaving ? t('assistant.draft.saving') : t(getSaveLabel(isPaying, values.emi))}
              disabled={!(confirmInput || payInput) || disabled}
              pending={isSaving}
              onPress={save}
            />
          </View>
        </>
      )}
    >
      <View className="pt-3">
        <Input
          testID="receipt-merchant"
          label={t('receipts.draft.merchant')}
          placeholder={t('receipts.draft.merchantPlaceholder')}
          value={values.merchant}
          onChangeText={merchant => onChange({ ...values, merchant })}
          disabled={disabled}
          maxLength={200}
          className="bg-paper-100"
        />
        <DraftDateField value={values.dateIso} onChange={dateIso => onChange({ ...values, dateIso })} disabled={disabled} />
        {data.duplicate
          ? (
              <Text testID="receipt-duplicate" accessibilityRole="alert" className="mb-4 rounded-2xl bg-wheat-200 px-3 py-2 text-meta text-ink-900">
                {t('receipts.draft.duplicate', {
                  title: data.duplicate.title,
                  date: formatDate(data.duplicate.dateIso, locale),
                  amount: formatCurrency(data.duplicate.amount, locale, currency),
                })}
              </Text>
            )
          : null}
        {isPaying
          ? <ReceiptPlanFields plans={data.plans} values={values} currency={currency} disabled={disabled} onChange={onChange} />
          : (
              <>
                {items.map((item, index) => (
                  <ReceiptDraftItem
                    key={item.key}
                    item={item}
                    index={index}
                    categories={data.categories}
                    canRemove={items.length > 1}
                    disabled={disabled}
                    onChange={next => onChange({ ...values, items: items.map(entry => (entry.key === item.key ? next : entry)) })}
                    onRemove={() => onChange({ ...values, items: items.filter(entry => entry.key !== item.key) })}
                  />
                ))}
                <Button
                  testID="receipt-add-item"
                  variant="secondary"
                  size="sm"
                  fullWidth={false}
                  label={t('receipts.draft.add')}
                  disabled={disabled || items.length >= MAX_RECEIPT_ITEMS}
                  onPress={() => onChange({ ...values, items: [...items, createReceiptItem(randomUUID())] })}
                  className="mb-4 self-start"
                />
                <ReceiptDraftTotals subtotal={subtotal} adjustment={data.adjustment} total={total} original={data.original} currency={currency} />
                <ReceiptInstallmentFields values={values} disabled={disabled} onChange={onChange} />
              </>
            )}
      </View>
    </ArtifactCard>
  );
}
