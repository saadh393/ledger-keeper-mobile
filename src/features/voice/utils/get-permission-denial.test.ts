import { getPermissionDenial } from '@/features/voice/utils/get-permission-denial';

const askable = { granted: false, canAskAgain: true };
const blocked = { granted: false, canAskAgain: false };

describe('getPermissionDenial', () => {
  it('returns null when access is granted', () => {
    expect(getPermissionDenial(askable, { granted: true, canAskAgain: true })).toBeNull();
  });

  it('treats a denial in the system prompt as a plain denial', () => {
    expect(getPermissionDenial(askable, askable)).toBe('permission-denied');
    expect(getPermissionDenial(askable, blocked)).toBe('permission-denied');
  });

  it('reports blocked only when the system could not ask', () => {
    expect(getPermissionDenial(blocked, blocked)).toBe('permission-blocked');
  });
});
