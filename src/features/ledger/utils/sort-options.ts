import type { LedgerSort } from '@/features/ledger/utils/filter-rows';
import type { TxKeyPath } from '@/lib/i18n/utils';

export const sortOptions: { value: LedgerSort; labelKey: TxKeyPath }[] = [
  { value: 'newest', labelKey: 'ledger.sort.newest' },
  { value: 'oldest', labelKey: 'ledger.sort.oldest' },
  { value: 'highest', labelKey: 'ledger.sort.highest' },
  { value: 'lowest', labelKey: 'ledger.sort.lowest' },
];

export function getSortLabelKey(sort: LedgerSort) {
  return sortOptions.find(option => option.value === sort)!.labelKey;
}
