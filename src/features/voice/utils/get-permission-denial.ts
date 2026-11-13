type Permission = { granted: boolean; canAskAgain: boolean };

export function getPermissionDenial(before: Permission, after: Permission): 'permission-denied' | 'permission-blocked' | null {
  if (after.granted)
    return null;
  return before.canAskAgain ? 'permission-denied' : 'permission-blocked';
}
