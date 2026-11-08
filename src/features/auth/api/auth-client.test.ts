/* eslint-disable max-lines-per-function */
import MockAdapter from 'axios-mock-adapter';

import {
  authClient,
  extractBearerToken,
  getAuthErrorMessage,
  signInWithEmail,
  signUpWithEmail,
} from '@/features/auth/api/auth-client';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

describe('auth-client', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
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

  describe('getAuthErrorMessage', () => {
    const mockT = (key: string) => {
      const dict: Record<string, string> = {
        'auth.errors.offline': 'You\'re offline. Check your connection and try again.',
        'auth.errors.serverError': 'Something went wrong. Try again.',
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

    it('authClient wraps signInWithEmail and signUpWithEmail', () => {
      expect(authClient.signInWithEmail).toBe(signInWithEmail);
      expect(authClient.signUpWithEmail).toBe(signUpWithEmail);
    });
  });
});
