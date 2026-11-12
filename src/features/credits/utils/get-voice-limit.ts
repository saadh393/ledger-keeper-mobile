import type { RateCard } from '@/features/credits/schemas/rate-card-schema';

export function getVoiceLimit(rateCard?: RateCard): number | null {
  if (!rateCard?.items.some(item => item.operation === 'voice'))
    return null;
  return rateCard.limits.maxVoiceSeconds;
}
