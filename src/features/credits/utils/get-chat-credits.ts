import type { RateCard } from '@/features/credits/schemas/rate-card-schema';

export function getChatCredits(rateCard: RateCard): number | null {
  const chat = rateCard.items.find(item => item.operation === 'chat');
  return chat ? chat.baseCredits + chat.unitCredits : null;
}
