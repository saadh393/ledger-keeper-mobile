import type { CreditPlan } from '@/features/credits/schemas/credit-plan-schema';
import { creditPlansSchema } from '@/features/credits/schemas/credit-plan-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export async function fetchCreditPlans(): Promise<CreditPlan[]> {
  const response = await apiClient.get('/plans');
  return parse(creditPlansSchema, response.data).items;
}
