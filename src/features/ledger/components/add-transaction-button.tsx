import { Plus } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type AddTransactionButtonProps = {
  onPress: () => void;
  label?: string;
  bottomInset?: number;
  testID?: string;
};

const ADD_TRANSACTION_BUTTON_BOTTOM_OFFSET = 16;

export function AddTransactionButton({
  onPress,
  label,
  bottomInset,
  testID = 'ledger-add-transaction-button',
}: AddTransactionButtonProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const text = label ?? t('ledger.actions.addTransaction');

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={text}
      onPress={onPress}
      style={{
        position: 'absolute',
        bottom: (bottomInset ?? insets.bottom) + ADD_TRANSACTION_BUTTON_BOTTOM_OFFSET,
        alignSelf: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      }}
      className="h-[44px] flex-row items-center justify-center rounded-full bg-accent px-5 active:opacity-90"
    >
      <Plus size={18} strokeWidth={2.5} color={themeColors['on-accent']} />
      <Text className="ml-2 text-row-title font-medium text-on-accent">
        {text}
      </Text>
    </Pressable>
  );
}
