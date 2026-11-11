import * as React from 'react';
import { View } from 'react-native';
import { Chip } from '@/components/ui';

export type ClarificationChipsProps = {
  options: { label: string; value: string }[];
  onSubmit: (value: string) => void;
  disabled: boolean;
};

export function ClarificationChips({ options, onSubmit, disabled }: ClarificationChipsProps) {
  if (!options.length)
    return null;
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map(option => (
        <Chip
          key={option.value}
          testID={`clarification-option-${option.value}`}
          label={option.label}
          disabled={disabled}
          onPress={() => onSubmit(option.value)}
        />
      ))}
    </View>
  );
}
