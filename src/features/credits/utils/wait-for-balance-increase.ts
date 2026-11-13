export type WaitForBalanceOptions = {
  fetchBalance: () => Promise<number>;
  before: number;
  sleep: (ms: number) => Promise<void>;
  intervalMs?: number;
  timeoutMs?: number;
};

export async function waitForBalanceIncrease({ fetchBalance, before, sleep, intervalMs = 2000, timeoutMs = 30000 }: WaitForBalanceOptions): Promise<number | null> {
  for (let elapsed = intervalMs; elapsed <= timeoutMs; elapsed += intervalMs) {
    await sleep(intervalMs);
    const balance = await fetchBalance().catch(() => before);
    if (balance > before)
      return balance;
  }
  return null;
}
