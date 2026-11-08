import { toDayKey } from '@/lib/format/day-key';

describe('toDayKey', () => {
  it.each([
    ['2026-11-30T19:30:00Z', '2026-12-01'],
    ['2026-11-30T17:59:59Z', '2026-11-30'],
    ['2026-11-30T18:00:00Z', '2026-12-01'],
    ['2026-12-31T18:00:00Z', '2027-01-01'],
  ])('puts %s on the Dhaka day %s', (value, expected) => {
    expect(toDayKey(value)).toBe(expected);
  });

  it('accepts a Date', () => {
    expect(toDayKey(new Date('2026-11-30T19:30:00Z'))).toBe('2026-12-01');
  });
});
