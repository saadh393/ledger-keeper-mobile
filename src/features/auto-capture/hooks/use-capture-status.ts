import { useQuery } from '@tanstack/react-query';
import { useOnAppActive } from '@/features/auto-capture/hooks/use-on-app-active';
import { notificationCapture } from '@/features/auto-capture/native/notification-capture';
import { getCaptureStatus } from '@/features/auto-capture/utils/get-capture-status';

export const captureStatusQueryKey = ['auto-capture', 'status'] as const;

async function fetchCaptureStatus() {
  const [enabled, accessGranted, packages] = await Promise.all([
    notificationCapture.isEnabled(),
    notificationCapture.isAccessGranted(),
    notificationCapture.getAllowedPackages(),
  ]);
  return { status: getCaptureStatus(enabled, accessGranted), accessGranted, packages };
}

export function useCaptureStatus() {
  const query = useQuery({ queryKey: captureStatusQueryKey, queryFn: fetchCaptureStatus, staleTime: 0 });
  useOnAppActive(() => void query.refetch());
  return query;
}
