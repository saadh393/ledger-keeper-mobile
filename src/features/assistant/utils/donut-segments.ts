export type DonutSegment = {
  length: number;
  offset: number;
};

export function donutSegments(values: number[], circumference: number): DonutSegment[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return [];
  }
  let progress = 0;
  return values.map((value) => {
    const length = (value / total) * circumference;
    const segment = { length, offset: progress };
    progress += length;
    return segment;
  });
}
