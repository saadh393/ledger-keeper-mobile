import { useQuery } from '@tanstack/react-query';
import { notificationCapture } from '@/features/auto-capture/native/notification-capture';

export const launchableAppsQueryKey = ['auto-capture', 'apps'] as const;

export function useLaunchableApps() {
  return useQuery({
    queryKey: launchableAppsQueryKey,
    queryFn: async () => {
      const [apps, allowed] = await Promise.all([notificationCapture.getLaunchableApps(), notificationCapture.getAllowedPackages()]);
      return { apps, allowed };
    },
    staleTime: 0,
  });
}
