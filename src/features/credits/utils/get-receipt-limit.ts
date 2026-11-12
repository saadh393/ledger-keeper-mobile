import type { RateCard } from '@/features/credits/schemas/rate-card-schema';

export function getReceiptLimit(rateCard?: RateCard): number | null {
  if (!rateCard?.items.some(item => item.operation === 'receipt'))
    return null;
  return rateCard.limits.maxReceiptBytes;
}
