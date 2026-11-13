import { donutSegments } from '@/features/assistant/utils/donut-segments';
import { sampleIndices } from '@/features/assistant/utils/sample-indices';
import { sharePercent } from '@/features/assistant/utils/share-percent';

describe('sampleIndices', () => {
  it('keeps every index when there are few labels', () => {
    expect([...sampleIndices(1, 7)]).toEqual([0]);
    expect([...sampleIndices(5, 7)]).toEqual([0, 1, 2, 3, 4]);
  });

  it('samples 30 labels down to 7 including both ends', () => {
    const indices = [...sampleIndices(30, 7)];
    expect(indices).toHaveLength(7);
    expect(indices[0]).toBe(0);
    expect(indices.at(-1)).toBe(29);
  });

  it('returns nothing for no labels', () => {
    expect(sampleIndices(0, 7).size).toBe(0);
  });
});

describe('donutSegments', () => {
  it('splits the circumference by value', () => {
    expect(donutSegments([1, 3], 100)).toEqual([{ length: 25, offset: 0 }, { length: 75, offset: 25 }]);
  });

  it('fills the ring for one item and draws nothing for a zero total', () => {
    expect(donutSegments([5], 100)).toEqual([{ length: 100, offset: 0 }]);
    expect(donutSegments([0, 0], 100)).toEqual([]);
  });
});

describe('sharePercent', () => {
  it('rounds and clamps shares', () => {
    expect(sharePercent(1, 3)).toBe(33);
    expect(sharePercent(5, 4)).toBe(100);
    expect(sharePercent(-1, 4)).toBe(0);
    expect(sharePercent(1, 0)).toBe(0);
  });
});
