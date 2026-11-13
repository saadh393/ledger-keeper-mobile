import type { DetectedItem } from '@/features/auto-capture/schemas/detected-item-schema';

export function canConfirmDetected(item: DetectedItem): boolean {
  return item.kind !== null && item.amount !== null && item.amount > 0 && Boolean(item.title?.trim()) && Boolean(item.category) && item.dateIso !== null;
}
