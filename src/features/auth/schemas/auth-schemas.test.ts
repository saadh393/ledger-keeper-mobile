/* eslint-disable max-lines-per-function */
import {
  createSignInSchema,
  createSignUpSchema,
  DEFAULT_AUTH_MESSAGES,
  signInSchema,
  signUpSchema,
} from '@/features/auth/schemas/auth-schemas';

describe('auth validation schemas', () => {
  describe('signInSchema', () => {
    it('rejects empty email and empty password', () => {
      const result = signInSchema.safeParse({ email: '', password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.flatten().fieldErrors;
        expect(issues.email?.[0]).toBe(DEFAULT_AUTH_MESSAGES.emailRequired);
        expect(issues.password?.[0]).toBe(DEFAULT_AUTH_MESSAGES.passwordRequired);
      }
    });

    it('rejects whitespace-only email after trimming', () => {
      const result = signInSchema.safeParse({ email: '   ', password: 'secretpassword' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.flatten().fieldErrors;
        expect(issues.email?.[0]).toBe(DEFAULT_AUTH_MESSAGES.emailRequired);
      }
    });

    it('rejects invalid email formats', () => {
      const invalidEmails = ['plainaddress', 'missingat.com', '@missinguser.com', 'user@'];
      for (const email of invalidEmails) {
        const result = signInSchema.safeParse({ email, password: 'password123' });
        expect(result.success).toBe(false);
        if (!result.success) {
          const issues = result.error.flatten().fieldErrors;
          expect(issues.email).toContain(DEFAULT_AUTH_MESSAGES.emailInvalid);
        }
      }
    });

    it('accepts valid credentials and trims email', () => {
      const result = signInSchema.safeParse({
        email: '  user@example.com  ',
        password: 'anyPassword',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.password).toBe('anyPassword');
      }
    });
  });

  describe('signUpSchema', () => {
    it('rejects empty name, empty email, and empty password', () => {
      const result = signUpSchema.safeParse({ name: '', email: '', password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.flatten().fieldErrors;
        expect(issues.name?.[0]).toBe(DEFAULT_AUTH_MESSAGES.nameRequired);
        expect(issues.email?.[0]).toBe(DEFAULT_AUTH_MESSAGES.emailRequired);
        expect(issues.password?.[0]).toBe(DEFAULT_AUTH_MESSAGES.passwordRequired);
      }
    });

    it('rejects whitespace-only name after trimming', () => {
      const result = signUpSchema.safeParse({
        name: '    ',
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.flatten().fieldErrors;
        expect(issues.name?.[0]).toBe(DEFAULT_AUTH_MESSAGES.nameRequired);
      }
    });

    it('rejects passwords shorter than 8 characters', () => {
      const shortPasswords = ['1', '1234567', 'short'];
      for (const password of shortPasswords) {
        const result = signUpSchema.safeParse({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          const issues = result.error.flatten().fieldErrors;
          expect(issues.password?.[0]).toBe(DEFAULT_AUTH_MESSAGES.passwordMinLength);
        }
      }
    });

    it('accepts valid sign up values and trims name and email', () => {
      const result = signUpSchema.safeParse({
        name: '  Jane Doe  ',
        email: '  jane@example.com  ',
        password: 'securePassword8!',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Jane Doe');
        expect(result.data.email).toBe('jane@example.com');
        expect(result.data.password).toBe('securePassword8!');
      }
    });
  });

  describe('custom validation messages', () => {
    it('applies localized custom messages correctly', () => {
      const customSignIn = createSignInSchema({
        emailRequired: 'ইমেইল আবশ্যক',
        emailInvalid: 'বৈধ ইমেইল দিন',
        passwordRequired: 'পাসওয়ার্ড আবশ্যক',
      });
      const result = customSignIn.safeParse({ email: 'invalid', password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.flatten().fieldErrors;
        expect(issues.email).toContain('বৈধ ইমেইল দিন');
        expect(issues.password).toContain('পাসওয়ার্ড আবশ্যক');
      }

      const customSignUp = createSignUpSchema({
        nameRequired: 'নাম আবশ্যক',
        passwordMinLength: 'কমপক্ষে ৮ অক্ষর',
      });
      const signUpResult = customSignUp.safeParse({
        name: ' ',
        email: 'jane@example.com',
        password: '123',
      });
      expect(signUpResult.success).toBe(false);
      if (!signUpResult.success) {
        const issues = signUpResult.error.flatten().fieldErrors;
        expect(issues.name?.[0]).toBe('নাম আবশ্যক');
        expect(issues.password?.[0]).toBe('কমপক্ষে ৮ অক্ষর');
      }
    });
  });
});
