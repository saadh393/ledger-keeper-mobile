import type { TFunction } from 'i18next';
import { toApiError } from '@/lib/api/errors';

export type InstallmentFieldKey = 'title' | 'category' | 'amount' | 'totalCount' | 'date';

export type InstallmentError
  = | { type: 'notFound'; message: string }
    | { type: 'completed'; message: string }
    | { type: 'fields'; fields: Partial<Record<InstallmentFieldKey, string>> }
    | { type: 'form'; message: string };

const issueFields: Record<string, InstallmentFieldKey> = {
  title: 'title',
  category: 'category',
  amount: 'amount',
  totalCount: 'totalCount',
  dateIso: 'date',
};

function getIssueFields(issues: unknown[] | undefined) {
  const fields: Partial<Record<InstallmentFieldKey, string>> = {};
  for (const raw of issues ?? []) {
    const issue = raw as { path?: unknown[]; message?: string };
    const key = (issue.path ?? []).map(String).find(part => part in issueFields);
    if (key && issue.message)
      fields[issueFields[key]!] ??= issue.message;
  }
  return fields;
}

export function getInstallmentError(error: unknown, t: TFunction, paid: string): InstallmentError {
  const apiError = toApiError(error);

  if (apiError.status === 404)
    return { type: 'notFound', message: t('installments.errors.notFound') };
  if (apiError.code === 'installment_completed')
    return { type: 'completed', message: t('installments.errors.completed') };
  if (apiError.code === 'count_below_paid')
    return { type: 'fields', fields: { totalCount: t('installments.errors.countBelowPaid', { paid }) } };
  if (apiError.code === 'invalid_installment_count')
    return { type: 'fields', fields: { totalCount: t('installments.errors.countInvalid') } };

  if (apiError.status === 422) {
    const fields = getIssueFields(apiError.issues);
    if (apiError.field && apiError.field in issueFields)
      fields[issueFields[apiError.field]!] = apiError.message;
    if (Object.keys(fields).length)
      return { type: 'fields', fields };
  }

  if (apiError.kind === 'offline' || apiError.kind === 'timeout')
    return { type: 'form', message: t('installments.errors.offline') };
  return { type: 'form', message: t('installments.errors.server') };
}
