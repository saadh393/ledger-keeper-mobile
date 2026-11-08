import type { DateInput } from '@/lib/format/date';
import type { Language } from '@/lib/i18n/resources';
import { formatMonthYear } from '@/lib/format/date';
import { toDayKey } from '@/lib/format/day-key';

export type Month = {
  year: number;
  month: number;
};

export type MonthRange = {
  firstDay: string;
  lastDay: string;
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function shiftMonth({ year, month }: Month, offset: number): Month {
  const index = year * 12 + month - 1 + offset;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function getCurrentMonth(now: DateInput): Month {
  const dayKey = toDayKey(now);
  return { year: Number(dayKey.slice(0, 4)), month: Number(dayKey.slice(5, 7)) };
}

export function getPreviousMonth(month: Month) {
  return shiftMonth(month, -1);
}

export function getNextMonth(month: Month) {
  return shiftMonth(month, 1);
}

export function getMonthRange({ year, month }: Month): MonthRange {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prefix = `${year}-${pad(month)}`;
  return { firstDay: `${prefix}-01`, lastDay: `${prefix}-${pad(daysInMonth)}` };
}

export function isCurrentMonth(month: Month, now: DateInput) {
  const current = getCurrentMonth(now);
  return month.year === current.year && month.month === current.month;
}

export function formatMonthLabel({ year, month }: Month, locale: Language) {
  return formatMonthYear(new Date(Date.UTC(year, month - 1, 15)), locale);
}
