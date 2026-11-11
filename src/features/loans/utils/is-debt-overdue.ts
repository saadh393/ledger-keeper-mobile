import type { Debt } from '@/features/loans/schemas/debt-schema';
import { toDayKey } from '@/lib/format/day-key';

export function isDebtOverdue(debt: Pick<Debt, 'status' | 'dueDateIso'>, today = toDayKey(new Date())): boolean {
  return debt.status === 'open' && Boolean(debt.dueDateIso) && toDayKey(debt.dueDateIso!) < today;
}
