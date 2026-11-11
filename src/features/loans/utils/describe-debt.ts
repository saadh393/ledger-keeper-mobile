import type { TFunction } from 'i18next';
import type { Debt } from '@/features/loans/schemas/debt-schema';
import type { Language } from '@/lib/i18n/resources';
import { isDebtOverdue } from '@/features/loans/utils/is-debt-overdue';
import { formatCurrency } from '@/lib/format/currency';
import { formatDate } from '@/lib/format/date';

export function describeDebt(debt: Debt, locale: Language, t: TFunction): string {
  const money = (value: number) => formatCurrency(value, locale, debt.currency);
  return [
    t(debt.direction === 'lent' ? 'loans.card.lentTo' : 'loans.card.borrowedFrom', { name: debt.counterparty }),
    debt.status === 'settled' ? t('loans.row.settled') : t('loans.a11y.outstanding', { amount: money(debt.outstanding) }),
    t('loans.a11y.original', { amount: money(debt.amount) }),
    debt.dueDateIso && debt.status === 'open' ? t('loans.row.due', { date: formatDate(debt.dueDateIso, locale) }) : null,
    isDebtOverdue(debt) ? t('loans.row.overdue') : null,
  ].filter(Boolean).join(', ');
}
