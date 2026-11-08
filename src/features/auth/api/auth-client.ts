import Env from '@env';
import { onlineManager } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';

import { apiClient, getApiBaseUrl } from '@/lib/api/client';
import { ApiError, toApiError } from '@/lib/api/errors';

export type AuthErrorInfo = {
  message: string;
  shouldClearPassword?: boolean;
};

export type SocialProvider = 'google';

export type SocialSignInOptions = {
  provider: SocialProvider;
  callbackURL?: string;
};

export type SocialSignInResponse = {
  token: string | null;
  canceled: boolean;
  data?: {
    token?: string;
    url?: string;
  } | null;
  error?: {
    message?: string;
  } | null;
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

export function extractBearerTokenFromCookie(cookieString: string | null | undefined): string | null {
  if (!cookieString || typeof cookieString !== 'string') {
    return null;
  }
  const decoded = decodeURIComponent(cookieString);
  const match = decoded.match(/(?:^|[;,]\s*)(?:__Secure-)?better-auth\.session_token=([^;,\s]+)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

export function extractBearerTokenFromRedirectUrl(urlStr: string | null | undefined): string | null {
  if (!urlStr || typeof urlStr !== 'string') {
    return null;
  }
  try {
    const parsedUrl = new URL(urlStr);

    const directToken
      = parsedUrl.searchParams.get('token')
        ?? parsedUrl.searchParams.get('auth_token')
        ?? parsedUrl.searchParams.get('set-auth-token');
    if (directToken && directToken.trim().length > 0) {
      return directToken.trim();
    }

    const cookieParam = parsedUrl.searchParams.get('cookie');
    if (cookieParam) {
      const token = extractBearerTokenFromCookie(cookieParam);
      if (token) {
        return token;
      }
    }

    return null;
  }
  catch {
    return extractBearerTokenFromCookie(urlStr);
  }
}

export function getAuthErrorMessage(
  error: unknown,
  mode: 'signin' | 'signup' | 'google',
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

  if (mode === 'google') {
    return {
      message: t('auth.errors.googleFailed'),
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

export async function signInSocial(options: SocialSignInOptions): Promise<SocialSignInResponse> {
  const scheme = Env.EXPO_PUBLIC_SCHEME;
  const callbackURL = options.callbackURL ?? `${scheme}://`;

  if (!onlineManager.isOnline()) {
    throw new ApiError({
      kind: 'offline',
      message: 'Network error: could not connect to server',
    });
  }

  let authUrl: string;
  try {
    const response = await apiClient.post<{ url: string; redirect?: boolean }>(
      '/auth/sign-in/social',
      {
        provider: options.provider,
        callbackURL,
      },
      {
        headers: {
          'expo-origin': `${scheme}://`,
        },
      },
    );

    authUrl = response.data?.url;
    if (!authUrl) {
      throw new ApiError({
        kind: 'server',
        message: 'No authorization URL returned from server',
      });
    }
  }
  catch (error) {
    throw error instanceof ApiError ? error : toApiError(error);
  }

  let browserResult: WebBrowser.WebBrowserAuthSessionResult;
  try {
    const proxyURL = `${getApiBaseUrl()}/auth/expo-authorization-proxy?authorizationURL=${encodeURIComponent(authUrl)}`;
    browserResult = await WebBrowser.openAuthSessionAsync(proxyURL, callbackURL);
  }
  catch (browserError) {
    throw new ApiError({
      kind: 'server',
      message: browserError instanceof Error ? browserError.message : 'Failed to open browser session',
    });
  }

  if (browserResult.type !== 'success') {
    return {
      token: null,
      canceled: true,
      data: null,
      error: null,
    };
  }

  const redirectUrl = browserResult.url;
  const token = extractBearerTokenFromRedirectUrl(redirectUrl);

  if (!token) {
    let errorMessage = 'Couldn\'t sign in with Google. Try again.';
    try {
      const parsed = new URL(redirectUrl);
      const urlError = parsed.searchParams.get('error_description') ?? parsed.searchParams.get('error');
      if (urlError) {
        errorMessage = urlError;
      }
    }
    catch {
      // ignore
    }
    throw new ApiError({
      kind: 'server',
      message: errorMessage,
    });
  }

  return {
    token,
    canceled: false,
    data: { token, url: redirectUrl },
    error: null,
  };
}

export const authClient = {
  signInWithEmail,
  signUpWithEmail,
  signInSocial,
  signIn: {
    social: signInSocial,
  },
};
