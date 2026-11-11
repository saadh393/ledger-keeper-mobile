import { z } from 'zod';

export const trendArtifactSchema = z.object({
  values: z.array(z.number()),
  labels: z.array(z.string()),
  average: z.number(),
  peak: z.number(),
  streakDays: z.number(),
}).refine(data => data.values.length === data.labels.length);

export const categoryArtifactSchema = z.object({
  items: z.array(z.object({ name: z.string(), value: z.number(), color: z.string() })),
  total: z.number(),
});

export type TrendArtifactData = z.infer<typeof trendArtifactSchema>;
export type CategoryArtifactData = z.infer<typeof categoryArtifactSchema>;
