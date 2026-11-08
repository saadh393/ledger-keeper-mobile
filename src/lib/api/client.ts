import type { UnauthorizedListener } from '@/lib/api/types';
import Env from '@env';
import { onlineManager } from '@tanstack/react-query';

import axios from 'axios';
import { ApiError, toApiError } from '@/lib/api/errors';
import { getToken } from '@/lib/auth/token-storage';

export const DEFAULT_TIMEOUT_MS = 30000;

export function getApiBaseUrl(rawUrl?: string): string {
  const url = rawUrl ?? Env.EXPO_PUBLIC_API_URL ?? '';
  const sanitized = url.replace(/\/+$/, '');
  return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
}

let unauthorizedListener: UnauthorizedListener | null = null;
let isHandlingUnauthorized = false;

export function setOnUnauthorized(listener: UnauthorizedListener | null): void {
  unauthorizedListener = listener;
}

export function notifyUnauthorized(): void {
  if (!unauthorizedListener) {
    return;
  }
  if (isHandlingUnauthorized) {
    return;
  }
  isHandlingUnauthorized = true;

  try {
    const result = unauthorizedListener();
    if (result && typeof (result as Promise<void>).then === 'function') {
      (result as Promise<void>).finally(() => {
        setTimeout(() => {
          isHandlingUnauthorized = false;
        }, 1000);
      });
      return;
    }
  }
  catch {
    // Catch errors from listener so request rejection pipeline continues
  }

  setTimeout(() => {
    isHandlingUnauthorized = false;
  }, 1000);
}

export function _resetUnauthorizedState(): void {
  isHandlingUnauthorized = false;
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: DEFAULT_TIMEOUT_MS,
});

apiClient.interceptors.request.use(async (config) => {
  if (!onlineManager.isOnline()) {
    throw new ApiError({
      kind: 'offline',
      message: 'Network error: could not connect to server',
    });
  }

  const token = await getToken();
  if (token) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    else {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  else {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Authorization');
      config.headers.delete('authorization');
    }
    else if (config.headers) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    if (apiError.kind === 'unauthorized') {
      notifyUnauthorized();
    }
    return Promise.reject(apiError);
  },
);
