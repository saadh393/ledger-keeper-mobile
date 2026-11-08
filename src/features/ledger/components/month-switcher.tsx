import type { Month } from '@/features/ledger/utils/month';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { formatMonthLabel } from '@/features/ledger/utils/month';
import { resolveLanguage } from '@/lib/i18n/resolve-language';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type MonthSwitcherProps = {
  month: Month;
  isCurrentMonth: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCurrent: () => void;
};

export function MonthSwitcher({ month, isCurrentMonth, onPrevious, onNext, onCurrent }: MonthSwitcherProps) {
  const { t, i18n } = useTranslation();
  const themeColors = useThemeColors();

  return (
    <View testID="month-switcher" className="min-h-[44px] flex-row items-center justify-between px-2">
      <View className="flex-row items-center">
        <Button
          testID="month-switcher-previous"
          variant="ghost"
          size="icon"
          fullWidth={false}
          accessibilityLabel={t('ledger.previousMonth')}
          onPress={onPrevious}
        >
          <ChevronLeft size={20} strokeWidth={1.75} color={themeColors['ink-900']} />
        </Button>
        <Text testID="month-switcher-label" className="text-row-title font-medium text-ink-900 tabular-nums">
          {formatMonthLabel(month, resolveLanguage(i18n.language))}
        </Text>
        <Button
          testID="month-switcher-next"
          variant="ghost"
          size="icon"
          fullWidth={false}
          disabled={isCurrentMonth}
          accessibilityLabel={t('ledger.nextMonth')}
          onPress={onNext}
        >
          <ChevronRight size={20} strokeWidth={1.75} color={themeColors['ink-900']} />
        </Button>
      </View>
      {!isCurrentMonth && (
        <Button
          testID="month-switcher-this-month"
          variant="text"
          fullWidth={false}
          label={t('ledger.thisMonth')}
          onPress={onCurrent}
        />
      )}
    </View>
  );
}
