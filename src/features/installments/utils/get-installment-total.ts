import { MAX_INSTALLMENTS, parseCount } from '@/features/installments/schemas/installment-form-schema';
import { parseAmount } from '@/features/ledger/schemas/amount-schema';

export function getInstallmentTotal(amount: string, totalCount: string) {
  const value = parseAmount(amount);
  const count = parseCount(totalCount);
  if (!(value > 0) || !Number.isInteger(count) || count < 1 || count > MAX_INSTALLMENTS)
    return null;
  return { count, amount: value, total: Math.round(value * count * 100) / 100 };
}
