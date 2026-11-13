import * as React from 'react';
import { View } from 'react-native';
import { LoanRowPlaceholder } from '@/features/loans/components/loan-row-placeholder';

const placeholderKeys = Array.from({ length: 6 }, (_, index) => `placeholder-${index}`);

export function InstallmentListLoading() {
  return (
    <View testID="installment-list-loading" aria-busy>
      {placeholderKeys.map(key => <LoanRowPlaceholder key={key} />)}
    </View>
  );
}
