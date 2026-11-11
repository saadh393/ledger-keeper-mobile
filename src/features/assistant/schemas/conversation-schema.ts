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

export const bookChatSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const bookChatPageSchema = z.object({
  items: z.array(bookChatSchema),
  nextCursor: z.string().nullable(),
});

export const messagePageSchema = z.object({
  messages: z.array(chatMessageSchema),
  hasMore: z.boolean(),
});

export const createdConversationSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  suffix: z.string(),
  currency: z.string(),
});

export const sendMessageResponseSchema = z.object({
  userMessage: chatMessageSchema,
  aiMessage: chatMessageSchema,
  credits: z.object({ charged: z.number(), balance: z.number() }),
});

export type MessageArtifact = z.infer<typeof messageArtifactSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type BookChat = z.infer<typeof bookChatSchema>;
export type BookChatPage = z.infer<typeof bookChatPageSchema>;
export type MessagePage = z.infer<typeof messagePageSchema>;
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;
