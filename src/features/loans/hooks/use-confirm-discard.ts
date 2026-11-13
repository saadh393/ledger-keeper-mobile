import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

export function useConfirmDiscard(isDirty: boolean, isPending: boolean, onClose: () => void) {
  const { t } = useTranslation();
  return React.useCallback(() => {
    if (isPending)
      return;
    if (!isDirty) {
      onClose();
      return;
    }
    Alert.alert(t('ledger.form.discardTitle'), t('ledger.form.discardMessage'), [
      { text: t('ledger.form.keepEditing'), style: 'cancel' },
      { text: t('ledger.form.discard'), style: 'destructive', onPress: onClose },
    ]);
  }, [isDirty, isPending, onClose, t]);
}
