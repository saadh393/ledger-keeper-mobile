import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'auth_token';

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
  catch (error) {
    console.error('Failed to get token from secure storage', error);
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
  catch (error) {
    console.error('Failed to set token in secure storage', error);
    throw error;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
  catch (error) {
    console.error('Failed to clear token from secure storage', error);
    throw error;
  }
}
