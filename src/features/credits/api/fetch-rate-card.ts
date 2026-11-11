import type { RateCard } from '@/features/credits/schemas/rate-card-schema';
import { rateCardSchema } from '@/features/credits/schemas/rate-card-schema';
import { apiClient } from '@/lib/api';

export async function fetchRateCard(): Promise<RateCard> {
  const response = await apiClient.get('/credits/rates');
  return rateCardSchema.parse(response.data);
}
