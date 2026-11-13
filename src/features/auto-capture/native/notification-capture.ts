import { requireOptionalNativeModule } from 'expo';

export type LaunchableApp = {
  packageName: string;
  label: string;
};

type NotificationCaptureModule = {
  isAccessGranted: () => Promise<boolean>;
  openAccessSettings: () => Promise<void>;
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => Promise<boolean>;
  setAllowedPackages: (packages: string[]) => Promise<void>;
  getAllowedPackages: () => Promise<string[]>;
  getLaunchableApps: () => Promise<LaunchableApp[]>;
  getAppIcon: (packageName: string) => Promise<string | null>;
  setAuth: (token: string, baseUrl: string, bookId: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  clearQueue: () => Promise<void>;
  getQueueSize: () => Promise<number>;
  flush: () => Promise<void>;
};

const native = requireOptionalNativeModule<NotificationCaptureModule>('NotificationCapture');

export const isAutoCaptureSupported = native !== null;

export const notificationCapture = {
  isAccessGranted: async () => (await native?.isAccessGranted()) ?? false,
  openAccessSettings: async () => native?.openAccessSettings(),
  setEnabled: (enabled: boolean) => native?.setEnabled(enabled),
  isEnabled: async () => (await native?.isEnabled()) ?? false,
  setAllowedPackages: async (packages: string[]) => native?.setAllowedPackages(packages),
  getAllowedPackages: async () => (await native?.getAllowedPackages()) ?? [],
  getLaunchableApps: async () => (await native?.getLaunchableApps()) ?? [],
  getAppIcon: async (packageName: string) => (await native?.getAppIcon(packageName)) ?? null,
  setAuth: async (token: string, baseUrl: string, bookId: string) => native?.setAuth(token, baseUrl, bookId),
  clearAuth: async () => native?.clearAuth(),
  clearQueue: async () => native?.clearQueue(),
  getQueueSize: async () => (await native?.getQueueSize()) ?? 0,
  flush: async () => native?.flush(),
};
