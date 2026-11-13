import Purchases from 'react-native-purchases';

export async function logOutPurchasesUser(): Promise<void> {
  if (!(await Purchases.isConfigured()) || await Purchases.isAnonymous())
    return;
  await Purchases.logOut();
}
