import type { ClarificationControl } from '@/features/assistant/schemas/draft-artifact-schemas';
import type { Language } from '@/lib/i18n/resources';
import { parseAmount } from '@/features/ledger/schemas/transaction-form-schema';
import { formatCurrency } from '@/lib/format/currency';

export function formatClarificationAnswer(control: ClarificationControl, value: string, { locale, currency }: { locale: Language; currency: string }) {
  if (control.type === 'amount')
    return parseAmount(value) > 0 ? formatCurrency(parseAmount(value), locale, currency) : value;
  const options = control.type === 'text' ? control.suggestions : control.options;
  return options.find(option => option.value === value)?.label ?? value;
}
