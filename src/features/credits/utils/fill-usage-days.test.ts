import { fillUsageDays } from '@/features/credits/utils/fill-usage-days';

describe('fillUsageDays', () => {
  const today = new Date('2026-11-13T08:00:00.000Z');

  it('returns one point per day ending today, oldest first', () => {
    const result = fillUsageDays([], today);
    expect(result).toHaveLength(30);
    expect(result[0].date).toBe('2026-10-15');
    expect(result[29].date).toBe('2026-11-13');
  });

  it('fills days without activity with zero', () => {
    const result = fillUsageDays([{ date: '2026-11-12T00:00:00.000Z', credits: 7 }], today, 3);
    expect(result).toEqual([
      { date: '2026-11-11', credits: 0 },
      { date: '2026-11-12', credits: 7 },
      { date: '2026-11-13', credits: 0 },
    ]);
  });

  it('ignores points outside the range', () => {
    const result = fillUsageDays([{ date: '2026-09-01T00:00:00.000Z', credits: 4 }], today, 2);
    expect(result.every(point => point.credits === 0)).toBe(true);
  });
});
