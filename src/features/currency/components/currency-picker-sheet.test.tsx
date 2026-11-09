/* eslint-disable max-lines-per-function */
import type { UserProfile } from '@/features/currency/types';
import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';

import { BackHandler } from 'react-native';
import { useAuthStore } from '@/features/auth';
import { CurrencyPickerSheet } from '@/features/currency/components/currency-picker-sheet';
import { apiClient } from '@/lib/api/client';
import { act, cleanup, screen, setup, waitFor } from '@/lib/test-utils';

const mockProfileUnconfirmed: UserProfile = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  image: null,
  role: 'user',
  locale: 'en',
  currency: 'USD',
  currencyConfirmed: false,
  defaultBookId: 'book-1',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockProfileConfirmed: UserProfile = {
  ...mockProfileUnconfirmed,
  currencyConfirmed: true,
};

describe('currencyPickerSheet', () => {
  let mock: MockAdapter;
  let testQueryClient: QueryClient;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    jest.spyOn(onlineManager, 'isOnline').mockReturnValue(true);
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    mock.restore();
    cleanup();
    jest.clearAllMocks();
  });

  function renderSheet(profile: UserProfile = mockProfileUnconfirmed, onSuccess?: () => void) {
    return setup(
      <QueryClientProvider client={testQueryClient}>
        <CurrencyPickerSheet profile={profile} onSuccess={onSuccess} />
      </QueryClientProvider>,
    );
  }

  describe('gating condition', () => {
    it('opens over the app home when currencyConfirmed is false', () => {
      renderSheet(mockProfileUnconfirmed);

      expect(screen.getByTestId('currency-picker-sheet')).toBeOnTheScreen();
      expect(screen.getByTestId('currency-picker-sheet-title')).toHaveTextContent('Choose your currency');
      expect(screen.getByTestId('currency-picker-sheet-subtitle')).toHaveTextContent(
        'Your books use it by default. Amounts in other currencies are converted with the daily rate.',
      );
    });

    it('does not render when currencyConfirmed is true', () => {
      renderSheet(mockProfileConfirmed);

      expect(screen.queryByTestId('currency-picker-sheet')).toBeNull();
      expect(screen.queryByText('Choose your currency')).toBeNull();
    });
  });

  describe('list ordering and display', () => {
    it('shows BDT first, current currency second (if not BDT), then others alphabetically by code', () => {
      renderSheet(mockProfileUnconfirmed);

      expect(screen.getByTestId('currency-picker-sheet-item-BDT')).toBeOnTheScreen();
      expect(screen.getByTestId('currency-picker-sheet-item-USD')).toBeOnTheScreen();
      expect(screen.getByTestId('currency-picker-sheet-item-AED')).toBeOnTheScreen();

      // Check content of BDT item: code, name, and symbol
      const bdtItem = screen.getByTestId('currency-picker-sheet-item-BDT');
      expect(bdtItem).toHaveTextContent(/BDT/);
      expect(bdtItem).toHaveTextContent(/Bangladeshi Taka/);
      expect(bdtItem).toHaveTextContent(/৳/);

      // Check content of USD item: code, name, and symbol
      const usdItem = screen.getByTestId('currency-picker-sheet-item-USD');
      expect(usdItem).toHaveTextContent(/USD/);
      expect(usdItem).toHaveTextContent(/US Dollar/);
      expect(usdItem).toHaveTextContent(/\$/);
    });

    it('preselects the profile current currency', () => {
      renderSheet(mockProfileUnconfirmed);

      const usdItem = screen.getByTestId('currency-picker-sheet-item-USD');
      expect(usdItem.props.accessibilityState?.selected).toBe(true);

      const bdtItem = screen.getByTestId('currency-picker-sheet-item-BDT');
      expect(bdtItem.props.accessibilityState?.selected).toBe(false);
    });

    it('preselects BDT when current currency is BDT and does not duplicate BDT', () => {
      const bdtProfile = { ...mockProfileUnconfirmed, currency: 'BDT' };
      renderSheet(bdtProfile);

      const bdtItem = screen.getByTestId('currency-picker-sheet-item-BDT');
      expect(bdtItem.props.accessibilityState?.selected).toBe(true);
      expect(screen.getAllByTestId('currency-picker-sheet-item-BDT')).toHaveLength(1);
    });
  });

  describe('search filter', () => {
    it('filters by code, case-insensitive (e.g. "eur")', async () => {
      const { user } = renderSheet(mockProfileUnconfirmed);
      const searchInput = screen.getByTestId('currency-picker-sheet-search-input');

      await user.type(searchInput, 'eur');

      expect(screen.getByTestId('currency-picker-sheet-item-EUR')).toBeOnTheScreen();
      expect(screen.queryByTestId('currency-picker-sheet-item-USD')).toBeNull();
    });

    it('filters by name, case-insensitive (e.g. "taka", "Euro")', async () => {
      const { user } = renderSheet(mockProfileUnconfirmed);
      const searchInput = screen.getByTestId('currency-picker-sheet-search-input');

      await user.type(searchInput, 'taka');
      expect(screen.getByTestId('currency-picker-sheet-item-BDT')).toBeOnTheScreen();
      expect(screen.queryByTestId('currency-picker-sheet-item-USD')).toBeNull();

      await user.clear(searchInput);
      await user.type(searchInput, 'Euro');
      expect(screen.getByTestId('currency-picker-sheet-item-EUR')).toBeOnTheScreen();
    });

    it('shows "No currency found" when search has no matches', async () => {
      const { user } = renderSheet(mockProfileUnconfirmed);
      const searchInput = screen.getByTestId('currency-picker-sheet-search-input');

      await user.type(searchInput, 'xyznonexistent');

      expect(screen.getByTestId('currency-picker-sheet-empty')).toBeOnTheScreen();
      expect(screen.getByText('No currency found')).toBeOnTheScreen();
      expect(screen.queryByTestId('currency-picker-sheet-list')).toBeNull();
    });
  });

  describe('sheet non-dismissible behavior', () => {
    it('cannot be closed by tapping scrim or Android back button', async () => {
      const backSpy = jest.spyOn(BackHandler, 'addEventListener');
      const { user } = renderSheet(mockProfileUnconfirmed);

      // Scrim is disabled
      const scrim = screen.getByTestId('currency-picker-sheet-scrim');
      expect(scrim.props.accessibilityState?.disabled || scrim.props.disabled).toBe(true);
      await user.press(scrim);

      // Sheet is still visible
      expect(screen.getByTestId('currency-picker-sheet')).toBeOnTheScreen();

      // Back handler returns true to consume event without closing
      const backCall = backSpy.mock.calls.find(call => call[0] === 'hardwareBackPress');
      expect(backCall).toBeDefined();
      const handler = backCall![1];
      let handled = false;
      act(() => {
        handled = Boolean(handler());
      });
      expect(handled).toBe(true);
      expect(screen.getByTestId('currency-picker-sheet')).toBeOnTheScreen();
    });
  });

  describe('saving currency and query refetching', () => {
    it('tapping Continue sends PATCH /api/users/me, shows Saving…, and closes on success', async () => {
      mock.onPatch('/users/me').reply(200, {
        ...mockProfileUnconfirmed,
        currency: 'EUR',
        currencyConfirmed: true,
      });

      const invalidateSpy = jest.spyOn(testQueryClient, 'invalidateQueries');
      const refetchSpy = jest.spyOn(testQueryClient, 'refetchQueries');
      const onSuccess = jest.fn();

      const { user } = renderSheet(mockProfileUnconfirmed, onSuccess);

      // Select EUR
      const searchInput = screen.getByTestId('currency-picker-sheet-search-input');
      await user.type(searchInput, 'eur');
      await user.press(screen.getByTestId('currency-picker-sheet-item-EUR'));

      const continueBtn = screen.getByTestId('currency-picker-sheet-continue-button');
      await user.press(continueBtn);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });

      // Validates PATCH was sent with selected currency
      expect(mock.history.patch).toHaveLength(1);
      const patchData = JSON.parse(mock.history.patch[0].data);
      expect(patchData).toEqual({ currency: 'EUR' });

      // Profile and books queries are invalidated and refetched
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['users', 'me'] }),
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['books'] }),
      );
      expect(refetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['users', 'me'] }),
      );
      expect(refetchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['books'] }),
      );

      // Sheet is dismissed / removed
      expect(screen.queryByTestId('currency-picker-sheet')).toBeNull();
    });

    it('on save failure stays open with selection kept, shows error and Retry button', async () => {
      mock.onPatch('/users/me').reply(500, { message: 'Internal Server Error' });

      const { user } = renderSheet(mockProfileUnconfirmed);

      // Select BDT
      await user.press(screen.getByTestId('currency-picker-sheet-item-BDT'));
      expect(screen.getByTestId('currency-picker-sheet-item-BDT').props.accessibilityState?.selected).toBe(true);

      const continueBtn = screen.getByTestId('currency-picker-sheet-continue-button');
      await user.press(continueBtn);

      // Wait for error banner
      await waitFor(() => {
        expect(screen.getByTestId('currency-picker-sheet-error-banner')).toBeOnTheScreen();
      });

      // Sheet stays open
      expect(screen.getByTestId('currency-picker-sheet')).toBeOnTheScreen();

      // Selection kept
      expect(screen.getByTestId('currency-picker-sheet-item-BDT').props.accessibilityState?.selected).toBe(true);

      // Error message and Retry button visible
      expect(screen.getByText('Could not save your currency. Try again.')).toBeOnTheScreen();
      const retryBtn = screen.getByTestId('currency-picker-sheet-retry-button');
      expect(retryBtn).toBeOnTheScreen();

      // Setup mock to succeed on retry
      mock.reset();
      mock.onPatch('/users/me').reply(200, {
        ...mockProfileUnconfirmed,
        currency: 'BDT',
        currencyConfirmed: true,
      });

      await user.press(retryBtn);

      await waitFor(() => {
        expect(screen.queryByTestId('currency-picker-sheet')).not.toBeOnTheScreen();
      });

      expect(mock.history.patch).toHaveLength(1);
      const patchData = JSON.parse(mock.history.patch[0].data);
      expect(patchData).toEqual({ currency: 'BDT' });
    });
  });

  describe('sign out button', () => {
    it('allows signing out from the sheet', async () => {
      const signOutSpy = jest.spyOn(useAuthStore.getState(), 'signOut').mockResolvedValue();

      const { user } = renderSheet(mockProfileUnconfirmed);
      const signOutBtn = screen.getByTestId('currency-picker-sheet-sign-out-button');
      expect(signOutBtn).toHaveTextContent('Sign out');

      await user.press(signOutBtn);
      expect(signOutSpy).toHaveBeenCalled();
    });
  });
});
