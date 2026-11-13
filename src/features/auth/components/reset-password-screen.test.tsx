import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { authClient } from '@/features/auth/api/auth-client';
import { ResetPasswordScreen } from '@/features/auth/components/reset-password-screen';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { apiClient } from '@/lib/api/client';
import { storage } from '@/lib/storage';
import { fireEvent, render, screen, waitFor } from '@/lib/test-utils';

const mockReplace = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockParams,
}));

describe('resetPasswordScreen', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    mockReplace.mockClear();
    mockParams = { token: 'reset-token' };
  });

  const originalSignIn = useAuthStore.getState().signIn;
  const signIn = jest.fn(async (_token: string) => {});

  afterEach(() => {
    mock.restore();
    jest.restoreAllMocks();
    jest.mocked(storage.getString).mockReset();
    signIn.mockClear();
    useAuthStore.setState({ sessionNotice: null, signIn: originalSignIn });
  });

  function rememberResetEmail(email: string) {
    jest.mocked(storage.getString).mockImplementation(key => (key === 'password_reset_email' ? email : undefined));
    useAuthStore.setState({ signIn });
  }

  it('signs in with the new password and opens the Ledger after a valid reset', async () => {
    mock.onPost('/auth/reset-password').reply(200, { status: true });
    rememberResetEmail('reset@example.com');
    const signInWithEmail = jest.spyOn(authClient, 'signInWithEmail').mockResolvedValue('session-token');
    render(<ResetPasswordScreen />);
    fill('secret123', 'secret123');
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
    expect(signInWithEmail).toHaveBeenCalledWith('reset@example.com', 'secret123');
    expect(signIn).toHaveBeenCalledWith('session-token');
    expect(storage.remove).toHaveBeenCalledWith('password_reset_email');
    expect(useAuthStore.getState().sessionNotice).toBeNull();
  });

  it('sends the user to sign in manually with a readable message when auto sign-in fails', async () => {
    mock.onPost('/auth/reset-password').reply(200, { status: true });
    rememberResetEmail('reset@example.com');
    jest.spyOn(authClient, 'signInWithEmail').mockRejectedValue(new Error('network'));
    render(<ResetPasswordScreen />);
    fill('secret123', 'secret123');
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/auth'));
    expect(mockReplace).not.toHaveBeenCalledWith('/');
    expect(signIn).not.toHaveBeenCalled();
    expect(useAuthStore.getState().sessionNotice).toBe('Your password was changed. Sign in with your new password.');
  });

  function fill(password: string, confirm: string) {
    fireEvent.changeText(screen.getByTestId('reset-password-input'), password);
    fireEvent.changeText(screen.getByTestId('reset-confirm-input'), confirm);
    fireEvent.press(screen.getByTestId('reset-submit'));
  }

  it('shows the expired state for a link with an error', () => {
    mockParams = { error: 'INVALID_TOKEN' };
    render(<ResetPasswordScreen />);
    expect(screen.getByText('This link has expired')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('reset-send-new'));
    expect(mockReplace).toHaveBeenCalledWith('/forgot-password');
  });

  it('validates length and matching before sending', async () => {
    render(<ResetPasswordScreen />);
    fill('secret123', 'secret999');
    expect(await screen.findByText('Passwords don\'t match')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('switches to expired when the server rejects the token', async () => {
    mock.onPost('/auth/reset-password').reply(400, { code: 'INVALID_TOKEN', message: 'Invalid token' });
    render(<ResetPasswordScreen />);
    fill('secret123', 'secret123');
    expect(await screen.findByText('This link has expired')).toBeOnTheScreen();
  });

  it('saves the password and sends the user to sign in', async () => {
    mock.onPost('/auth/reset-password').reply(200, { status: true });
    render(<ResetPasswordScreen />);
    fill('secret123', 'secret123');
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/auth'));
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ token: 'reset-token', newPassword: 'secret123' });
    expect(useAuthStore.getState().sessionNotice).toBe('Your password was changed. Sign in with your new password.');
  });

  it('keeps the values and shows an error on server failure', async () => {
    mock.onPost('/auth/reset-password').reply(500);
    render(<ResetPasswordScreen />);
    fill('secret123', 'secret123');
    expect(await screen.findByTestId('reset-error')).toBeOnTheScreen();
    expect(screen.getByTestId('reset-password-input')).toHaveDisplayValue('secret123');
  });
});
