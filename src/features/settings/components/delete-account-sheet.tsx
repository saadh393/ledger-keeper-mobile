import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, Button, Input, Text, useBottomSheetModalRef } from '@/components/ui';
import { useDeleteAccount } from '@/features/settings/hooks/use-delete-account';
import { isDeleteConfirmation } from '@/features/settings/utils/is-delete-confirmation';
import { ApiError } from '@/lib/api/errors';

export type DeleteAccountSheetProps = {
  onDismiss: () => void;
};

export function DeleteAccountSheet({ onDismiss }: DeleteAccountSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const modal = useBottomSheetModalRef();
  const mutation = useDeleteAccount();
  const [step, setStep] = React.useState<'explain' | 'confirm'>('explain');
  const [typed, setTyped] = React.useState('');
  const pending = mutation.isPending;
  const failed = mutation.isError && !(mutation.error instanceof ApiError && mutation.error.kind === 'unauthorized');

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const confirm = () => {
    if (!pending && isDeleteConfirmation(typed))
      mutation.mutate();
  };

  return (
    <BottomSheet ref={modal.ref} title={t('settings.deleteAccount.title')} dismissible={!pending} onDismiss={onDismiss} testID="delete-account-sheet">
      <BottomSheetView className="gap-3 px-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {step === 'explain'
          ? (
              <>
                <Text testID="delete-account-explain" className="text-body text-ink-700">{t('settings.deleteAccount.explain')}</Text>
                <View className="gap-2">
                  <Button testID="delete-account-continue" variant="destructive" label={t('settings.deleteAccount.continue')} onPress={() => setStep('confirm')} />
                  <Button testID="delete-account-cancel" variant="secondary" label={t('settings.cancel')} onPress={modal.dismiss} />
                </View>
              </>
            )
          : (
              <>
                <Text className="text-body text-ink-700">{t('settings.deleteAccount.typePrompt')}</Text>
                <Input
                  testID="delete-account-input"
                  value={typed}
                  onChangeText={setTyped}
                  editable={!pending}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  accessibilityLabel={t('settings.deleteAccount.typePrompt')}
                  containerClassName="mb-0"
                />
                {failed ? <Text testID="delete-account-error" accessibilityRole="alert" className="text-meta text-clay-500">{t('settings.deleteAccount.error')}</Text> : null}
                <View className="gap-2">
                  <Button
                    testID="delete-account-confirm"
                    variant="destructive"
                    label={pending ? t('settings.deleteAccount.deleting') : t('settings.deleteAccount.confirm')}
                    pending={pending}
                    disabled={pending || !isDeleteConfirmation(typed)}
                    onPress={confirm}
                  />
                  <Button testID="delete-account-cancel" variant="secondary" label={t('settings.cancel')} disabled={pending} onPress={modal.dismiss} />
                </View>
              </>
            )}
      </BottomSheetView>
    </BottomSheet>
  );
}
