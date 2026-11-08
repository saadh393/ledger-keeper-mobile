/* eslint-disable max-lines-per-function */
import MockAdapter from 'axios-mock-adapter';
import z from 'zod';

import {
  _resetUnauthorizedState,
  apiClient,
  ApiError,
  DEFAULT_TIMEOUT_MS,
  getApiBaseUrl,
  parse,
  setOnUnauthorized,
} from '@/lib/api';
import * as tokenStorage from '@/lib/auth/token-storage';

describe('apiClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    _resetUnauthorizedState();
    setOnUnauthorized(null);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('base URL and timeout configuration', () => {
    it('constructs base URL by appending /api without duplicate slashes', () => {
      expect(getApiBaseUrl('http://localhost:4000')).toBe('http://localhost:4000/api');
      expect(getApiBaseUrl('http://localhost:4000/')).toBe('http://localhost:4000/api');
      expect(getApiBaseUrl('http://localhost:4000/api')).toBe('http://localhost:4000/api');
      expect(getApiBaseUrl('http://localhost:4000/api/')).toBe('http://localhost:4000/api');
      expect(getApiBaseUrl('https://api.ledgerkeeper.com')).toBe('https://api.ledgerkeeper.com/api');
    });

    it('has default timeout of 30 seconds', () => {
      expect(DEFAULT_TIMEOUT_MS).toBe(30000);
      expect(apiClient.defaults.timeout).toBe(30000);
    });

    it('allows caller to pass a custom timeout per request', async () => {
      mock.onGet('/custom-timeout').reply((config) => {
        expect(config.timeout).toBe(60000);
        return [200, { success: true }];
      });

      const res = await apiClient.get('/custom-timeout', { timeout: 60000 });
      expect(res.data).toEqual({ success: true });
    });
  });

  describe('authorization header injection', () => {
    it('sends Authorization: Bearer <token> when token is stored', async () => {
      jest.spyOn(tokenStorage, 'getToken').mockResolvedValueOnce('stored-jwt-token');

      mock.onGet('/with-token').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer stored-jwt-token');
        return [200, { ok: true }];
      });

      const res = await apiClient.get('/with-token');
      expect(res.data).toEqual({ ok: true });
    });

    it('omits Authorization header when no token is stored', async () => {
      jest.spyOn(tokenStorage, 'getToken').mockResolvedValueOnce(null);

      mock.onGet('/without-token').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined();
        expect(config.headers?.authorization).toBeUndefined();
        return [200, { ok: true }];
      });

      const res = await apiClient.get('/without-token');
      expect(res.data).toEqual({ ok: true });
    });

    it('injects expo-origin header with app scheme on requests', async () => {
      mock.onGet('/with-origin').reply((config) => {
        expect(config.headers?.['expo-origin']).toBe('ledgerkeeper.dev://');
        return [200, { ok: true }];
      });

      const res = await apiClient.get('/with-origin');
      expect(res.data).toEqual({ ok: true });
    });
  });

  describe('error handling and typed ApiError kinds', () => {
    it('maps offline / network error to ApiError kind: offline', async () => {
      mock.onGet('/offline').networkError();

      await expect(apiClient.get('/offline')).rejects.toMatchObject({
        kind: 'offline',
        name: 'ApiError',
      });
    });

    it('maps request timeout to ApiError kind: timeout', async () => {
      mock.onGet('/timeout').timeout();

      await expect(apiClient.get('/timeout')).rejects.toMatchObject({
        kind: 'timeout',
        name: 'ApiError',
      });
    });

    it('maps 401 to ApiError kind: unauthorized and preserves message', async () => {
      mock.onGet('/unauthorized').reply(401, {
        message: 'Invalid or expired token',
      });

      try {
        await apiClient.get('/unauthorized');
        fail('Expected request to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('unauthorized');
        expect(apiError.status).toBe(401);
        expect(apiError.message).toBe('Invalid or expired token');
      }
    });

    it('maps 402 to ApiError kind: insufficient_credits carrying required and available', async () => {
      mock.onGet('/credits').reply(402, {
        status: 402,
        message: 'This operation requires 10 credits',
        data: {
          code: 'insufficient_credits',
          required: 10,
          available: 3,
        },
      });

      try {
        await apiClient.get('/credits');
        fail('Expected request to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('insufficient_credits');
        expect(apiError.status).toBe(402);
        expect(apiError.message).toBe('This operation requires 10 credits');
        expect(apiError.code).toBe('insufficient_credits');
        expect(apiError.required).toBe(10);
        expect(apiError.available).toBe(3);
      }
    });

    it('maps 409 to ApiError kind: conflict carrying data.code', async () => {
      mock.onGet('/conflict').reply(409, {
        message: 'Book name already in use',
        data: {
          code: 'book_name_taken',
        },
      });

      try {
        await apiClient.get('/conflict');
        fail('Expected request to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('conflict');
        expect(apiError.status).toBe(409);
        expect(apiError.code).toBe('book_name_taken');
        expect(apiError.message).toBe('Book name already in use');
      }
    });

    it('maps 422 with issues to ApiError kind: validation carrying data.issues', async () => {
      const issues = [{ path: ['title'], message: 'Title is required' }];
      mock.onPost('/validate').reply(422, {
        message: 'Payload validation failed',
        data: {
          issues,
        },
      });

      try {
        await apiClient.post('/validate', {});
        fail('Expected request to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('validation');
        expect(apiError.status).toBe(422);
        expect(apiError.message).toBe('Payload validation failed');
        expect(apiError.issues).toEqual(issues);
      }
    });

    it('maps 422 with limit_exceeded to ApiError kind: validation carrying field and limit', async () => {
      mock.onPost('/limit').reply(422, {
        message: 'Message length exceeded',
        data: {
          code: 'limit_exceeded',
          field: 'maxMessageChars',
          limit: 1000,
        },
      });

      try {
        await apiClient.post('/limit', {});
        fail('Expected request to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('validation');
        expect(apiError.status).toBe(422);
        expect(apiError.code).toBe('limit_exceeded');
        expect(apiError.field).toBe('maxMessageChars');
        expect(apiError.limit).toBe(1000);
        expect(apiError.message).toBe('Message length exceeded');
      }
    });

    it('maps 403 to ApiError kind: forbidden carrying data.code', async () => {
      mock.onGet('/disabled').reply(403, {
        message: 'Voice feature is disabled by admin',
        data: {
          code: 'operation_disabled',
        },
      });

      try {
        await apiClient.get('/disabled');
        fail('Expected request to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('forbidden');
        expect(apiError.status).toBe(403);
        expect(apiError.code).toBe('operation_disabled');
        expect(apiError.message).toBe('Voice feature is disabled by admin');
      }
    });

    it('maps 404 to ApiError kind: not_found', async () => {
      mock.onGet('/missing').reply(404, {
        message: 'Book not found',
      });

      try {
        await apiClient.get('/missing');
        fail('Expected request to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('not_found');
        expect(apiError.status).toBe(404);
        expect(apiError.message).toBe('Book not found');
      }
    });

    it('maps 429 to ApiError kind: rate_limited', async () => {
      mock.onGet('/rate-limited').reply(429, {
        message: 'Too many requests, slow down',
      });

      try {
        await apiClient.get('/rate-limited');
        fail('Expected request to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('rate_limited');
        expect(apiError.status).toBe(429);
        expect(apiError.message).toBe('Too many requests, slow down');
      }
    });

    it('maps 5xx status to ApiError kind: server', async () => {
      mock.onGet('/server-err').reply(503, {
        message: 'Service unavailable',
      });

      try {
        await apiClient.get('/server-err');
        fail('Expected request to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('server');
        expect(apiError.status).toBe(503);
        expect(apiError.message).toBe('Service unavailable');
      }
    });

    it('maps unexpected status to ApiError kind: server', async () => {
      mock.onGet('/teapot').reply(418, {
        message: 'I\'m a teapot',
      });

      try {
        await apiClient.get('/teapot');
        fail('Expected request to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('server');
        expect(apiError.status).toBe(418);
        expect(apiError.message).toBe('I\'m a teapot');
      }
    });

    it('provides fallback message when server provides no message', async () => {
      mock.onGet('/empty-404').reply(404, {});

      try {
        await apiClient.get('/empty-404');
        fail('Expected request to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('not_found');
        expect(apiError.message).toBe('Not found');
      }
    });
  });

  describe('onUnauthorized listener handling', () => {
    it('notifies listener on 401', async () => {
      const listener = jest.fn();
      setOnUnauthorized(listener);

      mock.onGet('/unauth-single').reply(401, { message: 'Unauthorized' });

      await expect(apiClient.get('/unauth-single')).rejects.toThrow();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('calling parallel 401s notifies listener only once', async () => {
      const listener = jest.fn();
      setOnUnauthorized(listener);

      mock.onGet('/unauth-1').reply(401, { message: 'Unauthorized 1' });
      mock.onGet('/unauth-2').reply(401, { message: 'Unauthorized 2' });

      const results = await Promise.allSettled([
        apiClient.get('/unauth-1'),
        apiClient.get('/unauth-2'),
      ]);

      expect(results[0].status).toBe('rejected');
      expect(results[1].status).toBe('rejected');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('parse helper with Zod', () => {
    const userSchema = z.object({
      id: z.string(),
      name: z.string(),
      credits: z.number(),
    });

    it('returns validated data on schema match', () => {
      const validData = { id: 'u_1', name: 'Alice', credits: 50 };
      const parsed = parse(userSchema, validData);
      expect(parsed).toEqual(validData);
    });

    it('throws ApiError with kind invalid_response on schema mismatch', () => {
      const invalidData = { id: 'u_1', name: 12345 };

      expect(() => parse(userSchema, invalidData)).toThrow(ApiError);

      try {
        parse(userSchema, invalidData);
        fail('Expected parse to throw');
      }
      catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiError = err as ApiError;
        expect(apiError.kind).toBe('invalid_response');
        expect(apiError.issues).toBeDefined();
        expect(apiError.issues!.length).toBeGreaterThan(0);
        expect(apiError.data).toEqual(invalidData);
      }
    });
  });
});
