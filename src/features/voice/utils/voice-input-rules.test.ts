import { getVoiceCredits } from '@/features/credits/utils/get-voice-credits';
import { getVoiceLimit } from '@/features/credits/utils/get-voice-limit';
import { getHoldRelease } from '@/features/voice/utils/get-hold-release';

const rateCard = {
  items: [
    { operation: 'chat', unit: 'message', baseCredits: 1, unitCredits: 0, unitSize: 1 },
    { operation: 'voice', unit: 'second', baseCredits: 1, unitCredits: 1, unitSize: 30 },
  ],
  limits: { maxMessageChars: 500, maxVoiceSeconds: 120, maxReceiptBytes: 5_000_000 },
};

describe('voice input rules', () => {
  it('estimates credits from length plus the chat rate', () => {
    expect(getVoiceCredits(rateCard, 1)).toBe(3);
    expect(getVoiceCredits(rateCard, 30)).toBe(3);
    expect(getVoiceCredits(rateCard, 31)).toBe(4);
    expect(getVoiceCredits(rateCard, 120)).toBe(6);
  });

  it('has no estimate or limit when voice is off', () => {
    const off = { ...rateCard, items: rateCard.items.filter(item => item.operation !== 'voice') };
    expect(getVoiceCredits(off, 10)).toBeNull();
    expect(getVoiceLimit(off)).toBeNull();
    expect(getVoiceLimit(rateCard)).toBe(120);
  });

  it('cancels a hold under one second and sends a longer one', () => {
    expect(getHoldRelease(999)).toBe('cancel');
    expect(getHoldRelease(1000)).toBe('send');
  });
});
