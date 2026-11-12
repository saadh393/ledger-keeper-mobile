import type { ReceiptSourceKind } from '@/features/receipts/types';
import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker';
import { receiptPickerOptions } from '@/features/receipts/constants/receipt-image-options';

export async function pickReceiptImage(kind: ReceiptSourceKind): Promise<string | null> {
  const result = kind === 'camera'
    ? await launchCameraAsync(receiptPickerOptions)
    : await launchImageLibraryAsync(receiptPickerOptions);
  return result.canceled ? null : result.assets[0].uri;
}
