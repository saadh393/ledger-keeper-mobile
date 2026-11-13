import * as React from 'react';
import { registerSignOutHook, useIsSignedIn } from '@/features/auth';
import { notificationCapture } from '@/features/auto-capture/native/notification-capture';
import { useUserProfile } from '@/features/currency';
import { getApiBaseUrl } from '@/lib/api/client';
import { getToken } from '@/lib/auth/token-storage';

registerSignOutHook(() => notificationCapture.clearAuth());

export async function handOffCaptureAuth(bookId: string) {
  const token = await getToken();
  if (!token)
    return;
  await notificationCapture.setAuth(token, getApiBaseUrl(), bookId);
  await notificationCapture.flush();
}

export function useAutoCaptureSync() {
  const signedIn = useIsSignedIn();
  const bookId = useUserProfile().data?.defaultBookId;

  React.useEffect(() => {
    if (signedIn && bookId)
      handOffCaptureAuth(bookId).catch(() => {});
  }, [signedIn, bookId]);
}
