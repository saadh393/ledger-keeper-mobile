import * as React from 'react';
import { AppState } from 'react-native';
import { CaptureConsentScreen } from '@/features/auto-capture/components/capture-consent-screen';
import { notificationCapture } from '@/features/auto-capture/native/notification-capture';
import { act, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

const mockPush = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@/features/auto-capture/native/notification-capture');
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, navigate: mockNavigate }),
  useFocusEffect: jest.fn(),
}));

describe('captureConsentScreen', () => {
  let changeListener: (state: string) => void = () => {};

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
      changeListener = listener as (state: string) => void;
      return { remove: jest.fn() } as never;
    });
  });

  it('shows the disclosure before opening the system screen', async () => {
    render(<CaptureConsentScreen />);
    expect(screen.getByText('Add payments automatically')).toBeOnTheScreen();
    expect(notificationCapture.openAccessSettings).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('capture-consent-continue'));
    await waitFor(() => expect(notificationCapture.openAccessSettings).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('keeps auto-capture off on Not now', () => {
    render(<CaptureConsentScreen />);
    fireEvent.press(screen.getByTestId('capture-consent-not-now'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
    expect(notificationCapture.setEnabled).not.toHaveBeenCalled();
  });

  it('continues to choosing apps when access was granted on return', async () => {
    render(<CaptureConsentScreen />);
    fireEvent.press(screen.getByTestId('capture-consent-continue'));
    await waitFor(() => expect(notificationCapture.openAccessSettings).toHaveBeenCalled());
    jest.mocked(notificationCapture.isAccessGranted).mockResolvedValue(true);
    await act(async () => changeListener('active'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith({ pathname: '/auto-capture-apps', params: { flow: 'enable' } }));
  });

  it('says access is still off when it was not granted on return', async () => {
    jest.mocked(notificationCapture.isAccessGranted).mockResolvedValue(false);
    render(<CaptureConsentScreen />);
    fireEvent.press(screen.getByTestId('capture-consent-continue'));
    await waitFor(() => expect(notificationCapture.openAccessSettings).toHaveBeenCalled());
    await act(async () => changeListener('active'));
    expect(await screen.findByText('Notification access is still off')).toBeOnTheScreen();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('goes straight to choosing apps when access is already granted', async () => {
    jest.mocked(notificationCapture.isAccessGranted).mockResolvedValue(true);
    render(<CaptureConsentScreen />);
    fireEvent.press(screen.getByTestId('capture-consent-continue'));
    await waitFor(() => expect(mockPush).toHaveBeenCalled());
    expect(notificationCapture.openAccessSettings).not.toHaveBeenCalled();
  });
});
