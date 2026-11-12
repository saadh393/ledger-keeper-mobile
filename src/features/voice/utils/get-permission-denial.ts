import type { VoiceRecorderError } from '@/features/voice/utils/voice-recorder-reducer';

export function getPermissionDenial(permission: { granted: boolean; canAskAgain: boolean }): VoiceRecorderError | null {
  if (permission.granted)
    return null;
  return permission.canAskAgain ? 'permission-denied' : 'permission-blocked';
}
