import type { CreditLedgerPage } from '@/features/credits/schemas/credit-ledger-schema';
import { creditLedgerPageSchema } from '@/features/credits/schemas/credit-ledger-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export const CREDIT_LEDGER_PAGE_SIZE = 25;

export async function fetchCreditLedger(page: number): Promise<CreditLedgerPage> {
  const response = await apiClient.get('/credits/ledger', { params: { page, pageSize: CREDIT_LEDGER_PAGE_SIZE } });
  return parse(creditLedgerPageSchema, response.data);
}
