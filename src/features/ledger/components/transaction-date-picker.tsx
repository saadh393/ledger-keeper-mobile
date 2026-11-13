import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import { formatMonthLabel } from '@/features/ledger/utils/month';
import { toDayKey } from '@/lib/format/day-key';
import { resolveLanguage } from '@/lib/i18n/resolve-language';
import { useThemeColors } from '@/lib/theme/use-theme-colors';

export type TransactionDatePickerProps = {
  selected: string;
  onSelect: (isoDate: string) => void;
  onBack: () => void;
  allowFuture?: boolean;
  testID?: string;
};

type DaysGridProps = {
  days: number[];
  currentYear: number;
  currentMonth: number;
  maxDayKey: string;
  selectedDayKey: string;
  onSelectDay: (day: number) => void;
};

function DaysGrid({ days, currentYear, currentMonth, maxDayKey, selectedDayKey, onSelectDay }: DaysGridProps) {
  return (
    <View className="mb-4 flex-row flex-wrap justify-center gap-1">
      {days.map((day) => {
        const dayStr = String(day).padStart(2, '0');
        const monthStr = String(currentMonth).padStart(2, '0');
        const dayKey = `${currentYear}-${monthStr}-${dayStr}`;
        const isFuture = dayKey > maxDayKey;
        const isSelected = dayKey === selectedDayKey;

        return (
          <Pressable
            key={day}
            testID={`date-picker-day-${dayKey}`}
            accessibilityRole="button"
            accessibilityLabel={`${dayKey}${isSelected ? ', selected' : ''}${isFuture ? ', future date disabled' : ''}`}
            accessibilityState={{ disabled: isFuture, selected: isSelected }}
            disabled={isFuture}
            onPress={() => onSelectDay(day)}
            className={`size-10 items-center justify-center rounded-full ${
              isSelected
                ? 'bg-accent'
                : isFuture
                  ? 'opacity-25'
                  : 'active:bg-paper-200'
            }`}
          >
            <Text
              className={`text-body font-medium tabular-nums ${
                isSelected ? 'text-on-accent' : isFuture ? 'text-ink-500' : 'text-ink-900'
              }`}
            >
              {day}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const MAX_DAY_KEY = '9999-12-31';

function useDatePickerNavigation(selected: string, onSelect: (isoDate: string) => void, allowFuture: boolean) {
  const maxDayKey = React.useMemo(() => (allowFuture ? MAX_DAY_KEY : toDayKey(new Date())), [allowFuture]);
  const [todayYear, todayMonth] = React.useMemo(() => {
    const parts = toDayKey(new Date()).split('-').map(Number);
    return [parts[0] ?? 0, parts[1] ?? 1];
  }, []);

  const selectedDayKey = React.useMemo(() => toDayKey(selected), [selected]);
  const [initialYear, initialMonth] = React.useMemo(() => {
    const parts = selectedDayKey.split('-').map(Number);
    return [parts[0] || todayYear, parts[1] || todayMonth];
  }, [selectedDayKey, todayYear, todayMonth]);

  const [currentYear, setCurrentYear] = React.useState(initialYear);
  const [currentMonth, setCurrentMonth] = React.useState(initialMonth);

  const isCurrentOrFutureMonth
    = !allowFuture && (currentYear > todayYear || (currentYear === todayYear && currentMonth >= todayMonth));

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(y => y - 1);
      setCurrentMonth(12);
    }
    else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (isCurrentOrFutureMonth)
      return;
    if (currentMonth === 12) {
      setCurrentYear(y => y + 1);
      setCurrentMonth(1);
    }
    else {
      setCurrentMonth(m => m + 1);
    }
  };

  const daysInMonth = React.useMemo(() => new Date(currentYear, currentMonth, 0).getDate(), [currentYear, currentMonth]);
  const days = React.useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const selectDay = (day: number) => {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(currentMonth).padStart(2, '0');
    const dayKey = `${currentYear}-${monthStr}-${dayStr}`;
    if (dayKey <= maxDayKey) {
      onSelect(`${dayKey}T12:00:00.000Z`);
    }
  };

  return {
    maxDayKey,
    selectedDayKey,
    currentYear,
    currentMonth,
    isCurrentOrFutureMonth,
    prevMonth,
    nextMonth,
    days,
    selectDay,
  };
}

export function TransactionDatePicker({
  selected,
  onSelect,
  onBack,
  allowFuture = false,
  testID = 'transaction-date-picker',
}: TransactionDatePickerProps) {
  const { t, i18n } = useTranslation();
  const themeColors = useThemeColors();
  const locale = resolveLanguage(i18n.language);

  const {
    maxDayKey,
    selectedDayKey,
    currentYear,
    currentMonth,
    isCurrentOrFutureMonth,
    prevMonth,
    nextMonth,
    days,
    selectDay,
  } = useDatePickerNavigation(selected, onSelect, allowFuture);

  return (
    <View testID={testID} className="flex-1">
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          testID={`${testID}-prev-month`}
          accessibilityRole="button"
          accessibilityLabel={t('ledger.previousMonth')}
          onPress={prevMonth}
          className="size-11 items-center justify-center rounded-full"
        >
          <ChevronLeft size={20} strokeWidth={1.75} color={themeColors['ink-900']} />
        </Pressable>

        <Text testID={`${testID}-month-label`} className="text-row-title font-medium text-ink-900 tabular-nums">
          {formatMonthLabel({ year: currentYear, month: currentMonth }, locale)}
        </Text>

        <Pressable
          testID={`${testID}-next-month`}
          accessibilityRole="button"
          accessibilityLabel={t('ledger.nextMonth')}
          disabled={isCurrentOrFutureMonth}
          onPress={nextMonth}
          className={`size-11 items-center justify-center rounded-full ${isCurrentOrFutureMonth ? 'opacity-30' : ''}`}
        >
          <ChevronRight size={20} strokeWidth={1.75} color={themeColors['ink-900']} />
        </Pressable>
      </View>

      <DaysGrid
        days={days}
        currentYear={currentYear}
        currentMonth={currentMonth}
        maxDayKey={maxDayKey}
        selectedDayKey={selectedDayKey}
        onSelectDay={selectDay}
      />

      <View className="mb-3 flex-row gap-2">
        <Button variant="secondary" label={t('ledger.form.today')} onPress={() => onSelect(new Date().toISOString())} className="flex-1" testID="date-picker-today" />
        <Button
          variant="secondary"
          label={t('ledger.form.yesterday')}
          onPress={() => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            onSelect(d.toISOString());
          }}
          className="flex-1"
          testID="date-picker-yesterday"
        />
      </View>

      <Button variant="secondary" label={t('ledger.form.back')} onPress={onBack} testID={`${testID}-back`} />
    </View>
  );
}
