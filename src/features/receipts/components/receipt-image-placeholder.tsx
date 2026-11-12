import { ReceiptText } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text, ToneTile } from '@/components/ui';

export function ReceiptImagePlaceholder() {
  const { t } = useTranslation();

  return (
    <View testID="receipt-image-placeholder" className="flex-row items-center gap-3 rounded-2xl bg-surface-container px-3.5 py-3">
      <ToneTile tone="expense" icon={ReceiptText} size="sm" iconSize={18} />
      <View>
        <Text className="text-row-title text-ink-900">{t('receipts.image.label')}</Text>
        <Text className="text-meta text-ink-500">{t('receipts.image.unavailable')}</Text>
      </View>
    </View>
  );
}
