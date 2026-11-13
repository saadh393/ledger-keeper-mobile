import type { LanguageChoice } from '@/features/settings/utils/language-choice';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, BottomSheetView, useBottomSheetModalRef } from '@/components/ui';
import { SettingsRow } from '@/features/settings/components/settings-row';
import { useChangeLanguage } from '@/features/settings/hooks/use-change-language';
import { useLanguageStore } from '@/features/settings/store/use-language-store';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type LanguageSheetProps = {
  onDismiss: () => void;
};

export function LanguageSheet({ onDismiss }: LanguageSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const modal = useBottomSheetModalRef();
  const choice = useLanguageStore(state => state.choice);
  const changeLanguage = useChangeLanguage();
  const options: { value: LanguageChoice; label: string }[] = [
    { value: 'system', label: t('settings.language.system') },
    { value: 'en', label: 'English' },
    { value: 'bn', label: 'বাংলা' },
  ];

  React.useEffect(() => {
    modal.present();
  }, [modal]);

  const choose = (value: LanguageChoice) => {
    changeLanguage(value);
    modal.dismiss();
  };

  return (
    <BottomSheet ref={modal.ref} title={t('settings.language.label')} onDismiss={onDismiss} testID="language-sheet">
      <BottomSheetView className="px-2" style={{ paddingBottom: insets.bottom + 16 }}>
        {options.map(option => (
          <SettingsRow key={option.value} testID={`language-option-${option.value}`} label={option.label} onPress={() => choose(option.value)}>
            {option.value === choice ? <Check size={20} color={themeColors.link} /> : null}
          </SettingsRow>
        ))}
      </BottomSheetView>
    </BottomSheet>
  );
}
