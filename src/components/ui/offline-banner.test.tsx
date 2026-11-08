/* eslint-disable max-lines-per-function */
import NetInfo from '@react-native-community/netinfo';
import * as React from 'react';

import {
  checkIsOffline,
  OFFLINE_BANNER_DEBOUNCE_MS,
  OfflineBanner,
  useIsOffline,
} from '@/components/ui/offline-banner';
import i18n from '@/lib/i18n';
import { act, cleanup, render, renderHook, screen } from '@/lib/test-utils';

type NetInfoListener = (state: any) => void;

describe('checkIsOffline helper', () => {
  it('returns false when state is null or undefined', () => {
    expect(checkIsOffline(null)).toBe(false);
    expect(checkIsOffline(undefined)).toBe(false);
  });

  it('returns true when isConnected is false (airplane mode)', () => {
    expect(checkIsOffline({ isConnected: false, isInternetReachable: false })).toBe(true);
    expect(checkIsOffline({ isConnected: false, isInternetReachable: null })).toBe(true);
    expect(checkIsOffline({ isConnected: false, isInternetReachable: true })).toBe(true);
  });

  it('returns true on Wi-Fi with no internet (isInternetReachable === false)', () => {
    expect(checkIsOffline({ isConnected: true, isInternetReachable: false })).toBe(true);
  });

  it('returns false while reachability is still unknown (null) and isConnected is true', () => {
    expect(checkIsOffline({ isConnected: true, isInternetReachable: null })).toBe(false);
  });

  it('returns false when fully connected (online)', () => {
    expect(checkIsOffline({ isConnected: true, isInternetReachable: true })).toBe(false);
  });
});

