import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSheet } from '@/features/settings/components/language-sheet';
import { SettingsRow } from '@/features/settings/components/settings-row';
import { useLanguageStore } from '@/features/settings/store/use-language-store';

export function SettingsLanguageRow() {
  const { t } = useTranslation();
  const choice = useLanguageStore(state => state.choice);
  const [open, setOpen] = React.useState(false);
  const labels = { system: t('settings.language.system'), en: 'English', bn: 'বাংলা' };

  return (
    <>
      <SettingsRow testID="settings-language" label={t('settings.language.label')} value={labels[choice]} onPress={() => setOpen(true)} />
      {open ? <LanguageSheet onDismiss={() => setOpen(false)} /> : null}
    </>
  );
}
