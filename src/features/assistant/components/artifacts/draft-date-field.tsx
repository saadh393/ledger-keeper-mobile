import { ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { BottomSheet, Text, useBottomSheetModalRef } from '@/components/ui';
import { TransactionDatePicker } from '@/features/ledger/components/transaction-date-picker';
import { formatDate } from '@/lib/format/date';
import { resolveLanguage } from '@/lib/i18n/resolve-language';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type DraftDateFieldProps = {
  value: string;
  onChange: (dateIso: string) => void;
  disabled: boolean;
};

export function DraftDateField({ value, onChange, disabled }: DraftDateFieldProps) {
  const { t, i18n } = useTranslation();
  const themeColors = useThemeColors();
  const modal = useBottomSheetModalRef();
  const label = formatDate(value, resolveLanguage(i18n.language));

  return (
    <View className="mb-4">
      <Text className="mb-1 text-label text-ink-900">{t('assistant.draft.date')}</Text>
      <Pressable
        testID="draft-date"
        accessibilityRole="button"
        accessibilityLabel={`${t('assistant.draft.date')}, ${label}`}
        disabled={disabled}
        onPress={() => modal.present()}
        className={`min-h-[44px] flex-row items-center rounded-[12px] bg-paper-100 px-4 py-3 ${disabled ? 'opacity-50' : ''}`}
      >
        <Text numberOfLines={1} className="flex-1 text-body-l text-ink-900 tabular-nums">{label}</Text>
        <ChevronRight size={18} strokeWidth={1.75} color={themeColors['ink-500']} />
      </Pressable>
      <BottomSheet ref={modal.ref} title={t('assistant.draft.date')} snapPoints={['70%']} showCloseButton>
        <View className="flex-1 px-4 pb-4">
          <TransactionDatePicker
            selected={value}
            onSelect={(dateIso) => {
              onChange(dateIso);
              modal.dismiss();
            }}
            onBack={modal.dismiss}
          />
        </View>
      </BottomSheet>
    </View>
  );
}
