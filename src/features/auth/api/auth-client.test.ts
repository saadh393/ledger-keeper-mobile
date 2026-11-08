/* eslint-disable max-lines-per-function */
import { onlineManager } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import * as WebBrowser from 'expo-web-browser';

import {
  authClient,
  extractBearerToken,
  extractBearerTokenFromCookie,
  extractBearerTokenFromRedirectUrl,
  getAuthErrorMessage,
  signInSocial,
  signInWithEmail,
  signUpWithEmail,
} from '@/features/auth/api/auth-client';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

jest.mock('expo-web-browser', () => {
  const actual = jest.requireActual('expo-web-browser');
  return {
    ...actual,
    openAuthSessionAsync: jest.fn(),
  };
});

describe('auth-client', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    jest.clearAllMocks();
    jest.spyOn(onlineManager, 'isOnline').mockReturnValue(true);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('extractBearerToken', () => {
    it('extracts token from set-auth-token string header', () => {
      const response = {
        headers: { 'set-auth-token': 'token-from-header-123' },
        data: {},
      };
      expect(extractBearerToken(response)).toBe('token-from-header-123');
    });

    it('extracts token from set-auth-token array header', () => {
      const response = {
        headers: { 'set-auth-token': ['token-from-array-456'] },
        data: {},
      };
      expect(extractBearerToken(response)).toBe('token-from-array-456');
    });

    it('extracts token from body token property', () => {
      const response = {
        headers: {},
        data: { token: 'token-from-body-789' },
      };
      expect(extractBearerToken(response)).toBe('token-from-body-789');
    });

    it('extracts token from body session.token property', () => {
      const response = {
        headers: {},
        data: { session: { token: 'token-from-session-abc' } },
      };
      expect(extractBearerToken(response)).toBe('token-from-session-abc');
    });

    it('returns null when no token is present', () => {
      expect(extractBearerToken({ headers: {}, data: {} })).toBeNull();
    });
  });

  describe('extractBearerTokenFromCookie', () => {
    it('extracts session token from raw cookie string', () => {
      const cookie = 'better-auth.session_token=signed-token-123.sig456; Path=/; HttpOnly';
      expect(extractBearerTokenFromCookie(cookie)).toBe('signed-token-123.sig456');
    });

    it('extracts session token from multiple cookies', () => {
      const cookie = 'other_cookie=xyz; better-auth.session_token=token-multi.abc; third=123';
      expect(extractBearerTokenFromCookie(cookie)).toBe('token-multi.abc');
    });

    it('extracts session token with __Secure- prefix', () => {
      const cookie = '__Secure-better-auth.session_token=secure-token-999; Path=/';
      expect(extractBearerTokenFromCookie(cookie)).toBe('secure-token-999');
    });

    it('extracts session token from URI-encoded cookie string', () => {
      const cookie = 'better-auth.session_token%3Dencoded-token.sig%3B%20Path%3D%2F';
      expect(extractBearerTokenFromCookie(cookie)).toBe('encoded-token.sig');
    });

    it('returns null when session token cookie is not present or invalid', () => {
      expect(extractBearerTokenFromCookie('')).toBeNull();
      expect(extractBearerTokenFromCookie(null)).toBeNull();
      expect(extractBearerTokenFromCookie('some_other_cookie=value; Path=/')).toBeNull();
    });
  });

  describe('extractBearerTokenFromRedirectUrl', () => {
    it('extracts token from cookie query param', () => {
      const url = 'ledgerkeeper.dev://?cookie=better-auth.session_token%3Dcookie-bearer.sig%3B%20Path%3D%2F';
      expect(extractBearerTokenFromRedirectUrl(url)).toBe('cookie-bearer.sig');
    });

    it('extracts token from direct token query param', () => {
      const url = 'ledgerkeeper.dev://?token=direct-bearer-123';
      expect(extractBearerTokenFromRedirectUrl(url)).toBe('direct-bearer-123');
    });

    it('extracts token from auth_token query param', () => {
      const url = 'ledgerkeeper.preview://?auth_token=auth-bearer-456';
      expect(extractBearerTokenFromRedirectUrl(url)).toBe('auth-bearer-456');
    });

    it('extracts token from set-auth-token query param', () => {
      const url = 'ledgerkeeper://?set-auth-token=set-auth-bearer-789';
      expect(extractBearerTokenFromRedirectUrl(url)).toBe('set-auth-bearer-789');
    });

    it('returns null when redirect URL has no recognized token or cookie', () => {
      expect(extractBearerTokenFromRedirectUrl('ledgerkeeper://')).toBeNull();
      expect(extractBearerTokenFromRedirectUrl(null)).toBeNull();
      expect(extractBearerTokenFromRedirectUrl('invalid-url-string')).toBeNull();
    });
  });

  describe('getAuthErrorMessage', () => {
    const mockT = (key: string) => {
      const dict: Record<string, string> = {
        'auth.errors.offline': 'You\'re offline. Check your connection and try again.',
        'auth.errors.serverError': 'Something went wrong. Try again.',
        'auth.errors.googleFailed': 'Couldn\'t sign in with Google. Try again.',
        'auth.errors.invalidCredentials': 'Email or password is incorrect',
        'auth.errors.userAlreadyExists': 'User already exists',
      };
      return dict[key] ?? key;
    };

    it('handles offline error', () => {
      const error = new ApiError({ kind: 'offline', message: 'No connection' });
      const result = getAuthErrorMessage(error, 'signin', mockT);
      expect(result.message).toBe('You\'re offline. Check your connection and try again.');
      expect(result.shouldClearPassword).toBe(false);
    });

    it('handles google mode errors', () => {
      const offlineError = new ApiError({ kind: 'offline', message: 'No connection' });
      expect(getAuthErrorMessage(offlineError, 'google', mockT).message).toBe(
        'You\'re offline. Check your connection and try again.',
      );

      const serverError = new ApiError({ kind: 'server', message: 'OAuth failed' });
      expect(getAuthErrorMessage(serverError, 'google', mockT).message).toBe(
        'Couldn\'t sign in with Google. Try again.',
      );
    });

    it('handles timeout error', () => {
      const error = new ApiError({ kind: 'timeout', message: 'Timed out' });
      const result = getAuthErrorMessage(error, 'signin', mockT);
      expect(result.message).toBe('Something went wrong. Try again.');
      expect(result.shouldClearPassword).toBe(false);
    });

    it('handles 500 server error', () => {
      const error = new ApiError({ kind: 'server', status: 500, message: 'Internal Error' });
      const result = getAuthErrorMessage(error, 'signin', mockT);
      expect(result.message).toBe('Something went wrong. Try again.');
      expect(result.shouldClearPassword).toBe(false);
    });

    it('handles invalid credentials on signin and requests password clear', () => {
      const error = new ApiError({ kind: 'unauthorized', status: 401, message: 'Invalid credentials' });
      const result = getAuthErrorMessage(error, 'signin', mockT);
      expect(result.message).toBe('Email or password is incorrect');
      expect(result.shouldClearPassword).toBe(true);
    });

    it('handles duplicate user on signup with server message', () => {
      const error = new ApiError({
        kind: 'conflict',
        status: 409,
        message: 'User already exists. Use another email.',
      });
      const result = getAuthErrorMessage(error, 'signup', mockT);
      expect(result.message).toBe('User already exists. Use another email.');
      expect(result.shouldClearPassword).toBe(false);
    });
  });

  describe('signInWithEmail', () => {
    it('sends trimmed email and returns token from header', async () => {
      mock.onPost('/auth/sign-in/email').reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.email).toBe('user@example.com');
        expect(body.password).toBe('pass1234');
        return [200, { user: { id: 'u1' } }, { 'set-auth-token': 'jwt-bearer-xyz' }];
      });

      const token = await signInWithEmail('  user@example.com  ', 'pass1234');
      expect(token).toBe('jwt-bearer-xyz');
    });

    it('throws ApiError if server returns 200 without token', async () => {
      mock.onPost('/auth/sign-in/email').reply(200, {});
      await expect(signInWithEmail('user@example.com', 'pass1234')).rejects.toThrow(ApiError);
    });
  });

  describe('signUpWithEmail', () => {
    it('sends trimmed name and email and returns token', async () => {
      mock.onPost('/auth/sign-up/email').reply((config) => {
        const body = JSON.parse(config.data);
        expect(body.name).toBe('John Doe');
        expect(body.email).toBe('john@example.com');
        expect(body.password).toBe('secret123');
        return [200, { token: 'signup-bearer-token' }];
      });

      const token = await signUpWithEmail('  John Doe  ', '  john@example.com  ', 'secret123');
      expect(token).toBe('signup-bearer-token');
    });

    it('authClient wraps signInWithEmail, signUpWithEmail, and signIn.social', () => {
      expect(authClient.signInWithEmail).toBe(signInWithEmail);
      expect(authClient.signUpWithEmail).toBe(signUpWithEmail);
      expect(authClient.signIn.social).toBe(signInSocial);
      expect(authClient.signInSocial).toBe(signInSocial);
    });
  });

  describe('signInSocial', () => {
    it('throws offline ApiError when device is offline without calling server or opening browser', async () => {
      jest.spyOn(onlineManager, 'isOnline').mockReturnValue(false);
      const openBrowserSpy = jest.spyOn(WebBrowser, 'openAuthSessionAsync');

      await expect(signInSocial({ provider: 'google' })).rejects.toThrow(ApiError);
      expect(openBrowserSpy).not.toHaveBeenCalled();
    });

    it('initiates social sign in, opens browser, and returns token on success', async () => {
      mock.onPost('/auth/sign-in/social').reply(200, {
        url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=google-client',
        redirect: true,
      });

      jest.spyOn(WebBrowser, 'openAuthSessionAsync').mockResolvedValue({
        type: 'success',
        url: 'ledgerkeeper.dev://?cookie=better-auth.session_token%3Dsocial-bearer-token.sig123%3B%20Path%3D%2F',
      });

      const result = await signInSocial({ provider: 'google' });
      expect(result.canceled).toBe(false);
      expect(result.token).toBe('social-bearer-token.sig123');
      expect(result.data?.token).toBe('social-bearer-token.sig123');
      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalled();
    });

    it('returns canceled: true when browser session is dismissed or cancelled', async () => {
      mock.onPost('/auth/sign-in/social').reply(200, {
        url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=google-client',
        redirect: true,
      });

      jest.spyOn(WebBrowser, 'openAuthSessionAsync').mockResolvedValue({
        type: WebBrowser.WebBrowserResultType.CANCEL,
      });

      const result = await signInSocial({ provider: 'google' });
      expect(result.canceled).toBe(true);
      expect(result.token).toBeNull();
      expect(result.error).toBeNull();
    });

    it('throws ApiError if server returns 200 without authorization URL', async () => {
      mock.onPost('/auth/sign-in/social').reply(200, {});

      await expect(signInSocial({ provider: 'google' })).rejects.toThrow(ApiError);
    });

    it('throws ApiError if redirect URL indicates OAuth error', async () => {
      mock.onPost('/auth/sign-in/social').reply(200, {
        url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=google-client',
        redirect: true,
      });

      jest.spyOn(WebBrowser, 'openAuthSessionAsync').mockResolvedValue({
        type: 'success',
        url: 'ledgerkeeper.dev://?error=access_denied&error_description=User%20denied%20access',
      });

      await expect(signInSocial({ provider: 'google' })).rejects.toThrow('User denied access');
    });

    it('throws ApiError if redirect URL does not contain session token', async () => {
      mock.onPost('/auth/sign-in/social').reply(200, {
        url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=google-client',
        redirect: true,
      });

      jest.spyOn(WebBrowser, 'openAuthSessionAsync').mockResolvedValue({
        type: 'success',
        url: 'ledgerkeeper.dev://?something_else=123',
      });

      await expect(signInSocial({ provider: 'google' })).rejects.toThrow(ApiError);
    });
  });
});
