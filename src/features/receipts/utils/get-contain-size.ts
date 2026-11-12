import type { Size } from '@/features/receipts/types';

export function getContainSize(size: Size, bounds: Size): Size {
  const scale = Math.min(bounds.width / size.width, bounds.height / size.height);
  return { width: size.width * scale, height: size.height * scale };
}
