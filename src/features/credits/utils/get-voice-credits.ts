import type { RateCard } from '@/features/credits/schemas/rate-card-schema';
import { getChatCredits } from '@/features/credits/utils/get-chat-credits';

export function getVoiceCredits(rateCard: RateCard, seconds: number): number | null {
  const voice = rateCard.items.find(item => item.operation === 'voice');
  const chat = getChatCredits(rateCard);
  if (!voice || chat === null)
    return null;
  return voice.baseCredits + voice.unitCredits * Math.ceil(seconds / voice.unitSize) + chat;
}
