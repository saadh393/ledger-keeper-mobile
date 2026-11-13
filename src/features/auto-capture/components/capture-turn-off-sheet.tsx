import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, Button, Text, useBottomSheetModalRef } from '@/components/ui';
import { Checkbox } from '@/components/ui/checkbox';
import { useTurnOffCapture } from '@/features/auto-capture/hooks/use-turn-off-capture';

export type CaptureTurnOffSheetProps = {
  bookId: string | null;
  onDismiss: () => void;
};

export function CaptureTurnOffSheet({ bookId, onDismiss }: CaptureTurnOffSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const modal = useBottomSheetModalRef();
  const [deletePending, setDeletePending] = React.useState(false);
  const mutation = useTurnOffCapture(bookId);

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const confirm = () => {
    if (!mutation.isPending)
      mutation.mutate(deletePending, { onSuccess: modal.dismiss });
  };

  return (
    <BottomSheet ref={modal.ref} title={t('autoCapture.turnOff.title')} dismissible={!mutation.isPending} onDismiss={onDismiss} testID="capture-turn-off-sheet">
      <BottomSheetView className="gap-3 px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <Checkbox testID="capture-turn-off-delete" checked={deletePending} onChange={setDeletePending} label={t('autoCapture.turnOff.deletePending')} accessibilityLabel={t('autoCapture.turnOff.deletePending')} className="min-h-[48px]" />
        {mutation.isError ? <Text testID="capture-turn-off-error" accessibilityRole="alert" className="text-meta text-clay-500">{t('autoCapture.turnOff.error')}</Text> : null}
        <View className="gap-2">
          <Button testID="capture-turn-off-confirm" variant="destructive" label={t('autoCapture.turnOff.confirm')} pending={mutation.isPending} onPress={confirm} />
          <Button testID="capture-turn-off-cancel" variant="secondary" label={t('autoCapture.cancel')} disabled={mutation.isPending} onPress={modal.dismiss} />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
