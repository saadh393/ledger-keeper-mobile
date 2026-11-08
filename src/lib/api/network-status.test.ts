import type { AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import { AppState } from 'react-native';

import {
  apiClient,
  ApiError,
  createQueryClient,
  isOnlineFromNetInfo,
  setupFocusManager,
  setupNetworkAndFocus,
  setupOnlineManager,
} from '@/lib/api';

type NetInfoListener = (state: any) => void;
type AppStateListener = (state: AppStateStatus) => void;

describe('isOnlineFromNetInfo helper', () => {
  it('returns true when connected and internet is reachable', () => {
    expect(isOnlineFromNetInfo({ isConnected: true, isInternetReachable: true })).toBe(true);
  });

  it('returns true while reachability is still unknown (null) and connected', () => {
    expect(isOnlineFromNetInfo({ isConnected: true, isInternetReachable: null })).toBe(true);
  });

  it('returns false when Wi-Fi is connected but internet is not reachable', () => {
    expect(isOnlineFromNetInfo({ isConnected: true, isInternetReachable: false })).toBe(false);
  });

  it('returns false when disconnected (airplane mode)', () => {
    expect(isOnlineFromNetInfo({ isConnected: false, isInternetReachable: false })).toBe(false);
    expect(isOnlineFromNetInfo({ isConnected: false, isInternetReachable: null })).toBe(false);
    expect(isOnlineFromNetInfo({ isConnected: false, isInternetReachable: true })).toBe(false);
  });

  it('returns false when state is null or undefined', () => {
    expect(isOnlineFromNetInfo(null)).toBe(false);
    expect(isOnlineFromNetInfo(undefined)).toBe(false);
  });
});

describe('setupOnlineManager wiring with NetInfo', () => {
  let netInfoListeners: NetInfoListener[] = [];

  beforeEach(() => {
    netInfoListeners = [];
    (NetInfo.addEventListener as jest.Mock).mockImplementation((fn: NetInfoListener) => {
      netInfoListeners.push(fn);
      return () => {
        netInfoListeners = netInfoListeners.filter(l => l !== fn);
      };
    });
  });

  afterEach(() => {
    onlineManager.setOnline(true);
    jest.clearAllMocks();
  });

  it('subscribes to NetInfo and updates onlineManager online status', () => {
    const cleanup = setupOnlineManager();
    expect(NetInfo.addEventListener).toHaveBeenCalled();

    // Trigger offline event
    netInfoListeners.forEach(fn => fn({ isConnected: false, isInternetReachable: false }));
    expect(onlineManager.isOnline()).toBe(false);

    // Trigger online event
    netInfoListeners.forEach(fn => fn({ isConnected: true, isInternetReachable: true }));
    expect(onlineManager.isOnline()).toBe(true);

    // Trigger Wi-Fi with no internet
    netInfoListeners.forEach(fn => fn({ isConnected: true, isInternetReachable: false }));
    expect(onlineManager.isOnline()).toBe(false);

    // Trigger unknown reachability while connected
    netInfoListeners.forEach(fn => fn({ isConnected: true, isInternetReachable: null }));
    expect(onlineManager.isOnline()).toBe(true);

    cleanup();
  });
});

describe('setupFocusManager wiring with AppState', () => {
  let appStateListeners: AppStateListener[] = [];

  beforeEach(() => {
    appStateListeners = [];
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event: string, fn: any) => {
      if (event === 'change') {
        appStateListeners.push(fn);
      }
      return {
        remove: () => {
          appStateListeners = appStateListeners.filter(l => l !== fn);
        },
      } as any;
    });
  });

  afterEach(() => {
    focusManager.setFocused(true);
    jest.restoreAllMocks();
  });

  it('subscribes to AppState changes and updates focusManager', () => {
    const cleanup = setupFocusManager();
    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    // Active status
    appStateListeners.forEach(fn => fn('active'));
    expect(focusManager.isFocused()).toBe(true);

    // Background status
    appStateListeners.forEach(fn => fn('background'));
    expect(focusManager.isFocused()).toBe(false);

    // Inactive status
    appStateListeners.forEach(fn => fn('inactive'));
    expect(focusManager.isFocused()).toBe(false);

    // Back to active
    appStateListeners.forEach(fn => fn('active'));
    expect(focusManager.isFocused()).toBe(true);

    cleanup();
  });

  it('setupNetworkAndFocus initializes both listeners and returns teardown', () => {
    const cleanup = setupNetworkAndFocus();
    expect(typeof cleanup).toBe('function');
    cleanup();
  });
});

describe('queryClient configuration & offline mutation behavior', () => {
  let client: ReturnType<typeof createQueryClient>;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(apiClient);
    client = createQueryClient();
    onlineManager.setOnline(true);
  });

  afterEach(() => {
    mockAxios.restore();
    client.getMutationCache().getAll().forEach(m => m.destroy());
    client.getMutationCache().clear();
    client.clear();
    onlineManager.setOnline(true);
  });

  it('configures defaultOptions with refetchOnWindowFocus, refetchOnReconnect, and networkMode always', () => {
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true);
    expect(defaultOptions.queries?.refetchOnReconnect).toBe(true);
    expect(defaultOptions.mutations?.networkMode).toBe('always');
  });

  it('executes mutation successfully when online', async () => {
    const mutationFn = jest.fn().mockResolvedValue({ id: 'item-1', name: 'Saved Item' });
    const mutation = client.getMutationCache().build(client, {
      mutationFn,
    });

    const result = await mutation.execute(undefined);
    expect(result).toEqual({ id: 'item-1', name: 'Saved Item' });
    expect(mutationFn).toHaveBeenCalledTimes(1);
  });

  it('fails mutation immediately with ApiError (kind: offline) when offline', async () => {
    onlineManager.setOnline(false);

    const mutationFn = jest.fn().mockResolvedValue({ success: true });
    const mutation = client.getMutationCache().build(client, {
      mutationFn,
    });

    await expect(mutation.execute(undefined)).rejects.toThrow(ApiError);

    // Mutation is in error state, not paused, and mutationFn was not executed
    expect(mutation.state.status).toBe('error');
    expect(mutation.state.isPaused).toBe(false);
    expect(mutationFn).not.toHaveBeenCalled();

    const error = mutation.state.error as ApiError;
    expect(error.kind).toBe('offline');
    expect(error.message).toBe('Network error: could not connect to server');
  });

  it('fails apiClient request immediately with ApiError (kind: offline) when offline', async () => {
    mockAxios.onGet('/save-data').reply(200, { ok: true });

    onlineManager.setOnline(false);

    await expect(apiClient.get('/save-data')).rejects.toMatchObject({
      kind: 'offline',
      name: 'ApiError',
      message: 'Network error: could not connect to server',
    });
  });
});
