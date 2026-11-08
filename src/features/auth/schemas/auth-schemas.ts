import { z } from 'zod';

export type AuthValidationMessages = {
  nameRequired?: string;
  emailRequired?: string;
  emailInvalid?: string;
  passwordRequired?: string;
  passwordMinLength?: string;
};

export const DEFAULT_AUTH_MESSAGES: Required<AuthValidationMessages> = {
  nameRequired: 'Name is required',
  emailRequired: 'Email is required',
  emailInvalid: 'Please enter a valid email address',
  passwordRequired: 'Password is required',
  passwordMinLength: 'Password must be at least 8 characters',
};

export function createEmailSchema(messages: AuthValidationMessages = {}) {
  const emailRequired = messages.emailRequired ?? DEFAULT_AUTH_MESSAGES.emailRequired;
  const emailInvalid = messages.emailInvalid ?? DEFAULT_AUTH_MESSAGES.emailInvalid;

  return z
    .string()
    .trim()
    .min(1, emailRequired)
    .email(emailInvalid);
}

export function createNameSchema(messages: AuthValidationMessages = {}) {
  const nameRequired = messages.nameRequired ?? DEFAULT_AUTH_MESSAGES.nameRequired;

  return z
    .string()
    .trim()
    .min(1, nameRequired);
}

export function createSignInPasswordSchema(messages: AuthValidationMessages = {}) {
  const passwordRequired = messages.passwordRequired ?? DEFAULT_AUTH_MESSAGES.passwordRequired;

  return z
    .string()
    .min(1, passwordRequired);
}

export function createSignUpPasswordSchema(messages: AuthValidationMessages = {}) {
  const passwordRequired = messages.passwordRequired ?? DEFAULT_AUTH_MESSAGES.passwordRequired;
  const passwordMinLength = messages.passwordMinLength ?? DEFAULT_AUTH_MESSAGES.passwordMinLength;

  return z
    .string()
    .min(1, passwordRequired)
    .min(8, passwordMinLength);
}

export function createSignInSchema(messages: AuthValidationMessages = {}) {
  return z.object({
    email: createEmailSchema(messages),
    password: createSignInPasswordSchema(messages),
  });
}

export function createSignUpSchema(messages: AuthValidationMessages = {}) {
  return z.object({
    name: createNameSchema(messages),
    email: createEmailSchema(messages),
    password: createSignUpPasswordSchema(messages),
  });
}

export const signInSchema = createSignInSchema();
export const signUpSchema = createSignUpSchema();

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
