import type { ClarificationControl as ClarificationControlData } from '@/features/assistant/schemas/draft-artifact-schemas';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '@/components/ui';
import { ClarificationChips } from '@/features/assistant/components/artifacts/clarification-chips';
import { ClarificationInput } from '@/features/assistant/components/artifacts/clarification-input';
import { formatCurrency } from '@/lib/format/currency';
import { resolveLanguage } from '@/lib/i18n/resolve-language';

export type ClarificationControlProps = {
  control: ClarificationControlData;
  currency: string;
  onSubmit: (value: string) => void;
  disabled: boolean;
};

export function ClarificationControl({ control, currency, onSubmit, disabled }: ClarificationControlProps) {
  const { t, i18n } = useTranslation();
  const locale = resolveLanguage(i18n.language);

  if (control.type === 'amount') {
    return (
      <>
        <ClarificationInput placeholder={control.placeholder ?? t('assistant.clarification.amountPlaceholder')} keyboardType="decimal-pad" onSubmit={onSubmit} disabled={disabled} />
        <ClarificationChips
          options={control.suggestions.map(amount => ({ label: formatCurrency(amount, locale, currency), value: String(amount) }))}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      </>
    );
  }
  if (control.type === 'text') {
    return (
      <>
        <ClarificationInput placeholder={control.placeholder ?? t('assistant.clarification.textPlaceholder')} onSubmit={onSubmit} disabled={disabled} />
        <ClarificationChips options={control.suggestions} onSubmit={onSubmit} disabled={disabled} />
      </>
    );
  }
  if (control.type === 'toggle')
    return <ClarificationChips options={control.options} onSubmit={onSubmit} disabled={disabled} />;
  return (
    <Select
      testID="clarification-select"
      placeholder={control.placeholder ?? t('assistant.clarification.selectPlaceholder')}
      options={control.options}
      onSelect={value => onSubmit(String(value))}
      disabled={disabled}
    />
  );
}