describe('useIsOffline hook', () => {
  let listeners: NetInfoListener[] = [];

  beforeEach(() => {
    listeners = [];
    (NetInfo.addEventListener as jest.Mock).mockImplementation((fn: NetInfoListener) => {
      listeners.push(fn);
      return () => {
        listeners = listeners.filter(l => l !== fn);
      };
    });
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('defaults to false and updates on network events', async () => {
    const { result } = renderHook(() => useIsOffline());

    expect(result.current).toBe(false);

    // Emit offline event (airplane mode)
    await act(async () => {
      listeners.forEach(fn => fn({ isConnected: false, isInternetReachable: false }));
    });
    expect(result.current).toBe(true);

    // Emit online event
    await act(async () => {
      listeners.forEach(fn => fn({ isConnected: true, isInternetReachable: true }));
    });
    expect(result.current).toBe(false);
  });
});

describe('offlineBanner component', () => {
  let listeners: NetInfoListener[] = [];

  beforeEach(() => {
    jest.useFakeTimers();
    listeners = [];
    (NetInfo.addEventListener as jest.Mock).mockImplementation((fn: NetInfoListener) => {
      listeners.push(fn);
      return () => {
        listeners = listeners.filter(l => l !== fn);
      };
    });
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  afterEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('en');
    });
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    cleanup();
    jest.clearAllMocks();
  });

  it('does not render when online', () => {
    render(<OfflineBanner isOffline={false} />);
    expect(screen.queryByTestId('offline-banner')).toBeNull();
    expect(screen.queryByText('You\'re offline')).toBeNull();
  });

  it('shows the banner after 2000ms when offline', () => {
    render(<OfflineBanner isOffline={true} />);

    // Immediately at 0ms, banner is not yet visible
    expect(screen.queryByTestId('offline-banner')).toBeNull();

    // At 1999ms, still not visible
    act(() => {
      jest.advanceTimersByTime(OFFLINE_BANNER_DEBOUNCE_MS - 1);
    });
    expect(screen.queryByTestId('offline-banner')).toBeNull();

    // At 2000ms, banner appears
    act(() => {
      jest.advanceTimersByTime(1);
    });

    const banner = screen.getByTestId('offline-banner');
    expect(banner).toBeOnTheScreen();
    expect(screen.getByText('You\'re offline')).toBeOnTheScreen();
  });

  it('has accessibilityRole="alert" and accessibilityLiveRegion="assertive"', () => {
    render(<OfflineBanner isOffline={true} />);

    act(() => {
      jest.advanceTimersByTime(OFFLINE_BANNER_DEBOUNCE_MS);
    });

    const banner = screen.getByTestId('offline-banner');
    expect(banner.props.accessibilityRole).toBe('alert');
    expect(banner.props.accessibilityLiveRegion).toBe('assertive');
  });

  it('does not flash banner on short connection blip (< 2s)', () => {
    const { rerender } = render(<OfflineBanner isOffline={false} />);

    // Connection drops (goes offline)
    rerender(<OfflineBanner isOffline={true} />);
    expect(screen.queryByTestId('offline-banner')).toBeNull();

    // 1500ms elapses (< 2000ms)
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.queryByTestId('offline-banner')).toBeNull();

    // Connection restored
    rerender(<OfflineBanner isOffline={false} />);

    // Advance beyond the original 2000ms mark
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Banner NEVER appeared
    expect(screen.queryByTestId('offline-banner')).toBeNull();
  });

  it('hides the banner immediately when turning the network back on', () => {
    const { rerender } = render(<OfflineBanner isOffline={true} />);

    // Wait for banner to appear
    act(() => {
      jest.advanceTimersByTime(OFFLINE_BANNER_DEBOUNCE_MS);
    });
    expect(screen.getByTestId('offline-banner')).toBeOnTheScreen();

    // Turn network back on
    rerender(<OfflineBanner isOffline={false} />);

    // Hides immediately (0ms delay)
    expect(screen.queryByTestId('offline-banner')).toBeNull();
  });

  it('shows banner on Wi-Fi with no internet (isInternetReachable === false)', async () => {
    render(<OfflineBanner />);

    // Wi-Fi connected, but no internet
    await act(async () => {
      listeners.forEach(fn => fn({ isConnected: true, isInternetReachable: false }));
    });

    // Wait 2000ms debounce
    act(() => {
      jest.advanceTimersByTime(OFFLINE_BANNER_DEBOUNCE_MS);
    });

    expect(screen.getByTestId('offline-banner')).toBeOnTheScreen();
    expect(screen.getByText('You\'re offline')).toBeOnTheScreen();
  });

  it('does NOT show banner while reachability is still unknown (null)', async () => {
    render(<OfflineBanner />);

    // Wi-Fi connected, internet reachability still unknown
    await act(async () => {
      listeners.forEach(fn => fn({ isConnected: true, isInternetReachable: null }));
    });

    // Advance timers well past 2 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.queryByTestId('offline-banner')).toBeNull();
  });

  it('respects the top safe area inset', () => {
    render(<OfflineBanner isOffline={true} topInset={44} />);

    act(() => {
      jest.advanceTimersByTime(OFFLINE_BANNER_DEBOUNCE_MS);
    });

    const banner = screen.getByTestId('offline-banner');
    expect(banner).toBeOnTheScreen();
    expect(banner.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paddingTop: 44,
          paddingBottom: 8,
          paddingHorizontal: 16,
        }),
      ]),
    );
  });

  it('uses wheat-200 and ink-900 tokens and supports Bangla localization', async () => {
    await act(async () => {
      await i18n.changeLanguage('bn');
    });

    render(<OfflineBanner isOffline={true} />);

    act(() => {
      jest.advanceTimersByTime(OFFLINE_BANNER_DEBOUNCE_MS);
    });

    const banner = screen.getByTestId('offline-banner');
    expect(banner.props.className).toContain('bg-wheat-200');

    const text = screen.getByText('আপনি অফলাইনে আছেন');
    expect(text).toBeOnTheScreen();
    expect(text.props.className).toContain('text-ink-900');
    expect(text.props.className).toContain('text-label font-medium');
  });
});
