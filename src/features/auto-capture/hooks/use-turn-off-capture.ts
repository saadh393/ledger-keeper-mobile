import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discardPending } from '@/features/auto-capture/api/discard-pending';
import { captureStatusQueryKey } from '@/features/auto-capture/hooks/use-capture-status';
import { notificationCapture } from '@/features/auto-capture/native/notification-capture';
import { detectedKeys } from '@/features/auto-capture/utils/detected-keys';

export function useTurnOffCapture(bookId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deletePending: boolean) => {
      notificationCapture.setEnabled(false);
      if (!deletePending)
        return;
      await notificationCapture.clearQueue();
      if (bookId)
        await discardPending(bookId);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: captureStatusQueryKey });
      if (bookId)
        void queryClient.invalidateQueries({ queryKey: detectedKeys.all(bookId) });
    },
  });
}
