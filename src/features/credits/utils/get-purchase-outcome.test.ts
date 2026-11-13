import { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { getPurchaseOutcome } from '@/features/credits/utils/get-purchase-outcome';

function purchasesError(code: PURCHASES_ERROR_CODE) {
  return { code, message: 'x', readableErrorCode: 'x', userInfo: { readableErrorCode: 'x' }, underlyingErrorMessage: '', userCancelled: null };
}

describe('getPurchaseOutcome', () => {
  it('maps store error codes', () => {
    expect(getPurchaseOutcome(purchasesError(PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR))).toBe('cancelled');
    expect(getPurchaseOutcome(purchasesError(PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR))).toBe('pending');
    expect(getPurchaseOutcome(purchasesError(PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR))).toBe('alreadyOwned');
    expect(getPurchaseOutcome(purchasesError(PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR))).toBe('billingUnavailable');
    expect(getPurchaseOutcome(purchasesError(PURCHASES_ERROR_CODE.NETWORK_ERROR))).toBe('network');
  });

  it('treats unknown errors as generic', () => {
    expect(getPurchaseOutcome(new Error('boom'))).toBe('generic');
    expect(getPurchaseOutcome(purchasesError(PURCHASES_ERROR_CODE.UNKNOWN_ERROR))).toBe('generic');
  });
});
