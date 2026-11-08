import type { z, ZodTypeAny } from 'zod';

import type { ApiErrorKind, ApiErrorOptions } from '@/lib/api/types';

import axios from 'axios';

export class ApiError extends Error {
  readonly available?: number;
  readonly cause?: unknown;
  readonly code?: string;
  readonly data?: unknown;
  readonly field?: string;
  readonly issues?: unknown[];
  readonly kind: ApiErrorKind;
  readonly limit?: number;
  readonly required?: number;
  readonly status?: number;

  constructor(options: ApiErrorOptions) {
    super(options.message ?? `API Error: ${options.kind}`);
    this.name = 'ApiError';
    this.kind = options.kind;
    this.status = options.status;
    this.data = options.data;
    this.code = options.code;
    this.required = options.required;
    this.available = options.available;
    this.field = options.field;
    this.limit = options.limit;
    this.issues = options.issues;
    this.cause = options.cause;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function parse<T extends ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError({
      cause: result.error,
      data,
      issues: result.error.issues,
      kind: 'invalid_response',
      message: result.error.message || 'Response body failed schema validation',
    });
  }
  return result.data;
}

type ExtractedPayload = {
  available?: number;
  code?: string;
  dataObj: Record<string, unknown>;
  field?: string;
  issues?: unknown[];
  limit?: number;
  required?: number;
  responseData: unknown;
  serverMessage?: string;
};

function extractPayloadDetails(payload: unknown): ExtractedPayload {
  let serverMessage: string | undefined;
  let dataObj: Record<string, unknown> = {};

  if (payload && typeof payload === 'object') {
    const raw = payload as Record<string, unknown>;
    if (typeof raw.message === 'string') {
      serverMessage = raw.message;
    }

    if (raw.data && typeof raw.data === 'object') {
      dataObj = raw.data as Record<string, unknown>;
    }
    else {
      dataObj = raw;
    }
  }
  else if (typeof payload === 'string') {
    serverMessage = payload;
  }

  const responseData = (payload && typeof payload === 'object' && 'data' in payload)
    ? (payload as Record<string, unknown>).data
    : payload;

  const rawPayload = (payload && typeof payload === 'object') ? (payload as Record<string, unknown>) : {};

  return {
    available: typeof dataObj.available === 'number'
      ? dataObj.available
      : (typeof rawPayload.available === 'number' ? rawPayload.available : undefined),
    code: typeof dataObj.code === 'string'
      ? dataObj.code
      : (typeof rawPayload.code === 'string' ? rawPayload.code : undefined),
    dataObj,
    field: typeof dataObj.field === 'string'
      ? dataObj.field
      : (typeof rawPayload.field === 'string' ? rawPayload.field : undefined),
    issues: Array.isArray(dataObj.issues)
      ? dataObj.issues
      : (Array.isArray(rawPayload.issues) ? rawPayload.issues : undefined),
    limit: typeof dataObj.limit === 'number'
      ? dataObj.limit
      : (typeof rawPayload.limit === 'number' ? rawPayload.limit : undefined),
    required: typeof dataObj.required === 'number'
      ? dataObj.required
      : (typeof rawPayload.required === 'number' ? rawPayload.required : undefined),
    responseData,
    serverMessage,
  };
}

function createErrorFromResponse(
  status: number,
  extracted: ExtractedPayload,
  cause: unknown,
): ApiError {
  const { available, code, field, issues, limit, required, responseData, serverMessage } = extracted;

  switch (status) {
    case 401:
      return new ApiError({
        cause,
        data: responseData,
        kind: 'unauthorized',
        message: serverMessage ?? 'Unauthorized',
        status: 401,
      });

    case 402:
      return new ApiError({
        available,
        cause,
        code: code ?? 'insufficient_credits',
        data: responseData,
        kind: 'insufficient_credits',
        message: serverMessage ?? 'Insufficient credits',
        required,
        status: 402,
      });

    case 403:
      return new ApiError({
        cause,
        code,
        data: responseData,
        kind: 'forbidden',
        message: serverMessage ?? 'Forbidden',
        status: 403,
      });

    case 404:
      return new ApiError({
        cause,
        data: responseData,
        kind: 'not_found',
        message: serverMessage ?? 'Not found',
        status: 404,
      });

    case 409:
      return new ApiError({
        cause,
        code,
        data: responseData,
        kind: 'conflict',
        message: serverMessage ?? 'Conflict',
        status: 409,
      });

    case 422:
      return new ApiError({
        cause,
        code,
        data: responseData,
        field,
        issues,
        kind: 'validation',
        limit,
        message: serverMessage ?? 'Validation failed',
        status: 422,
      });

    case 429:
      return new ApiError({
        cause,
        data: responseData,
        kind: 'rate_limited',
        message: serverMessage ?? 'Too many requests',
        status: 429,
      });

    default:
      return new ApiError({
        cause,
        data: responseData,
        kind: 'server',
        message: serverMessage ?? (status >= 500 && status < 600 ? `Server error (${status})` : `Unexpected status (${status})`),
        status,
      });
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const isTimeout
      = error.code === 'ECONNABORTED'
        || error.code === 'ETIMEDOUT'
        || (typeof error.message === 'string' && error.message.toLowerCase().includes('timeout'));

    if (isTimeout) {
      return new ApiError({
        cause: error,
        kind: 'timeout',
        message: error.message || 'Request timed out',
      });
    }

    const isOffline
      = !error.response
        || error.code === 'ERR_NETWORK'
        || (typeof navigator !== 'undefined' && (navigator as { onLine?: boolean }).onLine === false);

    if (isOffline && !error.response) {
      return new ApiError({
        cause: error,
        kind: 'offline',
        message: error.message || 'Network error: could not connect to server',
      });
    }

    if (error.response) {
      const extracted = extractPayloadDetails(error.response.data);
      return createErrorFromResponse(error.response.status, extracted, error);
    }
  }

  if (error instanceof Error) {
    return new ApiError({
      cause: error,
      kind: 'server',
      message: error.message,
    });
  }

  return new ApiError({
    cause: error,
    kind: 'server',
    message: 'Unknown error occurred',
  });
}
