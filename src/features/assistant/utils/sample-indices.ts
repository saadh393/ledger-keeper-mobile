export function sampleIndices(count: number, max: number): Set<number> {
  if (count <= 0) {
    return new Set();
  }
  if (count <= max) {
    return new Set(Array.from({ length: count }, (_, index) => index));
  }
  const step = (count - 1) / (max - 1);
  return new Set(Array.from({ length: max }, (_, index) => Math.round(index * step)));
}
