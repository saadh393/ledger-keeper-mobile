import type { LaunchableApp } from '@/features/auto-capture/native/notification-capture';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { launchableAppsQueryKey } from '@/features/auto-capture/api/use-launchable-apps';
import { captureStatusQueryKey } from '@/features/auto-capture/hooks/use-capture-status';
import { notificationCapture } from '@/features/auto-capture/native/notification-capture';
import { keepInstalled } from '@/features/auto-capture/utils/keep-installed';

export function useSaveCaptureApps() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ selected, apps, enable }: { selected: string[]; apps: LaunchableApp[]; enable: boolean }) => {
      await notificationCapture.setAllowedPackages(keepInstalled(selected, apps));
      if (enable)
        notificationCapture.setEnabled(true);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: captureStatusQueryKey });
      void queryClient.invalidateQueries({ queryKey: launchableAppsQueryKey });
    },
  });
}
