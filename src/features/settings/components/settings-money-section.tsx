import type { useUserProfile } from '@/features/currency';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui';
import { SettingsCurrencySheet } from '@/features/settings/components/settings-currency-sheet';
import { SettingsProfileError } from '@/features/settings/components/settings-profile-error';
import { SettingsRow } from '@/features/settings/components/settings-row';
import { SettingsRowPlaceholder } from '@/features/settings/components/settings-row-placeholder';
import { SettingsSection } from '@/features/settings/components/settings-section';

export type SettingsMoneySectionProps = {
  profile: ReturnType<typeof useUserProfile>;
};

export function SettingsMoneySection({ profile }: SettingsMoneySectionProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [choosing, setChoosing] = React.useState(false);
  const currency = profile.data?.currency;

  return (
    <SettingsSection title={t('settings.sections.money')} testID="settings-money">
      {profile.isError && !profile.data ? <SettingsProfileError testID="settings-money-error" loading={profile.isFetching} onRetry={() => profile.refetch()} /> : null}
      {!profile.isError && !profile.data ? <SettingsRowPlaceholder /> : null}
      {currency
        ? (
            <>
              <SettingsRow testID="settings-currency" label={t('settings.currency.label')} value={currency} onPress={() => setChoosing(true)} />
              <Text className="px-4 pb-3 text-meta text-ink-500">{t('settings.currency.help')}</Text>
            </>
          )
        : null}
      <SettingsRow testID="settings-categories" label={t('settings.categories')} onPress={() => router.push('/categories')} />
      {choosing && currency ? <SettingsCurrencySheet currency={currency} onDismiss={() => setChoosing(false)} /> : null}
    </SettingsSection>
  );
}
