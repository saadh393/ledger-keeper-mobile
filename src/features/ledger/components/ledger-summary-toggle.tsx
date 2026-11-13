import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { useLedgerPreferencesStore } from '@/features/ledger/store/use-ledger-preferences-store';

export function LedgerSummaryToggle() {
  const { t } = useTranslation();
  const showSummary = useLedgerPreferencesStore(state => state.showSummary);
  const setShowSummary = useLedgerPreferencesStore(state => state.setShowSummary);

  return (
    <Checkbox
      testID="ledger-summary-toggle"
      checked={showSummary}
      onChange={setShowSummary}
      label={t('ledger.summary.show')}
      accessibilityLabel={t('ledger.summary.show')}
      className="min-h-[48px] rounded-2xl px-3"
    />
  );
}
