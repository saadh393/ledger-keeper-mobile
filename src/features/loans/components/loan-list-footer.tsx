import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type LoanListFooterProps = {
  loading: boolean;
};

export function LoanListFooter({ loading }: LoanListFooterProps) {
  const themeColors = useThemeColors();
  if (!loading)
    return null;
  return (
    <View testID="loan-list-footer-loading" className="items-center py-4">
      <ActivityIndicator color={themeColors['ink-500']} />
    </View>
  );
}
