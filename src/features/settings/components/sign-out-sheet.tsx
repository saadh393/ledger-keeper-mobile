import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, Button, useBottomSheetModalRef } from '@/components/ui';
import { useAuthStore } from '@/features/auth';

export type SignOutSheetProps = {
  onDismiss: () => void;
};

export function SignOutSheet({ onDismiss }: SignOutSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const modal = useBottomSheetModalRef();
  const signOut = useAuthStore(state => state.signOut);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const confirm = async () => {
    setPending(true);
    await signOut();
  };

  return (
    <BottomSheet ref={modal.ref} title={t('settings.signOut.title')} dismissible={!pending} onDismiss={onDismiss} testID="sign-out-sheet">
      <BottomSheetView className="px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="gap-2">
          <Button testID="sign-out-confirm" variant="destructive" label={pending ? t('settings.signOut.pending') : t('settings.signOut.confirm')} pending={pending} onPress={confirm} />
          <Button testID="sign-out-cancel" variant="secondary" label={t('settings.cancel')} disabled={pending} onPress={modal.dismiss} />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
