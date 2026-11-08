import { z } from 'zod';

export const bookSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  currency: z.string().min(1),
  isDefault: z.boolean(),
  createdAt: z.string().min(1),
});

export const booksResponseSchema = z.object({
  items: z.array(bookSchema),
});

export type Book = z.infer<typeof bookSchema>;
export type BooksResponse = z.infer<typeof booksResponseSchema>;
