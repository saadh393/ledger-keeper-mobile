import type { ReceiptDraftValues } from '@/features/receipts/utils/receipt-draft-values';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Input, Select, Text } from '@/components/ui';

export type ReceiptPlanFieldsProps = {
  plans: string[];
  values: ReceiptDraftValues;
  currency: string;
  disabled: boolean;
  onChange: (values: ReceiptDraftValues) => void;
};

export function ReceiptPlanFields({ plans, values, currency, disabled, onChange }: ReceiptPlanFieldsProps) {
  const { t } = useTranslation();

  return (
    <View>
      <Select
        testID="receipt-plan"
        label={t('receipts.draft.plan')}
        value={values.plan || undefined}
        options={plans.map(name => ({ label: name, value: name }))}
        onSelect={plan => onChange({ ...values, plan: String(plan) })}
        disabled={disabled}
      />
      <Input
        testID="receipt-paid"
        label={t('receipts.draft.paid')}
        placeholder="0"
        value={values.paid}
        onChangeText={paid => onChange({ ...values, paid })}
        keyboardType="decimal-pad"
        disabled={disabled}
        className="bg-paper-100 tabular-nums"
        rightAccessory={<Text className="text-body font-medium text-ink-500">{currency}</Text>}
      />
    </View>
  );
}
