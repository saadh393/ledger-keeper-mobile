import type { DebtStatusFilter } from '@/features/loans/schemas/debt-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Chip } from '@/components/ui/chip';

export type LoanStatusFilterProps = {
  value: DebtStatusFilter;
  onChange: (value: DebtStatusFilter) => void;
};

const statuses = ['open', 'settled', 'all'] as const;

export function LoanStatusFilter({ value, onChange }: LoanStatusFilterProps) {
  const { t } = useTranslation();

  return (
    <View testID="loans-status" accessibilityRole="tablist" className="flex-row gap-2 px-4 pt-3 pb-1">
      {statuses.map(status => (
        <Chip
          key={status}
          testID={`loans-status-${status}`}
          accessibilityRole="tab"
          label={t(`loans.status.${status}`)}
          selected={value === status}
          onPress={() => onChange(status)}
        />
      ))}
    </View>
  );
}
