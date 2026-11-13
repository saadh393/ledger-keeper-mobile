import { waitForBalanceIncrease } from '@/features/credits/utils/wait-for-balance-increase';

describe('waitForBalanceIncrease', () => {
  const sleep = jest.fn(async () => {});

  beforeEach(() => sleep.mockClear());

  it('returns the new balance once it increases', async () => {
    const fetchBalance = jest.fn().mockResolvedValueOnce(50).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(550);
    await expect(waitForBalanceIncrease({ fetchBalance, before: 50, sleep })).resolves.toBe(550);
    expect(fetchBalance).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledWith(2000);
  });

  it('gives up after 30 seconds of polling every 2 seconds', async () => {
    const fetchBalance = jest.fn().mockResolvedValue(50);
    await expect(waitForBalanceIncrease({ fetchBalance, before: 50, sleep })).resolves.toBeNull();
    expect(fetchBalance).toHaveBeenCalledTimes(15);
  });
});
