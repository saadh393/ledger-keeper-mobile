import type { PurchasesPackage } from 'react-native-purchases';
import type { CreditPlan } from '@/features/credits/schemas/credit-plan-schema';
import { toStorePacks } from '@/features/credits/utils/to-store-packs';

function storePackage(identifier: string, productId: string, priceString: string) {
  return { identifier, product: { identifier: productId, priceString } } as unknown as PurchasesPackage;
}

function plan(code: string, credits: number, name = code): CreditPlan {
  return { id: code, code, name, description: null, credits, priceUsdCents: 100, sortOrder: 0 };
}

describe('toStorePacks', () => {
  it('keeps offering order and uses the store price', () => {
    const packs = toStorePacks(
      [storePackage('big', 'credits_1000', '৳1,100.00'), storePackage('small', 'credits_100', '৳120.00')],
      [plan('credits_100', 100, 'Starter'), plan('credits_1000', 1000, 'Pro')],
    );
    expect(packs.map(({ id, name, credits, price }) => ({ id, name, credits, price }))).toEqual([
      { id: 'big', name: 'Pro', credits: 1000, price: '৳1,100.00' },
      { id: 'small', name: 'Starter', credits: 100, price: '৳120.00' },
    ]);
  });

  it('drops packs whose credits cannot be determined', () => {
    const packs = toStorePacks(
      [storePackage('unknown', 'credits_x', '$1'), storePackage('zero', 'credits_0', '$1')],
      [plan('credits_0', 0)],
    );
    expect(packs).toEqual([]);
  });
});
