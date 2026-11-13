import type { useUserProfile } from '@/features/currency';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Text } from '@/components/ui';
import { DeleteAccountSheet } from '@/features/settings/components/delete-account-sheet';
import { SettingsProfileError } from '@/features/settings/components/settings-profile-error';
import { SettingsRow } from '@/features/settings/components/settings-row';
import { SettingsRowPlaceholder } from '@/features/settings/components/settings-row-placeholder';
import { SettingsSection } from '@/features/settings/components/settings-section';
import { SignOutSheet } from '@/features/settings/components/sign-out-sheet';

export type SettingsAccountSectionProps = {
  profile: ReturnType<typeof useUserProfile>;
};

export function SettingsAccountSection({ profile }: SettingsAccountSectionProps) {
  const { t } = useTranslation();
  const [signingOut, setSigningOut] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  return (
    <SettingsSection title={t('settings.sections.account')} testID="settings-account">
      {profile.isError && !profile.data ? <SettingsProfileError testID="settings-account-error" loading={profile.isFetching} onRetry={() => profile.refetch()} /> : null}
      {!profile.isError && !profile.data ? <SettingsRowPlaceholder /> : null}
      {profile.data
        ? (
            <View testID="settings-profile" className="px-4 py-3">
              <Text numberOfLines={1} className="text-row-title text-ink-900">{profile.data.name}</Text>
              <Text numberOfLines={1} className="text-meta text-ink-500">{profile.data.email}</Text>
            </View>
          )
        : null}
      <SettingsRow testID="settings-sign-out" label={t('settings.signOut.label')} onPress={() => setSigningOut(true)} />
      <SettingsRow testID="settings-delete-account" label={t('settings.deleteAccount.label')} destructive onPress={() => setDeleting(true)} />
      {signingOut ? <SignOutSheet onDismiss={() => setSigningOut(false)} /> : null}
      {deleting ? <DeleteAccountSheet onDismiss={() => setDeleting(false)} /> : null}
    </SettingsSection>
  );
}
