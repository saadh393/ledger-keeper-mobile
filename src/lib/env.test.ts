import { envSchema, getValidatedEnv } from '@env';

describe('env validation', () => {
  const baseValidEnv = {
    EXPO_PUBLIC_APP_ENV: 'development' as const,
    EXPO_PUBLIC_NAME: 'Ledger Keeper',
    EXPO_PUBLIC_SCHEME: 'ledgerkeeper.dev',
    EXPO_PUBLIC_BUNDLE_ID: 'com.ledgerkeeper.app.development',
    EXPO_PUBLIC_PACKAGE: 'com.ledgerkeeper.app.development',
    EXPO_PUBLIC_VERSION: '0.0.1',
    EXPO_PUBLIC_API_URL: 'http://10.0.2.2:4000/api',
    EXPO_PUBLIC_VAR_NUMBER: 10,
    EXPO_PUBLIC_VAR_BOOL: true,
  };

  it('allows http API URL in development', () => {
    const result = envSchema.safeParse({
      ...baseValidEnv,
      EXPO_PUBLIC_APP_ENV: 'development',
      EXPO_PUBLIC_API_URL: 'http://localhost:4000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects http API URL in preview', () => {
    const result = envSchema.safeParse({
      ...baseValidEnv,
      EXPO_PUBLIC_APP_ENV: 'preview',
      EXPO_PUBLIC_API_URL: 'http://api.ledgerkeeper.com',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.EXPO_PUBLIC_API_URL).toBeDefined();
    }
  });

  it('accepts https API URL in preview', () => {
    const result = envSchema.safeParse({
      ...baseValidEnv,
      EXPO_PUBLIC_APP_ENV: 'preview',
      EXPO_PUBLIC_API_URL: 'https://preview-api.ledgerkeeper.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects http API URL in production', () => {
    const result = envSchema.safeParse({
      ...baseValidEnv,
      EXPO_PUBLIC_APP_ENV: 'production',
      EXPO_PUBLIC_API_URL: 'http://api.ledgerkeeper.com',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.EXPO_PUBLIC_API_URL).toBeDefined();
    }
  });

  it('accepts https API URL in production', () => {
    const result = envSchema.safeParse({
      ...baseValidEnv,
      EXPO_PUBLIC_APP_ENV: 'production',
      EXPO_PUBLIC_API_URL: 'https://api.ledgerkeeper.com',
    });
    expect(result.success).toBe(true);
  });

  it('getValidatedEnv throws error when preview environment has insecure API URL', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      getValidatedEnv({
        ...baseValidEnv,
        EXPO_PUBLIC_APP_ENV: 'preview',
        EXPO_PUBLIC_API_URL: 'http://api.ledgerkeeper.com',
      });
    }).toThrow('Invalid environment variables');
    errorSpy.mockRestore();
  });

  it('getValidatedEnv throws error when production environment has insecure API URL', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      getValidatedEnv({
        ...baseValidEnv,
        EXPO_PUBLIC_APP_ENV: 'production',
        EXPO_PUBLIC_API_URL: 'http://api.ledgerkeeper.com',
      });
    }).toThrow('Invalid environment variables');
    errorSpy.mockRestore();
  });

  it('getValidatedEnv succeeds with valid production env', () => {
    const valid = getValidatedEnv({
      ...baseValidEnv,
      EXPO_PUBLIC_APP_ENV: 'production',
      EXPO_PUBLIC_API_URL: 'https://api.ledgerkeeper.com',
    });
    expect(valid.EXPO_PUBLIC_API_URL).toBe('https://api.ledgerkeeper.com');
  });
});
