import * as SecureStore from 'expo-secure-store';

import { clearToken, getToken, setToken, TOKEN_KEY } from '@/lib/auth/token-storage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('token-storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getToken', () => {
    it('returns token from secure store when present', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('secret-jwt-token');
      const token = await getToken();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(TOKEN_KEY);
      expect(token).toBe('secret-jwt-token');
    });

    it('returns null when no token is in secure store', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      const token = await getToken();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(TOKEN_KEY);
      expect(token).toBeNull();
    });

    it('returns null and handles secure store errors gracefully', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Keychain error'));
      const token = await getToken();
      expect(token).toBeNull();
      errorSpy.mockRestore();
    });
  });

  describe('setToken', () => {
    it('saves token to secure store', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      await setToken('new-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_KEY, 'new-token');
    });

    it('propagates error when saving fails and never logs raw token', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const rawSecret = 'super-secret-jwt-token-12345';
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error(`Failed to store token: ${rawSecret}`),
      );
      await expect(setToken(rawSecret)).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalled();
      for (const call of errorSpy.mock.calls) {
        for (const arg of call) {
          expect(String(arg)).not.toContain(rawSecret);
        }
      }
      errorSpy.mockRestore();
    });
  });

  describe('clearToken', () => {
    it('deletes token from secure store', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      await clearToken();
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(TOKEN_KEY);
    });

    it('propagates error when deleting fails', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Delete error'));
      await expect(clearToken()).rejects.toThrow('Delete error');
      errorSpy.mockRestore();
    });
  });
});
