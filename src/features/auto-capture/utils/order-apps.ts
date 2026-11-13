import type { LaunchableApp } from '@/features/auto-capture/native/notification-capture';

export type OrderedApps = {
  suggested: LaunchableApp[];
  others: LaunchableApp[];
};

export function orderApps(apps: LaunchableApp[], suggestedPackages: readonly string[], query = ''): OrderedApps {
  const search = query.trim().toLowerCase();
  const matching = apps.filter(app => app.label.toLowerCase().includes(search));
  const byLabel = (a: LaunchableApp, b: LaunchableApp) => a.label.localeCompare(b.label);
  const suggested = suggestedPackages.flatMap(name => matching.filter(app => app.packageName === name));
  const others = matching.filter(app => !suggestedPackages.includes(app.packageName)).sort(byLabel);
  return { suggested, others };
}
