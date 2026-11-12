import type { ReceiptDraftValues } from '@/features/receipts/utils/receipt-draft-values';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Input, Switch } from '@/components/ui';

export type ReceiptInstallmentFieldsProps = {
  values: ReceiptDraftValues;
  disabled: boolean;
  onChange: (values: ReceiptDraftValues) => void;
};

export function ReceiptInstallmentFields({ values, disabled, onChange }: ReceiptInstallmentFieldsProps) {
  const { t } = useTranslation();

  return (
    <View>
      <Switch
        testID="receipt-emi"
        label={t('receipts.draft.emi')}
        accessibilityLabel={t('receipts.draft.emi')}
        checked={values.emi}
        onChange={emi => onChange({ ...values, emi })}
        disabled={disabled}
        className="mb-4 min-h-[44px]"
      />
      {values.emi
        ? (
            <View className="flex-row gap-2">
              <Input
                testID="receipt-emi-count"
                label={t('receipts.draft.count')}
                placeholder="12"
                value={values.count}
                onChangeText={count => onChange({ ...values, count })}
                keyboardType="number-pad"
                maxLength={3}
                disabled={disabled}
                className="bg-paper-100 tabular-nums"
                containerClassName="flex-1"
              />
              <Input
                testID="receipt-emi-amount"
                label={t('receipts.draft.perInstallment')}
                placeholder="0"
                value={values.perInstallment}
                onChangeText={perInstallment => onChange({ ...values, perInstallment })}
                keyboardType="decimal-pad"
                disabled={disabled}
                className="bg-paper-100 tabular-nums"
                containerClassName="flex-1"
              />
            </View>
          )
        : null}
    </View>
  );
}
