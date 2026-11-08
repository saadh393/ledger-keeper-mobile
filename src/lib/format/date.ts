import type { Language } from '@/lib/i18n/resources';
import { resolveLocale, timeZone } from '@/lib/format/locale';

export type DateInput = Date | string;

type OrderedDateOptions = {
  month: 'short' | 'long';
  includeYear: boolean;
};

export function resolveDate(value: DateInput) {
  return value instanceof Date ? value : new Date(value);
}

function formatOrderedDate(value: DateInput, locale: Language, { month, includeYear }: OrderedDateOptions) {
  const parts = new Intl.DateTimeFormat(resolveLocale(locale), {
    day: 'numeric',
    month,
    ...(includeYear ? { year: 'numeric' } : {}),
    timeZone,
  }).formatToParts(resolveDate(value));

  const day = parts.find(part => part.type === 'day')?.value ?? '';
  const monthValue = parts.find(part => part.type === 'month')?.value ?? '';
  const year = parts.find(part => part.type === 'year')?.value ?? '';

  return includeYear ? `${day} ${monthValue} ${year}` : `${day} ${monthValue}`;
}

export function formatDate(value: DateInput, locale: Language) {
  return formatOrderedDate(value, locale, { month: 'short', includeYear: true });
}

export function formatTime(value: DateInput, locale: Language) {
  return new Intl.DateTimeFormat(resolveLocale(locale), {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(resolveDate(value));
}

export function formatDateTime(value: DateInput, locale: Language) {
  return `${formatDate(value, locale)} · ${formatTime(value, locale)}`;
}

export function formatMonthDay(value: DateInput, locale: Language) {
  return formatOrderedDate(value, locale, { month: 'short', includeYear: false });
}

export function formatMonthYear(value: DateInput, locale: Language) {
  return new Intl.DateTimeFormat(resolveLocale(locale), {
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(resolveDate(value));
}
