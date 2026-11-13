import type { PurchasesPackage } from 'react-native-purchases';
import type { CreditPlan } from '@/features/credits/schemas/credit-plan-schema';

export type StorePack = {
  id: string;
  name: string;
  credits: number;
  price: string;
  storePackage: PurchasesPackage;
};

export function toStorePacks(packages: PurchasesPackage[], plans: CreditPlan[]): StorePack[] {
  return packages.flatMap((storePackage) => {
    const plan = plans.find(item => item.code === storePackage.product.identifier);
    if (!plan || plan.credits <= 0)
      return [];
    return [{ id: storePackage.identifier, name: plan.name, credits: plan.credits, price: storePackage.product.priceString, storePackage }];
  });
}
