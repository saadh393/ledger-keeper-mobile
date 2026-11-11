import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Chip } from '@/components/ui';

export type DraftKindToggleProps = {
  value: 'income' | 'expense' | null;
  onChange: (kind: 'income' | 'expense') => void;
  disabled: boolean;
};

const kinds = ['expense', 'income'] as const;

export function DraftKindToggle({ value, onChange, disabled }: DraftKindToggleProps) {
  const { t } = useTranslation();

  return (
    <View accessibilityRole="radiogroup" className="mb-4 flex-row gap-2">
      {kinds.map(kind => (
        <Chip
          key={kind}
          testID={`draft-kind-${kind}`}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === kind, disabled }}
          label={t(`ledger.types.${kind}`)}
          selected={value === kind}
          disabled={disabled}
          onPress={() => onChange(kind)}
        />
      ))}
    </View>
  );
}
