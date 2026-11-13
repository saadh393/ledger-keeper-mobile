import * as React from 'react';
import { CaptureAppsScreen } from '@/features/auto-capture/components/capture-apps-screen';
import { notificationCapture } from '@/features/auto-capture/native/notification-capture';
import { fireEvent, render, screen, waitFor } from '@/lib/test-utils';

const mockNavigate = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock('@/features/auto-capture/native/notification-capture');
jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
  useLocalSearchParams: () => mockParams,
  useFocusEffect: jest.fn(),
}));

const apps = [
  { packageName: 'com.whatsapp', label: 'WhatsApp' },
  { packageName: 'com.bKash.customerapp', label: 'bKash' },
];

describe('captureAppsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { flow: 'enable' };
    jest.mocked(notificationCapture.getLaunchableApps).mockResolvedValue(apps);
    jest.mocked(notificationCapture.getAllowedPackages).mockResolvedValue([]);
  });

  it('lists suggested apps first with nothing checked, and needs at least one app', async () => {
    render(<CaptureAppsScreen />);
    expect(await screen.findByText('Suggested')).toBeOnTheScreen();
    expect(screen.getByTestId('capture-apps-done')).toBeDisabled();
    expect(screen.getByText('Choose at least one app')).toBeOnTheScreen();
  });

  it('saves the allowlist and turns the feature on at the end of the consent flow', async () => {
    render(<CaptureAppsScreen />);
    fireEvent.press(await screen.findByTestId('capture-app-com.bKash.customerapp'));
    fireEvent.press(screen.getByTestId('capture-apps-done'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/auto-capture'));
    expect(notificationCapture.setAllowedPackages).toHaveBeenCalledWith(['com.bKash.customerapp']);
    expect(notificationCapture.setEnabled).toHaveBeenCalledWith(true);
  });

  it('keeps previously chosen installed apps checked and drops uninstalled ones on save', async () => {
    mockParams = {};
    jest.mocked(notificationCapture.getAllowedPackages).mockResolvedValue(['com.whatsapp', 'com.removed.app']);
    render(<CaptureAppsScreen />);
    await screen.findByTestId('capture-app-com.whatsapp');
    expect(screen.getByTestId('capture-apps-done')).toBeEnabled();
    fireEvent.press(screen.getByTestId('capture-apps-done'));
    await waitFor(() => expect(notificationCapture.setAllowedPackages).toHaveBeenCalledWith(['com.whatsapp']));
    expect(notificationCapture.setEnabled).not.toHaveBeenCalled();
  });
});
