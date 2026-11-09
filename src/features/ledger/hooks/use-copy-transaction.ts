import type { TransactionRow } from '@/features/ledger/schemas/book-table-schema';
import type { Language } from '@/lib/i18n/resources';
import * as Clipboard from 'expo-clipboard';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import { formatCopyText } from '@/features/ledger/utils/format-copy-text';

export function useCopyTransaction(locale: Language, currency: string) {
  const { t } = useTranslation();

  return React.useCallback(async (row: TransactionRow) => {
    await Clipboard.setStringAsync(formatCopyText(row, locale, currency));
    showMessage({ message: t('ledger.actions.copied'), type: 'success', duration: 2000 });
  }, [locale, currency, t]);
}
