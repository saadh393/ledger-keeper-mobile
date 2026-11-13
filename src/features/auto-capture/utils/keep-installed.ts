import type { LaunchableApp } from '@/features/auto-capture/native/notification-capture';

export function keepInstalled(selected: readonly string[], apps: LaunchableApp[]): string[] {
  const installed = new Set(apps.map(app => app.packageName));
  return selected.filter(name => installed.has(name));
}
