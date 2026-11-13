import type { StorePack } from '@/features/credits/utils/to-store-packs';
import Purchases from 'react-native-purchases';
import { ensurePurchasesUser } from '@/features/credits/api/ensure-purchases-user';
import { fetchCreditPlans } from '@/features/credits/api/fetch-credit-plans';
import { toStorePacks } from '@/features/credits/utils/to-store-packs';

export async function fetchStorePacks(userId: string): Promise<StorePack[]> {
  await ensurePurchasesUser(userId);
  const [offerings, plans] = await Promise.all([Purchases.getOfferings(), fetchCreditPlans()]);
  const packs = toStorePacks(offerings.current?.availablePackages ?? [], plans);
  if (!packs.length)
    throw new Error('No credit packs available');
  return packs;
}
