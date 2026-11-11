import type { SummaryArtifactData } from '@/features/assistant/schemas/transaction-artifact-schemas';
import type { Language } from '@/lib/i18n/resources';
import { formatDate, formatMonthYear } from '@/lib/format/date';

export function formatSummaryPeriod({ periodIso, fromDate, toDate }: Pick<SummaryArtifactData, 'periodIso' | 'fromDate' | 'toDate'>, locale: Language): string {
  if (fromDate && toDate && fromDate !== toDate)
    return `${formatDate(fromDate, locale)} – ${formatDate(toDate, locale)}`;
  const day = fromDate ?? toDate;
  return day ? formatDate(day, locale) : formatMonthYear(periodIso, locale);
}
