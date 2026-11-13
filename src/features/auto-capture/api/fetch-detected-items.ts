import type { DetectedPage } from '@/features/auto-capture/schemas/detected-item-schema';
import { detectedPageSchema } from '@/features/auto-capture/schemas/detected-item-schema';
import { apiClient } from '@/lib/api';
import { parse } from '@/lib/api/errors';

export const DETECTED_PAGE_SIZE = 25;

export async function fetchDetectedItems(bookId: string, page: number, pageSize = DETECTED_PAGE_SIZE): Promise<DetectedPage> {
  const response = await apiClient.get(`/books/${bookId}/captures`, { params: { status: 'pending', page, pageSize } });
  return parse(detectedPageSchema, response.data);
}
