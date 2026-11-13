import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui';

export type LoanFormErrorProps = {
  message: string | null;
  testID: string;
};

export function LoanFormError({ message, testID }: LoanFormErrorProps) {
  if (!message)
    return null;
  return (
    <View testID={testID} accessibilityRole="alert" className="mb-4 rounded-xl bg-clay-100 p-3">
      <Text className="text-body text-clay-500">{message}</Text>
    </View>
  );
}
