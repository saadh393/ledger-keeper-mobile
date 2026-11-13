import type { BottomSheetRef } from '@/components/ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, Button, Text } from '@/components/ui';

export type LoanConfirmSheetProps = {
  modalRef: React.Ref<BottomSheetRef>;
  title: string;
  body: string;
  confirmLabel: string;
  pendingLabel: string;
  pending: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  onDismiss: () => void;
  testID: string;
};

export function LoanConfirmSheet({ modalRef, title, body, confirmLabel, pendingLabel, pending, error, onConfirm, onCancel, onDismiss, testID }: LoanConfirmSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <BottomSheet ref={modalRef} title={title} dismissible={!pending} onDismiss={onDismiss} testID={testID}>
      <BottomSheetView className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Text testID={`${testID}-body`} className="text-body text-ink-700">{body}</Text>
        {error ? <Text testID={`${testID}-error`} accessibilityRole="alert" className="mt-3 text-meta text-clay-500">{error}</Text> : null}
        <View className="mt-4 gap-2">
          <Button testID={`${testID}-confirm`} variant="destructive" label={pending ? pendingLabel : confirmLabel} pending={pending} onPress={onConfirm} />
          <Button testID={`${testID}-cancel`} variant="secondary" label={t('loans.cancel')} disabled={pending} onPress={onCancel} />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
