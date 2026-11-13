import { createResetPasswordSchema } from '@/features/auth/schemas/reset-password-schema';

const schema = createResetPasswordSchema({ passwordMismatch: 'Passwords don\'t match' });

describe('resetPasswordSchema', () => {
  it('accepts matching passwords of 8 or more characters', () => {
    expect(schema.safeParse({ password: 'secret123', confirm: 'secret123' }).success).toBe(true);
  });

  it('rejects short passwords', () => {
    expect(schema.safeParse({ password: 'short', confirm: 'short' }).success).toBe(false);
  });

  it('rejects a confirmation that does not match', () => {
    const result = schema.safeParse({ password: 'secret123', confirm: 'secret124' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toEqual(expect.objectContaining({ path: ['confirm'], message: 'Passwords don\'t match' }));
  });
});
