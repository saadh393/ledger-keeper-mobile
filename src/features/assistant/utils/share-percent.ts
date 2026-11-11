export function sharePercent(value: number, total: number) {
  if (!(total > 0) || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}
