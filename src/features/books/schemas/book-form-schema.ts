import { z } from 'zod';

export const BOOK_NAME_MAX_LENGTH = 60;

export type BookFormMessages = {
  nameRequired: string;
  nameTooLong: string;
};

export function createBookNameSchema(messages: BookFormMessages) {
  return z
    .string()
    .trim()
    .min(1, messages.nameRequired)
    .max(BOOK_NAME_MAX_LENGTH, messages.nameTooLong);
}

export function createBookFormSchema(messages: BookFormMessages) {
  return z.object({
    name: createBookNameSchema(messages),
    currency: z.string().trim().min(1),
  });
}

export type BookFormValues = z.infer<ReturnType<typeof createBookFormSchema>>;
