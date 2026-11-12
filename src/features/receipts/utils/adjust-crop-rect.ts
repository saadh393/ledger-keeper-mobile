import type { CropDrag, CropRect, Size } from '@/features/receipts/types';
import { receiptMinCropSize } from '@/features/receipts/constants/receipt-image-options';
import { clamp } from '@/features/receipts/utils/clamp';

export function adjustCropRect(start: CropRect, { handle, dx, dy }: CropDrag, bounds: Size): CropRect {
  const minSize = receiptMinCropSize;
  if (handle === 'move') {
    return {
      ...start,
      x: clamp(start.x + dx, 0, bounds.width - start.width),
      y: clamp(start.y + dy, 0, bounds.height - start.height),
    };
  }
  const right = start.x + start.width;
  const bottom = start.y + start.height;
  const left = handle.endsWith('left') ? clamp(start.x + dx, 0, right - minSize) : start.x;
  const top = handle.startsWith('top') ? clamp(start.y + dy, 0, bottom - minSize) : start.y;
  const nextRight = handle.endsWith('right') ? clamp(right + dx, start.x + minSize, bounds.width) : right;
  const nextBottom = handle.startsWith('bottom') ? clamp(bottom + dy, start.y + minSize, bounds.height) : bottom;
  return { x: left, y: top, width: nextRight - left, height: nextBottom - top };
}
