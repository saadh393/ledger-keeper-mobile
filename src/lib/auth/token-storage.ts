import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'auth_token';

function safeErrorLog(prefix: string, error: unknown, tokenToRedact?: string): void {
  if (error instanceof Error) {
    let msg = error.message;
    if (tokenToRedact && tokenToRedact.length > 0) {
      msg = msg.split(tokenToRedact).join('[REDACTED]');
    }
    console.error(`${prefix}: ${msg}`);
  }
  else {
    console.error(prefix);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
  catch (error) {
    safeErrorLog('Failed to get token from secure storage', error);
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
  catch (error) {
    safeErrorLog('Failed to set token in secure storage', error, token);
    throw error;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
  catch (error) {
    safeErrorLog('Failed to clear token from secure storage', error);
    throw error;
  }
}
