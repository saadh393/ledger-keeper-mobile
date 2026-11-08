import type { DateInput } from '@/lib/format/date';
import type { Language } from '@/lib/i18n/resources';
import { formatMonthDay, resolveDate } from '@/lib/format/date';
import { toDayKey } from '@/lib/format/day-key';
import { resources } from '@/lib/i18n/resources';

const dayInMs = 24 * 60 * 60 * 1000;

export function formatDayHeader(value: DateInput, locale: Language, now: DateInput) {
  const labels = resources[locale].translation.dayHeader;
  const dayKey = toDayKey(value);
  const today = resolveDate(now);

  if (dayKey === toDayKey(today))
    return labels.today;
  if (dayKey === toDayKey(new Date(today.getTime() - dayInMs)))
    return labels.yesterday;
  return formatMonthDay(value, locale);
}
