import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { showMessage } from 'react-native-flash-message';
import { useAuthStore } from '@/features/auth';
import { useUserProfile } from '@/features/currency';
import { SettingsAccountSection } from '@/features/settings/components/settings-account-section';
import { SettingsMoneySection } from '@/features/settings/components/settings-money-section';
import { SettingsThemeRow } from '@/features/settings/components/settings-theme-row';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';
import { useThemeStore } from '@/lib/theme/use-theme-store';

jest.mock('react-native-flash-message', () => ({ showMessage: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const profile = { id: 'user-1', name: 'Rahim Uddin', email: 'rahim@example.com', image: null, role: 'user', locale: 'en', currency: 'BDT', currencyConfirmed: true, defaultBookId: 'book-1', createdAt: '2026-01-01T00:00:00.000Z' };

function Sections() {
  const query = useUserProfile();
  return (
    <>
      <SettingsThemeRow />
      <SettingsMoneySection profile={query} />
      <SettingsAccountSection profile={query} />
    </>
  );
}

describe('settings sections', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    jest.mocked(showMessage).mockClear();
    useAuthStore.setState({ status: 'signedIn' });
  });

  afterEach(() => {
    mock.restore();
    act(() => {
      useAuthStore.setState({ status: 'idle' });
      useThemeStore.setState({ theme: 'dark' });
    });
  });

  it('changes the theme at once', async () => {
    mock.onGet('/users/me').reply(200, profile);
    render(<Sections />);
    fireEvent.press(screen.getByTestId('settings-theme-light'));
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('shows the profile and the current currency', async () => {
    mock.onGet('/users/me').reply(200, profile);
    render(<Sections />);
    expect(await screen.findByText('Rahim Uddin')).toBeOnTheScreen();
    expect(screen.getByText('rahim@example.com')).toBeOnTheScreen();
    expect(screen.getByText('BDT')).toBeOnTheScreen();
    expect(screen.getByText('Existing books keep their currency. Your default book changes only while it is empty.')).toBeOnTheScreen();
  });

  it('saves a new default currency', async () => {
    mock.onGet('/users/me').reply(200, profile);
    mock.onGet('/books').reply(200, { items: [] });
    mock.onPatch('/users/me').reply(200, { ...profile, currency: 'AED' });
    render(<Sections />);
    fireEvent.press(await screen.findByTestId('settings-currency'));
    fireEvent.press(await screen.findByTestId('settings-currency-item-AED'));
    fireEvent.press(screen.getByTestId('settings-currency-save'));
    await waitFor(() => expect(showMessage).toHaveBeenCalledWith(expect.objectContaining({ message: 'New books will use AED' })));
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ currency: 'AED' });
  });

  it('keeps the old currency when saving fails', async () => {
    mock.onGet('/users/me').reply(200, profile);
    mock.onPatch('/users/me').reply(500);
    render(<Sections />);
    fireEvent.press(await screen.findByTestId('settings-currency'));
    fireEvent.press(await screen.findByTestId('settings-currency-item-AED'));
    fireEvent.press(screen.getByTestId('settings-currency-save'));
    expect(await screen.findByTestId('settings-currency-error')).toBeOnTheScreen();
    expect(screen.getByTestId('settings-currency')).toHaveTextContent(/BDT/);
    expect(showMessage).not.toHaveBeenCalled();
  });

  it('shows Retry for money and account when the profile fails, while theme still works', async () => {
    mock.onGet('/users/me').replyOnce(500).onGet('/users/me').reply(200, profile);
    render(<Sections />);
    expect(await screen.findByTestId('settings-money-error')).toBeOnTheScreen();
    expect(screen.getByTestId('settings-account-error')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('settings-theme-light'));
    expect(useThemeStore.getState().theme).toBe('light');
    fireEvent.press(screen.getByTestId('settings-money-error-retry'));
    expect(await screen.findByText('Rahim Uddin')).toBeOnTheScreen();
  });

  it('signs out after confirming', async () => {
    mock.onGet('/users/me').reply(200, profile);
    const signOut = jest.fn(async () => {});
    useAuthStore.setState({ signOut });
    render(<Sections />);
    fireEvent.press(screen.getByTestId('settings-sign-out'));
    expect(await screen.findByText('Sign out of Ledger Keeper?')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('sign-out-confirm'));
    await waitFor(() => expect(signOut).toHaveBeenCalled());
  });
});
