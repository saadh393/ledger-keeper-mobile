import type { CreditBalance } from '@/features/credits/schemas/credit-balance-schema';
import { creditBalanceSchema } from '@/features/credits/schemas/credit-balance-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export async function fetchCreditBalance(): Promise<CreditBalance> {
  const response = await apiClient.get('/credits/me');
  return parse(creditBalanceSchema, response.data);
}
