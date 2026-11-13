import type { AuthValidationMessages } from '@/features/auth/schemas/auth-schemas';
import { z } from 'zod';
import { createSignUpPasswordSchema } from '@/features/auth/schemas/auth-schemas';

export function createResetPasswordSchema(messages: AuthValidationMessages & { passwordMismatch: string }) {
  return z.object({
    password: createSignUpPasswordSchema(messages),
    confirm: z.string(),
  }).refine(value => value.password === value.confirm, { message: messages.passwordMismatch, path: ['confirm'] });
}
