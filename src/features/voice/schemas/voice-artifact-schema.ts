import { z } from 'zod';

export const voiceArtifactSchema = z.object({
  state: z.enum(['transcribing', 'transcribed', 'failed', 'no_speech']),
  durationSeconds: z.number(),
  clientAudioId: z.string().nullable(),
  transcript: z.string().nullable(),
});

export type VoiceArtifactData = z.infer<typeof voiceArtifactSchema>;
