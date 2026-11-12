import type { ImageRef } from 'expo-image-manipulator';
import type { ReceiptImage } from '@/features/receipts/types';
import { File } from 'expo-file-system';
import { SaveFormat } from 'expo-image-manipulator';
import { getNextQuality } from '@/features/receipts/utils/get-next-quality';
import { deleteRecordingFile } from '@/features/voice/utils/delete-recording-file';

export async function saveReceiptJpeg(image: ImageRef, maxBytes: number, quality: number): Promise<ReceiptImage | null> {
  const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: quality });
  const sizeBytes = new File(result.uri).size;
  if (sizeBytes <= maxBytes)
    return { uri: result.uri, width: result.width, height: result.height, sizeBytes, mimeType: 'image/jpeg' };
  deleteRecordingFile(result.uri);
  const next = getNextQuality(quality);
  return next === null ? null : saveReceiptJpeg(image, maxBytes, next);
}
