import type { TFunction } from 'i18next';
import type { AmountErrorMessages } from '@/features/ledger/schemas/amount-schema';

export function getAmountErrorMessages(t: TFunction): AmountErrorMessages {
  return {
    amountRequired: t('ledger.errors.amountRequired'),
    amountInvalid: t('ledger.errors.amountInvalid'),
    amountPositive: t('ledger.errors.amountPositive'),
    amountTooLarge: t('ledger.errors.amountTooLarge'),
    amountDecimals: t('ledger.errors.amountDecimals'),
  };
}
