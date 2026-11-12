import type { CropRect, ImageCrop, Size } from '@/features/receipts/types';

export function toImageCrop(rect: CropRect, scale: number, image: Size): ImageCrop {
  const originX = Math.min(Math.round(rect.x / scale), image.width - 1);
  const originY = Math.min(Math.round(rect.y / scale), image.height - 1);
  return {
    originX,
    originY,
    width: Math.max(1, Math.min(Math.round(rect.width / scale), image.width - originX)),
    height: Math.max(1, Math.min(Math.round(rect.height / scale), image.height - originY)),
  };
}
