import z from 'zod';

import packageJSON from './package.json';

// Single unified environment schema
export const envSchema = z
  .object({
    EXPO_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']),
    EXPO_PUBLIC_NAME: z.string(),
    EXPO_PUBLIC_SCHEME: z.string(),
    EXPO_PUBLIC_BUNDLE_ID: z.string(),
    EXPO_PUBLIC_PACKAGE: z.string(),
    EXPO_PUBLIC_VERSION: z.string(),
    EXPO_PUBLIC_API_URL: z.string().url(),
    EXPO_PUBLIC_ASSOCIATED_DOMAIN: z.string().url().optional(),
    EXPO_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    EXPO_PUBLIC_VAR_NUMBER: z.number(),
    EXPO_PUBLIC_VAR_BOOL: z.boolean(),

    // only available for app.config.ts usage
    APP_BUILD_ONLY_VAR: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.EXPO_PUBLIC_APP_ENV === 'preview' || data.EXPO_PUBLIC_APP_ENV === 'production') {
        return data.EXPO_PUBLIC_API_URL.startsWith('https://');
      }
      return true;
    },
    {
      message: 'EXPO_PUBLIC_API_URL must use HTTPS in preview and production environments',
      path: ['EXPO_PUBLIC_API_URL'],
    },
  );

// Config records per environment
const EXPO_PUBLIC_APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV
  ?? 'development') as z.infer<typeof envSchema>['EXPO_PUBLIC_APP_ENV'];

const BUNDLE_IDS = {
  development: 'com.ledgerkeeper.app.development',
  preview: 'com.ledgerkeeper.app.preview',
  production: 'com.ledgerkeeper.app',
} as const;

const PACKAGES = {
  development: 'com.ledgerkeeper.app.development',
  preview: 'com.ledgerkeeper.app.preview',
  production: 'com.ledgerkeeper.app',
} as const;

const SCHEMES = {
  development: 'ledgerkeeper.dev',
  preview: 'ledgerkeeper.preview',
  production: 'ledgerkeeper',
} as const;

const NAME = 'Ledger Keeper';

// Check if strict validation is required (before prebuild)
const STRICT_ENV_VALIDATION = process.env.STRICT_ENV_VALIDATION === '1';

// Build env object
const _env: z.infer<typeof envSchema> = {
  EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_NAME: NAME,
  EXPO_PUBLIC_SCHEME: SCHEMES[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_BUNDLE_ID: BUNDLE_IDS[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_PACKAGE: PACKAGES[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_VERSION: packageJSON.version,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? '',
  EXPO_PUBLIC_ASSOCIATED_DOMAIN: process.env.EXPO_PUBLIC_ASSOCIATED_DOMAIN,
  EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN || undefined,
  EXPO_PUBLIC_VAR_NUMBER: Number(process.env.EXPO_PUBLIC_VAR_NUMBER ?? 0),
  EXPO_PUBLIC_VAR_BOOL: process.env.EXPO_PUBLIC_VAR_BOOL === 'true',
  APP_BUILD_ONLY_VAR: process.env.APP_BUILD_ONLY_VAR,
};

export function getValidatedEnv(env: z.infer<typeof envSchema>) {
  const parsed = envSchema.safeParse(env);

  if (parsed.success === false) {
    const errorMessage
      = `❌ Invalid environment variables:${
        JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
      }\n❌ Missing or invalid variables in .env file for APP_ENV=${env.EXPO_PUBLIC_APP_ENV}`
      + `\n💡 Tip: If you recently updated the .env file, try restarting with -c flag to clear the cache.`;

    const shouldThrow = STRICT_ENV_VALIDATION || env.EXPO_PUBLIC_APP_ENV === 'preview' || env.EXPO_PUBLIC_APP_ENV === 'production';
    if (shouldThrow) {
      console.error(errorMessage);
      throw new Error(`Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
    }
  }
  else {
    console.log('✅ Environment variables validated successfully');
  }

  return parsed.success ? parsed.data : env;
}

const shouldValidate = STRICT_ENV_VALIDATION || EXPO_PUBLIC_APP_ENV === 'preview' || EXPO_PUBLIC_APP_ENV === 'production';
const Env = shouldValidate ? getValidatedEnv(_env) : _env;

export default Env;
