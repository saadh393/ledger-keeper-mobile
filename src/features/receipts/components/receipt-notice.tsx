import type { ReceiptCaptureError } from '@/features/receipts/types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';
import { Button, Text } from '@/components/ui';

const noticeKeys: Record<ReceiptCaptureError | 'unavailable', string> = {
  'permission-denied': 'receipts.permission',
  'permission-blocked': 'receipts.permission',
  'failed': 'receipts.failed',
  'unavailable': 'receipts.unavailable',
};

export function ReceiptNotice({ reason }: { reason: ReceiptCaptureError | 'unavailable' }) {
  const { t } = useTranslation();

  return (
    <View testID="receipt-notice" className="flex-1 flex-row items-center justify-center gap-2">
      <Text numberOfLines={1} className="shrink text-meta text-ink-500">{t(noticeKeys[reason])}</Text>
      {reason === 'permission-blocked'
        ? <Button testID="receipt-open-settings" variant="text" size="sm" fullWidth={false} label={t('receipts.openSettings')} onPress={() => void Linking.openSettings()} />
        : null}
    </View>
  );
}
