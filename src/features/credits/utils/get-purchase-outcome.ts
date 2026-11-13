import { isPurchasesError, PURCHASES_ERROR_CODE } from 'react-native-purchases';

export type PurchaseOutcome = 'cancelled' | 'pending' | 'alreadyOwned' | 'billingUnavailable' | 'network' | 'notAllowed' | 'generic';

const outcomes: Partial<Record<PURCHASES_ERROR_CODE, PurchaseOutcome>> = {
  [PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR]: 'cancelled',
  [PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR]: 'pending',
  [PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR]: 'alreadyOwned',
  [PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR]: 'billingUnavailable',
  [PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR]: 'notAllowed',
  [PURCHASES_ERROR_CODE.NETWORK_ERROR]: 'network',
  [PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR]: 'network',
};

export function getPurchaseOutcome(error: unknown): PurchaseOutcome {
  if (!isPurchasesError(error))
    return 'generic';
  return outcomes[error.code] ?? 'generic';
}
