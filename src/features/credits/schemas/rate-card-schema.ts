import { z } from 'zod';

export const rateCardSchema = z.object({
  items: z.array(z.object({
    operation: z.string(),
    unit: z.string(),
    baseCredits: z.number(),
    unitCredits: z.number(),
    unitSize: z.number(),
  })),
  limits: z.object({
    maxMessageChars: z.number(),
    maxVoiceSeconds: z.number(),
    maxReceiptBytes: z.number(),
  }),
});

export type RateCard = z.infer<typeof rateCardSchema>;
