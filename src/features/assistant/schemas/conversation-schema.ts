import { z } from 'zod';

export const messageArtifactSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.unknown(),
});

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'ai']),
  text: z.string().optional(),
  artifacts: z.array(messageArtifactSchema).optional(),
  createdAt: z.string(),
});

export const conversationSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  title: z.string(),
  currency: z.string(),
  messages: z.array(chatMessageSchema),
  hasMore: z.boolean(),
});

export const bookChatPageSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
  nextCursor: z.string().nullable(),
});

export type MessageArtifact = z.infer<typeof messageArtifactSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
