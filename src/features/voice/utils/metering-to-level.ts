const silenceDb = -60;

export function meteringToLevel(db?: number): number {
  if (db === undefined)
    return 0;
  return Math.min(1, Math.max(0, (db - silenceDb) / -silenceDb));
}
