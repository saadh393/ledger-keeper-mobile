import type { ReceiptSource } from '@/features/receipts/types';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { receiptSourceMaxEdge, receiptSourceQuality } from '@/features/receipts/constants/receipt-image-options';
import { renderFittedImage } from '@/features/receipts/utils/render-fitted-image';

export async function renderReceiptSource(uri: string, rotation: number): Promise<ReceiptSource> {
  const image = await renderFittedImage(ImageManipulator.manipulate(uri).rotate(rotation), receiptSourceMaxEdge);
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: receiptSourceQuality });
  return { uri: result.uri, width: result.width, height: result.height };
}
