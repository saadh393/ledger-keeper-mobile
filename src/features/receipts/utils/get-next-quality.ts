import { receiptQualitySteps } from '@/features/receipts/constants/receipt-image-options';

export function getNextQuality(quality: number): number | null {
  return receiptQualitySteps.find(step => step < quality) ?? null;
}
