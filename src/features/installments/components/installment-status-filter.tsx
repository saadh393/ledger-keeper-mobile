import type { InstallmentStatusFilter as StatusFilter } from '@/features/installments/schemas/installment-schema';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Chip } from '@/components/ui/chip';

export type InstallmentStatusFilterProps = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

const statuses = ['active', 'completed', 'all'] as const;

export function InstallmentStatusFilter({ value, onChange }: InstallmentStatusFilterProps) {
  const { t } = useTranslation();

  return (
    <View testID="installments-status" accessibilityRole="tablist" className="flex-row gap-2 px-4 pt-3 pb-1">
      {statuses.map(status => (
        <Chip
          key={status}
          testID={`installments-status-${status}`}
          accessibilityRole="tab"
          label={t(`installments.status.${status}`)}
          selected={value === status}
          onPress={() => onChange(status)}
        />
      ))}
    </View>
  );
}
