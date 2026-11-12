import type { ImageCrop, ReceiptImage } from '@/features/receipts/types';
import { ImageManipulator } from 'expo-image-manipulator';
import { receiptMaxEdge, receiptQualitySteps } from '@/features/receipts/constants/receipt-image-options';
import { renderFittedImage } from '@/features/receipts/utils/render-fitted-image';
import { saveReceiptJpeg } from '@/features/receipts/utils/save-receipt-jpeg';

export async function compressReceiptImage(uri: string, crop: ImageCrop, maxBytes: number): Promise<ReceiptImage | null> {
  const image = await renderFittedImage(ImageManipulator.manipulate(uri).crop(crop), receiptMaxEdge);
  return saveReceiptJpeg(image, maxBytes, receiptQualitySteps[0]);
}
