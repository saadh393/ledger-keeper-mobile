import type { PurchaseOutcome } from '@/features/credits/utils/get-purchase-outcome';
import type { StorePack } from '@/features/credits/utils/to-store-packs';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import Purchases from 'react-native-purchases';
import { creditBalanceQueryKey } from '@/features/credits/api/credit-balance-query-key';
import { fetchCreditBalance } from '@/features/credits/api/fetch-credit-balance';
import { creditLedgerQueryKey } from '@/features/credits/api/use-credit-ledger';
import { getPurchaseOutcome } from '@/features/credits/utils/get-purchase-outcome';
import { waitForBalanceIncrease } from '@/features/credits/utils/wait-for-balance-increase';
import { formatNumber } from '@/lib/format/number';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type BuyCreditsNotice = {
  tone: 'info' | 'error';
  message: string;
};

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function fetchBalance() {
  return (await fetchCreditBalance()).balance;
}

export function useBuyCredits(onDone: () => void) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const busy = React.useRef(false);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<BuyCreditsNotice | null>(null);

  const showOutcome = (outcome: PurchaseOutcome) => {
    if (outcome === 'cancelled')
      return;
    if (outcome === 'pending') {
      setNotice({ tone: 'info', message: t('credits.purchase.pending') });
      return;
    }
    setNotice({ tone: 'error', message: t(`credits.purchase.errors.${outcome}`) });
  };

  const buy = async (pack: StorePack) => {
    if (busy.current)
      return;
    busy.current = true;
    setPendingId(pack.id);
    setNotice(null);
    try {
      const before = await fetchBalance();
      await Purchases.purchasePackage(pack.storePackage);
      const after = await waitForBalanceIncrease({ fetchBalance, before, sleep });
      void queryClient.invalidateQueries({ queryKey: creditBalanceQueryKey });
      void queryClient.invalidateQueries({ queryKey: creditLedgerQueryKey });
      if (after === null) {
        setNotice({ tone: 'info', message: t('credits.purchase.processing') });
        return;
      }
      const added = after - before;
      showMessage({ type: 'success', duration: 3000, message: t('credits.purchase.added', { count: added, credits: formatNumber(added, resolveLanguage(i18n.language)) }) });
      onDone();
    }
    catch (error) {
      showOutcome(getPurchaseOutcome(error));
    }
    finally {
      busy.current = false;
      setPendingId(null);
    }
  };

  return { buy, pendingId, notice };
}
