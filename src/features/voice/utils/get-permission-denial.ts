export function getPermissionDenial(permission: { granted: boolean; canAskAgain: boolean }): 'permission-denied' | 'permission-blocked' | null {
  if (permission.granted)
    return null;
  return permission.canAskAgain ? 'permission-denied' : 'permission-blocked';
}
