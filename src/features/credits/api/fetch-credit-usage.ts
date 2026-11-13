import type { CreditUsage } from '@/features/credits/schemas/credit-usage-schema';
import { creditUsageSchema } from '@/features/credits/schemas/credit-usage-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export async function fetchCreditUsage(): Promise<CreditUsage> {
  const response = await apiClient.get('/credits/usage', { params: { interval: 'day' } });
  return parse(creditUsageSchema, response.data);
}
