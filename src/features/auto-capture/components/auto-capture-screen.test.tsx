import MockAdapter from 'axios-mock-adapter';
import * as React from 'react';
import { AppState } from 'react-native';
import { useAuthStore } from '@/features/auth';
import { AutoCaptureScreen } from '@/features/auto-capture/components/auto-capture-screen';
import { notificationCapture } from '@/features/auto-capture/native/notification-capture';
import { apiClient } from '@/lib/api/client';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

jest.mock('@/features/auto-capture/native/notification-capture');
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

const profile = { id: 'u1', name: 'A', email: 'a@b.c', image: null, role: 'user', locale: 'en', currency: 'BDT', currencyConfirmed: true, defaultBookId: 'book-1', createdAt: '2026-01-01T00:00:00.000Z' };

describe('autoCaptureScreen', () => {
  let mock: MockAdapter;
  let changeListener: (state: string) => void = () => {};

  beforeEach(() => {
    jest.clearAllMocks();
    mock = new MockAdapter(apiClient);
    mock.onGet('/users/me').reply(200, profile);
    mock.onGet('/books/book-1/captures').reply(200, { items: [], total: 3, page: 1, pageSize: 1 });
    jest.mocked(notificationCapture.isEnabled).mockResolvedValue(true);
    jest.mocked(notificationCapture.isAccessGranted).mockResolvedValue(true);
    jest.mocked(notificationCapture.getAllowedPackages).mockResolvedValue(['com.bKash.customerapp']);
    jest.mocked(notificationCapture.getLaunchableApps).mockResolvedValue([{ packageName: 'com.bKash.customerapp', label: 'bKash' }]);
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
      changeListener = listener as (state: string) => void;
      return { remove: jest.fn() } as never;
    });
    useAuthStore.setState({ status: 'signedIn' });
  });

  afterEach(() => {
    mock.restore();
    act(() => useAuthStore.setState({ status: 'idle' }));
  });

  it('shows On with chosen apps and the pending count', async () => {
    render(<AutoCaptureScreen />);
    expect(await screen.findByText('bKash')).toBeOnTheScreen();
    expect(screen.getByTestId('capture-status-label')).toHaveTextContent('On');
    expect(await screen.findByText('3 detected items waiting for review')).toBeOnTheScreen();
  });

  it('re-checks access when the app returns to the foreground', async () => {
    render(<AutoCaptureScreen />);
    await screen.findByText('bKash');
    jest.mocked(notificationCapture.isAccessGranted).mockResolvedValue(false);
    await act(async () => changeListener('active'));
    await waitFor(() => expect(screen.getByTestId('capture-status-label')).toHaveTextContent('Off — access was removed'));
  });

  it('turns off without deleting pending items', async () => {
    render(<AutoCaptureScreen />);
    fireEvent.press(await screen.findByTestId('auto-capture-turn-off'));
    fireEvent.press(await screen.findByTestId('capture-turn-off-confirm'));
    await waitFor(() => expect(notificationCapture.setEnabled).toHaveBeenCalledWith(false));
    expect(notificationCapture.clearQueue).not.toHaveBeenCalled();
    expect(mock.history.post).toHaveLength(0);
  });

  it('turns off first, then clears the queue and pending items when asked', async () => {
    mock.onPost('/books/book-1/captures/discard-pending').reply(204);
    const order: string[] = [];
    jest.mocked(notificationCapture.setEnabled).mockImplementation(() => void order.push('disable'));
    jest.mocked(notificationCapture.clearQueue).mockImplementation(async () => void order.push('clear'));
    render(<AutoCaptureScreen />);
    fireEvent.press(await screen.findByTestId('auto-capture-turn-off'));
    fireEvent.press(await screen.findByTestId('capture-turn-off-delete'));
    fireEvent.press(screen.getByTestId('capture-turn-off-confirm'));
    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(order).toEqual(['disable', 'clear']);
  });
});
