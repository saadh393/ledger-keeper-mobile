import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { PENDING_LANGUAGE_SYNC } from '@/features/settings/api/sync-profile-language';
import { SettingsLanguageRow } from '@/features/settings/components/settings-language-row';
import { useLanguageStore } from '@/features/settings/store/use-language-store';
import { apiClient } from '@/lib/api/client';
import i18n, { LOCAL } from '@/lib/i18n';
import { storage } from '@/lib/storage';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

describe('settingsLanguageRow', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    jest.mocked(storage.set).mockClear();
    jest.mocked(storage.remove).mockClear();
  });

  afterEach(async () => {
    mock.restore();
    act(() => useLanguageStore.getState().setChoice('system'));
    await i18n.changeLanguage('en');
  });

  it('defaults to phone language', () => {
    render(<SettingsLanguageRow />);
    expect(screen.getByTestId('settings-language')).toHaveTextContent(/Phone language/);
  });

  it('switches to Bangla, saves on the device, and syncs the profile', async () => {
    mock.onPatch('/users/me').reply(200, { locale: 'bn' });
    render(<SettingsLanguageRow />);
    fireEvent.press(screen.getByTestId('settings-language'));
    fireEvent.press(await screen.findByTestId('language-option-bn'));
    await waitFor(() => expect(i18n.language).toBe('bn'));
    expect(storage.set).toHaveBeenCalledWith(LOCAL, 'bn');
    await waitFor(() => expect(storage.remove).toHaveBeenCalledWith(PENDING_LANGUAGE_SYNC));
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ locale: 'bn' });
  });

  it('keeps the local choice and marks the sync pending when the profile save fails', async () => {
    mock.onPatch('/users/me').reply(500);
    render(<SettingsLanguageRow />);
    fireEvent.press(screen.getByTestId('settings-language'));
    fireEvent.press(await screen.findByTestId('language-option-en'));
    await waitFor(() => expect(mock.history.patch).toHaveLength(1));
    expect(storage.set).toHaveBeenCalledWith(LOCAL, 'en');
    expect(storage.set).toHaveBeenCalledWith(PENDING_LANGUAGE_SYNC, 'en');
    expect(storage.remove).not.toHaveBeenCalledWith(PENDING_LANGUAGE_SYNC);
  });
});
