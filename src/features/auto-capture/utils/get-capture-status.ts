export type CaptureStatus = 'on' | 'off' | 'accessRemoved';

export function getCaptureStatus(enabled: boolean, accessGranted: boolean): CaptureStatus {
  if (!enabled)
    return 'off';
  return accessGranted ? 'on' : 'accessRemoved';
}
