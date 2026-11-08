import { apiClient } from '@/lib/api/client';
import { ApiError, toApiError } from '@/lib/api/errors';

export type AuthErrorInfo = {
  message: string;
  shouldClearPassword?: boolean;
};

export function extractBearerToken(response: {
  headers?: Record<string, unknown>;
  data?: unknown;
}): string | null {
  const headers = response?.headers ?? {};
  const setAuthToken
    = (headers as Record<string, unknown>)['set-auth-token']
      ?? (headers as Record<string, unknown>)['Set-Auth-Token'];

  if (typeof setAuthToken === 'string' && setAuthToken.trim().length > 0) {
    return setAuthToken.trim();
  }

  if (Array.isArray(setAuthToken) && setAuthToken.length > 0) {
    const first = setAuthToken[0];
    if (typeof first === 'string' && first.trim().length > 0) {
      return first.trim();
    }
  }

  const data = response?.data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (typeof record.token === 'string' && record.token.trim().length > 0) {
      return record.token.trim();
    }
    if (record.session && typeof record.session === 'object') {
      const session = record.session as Record<string, unknown>;
      if (typeof session.token === 'string' && session.token.trim().length > 0) {
        return session.token.trim();
      }
    }
  }

  return null;
}

export function getAuthErrorMessage(
  error: unknown,
  mode: 'signin' | 'signup',
  t: (key: string) => string,
): AuthErrorInfo {
  const apiError = error instanceof ApiError ? error : toApiError(error);

  // Offline check
  if (apiError.kind === 'offline') {
    return {
      message: t('auth.errors.offline'),
      shouldClearPassword: false,
    };
  }

  // Timeout or 5xx server errors
  if (apiError.kind === 'timeout' || (typeof apiError.status === 'number' && apiError.status >= 500)) {
    return {
      message: t('auth.errors.serverError'),
      shouldClearPassword: false,
    };
  }

  // Sign in error handling
  if (mode === 'signin') {
    if (
      apiError.kind === 'unauthorized'
      || apiError.status === 401
      || apiError.code === 'INVALID_EMAIL_OR_PASSWORD'
      || apiError.status === 400
    ) {
      return {
        message: t('auth.errors.invalidCredentials'),
        shouldClearPassword: true,
      };
    }
  }

  // Sign up error handling
  if (mode === 'signup') {
    if (
      apiError.status === 409
      || apiError.status === 422
      || apiError.code?.includes('USER_ALREADY_EXISTS')
      || apiError.message?.toLowerCase().includes('already exists')
    ) {
      return {
        message: apiError.message || t('auth.errors.userAlreadyExists'),
        shouldClearPassword: false,
      };
    }
  }

  return {
    message: apiError.message || t('auth.errors.serverError'),
    shouldClearPassword: false,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<string> {
  const trimmedEmail = email.trim();
  const response = await apiClient.post('/auth/sign-in/email', {
    email: trimmedEmail,
    password,
  });

  const token = extractBearerToken(response);
  if (!token) {
    throw new ApiError({
      kind: 'server',
      message: 'No auth token returned from server',
    });
  }

  return token;
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<string> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const response = await apiClient.post('/auth/sign-up/email', {
    name: trimmedName,
    email: trimmedEmail,
    password,
  });

  const token = extractBearerToken(response);
  if (!token) {
    throw new ApiError({
      kind: 'server',
      message: 'No auth token returned from server',
    });
  }

  return token;
}

export const authClient = {
  signInWithEmail,
  signUpWithEmail,
};
