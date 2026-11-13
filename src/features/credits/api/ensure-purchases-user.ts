import Env from '@env';
import Purchases from 'react-native-purchases';
import { registerSignOutHook } from '@/features/auth';
import { logOutPurchasesUser } from '@/features/credits/api/log-out-purchases-user';

registerSignOutHook(logOutPurchasesUser);

export async function ensurePurchasesUser(userId: string): Promise<void> {
  const apiKey = Env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  if (!apiKey)
    throw new Error('RevenueCat is not configured');
  if (!(await Purchases.isConfigured())) {
    Purchases.configure({ apiKey, appUserID: userId });
    return;
  }
  if ((await Purchases.getAppUserID()) !== userId)
    await Purchases.logIn(userId);
}
