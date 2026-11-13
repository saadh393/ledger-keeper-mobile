import type { Installment } from '@/features/installments/schemas/installment-schema';
import type { InstallmentActions } from '@/features/installments/types';
import type { Language } from '@/lib/i18n/resources';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { Button, Text } from '@/components/ui';
import { InstallmentPaymentHistory } from '@/features/installments/components/installment-payment-history';

export type InstallmentRowDetailsProps = InstallmentActions & {
  bookId: string;
  installment: Installment;
  locale: Language;
};

const expandMs = 120;

export function InstallmentRowDetails({ bookId, installment, locale, onEdit, onPay, onDelete, onUndo }: InstallmentRowDetailsProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();

  return (
    <Animated.View testID="installment-row-details" entering={reducedMotion ? undefined : FadeIn.duration(expandMs)} className="mx-4 mb-2 gap-3 rounded-2xl bg-surface-container px-4 py-3">
      <View className="gap-1">
        <Text className="text-meta text-ink-500">{t('installments.details.payments')}</Text>
        <InstallmentPaymentHistory bookId={bookId} installment={installment} locale={locale} onUndo={onUndo} />
      </View>
      <View className="flex-row flex-wrap gap-2">
        {installment.status === 'active'
          ? <Button testID="installment-row-pay" size="sm" fullWidth={false} label={t('installments.actions.pay')} onPress={() => onPay(installment)} />
          : null}
        <Button testID="installment-row-edit" variant="outline" size="sm" fullWidth={false} label={t('installments.actions.edit')} onPress={() => onEdit(installment)} />
        <Button testID="installment-row-delete" variant="destructive" size="sm" fullWidth={false} label={t('installments.actions.delete')} onPress={() => onDelete(installment)} />
      </View>
    </Animated.View>
  );
}
