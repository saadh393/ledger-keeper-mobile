import { getCooldownSeconds } from '@/features/auth/utils/get-cooldown-seconds';

describe('getCooldownSeconds', () => {
  it('is zero before anything was sent', () => {
    expect(getCooldownSeconds(null, 1000)).toBe(0);
  });

  it('counts down 60 seconds after sending', () => {
    expect(getCooldownSeconds(0, 0)).toBe(60);
    expect(getCooldownSeconds(0, 500)).toBe(60);
    expect(getCooldownSeconds(0, 59_001)).toBe(1);
    expect(getCooldownSeconds(0, 60_000)).toBe(0);
    expect(getCooldownSeconds(0, 90_000)).toBe(0);
  });
});
