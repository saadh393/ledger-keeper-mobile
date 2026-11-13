import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { useAuthStore } from '@/features/auth';
import { DeleteAccountSheet } from '@/features/settings/components/delete-account-sheet';
import { apiClient } from '@/lib/api/client';
import { storage } from '@/lib/storage';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';
import { useThemeStore } from '@/lib/theme/use-theme-store';

jest.mock('react-native-flash-message', () => ({ showMessage: jest.fn() }));

describe('deleteAccountSheet', () => {
  let mock: MockAdapter;
  const originalSignOut = useAuthStore.getState().signOut;
  const signOut = jest.fn(async () => {});

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    signOut.mockClear();
    jest.mocked(storage.clearAll).mockClear();
    useAuthStore.setState({ signOut });
    act(() => useThemeStore.setState({ theme: 'light' }));
  });

  afterEach(() => {
    mock.restore();
    act(() => {
      useAuthStore.setState({ signOut: originalSignOut, sessionNotice: null });
      useThemeStore.setState({ theme: 'dark' });
    });
  });

  function goToConfirm() {
    render(<DeleteAccountSheet onDismiss={jest.fn()} />);
    expect(screen.getByTestId('delete-account-explain')).toHaveTextContent(/cannot be undone/);
    fireEvent.press(screen.getByTestId('delete-account-continue'));
  }

  it('enables the final button only after typing DELETE', () => {
    goToConfirm();
    expect(screen.getByTestId('delete-account-confirm')).toBeDisabled();
    fireEvent.changeText(screen.getByTestId('delete-account-input'), 'delet');
    expect(screen.getByTestId('delete-account-confirm')).toBeDisabled();
    fireEvent.changeText(screen.getByTestId('delete-account-input'), 'delete');
    expect(screen.getByTestId('delete-account-confirm')).toBeEnabled();
  });

  it('deletes the account and clears everything on success', async () => {
    mock.onDelete('/users/me').reply(204);
    goToConfirm();
    fireEvent.changeText(screen.getByTestId('delete-account-input'), 'DELETE');
    fireEvent.press(screen.getByTestId('delete-account-confirm'));
    await waitFor(() => expect(useAuthStore.getState().sessionNotice).toBe('Your account was deleted'));
    expect(signOut).toHaveBeenCalled();
    expect(storage.clearAll).toHaveBeenCalled();
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('keeps local data and shows an error when deletion fails', async () => {
    mock.onDelete('/users/me').reply(500);
    goToConfirm();
    fireEvent.changeText(screen.getByTestId('delete-account-input'), 'DELETE');
    fireEvent.press(screen.getByTestId('delete-account-confirm'));
    expect(await screen.findByText('Couldn\'t delete your account. Try again.')).toBeOnTheScreen();
    expect(signOut).not.toHaveBeenCalled();
    expect(storage.clearAll).not.toHaveBeenCalled();
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('signs out and asks to sign in again on 401', async () => {
    mock.onDelete('/users/me').reply(401);
    goToConfirm();
    fireEvent.changeText(screen.getByTestId('delete-account-input'), 'DELETE');
    fireEvent.press(screen.getByTestId('delete-account-confirm'));
    await waitFor(() => expect(useAuthStore.getState().sessionNotice).toBe('Sign in again to delete your account.'));
    expect(signOut).toHaveBeenCalled();
  });
});
