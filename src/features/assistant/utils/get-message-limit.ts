export function getMessageLimit(length: number, max?: number) {
  if (!max)
    return { showCounter: false, isOverLimit: false };
  return { showCounter: length >= max * 0.9, isOverLimit: length > max };
}
