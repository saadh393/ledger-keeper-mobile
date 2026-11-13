import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { setSessionNotice, signOut } from '@/features/auth';
import { deleteAccount } from '@/features/settings/api/delete-account';
import { clearAccountData } from '@/features/settings/utils/clear-account-data';
import { ApiError } from '@/lib/api/errors';

export function useDeleteAccount() {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: async () => {
      await clearAccountData();
      setSessionNotice(t('settings.deleteAccount.deleted'));
    },
    onError: async (error) => {
      if (!(error instanceof ApiError) || error.kind !== 'unauthorized')
        return;
      await signOut();
      setSessionNotice(t('settings.deleteAccount.signInAgain'));
    },
  });
}
