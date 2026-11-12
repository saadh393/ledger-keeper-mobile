export type LevelBar = {
  id: number;
  level: number;
};

export function pushLevel(bars: LevelBar[], level: number, size: number): LevelBar[] {
  return [...bars, { id: (bars.at(-1)?.id ?? 0) + 1, level }].slice(-size);
}
