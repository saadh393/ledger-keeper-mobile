import type { TFunction } from 'i18next';
import { toApiError } from '@/lib/api/errors';

export type DebtFieldKey = 'counterparty' | 'amount' | 'date' | 'dueDate' | 'note';

export type DebtErrorContext = {
  t: TFunction;
  formatAmount: (value: number) => string;
  repaid: number;
  outstanding: number;
};

export type DebtError
  = | { type: 'notFound'; message: string }
    | { type: 'fields'; fields: Partial<Record<DebtFieldKey, string>> }
    | { type: 'form'; message: string };

const issueFields: Record<string, DebtFieldKey> = {
  counterparty: 'counterparty',
  amount: 'amount',
  dateIso: 'date',
  dueDateIso: 'dueDate',
  note: 'note',
};

function readOutstanding(data: unknown, fallback: number) {
  const value = (data as { outstanding?: unknown } | undefined)?.outstanding;
  return typeof value === 'number' ? value : fallback;
}

function getIssueFields(issues: unknown[] | undefined) {
  const fields: Partial<Record<DebtFieldKey, string>> = {};
  for (const raw of issues ?? []) {
    const issue = raw as { path?: unknown[]; message?: string };
    const key = (issue.path ?? []).map(String).find(part => part in issueFields);
    if (key && issue.message)
      fields[issueFields[key]!] ??= issue.message;
  }
  return fields;
}

export function getDebtError(error: unknown, { t, formatAmount, repaid, outstanding }: DebtErrorContext): DebtError {
  const apiError = toApiError(error);

  if (apiError.status === 404 || apiError.code === 'debt_not_found')
    return { type: 'notFound', message: t('loans.errors.notFound') };
  if (apiError.code === 'amount_below_repaid')
    return { type: 'fields', fields: { amount: t('loans.errors.amountBelowRepaid', { amount: formatAmount(repaid) }) } };
  if (apiError.code === 'repayment_exceeds_debt')
    return { type: 'fields', fields: { amount: t('loans.errors.repaymentExceeds', { amount: formatAmount(readOutstanding(apiError.data, outstanding)) }) } };
  if (apiError.code === 'debt_settled')
    return { type: 'form', message: t('loans.errors.settled') };

  if (apiError.status === 422) {
    const fields = getIssueFields(apiError.issues);
    if (apiError.field && apiError.field in issueFields)
      fields[issueFields[apiError.field]!] = apiError.message;
    if (Object.keys(fields).length)
      return { type: 'fields', fields };
  }

  if (apiError.kind === 'offline' || apiError.kind === 'timeout')
    return { type: 'form', message: t('loans.errors.offline') };
  return { type: 'form', message: t('loans.errors.server') };
}
