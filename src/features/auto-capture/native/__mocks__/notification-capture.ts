export const isAutoCaptureSupported = true;

export const notificationCapture = {
  isAccessGranted: jest.fn(async () => false),
  openAccessSettings: jest.fn(async () => {}),
  setEnabled: jest.fn(),
  isEnabled: jest.fn(async () => false),
  setAllowedPackages: jest.fn(async () => {}),
  getAllowedPackages: jest.fn(async () => [] as string[]),
  getLaunchableApps: jest.fn(async () => [] as { packageName: string; label: string }[]),
  getAppIcon: jest.fn(async () => null),
  setAuth: jest.fn(async () => {}),
  clearAuth: jest.fn(async () => {}),
  clearQueue: jest.fn(async () => {}),
  getQueueSize: jest.fn(async () => 0),
  flush: jest.fn(async () => {}),
};
