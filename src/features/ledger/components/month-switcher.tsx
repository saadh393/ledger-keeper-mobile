import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useLedgerMonth } from '@/features/ledger/hooks/use-ledger-month';
import { formatMonthLabel } from '@/features/ledger/utils/month';
import { resolveLanguage } from '@/lib/i18n/resolve-language';
import { useThemeColors } from '@/lib/theme/use-theme-colors';
import { twMerge } from '@/lib/tw-merge';

const arrowHitSlop = { top: 0, bottom: 0, left: 4, right: 4 };

export function MonthSwitcher() {
  const { t, i18n } = useTranslation();
  const themeColors = useThemeColors();
  const { month, isCurrentMonth, goToPreviousMonth, goToNextMonth, goToCurrentMonth } = useLedgerMonth();
  const label = formatMonthLabel(month, resolveLanguage(i18n.language));

  return (
    <View testID="month-switcher" className="min-w-0 flex-1 flex-row items-center">
      <Pressable
        testID="month-switcher-previous"
        accessibilityRole="button"
        accessibilityLabel={t('ledger.previousMonth')}
        onPress={goToPreviousMonth}
        hitSlop={arrowHitSlop}
        className="h-11 w-9 items-center justify-center rounded-full active:bg-paper-200"
      >
        <ChevronLeft size={20} strokeWidth={1.75} color={themeColors['ink-900']} />
      </Pressable>
      <Pressable
        testID={isCurrentMonth ? 'month-switcher-current' : 'month-switcher-this-month'}
        accessibilityRole={isCurrentMonth ? 'header' : 'button'}
        accessibilityLabel={isCurrentMonth ? label : `${label}, ${t('ledger.thisMonth')}`}
        disabled={isCurrentMonth}
        onPress={goToCurrentMonth}
        className="h-11 min-w-0 shrink justify-center rounded-full px-1 active:bg-paper-200"
      >
        <Text
          testID="month-switcher-label"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          className={twMerge('text-title font-medium text-ink-900 tabular-nums', !isCurrentMonth && 'text-link')}
        >
          {label}
        </Text>
      </Pressable>
      <Pressable
        testID="month-switcher-next"
        accessibilityRole="button"
        accessibilityLabel={t('ledger.nextMonth')}
        accessibilityState={{ disabled: isCurrentMonth }}
        disabled={isCurrentMonth}
        onPress={goToNextMonth}
        hitSlop={arrowHitSlop}
        className={twMerge('h-11 w-9 items-center justify-center rounded-full active:bg-paper-200', isCurrentMonth && 'opacity-40')}
      >
        <ChevronRight size={20} strokeWidth={1.75} color={themeColors['ink-900']} />
      </Pressable>
    </View>
  );
}
