import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SettingsAutoCaptureRow } from '@/features/auto-capture/components/settings-auto-capture-row';
import { useUserProfile } from '@/features/currency';
import { LedgerSummaryToggle } from '@/features/ledger';
import { SettingsAccountSection } from '@/features/settings/components/settings-account-section';
import { SettingsFooter } from '@/features/settings/components/settings-footer';
import { SettingsLanguageRow } from '@/features/settings/components/settings-language-row';
import { SettingsMoneySection } from '@/features/settings/components/settings-money-section';
import { SettingsSection } from '@/features/settings/components/settings-section';
import { SettingsThemeRow } from '@/features/settings/components/settings-theme-row';

export function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const profile = useUserProfile();

  return (
    <ScrollView testID="settings-screen" className="flex-1 bg-paper-100" contentContainerClassName="px-4" contentContainerStyle={{ paddingBottom: insets.bottom }}>
      <SettingsSection title={t('settings.sections.appearance')} testID="settings-appearance">
        <SettingsThemeRow />
        <SettingsLanguageRow />
      </SettingsSection>
      <SettingsSection title={t('settings.sections.ledger')}>
        <LedgerSummaryToggle />
      </SettingsSection>
      <SettingsMoneySection profile={profile} />
      <SettingsAutoCaptureRow />
      <SettingsAccountSection profile={profile} />
      <SettingsFooter />
    </ScrollView>
  );
}
