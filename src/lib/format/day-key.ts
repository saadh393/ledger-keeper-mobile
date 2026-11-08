import type { DateInput } from '@/lib/format/date';
import { resolveDate } from '@/lib/format/date';
import { timeZone } from '@/lib/format/locale';

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone,
});

export function toDayKey(value: DateInput) {
  const parts = dayKeyFormatter.formatToParts(resolveDate(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}
